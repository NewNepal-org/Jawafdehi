from django.db import migrations


def create_ngm_rate_tier_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")

    for group_name in ("NGM_SilverTier", "NGM_GoldTier", "NGM_PlatinumTier"):
        Group.objects.get_or_create(name=group_name)


def remove_ngm_rate_tier_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(
        name__in=["NGM_SilverTier", "NGM_GoldTier", "NGM_PlatinumTier"]
    ).delete()


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(
            create_ngm_rate_tier_groups,
            reverse_code=remove_ngm_rate_tier_groups,
        ),
    ]
