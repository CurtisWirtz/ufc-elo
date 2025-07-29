import { Link, createFileRoute } from '@tanstack/react-router'
import { getEventById } from '../../../api/queries.ts'

export const Route = createFileRoute('/_authenticated/events/$eventId')({
  component: EventPage,
})

function EventPage() {
  const { eventId } = Route.useParams();
  const { data: event, isLoading, isError } = getEventById(eventId);

  return (
    <>
      <Link to={`/events`}>Back to Events</Link>
      <div>Hello "/events/{eventId}"!</div>
      {
        isLoading ? <h1>Loading...</h1> : isError ? <h1>Error fetching events</h1> : (
          event &&
          <div className={`mb-2 text-xl`}>{event.title}</div>
        )
      }
    </>
  );
}
