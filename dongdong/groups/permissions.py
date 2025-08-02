from rest_framework.permissions import BasePermission
from groups.models import Membership, GroupJoinRequest


class IsGroupAdminOrOwnerWhitGroup(BasePermission):
    def has_permission(self, request, view):
        if request.method != "PATCH":
            return True
        group_id = view.kwargs.get("pk")
        if not group_id:
            return False

        return Membership.objects.filter(
            group_id=group_id, user=request.user, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER]
        ).exists()


class IsGroupAdminOrOwnerWhitRequest(BasePermission):
    def has_permission(self, request, view):
        pk = view.kwargs.get("pk")
        if not pk:
            return False
        join_request = GroupJoinRequest.objects.get(pk=pk)

        group = join_request.group
        admins = Membership.objects.filter(group=group, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER])

        return request.user.id in admins.values_list("user_id", flat=True)


class IsGroupAdminOrOwnerWhitMembership(BasePermission):
    def has_permission(self, request, view):
        pk = view.kwargs.get("pk")
        if not pk:
            return False
        membership = Membership.objects.get(pk=pk)

        group = membership.group
        admins = Membership.objects.filter(group=group, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER])

        return request.user.id in admins.values_list("user_id", flat=True)
