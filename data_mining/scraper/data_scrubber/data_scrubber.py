# A few data fields on each bout object are not exactly what I want. 
# Instead of scraping the site again, writing a quick script to fix malformed data.

#Bouts:
# 1. 'method' field: remove 'Method:' prefix
# 2. allow/force nullable 'details' field for empty strings
# 3. 'details' field: spacing on decision scorecards were stripped out between judge names and scores
#    (e.g. "Greg Jackson29 - 28. David Therien28 - 30 etc
# 4. 'details' field: remove \n, strip whitespace surrounding the line breaks and change it to a hyphen

import json
import re

input_file = 'dirty_data.json'
output_file = 'bouts.json'


def scrub_data(input_file, output_file):
    with open(input_file, 'r') as f:
        bouts = json.load(f)

    for bout in bouts:
        print(bout['bout_id'])

        if bout['method']: # remember, future bouts will not have this info
            # fix 1. remove 'Method:' prefix from the 'method' field
            bout['method'] = bout['method'][7:]

        # fix 3. details field formatting
        if bout['details'] == "":
            bout['details'] = None

        elif bout['details']: 
            # Remove the newline characters and strip whitespace
            details_dirty = bout['details']
            linebreaks_removed = details_dirty.replace('\n', '') # pull out linebreaks
            # use regex to find anywhere there are multiple spaces and replace them with a hyphen surrounded by single spaces
            multiple_spaces_removed = re.sub(r'\s{2,}', ' - ', linebreaks_removed.strip())
            # add a space btween a jude's name and the scorecard. regex finds where a lowercase character sits before an integer
            spacing_fixed_on_judges_scorecards = re.sub(r'([a-z])(\d)', r'\1 \2', multiple_spaces_removed) # using two capture groups.. \1 and ]2

            bout['details'] = spacing_fixed_on_judges_scorecards

    with open(output_file, 'w') as f:
        json.dump(bouts, f, indent=4)
    print(f"Scrubbed data written to {output_file}")

scrub_data(input_file, output_file)
