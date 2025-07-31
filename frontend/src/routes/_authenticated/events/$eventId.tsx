import { Link, createFileRoute } from '@tanstack/react-router'
import { getItemById } from '../../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Bout } from '../../../types/bout.types.ts'
import { formatDate } from '../../../utils/dateUtils.ts'


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
    <div className="w-full mt-2 items-center bg-gray-100 min-h-screen p-6 text-center">
      {event.data?.name && (
        <>
          <h1 className="text-4xl font-bold text-gray-800">{event.data.name}</h1>
          <p className="text-2xl text-gray-600 mb-6">{formatDate(event.data.date)} | {event.data.location}</p>
        </>
      )}

      {ordered_bouts && ordered_bouts.length > 0 && (
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Fighters</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Method</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Round</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody>
            {ordered_bouts.map((bout) => (
              <tr key={bout.bout_id} className="pb-5 border-b border-gray-200">
                  <td className="flex flex-col pb-5">
                    <div className="flex">
                      <div className="flex justify-between grow-1 max-w-[500px] mx-auto">
                        <div className="flex flex-col items-center">
                          <Link to={`/fighters/${bout.fighter_1.fighter_id}`} className="text-center hover:underline text-blue-500">{bout.fighter_1.name}</Link>
                          {bout.winning_fighter ? 
                            (bout.fighter_1.fighter_id === bout.winning_fighter.fighter_id) ? (
                              <div className="bg-green-500 rounded-full text-white w-5 h-5 relative mr-auto"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">W</span></div>
                            ) : (
                              <div className="bg-red-500 rounded-full text-white w-5 h-5 relative mr-auto"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">L</span></div>
                            )
                          :
                          (<span className="bg-blue-500 uppercase">{bout.method}</span>)
                          }
                        </div>
                        <div className="mx-2 flex items-center">vs</div>
                        <div className="flex flex-col items-center">
                          <Link to={`/fighters/${bout.fighter_2.fighter_id}`} className="text-center hover:underline text-blue-500">{bout.fighter_2.name}</Link>
                          {bout.winning_fighter ? 
                            (bout.fighter_2.fighter_id === bout.winning_fighter.fighter_id) ? (
                              <div className="bg-green-500 rounded-full text-white w-5 h-5 relative ml-auto"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">W</span></div>
                            ) : (
                              <div className="bg-red-500 rounded-full text-white w-5 h-5 relative ml-auto"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">L</span></div>
                            )
                          :
                          (<span className="bg-blue-500 uppercase">{bout.method}</span>)
                          }
                        </div>
                      </div>
                    </div>
                    {bout.details && <div className="mx-auto text-sm text-gray-500">{bout.details}</div>}
                  </td>
                  <td className="col-span-1 text-center">{bout.method}</td>
                  <td className="col-span-1 text-center">{bout.ending_round}</td>
                  <td className="col-span-1 text-center">{bout.ending_time}</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}      
    </div>
  );
}
