from users.helpers import get_user_from_token, decode_token

from django.core.cache import cache
from django.contrib.auth.models import AnonymousUser
from django.utils.functional import SimpleLazyObject
from rest_framework.authentication import BaseAuthentication


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith("Bearer "):
            return (AnonymousUser(), None)

        token = auth_header.split("Bearer ")[1]
        if not cache.get(token):
            return (AnonymousUser(), None)
        
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return (AnonymousUser(), None)

        return (SimpleLazyObject(lambda: get_user_from_token(token)), token)
