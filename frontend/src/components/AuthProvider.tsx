import { Navigation } from '@tanstack/react-router';
import { jwtdecode } from 'jwt-decode';
import api from '../api/api.ts';
import { useEffect, useState } from 'react';

import { REFRESH_TOKEN, ACCESS_TOKEN } from '@/constants';

function AuthProvider({ children }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    // refresh token for us
    const refreshToken = async () => { 
        // we get the refresh token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            // we send a request to the backend to refresh the token
            const res = await api.post('/api/token/refresh/', { 
                refresh: refreshToken 
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }

    }

    // see if we have a token, see if it is expired
    // if it is expired, just refresh the token. if unauthorized, then tell them to log in
    const auth = async () => { 
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtdecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000; // current time in seconds

        if (!tokenExpiration < now) {
            await refreshToken()
        } else {
            setIsAuthorized(true);
        }
    }

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}
export default AuthProvider;