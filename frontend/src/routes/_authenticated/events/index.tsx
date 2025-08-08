import { Link, createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PaginatedResponse } from '../../../api/queries.ts';
import { getItems } from '../../../api/queries.ts';
import type { Event } from '../../../types/event.types.ts';
import { formatDate, isFutureDate } from '../../../lib/dateUtils.ts';
import { getPageParamFromUrl, constructItemsApiUrl } from '../../../lib/urlUtils.ts';

import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button.tsx';
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute('/_authenticated/events/')({
  component: EventsIndex,
  validateSearch: (rawSearch: Record<string, unknown>): { page: number } => {
    // ensure rawSearch is an object (or empty object if undefined/null) - utilizing tanstack router search for pagination
    // this is a safeguard to ensure we always return an object with a 'page' property
    // if rawSearch is not an object, we default to an empty object
    // this allows us to safely access properties like rawSearch.page without TypeErrors
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
    const apiUrl = constructItemsApiUrl(currentPage, "events");
    
    // The queryKey MUST include the specific URL to ensure unique caching per page
    return queryClient.ensureQueryData({
      queryKey: ['events', apiUrl], // Dynamic query key: ['events', '/api/events/?page=X']
      queryFn: () => getItems(apiUrl), // pass the constructed URL to fetch specific page
      staleTime: 1000 * 60 * 5, // add cache stale time... refresh after 5 mins
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching events</div>,
});


function EventsIndex() {
  const { page: currentPage } = Route.useSearch();
  const currentApiUrl = constructItemsApiUrl(currentPage, "events");

  const { data: axiosResponse } = useSuspenseQuery<PaginatedResponse, Error, PaginatedResponse, ['events', string]>({
    queryKey: ['events', currentApiUrl],
    queryFn: () => getItems(currentApiUrl),
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const eventsData = axiosResponse.data; // PaginatedResponse object //removes a .data nested layer ...other wise it's events.data.data
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
  <Section
    className={cn(
        "py-0! px-5! max-w-container mx-auto",
        "",
    )}
    >
    <div className="bg-background w-full mt-6 items-center min-h-screen">
      <Breadcrumbs />
      <h1 className="text-4xl font-bold mb-6">Events List</h1>
      <div className="w-full">
        <div className="hidden tablet:grid tablet:grid-cols-6 border-b border-brand pb-3 gap-3">
          <div className="tablet:col-span-3 xl:col-span-2 text-center text-brand text-2xl">Event Name</div>
          <div className="tablet:col-span-1 xl:col-span-2 text-center text-brand text-2xl">Date</div>
          <div className="tablet:col-span-2 xl:col-span-2 text-center text-brand text-2xl">Location</div>
        </div>
        <div className="flex flex-col">
          {events.length > 0 ? (
            events.map((event: Event) => {
              return (
                <div key={event.event_id} className="tablet:grid tablet:grid-cols-6 py-5 tablet:py-3 border-b last:border-0">
                  <div className="tablet:col-span-3 xl:col-span-2 flex flex-col tablet:items-center tablet:justify-center">
                    <Button asChild>
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: event.event_id }}
                        className="flex tablet:w-full tablet:justify-center px-2 order-2"
                      >
                        {event.name}
                      </Link>
                    </Button>
                    <div className="flex tablet:hidden justify-center order-1 pb-2">
                      {isFutureDate(event.date) && <span className="text-brand font-semibold mr-2">Upcoming: </span>}
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex tablet:hidden order-3 pt-2 justify-center">
                      {event.location}
                    </div>
                  </div>
                  <div className="tablet:col-span-1 xl:col-span-2 hidden tablet:flex tablet:flex-col justify-center items-center md:whitespace-pre ">
                    {/* Keep the upcoming indicator, but let all events render */}
                    {isFutureDate(event.date) && <span className="text-brand font-semibold">Upcoming: </span>}
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="tablet:col-span-2 xl:col-span-2 hidden tablet:flex tablet:justify-center md:whitespace-pre p-3 md:text-center">
                    {event.location}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center">
              No events found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalEvents > 0 && ( // if there are events...
        <div className="flex flex-col items-center mt-6">
          {/* Items Counter */}
          <div className="text-lg text-brand font-medium mb-5">
            Displaying {startItem} - {endItem} of {totalEvents} events
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center">
            {/* First Page Link */}
            {currentPage > 1 && totalPages > 1 ? (
              <Button asChild>
                <Link
                  to="."
                  search={{ page: 1 }}
                >
                  {`<<`}
                </Link>
              </Button>
            ) : (
              <Button className="cursor-not-allowed opacity-50 mr-2">
                {`<<`}
              </Button>
            )}

            {/* Previous Page Link */}
            {previousPageNumber !== undefined ? (
              <Button asChild>
                <Link
                  to="."
                  search={{ page: previousPageNumber }}
                  className="ml-2"
                >
                  {`<`}
                </Link>
              </Button>
            ) : (
              <Button className="cursor-not-allowed opacity-50">
                {`<`}
              </Button>
            )}

            {/* Current Page Indicator */}
            <span className="text-lg font-medium mx-4">Page {currentPage} of {totalPages}</span>

            {/* Next Page Link */}
            {nextPageNumber !== undefined ? (
              <Button asChild>
                <Link
                  to="."
                  search={{ page: nextPageNumber }}
                  className="mr-2"
                >
                  {`>`}
                </Link>
              </Button>
            ) : (
              <Button asChild>
                {`>`}
              </Button>
            )}

            {/* Last Page Link */}
            {currentPage < totalPages && totalPages > 1 ? (
              <Button asChild>
                <Link
                  to="."
                  search={{ page: totalPages }}
                >
                  {`>>`}
                </Link>
              </Button>
            ) : (
              <Button asChild>
                {`>>`}
              </Button>
            )}
          </div>
        </div>
      )}
      
    </div>
  </Section>
  );
}