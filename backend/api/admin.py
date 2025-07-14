from django.contrib import admin

from .models import Fighter, Event, Bout


class FighterAdmin(admin.ModelAdmin):
    list_display = ["name", "nickname", "wins", "losses", "draws", "weight_lb"]
    search_fields = ["name", "nickname", "weight_lb", "date_of_birth"]
admin.site.register(Fighter, FighterAdmin)

class EventAdmin(admin.ModelAdmin):
    list_display = ["name", "date", "location"]
    search_fields = ["name", "date", "location"]
admin.site.register(Event, EventAdmin)

class BoutAdmin(admin.ModelAdmin):
    list_display = ["bout_id", "fighter_1", "fighter_2", "event", "event__date"]
    search_fields = ["fighter_1__name", "fighter_2__name", "event__name", "result"]
admin.site.register(Bout, BoutAdmin)