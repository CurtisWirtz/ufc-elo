import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/section";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { cn } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/client.ts';
import type { Fighter } from '../../../types/fighter.types.ts';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner';

import { matchSchema1, matchSchema2 } from '../../../../src/schemas/searchSchema.ts';
import type { MatchFormInput1, MatchFormInput2 } from '../../../../src/schemas/searchSchema.ts';

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

  const [searchResults, setSearchResults] = useState<Fighter[]>([]);
  const [searchResults2, setSearchResults2] = useState<Fighter[]>([]);
  const [hasSearched, setHasSearched] = useState(false); // If no fighter query has been submitted yet, then don't display "No results found"
  const [hasSearched2, setHasSearched2] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<MatchFormInput1>({
    resolver: zodResolver(matchSchema1),
    defaultValues: {
      searchQuery: '',
    },
  });

  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2, isSubmitting: isSubmitting2 }, setValue: setValue2 } = useForm<MatchFormInput2>({
    resolver: zodResolver(matchSchema2),
    defaultValues: {
      searchQuery: '',
    },
  });

  const onSubmit = async (data: MatchFormInput1) => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    setHasSearched(true);

    try {
      const response = await getTopSearchResults(data.searchQuery);
      setSearchResults(response.results);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching search results.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit2 = async (data: MatchFormInput2) => {
    setIsLoading2(true);
    setError2(null);
    setSearchResults2([]); // Clear previous results
    setHasSearched2(true);

    try {
      const response = await getTopSearchResults(data.searchQuery);
      setSearchResults2(response.results);
    } catch (err: any) {
      setError2(err.message || "An error occurred while fetching search results.");
    } finally {
      setIsLoading2(false);
    }
  };

  console.log('firstFighter: ', firstFighter);
  console.log('secondFighter: ', secondFighter);
  console.log('searchResults: ', searchResults);
  console.log('searchResults2: ', searchResults2);

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
                      setHasSearched(false); // make sure it doesn't display "No results found", after clearing the search terms
                    }}
                  >
                    <svg className="absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 pl-px" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-md font-semibold">{firstFighter.name}</h3>
                  {firstFighter.nickname && <p className="text-sm text-muted-foreground">"{firstFighter.nickname}"</p>}
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
                  <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      {...register("searchQuery")}
                      placeholder="Search fighters by name or nickname"
                    />
                    <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Spinner size="small" />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </Button>
                  </form>

                  {errors.searchQuery && <p className="text-red-500 text-sm mt-1">{errors.searchQuery.message}</p>}

                  {isLoading && <Spinner size="small" className="mt-2" />}
                  {error && <p className="text-red-500 mt-2">Error: {error}</p>}

                  {searchResults.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {searchResults.map((fighter) => (
                        <li key={fighter.fighter_id}>
                          <Button className="cursor-pointer text-center w-full" onClick={() => {
                            setFirstFighter(fighter);
                            setSearchResults([]);
                          }}>
                            {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {hasSearched && !isLoading && !error && !firstFighter && searchResults.length === 0 && (
                      <p className="mt-2 text-muted-foreground">No results found.</p>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-1">
              <h2 className="text-lg font-semibold">Fighter 2</h2>
              {secondFighter ? (
                <div className="relative border rounded-md p-3 bg-background">
                  <div className="absolute -top-2 -left-2 z-10 cursor-pointer h-7 w-7 bg-brand border-2 border-inherit text-black rounded-full px-2 py-0.5" 
                    onClick={() => {
                      setSecondFighter(null);
                      setValue2('searchQuery', ''); // Reset the form field, otherwise it displays that there are no results after clearing
                      setSecondFighterEra(null); // Reset the fighter era, otherwise it shows the previous era chosen from another fighter, or throws an error if that same index of era chosen doesnt exist
                      setHasSearched2(false); // make sure it doesn't display "No results found", after clearing the search terms
                    }}
                  >
                    <svg className="absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 pl-px" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-md font-semibold">{secondFighter.name}</h3>
                  {secondFighter.nickname && <p className="text-sm text-muted-foreground">"{secondFighter.nickname}"</p>}
                  {(secondFighterEra) && secondFighterEra ? (
                    <div className="text-sm text-muted-foreground">
                      <div className="cursor-pointer h-6 w-6 bg-brand text-black rounded-full px-2 py-0.5" 
                        onClick={() => {
                          setSecondFighterEra(null)
                        }}
                      >
                        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p>Era: {secondFighterEra.date}</p>
                      <p>Ending ELO: {secondFighterEra.ending_elo}</p>
                      <p>ELO Change: {secondFighterEra.elo_change}</p>
                    </div>
                  ) : (
                    secondFighter.elo_history && secondFighter.elo_history.length > 0 ? (
                      secondFighter.elo_history.map((era) => (
                        <Button key={era.date + era.opponent_id} className="cursor-pointer text-center w-full" onClick={() => {setSecondFighterEra(era)} }>
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
                  <form onSubmit={handleSubmit2(onSubmit2)} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      {...register2("searchQuery")}
                      placeholder="Search fighters by name or nickname"
                    />
                    <Button className="cursor-pointer" type="submit" disabled={isSubmitting2}>
                      {isSubmitting2 ? (
                        <Spinner size="small" />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </Button>
                  </form>

                  {errors2.searchQuery && <p className="text-red-500 text-sm mt-1">{errors2.searchQuery.message}</p>}

                  {isLoading2 && <Spinner size="small" className="mt-2" />}
                  {error2 && <p className="text-red-500 mt-2">Error: {error2}</p>}

                  {searchResults2.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {searchResults2.map((fighter) => (
                        <li key={fighter.fighter_id}>
                          <Button className="cursor-pointer text-center w-full" onClick={() => {
                            setSecondFighter(fighter);
                            setSearchResults2([]);
                          }}>
                            {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {hasSearched2 && !isLoading2 && !error2 && !secondFighter && searchResults2.length === 0 && (
                      <p className="mt-2 text-muted-foreground">No results found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}