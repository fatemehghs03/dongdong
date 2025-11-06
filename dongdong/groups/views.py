from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404


from groups.serializers import (
    GroupReadSerializer,
    GroupWriteSerializer,
    JoinRequestReadSerializer,
    JoinRequestWriteSerializer,
    JoinRequestUpdateSerializer,
    MembershipWriteSerializer,
    MembershipReadSerializer,
    MembershipUpdateSerializer,
    InvitationReadSerializer,
    InvitationWriteSerializer,
    InvitationUpdateSerializer,
    InvitationByPhoneSerializer,
    InvitationListSerializer,
)
from groups.models import Group, GroupJoinRequest, Membership, GroupInvitation
from users.models import User
from groups.permissions import (
    IsGroupAdminOrOwnerWhitGroup,
    IsGroupAdminOrOwnerWhitRequest,
    IsGroupAdminOrOwnerWhitMembership,
)


class GroupView(APIView):
    def get_permissions(self):
        if self.request.method == "PATCH":
            permission_classes = [IsGroupAdminOrOwnerWhitGroup, permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def post(self, request):
        serializer = GroupWriteSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = get_object_or_404(Group, pk=pk, owner=request.user)
        group.delete()
        return Response({"detail": pk}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        group = get_object_or_404(Group, pk=pk)

        serializer = GroupWriteSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        if pk is None:
            memberships = Membership.objects.filter(user=request.user)
            groups = [membership.group for membership in memberships]
            serializer = GroupReadSerializer(groups, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            membership = get_object_or_404(Membership, group_id=pk, user=request.user)
            group = membership.group
            serializer = GroupReadSerializer(group)
            return Response(serializer.data, status=status.HTTP_200_OK)


class JoinRequestView(APIView):
    def get_permissions(self):
        if self.request.method == "PATCH":
            permission_classes = [IsGroupAdminOrOwnerWhitRequest, permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def post(self, request):
        serializer = JoinRequestWriteSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            group = get_object_or_404(Group, id=serializer.validated_data["group"].id)
            membership = Membership.objects.filter(group=group, user=request.user).exists()
            if membership:
                return Response(
                    {"detail": "you are already in this group!"},
                    status=status.HTTP_201_CREATED,
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        if pk:
            join_request = get_object_or_404(GroupJoinRequest, pk=pk)
            group = join_request.group
            admins = Membership.objects.filter(group=group, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER])

            if request.user.id not in admins.values_list("user_id", flat=True) and join_request.user != request.user:
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

            serializer = JoinRequestReadSerializer(join_request)
            return Response(serializer.data)
        else:
            join_requests = GroupJoinRequest.objects.filter(user=request.user)
            serializer = JoinRequestReadSerializer(join_requests, many=True)
            return Response(serializer.data)

    def patch(self, request, pk):
        join_request = get_object_or_404(GroupJoinRequest, pk=pk)

        serializer = JoinRequestUpdateSerializer(
            join_request, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupJoinRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsGroupAdminOrOwnerWhitGroup]

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)

        requests = GroupJoinRequest.objects.filter(group=group)
        serializer = JoinRequestReadSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MembershipView(APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            permission_classes = [IsGroupAdminOrOwnerWhitMembership, permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def post(self, request):
        serializer = MembershipWriteSerializer(data=request.data)

        if serializer.is_valid():
            admins = Membership.objects.filter(
                group=serializer.validated_data["group"],
                role__in=[Membership.Role.ADMIN, Membership.Role.OWNER],
            )
            if request.user.id not in admins.values_list("user_id", flat=True):
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        if pk:
            membership = get_object_or_404(Membership, pk=pk)
            group = membership.group
            members = Membership.objects.filter(group=group)
            if request.user.id not in members.values_list("user_id", flat=True) and request.user != membership.user:
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

            serializer = MembershipReadSerializer(membership)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            memberships = Membership.objects.filter(user=request.user)
            serializer = MembershipReadSerializer(memberships, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        membership = get_object_or_404(Membership, pk=pk)
        membership.delete()
        return Response({"detail": pk}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        membership = get_object_or_404(Membership, pk=pk)

        serializer = MembershipUpdateSerializer(
            membership, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupMembershipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        is_member = get_object_or_404(Membership, group_id=pk, user=request.user)

        members = Membership.objects.filter(group_id=pk)
        serializer = MembershipReadSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InvitationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InvitationWriteSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            if request.user == serializer.validated_data["invited_user"]:
                return Response(
                    {"detail": "the user is already in this group!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            admins = Membership.objects.filter(
                group=serializer.validated_data["group"],
                role__in=[Membership.Role.ADMIN, Membership.Role.OWNER],
            )
            if request.user.id not in admins.values_list("user_id", flat=True):
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        if pk:
            invitation = get_object_or_404(GroupInvitation, pk=pk)
            group = invitation.group
            admins = Membership.objects.filter(group=group, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER])
            if (
                request.user.id not in admins.values_list("user_id", flat=True)
                and request.user != invitation.invited_user
            ):
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

            serializer = InvitationReadSerializer(invitation)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            invitations = GroupInvitation.objects.filter(invited_user=request.user)
            serializer = InvitationReadSerializer(invitations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        invitation = get_object_or_404(GroupInvitation, pk=pk)

        group = invitation.group
        admins = Membership.objects.filter(group=group, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER])

        if request.user.id not in admins.values_list("user_id", flat=True) and request.user != invitation.invited_user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = InvitationUpdateSerializer(
            invitation, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            if invitation.status == "accepted":
                return Response(
                    {"detail": "you can not change the status from accepted to any thing!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if invitation.status == "declined":
                return Response(
                    {"detail": "you can not change the status from declined to any thing!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if invitation.invited_user == request.user:
                if invitation.status == "revoked":
                    return Response(
                        {"detail": "you can not change the revoked invitation!"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                elif serializer.validated_data["status"] == "revoked":
                    return Response(
                        {"detail": "you can not change the status to revoked!"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                serializer.save()
            elif (
                request.user.id in admins.values_list("user_id", flat=True)
                and serializer.validated_data["status"] == GroupInvitation.Status.REVOKED
            ):
                serializer.save()
            else:
                return Response(
                    {"detail": "you can not accept or decline an invitation!"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupInvitationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)

        admins = Membership.objects.filter(group=group, role__in=[Membership.Role.ADMIN, Membership.Role.OWNER])

        if request.user.id not in admins.values_list("user_id", flat=True):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        invitations = GroupInvitation.objects.filter(group=group)

        serializer = InvitationReadSerializer(invitations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InviteByPhoneView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InvitationByPhoneSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            group = serializer.validated_data["group"]
            phone_number = serializer.validated_data["phone_number"]
            
            # Check if user is already in the group
            invited_user = User.objects.get(phone_number=phone_number)
            if Membership.objects.filter(group=group, user=invited_user).exists():
                return Response(
                    {"detail": "User is already a member of this group"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Check if invitation already exists
            if GroupInvitation.objects.filter(group=group, invited_user=invited_user, status="pending").exists():
                return Response(
                    {"detail": "Invitation already sent to this user"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Check if user has permission to invite
            admins = Membership.objects.filter(
                group=group,
                role__in=[Membership.Role.ADMIN, Membership.Role.OWNER],
            )
            if request.user.id not in admins.values_list("user_id", flat=True):
                return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

            invitation = serializer.save()
            return Response(InvitationReadSerializer(invitation).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserInvitationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get all invitations for the current user"""
        invitations = GroupInvitation.objects.filter(
            invited_user=request.user
        ).order_by('-invited_at')
        
        serializer = InvitationListSerializer(invitations, many=True)
        return Response(serializer.data)


class InvitationResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, invitation_id):
        """Accept or decline an invitation"""
        try:
            invitation = GroupInvitation.objects.get(
                id=invitation_id,
                invited_user=request.user,
                status=GroupInvitation.Status.PENDING
            )
        except GroupInvitation.DoesNotExist:
            return Response(
                {"detail": "Invitation not found or already responded to."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = InvitationUpdateSerializer(
            invitation,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
