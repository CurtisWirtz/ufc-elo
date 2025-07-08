import requests
from bs4 import BeautifulSoup
import logging
from urllib.parse import urlparse
from general import *

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

# search document for matching css class name
def search_by_class(class_name, bs4_document):
    field = bs4_document.find(class_=class_name).get_text(strip=True)
    return field

def fighter_page(hyperlink):
    with open("fighter.html", "r") as f: # r for read mode
        doc = BeautifulSoup(f, "html.parser")

    # result = requests.get(hyperlink)
    # doc = BeautifulSoup(result.text, "html.parser")

    fighter_id = urlparse(hyperlink).path.split('/')[-1]  # Extract the last part of the URL
    name = search_by_class('b-content__title-highlight', doc)

    if doc.find('p', class_='b-content__Nickname').get_text(strip=True) == "":
        nickname = None
    else:
        nickname = search_by_class('b-content__Nickname', doc)
    
    record = search_by_class('b-content__title-record', doc)
    wins = int(record.split('-')[0].strip()[8:])
    losses = int(record.split('-')[1].strip())
    draws = int(record.split('-')[2].strip())

    table_stats = doc.find_all('li', class_='b-list__box-list-item b-list__box-list-item_type_block')

    if (table_stats[0].get_text(strip=True).split(':')[1] == "--" or ""):
        height = None
    else:
        height = convert_height_to_inches(table_stats[0].get_text(strip=True).split(':')[1])

    if (table_stats[1].get_text(strip=True).split(':')[1] == "--" or ""):
        weight = None
    else:
        weight = int(table_stats[1].get_text(strip=True).split(':')[1][:-5])  # Remove 'lbs' from the end
    
    if (table_stats[2].get_text(strip=True).split(':')[1].strip() == "--" or ""):
        reach = None
    else:
        reach = int(table_stats[2].get_text(strip=True).split(':')[1].strip()[:-1])

    if (table_stats[3].get_text(strip=True).split(':')[1].strip() == ""):
        stance = None
    else:
        stance = table_stats[3].get_text(strip=True).split(':')[1].strip()

    if (table_stats[4].get_text(strip=True).split(':')[1].strip() == "--" or ""):
        date_of_birth = None
    else:
        dob = table_stats[4].get_text(strip=True).split(':')[1].strip()
        date_of_birth = convert_date_format_dob(dob)


    fighter_data = {
        'fighter_id': fighter_id,  # Primary Key
        'name': name,
        'nickname': nickname,
        'wins': wins,
        'losses': losses,
        'draws': draws,
        'height_in': height,
        'weight_lb': weight,
        'reach_in': reach,
        'stance': stance,
        'date_of_birth': date_of_birth,
    }

    return fighter_data

def bout_page(hyperlink):
    with open("bout.html", "r") as f: # r for read mode
        doc = BeautifulSoup(f, "html.parser")

    # result = requests.get(hyperlink)
    # doc = BeautifulSoup(result.text, "html.parser")

    # if doc.find('p', class_='b-content__Nickname').get_text(strip=True) == "":
    #     nickname = None
    # else:
    #     nickname = search_by_class('b-content__Nickname', doc)
    
    # record = search_by_class('b-content__title-record', doc)
    # wins = int(record.split('-')[0].strip()[8:])
    # losses = int(record.split('-')[1].strip())
    # draws = int(record.split('-')[2].strip())

    # table_stats = doc.find_all('li', class_='b-list__box-list-item b-list__box-list-item_type_block')

    # if (table_stats[0].get_text(strip=True).split(':')[1] == "--" or ""):
    #     height = None
    # else:
    #     height = table_stats[0].get_text(strip=True).split(':')[1]

    # if (table_stats[1].get_text(strip=True).split(':')[1] == "--" or ""):
    #     weight = None
    # else:
    #     weight = int(table_stats[1].get_text(strip=True).split(':')[1][:-5])  # Remove 'lbs' from the end
    
    # if (table_stats[2].get_text(strip=True).split(':')[1].strip() == "--" or ""):
    #     reach = None
    # else:
    #     reach = table_stats[2].get_text(strip=True).split(':')[1].strip()

    # if (table_stats[3].get_text(strip=True).split(':')[1].strip() == ""):
    #     stance = None
    # else:
    #     stance = table_stats[3].get_text(strip=True).split(':')[1].strip()

    # if (table_stats[4].get_text(strip=True).split(':')[1].strip() == "--" or ""):
    #     date_of_birth = None
    # else:
    #     date_of_birth = table_stats[4].get_text(strip=True).split(':')[1].strip()

    # bout_data = {
    #     'bout_id': '12345',  # Primary Key
    #     'event_id': '67890',  # Foreign Key to events table
    #     'date': '2023-01-01',
    #     'location': 'Las Vegas, NV'
    # }

    # return fighter_data
    pass

def event_page(hyperlink):
    with open("event.html", "r") as f: # r for read mode
        doc = BeautifulSoup(f, "html.parser")

    # result = requests.get(hyperlink)
    # doc = BeautifulSoup(result.text, "html.parser")

    event_id = urlparse(hyperlink).path.split('/')[-1]  # Extract the last part of the URL
    name = search_by_class('b-content__title-highlight', doc)

    table_stats = doc.find_all('li', class_='b-list__box-list-item')
    date = table_stats[0].get_text(strip=True).split(':')[1].strip()
    location = table_stats[1].get_text(strip=True).split(':')[1].strip()

    event_data = {
        'event_id': event_id,  # Primary Key
        'name': name,
        'date': date,
        'location': location,
    }

    return event_data