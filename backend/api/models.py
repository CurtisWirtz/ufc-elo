from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

class Note(models.Model):
    title = models.CharField(max_length=64)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')

    def __str__(self):
        return self.title

class Event(models.Model):
    event_id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    date = models.DateField()
    location = models.CharField(max_length=255)
    bout_order = ArrayField(models.CharField(max_length=64), blank=True, default=list)

    def __str__(self):
        return self.name
    
class Fighter(models.Model):
    fighter_id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    nickname = models.CharField(max_length=255, null=True, blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.CharField(max_length=64, default="0")
    height_in = models.IntegerField(null=True, blank=True)
    weight_lb = models.IntegerField(null=True, blank=True)
    reach_in = models.IntegerField(null=True, blank=True)
    stance = models.CharField(max_length=64, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    elo = models.FloatField(default=1500.00)
    peak_elo = models.FloatField(default=1500.00)
    elo_history = models.JSONField(default=dict)

    def __str__(self):
        return self.name
    
 
class Bout(models.Model):
    bout_id = models.CharField(max_length=64, primary_key=True)

    # Storing as FKs directly
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_bouts')
    fighter_1 = models.ForeignKey(Fighter, on_delete=models.CASCADE, related_name='fighter_1_bouts')
    fighter_2 = models.ForeignKey(Fighter, on_delete=models.CASCADE, related_name='fighter_2_bouts')
    winning_fighter = models.ForeignKey(Fighter, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_bouts')

    result = models.CharField(max_length=64, null=True, blank=True)
    method = models.CharField(max_length=64, null=True, blank=True)
    ending_round = models.CharField(max_length=64, null=True, blank=True)
    ending_time = models.CharField(max_length=64, null=True, blank=True)
    time_format = models.CharField(max_length=64, null=True, blank=True)
    referee = models.CharField(max_length=255, null=True, blank=True)
    details = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.fighter_1.name} vs {self.fighter_2.name} at {self.event.name}"
    
# class BoutFighter(models.Model):
    # This junction table is implicitly handled by Bout's fighter_1_id, fighter_2_id and winning_fighter.
    # I don't need a separate BoutFighter model with this JSON structure because
    # the bout itself contains the IDs of the two fighters as well as the winner.

    # If later I wanted to store fighter-specific stats for a particular bout
    # then I would re-introduce BoutFighter and connect it to Bout and Fighter.
    # pass

# class BoutRoundStats(models.Model):)
# (as I mentioned earlier... round stats/.. like takedown attempts, punches, kicks, etc.)
# was ditched as a feature, for now.