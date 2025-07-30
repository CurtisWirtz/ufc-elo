import { Link, createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PaginatedEventsResponse } from '../../../api/queries.ts';
import { getEvents } from '../../../api/queries.ts';
import type { Event } from '../../../types/event.types.ts';
import { formatDate, isFutureDate } from '../../../utils/dateUtils.ts';
import { getPageParamFromUrl, constructEventsApiUrl } from '../../../utils/urlUtils.ts';

export const Route = createFileRoute('/_authenticated/events/')({
  component: EventsIndex,
  validateSearch: (rawSearch: Record<string, unknown>): { page: number } => {
    // ensure rawSearch is an object (or empty object if undefined/null)
    const actualSearch = rawSearch && typeof rawSearch === 'object' ? rawSearch : {};

    let pageNumber: number;
    const pageParam = actualSearch.page;

    // Safely parse page number, defaulting to 1 if invalid
    if (typeof pageParam === 'string' || typeof pageParam === 'number') {
      pageNumber = Number(pageParam);
      if (isNaN(pageNumber) || pageNumber < 1) {
        pageNumber = 1;
      }
    } else {
      pageNumber = 1;
    }
    return { page: pageNumber }; // Always return an object with a valid 'page' number
  },
  loader: async ({ context: { queryClient }, search }) => {
    // (search?.page ?? 1) will provide a fallback if search equates to falsy
    const currentPage = (search?.page ?? 1);

    // construct the API URL based on the current page
    const apiUrl = constructEventsApiUrl(currentPage);
    
    // The queryKey MUST include the specific URL to ensure unique caching per page
    return queryClient.ensureQueryData({
      queryKey: ['events', apiUrl], // Dynamic query key: ['events', '/api/events/?page=X']
      queryFn: () => getEvents(apiUrl), // pass the constructed URL to fetch specific page
      staleTime: 1000 * 60 * 5, // add cache stale time... refresh after 5 mins
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching events</div>,
});


function EventsIndex() {
  const { page: currentPage } = Route.useSearch();
  const currentApiUrl = constructEventsApiUrl(currentPage);

  const { data: axiosResponse } = useSuspenseQuery<PaginatedEventsResponse, Error, PaginatedEventsResponse, ['events', string]>({
    queryKey: ['events', currentApiUrl],
    queryFn: () => getEvents(currentApiUrl),
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const eventsData = axiosResponse.data; // PaginatedEventsResponse object //remove a .data ...other wise it's events.data.data
  // console.log('DEBUG: EventsData in component (after axiosResponse.data):', eventsData);

  const events = eventsData.results || []; // 'events' is finally the array of Event objects
  // console.log('DEBUG: Filtered events array (should contain results if API sent them):', events);

  // Calculate next and previous page numbers using the utility function
  const nextPageNumber = eventsData.next ? getPageParamFromUrl(eventsData.next) : undefined;
  const previousPageNumber = eventsData.previous ? getPageParamFromUrl(eventsData.previous) : undefined;

  // Improved pagination display!:
  // With a page size of 20 items, calculate the range of items displayed
  const pageSize = 20; // Assuming 20 items per page
  const totalEvents = eventsData.count;
  const totalPages = Math.ceil(totalEvents / pageSize);

  const startItem = (currentPage - 1) * pageSize + 1;
  // Ensure endItem does not exceed totalEvents if it's the last page
  const endItem = Math.min(currentPage * pageSize, totalEvents);

  return (
    <div className="w-full mt-2 items-center bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Events List</h1>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Event Name</th>
            <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Date</th>
            <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Location</th>
          </tr>
        </thead>
        <tbody>
          {events.length > 0 ? (
            events.map((event: Event) => {
              return (
                <tr key={event.event_id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className='p-3'>
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: event.event_id }}
                      className="text-blue-500 hover:underline flex w-full justify-start"
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td className="whitespace-pre p-3 flex flex-col items-center">
                    {/* Keep the upcoming indicator, but let all events render */}
                    {isFutureDate(event.date) && <span className="text-red-500 font-semibold text-xs mb-1">Upcoming: </span>}
                    <span>{formatDate(event.date)}</span>
                  </td>
                  <td className="whitespace-pre p-3 text-center">
                    {event.location}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="p-3 text-center text-gray-500">
                No upcoming events found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalEvents > 0 && ( // if there are events...
        <div className="flex flex-col items-center mt-6 space-y-4">
          {/* Items Counter */}
          <div className="text-lg font-medium text-gray-700">
            Displaying {startItem} - {endItem} of {totalEvents} events
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center space-x-4 items-center">
            {/* First Page Link */}
            {currentPage > 1 && totalPages > 1 ? (
              <Link
                to="."
                search={{ page: 1 }}
                className="text-blue-600 hover:underline px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50 text-sm"
              >
                {`<< First`}
              </Link>
            ) : (
              <span className="text-gray-400 px-3 py-1 border border-gray-400 rounded-md cursor-not-allowed text-sm">{`<< First`}</span>
            )}

            {/* Previous Page Link */}
            {previousPageNumber !== undefined ? (
              <Link
                to="."
                search={{ page: previousPageNumber }}
                className="text-blue-600 hover:underline px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50 text-sm"
              >
                {`< Prev`}
              </Link>
            ) : (
              <span className="text-gray-400 px-3 py-1 border border-gray-400 rounded-md cursor-not-allowed text-sm">{`< Prev`}</span>
            )}

            {/* Current Page Indicator */}
            <span className="text-lg font-medium text-gray-700 mx-2">Page {currentPage} of {totalPages}</span>

            {/* Next Page Link */}
            {nextPageNumber !== undefined ? (
              <Link
                to="."
                search={{ page: nextPageNumber }}
                className="text-blue-600 hover:underline px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50 text-sm"
              >
                {`Next >`}
              </Link>
            ) : (
              <span className="text-gray-400 px-3 py-1 border border-gray-400 rounded-md cursor-not-allowed text-sm">{`Next >`}</span>
            )}    

            {/* Last Page Link */}
            {currentPage < totalPages && totalPages > 1 ? (
              <Link
                to="."
                search={{ page: totalPages }}
                className="text-blue-600 hover:underline px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50 text-sm"
              >
                {`Last >>`}
              </Link>
            ) : (
              <span className="text-gray-400 px-3 py-1 border border-gray-400 rounded-md cursor-not-allowed text-sm">{`Last >>`}</span>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}