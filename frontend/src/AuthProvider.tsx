import * as React from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from './api/client.ts';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '@/constants';
import { queryClient } from './queryClient.ts';

// Lots of difficult work done here... for good practice. Next time I'll default to using an established auth tool/framework... lol
// Built off of example from TanStack Router docs:
// https://tanstack.com/router/v1/docs/framework/react/guide/authenticated-routes#authentication-using-react-contexthooks
// TanStack codepen:
// https://tanstack.com/router/v1/docs/framework/react/examples/authenticated-routes?path=examples%2Freact%2Fauthenticated-routes%2Fsrc%2Froutes%2F_auth.tsx

// type for the decoded JWT token
interface DecodedToken {
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: number;
  username: string;
}

type UserData = {
  id: number;
  username: string;
}

// Any component consuming the 'AuthContext.Provider' context
// via `useAuth()` will receive an object conforming to this type
export interface AuthContextType {
  isAuthInitialized: boolean; // auth check status ... toggle loading spinner!
  isAuthenticated: boolean; // true if authenticated. a.k.a. has a valid access token
  user: {
      id: number; // from django/postgres user model id, which is a number
      username: string;
  } | null; // null if no user is logged in
  login: (accessToken: string, refreshToken: string, userData?: UserData) => Promise<void>;
  logout: () => void;

  //This checkAuthValidity is for React Components that use useAuth(),
  // it leverages the state WITHIN AuthProvider for broader checks.
  checkAuthValidity: () => Promise<boolean>;
}

// Actual AuthContext object that is sent thru component tree via context
// provided by an `AuthProvider`. This allows our `useAuth` hook to check for this. starts undefined
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Custom Hook to Consume AuthContext and access values provided by AuthContext.Provider
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext); // Attempts to get the current context value
  if (context === undefined) { 
    // If `context` is `undefined`, it means `useAuth` was called outside of an `AuthProvider`. no bueno!
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Returns the actual authentication context object.
}

