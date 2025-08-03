from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, NoteSerializer, EventSerializer, FighterSerializer, FighterDetailSerializer, FighterSearchSerializer, EventSearchSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Event, Fighter
from .pagination import TwentyItemsPagination 
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import F, Value
from django.db.models.functions import Coalesce

User = get_user_model()


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

# # CreateUserView allows users to register an account
# class CreateUserView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [AllowAny]  # Allow any user to create an account

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = ()

    # The `create` method here is implicit from generics.CreateAPIView.
    # It calls serializer.save(), which in turn calls your UserSerializer's create() method.
    # The response will then be constructed from serializer.data, which now includes tokens.
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save() # User is created, and tokens should be generated within the serializer

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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
    permission_classes = [IsAuthenticated]
    lookup_field = 'fighter_id'


class CombinedSearchView(generics.ListAPIView):
    def get_queryset(self):
        # get_queryset is usually for a single model.. ill use the override list() method instead
        pass

    def list(self, request, *args, **kwargs):
        query = self.request.query_params.get('q', '').strip()
        results = []

        if query:
            search_query_obj = SearchQuery(query, config='english') # Renamed to avoid conflict

            # Search for Fighters
            fighter_vector_definition = (
                SearchVector('name', weight='A') +
                SearchVector('nickname', weight='B')
            )
            # Annotate the queryset with the search vector (as 'search_document')
            # and the rank (as 'rank')
            fighter_queryset = Fighter.objects.annotate(
                search_document=fighter_vector_definition,
                rank=SearchRank(fighter_vector_definition, search_query_obj)
            ).filter(search_document=search_query_obj) # Filter against the annotated 'search_document'

            # https://docs.djangoproject.com/en/5.2/ref/models/database-functions/#coalesce
            # Use Coalesce to treat null ranks as 0 for consistent ordering if no match
            # This ensures items that don't match exactly but might be ordered by other criteria don't mess up sorting.
            # However, since we're filtering (search_document=search_query_obj), all results will have a rank.
            # Just ordering by -rank is usually sufficient here.
            fighter_queryset = fighter_queryset.order_by('-rank').distinct()

            for fighter in fighter_queryset: #[:20]: # Limit display to 20 fighters
                serialized_data = FighterSearchSerializer(fighter).data
                serialized_data['type'] = 'fighter'

                # serialized_data['rank'] = fighter.rank # expose the rank for client-side sorting if wanted
                results.append(serialized_data)


            # search for events
            event_vector_definition = SearchVector('name', weight='A')
            event_queryset = Event.objects.annotate(
                search_document=event_vector_definition,
                rank=SearchRank(event_vector_definition, search_query_obj)
            ).filter(search_document=search_query_obj) # Filter against the annotated 'search_document'
            event_queryset = event_queryset.order_by('-rank').distinct()

            for event in event_queryset: #[:20]: # Limit to 20 events
                serialized_data = EventSearchSerializer(event).data
                serialized_data['type'] = 'event'
                
                # serialized_data['rank'] = event.rank # expose the rank for client-side sorting
                results.append(serialized_data)

            # Additionally: sort the combined 'results' list by rank (a.k.a. sort by relevance.. always!)
            results.sort(key=lambda x: x.get('rank', 0), reverse=True)

        return Response(results)