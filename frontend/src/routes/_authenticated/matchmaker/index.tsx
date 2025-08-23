import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/section";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { cn } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '../../../api/client.ts';
import type { Fighter } from '../../../types/fighter.types.ts';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from '@/lib/dateUtils.ts';

import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner';
import Glow from '@/components/ui/glow.tsx';

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

  const [winner, setWinner] = useState<Fighter | null>(null);
  const [loser, setLoser] = useState<Fighter | null>(null);

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

  useEffect(() => {
    if (firstFighterEra && secondFighterEra) {
      // if both fighters and eras are chosen, decide which is the winner
      if (firstFighterEra.ending_elo > secondFighterEra.ending_elo) {
        setWinner(firstFighter);
        setLoser(secondFighter);
      } else if (secondFighterEra.ending_elo > firstFighterEra.ending_elo) {
        setWinner(secondFighter);
        setLoser(firstFighter);
      } else {
        // draw - make them both the same fighter, easy to check later
        setWinner(firstFighter);
        setLoser(firstFighter);
      }
    } else {
      // unset the the winner if either fighter's era is not selected (not enough information)
      setWinner(null);
      setLoser(null);
    }
  }, [firstFighterEra, secondFighterEra]);

  console.log('winner:', winner);
  console.log('loser:', loser);

  return (
    <Section
      className={cn(
        "py-0! px-5! max-w-container mx-auto",
        "",
      )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs overrideString="Match Maker" />
        <h1 className="animate-appear text-4xl font-bold mb-1">Match Maker</h1>
        <p className="animate-appear mb-7">Select two fighters from any point in their careers to see who would have been projected to win based their Elo rating.</p>
        <div className="flex w-full animate-appear relative space-x-5">

          <div className={`relative flex flex-col grow-1 rounded-lg border-2 ${((winner === firstFighter) && (winner !== loser)) ? "border-brand" : "border-transparent"}`}>
            <div className="flex justify-center relative overflow-hidden rounded-lg">
              <h2 className="absolute top-5 left-5 text-2xl mb-2 z-10 flex flex-col">
                {firstFighter ? (
                  <>
                    <span>{firstFighter.name}</span>
                    {firstFighter.nickname && <span className="italic">"{firstFighter.nickname}"</span>}
                  </>
                ) : (
                  "Fighter 1?"
                )}
              </h2>
              <svg className="relative z-10 top-10 rotate-y-180 fill-black/75 max-h-100 overflow-y-hidden" xmlns="http://www.w3.org/2000/svg" width="400" height="800"><path d="M194.14.816c-6.566 1.453-13.107 4.01-17.057 6.669-1.26.848-3.08 2.04-4.044 2.648-6.244 3.936-11.328 17.015-11.786 30.315-.32 9.29-.275 9.135-2.674 9.135-5.369 0-6.164 2.229-4.59 12.864 1.664 11.243 4.73 17.526 9.086 18.619 1.312.33 1.496 1.133 1.503 6.573.009 7.45 1.515 11.994 5.99 18.072 2.537 3.446 3.611 7.728 2.412 9.617-.505.796-31.2 15.922-32.311 15.922-2.029 0-4.95 1.256-7.749 3.331l-2.92 2.165-2.918-2.164c-1.605-1.19-3.885-2.53-5.066-2.979-1.181-.449-2.701-1.103-3.378-1.453-1.734-.896-12.958-.922-13.983-.032-.383.333-1.531.731-2.55.886-4.199.639-11.077 5.24-15.23 10.188-7.985 9.514-12.718 31.664-7.936 37.141 2.407 2.758 3.183 6.1 2.144 9.23-1.39 4.191-2.807 11.261-3.035 15.145-.234 3.999-2.253 8.736-4.248 9.97-.173.106-1.113 2.126-2.09 4.487-.976 2.361-1.995 4.668-2.264 5.127-.669 1.143-.919 35.853-.286 39.928.31 1.999.836 3.479 1.683 4.734.677 1.004 1.355 2.317 1.506 2.918.151.601 1.512 2.332 3.025 3.846 3.465 3.47 4.821 3.913 11.125 3.638 14.541-.634 19.475-3.719 31.091-19.439 2.286-3.094 4.532-5.895 4.99-6.224.459-.329 1.943-2.016 3.297-3.75a296.255 296.255 0 0 1 4.542-5.651c2.698-3.247 6.676-9.026 8.03-11.667 2.712-5.29 2.767-5.187 3.244 6.101.247 5.834.732 11.34 1.299 14.732 1.104 6.61 1.316 18.886.395 22.912-.693 3.028-3.563 10.503-4.386 11.424-.327.365-.796 1.764-1.043 3.109-.246 1.344-1.103 4.471-1.904 6.948-2.208 6.83-2.645 15.4-1.063 20.813.624 2.133.524 3.533-.362 5.083-.433.758-.906 2.062-1.052 2.899-.146.836-.721 2.191-1.278 3.012-.596.878-1.174 2.566-1.407 4.104-.826 5.471-2.19 12.695-2.775 14.696-1.944 6.649-2.919 11.576-4.992 25.209-.296 1.948-.648 3.823-.782 4.166-.135.344-.527 2.969-.872 5.834-.345 2.864-1 6.427-1.456 7.916-4.869 15.915-6.611 27.022-7.056 45-.25 10.107-.444 12.965-.951 13.959-.35.687-.861 2.187-1.135 3.333a45.208 45.208 0 0 1-1.284 4.216c-1.252 3.398-1.998 8.159-2.707 17.279-1.516 19.514-2.402 28.145-3.695 36.005-1.213 7.374-1.267 9.639-.252 10.56a33.816 33.816 0 0 1 1.378 1.318c2.247 2.36 3.603 3.411 5.973 4.628a201 201 0 0 1 3.722 1.95c.536.297 1.963.646 3.171.777 1.629.175 2.896.694 4.904 2.007 3.531 2.307 4.349 2.718 5.406 2.718.482 0 1.62.703 2.529 1.563 2.231 2.11 2.37 3.064 2.898 19.996.546 17.497 1.034 22.6 2.949 30.852.441 1.899.802 4.018.802 4.709 0 .69.259 1.761.576 2.38.317.619.707 2.157.868 3.417.16 1.26.728 3.417 1.261 4.792.533 1.375 1.561 5.5 2.283 9.166.722 3.667 1.852 8.73 2.512 11.25 4.365 16.672 6.036 37.379 3.965 49.109-.873 4.943-.615 4.564-8.275 12.141-3.706 3.667-7.639 7.745-8.74 9.062-2.065 2.472-4.544 3.912-10.979 6.379-10.416 3.993-14.422 8.967-14.48 17.983-.048 7.468.811 7.888 15.384 7.516 7.938-.203 9.31-.574 13.316-3.599 3.042-2.296 4.234-2.817 7.661-3.346 4.098-.633 5.252-1.31 6.744-3.954 4.472-7.923 17.622-13.999 30.298-13.999 1.525 0 2.073-.26 3.692-1.752 4.042-3.726 4.42-6.588 2.304-17.441-3.671-18.822-5.161-33.746-5.749-57.577-.192-7.774-.134-11.618.192-12.708l1.721-5.757c2.995-10.008 3.625-15.487 2.944-25.598-.547-8.114-1.84-18.36-2.761-21.875-1.857-7.091-2.328-9.475-2.522-12.771l-.212-3.604 1.186-.223c7.304-1.376 25.513-1.203 28.957.276 1.184.509 1.607 1.112 2.797 3.989 1.387 3.355 4.137 7.015 6.043 8.044.547.294 4.584.588 10.488.762 11.877.349 11.82.324 15.032 6.548.621 1.203 1.266 2.187 1.433 2.187.167 0 .413.434.546.964.223.89 3.476 7.72 5.295 11.119.429.802 1.467 3.052 2.307 5 .84 1.948 2.461 5.504 3.602 7.902 2.34 4.92 2.399 5.813.961 14.598-1.712 10.456-1.371 17.389 1.66 33.75 1.051 5.676 6.151 23.261 7.505 25.88.331.639.601 1.457.601 1.817 0 .36 1.104 3.894 2.452 7.855 1.349 3.96 2.696 8.316 2.995 9.679.299 1.363.668 2.571.82 2.686.84.633 4.566 14.955 5.433 20.885.601 4.115.268 11.989-.733 17.32-.825 4.392-.937 14.131-.192 16.587 1.038 3.417 1.075 10.036.083 14.791-.501 2.407-1.258 6.813-1.682 9.792-1.016 7.15-1.214 7.593-5.686 12.758-1.627 1.879-2.103 3.413-2.394 7.723-.242 3.571-.961 7.163-1.569 7.832-.469.515-.467 3.447.003 3.737.199.123.477.794.616 1.49.427 2.138 5.212 2.818 10.271 1.46 3.194-.857 3.545-.806 5.311.773 3.121 2.791 5.081 3.059 7.981 1.094 1.394-.944 2.305-1.242 3.802-1.242 2.898 0 4.316-.378 5.62-1.499.9-.773 1.649-1.001 3.288-1.003 2.492-.001 4.088-.844 5.878-3.102.685-.864 2.585-2.909 4.223-4.546 4.326-4.321 5.566-6.351 5.555-9.092-.021-5.624-1.7-11.357-3.568-12.18-1.086-.479-3.192-4.904-4.279-8.995-2.018-7.592-2.111-11.642-.402-17.518 1.572-5.405 1.153-11.553-1.168-17.149-1.963-4.736-2.141-29.043-.37-50.541 1.838-22.302 2.105-32 1.302-47.292-.848-16.163-2.398-26.154-5.042-32.5-.525-1.26-1.353-3.756-1.84-5.545-.487-1.79-1.377-4.225-1.979-5.412-.601-1.187-1.348-3.374-1.659-4.861-.311-1.487-1.054-3.739-1.651-5.005-3.248-6.884-5.622-13.417-6.033-16.605-.457-3.54-.48-12.612-.034-13.314.428-.675 9.062-4.563 15.937-7.179 6.319-2.403 8.195-3.334 9.472-4.703l.969-1.038-1.249-4.106c-2.715-8.932-4.248-14.795-5.431-20.773-2.017-10.196-5.053-23.569-5.959-26.25-.465-1.375-1.485-4.844-2.267-7.709-.782-2.864-1.87-6.338-2.418-7.72-.547-1.381-1.393-4.868-1.879-7.747-.837-4.957-1.546-7.544-3.928-14.324-1.278-3.639-2.277-10.155-4.652-30.354-1.688-14.365-4.539-31.845-5.673-34.789-.235-.609-.692-2.467-1.017-4.128l-1.179-6.042c-.818-4.197-2.941-11.669-3.719-13.089-.356-.65-1.421-3.057-2.369-5.348-.947-2.292-2.161-4.823-2.698-5.625-5.515-8.234-8.008-21.737-5.471-29.635.852-2.652 1.021-4.217 1.236-11.407.334-11.199 1.659-18.528 4.22-23.345.551-1.037 1.205-2.958 1.453-4.27.247-1.312.796-3.135 1.219-4.052.423-.916 1.014-2.229 1.314-2.916l.544-1.25.274 1.458c.151.802.776 2.188 1.389 3.079.612.891 1.114 1.944 1.114 2.34 0 .395.345 1.166.766 1.712.422.547.975 1.603 1.228 2.347.254.744.934 1.972 1.511 2.729.577.756 1.686 2.774 2.466 4.484 2.036 4.469 7.34 9.319 13.05 11.933 3.734 1.71 13.371.694 16.262-1.714.417-.347 1.544-1.193 2.504-1.88 4.357-3.117 5.616-5.961 6.559-14.822.556-5.222.772-6.117 2.062-8.541 3.794-7.132 4.495-16.626 1.724-23.353-.798-1.937-1.454-3.946-1.458-4.464-.004-.518-.383-1.263-.841-1.655-.458-.392-.833-1.024-.833-1.402 0-.379-.469-1.749-1.042-3.045-.573-1.295-1.042-2.637-1.042-2.981 0-.345-.262-.727-.584-.851-.321-.123-.713-.914-.871-1.757-.157-.844-1.59-5.753-3.183-10.909l-2.896-9.375-.005-7.708c-.004-5.127.211-8.948.642-11.409 1.752-10.013.446-21.805-3.303-29.824-1.036-2.216-1.883-4.159-1.883-4.319 0-.16-.728-1.367-1.618-2.682-.889-1.315-2.04-3.235-2.558-4.266-2.639-5.261-12.506-15.834-14.776-15.834-.295 0-.837-.46-1.206-1.023-.509-.776-1.698-1.332-4.944-2.308-7.831-2.356-11.974-4.414-15.315-7.608-1.676-1.603-6.879-4.071-9.47-4.493-1.539-.25-2.617-.68-3.023-1.203-.348-.448-1.194-.937-1.882-1.088-2.553-.559-11.737-3.615-13.75-4.575-1.145-.547-2.833-1.216-3.75-1.487-6.858-2.032-9.463-5.966-9.461-14.286.002-6.336.329-7.504 2.336-8.342.823-.345 1.73-1.156 2.108-1.887.365-.706.927-1.283 1.25-1.283.817 0 2.181-2.037 3.419-5.107.577-1.431 1.384-2.976 1.793-3.435 1.416-1.585 1.845-3.951 1.867-10.298.025-7.203-.207-7.691-3.953-8.283-1.195-.189-2.237-.408-2.316-.487-.079-.079-.177-5.571-.217-12.205-.14-23.329.499-21.469-10.809-31.468C216.219 1.119 205.976-1.802 194.14.816" fillRule="evenodd"/></svg>
              <Glow
                variant="center"
                className="z-0 animate-appear-zoom opacity-0 delay-300"
              />
            </div>
            {firstFighter ? (
              <div className="">
                <div className="absolute -top-2 -left-2 z-10 cursor-pointer h-7 w-7 bg-brand-foreground border-2 border-inherit text-black rounded-full px-2 py-0.5" 
                  onClick={() => {
                    setFirstFighter(null);
                    setValue('searchQuery', ''); // Reset the form field, otherwise it displays that there are no results after clearing
                    setFirstFighterEra(null); // Reset the fighter era, otherwise it shows the previous era chosen from another fighter, or throws an error if that same index of era chosen doesnt exist
                    setHasSearched(false); // make sure it doesn't display "No results found", after clearing the search terms
                  }}
                >
                  <svg className="absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 pl-px" width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {(firstFighter && firstFighterEra) ? (
                  <div className="relative">
                    <div className="absolute flex justify-between w-full mt-3 text-lg bg-brand-foreground/20 p-3 rounded-md">
                      <div className="order-3 cursor-pointer h-6 w-6 bg-brand-foreground text-black rounded-full px-2 py-0.5 relative" 
                        onClick={() => {
                          setFirstFighterEra(null)
                        }}
                      >
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className='block order-1'>From {formatDate(firstFighterEra.date)}</span>
                      <span className='block order-2'><span className="text-brand">Rating:</span> {Math.round(firstFighterEra.ending_elo)}</span>
                    </div>
                  </div>
                ) : (
                  firstFighter.elo_history && firstFighter.elo_history.length > 0 ? (
                    <div className="relative w-full">
                      <ul className="absolute w-full mt-2 space-y-2 max-h-50 overflow-y-auto">
                        <span className="text-xl block mb-2">Select an era:</span>
                        {firstFighter.elo_history.map((era) => (
                          <li key={era.date + era.opponent_id}>
                            <Button className="cursor-pointer text-lg text-center w-full flex justify-between" onClick={() => {setFirstFighterEra(era)} }>
                              <span>{formatDate(era.date)}</span>
                              <span>Rating: {Math.round(era.ending_elo)}</span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-lg text-muted-foreground absolute translate-y-2">No Elo history available</p>
                  )
                )}
              </div>
            ) : (
              <div className="relative z-20 mt-3">
                <form onSubmit={handleSubmit(onSubmit)} className="absolute w-full flex items-center space-x-2">
                  <Input
                    className="placeholder:text-foreground text-lg! placeholder:text-lg"
                    type="text"
                    {...register("searchQuery")}
                    placeholder="Search fighter by name / nickname"
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

                {errors.searchQuery && <p className="absolute text-red-500 text-sm translate-y-10">{errors.searchQuery.message}</p>}

                {isLoading && <Spinner size="small" className="absolute mt-5" />}
                {error && <p className="absolute text-red-500 mt-14">Error: {error}</p>}

                {searchResults.length > 0 && (
                  <div className="relative w-full">
                    <ul className="absolute w-full mt-10 space-y-2 max-h-50 overflow-y-auto">
                      <span className="text-xl block mb-2 mt-3">Select a fighter:</span>
                      {searchResults.map((fighter) => (
                        <li key={fighter.fighter_id}>
                          <Button className="cursor-pointer text-center w-full text-lg" onClick={() => {
                            setFirstFighter(fighter);
                            setSearchResults([]);
                          }}>
                            {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasSearched && !isLoading && !error && !firstFighter && searchResults.length === 0 && (
                    <p className="absolute mt-5 text-muted-foreground text-md">No results found.</p>
                )}
              </div>
            )}
          </div>

          <div className="animate-appear z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-11 w-11 bg-brand-foreground text-black text-2xl rounded-full border-black border-2">
            <div className="relative w-full h-full">
              <span className="pointer-events-none italic font-semibold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                VS.
              </span>
            </div>
          </div>

          <div className={`relative flex flex-col grow-1 rounded-lg border-2 ${((winner === secondFighter) && (winner !== loser)) ? "border-brand" : "border-transparent"}`}>
            <div className="flex justify-center relative overflow-hidden rounded-lg">
              <h2 className="absolute top-5 left-5 text-2xl mb-2 z-10 flex flex-col">
                {secondFighter ? (
                  <>
                    <span>{secondFighter.name}</span>
                    {secondFighter.nickname && <span className="italic">"{secondFighter.nickname}"</span>}
                  </>
                ) : (
                  "Fighter 2?"
                )}
              </h2>
              <svg className="relative z-10 top-10 max-h-100 fill-black/75 overflow-y-hidden" xmlns="http://www.w3.org/2000/svg" width="400" height="800"><path d="M194.14.816c-6.566 1.453-13.107 4.01-17.057 6.669-1.26.848-3.08 2.04-4.044 2.648-6.244 3.936-11.328 17.015-11.786 30.315-.32 9.29-.275 9.135-2.674 9.135-5.369 0-6.164 2.229-4.59 12.864 1.664 11.243 4.73 17.526 9.086 18.619 1.312.33 1.496 1.133 1.503 6.573.009 7.45 1.515 11.994 5.99 18.072 2.537 3.446 3.611 7.728 2.412 9.617-.505.796-31.2 15.922-32.311 15.922-2.029 0-4.95 1.256-7.749 3.331l-2.92 2.165-2.918-2.164c-1.605-1.19-3.885-2.53-5.066-2.979-1.181-.449-2.701-1.103-3.378-1.453-1.734-.896-12.958-.922-13.983-.032-.383.333-1.531.731-2.55.886-4.199.639-11.077 5.24-15.23 10.188-7.985 9.514-12.718 31.664-7.936 37.141 2.407 2.758 3.183 6.1 2.144 9.23-1.39 4.191-2.807 11.261-3.035 15.145-.234 3.999-2.253 8.736-4.248 9.97-.173.106-1.113 2.126-2.09 4.487-.976 2.361-1.995 4.668-2.264 5.127-.669 1.143-.919 35.853-.286 39.928.31 1.999.836 3.479 1.683 4.734.677 1.004 1.355 2.317 1.506 2.918.151.601 1.512 2.332 3.025 3.846 3.465 3.47 4.821 3.913 11.125 3.638 14.541-.634 19.475-3.719 31.091-19.439 2.286-3.094 4.532-5.895 4.99-6.224.459-.329 1.943-2.016 3.297-3.75a296.255 296.255 0 0 1 4.542-5.651c2.698-3.247 6.676-9.026 8.03-11.667 2.712-5.29 2.767-5.187 3.244 6.101.247 5.834.732 11.34 1.299 14.732 1.104 6.61 1.316 18.886.395 22.912-.693 3.028-3.563 10.503-4.386 11.424-.327.365-.796 1.764-1.043 3.109-.246 1.344-1.103 4.471-1.904 6.948-2.208 6.83-2.645 15.4-1.063 20.813.624 2.133.524 3.533-.362 5.083-.433.758-.906 2.062-1.052 2.899-.146.836-.721 2.191-1.278 3.012-.596.878-1.174 2.566-1.407 4.104-.826 5.471-2.19 12.695-2.775 14.696-1.944 6.649-2.919 11.576-4.992 25.209-.296 1.948-.648 3.823-.782 4.166-.135.344-.527 2.969-.872 5.834-.345 2.864-1 6.427-1.456 7.916-4.869 15.915-6.611 27.022-7.056 45-.25 10.107-.444 12.965-.951 13.959-.35.687-.861 2.187-1.135 3.333a45.208 45.208 0 0 1-1.284 4.216c-1.252 3.398-1.998 8.159-2.707 17.279-1.516 19.514-2.402 28.145-3.695 36.005-1.213 7.374-1.267 9.639-.252 10.56a33.816 33.816 0 0 1 1.378 1.318c2.247 2.36 3.603 3.411 5.973 4.628a201 201 0 0 1 3.722 1.95c.536.297 1.963.646 3.171.777 1.629.175 2.896.694 4.904 2.007 3.531 2.307 4.349 2.718 5.406 2.718.482 0 1.62.703 2.529 1.563 2.231 2.11 2.37 3.064 2.898 19.996.546 17.497 1.034 22.6 2.949 30.852.441 1.899.802 4.018.802 4.709 0 .69.259 1.761.576 2.38.317.619.707 2.157.868 3.417.16 1.26.728 3.417 1.261 4.792.533 1.375 1.561 5.5 2.283 9.166.722 3.667 1.852 8.73 2.512 11.25 4.365 16.672 6.036 37.379 3.965 49.109-.873 4.943-.615 4.564-8.275 12.141-3.706 3.667-7.639 7.745-8.74 9.062-2.065 2.472-4.544 3.912-10.979 6.379-10.416 3.993-14.422 8.967-14.48 17.983-.048 7.468.811 7.888 15.384 7.516 7.938-.203 9.31-.574 13.316-3.599 3.042-2.296 4.234-2.817 7.661-3.346 4.098-.633 5.252-1.31 6.744-3.954 4.472-7.923 17.622-13.999 30.298-13.999 1.525 0 2.073-.26 3.692-1.752 4.042-3.726 4.42-6.588 2.304-17.441-3.671-18.822-5.161-33.746-5.749-57.577-.192-7.774-.134-11.618.192-12.708l1.721-5.757c2.995-10.008 3.625-15.487 2.944-25.598-.547-8.114-1.84-18.36-2.761-21.875-1.857-7.091-2.328-9.475-2.522-12.771l-.212-3.604 1.186-.223c7.304-1.376 25.513-1.203 28.957.276 1.184.509 1.607 1.112 2.797 3.989 1.387 3.355 4.137 7.015 6.043 8.044.547.294 4.584.588 10.488.762 11.877.349 11.82.324 15.032 6.548.621 1.203 1.266 2.187 1.433 2.187.167 0 .413.434.546.964.223.89 3.476 7.72 5.295 11.119.429.802 1.467 3.052 2.307 5 .84 1.948 2.461 5.504 3.602 7.902 2.34 4.92 2.399 5.813.961 14.598-1.712 10.456-1.371 17.389 1.66 33.75 1.051 5.676 6.151 23.261 7.505 25.88.331.639.601 1.457.601 1.817 0 .36 1.104 3.894 2.452 7.855 1.349 3.96 2.696 8.316 2.995 9.679.299 1.363.668 2.571.82 2.686.84.633 4.566 14.955 5.433 20.885.601 4.115.268 11.989-.733 17.32-.825 4.392-.937 14.131-.192 16.587 1.038 3.417 1.075 10.036.083 14.791-.501 2.407-1.258 6.813-1.682 9.792-1.016 7.15-1.214 7.593-5.686 12.758-1.627 1.879-2.103 3.413-2.394 7.723-.242 3.571-.961 7.163-1.569 7.832-.469.515-.467 3.447.003 3.737.199.123.477.794.616 1.49.427 2.138 5.212 2.818 10.271 1.46 3.194-.857 3.545-.806 5.311.773 3.121 2.791 5.081 3.059 7.981 1.094 1.394-.944 2.305-1.242 3.802-1.242 2.898 0 4.316-.378 5.62-1.499.9-.773 1.649-1.001 3.288-1.003 2.492-.001 4.088-.844 5.878-3.102.685-.864 2.585-2.909 4.223-4.546 4.326-4.321 5.566-6.351 5.555-9.092-.021-5.624-1.7-11.357-3.568-12.18-1.086-.479-3.192-4.904-4.279-8.995-2.018-7.592-2.111-11.642-.402-17.518 1.572-5.405 1.153-11.553-1.168-17.149-1.963-4.736-2.141-29.043-.37-50.541 1.838-22.302 2.105-32 1.302-47.292-.848-16.163-2.398-26.154-5.042-32.5-.525-1.26-1.353-3.756-1.84-5.545-.487-1.79-1.377-4.225-1.979-5.412-.601-1.187-1.348-3.374-1.659-4.861-.311-1.487-1.054-3.739-1.651-5.005-3.248-6.884-5.622-13.417-6.033-16.605-.457-3.54-.48-12.612-.034-13.314.428-.675 9.062-4.563 15.937-7.179 6.319-2.403 8.195-3.334 9.472-4.703l.969-1.038-1.249-4.106c-2.715-8.932-4.248-14.795-5.431-20.773-2.017-10.196-5.053-23.569-5.959-26.25-.465-1.375-1.485-4.844-2.267-7.709-.782-2.864-1.87-6.338-2.418-7.72-.547-1.381-1.393-4.868-1.879-7.747-.837-4.957-1.546-7.544-3.928-14.324-1.278-3.639-2.277-10.155-4.652-30.354-1.688-14.365-4.539-31.845-5.673-34.789-.235-.609-.692-2.467-1.017-4.128l-1.179-6.042c-.818-4.197-2.941-11.669-3.719-13.089-.356-.65-1.421-3.057-2.369-5.348-.947-2.292-2.161-4.823-2.698-5.625-5.515-8.234-8.008-21.737-5.471-29.635.852-2.652 1.021-4.217 1.236-11.407.334-11.199 1.659-18.528 4.22-23.345.551-1.037 1.205-2.958 1.453-4.27.247-1.312.796-3.135 1.219-4.052.423-.916 1.014-2.229 1.314-2.916l.544-1.25.274 1.458c.151.802.776 2.188 1.389 3.079.612.891 1.114 1.944 1.114 2.34 0 .395.345 1.166.766 1.712.422.547.975 1.603 1.228 2.347.254.744.934 1.972 1.511 2.729.577.756 1.686 2.774 2.466 4.484 2.036 4.469 7.34 9.319 13.05 11.933 3.734 1.71 13.371.694 16.262-1.714.417-.347 1.544-1.193 2.504-1.88 4.357-3.117 5.616-5.961 6.559-14.822.556-5.222.772-6.117 2.062-8.541 3.794-7.132 4.495-16.626 1.724-23.353-.798-1.937-1.454-3.946-1.458-4.464-.004-.518-.383-1.263-.841-1.655-.458-.392-.833-1.024-.833-1.402 0-.379-.469-1.749-1.042-3.045-.573-1.295-1.042-2.637-1.042-2.981 0-.345-.262-.727-.584-.851-.321-.123-.713-.914-.871-1.757-.157-.844-1.59-5.753-3.183-10.909l-2.896-9.375-.005-7.708c-.004-5.127.211-8.948.642-11.409 1.752-10.013.446-21.805-3.303-29.824-1.036-2.216-1.883-4.159-1.883-4.319 0-.16-.728-1.367-1.618-2.682-.889-1.315-2.04-3.235-2.558-4.266-2.639-5.261-12.506-15.834-14.776-15.834-.295 0-.837-.46-1.206-1.023-.509-.776-1.698-1.332-4.944-2.308-7.831-2.356-11.974-4.414-15.315-7.608-1.676-1.603-6.879-4.071-9.47-4.493-1.539-.25-2.617-.68-3.023-1.203-.348-.448-1.194-.937-1.882-1.088-2.553-.559-11.737-3.615-13.75-4.575-1.145-.547-2.833-1.216-3.75-1.487-6.858-2.032-9.463-5.966-9.461-14.286.002-6.336.329-7.504 2.336-8.342.823-.345 1.73-1.156 2.108-1.887.365-.706.927-1.283 1.25-1.283.817 0 2.181-2.037 3.419-5.107.577-1.431 1.384-2.976 1.793-3.435 1.416-1.585 1.845-3.951 1.867-10.298.025-7.203-.207-7.691-3.953-8.283-1.195-.189-2.237-.408-2.316-.487-.079-.079-.177-5.571-.217-12.205-.14-23.329.499-21.469-10.809-31.468C216.219 1.119 205.976-1.802 194.14.816" fillRule="evenodd"/></svg>
              <Glow
                variant="center"
                className="z-0 animate-appear-zoom opacity-0 delay-300"
              />
            </div>
            {secondFighter ? (
              <div className="">
              <div className="absolute -top-2 -left-2 z-10 cursor-pointer h-7 w-7 bg-brand-foreground border-2 border-inherit text-black rounded-full px-2 py-0.5" 
                  onClick={() => {
                    setSecondFighter(null);
                    setValue2('searchQuery', ''); // Reset the form field, otherwise it displays that there are no results after clearing
                    setSecondFighterEra(null); // Reset the fighter era, otherwise it shows the previous era chosen from another fighter, or throws an error if that same index of era chosen doesnt exist
                    setHasSearched2(false); // make sure it doesn't display "No results found", after clearing the search terms
                  }}
                >
                <svg className="absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 pl-px" width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {(secondFighterEra && secondFighterEra) ? (
                  <div className="relative">
                    <div className="absolute flex justify-between w-full mt-3 text-lg bg-brand-foreground/20 p-3 rounded-md">
                    <div className="order-3 cursor-pointer h-6 w-6 bg-brand-foreground text-black rounded-full px-2 py-0.5 relative" 
                        onClick={() => {
                          setSecondFighterEra(null)
                        }}
                      >
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 5L19 19M5 19L19 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className='block order-1'>From {formatDate(secondFighterEra.date)}</span>
                      <span className='block order-2'><span className="text-brand">Rating:</span> {Math.round(secondFighterEra.ending_elo)}</span>
                    </div>
                  </div>
                ) : (
                  secondFighter.elo_history && secondFighter.elo_history.length > 0 ? (
                    <div className="relative w-full">
                      <ul className="absolute w-full mt-2 space-y-2 max-h-50 overflow-y-auto">
                        <span className="text-xl block mb-2">Select an era:</span>
                        {secondFighter.elo_history.map((era) => (
                          <li key={era.date + era.opponent_id} >
                            <Button className="cursor-pointer text-lg text-center w-full flex justify-between" onClick={() => {setSecondFighterEra(era)} }>
                              <span>{formatDate(era.date)}</span>
                              <span>Rating: {Math.round(era.ending_elo)}</span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-lg text-muted-foreground absolute translate-y-2">No Elo history available</p>
                  )
                )}
              </div>
            ) : (
              <div className="relative z-20 mt-3">
                <form onSubmit={handleSubmit2(onSubmit2)} className="absolute w-full flex items-center space-x-2">
                  <Input
                    className="placeholder:text-foreground text-lg! placeholder:text-lg"
                    type="text"
                    {...register2("searchQuery")}
                    placeholder="Search fighter by name / nickname"
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

                {errors2.searchQuery && <p className="absolute text-red-500 text-sm translate-y-10">{errors2.searchQuery.message}</p>}

                {isLoading2 && <Spinner size="small" className="absolute mt-5" />}
                {error2 && <p className="absolute text-red-500 mt-14">Error: {error2}</p>}

                {searchResults2.length > 0 && (
                  <div className="relative w-full">
                    <ul className="absolute w-full mt-10 space-y-2 max-h-50 overflow-y-auto">
                      <span className="text-xl block mb-2 mt-3">Select a fighter:</span>
                      {searchResults2.map((fighter) => (
                        <li key={fighter.fighter_id}>
                          <Button className="cursor-pointer text-center w-full text-lg" onClick={() => {
                            setSecondFighter(fighter);
                            setSearchResults2([]);
                          }}>
                            {fighter.name} {fighter.nickname ? `(${fighter.nickname})` : ''}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasSearched2 && !isLoading2 && !error2 && !secondFighter && searchResults2.length === 0 && (
                  <p className="absolute mt-5 text-muted-foreground text-md">No results found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {firstFighter && secondFighter && firstFighterEra && secondFighterEra && (
          <div className="mt-20 text-center">
            <h2 className="">Results</h2>
            {(winner !== loser) ? (
              <p className="">On {
                  (winner === firstFighter) ? (
                    formatDate(firstFighterEra.date)
                  ) : (
                    formatDate(secondFighterEra.date)
                  )
                }, {winner && winner.name} had a higher rating than {loser && loser.name} did on {
                  (loser === firstFighter) ? (
                    formatDate(firstFighterEra.date)
                  ) : (
                    formatDate(secondFighterEra.date)
                  )
                }</p>
            ) : (
              <p className="">Both fighters had the same rating during these respective eras, which is considered a draw.</p>
            )}
            {/* <p className="">The night before a UFC event, inside an empty arena, and Octagon.</p>
            <h3 className="">A portal opens...</h3>
            <p className="">{firstFighter.name} tumbles out of the portal, with a confused look on their face. {secondFighter.name} follows closely behind, equally bewildered.</p>
            <p className="">As the portal shrinks to close, a younger Herb Dean (God didn't choose Steve Mazagatti?) is spewed onto the canvas, bringing legitimacy to the match.</p>
            <span className="">Both fighters are in shorts, gloved up and ready to go... Herb gives them the green light...</span>
            <h1 className="">Results</h1> */}

          </div>
          
        )}
      </div>
    </Section>
  )
}