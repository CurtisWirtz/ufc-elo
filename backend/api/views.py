from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, EventSerializer, FighterSerializer, FighterDetailSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Event, Fighter
from .pagination import TwentyItemsPagination 

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view or create notes
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user) # only give the user their notes
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can delete notes

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

# CreateUserView allows users to register an account
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account

from .serializers import EventSerializer
# from .pagination import TenEventsPagination # Import your custom pagination

class EventListView(generics.ListAPIView):
    queryset = Event.objects.all().order_by('-date') # order by 'date' in descending order (-date)
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TwentyItemsPagination

class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

class FighterListView(generics.ListAPIView):
    queryset = Fighter.objects.all().order_by('fighter_id') # pulling all fighters with pagination... DB does not guarantee the order of records, so we want basically anything here. something, just not nothing
    serializer_class = FighterSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TwentyItemsPagination

class FighterDetailView(generics.RetrieveAPIView):
    queryset = Fighter.objects.all()
    serializer_class = FighterDetailSerializer
    lookup_field = 'fighter_id'