import { Link, createFileRoute } from '@tanstack/react-router'
import { getEvents } from '../../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Event } from '../../../types/event.types.ts'
import { formatDate, isFutureDate } from '../../../utils/dateUtils.ts'


export const Route = createFileRoute('/_authenticated/events/')({
  component: EventsIndex,
  loader: async ({ context: { queryClient }}) => {
    queryClient.prefetchQuery({
      queryKey: ['events'],
      queryFn: () => getEvents()
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching events</div>,
})

function EventsIndex() {

  const {data: events} = useSuspenseQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(),
  });

  console.log('events:', events.data);

  return (
    <div className="w-full mt-2 items-center bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Events List</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th className="">Event Name</th>
            <th>Date</th>
            <th><span className="mx-auto">Location</span></th>
          </tr>
        </thead>

        <tbody>
          {events && events.data?.results?.map((event: Event) => (
            <tr key={event.event_id}>
              <td className='p-3'>
                <Link
                  to="/events/$eventId"
                  params={{ eventId: event.event_id }}
                  className="text-blue-500 hover:underline flex w-full justify-center"
                >
                  {event.name}
                </Link>
              </td>
              <td className="whitespace-pre p-3 flex flex-col items-center">{isFutureDate(event.date) && <span className="text-red-500">Upcoming: </span>}<span>{formatDate(event.date)}</span></td>
              <td className="whitespace-pre p-3 "><span className="flex w-full justify-center">{event.location}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}