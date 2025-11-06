from django.urls import path
from users.views import RegisterView, LoginView, RefreshTokenView, LogoutView, UserSearchView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="user-register"),
    path("login/", LoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    path("refresh-token/", RefreshTokenView.as_view(), name="refresh-token"),
    path("search/", UserSearchView.as_view(), name="user-search"),
]
