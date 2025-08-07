import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Section } from "@/components/ui/section";
import { NumberTicker } from "@/components/magicui/number-ticker";

export default function DatasetStats(className: string = "") {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 mx-5",
        className,
      )}
    >
      <div className="mb-40 max-w-container mx-auto flex flex-col gap-12 pt-16 sm:gap-10">
        <div className="flex flex-col gap-6 sm:gap-12">
            <h1 className="animate-appear opacity-0 from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-4xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:leading-tight">
                Browse our massive collection of MMA data:
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-8">
                <div className="flex flex-col col-span-1 items-baseline gap-2">
                    <NumberTicker
                        value={10845}
                        decimalPlaces={0}
                        className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-7xl font-medium text-transparent drop-shadow-[2px_1px_24px_var(--brand-foreground)] transition-all duration-300"
                    />
                    <h2 className="text-brand">BOUTS</h2>
                </div>
                <div className="flex flex-col col-span-1 items-baseline gap-2">
                    <NumberTicker
                        value={4375}
                        decimalPlaces={0}
                        delay={0.3}
                        className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-7xl font-medium text-transparent drop-shadow-[2px_1px_24px_var(--brand-foreground)] transition-all duration-300"
                    />
                    <h2 className="text-brand">FIGHTERS</h2>
                </div>
                <div className="flex flex-col col-span-1 items-baseline gap-2">
                    <NumberTicker
                        value={1209}
                        decimalPlaces={0}
                        delay={0.6}
                        className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-7xl font-medium text-transparent drop-shadow-[2px_1px_24px_var(--brand-foreground)] transition-all duration-300"
                    />
                    <h2 className="text-brand mb-20">EVENTS</h2>
                </div>
            </div>
        </div>
      </div>
    </Section>
  )
}


