# The web crawler I wrote resulted in a bunch of duplicate hyperlinks and paginated indexes when crawling the UFCStats.com website. But, it did its' job...
# Instead of refining my crawler and running it again (which would take far longer), I'm going to remove the superfluous hyperlinks from my dataset using a simple Python script.
# I'll use a set() to store unique hyperlinks ( O(1) constant time - complexity - linear ) and then write them back to a file. Sets cannot have duplicates.
# The dataset is only ~4MB, so further optimization isn't a worth time investment to reach my goal here. The whole process takes like 2 seconds to run

# So... Quickly removing duplicate and irrelevant hyperlinks!

import os
import logging

# Setup for logger
log_file = "scrubber.log"
logging.basicConfig(
    level=logging.DEBUG, # Set to DEBUG to see individual duplicate logs
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def append_to_file(path, data):
    with open(path, 'a') as file: # append mode
        file.write(data + '\n') # write each item to text file on a new line

def data_scrubber():
    source_file_path = 'dirty_dataset.txt'
    destination_file_path = 'clean_dataset.txt'

    # Read the source file and convert it to a set
    unique_links = set()
    # Keep track of how many hyperlinks we have in the source file
    items_in_source_file = 0

    # write the source file to a set, which will remove duplicates
    with open(source_file_path, 'rt') as f:  # 'rt' for read text mode
        for line in f:
            unique_links.add(line.replace('\n', ''))  # when reading our file that's formatted for easy human reading, we strip any leading/trailing whitespace
            items_in_source_file += 1

    # Log the number of duplicate links were removed
    lines_removed = items_in_source_file - len(unique_links)
    logger.info(f"Removed {lines_removed} duplicate links.")

    # create the destination file if it doesn't exist
    if not os.path.isfile(destination_file_path):
        f = open(destination_file_path, 'w') # write mode
        f.close()

    # Write the useful links back to new file
    for link in unique_links:
        if 'statistic' in link or '?' in link:
            print("The string contains a '?' character. Ejected!")
            logger.debug(f"Rejected item: '{link}'")
        else:
            # data is useful, so write it to the destination file
            append_to_file(destination_file_path, link)
        
    print(f"Removed duplicates and paginated index pages. Useful links written to {destination_file_path}")

# Run the function to remove duplicates and paginated pages
data_scrubber()