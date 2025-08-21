import { useState, useEffect } from 'react'; 
import { Section } from "@/components/ui/section";
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/client.ts';
import type { Fighter } from '../../../types/fighter.types.ts';
import useDebounce from '@/hooks/useDebounce.tsx';
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { set } from 'zod';


export const Route = createFileRoute('/_authenticated/matchmaker/')({
  component: MatchMaker,
})

const getTopSearchResults = async (searchTerm: string): Promise<Fighter[]> => {
  if (!searchTerm) {
    return [];
  }
  try {
    const response = await api.get(`/api/matchmaker/?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch search results:", error);
    throw new Error("Could not retrieve search results.");
  }
}

function MatchMaker() {
  const queryClient = useQueryClient(); // Get the query client from context
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 1000); // delay searching until the user has stopped typing for 1 second

  // let's keep it more simple, not useQuery... just a few states to manage here
  const [searchResults, setSearchResults] = useState<Fighter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('searchResults: ', searchResults)

  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log("Searching for:", debouncedSearchTerm);
      setIsLoading(true);
      setError(null);

      // Fetch the top search results and update component state ...after the delay
      queryClient.fetchQuery({
        queryKey: ['searchFighters', debouncedSearchTerm],
        queryFn: () => getTopSearchResults(debouncedSearchTerm),
      })
      .then(data => {
        console.log("Search results:", data);
        setSearchResults(data?.results);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [debouncedSearchTerm, queryClient]);

  return (
    <Section
      className={cn(
        "py-0! px-5! max-w-container mx-auto",
        "",
    )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs />
        <h1 className="animate-appear text-4xl font-bold mb-6">Match Maker</h1>
        <div className="w-full animate-appear p-6 rounded-md bg-brand/10">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              console.log("Search term changed:", e.target.value);
              setSearchTerm(e.target.value);
              // setError(null);
              // if (e.target.value.length > 0) {
              //   setIsLoading(true)
              // } else {
              //   setIsLoading(false)
              // }
            }}
            placeholder="Search by name or nickname..."
          />
          
          {isLoading && <p>Searching...</p>}
          {error && <p>Error: {error}</p>}

          x{searchResults?.length > 0 && (
            <ul>
              {searchResults.map((fighter) => (
                <li key={fighter.fighter_id}>
                  {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                </li>
              ))}
            </ul>
          )}
          
          {debouncedSearchTerm && !isLoading && !searchResults?.length && (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </Section>
  )
}