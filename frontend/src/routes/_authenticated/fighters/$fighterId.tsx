// @ts-nocheck
import { Link, createFileRoute } from '@tanstack/react-router'
import { getItemById } from '../../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { formatDate, calculateAge, isFutureDate } from '../../../lib/dateUtils.ts'
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import {Breadcrumbs} from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button.tsx'
import FighterEloChart from '@/components/FighterEloChart.tsx'
import { Spinner } from '@/components/ui/spinner.tsx';


export const Route = createFileRoute('/_authenticated/fighters/$fighterId')({
  component: FighterPage,
  loader: async ({ params: { fighterId }, context: { queryClient } }) => {
    await queryClient.prefetchQuery({
      queryKey: ['fighters', fighterId],
      queryFn: () => getItemById(fighterId, "fighters")
    });
  },
  pendingComponent: () => <div className="flex justify-center w-full my-20 text-4xl"><Spinner size="medium" /></div>,
  errorComponent: () => <div className="flex justify-center w-full my-20 text-4xl">Error fetching fighters</div>,
})

function FighterPage() {
  const { fighterId } = Route.useParams();

  const {data: fighter} = useSuspenseQuery({
    queryKey: ['fighters', fighterId],
    queryFn: () => getItemById(fighterId, "fighters")
  });
  
  function convertInchestoFeetAndInches(heightIn: number): string {
    const feet = Math.floor(heightIn / 12);
    const inches = heightIn % 12;
    return `${feet}'${inches}"`;
  }

  return (
    <Section
      className={cn(
        "py-0! px-5! max-w-container mx-auto",
        "",
    )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs overrideString={fighter.data.name} />
        <h1 className="animate-appear text-4xl font-bold mb-6 text-center">
          {fighter.data.name} 
          {fighter.data?.nickname && 
            <span className="ml-2 italic text-brand">"{fighter.data?.nickname}"</span>
          }
        </h1>
        <div className="w-full animate-appear p-6 rounded-md bg-brand/10 shadow-lg">
          <div className="grid grid-cols-3 mb-5">
            <div className="col-span-1 flex flex-col items-center">
              <span className="text-2xl text-brand">Record:</span>
              <span>{fighter.data.wins}-{fighter.data.losses}-{fighter.data.draws}</span>
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <span className="text-2xl text-brand">Height:</span>
              {fighter.data.height_in ? (<span>{convertInchestoFeetAndInches(fighter.data.height_in)}</span>) : (<span>N/A</span>)}
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <span className="text-2xl text-brand">Weight:</span>
              <span>{fighter.data.weight_lb} lbs</span>
            </div>
          </div>
          <div className="grid grid-cols-3 mb-11">
            <div className="col-span-1 flex flex-col items-center">
              <span className="text-2xl text-brand">Stance:</span>
              {fighter.data.stance ? <span>{fighter.data.stance}</span> : <span>N/A</span>}
            </div>
            <div className="col-span-1 flex flex-col items-center text-center">
              <span className="text-2xl text-brand">Age:</span>
              {fighter.data.date_of_birth ? (
                <>
                  <span>{calculateAge(fighter.data.date_of_birth)} years old</span>
                  <span>{formatDate(fighter.data.date_of_birth)}</span>
                </>
              ) : (
                <span>N/A</span>
              )}
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <span className="text-2xl text-brand">Reach:</span>
              <span>{fighter.data.reach_in ? `${fighter.data.reach_in} inches` : 'N/A'}</span>
            </div>
          </div>
          
          {/* Ranking Chart */}
          <div className="grid grid-cols-2 max-w-lg w-full mx-auto mb-5">
            <div className="col-span-1 flex flex-col tablet:flex-row text-2xl text-center justify-center">
              <span className="text-brand tablet:mr-2">Rating:</span>
              <span className="">{Math.round(fighter.data.elo)}</span>
            </div>
            <div className="col-span-1 flex flex-col tablet:flex-row text-2xl text-center justify-center">
              <span className="text-brand tablet:mr-2">Peak Rating:</span>
              <span className="">{Math.round(fighter.data.peak_elo)}</span>
            </div>
          </div>
          <div className="max-w-3xl mx-auto mb-10">
              <FighterEloChart fighter={fighter.data}/>
          </div>

          {fighter.data?.participated_bouts && fighter.data?.participated_bouts.length > 0 && (
            isFutureDate(fighter.data?.participated_bouts[0].event.date) && (
              <div className="border-1 border-brand p-4 rounded-md mb-6 text-center flex flex-col items-center max-w-2xl mx-auto">
                <p className="text-2xl text-brand mb-2">Upcoming Bout:</p>
                <span className="">{formatDate(fighter.data?.participated_bouts[0].event.date)}</span>
                <span className="">{fighter.data?.participated_bouts[0].event.location}</span>
                <Button asChild variant="secondary" className="group w-min mt-2">
                  <Link to={`/events/${fighter.data?.participated_bouts[0].event.event_id}`}>
                    {fighter.data?.participated_bouts[0].event.name}
                    <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                  </Link>
                </Button>
                <span className="text-xl mt-5 mb-2 text-brand">Opponent: </span>
                <div className="">
                  {(fighter.data?.participated_bouts[0].fighter_1.fighter_id === fighter.data.fighter_id) ? (
                    <Button asChild variant="secondary" className="group w-min">
                      <Link to={`/fighters/${fighter.data?.participated_bouts[0].fighter_2.fighter_id}`}>
                        {fighter.data?.participated_bouts[0].fighter_2.name}
                        <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" className="group w-min">
                      <Link to={`/fighters/${fighter.data?.participated_bouts[0].fighter_1.fighter_id}`}>
                        {fighter.data?.participated_bouts[0].fighter_1.name}
                        <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          )}

          <h1 className="text-3xl mb-5 text-brand text-center">Bout History</h1>
          <div className="hidden tablet:grid grid-cols-12 border-b border-brand">
            <div className="col-span-4 py-3 pl-2.5 pr-4 text-brand text-lg"><span className="mr-9">W/L</span>Opponent<span className="float-right">Rating</span></div>
            <div className="col-span-4 py-3 px-4 text-center text-brand text-lg">Event</div>
            <div className="col-span-2 py-3 px-4 text-center text-brand text-lg">Method</div>
            <div className="col-span-1 py-3 px-4 text-center text-brand text-lg">Round</div>
            <div className="col-span-1 py-3 px-4 text-center text-brand text-lg">Time</div>
          </div>
          {fighter.data?.participated_bouts && fighter.data?.participated_bouts.length > 0 ? (
            <div className="flex flex-col">
              {fighter.data?.participated_bouts.map((bout) => {
                if (!isFutureDate(bout.event.date)) {
                  return (
                    <div key={bout.bout_id} className="py-5 tablet:py-3 tablet:grid grid-cols-12 border-b last:border-0">
                      <div className="tablet:col-span-4 text-center tablet:text-start tablet:grid tablet:grid-cols-[min-content_1fr]">
                        {bout.winning_fighter ? 
                          (fighter.data.fighter_id === bout.winning_fighter.fighter_id) ? (
                            <span className="border-2 border-brand text-brand rounded-sm px-2 py-1.5 tablet:mr-3.5 tablet:col-span-1 w-min h-min">
                              Win
                            </span>
                          ) : (
                            <span className="mr-5 tablet:col-span-1 w-full tablet:w-min tablet:ml-2.5 mx-auto flex items-center justify-center tablet:mb-3">
                              Loss
                            </span>
                          ) : (
                            <span className="block text-brand uppercase tablet:col-span-1 tablet:flex tablet:items-center justify-center tablet:mb-3 tablet:mr-4 tablet:ml-2">
                              {((bout.method.toUpperCase()) === "OVERTURNED") ? (
                                bout.method
                              ) : (
                                "DRAW"
                              )}
                            </span>
                          )
                        }

                        {(bout.fighter_1.fighter_id === fighter.data.fighter_id) ? (
                          <div className="mt-3 tablet:mt-0 tablet:flex">
                            <Button asChild variant="secondary" className="group w-min tablet:col-span-1">
                              <Link to={`/fighters/${bout.fighter_2.fighter_id}`}>
                                {bout.fighter_2.name}
                                <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                              </Link>
                            </Button>
                            <div className="hidden tablet:flex flex-grow justify-end mr-5 ">
                              {fighter.data.elo_history.filter(entry => entry.bout_id === bout.bout_id).map((entry_data) => (
                                <div key={bout.bout_id} className="flex flex-col text-center">
                                  <span className="">{Math.round(entry_data.ending_elo)}</span>
                                  <span className="text-brand">
                                    {entry_data.elo_change > 0 ? "+" : ""}
                                    {Math.round(entry_data.elo_change)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="tablet:flex">
                            <Button asChild variant="secondary" className="group w-min tablet:col-span-1">
                              <Link to={`/fighters/${bout.fighter_1.fighter_id}`}>
                                {bout.fighter_1.name}
                                <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                              </Link>
                            </Button>
                            <div className="hidden tablet:flex flex-grow justify-end mr-5">
                              {fighter.data.elo_history.filter(entry => entry.bout_id === bout.bout_id).map((entry_data) => (
                                <div key={entry_data.bout_id} className="flex flex-col text-center">
                                  <span className="">{Math.round(entry_data.ending_elo)}</span>
                                  <span className="text-brand">
                                    {entry_data.elo_change > 0 ? "+" : ""}
                                    {Math.round(entry_data.elo_change)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="tablet:hidden flex flex-grow justify-center mt-2">
                          {fighter.data.elo_history.filter(entry => entry.bout_id === bout.bout_id).map((entry_data) => (
                            <div key={entry_data.bout_id} className="flex text-center">
                              <div><span className="text-brand">Rating:</span> {Math.round(entry_data.ending_elo)}</div>
                              <span className="text-brand ml-3">
                                ( {entry_data.elo_change > 0 ? "+" : ""}{Math.round(entry_data.elo_change)} )
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm font-normal mt-2 tablet:col-span-2 tablet:ml-2.5 h-max">{bout.details ? bout.details : <span className="hidden tablet:flex text-transparent" tabIndex={-1}>No details</span>}</div>
                        {bout.referee && <span className="flex tablet:hidden justify-center text-sm mt-1">Referee: {bout.referee}</span>}
                      </div>
                      <div className="flex justify-between tablet:hidden my-2 max-w-80 mx-auto">
                        <div className="text-center flex flex-col items-center">
                          <span className="text-brand">Method:</span>
                          <span className="text-sm">{bout.method}</span>
                        </div>
                        <div className="text-center flex flex-col items-center">
                          <span className="text-brand">Round:</span>
                          {bout.ending_round}
                        </div>
                        <div className="text-center flex flex-col items-center">
                          <span className="text-brand">Time:</span>
                          {bout.ending_time}
                        </div>
                      </div>
                      <div className="tablet:col-span-4 text-center flex flex-col items-center justify-center">
                        <Button asChild variant="secondary" className="group w-min order-2 tablet:order-none">
                          <Link to={`/events/${bout.event.event_id}`}>
                            {bout.event.name}
                            <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                          </Link>
                        </Button>
                        <span className="mt-2 order-1 tablet:order-none">{formatDate(bout.event.date)}</span>
                      </div>
                      <div className="hidden tablet:col-span-2 text-center tablet:flex flex-col items-center justify-center">
                        <span className="text-sm">{bout.method}</span>
                        {bout.referee && <span className="text-sm mt-2">Referee: {bout.referee}</span>}
                      </div>
                      <div className="hidden tablet:col-span-1 text-center tablet:flex items-center justify-center">{bout.ending_round}</div>
                      <div className="hidden tablet:col-span-1 text-center tablet:flex items-center justify-center">{bout.ending_time}</div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="p-3 text-center">
              No bout history found.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
