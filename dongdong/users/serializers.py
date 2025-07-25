import re

from rest_framework import serializers
from django.contrib.auth import authenticate

from users.models import User
from users.helpers import generate_random_username


class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField()

    class Meta:
        model = User
        fields = ("phone_number", "password", "email")
        extra_kwargs = {"email": {"required": False}, "password": {"write_only": True}}

    def validate_phone_number(self, phone_nmuber):
        pattern = r"^(?:\+989|09|9)\d{9}$"
        if re.match(pattern, phone_nmuber):
            return "989" + phone_nmuber[-9:]
        raise serializers.ValidationError(
            "Phone number must be start with +989 or 09 or 9 and And its length must be 9."
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            username=generate_random_username(),
            email=validated_data.get("email", ""),
            phone_number=validated_data["phone_number"],
            password=validated_data["password"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data.get("username"), password=data.get("password"))
        if user is None:
            raise serializers.ValidationError("Incorrect username or password.")
        data["user"] = user
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)
    access = serializers.CharField(required=True)


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)
    access = serializers.CharField(required=True)
