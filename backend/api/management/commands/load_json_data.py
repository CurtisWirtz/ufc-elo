import json
from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date
from django.db.utils import IntegrityError

from api.models import Fighter, Bout, Event

import logging

# Set up logging for more detailed output than just self.stdout.write
logger = logging.getLogger(__name__)

handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.DEBUG) # more verbose than info


class Command(BaseCommand):
    help = "Load UFC data from JSON files into the PostgreSQL database."

    def add_arguments(self, parser):
        parser.add_argument('events_json', type=str, help='Path to the events JSON file')
        parser.add_argument('fighters_json', type=str, help='Path to the fighters JSON file')
        parser.add_argument('bouts_json', type=str, help='Path to the bouts JSON file')

    def load_json_file(self, file_path):
        """ Helper to load JSON data from a file."""
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Error: JSON file not found at {file_path}")
            return None
        except json.JSONDecodeError:
            logger.error(f"Error: Could not decode JSON from {file_path}. Check file format.")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred while reading {file_path}: {e}")
            return None

    def validate_date(self, date_str):
        """ Helper to validate date strings in YYYY-MM-DD format."""
        converted_date = None
        if date_str:
            try:
                converted_date = date.fromisoformat(date_str)
            except ValueError:
                logger.error(f"Invalid date format: {date_str}. Expected format is YYYY-MM-DD.")
        return converted_date


    def handle(self, *args, **options):      
        # Note: Load order may be important here.
        #    Only Bouts have foreign keys to Fighters and Events, so it needs to be loaded last. 
        #    Fighters have no FK references, so It'll go first.
        #    Events do have a list of Bouts, but they are not FK's, just a list of strings that reference Bout IDs.

        self.stdout.write("Loading Fighters from JSON file.")

        # JSON file paths 
        fighters_json = options['fighters_json']
        events_json = options['events_json']
        bouts_json = options['bouts_json']
        
        # get the JSON data
        fighters_data = self.load_json_file(fighters_json)
        events_data = self.load_json_file(events_json)
        bouts_data = self.load_json_file(bouts_json)

        # Here, we add records to DB tables.
        with transaction.atomic():

            #----------------
            #--- Fighters ---
            
            self.stdout.write(self.style.NOTICE("Loading Fighters..."))

            for fighter in fighters_data:

                # We should convert date_of_birth to a date object for postgres, handling invalid formats
                date_of_birth = self.validate_date(fighter['date_of_birth'])

                try:
                    fighter_obj, created = Fighter.objects.update_or_create(
                        fighter_id=fighter["fighter_id"],
                        defaults={
                            "name": fighter["name"],
                            "nickname": fighter["nickname"],
                            "wins": fighter["wins"],
                            "losses": fighter["losses"],
                            "draws": fighter["draws"],
                            "height_in": fighter["height_in"],
                            "weight_lb": fighter["weight_lb"],
                            "reach_in": fighter["reach_in"],
                            "stance": fighter["stance"],
                            "date_of_birth": date_of_birth,
                        }
                    )
                    if created:
                        logger.info(f"Created Fighter: {fighter_obj.name} ({fighter_obj.fighter_id})")
                    else:
                        logger.debug(f"Updated Fighter: {fighter_obj.name} ({fighter_obj.fighter_id})")
                except IntegrityError as e:
                    logger.error(f"Database integrity error for fighter {fighter_id}: {e}")
                except Exception as e:
                    logger.error(f"Error processing fighter {fighter_id}: {e}", exc_info=True)
            
            self.stdout.write(self.style.SUCCESS("Fighter loading complete."))


        self.stdout.write('Successfully loaded UFC data into the database.')