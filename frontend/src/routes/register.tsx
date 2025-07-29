import { createFileRoute } from '@tanstack/react-router'
import Form from '@/components/Form'

export const Route = createFileRoute('/register')({
  component: () => <Form route="/api/user/register/" method="register" />,
})