from django.db import models
from django.conf import settings
from groups.models import Group


class Expense(models.Model):
    name = models.CharField(max_length=31)
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    description = models.CharField(max_length=511, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ExpenseShare(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name="shares")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    share_amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ("expense", "user")
