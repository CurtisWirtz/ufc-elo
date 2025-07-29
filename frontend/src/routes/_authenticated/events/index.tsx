import { Link, createFileRoute } from '@tanstack/react-router'
import { getEvents } from '../../../api/queries.ts'
// import { useSuspenseQuery } from '@tanstack/react-query'

type Event = {
    event_id: string;
    name: string;
    date: string;
    location: string;
}
// import { useAuth } from '../../AuthProvider';

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
  // const { user } = useAuth(); // Access user data if needed

  // const {data: events} = useSuspenseQuery({
  //   queryKey: ['events'],
  //   queryFn: () => getEvents(),
  // });

  // Dummy event data
  const events: { data: Event[] } = { data: [] };
  events.data = [
    { event_id: '1', name: "Annual Tech Conference", date: "August 15, 2025", location: "Seattle, WA" },
    { event_id: '2', name: "Community Meetup", date: "September 5, 2025", location: "Online" },
    { event_id: '3', name: "Dev Hackathon", date: "October 20-22, 2025", location: "San Francisco, CA" },
    { event_id: '4', name: "Winter Gala", date: "December 10, 2025", location: "New York, NY" },
  ];
  
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