import logging
from data_types import *
import json
import os

# Setup for logger
log_file = "scraper.log"
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# links_list = 'links_list.txt'
links_list = 'test.txt'
# lists of dictionaries, each dictionary is a separate fighter, bout, or event
fighters_list = []  
bouts_list = []
events_list = []

with open(links_list, 'rt') as f:  # 'rt' for read text mode
    for link in f:
        link = link.replace('\n', '') # strip linebreaks that were nice for human readability
        if 'fighter-details' in link: # fighter page
            fighter = fighter_page(link)
            logger.info(f"Scraped FIGHTER data: {fighter['name']} ({fighter['fighter_id']})")
            fighters_list.append(fighter)
        elif 'fight-details' in link: # bout page
            bout = bout_page(link)
            logger.info(f"Scraped BOUT data: ({bout['bout_id']})")
            bouts_list.append(bout)
        elif 'event-details' in link: # event page
            event = event_page(link)
            logger.info(f"Scraped EVENT data: {event['name']} ({event['event_id']})")
            events_list.append(event)

def save_to_json(output_file, ufc_data):
    with open(output_file, 'w') as f:
        json.dump(ufc_data, f, indent=4)  # indent=4 for pretty printing

def create_json_file(file_path):
    """Create a JSON file if it doesn't exist."""
    if not os.path.isfile(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)  # Initialize with an empty list

# Save data to JSON files
fighters_output_file = "fighters.json"
create_json_file(fighters_output_file)
save_to_json(fighters_output_file, fighters_list)

events_output_file = "events.json"
create_json_file(events_output_file)
save_to_json(events_output_file, events_list)

bouts_output_file = "bouts.json"
create_json_file(bouts_output_file)
save_to_json(bouts_output_file, bouts_list)