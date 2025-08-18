import { Section } from "@/components/ui/section";
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/matchmaker/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MatchMaker />;
}

function MatchMaker() {
  return (
    <Section
      className={cn(
          "py-0! px-5! max-w-container mx-auto",
          "",
    )}>
      <div className="bg-background w-full mt-6 items-center min-h-screen">
        <Breadcrumbs />
        <h1 className="animate-appear text-4xl font-bold mb-6">Match Maker</h1>
      </div>
    </Section>
  )
}
