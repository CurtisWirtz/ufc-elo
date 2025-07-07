from urllib.request import urlopen
from link_finder import LinkFinder
from general import *

class Spider: 
    
    # Class Variables - shared by all instances of the class
    project_name = ''
    base_url = ''
    domain_name = ''
    queue_file = ''
    crawled_file = ''
    queue = set()
    crawled = set()

    def __init__(self, project_name, base_url, domain_name): # instance vars
        Spider.project_name = project_name
        Spider.base_url = base_url
        Spider.domain_name = domain_name
        Spider.queue_file = project_name + '/queue.txt'
        Spider.crawled_file = project_name + '/crawled.txt'
        self.boot()
        self.crawl_page('First spider', Spider.base_url)

    @staticmethod # decorator to indicate that this method does not depend on instance variables, but rather the Class variables that we defined
    def boot():
        # The first spider we dispatch has one unique job: to check for / create the project directory and files
        create_project_dir(Spider.project_name)
        create_data_files(Spider.project_name, Spider.base_url)
        Spider.queue = file_to_set(Spider.queue_file)
        Spider.crawled = file_to_set(Spider.crawled_file)

    @staticmethod
    def crawl_page(thread_name, page_url): # when we crawl a page, let's also print out what tasks are being worked on, so our console isn't completely inert/silent while running our crawler
        if page_url not in Spider.crawled: # make sure we didn't already crawl this page, use the crawl SET, not FILE
            print(thread_name + ' now crawling ' + page_url)
            print('Queue ' + str(len(Spider.queue)) + ' | Crawled ' + str(len(Spider.crawled)))
            Spider.add_links_to_queue(Spider.gather_links(page_url)) # add the list of links to the list that all Spiders can see
            Spider.queue.remove(page_url)
            Spider.crawled.add(page_url)
            Spider.update_files() # update the files with the new queue and crawled sets

    @staticmethod
    def gather_links(page_url):
        html_string = ''
        try: # whenever doing networking or server operations in python, try/except is best to handle exceptions instead of our program erroring out
            response = urlopen(page_url) # open the URL and get the response
            if response.getheader('Content-Type') == 'text/html;charset=utf-8': # make we're connected to an HTML page, not an executable or something else
                html_bytes = response.read() # convert the complex computer format to a string
                html_string = html_bytes.decode("utf-8")
            finder = LinkFinder(Spider.base_url, page_url)
            finder.feed(html_string) # feed the HTML string to our LinkFinder
        except: # Most likely: the page doesn't exist, is unreachable, or Maybe.. we got booted from site because the site doesn't allow crawling or you crawled too fast
            print('Error: Could not crawl page ' + page_url)
            return set() # return empty set ... there were no links to add to the queue
        return finder.page_links()
    
    @staticmethod
    def add_links_to_queue(links):
        for url in links:
            # instead of just pushing them in the queue, we check if they're already there and make sure they're not on the crawled list
            if url in Spider.queue:
                continue
            if url in Spider.crawled:
                continue
            if Spider.domain_name not in url: # make sure the URL is part of the domain we're crawling, so we don't accidentally crawl an external site
                continue
            Spider.queue.add(url)

    @staticmethod
    def update_files():
        set_to_file(Spider.queue, Spider.queue_file) # (set we're working with, set we're saving to)
        set_to_file(Spider.crawled, Spider.crawled_file) 