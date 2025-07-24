import { Outlet, Link, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/events" className="[&.active]:font-bold">
          Events
        </Link>
        {/* <Link to="/fighters" className="[&.active]:font-bold">
          Fighters
        </Link>
        <Link to="/search" className="[&.active]:font-bold">
          Search
        </Link>
        <Link to="/tests" className="[&.active]:font-bold">
          Testing
        </Link> */}
      </div>
      <hr />
      
      <Outlet />

      {/* Don't use in production */}
      <TanStackRouterDevtools />
    </>
  ),
})
