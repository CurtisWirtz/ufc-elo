# ufc-elo
###### Collecting, aggregating, and displaying fight, bout, and event data from the Ultimate Fighting Championship (UFC).

This started with the goal of assigning ELO ratings to every UFC fighter on the roster throughout the history of the company, exclusively based on their performances in the UFC. ELO is the rating system that was devised for chess ranking and match making. 

However, the scraped dataset grew to include all MMA promotions owned by Zuffa LLC (and now TKO Group Holdings); including the WEC, PRIDE FC, DWCS, KOTC, and a few other defunct fight promotions. 

I began to enjoy whetting my Django, PostgreSQL, DRF, and React skills, incrementally mounting a frontend interface to serve as a fight encyclopedia. Mostly, I use it to look up a fighters, bouts, or events for outcome prediction, avoiding sluggish MMA stats sites that are bogged down by the number of ads and popups that fill up my screen.

## What's all here?

###### I began with data collection, then worked towards an interactive visual representation:

### 1. Crawler: (Python)
_**Locates web addresses where Fighter, Bout, and Event data exists on UFCStats.com.**_ 

I wrote a Python script that utilizes 8 threads/workers to automatically navigate thru and find the URL to every page on UFCStats.com. Built similarly to [Bucky Robert's open source web crawler](https://github.com/buckyroberts/Spider), but made specific to my needs. 

It generates a `.txt` file that contains every navigable hyperlink on that website.


### 2. Scraper: (Python, BeautifulSoup4)
_**A means to collect a full dataset about every Fighter, Bout, and Event in UFC history.**_ 

Using Python, I iterated thru the list of hyperlinks discovered by my the crawler in step 1. 

Every link is visited using the Python `requests` package, where `BeautifulSoup4` locates the desired data fields from HTML elements matching specific CSS selectors. The data collected from each page is compiled inside its own Python list, converted to a JSON object, then appended to its respective JSON file ( `fighters`, `events`, and `bouts` each generate their own file).


### 3. Data Ingestion: (Django, Python, PostgreSQL)
_**Taking the raw JSON data and migrating it into a PostgreSQL database that's attached to a Django backend.**_

I setup a Django backend and connected it to a PostgreSQL database. I prototyped and migrated the database models for `Fighter`, `Event`, and `Bout`, then wrote a loading script that runs a batch operation from the django CLI to create a table record for every object inside the JSON files created in step 2.

`python manage.py load_json_data json_data/events.json json_data/fighters.json json_data/bouts.json`

`load_json_data` is the Command file name, with three following *args, which are paths to the JSON files to ingest.


### 4. REST API:
TODO:


Build an interactive visual representation:
4. Django backend with REST API Building using Django RESTful Framework: nginx (webserver), gunicorn (pre-forker), whitenoise (static file server), Redis for caching
5. Frontend representation: Tailwind, ShadCN, Typescript, React, react-router, Tanstack Query, Axios, react-hook-form
