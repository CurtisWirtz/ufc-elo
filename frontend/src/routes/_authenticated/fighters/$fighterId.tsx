import { Link, createFileRoute } from '@tanstack/react-router'
import { getItemById } from '../../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { formatDate, calculateAge, isFutureDate } from '../../../lib/dateUtils.ts'
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import {Breadcrumbs} from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button.tsx'


export const Route = createFileRoute('/_authenticated/fighters/$fighterId')({
  component: FighterPage,
  loader: async ({ params: { fighterId }, context: { queryClient } }) => {
    await queryClient.prefetchQuery({
      queryKey: ['fighters', fighterId],
      queryFn: () => getItemById(fighterId, "fighters")
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching fighters</div>,
})

function FighterPage() {
  const { fighterId } = Route.useParams();

  const {data: fighter} = useSuspenseQuery({
    queryKey: ['fighters', fighterId],
    queryFn: () => getItemById(fighterId, "fighters")
  });

  // console.log(fighter.data);
  
  function convertInchestoFeetAndInches(heightIn: number): string {
    const feet = Math.floor(heightIn / 12);
    const inches = heightIn % 12;
    return `${feet}'${inches}"`;
  }

  console.log("FIGHTER:", fighter.data);

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
            <div className="col-span-1 flex flex-col items-center">
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

          {fighter.data?.participated_bouts && fighter.data?.participated_bouts.length > 0 && (
            isFutureDate(fighter.data?.participated_bouts[0].event.date) && (
              <div className="border-1 p-4 rounded mb-6 text-center flex flex-col">
                <p className="text-2xl text-brand mb-2">Upcoming Bout:</p>
                <span className="mb-2">{formatDate(fighter.data?.participated_bouts[0].event.date)} - {fighter.data?.participated_bouts[0].event.location}</span>
                <p className="text-md">
                  <Button asChild variant="secondary" className="group w-min">
                    <Link to={`/events/${fighter.data?.participated_bouts[0].event.event_id}`}>
                      {fighter.data?.participated_bouts[0].event.name}
                      <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                    </Link>
                  </Button>
                </p>
                <span className="mt-6 mb-2">Opponent: </span>
                <p className="">
                  {(fighter.data?.participated_bouts[0].fighter_1.fighter_id === fighter.data.fighter_id) ? (
                    <Button asChild variant="secondary" className="group w-min">
                      <Link className="text-blue-500 hover:underline" to={`/fighters/${fighter.data?.participated_bouts[0].fighter_2.fighter_id}`}>
                        {fighter.data?.participated_bouts[0].fighter_2.name}
                        <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" className="group w-min">
                      <Link className="text-blue-500 hover:underline" to={`/fighters/${fighter.data?.participated_bouts[0].fighter_1.fighter_id}`}>
                        {fighter.data?.participated_bouts[0].fighter_1.name}
                        <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                      </Link>
                    </Button>
                  )}
                </p>
              </div>
            )
          )}

          <h1 className="text-3xl mb-5 text-brand text-center">Bout History</h1>
          <div className="hidden md:grid grid-cols-12 border-b border-brand">
            <div className="col-span-4 py-3 px-4 text-center text-brand text-lg">Opponent</div>
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
                    <div key={bout.bout_id} className="py-5 tablet:py-3 md:grid grid-cols-12 border-b last:border-0">
                      <div className="col-span-4 text-center">
                        {bout.winning_fighter ? 
                          (fighter.data.fighter_id === bout.winning_fighter.fighter_id) ? (
                            <span className="border-2 border-brand text-brand rounded-sm px-2 py-1.5 mr-2">
                              Win
                            </span>
                          ) : (
                            <span className="mr-5">
                              Loss
                            </span>
                          )
                        : (<span className="block text-brand  uppercase">{bout.method}</span>)
                        }

                        {(bout.fighter_1.fighter_id === fighter.data.fighter_id) ? (
                          <Button asChild variant="secondary" className="group w-min">
                            <Link to={`/fighters/${bout.fighter_2.fighter_id}`}>
                              {bout.fighter_2.name}
                              <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="secondary" className="group w-min">
                            <Link to={`/fighters/${bout.fighter_1.fighter_id}`}>
                              {bout.fighter_1.name}
                              <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                            </Link>
                          </Button>
                        )}
                        {bout.details && <div className="text-sm font-normal mt-2">{bout.details}</div>}
                      </div>
                      <div className="col-span-4 text-center flex flex-col items-center justify-center">
                        <Button asChild variant="secondary" className="group w-min">
                          <Link to={`/events/${bout.event.event_id}`}>
                            {bout.event.name}
                            <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                          </Link>
                        </Button>
                        <span className="mt-2">{formatDate(bout.event.date)}</span>
                      </div>
                      <div className="col-span-2 text-center flex flex-col items-center justify-center">
                        <span className="text-sm">{bout.method}</span>
                        {bout.referee && <span className="text-sm mt-2">Referee: {bout.referee}</span>}
                      </div>
                      <div className="col-span-1 text-center flex items-center justify-center">{bout.ending_round}</div>
                      <div className="col-span-1 text-center flex items-center justify-center">{bout.ending_time}</div>
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
