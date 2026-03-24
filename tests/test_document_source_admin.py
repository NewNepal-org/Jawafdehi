"""
Integration tests for DocumentSource Django Admin.

Tests the admin interface configuration including:
- Custom form with entity ID validation
- Soft deletion interface
- Role-based permissions
"""

import pytest

from django.contrib import admin

from cases.admin import DocumentSourceAdmin, DocumentSourceAdminForm
from cases.models import DocumentSource, CaseType
from tests.conftest import (
    create_document_source_with_entities,
    create_case_with_entities,
    create_user_with_role,
    create_mock_request,
)


@pytest.fixture
def admin_user(db):
    """Create an admin user."""
    return create_user_with_role("testadmin", "admin@test.com", "Admin")


@pytest.fixture
def moderator_user(db):
    """Create a moderator user."""
    return create_user_with_role("testmod", "mod@test.com", "Moderator")


@pytest.fixture
def contributor_user(db):
    """Create a contributor user."""
    return create_user_with_role("testcontrib", "contrib@test.com", "Contributor")


@pytest.fixture
def document_source(db):
    """Create a test document source."""
    source = create_document_source_with_entities(
        title="Test Source", description="Test description", related_entity_ids=[]
    )
    source.save()
    return source


@pytest.fixture
def case_with_contributor(db, contributor_user):
    """Create a case with an assigned contributor."""
    case = create_case_with_entities(
        title="Test Case",
        alleged_entities=["entity:person/test"],
        case_type=CaseType.CORRUPTION,
    )
    case.contributors.add(contributor_user)
    return case


@pytest.fixture
def source_with_contributor(db, contributor_user):
    """Create a document source with an assigned contributor."""
    source = create_document_source_with_entities(
        title="Test Source", description="Test description", related_entity_ids=[]
    )
    source.save()
    source.contributors.add(contributor_user)
    return source


class TestDocumentSourceAdmin:
    """Test DocumentSource admin configuration."""

    def test_admin_is_registered(self, db):
        """Test that DocumentSource is registered in admin."""
        assert admin.site.is_registered(DocumentSource)

    def test_custom_form_is_used(self, db):
        """Test that custom form is configured."""
        admin_instance = admin.site._registry[DocumentSource]
        assert admin_instance.form.__name__ == "DocumentSourceAdminForm"

    def test_fieldsets_configured(self, db):
        """Test that fieldsets are properly configured."""
        admin_instance = admin.site._registry[DocumentSource]
        assert len(admin_instance.fieldsets) == 3

        # Check fieldset names
        fieldset_names = [fs[0] for fs in admin_instance.fieldsets]
        assert "Basic Information" in fieldset_names
        assert "External URLs" in fieldset_names
        assert "Metadata" in fieldset_names

    def test_fieldsets_hide_legacy_upload_metadata_inputs(self, db):
        """Legacy upload metadata fields should not be directly editable in admin form."""
        admin_instance = admin.site._registry[DocumentSource]
        basic_fieldset_fields = admin_instance.fieldsets[0][1]["fields"]

        assert "uploaded_filename" not in basic_fieldset_fields
        assert "uploaded_content_type" not in basic_fieldset_fields
        assert "uploaded_file_size" not in basic_fieldset_fields

    def test_upload_inline_is_configured(self, db):
        """DocumentSource admin should expose inline uploads for multi-file support."""
        admin_instance = admin.site._registry[DocumentSource]
        inline_models = [inline.model.__name__ for inline in admin_instance.inlines]
        assert "DocumentSourceUpload" in inline_models

    def test_list_display_configured(self, db):
        """Test that list display is properly configured."""
        admin_instance = admin.site._registry[DocumentSource]
        expected_fields = [
            "source_id",
            "title",
            "source_type",
            "deletion_status",
            "created_at",
        ]
        assert admin_instance.list_display == expected_fields

    def test_soft_delete_action_exists(self, db):
        """Test that soft delete action is available."""
        admin_instance = admin.site._registry[DocumentSource]
        assert hasattr(admin_instance, "soft_delete_sources")

    def test_restore_action_exists(self, db):
        """Test that restore action is available."""
        admin_instance = admin.site._registry[DocumentSource]
        assert hasattr(admin_instance, "restore_sources")

    def test_hard_delete_disabled(self, db, admin_user, document_source):
        """Test that hard deletion is disabled."""
        admin_instance = admin.site._registry[DocumentSource]
        request = create_mock_request(admin_user)

        # Hard delete should be disabled for everyone
        assert not admin_instance.has_delete_permission(request, document_source)

    def test_admin_can_change_source(self, db, admin_user, document_source):
        """Test that admin can change sources."""
        admin_instance = admin.site._registry[DocumentSource]
        request = create_mock_request(admin_user)

        assert admin_instance.has_change_permission(request, document_source)

    def test_moderator_can_change_source(self, db, moderator_user, document_source):
        """Test that moderator can change sources."""
        admin_instance = admin.site._registry[DocumentSource]
        request = create_mock_request(moderator_user)

        assert admin_instance.has_change_permission(request, document_source)

    def test_contributor_can_change_assigned_source(
        self, db, contributor_user, source_with_contributor
    ):
        """Test that contributor can change sources they're assigned to."""
        admin_instance = admin.site._registry[DocumentSource]
        request = create_mock_request(contributor_user)

        assert admin_instance.has_change_permission(request, source_with_contributor)

    def test_contributor_cannot_change_unassigned_source(
        self, db, contributor_user, document_source
    ):
        """Test that contributor cannot change sources they're not assigned to."""
        admin_instance = admin.site._registry[DocumentSource]
        request = create_mock_request(contributor_user)

        assert not admin_instance.has_change_permission(request, document_source)

    def test_contributor_sees_only_assigned_sources(
        self, db, contributor_user, source_with_contributor, document_source
    ):
        """Test that contributor only sees sources they're assigned to."""
        admin_instance = admin.site._registry[DocumentSource]
        request = create_mock_request(contributor_user)

        queryset = admin_instance.get_queryset(request)

        assert source_with_contributor in queryset
        assert document_source not in queryset

    def test_soft_deletion_preserves_record(self, db, document_source):
        """Test that soft deletion preserves the record in database."""
        source_id = document_source.id

        # Soft delete
        document_source.is_deleted = True
        document_source.save()

        # Should still exist in database
        assert DocumentSource.objects.filter(id=source_id).exists()

        # Verify is_deleted flag
        document_source.refresh_from_db()
        assert document_source.is_deleted is True

    def test_deletion_status_badge_for_active(self, db, document_source):
        """Test deletion status badge for active sources."""
        admin_instance = admin.site._registry[DocumentSource]
        badge_html = admin_instance.deletion_status(document_source)

        assert "Active" in badge_html
        assert "#28a745" in badge_html  # Green color

    def test_deletion_status_badge_for_deleted(self, db, document_source):
        """Test deletion status badge for deleted sources."""
        document_source.is_deleted = True
        document_source.save()

        admin_instance = admin.site._registry[DocumentSource]
        badge_html = admin_instance.deletion_status(document_source)

        assert "Deleted" in badge_html
        assert "#dc3545" in badge_html  # Red color


