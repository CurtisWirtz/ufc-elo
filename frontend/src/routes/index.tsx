import { createFileRoute } from '@tanstack/react-router'
import HomeHero from '@/components/HomeHero';
import Kicker from '@/components/Kicker';
import DatasetStats from '@/components/DatasetStats';

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
      <DatasetStats />
      <Kicker />
    </>
  )
}