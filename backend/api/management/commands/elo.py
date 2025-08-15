from django.core.management.base import BaseCommand
import math
from api.models import Event, Bout, Fighter

class Command(BaseCommand):
    help = "Assigns Elo ratings to all fighters, ordered by earliest date."

    def win_probability(self, winning_fighter_elo, losing_fighter_elo):
        """ Returns the predicted win chance percentage as a decimal """

        return 1.0 / (1 + math.pow( 10, ((winning_fighter_elo - losing_fighter_elo) / 400.0) ))


    def elo_rating(self, current_elo, opponent_elo, outcomeValue):
        """ Returns an updated Elo rating for a fighter post-bout, based on expectation and outcome

            R' = R + K *(S - E)   
 
        R = elo of current fighter 
        K = maximum possible rating change
        S = actual outcome Value: 1 for a win, 0.5 for a draw, and 0 for a loss
        E = expected outcome value for S based on the fighters' elo comparison
        R` = New rating
        """

        R = current_elo
        K = 30
        S = outcomeValue if current_elo else 0.5 # if there is a clear winner, use the outcomeValue (1 or 0 for win or loss), otherwise it's a draw/NC (value of 0.5)
        E = self.win_probability(current_elo, opponent_elo) # percentage chance of winning based on Elo ratings, as decimal (0-1)

        return ( R + K *( S - E ) )


    def update_fighter_elo_records(self, fighter, bout_id, opponent_id, starting_elo, ending_elo):
        """ Updates the fighter's Elo DB records after a bout """

        # Create the new elo history entry as a dictionary
        elo_history_entry = {
            "bout_id": bout_id,
            "opponent_id": opponent_id,
            "starting_elo": starting_elo,
            "ending_elo": ending_elo,
            "elo_change": ending_elo - starting_elo
        }
        # Append the new entry to the fighter's elo_history list
        fighter.elo_history.append(elo_history_entry)

        # Update the fighter's current Elo
        fighter.elo = ending_elo
        # Update fighter's peak Elo (if a new high was achieved)
        if ending_elo > fighter.peak_elo:
            fighter.peak_elo = ending_elo

        # Save the updated fighter object!
        fighter.save()

    def assign_elo_rankings(self, bout):
        """ Gets Elo new ratings for the two fighters participating in a given bout, saves new  database records """

        # Get fresh data from the participating fighters
        # If the event is a tournament, their Elos could have changed since the event started, so we query the DB every time
        fighter_1 = Fighter.objects.get(fighter_id=bout.fighter_1.fighter_id)
        fighter_2 = Fighter.objects.get(fighter_id=bout.fighter_2.fighter_id)

        fighter_1_prefight_elo = fighter_1.elo
        fighter_2_prefight_elo = fighter_2.elo

        # Here, we update the elo determine the elo change
        if bout.winning_fighter: # Is there a definitive winner? (Win or Loss - not a draw or NC)
            # if winner is fighter_1
            if bout.winning_fighter.fighter_id == fighter_1.fighter_id: 
                fighter_1_postfight_elo = self.elo_rating(fighter_1.elo, fighter_2.elo, 1)
                fighter_2_postfight_elo = self.elo_rating(fighter_2.elo, fighter_1.elo, 0)
            
            # if winner is fighter_2
            else:
                fighter_1_postfight_elo = self.elo_rating(fighter_1.elo, fighter_2.elo, 0)
                fighter_2_postfight_elo = self.elo_rating(fighter_2.elo, fighter_1.elo, 1)
        
        # No winner... So it's a draw or no contest
        else:
            fighter_1_postfight_elo = self.elo_rating(fighter_1.elo, fighter_2.elo, 0.5)
            fighter_2_postfight_elo = self.elo_rating(fighter_2.elo, fighter_1.elo, 0.5)
      
        # Update the fighter's Elo records
        # Fighter 1
        self.update_fighter_elo_records(fighter_1, bout.bout_id, fighter_2.fighter_id, fighter_1_prefight_elo, fighter_1_postfight_elo)
        # Fighter 2
        self.update_fighter_elo_records(fighter_2, bout.bout_id, fighter_1.fighter_id, fighter_2_prefight_elo, fighter_2_postfight_elo)


    def handle(self, *args, **options):
        self.stdout.write("Starting Elo rating calculations.")

        # Get all of the events. ordered by event date (oldest first)
        events = Event.objects.all().order_by('date')

        # If there are no events, we can't assign Elo ratings
        if not events:
            self.stdout.write(self.style.WARNING("No events found. Cannot assign Elo ratings."))
            return
        
        # How to assign elo rankings:
        # 1. Loop thru all events 
        # 2. Get the bouts from each event 
        # 3. Ensure the bout order (from the earliest prelim being first, to main event being last)
        # 4. Loop thru each bout that happens on an event
        # 5. Get the fighters associated with each bout
        # 6. Based on the outcome vs. prediction formula: when a bout is concluded, save post-bout elo rating to each fighter

        # Events loop 
        for event in events:
            # Get the bouts from the event by bout_id
            bout_ids = event.bout_order
            bouts = Bout.objects.filter(bout_id__in=bout_ids)

            # Assist in bout order using a hash map, we need the bouts to be in order according to the event.bout_order field
            bout_hash_map = {bout.bout_id: bout for bout in bouts}

            # Put the bouts in order in alignment with the hash map
            ordered_bouts = [bout_hash_map[bout_id] for bout_id in bout_ids]

            # But! the bouts are in reverse order... so we reverse them back, that earliest come first!
            reversed_bouts = list(reversed(ordered_bouts))

            # Bout loop
            for bout in reversed_bouts:
                self.assign_elo_rankings(bout)

        self.stdout.write(self.style.SUCCESS("Elo rating records successfully updated."))
