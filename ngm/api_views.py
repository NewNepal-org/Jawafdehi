from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from ngm.serializers import NGMQuerySerializer
from ngm.services import execute_select_query, validate_query


class NGMQueryRateThrottle(SimpleRateThrottle):
    scope = "ngm_token"
    rate = None
    TIER_LIMITS = {
        "Admin": "500/hour",
        "Moderator": "500/hour",
        "NGM_PlatinumTier": "500/hour",
        "NGM_GoldTier": "200/hour",
        "NGM_SilverTier": "60/hour",
    }
    DEFAULT_RATE = "60/hour"
    GROUP_PRIORITY = (
        "Admin",
        "Moderator",
        "NGM_PlatinumTier",
        "NGM_GoldTier",
        "NGM_SilverTier",
    )

    def get_rate(self):
        return self.DEFAULT_RATE

    def get_user_rate(self, user):
        if not user or not user.is_authenticated:
            return self.DEFAULT_RATE

        group_names = set(user.groups.values_list("name", flat=True))
        for group_name in self.GROUP_PRIORITY:
            if group_name in group_names:
                return self.TIER_LIMITS[group_name]

        return self.DEFAULT_RATE

    def allow_request(self, request, view):
        self.rate = self.get_user_rate(getattr(request, "user", None))
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        token = getattr(request, "auth", None)
        token_key = getattr(token, "key", None)
        if not token_key:
            return None

        return self.cache_format % {"scope": self.scope, "ident": token_key}


@extend_schema(
    summary="Run read-only query against NGM judicial database",
    description="""
    Executes validated SELECT queries against NGM judicial tables.

    Parameters:
    - query (string): SELECT query to execute
    - timeout (float, optional): Statement timeout in seconds (1-15, default: 15)

    Security controls:
    - Requires DRF token authentication
    - Rate limited per token based on NGM tier or staff role
    - Only SELECT queries are allowed
    - Only allowlisted judicial tables may be referenced
    - Server enforces statement timeout (max 15 seconds) and row cap
    """,
    request=NGMQuerySerializer,
)
class NGMJudicialQueryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = [NGMQueryRateThrottle]

    def post(self, request):
        serializer = NGMQuerySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "data": None,
                    "error": serializer.errors,
                    "query_time_ms": 0,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = serializer.validated_data["query"]
        timeout = serializer.validated_data["timeout"]

        is_valid, error_msg = validate_query(query)
        if not is_valid:
            return Response(
                {
                    "success": False,
                    "data": None,
                    "error": error_msg,
                    "query_time_ms": 0,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = execute_select_query(query, timeout)
        except Exception as exc:
            message = str(exc)
            status_code = (
                status.HTTP_503_SERVICE_UNAVAILABLE
                if "not configured" in message.lower()
                else status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            return Response(
                {
                    "success": False,
                    "data": None,
                    "error": message,
                    "query_time_ms": 0,
                },
                status=status_code,
            )

        return Response(
            {
                "success": True,
                "data": {
                    "columns": result["columns"],
                    "rows": result["rows"],
                    "row_count": result["row_count"],
                    "max_rows": result["max_rows"],
                },
                "error": None,
                "query_time_ms": result["query_time_ms"],
            },
            status=status.HTTP_200_OK,
        )
