from html.parser import HTMLParser
from urllib import parse

class LinkFinder(HTMLParser):

    def __init__(self, base_url, page_url):
        super().__init__()
        self.base_url = base_url
        self.page_url = page_url
        self.links = set()  # use a set to avoid duplicate links

    # override the handle_starttag method to find links (by default it does nothing)
    def handle_starttag(self, tag, attrs):
        # print(tag)
        if tag == 'a': # anchor HTML tag
            for (attribute, value) in attrs:
                if attribute == 'href':
                    # sometimes we come across links in sites that are relative links, not full URLs
                    # so we need to convert them to absolute URLs
                    url = parse.urljoin(self.base_url, value)
                    self.links.add(url)
    
    def page_links(self):
        return self.links

    # required when inheriting from HTMLParser
    def error(self, message):
        print(f"Error parsing HTML: {message}")
        pass

# Example usage:
# 1. Make a new link finder (based on HTMLParser)
# finder = LinkFinder('http://example.com', 'http://example.com/page')
# 2. Feed it some HTML content
# finder.feed('<html><body><a href="http://example.com/another-page">Link</a></body></html>')
# 3. Get the links found
# links = finder.page_links()