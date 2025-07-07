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

# TODO:
# - scrape the data accordingly
# - save data into CSV format

# links_list = 'links_list.txt'
links_list = 'test.txt'
fighters_list = []  # list of dictionaries, each dictionary is a separate fighter

with open(links_list, 'rt') as f:  # 'rt' for read text mode
    for link in f:
        link = link.replace('\n', '') # strip linebreaks that were nice for human readability
        print(link)
        if 'fighter-details' in link: # fighter page
            fighter = fighter_page(link)
            print(fighter)
            logger.info(f"Scraped fighter data: {fighter['name']} ({fighter['fighter_id']})")
            # append the fighter data to the fighters_list
            fighters_list.append(fighter)
        elif 'fight-details' in link: # bout page
            print('fight-details')
            continue
        elif 'event-details' in link: # event page
            print('event-details')
            continue

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