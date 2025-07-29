import { createFileRoute } from '@tanstack/react-router'
import Form from '@/components/Form'

export const Route = createFileRoute('/login')({
  component: () => <Form route="/api/token/" method="login" />,
})
