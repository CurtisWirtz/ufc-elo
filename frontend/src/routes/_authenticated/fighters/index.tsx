import { Link, createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PaginatedResponse } from '../../../api/queries.ts';
import { getItems } from '../../../api/queries.ts';
import type { Fighter } from '../../../types/fighter.types.ts';
import { calculateAge, formatDate } from '../../../lib/dateUtils.ts';
import { getPageParamFromUrl, constructItemsApiUrl } from '../../../lib/urlUtils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute('/_authenticated/fighters/')({
  component: FightersIndex,
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
    const apiUrl = constructItemsApiUrl(currentPage, "fighters");

    // The queryKey MUST include the specific URL to ensure unique caching per page
    return queryClient.ensureQueryData({
      queryKey: ['fighters', apiUrl], // Dynamic query key: ['fighters', '/api/fighters/?page=X']
      queryFn: () => getItems(apiUrl), // pass the constructed URL to fetch specific page
      staleTime: 1000 * 60 * 5, // add cache stale time... refresh after 5 mins
    });
  },
  pendingComponent: () => <div className="flex justify-center w-full my-20 text-4xl">Loading...</div>,
  errorComponent: () => <div className="flex justify-center w-full my-20 text-4xl">Error fetching fighters</div>,
});


function FightersIndex() {
  const { page: currentPage } = Route.useSearch();
  const currentApiUrl = constructItemsApiUrl(currentPage, "fighters");

  const { data: axiosResponse } = useSuspenseQuery<PaginatedResponse, Error, PaginatedResponse, ['fighters', string]>({
    queryKey: ['fighters', currentApiUrl],
    queryFn: () => getItems(currentApiUrl),
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const fightersData = axiosResponse.data; // PaginatedFightersResponse object //remove a .data ...other wise it's fighters.data.data
  // console.log('DEBUG: FightersData in component (after axiosResponse.data):', fightersData);

  const fighters = fightersData.results || []; // 'fighters' is finally the array of Fighter objects
  // console.log('DEBUG: Filtered fighters array (should contain results if API sent them):', fighters);

  // Calculate next and previous page numbers using the utility function
  const nextPageNumber = fightersData.next ? getPageParamFromUrl(fightersData.next) : undefined;
  const previousPageNumber = fightersData.previous ? getPageParamFromUrl(fightersData.previous) : undefined;

  // Improved pagination display!:
  // With a page size of 20 items, calculate the range of items displayed
  const pageSize = 20; // Assuming 20 items per page
  const totalFighters = fightersData.count;
  const totalPages = Math.ceil(totalFighters / pageSize);

  const startItem = (currentPage - 1) * pageSize + 1;
  // Ensure endItem does not exceed totalFighters if it's the last page
  const endItem = Math.min(currentPage * pageSize, totalFighters);

  console.log('fighters: ', fighters)

  return (
    <Section
      className={cn(
          "py-0! px-5! max-w-container mx-auto",
          "",
    )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs />
        <h1 className="animate-appear text-4xl font-bold mb-6">Fighters List</h1>
        <div className="w-full animate-appear p-6 rounded-md bg-brand/10">
          <div className="hidden md:grid md:grid-cols-7 tablet:grid-cols-8 border-b border-brand pb-3 gap-3">
            <div className="col-span-3 text-center text-brand text-2xl">Fighter Name</div>
            <div className="col-span-1 tablet:col-span-2 text-center text-brand text-2xl">Rating</div>
            <div className="col-span-1 text-center text-brand text-2xl">Record</div>
            <div className="col-span-1 text-center text-brand text-2xl">Weight</div>
            <div className="col-span-1 text-center text-brand text-2xl">Age</div>
          </div>
          <div>
            {fighters.length > 0 ? (
              fighters.map((fighter: Fighter) => {
                return (
                  <div key={fighter.fighter_id} className="md:grid md:grid-cols-7 tablet:grid-cols-8 py-5 tablet:py-3 border-b border-light-foreground last:border-0">
                    <div className="col-span-3 flex flex-col md:flex-row items-center">
                      <Button asChild variant="secondary" className="group">
                        <Link
                          to="/fighters/$fighterId"
                          params={{ fighterId: fighter.fighter_id }}
                          className="flex w-fit mx-auto md:w-full justify-center  text-[15px]"
                        >
                          {fighter.name}
                          {fighter.nickname && <span className="italic ml-2">"{fighter.nickname}"</span>}
                          <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                        </Link>
                      </Button>
                      <div className="md:hidden flex">
                        <div className="flex justify-center items-center col-span-1 md:col-span-2 whitespace-pre p-3 text-center text-2xl">
                          <span>{fighter.wins}-{fighter.losses}-{fighter.draws}</span>
                        </div>
                        <div className="col-span-1 tablet:col-span-2 whitespace-pre p-3 text-center text-lg flex items-center justify-center">
                          {fighter.weight_lb && <span>{fighter.weight_lb} lbs</span>}
                        </div>
                        <div className="col-span-1 whitespace-pre p-3 text-center flex flex-col">
                          {fighter.date_of_birth && (
                            <>
                              <span className="text-sm">{formatDate(fighter.date_of_birth)}</span>
                              <span className="text-sm">{calculateAge(fighter.date_of_birth)} years old</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="md:hidden flex">
                        <span className="mr-5">Rating: {Math.round(fighter.elo)}</span>
                        <span><span className="text-brand mr-2">Peak Rating:</span>{Math.round(fighter.peak_elo)}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex md:flex-col justify-center items-center col-span-1 tablet:col-span-2 whitespace-pre p-3 text-center ">
                      <span>{Math.round(fighter.elo)}</span>
                      <span><span className="text-brand mr-2">Peak:</span>{Math.round(fighter.peak_elo)}</span>
                    </div>
                    <div className="hidden md:flex justify-center items-center col-span-1 whitespace-pre p-3 text-center lg:text-2xl">
                      <span>{fighter.wins}-{fighter.losses}-{fighter.draws}</span>
                    </div>
                    <div className="hidden md:flex col-span-1 whitespace-pre p-3 text-center text-lg  items-center justify-center">
                      {fighter.weight_lb && <span>{fighter.weight_lb} lbs</span>}
                    </div>
                    <div className="hidden md:flex col-span-1 whitespace-pre p-3 text-center  flex-col">
                      {fighter.date_of_birth && (
                        <>
                          <span className="text-sm">{formatDate(fighter.date_of_birth)}</span>
                          <span className="text-sm">{calculateAge(fighter.date_of_birth)} years old</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center">
                No fighters found.
              </div>
            )}
          </div>
        </div>


        {/* Pagination Controls */}
        {totalFighters > 0 && ( // if there are fighters...
          <div className="animate-appear flex flex-col items-center mt-6">
            {/* Items Counter */}
            <div className="text-lg text-brand font-medium mb-5">
              Displaying {startItem} - {endItem} of {totalFighters} fighters
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