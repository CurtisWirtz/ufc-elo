/**
 * Formats a date string from "YYYY-MM-DD" to "Mon. Dth, YYYY" (e.g., "Dec. 19th, 2005").
 *
 * @param dateString The date string in "YYYY-MM-DD" format.
 * @returns The formatted date string, or an empty string if the input is invalid.
 */
export function formatDate(dateString: string): string { // Export the function
    if (!dateString) {
        return '';
    }

    // Parse the YYYY-MM-DD string into a Date object
    // Using UTC to avoid timezone issues affecting the date
    const date = new Date(dateString + 'T00:00:00Z'); // Append T00:00:00Z to ensure UTC interpretation

    // Check for invalid date
    if (isNaN(date.getTime())) {
        console.error("Invalid date string provided:", dateString);
        return '';
    }

    const monthNames = [
        "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
    ];

    const month = monthNames[date.getUTCMonth()]; // Use getUTCMonth for UTC date
    const day = date.getUTCDate(); // Use getUTCDate for UTC date
    const year = date.getUTCFullYear(); // Use getUTCFullYear for UTC date

    // Function to get the day suffix (st, nd, rd, th)
    const getDaySuffix = (d: number): string => {
        if (d > 3 && d < 21) return 'th'; // Handles 11th, 12th, 13th
        switch (d % 10) {
            case 1:  return 'st';
            case 2:  return 'nd';
            case 3:  return 'rd';
            default: return 'th';
        }
    };

    return `${month} ${day}${getDaySuffix(day)}, ${year}`;
}

/**
 * Checks if a given date string (YYYY-MM-DD) is in the future.
 * "In the future" means strictly after today's date, ignoring time.
 *
 * @param dateString The date to check, in "YYYY-MM-DD" format.
 * @returns true if the date is in the future, false otherwise (including today or past dates, or invalid dates).
 */
export function isFutureDate(dateString: string): boolean {
    if (!dateString) {
        return false;
    }

    // Get today's date and normalize it to the start of the day (00:00:00)
    // This ensures accurate comparison regardless of the current time.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to 00:00:00 local time

    // Parse the input date string.
    // Appending 'T00:00:00Z' is a robust way to parse YYYY-MM-DD strings
    // as UTC midnight, which helps avoid timezone-related issues that might
    // cause the date to shift if just `new Date(dateString)` is used in certain timezones.
    const inputDate = new Date(dateString + 'T00:00:00Z');
    
    // Normalize the input date to the start of its day (UTC, as parsed)
    // This makes sure we are comparing day vs day.
    inputDate.setUTCHours(0, 0, 0, 0);


    // Check if the parsed date is valid
    if (isNaN(inputDate.getTime())) {
        console.warn(`isFutureDate: Invalid date string provided: "${dateString}"`);
        return false; // Invalid date is not in the future
    }

    // Compare the timestamps (milliseconds since epoch)
    // If inputDate's timestamp is greater than today's timestamp, it's in the future.
    return inputDate.getTime() > today.getTime();
}

