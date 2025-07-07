import os

# Each website crawled should always be a separate folder/project
def create_project_dir(directory):
    # Create a project directory if it doesn't exist
    if not os.path.exists(directory):
        print('Creating project ' + directory)
        os.makedirs(directory)

# Create queue and crawled files (if not created)
def create_data_files(project_name, base_url):
    # The 'queue' is a list of URLs to be crawled
    queue = project_name + '/queue.txt'
    # 'crawled' is a list of URLs that have been crawled
    crawled = project_name + '/crawled.txt'

    # again check if files exist first, to avoid overwriting
    if not os.path.isfile(queue):
        write_file(queue, base_url) # if queue is empty, then there's no work to do
    if not os.path.isfile(crawled):
        write_file(crawled, '') # start with empty crawled file, and fill it

# Create a new file
def write_file(path, data):
    f = open(path, 'w') # write mode
    f.write(data)
    f.close() # avoid data leaks or errors

# Add data onto an existing file
def append_to_file(path, data):
    with open(path, 'a') as file: # append mode
        file.write(data + '\n')

# Delete the contents of a file
def delete_file_contents(path):
    with open(path, 'w'): # just open the file (overwrite it) in write mode to clear it
        pass # if you include nothing in this function, we get an error


# Let's address the problem of writing files being slow.
# We could use variables, but if our crawler gets halted mid-job, we lose the work done.
# To get the best of both worlds, we can use sets to store URLs in memory, and then write them to files periodically.

# Read a file and convert each line to set items
def file_to_set(file_name):
    results = set()
    with open(file_name, 'rt') as f:  # 'rt' for read text mode
        for line in f:
            results.add(line.replace('\n', ''))  # when reading our file that's formatted for easy human reading, we strip any leading/trailing whitespace
    return results

# Iterate thru the set, each item is a line in the file
def set_to_file(links, file):
    delete_file_contents(file)  # clear the file first, all the data up this point is old data
    for link in sorted(links):
        append_to_file(file, link)


# Example usage:
# create_data_files('example_project', 'http://ufcstats.com/')
