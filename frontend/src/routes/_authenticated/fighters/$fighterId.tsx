import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/fighters/$fighterId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/fighters/$fighterId"!</div>
}
