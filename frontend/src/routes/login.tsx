import { createFileRoute, redirect } from '@tanstack/react-router'
import Form from '@/components/Form'
import { checkAuthForRouter } from '../AuthProvider'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    // Use your standalone auth check function here
    const isLoggedIn = await checkAuthForRouter();

    if (isLoggedIn) {
      // console.log("User is already logged in, redirecting from /login to /events.");
      // If they are logged in, redirect them to /events
      throw redirect({ to: '/events', replace: true })
    }
  },
  component: () => <Form route="/api/token/" method="login" />,
})
