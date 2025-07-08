from datetime import datetime

# These date formatting functions convert date strings from specific formats to "yyyy-mm-dd" format, which is what PostgreSQL prefers

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
# date_str1 = "Oct 31, 1988"
# converted_date1 = convert_date_format_dob(date_str1)
# print(converted_date1)  # Output: 1988-10-31


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
# date_str2 = "December 13, 2006"
# converted_date2 = convert_date_format_event(date_str2)
# print(converted_date2)  # Output: 2006-12-13

# Avoid putting single and double quotations marks (for feet and inches) inside the DB, 
# just convert everything to inches
def convert_height_to_inches(height_string):
    """
    Converts a height string in "feet'inches\"" format (e.g., "5'10\"") to inches.
    """
    if not height_string:
        return None
    feet, inches = map(int, height_string.replace('"', '').split("'"))
    total_inches = (feet * 12) + inches
    return total_inches