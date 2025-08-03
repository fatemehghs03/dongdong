from rest_framework import serializers
from django.db import transaction
from expenses.models import ExpenseShare, Expense
from django.shortcuts import get_object_or_404
from groups.models import Membership

from django.contrib.auth import get_user_model

User = get_user_model()


class ExpenseShareWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseShare
        fields = ["id", "user", "share_amount", "expense"]
        extra_kwargs = {"expense": {"read_only": True}, "id": {"read_only": True}}


class ExpenseWriteSerializer(serializers.ModelSerializer):
    shares = ExpenseShareWriteSerializer(many=True)

    class Meta:
        model = Expense
        fields = ["id", "name", "group", "description", "created_at", "shares"]
        extra_kwargs = {"id": {"read_only": True}, "created_at": {"read_only": True}}

    def create(self, validated_data):
        user = self.context["request"].user

        shares = validated_data.pop("shares", None)
        if shares is None or len(shares) == 0:
            raise serializers.ValidationError("share can not be empty!")

        expense = Expense.objects.create(paid_by=user, **validated_data)
        for share in shares:
            if "user" not in share or "share_amount" not in share:
                raise serializers.ValidationError("Each share must include 'user' and 'share_amount'.")
            get_object_or_404(Membership, user_id=share["user"], group=expense.group)
        for share in shares:
            ExpenseShare.objects.create(expense=expense, **share)
        return expense


class ExpenseReadSerializer(serializers.ModelSerializer):
    shares = ExpenseShareWriteSerializer(many=True)

    class Meta:
        model = Expense
        fields = ["id", "name", "group", "description", "created_at", "shares", "paid_by"]


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    shares = ExpenseShareWriteSerializer(many=True)

    class Meta:
        model = Expense
        fields = ["id", "name", "paid_by", "description", "created_at", "group", "shares"]
        extra_kwargs = {
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "group": {"read_only": True},
            "paid_by": {"read_only": True},
        }

    def update(self, expense, validated_data):
        shares = validated_data.pop("shares", None)

        with transaction.atomic():
            if shares is not None and len(shares) > 0:
                for share in shares:
                    if "user" not in share or "share_amount" not in share:
                        raise serializers.ValidationError("Each share must include 'user' and 'share_amount'.")
                    get_object_or_404(Membership, user_id=share["user"], group=expense.group)
                ExpenseShare.objects.filter(expense=expense).delete()
                for share in shares:
                    ExpenseShare.objects.create(expense=expense, **share)

            for attr, value in validated_data.items():
                setattr(expense, attr, value)
            expense.save()

        return expense


class SettlementSerializer(serializers.Serializer):
    from_user = serializers.IntegerField(source="from")
    to_user = serializers.IntegerField(source="to")
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
