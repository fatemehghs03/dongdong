import re

from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


def validate_phone_number(phone_number):
    pattern = r"^989\d{9}$"
    if not re.match(pattern, phone_number):
        raise ValidationError("Phone number must start with '989' and be exactly 12 digits long.")


class User(AbstractUser):
    phone_number = models.CharField(max_length=13, blank=False, null=False, validators=[validate_phone_number])
    email = models.EmailField(_("email address"), unique=True, blank=True, null=True)
