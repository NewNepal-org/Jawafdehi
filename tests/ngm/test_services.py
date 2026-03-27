import pytest
from django.db.utils import DatabaseError

from ngm import services
from ngm.services import apply_row_cap, execute_select_query, validate_query


@pytest.mark.parametrize(
    "query",
    [
        "SELECT * FROM court_cases",
        "SELECT * FROM public.court_cases",
        "select case_number from court_case_entities",
        "SELECT c.identifier FROM courts c JOIN court_cases cc ON cc.court_identifier = c.identifier",
    ],
)
def test_validate_query_accepts_allowed_select_queries(query):
    is_valid, error = validate_query(query)
    assert is_valid is True
    assert error is None


@pytest.mark.parametrize(
    "query,error_contains",
    [
        ("UPDATE court_cases SET case_type = 'X'", "Only SELECT queries are allowed"),
        ("SELECT * FROM scraped_dates", "scraped_dates"),
        ("SELECT * FROM public.scraped_dates", "scraped_dates"),
        ("SELECT * FROM users", "Invalid table"),
        ("SELECT * FROM public.users", "Invalid table"),
        ("SELECT * FROM court_cases; DELETE FROM court_cases", "Forbidden keyword"),
    ],
)
def test_validate_query_rejects_unsafe_queries(query, error_contains):
    is_valid, error = validate_query(query)
    assert is_valid is False
    assert error_contains in error


def test_apply_row_cap_wraps_query_and_limits_rows():
    query = "SELECT * FROM court_cases ORDER BY registration_date_ad DESC"
    capped = apply_row_cap(query, max_rows=500)
    assert capped.startswith("SELECT * FROM (")
    assert "LIMIT 500" in capped
    assert "ORDER BY registration_date_ad DESC" in capped


def test_execute_select_query_hides_database_error_details(monkeypatch, caplog):
    class FakeCursor:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def execute(self, query, params=None):
            raise DatabaseError("sensitive database details")

    class FakeConnection:
        vendor = "postgresql"

        def cursor(self):
            return FakeCursor()

    monkeypatch.setitem(
        services.settings.DATABASES, "ngm", {"ENGINE": "django.db.backends.postgresql"}
    )
    monkeypatch.setattr(services, "connections", {"ngm": FakeConnection()})

    with pytest.raises(ValueError, match="Database query failed"):
        execute_select_query("SELECT * FROM court_cases", 5)

    assert "NGM database query failed" in caplog.text
    assert "sensitive database details" in caplog.text
