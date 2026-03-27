import logging
import re
import time

from django.conf import settings
from django.db import connections
from django.db.utils import DatabaseError

logger = logging.getLogger(__name__)

ALLOWED_TABLES = {
    "courts",
    "court_cases",
    "court_case_hearings",
    "court_case_entities",
}

FORBIDDEN_KEYWORDS = [
    "insert",
    "update",
    "delete",
    "drop",
    "create",
    "alter",
    "truncate",
    "grant",
    "revoke",
]


def validate_query(query: str) -> tuple[bool, str | None]:
    """Validate user SQL against read-only and allowlist constraints."""
    normalized = query.strip().lower().rstrip(";")

    if not normalized:
        return False, "Query cannot be empty"

    if not normalized.startswith("select"):
        return False, "Only SELECT queries are allowed"

    for keyword in FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{keyword}\b", normalized):
            return False, f"Forbidden keyword detected: {keyword.upper()}"

    table_pattern = r"\b(?:from|join)\s+([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)?)"
    referenced_tables = {
        table_name.split(".")[-1]
        for table_name in re.findall(table_pattern, normalized)
    }

    if "scraped_dates" in referenced_tables:
        return False, "Access to 'scraped_dates' table is not allowed"

    invalid_tables = referenced_tables - ALLOWED_TABLES
    if invalid_tables:
        return (
            False,
            f"Invalid table(s): {', '.join(sorted(invalid_tables))}. "
            f"Allowed tables: {', '.join(sorted(ALLOWED_TABLES))}",
        )

    return True, None


def apply_row_cap(query: str, max_rows: int) -> str:
    """Apply a hard row cap by wrapping the query as a subquery."""
    cleaned = query.strip().rstrip(";")
    return f"SELECT * FROM ({cleaned}) AS ngm_result LIMIT {int(max_rows)}"


def ensure_ngm_database_configured() -> None:
    database_config = settings.DATABASES.get("ngm")
    if not database_config:
        raise ValueError("NGM database is not configured")


def execute_select_query(query: str, timeout_seconds: float) -> dict:
    """Execute a validated query against the NGM database alias."""
    ensure_ngm_database_configured()

    timeout_ms = int(timeout_seconds * 1000)
    max_rows = int(getattr(settings, "NGM_QUERY_MAX_ROWS", 500))
    capped_query = apply_row_cap(query, max_rows)

    start_time = time.perf_counter()
    try:
        with connections["ngm"].cursor() as cursor:
            if connections["ngm"].vendor == "postgresql":
                cursor.execute("SET statement_timeout = %s", [timeout_ms])
            cursor.execute(capped_query)
            rows = cursor.fetchall()
            columns = [col[0] for col in (cursor.description or [])]
    except DatabaseError as exc:
        logger.exception("NGM database query failed")
        raise ValueError("Database query failed") from exc

    query_time_ms = int((time.perf_counter() - start_time) * 1000)
    row_data = [list(row) for row in rows]

    return {
        "columns": columns,
        "rows": row_data,
        "row_count": len(row_data),
        "max_rows": max_rows,
        "query_time_ms": query_time_ms,
    }
