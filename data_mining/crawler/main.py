import threading
from queue import Queue
from spider import Spider
from domain import *
from general import *

PROJECT_NAME = 'ufcstats' # constant, so the convention is we CAPITALIZE
HOMEPAGE = 'http://ufcstats.com/'
DOMAIN_NAME = get_domain_name(HOMEPAGE)
QUEUE_FILE = PROJECT_NAME + '/queue.txt'
CRAWLED_FILE = PROJECT_NAME + '/crawled.txt'
NUMBER_OF_THREADS = 8  # how many threads we want to run in parallel

queue = Queue()  # create a queue to hold the URLs to be crawled
Spider(PROJECT_NAME, HOMEPAGE, DOMAIN_NAME)  # create a new Spider instance

# Create worker threads (will die when the main program exits)
def create_workers():
    for _ in range(NUMBER_OF_THREADS): # variable is _ to indicate we don't use it
        t = threading.Thread(target=work)  # create a thread that will run the work
        t.daemon = True  # this means the thread will exit when the main program exits
        t.start()  # start the thread

# Do the next job in the queue (if there is one)
def work():
    while True:  # keep running until the program exits
        url = queue.get()  # get the next item/URL from the queue
        Spider.crawl_page(threading.current_thread().name, url)  # crawl the page using the current thread's name
        queue.task_done()  # mark the job as done

# Each queued link is a new job for a thread
def create_jobs():
    for link in file_to_set(QUEUE_FILE):
        queue.put(link)
    queue.join()
    crawl()

# Check if there are items in the queue, if so, crawl them
def crawl():
    queued_links = file_to_set(QUEUE_FILE)  # get the links from the queue file
    # how can we tell if there are items to be crawled? test for length of the queue
    if len(queued_links) > 0:
        print(str(len(queued_links)) + ' links in the queue')
        create_jobs()

create_workers() # create the worker threads
crawl()  # start the crawling process