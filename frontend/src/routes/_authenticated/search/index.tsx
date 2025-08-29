// @ts-nocheck
import { useEffect, useState } from 'react';
import { createFileRoute, useLocation, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/client.ts';
import { Button } from '@/components/ui/button';
import { formatDate } from '../../../lib/dateUtils.ts'

interface FighterResult {
  type: 'fighter';
  fighter_id: string;
  name: string;
  nickname?: string;
  weight_lb?: number;
  wins: number;
  losses: number;
  draws?: string;
}

interface EventResult {
  type: 'event';
  event_id: string;
  name: string;
  date: string;
  location: string;
}
type SearchResult = FighterResult | EventResult;

const fetchSearchResults = async (searchTerm: string): Promise<SearchResult[]> => {
  if (!searchTerm) {
    return [];
  }
  try {
    const response = await api.get(`/api/search/?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch search results:", error);
    throw new Error("Could not retrieve search results.");
  }
};


export const Route = createFileRoute('/_authenticated/search/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: search.q as string || '',
  }),
  component: SearchResultsPage,
});


function SearchResultsPage() {
  const { q } = Route.useSearch(); // 'q' from URL query parameters
  const location = useLocation(); // location object in order to access state

  // State to hold the validation error message passed via navigation state
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Check if a validation error was passed from the header
    if (location.state && (location.state as { validationError?: string }).validationError) {
      setValidationError((location.state as { validationError: string }).validationError);
    } else {
      setValidationError(null); // Clear previous errors if search was completed without one
    }
  }, [location.state]); // Re-run effect if location state changes

  const {
    data: results,
    isLoading,
    isError,
    error,
    isFetching
  } = useQuery<SearchResult[], Error>({
    queryKey: ['searchResults', q],
    queryFn: () => fetchSearchResults(q),
    // Only enable the query if there's a valid search term and NO validation errors
    enabled: !!q && !validationError,
    // staleTime: 24 * 60 * 60 * 1000, // 1 day
  });

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="animate-appear text-4xl font-bold mb-6 text-center">Search Results</h1>
      {validationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Validation Error:</strong>
          <span className="block sm:inline ml-2">{validationError}</span>
        </div>
      )}
      {!q && !validationError && ( // initial state... OR after a direct navigation without query/error
        (<p className="text-center text-lg text-brand">Enter a search term in the header to find results.</p>)
      )}
      {(isLoading || isFetching) && q && !validationError && (
        <p className="text-brand text-center text-lg">Searching for "{q}"...</p>
      )}
      {isError && q && !validationError && (
        <p className="text-brand text-center text-lg">Error: {error?.message}</p>
      )}
      {results && results.length > 0 && q && !isFetching && !validationError && (
        <>
          <p className="text-brand text-center mb-4">Found {results.length} results for "{q}"</p>
          <ul className="space-y-4">
            {results.map((item) => (
              <li key={`${item.type}-${item.type === 'fighter' ? item.fighter_id : item.event_id}`}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center bg-brand/10"
              >
                {item.type === 'fighter' ? (
                  <>
                    <h4 className="text-brand mb-1">Fighter</h4>
                    <Button asChild variant="secondary" className="group mb-2">
                      <Link to={`/fighters/${item.fighter_id}`}>
                        <span className="">{item.name} {item.nickname && `"${item.nickname}"`}</span>
                        <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                      </Link>
                    </Button>
                    <span>
                      {item?.weight_lb && `Weight: ${item.weight_lb} lbs`}
                      {` | Record: ${item.wins}-${item.losses}${item.draws && `-${item.draws}`}`}
                    </span>
                  </>
                ) : (
                  <>
                    <h4 className="text-brand mb-1">Event</h4>
                    <Button asChild variant="secondary" className="group mb-2">
                      <Link to={`/events/${item.event_id}`}>
                        <span className="">{item.name}</span>
                        <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                      </Link>
                    </Button>
                    <span className="flex flex-col items-center justify-center">
                        <span className="">{formatDate(item.date)}</span>
                        <span className="">{item.location}</span>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {results && results.length === 0 && q && !isFetching && !isLoading && !validationError && (
        <p className="text-brand text-center text-lg">No results found for "{q}".</p>
      )}
    </div>
  )
}