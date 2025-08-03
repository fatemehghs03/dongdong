from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from expenses.serializers import (
    ExpenseWriteSerializer,
    ExpenseReadSerializer,
    ExpenseUpdateSerializer,
    SettlementSerializer,
)
from groups.models import Membership, Group
from expenses.models import Expense, ExpenseShare
from expenses.helper import calculate_balances, settle_debts
from django.contrib.auth import get_user_model


User = get_user_model()


class ExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ExpenseWriteSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            member = Membership.objects.filter(group=serializer.validated_data["group"], user=request.user).exists()

            if not member:
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        if pk:
            expense = get_object_or_404(Expense, pk=pk)
            members = Membership.objects.filter(group=expense.group)
            if request.user.id not in members.values_list("user_id", flat=True) and expense.paid_by != request.user:
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            serializer = ExpenseReadSerializer(expense)
            return Response(serializer.data)
        else:
            expenses = Expense.objects.filter(paid_by=request.user)
            serializer = ExpenseReadSerializer(expenses, many=True)
            return Response(serializer.data)

    def delete(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, paid_by=request.user)
        expense.delete()
        return Response({"detail": pk}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, paid_by=request.user)
        serializer = ExpenseUpdateSerializer(expense, data=request.data, context={"request": request}, partial=True)
        if request.user != expense.paid_by:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        memberships = Membership.objects.filter(group=group)

        if request.user.id not in memberships.values_list("user_id", flat=True):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        expenses = Expense.objects.filter(group=group)
        serializer = ExpenseReadSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CalculateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        memberships = Membership.objects.filter(group_id=pk)
        if request.user.id not in memberships.values_list("user_id", flat=True):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        balances = calculate_balances(pk)
        settlements = settle_debts(balances)

        serializer = SettlementSerializer(settlements, many=True)
        return Response(serializer.data)
