import { Link, createFileRoute } from '@tanstack/react-router'
import { getItemById } from '../../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Bout } from '../../../types/bout.types.ts'
import { formatDate } from '../../../lib/dateUtils.ts'
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import {Breadcrumbs} from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button.tsx'


export const Route = createFileRoute('/_authenticated/events/$eventId')({
  component: EventPage,
  loader: async ({ params: { eventId }, context: { queryClient } }) => {
    await queryClient.prefetchQuery({
      queryKey: ['events', eventId],
      queryFn: () => getItemById(eventId, "events")
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching events</div>,
})

function EventPage() {
  const { eventId } = Route.useParams();
 
  const {data: event} = useSuspenseQuery({
    queryKey: ['events', eventId],
    queryFn: () => getItemById(eventId, "events")
  });

  const ordered_bouts: Bout[] = event.data.ordered_bouts;
  // console.log('event.data:', event.data);
  // console.log('event.ordered_bouts:', event.data.ordered_bouts[0]);

  return (
    <Section
      className={cn(
          "py-0! px-5! max-w-container mx-auto",
          "",
    )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs overrideString={event.data.name} />
        <h1 className="animate-appear text-4xl font-bold mb-6 text-center">{event.data.name}</h1>
        <p className="animate-appear text-2xl mb-6 text-center text-brand">{formatDate(event.data.date)} | {event.data.location}</p>
        <div className="w-full animate-appear p-6 rounded-md bg-brand/10 shadow-lg">
          {ordered_bouts && ordered_bouts.length > 0 && (
            <div className="flex flex-col">
              <div className="hidden md:grid grid-cols-8 border-b border-brand">
                <div className="col-span-4 py-3 px-4 text-center text-brand text-2xl">Fighters</div>
                <div className="col-span-2 py-3 px-4 text-center text-brand text-2xl">Method</div>
                <div className="col-span-1 py-3 px-4 text-center text-brand text-2xl">Round</div>
                <div className="col-span-1 py-3 px-4 text-center text-brand text-2xl">Time</div>
              </div>
              <div>
                {ordered_bouts.map((bout) => (
                  <div key={bout.bout_id} className="py-5 tablet:py-3 border-b border-light-foreground last:border-0 md:grid md:grid-cols-8">
                      <div className="col-span-4 flex flex-col pb-5">
                        <div className="flex">
                          <div className="flex justify-center w-full mx-auto">
                            <div className="flex flex-col items-center">
                              <Button asChild variant="secondary" className={`group ${bout.winning_fighter?.fighter_id && bout.fighter_1.fighter_id === bout.winning_fighter.fighter_id && 'border-brand border-2'}`}>
                                <Link to={`/fighters/${bout.fighter_1.fighter_id}`} className="text-center">
                                  {bout.fighter_1.name}
                                  <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                                </Link>
                              </Button>
                              {bout.winning_fighter ? 
                                (bout.fighter_1.fighter_id === bout.winning_fighter.fighter_id) && (
                                  <span className="text-brand font-semibold tracking-wider mt-2">
                                    Winner
                                  </span>
                                )
                              :
                              (<span className="text-brand uppercase mt-2">{bout.method}</span>)
                              }
                            </div>
                            <div className="mx-4 flex mt-1 text-brand">vs</div>
                            <div className="flex flex-col items-center">
                              <Button asChild variant="secondary" className={`group ${bout.winning_fighter?.fighter_id && bout.fighter_2.fighter_id === bout.winning_fighter.fighter_id && 'border-brand border-2'}`}>
                                <Link to={`/fighters/${bout.fighter_2.fighter_id}`} className="text-center">
                                  {bout.fighter_2.name}
                                  <span className="ml-2 group-hover:translate-x-1 duration-300 transition-all text-brand">&#187;</span>
                                </Link>
                              </Button>
                              {bout.winning_fighter ? 
                                (bout.fighter_2.fighter_id === bout.winning_fighter.fighter_id) && (
                                  <span className="text-brand font-semibold tracking-wider mt-2">
                                    Winner
                                  </span>                                
                                )
                              :
                              (<span className="text-brand uppercase mt-2">{bout.method}</span>)
                              }
                            </div>
                          </div>
                        </div>
                        {bout.details && 
                          <div className="mx-auto text-sm mt-2 text-center order-last md:order-none ">
                            <span>{bout.details}</span>
                          </div>
                        }
                        <div className="md:hidden flex justify-between mt-2">
                          <div className="text-center flex flex-col">
                            <span className="text-brand font-semibold tracking-wider">Method: </span>
                            <span>{bout.method}</span>
                          </div>
                          <div className="text-center flex flex-col">
                            <span className="text-brand font-semibold tracking-wider">Round: </span>
                            <span>{bout.ending_round}</span>
                          </div>
                          <div className="text-center flex flex-col">
                            <span className="text-brand font-semibold tracking-wider">Time: </span>
                            <span>{bout.ending_time}</span>
                            </div>
                        </div>
                      </div>
                      <div className="hidden col-span-2 text-center md:flex justify-center items-center">{bout.method}</div>
                      <div className="hidden col-span-1 text-center md:flex justify-center items-center">{bout.ending_round}</div>
                      <div className="hidden col-span-1 text-center md:flex justify-center items-center">{bout.ending_time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}      
          </div>
      </div>
    </Section>
  );
}