class TestDocumentSourcePermissions:
    """Test DocumentSource admin permissions and access control."""

    def test_creator_auto_assigned_as_contributor(self, db, contributor_user):
        """Test that creator is automatically assigned as contributor when creating a source."""

        admin_instance = DocumentSourceAdmin(DocumentSource, admin.site)
        request = create_mock_request(contributor_user, method="post")

        # Create a new source
        source = create_document_source_with_entities(
            title="New Source", description="Test description", related_entity_ids=[]
        )

        # Simulate save_model and save_related (full admin save flow)
        admin_instance.save_model(request, source, None, change=False)

        # Simulate save_related (which adds creator to contributors)
        class DummyForm:
            instance = source

            def save_m2m(self):
                pass

        admin_instance.save_related(request, DummyForm(), [], change=False)

        # Verify creator is in contributors
        assert (
            contributor_user in source.contributors.all()
        ), "Creator should be automatically assigned as contributor"


class TestDocumentSourceAdminForm:
    """Test DocumentSource admin form validation."""

    def test_form_validates_empty_title(self, db):
        """Test that form rejects empty title."""

        form = DocumentSourceAdminForm(
            data={
                "title": "",
                "description": "Valid description",
                "related_entity_ids": "[]",
            }
        )

        assert not form.is_valid()
        assert "title" in form.errors

    def test_form_accepts_empty_description(self, db, document_source):
        """Test that form accepts empty description."""

        # Use an existing instance to avoid source_id validation
        form = DocumentSourceAdminForm(
            instance=document_source,
            data={
                "source_id": document_source.source_id,
                "title": "Valid Title",
                "description": "",
                "related_entity_ids": "[]",
                "is_deleted": False,
            },
        )

        assert form.is_valid(), f"Form errors: {form.errors}"

    def test_form_accepts_valid_data(self, db, document_source):
        """Test that form accepts valid data."""

        # Use an existing instance to avoid source_id validation
        form = DocumentSourceAdminForm(
            instance=document_source,
            data={
                "source_id": document_source.source_id,
                "title": "Valid Title",
                "description": "Valid description",
                "related_entity_ids": "[]",
                "is_deleted": False,
            },
        )

        assert form.is_valid(), f"Form errors: {form.errors}"
