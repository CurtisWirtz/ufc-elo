import { createFileRoute } from '@tanstack/react-router'
import { getEvents } from '../../api/queries.ts'
import EventsIndex from './_components/EventsIndex.tsx'


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