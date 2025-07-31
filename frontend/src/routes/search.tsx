import { useEffect, useState } from 'react';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

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


export const Route = createFileRoute('/search')({
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
      setValidationError(null); // Clear previous errors if navigated without one
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
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Results</h1>

      {validationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Validation Error:</strong>
          <span className="block sm:inline ml-2">{validationError}</span>
        </div>
      )}

      {!q && !validationError && ( // initial state... OR after a direct navigation without query/error
        <p className="text-gray-600 text-center text-lg">Enter a search term in the header to find results.</p>
      )}

      {(isLoading || isFetching) && q && !validationError && (
        <p className="text-blue-600 text-center text-lg">Searching for "{q}"...</p>
      )}
      {isError && q && !validationError && (
        <p className="text-red-600 text-center text-lg">Error: {error?.message}</p>
      )}

      {results && results.length > 0 && q && !isFetching && !validationError && (
        <>
          <p className="text-gray-700 text-center mb-4">Found {results.length} results for "{q}"</p>
          <ul className="space-y-4">
            {results.map((item) => (
              <li key={`${item.type}-${item.type === 'fighter' ? item.fighter_id : item.event_id}`}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {item.type === 'fighter' ? (
                  <>
                    <p className="font-bold text-lg text-gray-900">{item.name} {item.nickname && `(${item.nickname})`}</p>
                    <p className="text-sm text-gray-600">Type: Fighter</p>
                    {/* Display more fighter details here if desired */}
                  </>
                ) : (
                  <>
                    <p className="font-bold text-lg text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Type: Event on {new Date(item.date).toLocaleDateString()} at {item.location}</p>
                    {/* Display more event details here if desired */}
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {results && results.length === 0 && q && !isFetching && !isLoading && !validationError && (
        <p className="text-gray-600 text-center text-lg">No results found for "{q}".</p>
      )}
    </div>
  );
}