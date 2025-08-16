import { Link } from '@tanstack/react-router';

import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";

// import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import Github from "@/components/logos/github";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import Glow from "@/components/ui/glow";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Section } from "@/components/ui/section";
import Screenshot from "@/components/ui/screenshot";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function HomeHero({
  title = "Who would've won in their prime, Fedor or Randy?",
  description = "By applying the Elo ranking system to MMA fighters, we can simulate the results of bouts bewteen any two fighters at any point in their careers. Imagine Ubereem vs Ngannou, or Chuck vs Wanderlei while both thier primes.",
  mockup = (
    <Screenshot
      srcLight="/bones-alex.webp"
      srcDark="/bones-alex.webp"
      alt="Which fighter would win in your dream matchups?"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  badge = (
    <Badge variant="outline" className="animate-appear">
      <span className="text-muted-foreground">
        The Elo MMA matchup explorer is out!
      </span>
      <Link to={"/register"} className="flex items-center gap-1">
        Get Started
        <ArrowRightIcon className="size-3" />
      </Link>
    </Badge>
  ),
  buttons = [
    {
      href: "/register",
      text: "Register",
      variant: "default",
    },
    {
      href: "https://github.com/CurtisWirtz/ufc-elo",
      text: "Github",
      variant: "glow",
      icon: <Github className="mr-2 size-4" />,
    },
  ],
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className,
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-4xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>
          <p className="text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </p>
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || "default"}
                  size="lg"
                  asChild
                >
                  <Link to={button.href}>
                    {button.icon}
                    {button.text}
                    {button.iconRight}
                  </Link>
                </Button>
              ))}
            </div>
          )}
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup
                  type="responsive"
                  className="bg-background/90 w-full rounded-xl border-0"
                >
                  {mockup}
                </Mockup>
              </MockupFrame>
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
