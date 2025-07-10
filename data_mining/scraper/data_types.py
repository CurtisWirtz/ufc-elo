import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from general import *


# search document for matching css class name
def search_by_class(class_name, bs4_document):
    field = bs4_document.find(class_=class_name).get_text(strip=True)
    return field

def fighter_page(hyperlink):
    result = requests.get(hyperlink)
    doc = BeautifulSoup(result.text, "html.parser")

    fighter_id = urlparse(hyperlink).path.split('/')[-1]  # Extract the last part of the URL
    name = search_by_class('b-content__title-highlight', doc)

    if doc.find('p', class_='b-content__Nickname').get_text(strip=True) == "":
        nickname = None
    else:
        nickname = search_by_class('b-content__Nickname', doc)
    
    record = search_by_class('b-content__title-record', doc)
    wins = int(record.split('-')[0].strip()[8:])
    losses = int(record.split('-')[1].strip())
    draws = record.split('-')[2].strip()

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
    result = requests.get(hyperlink)
    doc = BeautifulSoup(result.text, "html.parser")

    bout_id = urlparse(hyperlink).path.split('/')[-1]  # Extract the last part of the URL

    event_title_container = doc.find('h2', class_='b-content__title')
    event_href = event_title_container.find('a', class_='b-link').get('href')
    event_id = urlparse(event_href).path.split('/')[-1]

    category = search_by_class('b-fight-details__fight-title', doc)

    result_character = search_by_class('b-fight-details__person-status', doc)
    if result_character:
        if result_character == "D":
            result = "Draw"
        elif result_character == "NC":
            result = "No Contest"
        else:
            result = "Win/Loss"
    else:
        result = None

    info_table = doc.find_all('p', 'b-fight-details__text')


    if info_table:
        # future bouts will not yet have any of this information, so we need to check if the info_table exists
        
        if result == "Draw":
            # Draws are sometimes mistakenly labeled as decisions in the method field, so I have this manual override.
            method = "Draw"
        else:
            method = info_table[0].find('i', class_='b-fight-details__text-item_first').get_text(strip=True)
        
        bout_info = info_table[0].find_all('i', class_='b-fight-details__text-item')

        ending_round = bout_info[0].get_text(strip=True)[6:]
        ending_time = bout_info[1].get_text(strip=True)[5:]
        time_format = bout_info[2].get_text(strip=True)[12:]
        referee = bout_info[3].get_text(strip=True)[8:]

        details = add_space_after_period(info_table[1].get_text(strip=True)[8:])
    else:
        method = None
        ending_round = None
        ending_time = None
        time_format = None
        referee = None
        details = None
    
    # we need to connect fighters to bouts, so we need to find the fighter id's
    # fighter_1_id = doc.find('i', ).get(data-color='red'
    fighters = doc.find_all('div', class_='b-fight-details__person')

    #get the ID of both fighters
    fighter_1_id_href = fighters[0].find('a', class_='b-link b-fight-details__person-link').get('href')
    fighter_1_id = urlparse(fighter_1_id_href).path.split('/')[-1]
    fighter_2_href = fighters[1].find('a', class_='b-link b-fight-details__person-link').get('href')
    fighter_2_id = urlparse(fighter_2_href).path.split('/')[-1]

    # if there's a clear winner/loser, assign the winning fighter id
    # (this is not always the case..like in a draw or no contest
    if result == "Win/Loss":
        if result_character == "W":
            winning_fighter_id = fighter_1_id
        else:
            winning_fighter_id = fighter_2_id
    else:
        winning_fighter_id = None

    bout_data = {
        'bout_id': bout_id,  # Primary Key
        'event_id': event_id,  # Foreign Key to events table
        'category': category,  # e.g., 'Lightweight Bout' or 'Welterweight Title Bout'
        'fighter_1_id': fighter_1_id,
        'fighter_2_id': fighter_2_id,
        'winning_fighter_id': winning_fighter_id,
        'result': result, # (could be 'Win/Loss', 'draw' or 'no contest', which is why this feild is necessary)
        'method': method,
        'ending_round': ending_round,
        'ending_time': ending_time,
        'time_format': time_format,
        'referee': referee,
        'details': details # 'Rear Naked Choke', Or... 'Derek Cleary 26 - 30. Junichiro Kamijo 26 - 30. Tony Weeks 26 - 30.', 
    }

    return bout_data


def event_page(hyperlink):
    result = requests.get(hyperlink)
    doc = BeautifulSoup(result.text, "html.parser")

    event_id = urlparse(hyperlink).path.split('/')[-1]  # Extract the last part of the URL
    name = search_by_class('b-content__title-highlight', doc)

    table_stats = doc.find_all('li', class_='b-list__box-list-item')
    date = table_stats[0].get_text(strip=True).split(':')[1].strip()
    formatted_date = convert_date_format_event(date)
    location = table_stats[1].get_text(strip=True).split(':')[1].strip()

    bout_order = []

    bouts_table = doc.find('tbody', class_='b-fight-details__table-body')
    bout_links = bouts_table.find_all('tr', class_='b-fight-details__table-row')

    # Find all bout ids in the event page, then add to the list
    for link in bout_links:
        bout_id = urlparse(link.get('data-link')).path.split('/')[-1]
        #push to bout_order list
        bout_order.append(bout_id)

    event_data = {
        'event_id': event_id,  # Primary Key
        'name': name,
        'date': formatted_date,
        'location': location,
        'bout_order': bout_order  # This will be filled later with bout IDs
    }

    return event_data