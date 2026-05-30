from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0002_contact_item_contact"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="item",
            name="contact",
        ),
        migrations.AddField(
            model_name="item",
            name="external_contact_id",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="item",
            name="external_contact_snapshot",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.DeleteModel(
            name="Contact",
        ),
    ]
