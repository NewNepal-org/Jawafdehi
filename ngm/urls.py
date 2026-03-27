from django.urls import path

from ngm.api_views import NGMJudicialQueryView

urlpatterns = [
    path(
        "ngm/query_judicial", NGMJudicialQueryView.as_view(), name="ngm-query-judicial"
    ),
]
