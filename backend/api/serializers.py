from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Event, Fighter, Bout

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} # tells django accept a password, but dont return one when giving info about a user.

    def create(self, validated_data): # if the Meta fields are valid, this method will be called to create a new user.
        user = User.objects.create_user(**validated_data)
        return user