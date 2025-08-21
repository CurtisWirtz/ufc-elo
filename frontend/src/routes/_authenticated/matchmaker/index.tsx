import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/section";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { cn } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/client.ts';
import type { Fighter } from '../../../types/fighter.types.ts';
import useDebounce from '@/hooks/useDebounce.tsx';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button.tsx';

import { searchSchema } from '../../../../src/schemas/searchSchema.ts';
import type { SearchFormInputs } from '../../../../src/schemas/searchSchema.ts';

interface FighterEra {
  bout_id: string;
  date: string;
  elo_change: number;
  ending_elo: number;
  opponent_id: string;
  starting_elo: number;
}

export const Route = createFileRoute('/_authenticated/matchmaker/')({
  component: MatchMaker,
});

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
};

function MatchMaker() {
  const [firstFighter, setFirstFighter] = useState<Fighter | null>(null);
  const [secondFighter, setSecondFighter] = useState<Fighter | null>(null);

  const [firstFighterEra, setFirstFighterEra] = useState<FighterEra | null>(null);
  const [secondFighterEra, setSecondFighterEra] = useState<FighterEra | null>(null);

  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState<Fighter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, watch, formState: { errors }, setValue } = useForm<SearchFormInputs>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchQuery: '',
    },
  });

  const searchTerm = watch('searchQuery');
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    // Only search if there's a debounced term and no validation errors
    if (debouncedSearchTerm && !errors.searchQuery) {
      console.log("Searching for:", debouncedSearchTerm);
      setIsLoading(true);
      setError(null);

      // Fetch the top search results and update component state after the delay
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
  }, [debouncedSearchTerm, queryClient, errors.searchQuery]);

  console.log('firstFighter: ', firstFighter);
  console.log('secondFighter: ', secondFighter);

  return (
    <Section
      className={cn(
        "py-0! px-5! max-w-container mx-auto",
        "",
      )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs overrideString="Match Maker" />
        <h1 className="animate-appear text-4xl font-bold mb-6">Match Maker</h1>
        <p className="mb-7">Select two fighters at any point in their career to see who would have been projected to win based on Elo rankings.</p>
        <div className="w-full animate-appear p-6 rounded-md bg-brand/10">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-1">
              <h2 className="text-lg font-semibold mb-2">Fighter 1</h2>
              {firstFighter ? (
                <div className="relative border rounded-md p-3 bg-background">
                  <div className="absolute -top-2 -left-2 z-10 cursor-pointer h-7 w-7 bg-brand border-2 border-inherit text-black rounded-full px-2 py-0.5" 
                    onClick={() => {
                      setFirstFighter(null);
                      setValue('searchQuery', ''); // Reset the form field, otherwise it displays that there are no results after clearing
                      setFirstFighterEra(null); // Reset the fighter era, otherwise it shows the previous era chosen from another fighter, or throws an error if that same index of era chosen doesnt exist
                    }}
                  >
                    <svg className="absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 pl-px" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-md font-semibold">{firstFighter.name}</h3>
                  <p className="text-sm text-muted-foreground">"{firstFighter.nickname}"</p>
                  {(firstFighterEra) && firstFighterEra ? (
                    <div className="text-sm text-muted-foreground">
                      <div className="cursor-pointer h-6 w-6 bg-brand text-black rounded-full px-2 py-0.5" 
                        onClick={() => {
                          setFirstFighterEra(null)
                        }}
                      >
                        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p>Era: {firstFighterEra.date}</p>
                      <p>Ending ELO: {firstFighterEra.ending_elo}</p>
                      <p>ELO Change: {firstFighterEra.elo_change}</p>
                    </div>
                  ) : (
                    firstFighter.elo_history && firstFighter.elo_history.length > 0 ? (
                      firstFighter.elo_history.map((era) => (
                        <Button key={era.date + era.opponent_id} className="cursor-pointer text-center w-full" onClick={() => {setFirstFighterEra(era)} }>
                          <p>Era: {era.date}</p>
                          <p>Ending ELO: {era.ending_elo}</p>
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No Elo history available</p>
                    )
                  )}
                </div>
              ) : (
                <div className="">
                  <Input
                    type="text"
                    {...register("searchQuery")}
                    placeholder="Search fighters by name or nickname"
                  />
                  {errors.searchQuery && <p className="text-red-500 text-sm mt-1">{errors.searchQuery.message}</p>}
                  
                  {isLoading && <p>Searching...</p>}
                  {error && <p>Error: {error}</p>}

                  {searchResults?.length > 0 && (
                    <ul>
                      {searchResults.map((fighter) => (
                        <li key={fighter.fighter_id}>
                          <Button className="cursor-pointer text-center w-full" onClick={() => {
                            setFirstFighter(fighter);
                            setSearchResults([]);
                            // Reset the form field
                            // This would require using setValue from useForm
                            // setValue('searchQuery', '');
                          }}>
                            {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {(debouncedSearchTerm && !isLoading && !searchResults?.length) && (!firstFighter) && (
                    <p>No results found.</p>
                  )}
                </div>
              )}
            </div>
            <div className="col-span-1">
              <h2 className="text-lg font-semibold">Fighter 2</h2>
              {/* <Input
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

              {searchResults?.length > 0 && (
                <ul>
                  {searchResults.map((fighter) => (
                    <li key={fighter.fighter_id}>
                      <Button onClick={() => {
                        setFighter_1(fighter)
                        setSearchResults([])
                        setSearchTerm('')
                      }}>
                        {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              
              {(debouncedSearchTerm && !isLoading && !searchResults?.length) && (!fighter_1) && (
                <p>No results found.</p>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}