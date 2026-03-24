import cases.models
from django.db import migrations, models


def backfill_legacy_uploaded_file(apps, schema_editor):
    DocumentSource = apps.get_model("cases", "DocumentSource")
    DocumentSourceUpload = apps.get_model("cases", "DocumentSourceUpload")

    for source in DocumentSource.objects.exclude(uploaded_file="").exclude(
        uploaded_file__isnull=True
    ):
        file_path = source.uploaded_file.name
        if not file_path:
            continue

        exists = DocumentSourceUpload.objects.filter(
            source_id=source.id,
            file=file_path,
        ).exists()
        if exists:
            continue

        filename = source.uploaded_filename or file_path.split("/")[-1]
        content_type = source.uploaded_content_type or ""

        DocumentSourceUpload.objects.create(
            source_id=source.id,
            file=file_path,
            filename=filename,
            content_type=content_type,
            file_size=source.uploaded_file_size,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("cases", "0012_deprecate_case_versioning"),
    ]

    operations = [
        # DocumentSource: new upload fields
        migrations.AddField(
            model_name="documentsource",
            name="uploaded_content_type",
            field=models.CharField(
                blank=True,
                help_text="MIME type of uploaded file (e.g., application/pdf)",
                max_length=100,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="documentsource",
            name="uploaded_file",
            field=models.FileField(
                blank=True,
                help_text="Uploaded file (if source is from file upload)",
                null=True,
                upload_to="jawafdehi/sources/%Y/%m/%d/",
                validators=[
                    cases.models.validate_upload_file_extension,
                    cases.models.validate_upload_file_size,
                    cases.models.validate_upload_file_mimetype,
                ],
            ),
        ),
        migrations.AddField(
            model_name="documentsource",
            name="uploaded_file_size",
            field=models.PositiveIntegerField(
                blank=True, help_text="File size in bytes", null=True
            ),
        ),
        migrations.AddField(
            model_name="documentsource",
            name="uploaded_filename",
            field=models.CharField(
                blank=True,
                help_text="Original filename for uploaded file",
                max_length=255,
                null=True,
            ),
        ),
        # Case: field alterations
        migrations.AlterField(
            model_name="case",
            name="case_id",
            field=models.CharField(
                db_index=True,
                help_text="Stable unique identifier for this case",
                max_length=100,
                unique=True,
            ),
        ),
        migrations.AlterField(
            model_name="case",
            name="notes",
            field=models.TextField(
                blank=True,
                default="",
                help_text="Internal notes about the case (markdown supported)",
            ),
        ),
        migrations.AlterField(
            model_name="documentsource",
            name="source_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("LEGAL_COURT_ORDER", "Legal: Court Order/Verdict"),
                    ("LEGAL_PROCEDURAL", "Legal: Procedural/Law Enforcement"),
                    ("OFFICIAL_GOVERNMENT", "Official (Government)"),
                    ("FINANCIAL_FORENSIC", "Financial/Forensic Record"),
                    ("INTERNAL_CORPORATE", "Internal Corporate Doc"),
                    ("MEDIA_NEWS", "Media/News"),
                    ("INVESTIGATIVE_REPORT", "Investigative Report"),
                    ("PUBLIC_COMPLAINT", "Public Complaint/Whistleblower"),
                    ("LEGISLATIVE_DOC", "Legislative/Policy Doc"),
                    ("SOCIAL_MEDIA", "Social Media"),
                    ("OTHER_VISUAL", "Other / Visual Assets"),
                ],
                help_text="Type of source",
                max_length=50,
                null=True,
            ),
        ),
        # DocumentSourceUpload model
        migrations.CreateModel(
            name="DocumentSourceUpload",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "file",
                    models.FileField(
                        help_text="Uploaded file",
                        upload_to="jawafdehi/sources/%Y/%m/%d/",
                        validators=[
                            cases.models.validate_upload_file_extension,
                            cases.models.validate_upload_file_size,
                            cases.models.validate_upload_file_mimetype,
                        ],
                    ),
                ),
                (
                    "filename",
                    models.CharField(
                        blank=True,
                        help_text="Original filename (auto-populated)",
                        max_length=255,
                    ),
                ),
                (
                    "content_type",
                    models.CharField(
                        blank=True,
                        help_text="MIME type (auto-populated best-effort)",
                        max_length=100,
                    ),
                ),
                (
                    "file_size",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="File size in bytes (auto-populated)",
                        null=True,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "source",
                    models.ForeignKey(
                        help_text="Document source this uploaded file belongs to",
                        on_delete=models.deletion.CASCADE,
                        related_name="uploaded_files",
                        to="cases.documentsource",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        # Backfill: migrate any legacy uploaded_file rows into DocumentSourceUpload
        migrations.RunPython(
            backfill_legacy_uploaded_file,
            migrations.RunPython.noop,
        ),
    ]
