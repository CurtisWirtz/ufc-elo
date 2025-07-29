import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'; 
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, checkAuthForRouter } from './AuthProvider'; 
import './styles.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ 
  routeTree,
  defaultNotFoundComponent: () => {
    return <div><h1 className="text-4xl">404 error: Page not found.</h1></div>
  },
  // Pass the query client to the router context (Tanstack Router)
  // also, checkAuthForRouter to check auth validity
  context: { 
    queryClient,
    auth: {
      checkAuthValidity: checkAuthForRouter,
    }
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
    context: {
      queryClient: typeof queryClient;
      auth: {
        checkAuthValidity: () => Promise<boolean>; // it's async, so a Promise
      };
    };
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>

        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        
        
        {/* Don't use in production PRODUCTION_XXX */}
        <ReactQueryDevtools initialIsOpen={false} />

      </QueryClientProvider>
    </StrictMode>
  )
}