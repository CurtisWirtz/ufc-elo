from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.NoteListCreate.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteDelete.as_view(), name='delete-note'),

    path('events/', views.EventListView.as_view(), name='event-list'),
    path('events/<str:pk>/', views.EventDetailView.as_view(), name='event-detail'),

    path('fighters/', views.FighterListView.as_view(), name='fighter-list'),
    path('fighters/<str:fighter_id>/', views.FighterDetailView.as_view(), name='fighter-detail'),

    path('search/', views.CombinedSearchView.as_view(), name='combined-search'),
]
