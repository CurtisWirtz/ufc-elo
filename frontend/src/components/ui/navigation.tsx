import { Link } from '@tanstack/react-router'
import type { ReactNode } from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
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
}: NavigationProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {menuItems.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.isLink && (
              <Link to={item.href ?? "/"} className={`${navigationMenuTriggerStyle() && navigationMenuTriggerStyle()} ${item.href && location.pathname.startsWith(item.href) && "text-brand"}`}>
                  {item.title}
              </Link>
            )}
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem asChild>
          <Button asChild variant="glow">
            <Link to={"/matchmaker"} className={`${location.pathname.startsWith("/matchmaker") && "text-brand"}`}>
              Match Maker
            </Link>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}