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

class FighterSerializer(serializers.ModelSerializer):
    """
    Serializer for the Fighter model.
    Includes all fields.
    """
    class Meta:
        model = Fighter
        fields = '__all__' # All fields including primary_key=True 'fighter_id'
        # read_only_fields = ['fighter_id'] # If fighter_id is generated elsewhere

class BoutSerializer(serializers.ModelSerializer):
    """
    Serializer for the Bout model, with nested Fighter details.
    """
    # Use nested serializers to display fighter details instead of just IDs
    fighter_1 = FighterSerializer(read_only=True)
    fighter_2 = FighterSerializer(read_only=True)
    winning_fighter = FighterSerializer(read_only=True)

    class Meta:
        model = Bout
        fields = [
            'bout_id',
            'event', # This will be the Event's primary key (event_id string)
            'fighter_1', # Nested Fighter object
            'fighter_2', # Nested Fighter object
            'winning_fighter', # Nested Fighter object (can be null)
            'result',
            'method',
            'ending_round',
            'ending_time',
            'time_format',
            'referee',
            'details'
        ]
        # read_only_fields = ['bout_id'] # If bout_id is generated elsewhere

class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for the Event model, with nested Bout details.
    Handles the `bout_order` ArrayField to return full Bout objects.
    """
    # Use a SerializerMethodField to get full Bout objects based on bout_order
    ordered_bouts = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'event_id', # Your CharField primary key
            'name',
            'date',
            'location',
            'bout_order', # Still includes the raw ArrayField
            'ordered_bouts', # Will contains the full Bout objects
        ]

    def get_ordered_bouts(self, obj):
        """
        Retrieves Bout objects based on the `bout_order` ArrayField
        and serializes them using BoutSerializer.
        """
        if not obj.bout_order:
            return []
        
        # Get all bouts related to this event
        # and filter them by the IDs in bout_order
        # and maintain the order as specified in bout_order.
        
        # This is a common pattern for ordering by a list of IDs
        # You would typically avoid N+1 queries here by prefetching,
        # but for simplicity, we'll fetch them.
        
        # Get all related bouts first
        event_bouts_queryset = obj.event_bouts.all()
        
        # Create a dictionary for quick lookup by bout_id
        bout_map = {bout.bout_id: bout for bout in event_bouts_queryset}
        
        # Reconstruct the list in the specified order
        ordered_bouts = []
        for bout_id in obj.bout_order:
            bout = bout_map.get(bout_id)
            if bout:
                ordered_bouts.append(bout)
        
        # Serialize the ordered list of Bout objects
        return BoutSerializer(ordered_bouts, many=True, read_only=True, context=self.context).data

