import pytest
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from ngm import api_views

QUERY_URL = "/api/ngm/query_judicial"
User = get_user_model()


def add_user_to_groups(user, *group_names):
    for group_name in group_names:
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_user(db):
    user = User.objects.create_user(username="ngm_user", password="testpass123")
    return user


@pytest.fixture
def authenticated_client(authenticated_user):
    user = authenticated_user
    token = Token.objects.create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.mark.django_db
def test_query_endpoint_requires_authentication(api_client):
    response = api_client.post(
        QUERY_URL,
        data={"query": "SELECT * FROM court_cases", "timeout": 5},
        format="json",
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_query_endpoint_rejects_invalid_query(authenticated_client):
    response = authenticated_client.post(
        QUERY_URL,
        data={"query": "DELETE FROM court_cases", "timeout": 5},
        format="json",
    )
    assert response.status_code == 400
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None
    assert payload["query_time_ms"] == 0
    assert "Only SELECT queries are allowed" in payload["error"]


@pytest.mark.django_db
def test_query_endpoint_serializer_errors_use_common_envelope(authenticated_client):
    response = authenticated_client.post(
        QUERY_URL,
        data={"query": "x" * 2049, "timeout": 5},
        format="json",
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["success"] is False
    assert payload["data"] is None
    assert payload["query_time_ms"] == 0
    assert "query" in payload["error"]


@pytest.mark.django_db
def test_query_endpoint_returns_503_when_ngm_not_configured(
    authenticated_client, monkeypatch
):
    def raise_not_configured(query, timeout_seconds):
        raise ValueError("NGM database is not configured")

    monkeypatch.setattr(api_views, "execute_select_query", raise_not_configured)

    response = authenticated_client.post(
        QUERY_URL,
        data={"query": "SELECT * FROM court_cases", "timeout": 5},
        format="json",
    )
    assert response.status_code == 503
    payload = response.json()
    assert payload["success"] is False
    assert "not configured" in payload["error"].lower()


@pytest.mark.django_db
def test_query_endpoint_returns_500_for_unexpected_execution_errors(
    authenticated_client, monkeypatch
):
    def raise_unexpected(query, timeout_seconds):
        raise RuntimeError("unexpected failure")

    monkeypatch.setattr(api_views, "execute_select_query", raise_unexpected)

    response = authenticated_client.post(
        QUERY_URL,
        data={"query": "SELECT * FROM court_cases", "timeout": 5},
        format="json",
    )

    assert response.status_code == 500
    payload = response.json()
    assert payload == {
        "success": False,
        "data": None,
        "error": "unexpected failure",
        "query_time_ms": 0,
    }


@pytest.mark.django_db
def test_query_endpoint_success_response_shape(authenticated_client, monkeypatch):
    def fake_execute(query, timeout_seconds):
        assert query == "SELECT case_number FROM court_cases"
        assert timeout_seconds == 10
        return {
            "columns": ["case_number"],
            "rows": [["081-CR-0098"]],
            "row_count": 1,
            "max_rows": 500,
            "query_time_ms": 12,
        }

    monkeypatch.setattr(api_views, "execute_select_query", fake_execute)

    response = authenticated_client.post(
        QUERY_URL,
        data={"query": "SELECT case_number FROM court_cases", "timeout": 10},
        format="json",
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["error"] is None
    assert payload["data"]["columns"] == ["case_number"]
    assert payload["data"]["rows"] == [["081-CR-0098"]]
    assert payload["data"]["row_count"] == 1
    assert payload["data"]["max_rows"] == 500
    assert payload["query_time_ms"] == 12


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("group_names", "expected_rate"),
    [
        ([], "60/hour"),
        (["NGM_SilverTier"], "60/hour"),
        (["NGM_GoldTier"], "200/hour"),
        (["NGM_PlatinumTier"], "500/hour"),
        (["Moderator"], "500/hour"),
        (["Admin"], "500/hour"),
        (["NGM_SilverTier", "NGM_GoldTier"], "200/hour"),
        (["NGM_SilverTier", "Admin"], "500/hour"),
    ],
)
def test_query_rate_uses_highest_priority_group(
    authenticated_user, group_names, expected_rate
):
    add_user_to_groups(authenticated_user, *group_names)

    throttle = api_views.NGMQueryRateThrottle()

    assert throttle.get_user_rate(authenticated_user) == expected_rate


@pytest.mark.django_db
def test_query_endpoint_rate_limited_per_token(authenticated_client, monkeypatch):
    monkeypatch.setattr(api_views.NGMQueryRateThrottle, "DEFAULT_RATE", "2/min")

    def fake_execute(query, timeout_seconds):
        return {
            "columns": ["case_number"],
            "rows": [["081-CR-0098"]],
            "row_count": 1,
            "max_rows": 500,
            "query_time_ms": 1,
        }

    monkeypatch.setattr(api_views, "execute_select_query", fake_execute)

    payload = {"query": "SELECT case_number FROM court_cases", "timeout": 5}

    first = authenticated_client.post(QUERY_URL, data=payload, format="json")
    second = authenticated_client.post(QUERY_URL, data=payload, format="json")
    third = authenticated_client.post(QUERY_URL, data=payload, format="json")

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
