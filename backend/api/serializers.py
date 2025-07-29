from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Note, Event, Fighter, Bout

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} # write_only: accept a password, but dont return one when giving info about a user.

    # if the Meta fields are valid, this method will be called to create a new user.
    def create(self, validated_data): 
        print("Creating user with data:", validated_data)
        user = User.objects.create_user(**validated_data)
        return user 
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username

        return token

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = {"id", "title", "content", "created_at", "author"}
        extra_kwargs = {"author": {"read_only": True}}  # see the author field, but dont allow setting author.. its auto assigned.