import { Link } from '@tanstack/react-router'
import * as React from "react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import LogoUI from "../logos/octagon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import { Button } from "@/components/ui/button";

interface ComponentItem {
  title: string;
  href: string;
  description: string;
}

interface MenuItem {
  title: string;
  href?: string;
  isLink?: boolean;
  content?: ReactNode;
}

interface NavigationProps {
  menuItems?: MenuItem[];
  components?: ComponentItem[];
  logo?: ReactNode;
  logoTitle?: string;
  logoDescription?: string;
  logoHref?: string;
  introItems?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export default function Navigation({
  menuItems = [
    // {
    //   title: "Getting started",
    //   content: "default",
    // },
    // {
    //   title: "Components",
    //   content: "components",
    // },
    {
      title: "Events",
      isLink: true,
      href: "/events",
    },
    {
      title: "Fighters",
      isLink: true,
      href: "/fighters",
    },
  ],
  logo = <LogoUI />,
  logoTitle = "Elo MMA",
  logoDescription = "Welcome to Elo MMA.",
  logoHref = "/",
}: NavigationProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {menuItems.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.isLink ? (
              <Link to={item.href || ""} className={`${navigationMenuTriggerStyle()} ${location.pathname.startsWith(item.href) ? "text-brand" : "text-muted-foreground hover:text-foreground"}`}>
                {/* <NavigationMenuLink className={navigationMenuTriggerStyle()}> */}
                  {item.title}
                {/* </NavigationMenuLink> */}
              </Link>
            ) : (
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.content === "default" ? (
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="from-muted/30 to-muted/10 flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            to={logoHref}
                          >
                            {logo}
                            <div className="mt-4 mb-2 text-lg font-medium">
                              {logoTitle}
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              {logoDescription}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {introItems.map((intro, i) => (
                        <ListItem key={i} href={intro.href} title={intro.title}>
                          {intro.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : item.content === "components" ? (
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : (
                    item.content
                  )}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem asChild>
          <Button asChild variant="glow">
            <Link to={"/matchmaker"} className="">
              <span className="">Match Maker</span>
            </Link>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"a"> & { title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          data-slot="list-item"
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
