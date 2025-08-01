from django.urls import path
from groups.views import (
    GroupView,
    JoinRequestView,
    GroupJoinRequestView,
    MembershipView,
    GroupMembershipView,
    InvitationView,
    GroupInvitationView,
)

urlpatterns = [
    path("group/", GroupView.as_view(), name="group-create-list"),
    path("group/<int:pk>/", GroupView.as_view(), name="group-update-delete-detail"),
    path("join-request/", JoinRequestView.as_view(), name="join-request-create-list"),
    path(
        "join-request/<int:pk>/",
        JoinRequestView.as_view(),
        name="join-request-update-delete-detail",
    ),
    path(
        "group-join-requests/<int:pk>/",
        GroupJoinRequestView.as_view(),
        name="group-join-requests",
    ),
    path("membership/", MembershipView.as_view(), name="membership-create-list"),
    path(
        "membership/<int:pk>/",
        MembershipView.as_view(),
        name="memberships-detail-delete-update",
    ),
    path(
        "group-memberships/<int:pk>/",
        GroupMembershipView.as_view(),
        name="group-memberships",
    ),
    path("invitation/", InvitationView.as_view(), name="invitatoin-create-list"),
    path(
        "invitation/<int:pk>/",
        InvitationView.as_view(),
        name="invitation-detail-update",
    ),
    path(
        "group-invitations/<int:pk>/",
        GroupInvitationView.as_view(),
        name="group-invitations",
    ),
]
