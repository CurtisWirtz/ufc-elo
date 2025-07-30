import { Outlet, Link, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuth } from '../AuthProvider'
import { useNavigate } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayoutComponent,
});

function RootLayoutComponent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function from AuthProvider
    navigate({ to: '/login', replace: true }); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* GLOBAL HEADER - Visible on ALL pages - TODO: componentize */}
      <header className="bg-gray-800 text-white p-4 shadow-lg">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold hover:text-gray-300">MMA-Elo Explorer</Link>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-gray-300">Home</Link></li>

            {isAuthenticated ? (
              <>
                <li><Link to="/events" className="hover:text-gray-300">Events</Link></li>

                {user && <span className="mr-2 text-sm text-gray-300">Welcome, {user.username}</span>}
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-200 ease-in-out"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Link visible only when NOT authenticated
              <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
            )}
          </ul>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* GLOBAL FOOTER - Visible on ALL pages - TODO: componentize */}
      <footer className="bg-gray-900 text-white text-center p-4 text-sm shadow-inner">
        &copy; {new Date().getFullYear()} MMA-Elo Explorer. Curtis Wirtz - All rights reserved.
      </footer>

      {/* Don't use in production */}
      <TanStackRouterDevtools />
    </div>
  )
}
