# ufc-elo
###### Collecting, aggregating, and displaying fight, bout, and event data from the Ultimate Fighting Championship (UFC).

Pet project that assigns ELO ratings to every UFC fighter on the roster throughouts the history of the company, exclusively based on their performances in the UFC. ELO is the rating system that was devised for chess ranking and match making. 

I also use this program as an explorer when I want to look up a fighter, bout, or event.  outcome prediction, I am also not very pleased with sluggish MMA stats sites that are bogged down by the number of ads and popups that fill up my screen.

## What's in this project?

###### I began with data collection, then worked towards an interactive visual representation. Steps in order.

### 1. Crawler: (Python)
_**Locates web addresses where Fighter, Bout, and Event data exists on UFCStats.com.**_ 

I wrote a Python script that utilizes 8 threads/workers to automatically navigate thru and find the URL to every page on a targeted website. It generates a `.txt` file that contains every navigable hyperlink on that website.

Built similarly to [Bucky Robert's open source web crawler](https://github.com/buckyroberts/Spider), but made specific to my needs. 


### 2. Scraper: (Python, BeautifulSoup4)
_**A means to collect a full data set about every Fighter, Bout, and Event in UFC history.**_ 

Inside a Python script, I iterate thru the list of hyperlinks discovered by my the crawler in step 1. 

Every link is visited using the Python `requests` package, where `BeautifulSoup4` targets HTML elements with specific CSS selectors to find the desired data. The data collected from each page is compiled inside its own Python list, which is then serialized to a JSON object and appended to its respective JSON file ( `fighters`, `events`, and `bouts` each generate their own file).

TODO:
3. Data Ingestion: to PostgreSQL Database
Build an interactive visual representation:
4. Django backend with REST API Building using Django RESTful Framework: nginx (webserver), gunicorn (pre-forker), whitenoise (static file server), Redis for caching
5. Frontend representation: Tailwind, ShadCN, Typescript, React, react-router, Tanstack Query, Axios, react-hook-form
