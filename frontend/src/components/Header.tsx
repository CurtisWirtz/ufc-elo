import { Link } from '@tanstack/react-router'
import { HeaderSearchBar } from './HeaderSearchBar'
import avatarSvg from '../assets/svg/avatar.svg';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const Header = ({ isAuthenticated, user, handleLogout }) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="mr-auto">
          <NavigationMenuLink asChild>
            <Link to="/" className="text-xl font-bold">MMA-Elo</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {isAuthenticated ? (
          <>
            <NavigationMenuItem className="">
              <NavigationMenuLink asChild>
                <Link to="/events" className="">Events</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem className="mr-auto">
              <NavigationMenuLink asChild>
                <Link to="/fighters" className="">Fighters</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <HeaderSearchBar />
            </NavigationMenuItem>

            {user && (
              <NavigationMenuItem className="text-xs flex flex-col pt-1.5">
                <Avatar>
                  <AvatarImage src={avatarSvg} />
                  <AvatarFallback>Elo</AvatarFallback>
                </Avatar>
                {user.username}
              </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              <Button onClick={handleLogout}>
                Log Out
              </Button>
            </NavigationMenuItem>
          </>
        ) : (
          // Links visible only when NOT authenticated
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/login" className="">Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/register" className="">Register</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default Header