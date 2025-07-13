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
