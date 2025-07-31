import { Link, createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PaginatedResponse } from '../../../api/queries.ts';
import { getItems } from '../../../api/queries.ts';
import type { Fighter } from '../../../types/fighter.types.ts';
import { formatDate } from '../../../utils/dateUtils.ts';
import { getPageParamFromUrl, constructItemsApiUrl } from '../../../utils/urlUtils.ts';

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
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching fighters</div>,
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

  return (
    <div className="w-full mt-2 items-center bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Fighters List</h1>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Fighter Name</th>
            <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Weight</th>
            <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Record</th>
            <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">DOB</th>
          </tr>
        </thead>
        <tbody>
          {fighters.length > 0 ? (
            fighters.map((fighter: Fighter) => {
              return (
                <tr key={fighter.fighter_id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className='p-3'>
                    <Link
                      to="/fighters/$fighterId"
                      params={{ fighterId: fighter.fighter_id }}
                      className="text-blue-500 hover:underline flex w-full justify-start"
                    >
                      {fighter.name}{fighter.nickname && <span className="italic ml-2">"{fighter.nickname}"</span>}
                    </Link>
                  </td>
                  <td className="whitespace-pre p-3 text-center">
                    {fighter.weight_lb && <span>{fighter.weight_lb} lbs</span>}
                  </td>
                  <td className="whitespace-pre p-3 text-center">
                    <span>{fighter.wins}-{fighter.losses}-{fighter.draws}</span>
                  </td>
                  <td className="whitespace-pre p-3 text-center">
                    {fighter.date_of_birth && <span className="text-gray-700">{formatDate(fighter.date_of_birth)}</span>}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="p-3 text-center text-gray-500">
                No fighters found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalFighters > 0 && ( // if there are fighters...
        <div className="flex flex-col items-center mt-6 space-y-4">
          {/* Items Counter */}
          <div className="text-lg font-medium text-gray-700">
            Displaying {startItem} - {endItem} of {totalFighters} fighters
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