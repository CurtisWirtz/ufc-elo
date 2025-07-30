import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect to /events and replace the current entry in history
    throw redirect({ to: '/events', replace: true })
  },
})