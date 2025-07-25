import random
import string
import jwt
from datetime import datetime

from django.conf import settings
from django.core.cache import cache

from users.models import User


def generate_random_username():
    while True:
        username = "user_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        if not User.objects.filter(username=username).exists():
            return username


def create_access_and_refresh_token(user):
    access = {
        "user_id": user.id,
        "type": "access",
        "exp": datetime.utcnow() + settings.JWT_ACCESS_TOKEN_LIFETIME,
    }
    refresh = {
        "user_id": user.id,
        "type": "refresh",
        "exp": datetime.utcnow() + settings.JWT_REFRESH_TOKEN_LIFETIME,
    }
    access_token = jwt.encode(access, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    cache.set(access_token, True, timeout=6000000)
    cache.set(refresh_token, True, timeout=6000000)

    return access_token, refresh_token


def create_access_token_from_refresh_token(access_token, refresh_token):
    cache.delete(access_token)
    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise ValueError("this is not a refresh token!")

    payload = decode_token(refresh_token)
    if payload:
        user_id = payload.get("user_id")

    new_payload = {
        "user_id": user_id,
        "type": "access",
        "exp": datetime.now() + settings.JWT_ACCESS_TOKEN_LIFETIME,
    }
    new_access_token = jwt.encode(new_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    cache.set(new_access_token, True, timeout=6000000)

    return new_access_token


def block_token(token):
    if not cache.delete(token):
        raise ValueError("Token not found in cache or already blocked.")


def decode_token(token):
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_from_token(token):
    payload = decode_token(token)
    user_id = payload.get("user_id")
    return User.objects.get(id=user_id)
