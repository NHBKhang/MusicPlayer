# Generated by Django 5.0.7 on 2024-09-07 17:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0026_remove_transaction_bank_code_purchase_purchase_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='transaction_id',
            field=models.CharField(max_length=50),
        ),
    ]
