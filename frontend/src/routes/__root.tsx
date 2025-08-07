import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuth } from '../AuthProvider'
import { useNavigate } from '@tanstack/react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'

import { ThemeProvider } from "@/components/ui/theme-provider"


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
    <ThemeProvider >
      <div className="w-full min-h-screen">
        <Header isAuthenticated={isAuthenticated} user={user} handleLogout={handleLogout} />

        <main className="flex-grow">
          <Outlet />
        </main>

        <Footer />

        {/* Don't use in production */}
        <TanStackRouterDevtools />
      </div>
    </ThemeProvider>
  )
}
