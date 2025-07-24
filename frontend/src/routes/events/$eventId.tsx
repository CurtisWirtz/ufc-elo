import { createFileRoute } from '@tanstack/react-router'
import EventPage from './_components/EventPage.tsx'

export const Route = createFileRoute('/events/$eventId')({
  component: EventPage,
})
