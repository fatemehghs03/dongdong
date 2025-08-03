from django.urls import path
from expenses.views import ExpenseView, GroupExpenseView, CalculateView

urlpatterns = [
    path("expense/", ExpenseView.as_view(), name="expense-create-list"),
    path("expense/<int:pk>/", ExpenseView.as_view(), name="expense-detail-update-delete"),
    path("group-expenses/<int:pk>/", GroupExpenseView.as_view(), name="group-expenses"),
    path("calculate/<int:pk>/", CalculateView.as_view(), name="calculate"),
]
