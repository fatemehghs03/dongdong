from rest_framework import serializers
from groups.models import Group, Membership, GroupJoinRequest, GroupInvitation
from datetime import datetime


class GroupWriteSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "owner_username", "created_at"]

        extra_kwargs = {
            "id": {"read_only": True},
            "owner_username": {"read_only": True},
            "created_at": {"read_only": True},
        }

    def create(self, validated_data):
        request = self.context.get("request")
        group = Group.objects.create(owner=request.user, **validated_data)
        Membership.objects.create(user=request.user, group=group, role=Membership.Role.OWNER)
        return group


class GroupReadSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "owner_username", "created_at"]


class JoinRequestWriteSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = GroupJoinRequest
        fields = ["id", "group", "user_username", "requested_at", "status"]

        extra_kwargs = {
            "id": {"read_only": True},
            "user_username": {"read_only": True},
            "status": {"read_only": True},
        }

    def create(self, validated_data):
        user = self.context["request"].user

        return GroupJoinRequest.objects.create(user=user, **validated_data)


class JoinRequestReadSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)

    class Meta:
        model = GroupJoinRequest
        fields = ["id", "group", "group_name", "status", "requested_at"]


class JoinRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupJoinRequest
        fields = ["status"]

    def update(self, join_request, validated_data):
        user = self.context["request"].user

        join_request.status = validated_data.get("status", join_request.status)
        join_request.reviewed_by = user
        join_request.reviewed_at = datetime.utcnow()

        if join_request.status == GroupJoinRequest.Status.ACCEPTED:
            Membership.objects.create(
                user=join_request.user,
                group=join_request.group,
                role=Membership.Role.MEMBER,
            )
        join_request.save()

        return join_request


class MembershipUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = fields = ["id", "user", "group", "role", "joined_at"]
        extra_kwargs = {
            "id": {"read_only": True},
            "user": {"read_only": True},
            "group": {"read_only": True},
            "joined_at": {"read_only": True},
        }

    def validate_role(self, value):
        if value == Membership.Role.OWNER:
            group = self.instance.group
            owner_exists = (
                Membership.objects.filter(group=group, role=Membership.Role.OWNER).exclude(id=self.instance.id).exists()
            )
            if owner_exists:
                raise serializers.ValidationError("Only one owner is allowed per group.")
        return value

    def update(self, membership, validated_data):
        membership.role = validated_data.get("role", membership.role)

        membership.save()
        return membership


class MembershipReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ["user", "group", "role", "id", "joined_at"]


class MembershipWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ["id", "user", "group", "role", "joined_at"]
        extra_kwargs = {"id": {"read_only": True}, "joined_at": {"read_only": True}}

    def validate_role(self, value):
        group = self.initial_data.get("group")
        if value == Membership.Role.OWNER:
            if Membership.objects.filter(group_id=group, role=Membership.Role.OWNER).exists():
                raise serializers.ValidationError("Only one owner is allowed per group.")
        return value


class InvitationWriteSerializer(serializers.ModelSerializer):
    invited_username = serializers.CharField(source="invited_user.username", read_only=True)
    inviting_username = serializers.CharField(source="invited_by.username", read_only=True)

    class Meta:
        model = GroupInvitation
        fields = [
            "invited_user",
            "id",
            "group",
            "invited_username",
            "inviting_username",
            "status",
        ]

        extra_kwargs = {
            "status": {"read_only": True},
            "id": {"read_only": True},
            "invited_username": {"read_only": True},
            "inviting_username": {"read_only": True},
        }

    def create(self, validated_data):
        user = self.context["request"].user

        return GroupInvitation.objects.create(invited_by=user, **validated_data)


class InvitationReadSerializer(serializers.ModelSerializer):
    invited_username = serializers.CharField(source="invited_user.username", read_only=True)
    inviting_username = serializers.CharField(source="invited_by.username", read_only=True)

    class Meta:
        model = GroupInvitation
        fields = [
            "invited_username",
            "id",
            "group",
            "inviting_username",
            "invited_at",
            "status",
            "responded_at",
        ]


class InvitationUpdateSerializer(serializers.ModelSerializer):
    invited_username = serializers.CharField(source="invited_user.username", read_only=True)
    inviting_username = serializers.CharField(source="invited_by.username", read_only=True)

    class Meta:
        model = GroupInvitation
        fields = [
            "invited_user",
            "invited_username",
            "id",
            "group",
            "inviting_username",
            "status",
        ]

        extra_kwargs = {
            "id": {"read_only": True},
            "invited_username": {"read_only": True},
            "group": {"read_only": True},
            "inviting_username": {"read_only": True},
            "invited_user": {"read_only": True},
        }

    def update(self, invitation, validated_data):
        invitation.status = validated_data.get("status", invitation.status)
        if invitation.status in ["accepted", "declined"]:
            invitation.responded_at = datetime.utcnow()
        if invitation.status == GroupInvitation.Status.ACCEPTED:
            membership = Membership.objects.create(group=invitation.group, user=invitation.invited_user)
            membership.save()
        invitation.save()
        return invitation
