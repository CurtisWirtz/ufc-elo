import { Link } from '@tanstack/react-router'
import { HeaderSearchBar } from './HeaderSearchBar'
import avatarSvg from '../assets/svg/avatar.svg';

import { Menu } from "lucide-react";
import type { ReactNode } from "react";

// import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import LogoUI from "@/components/logos/octagon";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import Navigation from "@/components/ui/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ui/mode-toggle";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Header({
  isAuthenticated, 
  user, 
  handleLogout,

  logo = <LogoUI />,
  name = "MMA Elo Explorer",
  homeUrl = "/",
  mobileLinks = [
    { text: "Fighters", href: "/fighters" },
    { text: "Events", href: "/events" },
  ],
  actions = [
    { text: "Log in", href: "/login", isButton: false },
    {
      text: "Register",
      href: "/register",
      isButton: true,
      variant: "default",
    },
  ],
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <Link
              to={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
              {name}
            </Link>
            <ModeToggle />
            {isAuthenticated && (
              <>
                {showNavigation && (customNavigation || <Navigation />)}
              </>
            )}
          </NavbarLeft>
          <NavbarRight>
            {!isAuthenticated ? (
              actions.map((action, index) => 
                action.isButton ? (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                  >
                    <Link to={action.href}>
                      {action.icon}
                      {action.text}
                      {action.iconRight}
                    </Link>
                  </Button>
                ) : (
                  <Link
                    key={index}
                    to={action.href}
                    className="text-sm block"
                  >
                    {action.text}
                  </Link>
                ),
              )
            ) : (
              <div className="hidden md:flex items-center gap-2">
                {user && (
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={avatarSvg} />
                      <AvatarFallback>Elo</AvatarFallback>
                    </Avatar>
                    <div className="" tabIndex={0}>
                      <span className="sr-only">Logged in as</span><span>{user.username}</span>
                    </div>
                  </div>
                )}
                <Button onClick={handleLogout} className="cursor-pointer" aria-label="Log out of your account">
                  Logout
                </Button>
              </div>
            )}
            {isAuthenticated && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 md:hidden cursor-pointer"
                  >
                    <Menu className="size-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      to={homeUrl}
                      className="flex items-center gap-2 text-xl font-bold"
                    >
                      <span>{name}</span>
                    </Link>
                    {user && (
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={avatarSvg} />
                          <AvatarFallback>Elo</AvatarFallback>
                        </Avatar>
                        <div className="" tabIndex={0}>
                          <span className="sr-only">Logged in as</span><span>{user.username}</span>
                        </div>
                      </div>
                    )}
                    {mobileLinks.map((link, index) => (
                      <SheetClose key={index} className="text-start" asChild>
                        <Link
                          to={link.href}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {link.text}
                        </Link>
                      </SheetClose>
                    ))}
                    <HeaderSearchBar sheetClose={SheetClose} />
                    <Button onClick={handleLogout} className="cursor-pointer" aria-label="Log out of your account">
                      Logout
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
