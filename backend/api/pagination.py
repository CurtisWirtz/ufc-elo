from rest_framework.pagination import PageNumberPagination

class TwentyItemsPagination(PageNumberPagination): # Changed class name
    page_size = 20
    # page_size_query_param = 'page_size' # Allows client to specify page size (e.g., ?page_size=10)
    max_page_size = 100 # Maximum page size allowed if client requests more