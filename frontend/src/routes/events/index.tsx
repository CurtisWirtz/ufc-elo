import { Link, createFileRoute } from '@tanstack/react-router'
import { getEvents } from '../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/events/')({
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

  console.log(events);

  return (
    <div className="w-full mt-2 items-center bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Events List</h1>
      <ul>
        {events.data?.map(event => (
          <li key={event.event_id} className="mb-2">
            <Link to={`./${event.event_id}`} className="text-blue-500 hover:underline">
              {event.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}