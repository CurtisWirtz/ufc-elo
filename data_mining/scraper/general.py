from datetime import datetime

# These date functions

def convert_date_format_dob(date_string):
  """
  Converts a date string in "Month_abbreviated Day, Year" format 
  (e.g., "Oct 31, 1988") to "yyyy-mm-dd" format.
  """
  # Parse the input string into a datetime object
  date_object = datetime.strptime(date_string, "%b %d, %Y")
  # Format the datetime object as "yyyy-mm-dd"
  formatted_date = date_object.strftime("%Y-%m-%d")
  return formatted_date

# Example usage:
date_str1 = "Oct 31, 1988"
converted_date1 = convert_date_format_dob(date_str1)


def convert_date_format_event(date_string):
  """
  Converts a date string in "Month_full Day, Year" format 
  (e.g., "December 13, 2006") to "yyyy-mm-dd" format.
  """
  # Parse the input string into a datetime object
  date_object = datetime.strptime(date_string, "%B %d, %Y")
  # Format the datetime object as "yyyy-mm-dd"
  formatted_date = date_object.strftime("%Y-%m-%d")
  return formatted_date

# Example usage:
date_str2 = "December 13, 2006"
converted_date2 = convert_date_format_event(date_str2)
print(converted_date2)  # Output: 2006-12-13