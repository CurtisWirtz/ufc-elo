import HomeHero from '@/components/HomeHero';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  // beforeLoad: () => {
  //   // Redirect to /events and replace the current entry in history
  //   throw redirect({ to: '/events', replace: true })
  // },
  component: LandingPage,
})

export default function LandingPage() {
  return (
    <>
      <HomeHero />
    </>
  )
}