// AuthProvider Component. Wrap the application. inside Strictmode and above router and query client provider.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // tracks if the initial authentication check has finished
  const [isAuthInitialized, setIsAuthInitialized] = React.useState<boolean>(false);
  // tracks if the user is currently authenticated
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  // stores the parsed user details from the JWT (we don't have 'ROLE' in this project)
  const [user, setUser] = React.useState<{ id: number; username: string; } | null>(null);

  const logout = React.useCallback(() => {
    console.log('Auth: Performing logout...');
    // Remove both access and refresh tokens from localStorage to completely log out
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    // Update React state to reflect unauthenticated status.
    setIsAuthenticated(false);
    setUser(null);
    // Invalidate/clear React Query cache:
    // This is important because any data fetched while authenticated might now be stale or unauthorized.
    queryClient.invalidateQueries(); // Invalidates all active queries, triggering a refetch for components.
    queryClient.clear();
  }, []);

  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!storedRefreshToken) {
      console.log('Auth: No refresh token found, cannot refresh. Proceeding with logout.');
      logout(); // If no refresh token, it's effectively a full logout.
      return false; // indicate refresh failed.
    }

    try {
      console.log('Auth: Attempting to refresh token...');

      // Make API call to Django backend's token refresh endpoint.
      const res = await api.post('/api/token/refresh/', { refresh: storedRefreshToken });

      if (res.status === 200 && res.data.access) {
        // If refresh is successful, store the new access token.
        localStorage.setItem(ACCESS_TOKEN, res.data.access);

        // Decode the *new* access token to get updated user details.
        const decoded: DecodedToken = jwtDecode(res.data.access);

        // Update user state with details from the new token.
        setUser({ id: decoded.user_id, username: decoded.username });
        setIsAuthenticated(true); // Mark as authenticated.

        console.log('Auth: Token refreshed successfully.');
        
        return true; // Indicate refresh succeeded.
      } else {
        // If refresh API returns non-200, it means the refresh token is likely invalid or expired.
        console.warn('Auth: Refresh token failed with status:', res.status, res.data);
        logout(); // Same flow as above... perform a full logout.
        return false; // then indicate that the refresh failed
      }
    } catch (error) {
      console.error('Auth: Error during token refresh API call:', error);
      logout();
      return false;
    }
  }, [logout]); // refreshToken calls logout

  // Checks auth status when app loads or when auth state needs re-evaluation
  const checkAuthStatus = React.useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      console.log('Auth: No access token found during initial status check.');
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthInitialized(true);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const tokenExpiration: number = decoded.exp;
      const now: number = Date.now() / 1000; // current time in seconds

      if (tokenExpiration < now) {
        console.log('Auth: Access token expired. Attempting refresh...');
        // If the access token is expired, try to refresh it
        await refreshToken();
      } else {
        // If the access token is valid (not expired).
        setUser({ id: decoded.user_id, username: decoded.username });
        setIsAuthenticated(true);
        console.log('Auth: Access token is valid.');
      }
    } catch (error) {
      console.error("Auth: Error decoding token or token invalid during initial check:", error);
      logout();
    } finally {
      // stop the loading spinners or whatever we end up displaying
      setIsAuthInitialized(true);
    }
  }, [refreshToken, logout]);

  // login (called by login form component AFTER successfully receiving access and refresh tokens
  const login = React.useCallback((accessToken: string, newRefreshToken: string, userData?: UserData) => {
    console.log('Auth: Performing login (storing tokens from backend response)...');
    // Store the newly received tokens.
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, newRefreshToken);

    
    try {
      setIsAuthenticated(true);

      const decoded: DecodedToken = jwtDecode(accessToken);
      console.log('decoded: ', decoded);
      setUser({ id: decoded.user_id, username: decoded.username });

      if (userData) {
        // If user data is provided (e.g., from registration response), use it directly
        setUser(userData);
        console.log("Auth: Logged in with provided user data:", userData.username);
      }

      // Invalidate React Query cache: User data has likely changed, or new user-specific data is now accessible.
      queryClient.invalidateQueries();
    } catch (error) {
      // If the token received from the backend is somehow invalid, log out.
      console.error("Auth: Error decoding token received after new login:", error);
      logout();
    }
  }, [logout]);

  // On AuthProvider mounting
  React.useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // This is the checkAuthValidity func accessible via useAuth(). It wraps the checkAuthStatus logic.
  // properly named so we realize this function is for components and not for router guards.
  const checkAuthValidityForComponents = React.useCallback(async (): Promise<boolean> => {
    // This calls the internal `checkAuthStatus` which handles refresh and state updates.
    await checkAuthStatus();
    return isAuthenticated; // Return the current isAuthenticated state after the check
  }, [checkAuthStatus, isAuthenticated]);

  // passed top consumers of AuthContext.Provider
  const authContextValue: AuthContextType = {
    isAuthInitialized, // All are described above in type interface
    isAuthenticated,             // Current authentication status.
    user,                        // Current user details.
    login,                       // Function to log in.
    logout,                      // Function to log out.
    checkAuthValidity: checkAuthValidityForComponents, // The function for router guards.
  };

  // If isAuthInitialized is false, auth is in progress... show spinner!
  if (!isAuthInitialized) {
    return (
      <AuthContext.Provider value={authContextValue}>
        <div>
          Initializing Authentication...
        </div>
      </AuthContext.Provider>
    );
  }

  // Once isAuthInitialized is true, render the children
  // The actual route protection is handled by TanStack Router's beforeLoad function on protected routes/layouts
  // a.k.a... the AuthProvider component itself does NOT render <Navigate>
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// This has to be a standalone function, not dependent on AuthProvider's state directly.
// It is explicitly for TanStack Router's context definition in main.tsx.
// It ONLY checks localStorage and decodes token, does not touch React state
export const checkAuthForRouter = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);

  // Case 1: No access token exists at all
  if (!accessToken) {
    console.log('Router Auth Check: No access token found. User is not authenticated.');
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(accessToken);
    const tokenExpiration: number = decoded.exp; // Expiration time in seconds
    const now: number = Date.now() / 1000; // Current time in seconds

    // Case 2: Access token is still valid
    if (tokenExpiration > now) {
      console.log('Router Auth Check: Access token is valid (not expired). User is authenticated.');
      return true;
    }

    // Case 3: Access token has expired, attempt to refresh
    console.log('Router Auth Check: Access token expired. Attempting silent refresh...');

    if (!refreshToken) {
      console.warn('Router Auth Check: Access token expired, but no refresh token found. User needs to log in again.');
      // Clear potentially stale access token if no refresh token exists
      localStorage.removeItem(ACCESS_TOKEN);
      return false; // Cannot refresh without a refresh token
    }

    try {
      // Make API call to backend token refresh endpoint
      const res = await api.post('/api/token/refresh/', { refresh: refreshToken });

      if (res.status === 200 && res.data.access) {
        // Refresh successful: store the new access token
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        // If your backend also returns a new refresh token, update it here too:
        // if (res.data.refresh) {
        //   localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        // }
        console.log('Router Auth Check: Token refreshed successfully. User is now authenticated.');
        return true; // Authenticated with the new token
      } else {
        // Refresh failed (e.g., refresh token is invalid or expired on backend)
        console.warn('Router Auth Check: Refresh token failed or returned invalid response:', res.status, res.data);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN); // Clear both as refresh failed
        return false;
      }
    } catch (refreshError) {
      // Network error or other issue during the refresh API call
      console.error('Router Auth Check: Error during silent token refresh API call:', refreshError);
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN); // Clear both as refresh failed
      return false;
    }

  } catch (error) {
    // Error decoding the access token (e.g., malformed JWT)
    console.error("Router Auth Check: Error decoding access token (malformed/invalid JWT) or other issue:", error);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN); // Clear both for safety
    return false;
  }
};