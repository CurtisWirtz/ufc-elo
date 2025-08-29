import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

// the _underscore convention (since im new, ill make this comment) usually means a "layout" route.
export const Route = createFileRoute('/_authenticated')({
  // The beforeLoad function is executed BEFORE the route's components are rendered, ideal place for auth checks and redirects
  beforeLoad: async ({ context, location }) => {
    console.log("Auth Guard: Checking authentication for protected route...");
    // @ts-ignore
    const isAuthenticated = await context.auth.checkAuthValidity();

    if (!isAuthenticated) {
      console.log("Auth Guard: User not authenticated, redirecting to login.");
      throw redirect({
        to: '/login',
        replace: true,
        search: {
          redirect: location.href, // passes the original intended URL as a search parameter (the power of TanStack router - search params)
        },
      });
    }
  },
  // All child routes of /_authenticated will render inside this <Outlet>
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />
}