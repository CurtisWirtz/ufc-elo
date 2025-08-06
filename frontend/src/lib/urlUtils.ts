/**
 * Extracts the 'page' query parameter as a number from a given URL string.
 *
 * @param url A URL string (e.g., "http://127.0.0.1:8000/api/events/?page=2").
 * @returns The page number as a number, or undefined if not found or invalid.
 */
export function getPageParamFromUrl(url: string | null): number | undefined {
  if (!url) {
    return undefined;
  }
  try {
    const urlObj = new URL(url);
    const page = urlObj.searchParams.get('page');
    // Return page as number, or 1 if no page param (default first page)
    return page ? parseInt(page, 10) : 1;
  } catch (e) {
    console.error("Invalid URL for page param extraction:", url, e);
    return undefined;
  }
}

/**
 * Constructs a full API URL for events based on a page number.
 *
 * @param page The page number.
 * @returns The API URL string (e.g., "/api/events/?page=2").
 */
export function constructItemsApiUrl(page: number | undefined, collection: string | undefined): string {
    // If page is undefined or 1, fetch the base URL (first page).
    // Otherwise, construct the URL with the page query parameter.
    return page && page > 1 ? `/api/${collection}/?page=${page}` : `/api/${collection}/`;
}