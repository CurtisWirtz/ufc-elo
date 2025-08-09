from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

from .models import Note, Event, Fighter, Bout


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    # Ensure password2 is included for registration validation
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    # These fields will hold the generated access and refresh tokens
    access = serializers.SerializerMethodField()
    refresh = serializers.SerializerMethodField()

    class Meta:
        model = User
        # Include all necessary fields for registration AND the new token fields
        # Explicitly list all fields is safer than '__all__' + tuple for custom fields
        fields = ["id", "username", "password", "password2", "access", "refresh"]
        extra_kwargs = {
            "password": {"write_only": True},
            "password2": {"write_only": True},
        }

    # Validation method for the entire serializer data (e.g., password matching)
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    # This method is called by serializer.save() after validation
    def create(self, validated_data):
        print("Creating user with data:", validated_data)
        # Pop password2 because it's only for validation and not a model field
        validated_data.pop('password2')
        # Create the user using Django's recommended create_user method
        user = User.objects.create_user(**validated_data)
        return user

    # Method to get the access token for the user instance being serialized
    def get_access(self, user):
        # RefreshToken.for_user(user) creates a token instance for the user
        # .access_token gets the associated access token
        return str(RefreshToken.for_user(user).access_token)

    # Method to get the refresh token for the user instance being serialized
    def get_refresh(self, user):
        # RefreshToken.for_user(user) creates a token instance for the user
        # Converting the refresh token object to a string gives its value
        return str(RefreshToken.for_user(user))

    
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

# Some lightweight serializers for Bout and Event, used on individual fighter pages
class SimpleEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['event_id', 'name', 'date', 'location']

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
    event = SimpleEventSerializer(read_only=True)

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

class FighterDetailSerializer(serializers.ModelSerializer):
    participated_bouts = serializers.SerializerMethodField()

    class Meta:
        model = Fighter
        fighter_fields = [field.name for field in Fighter._meta.get_fields() if field.concrete]
        fields = tuple(fighter_fields) + ('participated_bouts',)

    def get_participated_bouts(self, obj):
        """
        Retrieves all Bout objects where this fighter is either fighter_1 or fighter_2.
        """
        # Use Q objects to combine conditions for 'fighter_1' and 'fighter_2'
        # .select_related() pre-fetches related objects (Event, Fighter_1, Fighter_2, Winner)
        # to avoid N+1 query problems when serializing bouts.
        bouts_queryset = Bout.objects.filter(
            Q(fighter_1=obj) | Q(fighter_2=obj)
        ).select_related('event', 'fighter_1', 'fighter_2', 'winning_fighter').order_by('-event__date') # Order by event date descending for most recent first

        # Serialize the queryset using the (modified) BoutSerializer
        # 'many=True' because it's a list of bouts
        return BoutSerializer(bouts_queryset, many=True, context=self.context).data
    

# You might want to show which event a fighter fought at in the search results
class BoutEventNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['name'] # Just the name of the event

class SearchSerializer(serializers.ModelSerializer):
    # This will display the names of events associated with the fighter via bouts
    # It requires adding Bout to models and linking them as described above.
    events = serializers.SerializerMethodField()

    class Meta:
        model = Fighter
        fields = ['fighter_id', 'name', 'nickname', 'wins', 'losses', 'draws',
                  'height_in', 'weight_lb', 'reach_in', 'stance', 'date_of_birth', 'events']
        # Add any other fields you want to expose for a fighter in search results

    def get_events(self, obj):
        # This method fetches the unique event names a fighter has participated in
        event_names = set()
        for bout in obj.bouts_as_fighter1.all():
            event_names.add(bout.event.name)
        for bout in obj.bouts_as_fighter2.all():
            event_names.add(bout.event.name)
        return list(event_names)
    

class FighterSearchSerializer(serializers.ModelSerializer):
    # This serializer will be used when a search query matches a Fighter.
    # We only expose the minimum necessary fields for the search result display.
    class Meta:
        model = Fighter
        fields = ['fighter_id', 'name', 'nickname', 'weight_lb', 'wins', 'losses', 'draws']

class EventSearchSerializer(serializers.ModelSerializer):
    # This serializer will be used when a search query matches an Event.
    class Meta:
        model = Event
        fields = ['event_id', 'name', 'date', 'location']