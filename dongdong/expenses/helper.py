from collections import defaultdict
from decimal import Decimal

from expenses.models import Expense


def calculate_balances(pk):
    balances = defaultdict(Decimal)

    expenses = Expense.objects.filter(group_id=pk).prefetch_related("shares")

    for expense in expenses:
        total_paid_by = expense.paid_by_id
        total_amount = sum([share.share_amount for share in expense.shares.all()])

        for share in expense.shares.all():
            balances[share.user_id] -= share.share_amount
        balances[total_paid_by] += total_amount

    return balances


def settle_debts(balances):
    import heapq

    debtors = []
    creditors = []

    for user_id, balance in balances.items():
        if balance < 0:
            heapq.heappush(debtors, (balance, user_id))
        elif balance > 0:
            heapq.heappush(creditors, (-balance, user_id))

    settlements = []

    while debtors and creditors:
        debt_balance, debtor = heapq.heappop(debtors)
        credit_balance, creditor = heapq.heappop(creditors)

        payment = min(-debt_balance, -credit_balance)

        settlements.append({"from": debtor, "to": creditor, "amount": round(payment, 2)})

        debt_balance += payment
        credit_balance += payment

        if debt_balance < 0:
            heapq.heappush(debtors, (debt_balance, debtor))
        if credit_balance < 0:
            heapq.heappush(creditors, (credit_balance, creditor))

    return settlements
