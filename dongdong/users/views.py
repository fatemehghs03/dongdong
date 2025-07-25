from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from users.serializers import (
    RegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    RefreshTokenSerializer,
)
from users.helpers import (
    create_access_and_refresh_token,
    block_token,
    get_user_from_token,
)


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            access_token, refresh_token = create_access_and_refresh_token(user)
            return Response(
                {
                    "access": access_token,
                    "refresh": refresh_token,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            access_token, refresh_token = create_access_and_refresh_token(user)
            return Response(
                {
                    "access": access_token,
                    "refresh": refresh_token,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            access_token = serializer.validated_data["access"]
            refresh_token = serializer.validated_data["refresh"]
            block_token(access_token)
            block_token(refresh_token)
            return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        if serializer.is_valid():
            access_token = serializer.validated_data["access"]
            refresh_token = serializer.validated_data["refresh"]
            if get_user_from_token(refresh_token) == get_user_from_token(access_token):
                user = get_user_from_token(refresh_token)
                new_access_token, new_refresh_token = create_access_and_refresh_token(user)
                block_token(refresh_token)
                block_token(access_token)
                return Response(
                    {
                        "access": new_access_token,
                        "refresh": new_refresh_token,
                    },
                    status=status.HTTP_200_OK,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
