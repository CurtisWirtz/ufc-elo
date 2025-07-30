from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.NoteListCreate.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteDelete.as_view(), name='delete-note'),

    # API endpoint for listing all events
    path('events/', views.EventListView.as_view(), name='event-list'),

    # API endpoint for retrieving, updating, or deleting a single event
    # The <str:pk> part captures the event_id (which is a CharField primary key)
    # Accessible at: /api/events/UFC290/ or /api/events/MyEventId/
    path('events/<str:pk>/', views.EventDetailView.as_view(), name='event-detail'),
]
