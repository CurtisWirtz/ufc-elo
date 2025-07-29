import { useState } from 'react';
import { api } from "../api/client.ts";
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../AuthProvider.tsx';


const Form: React.FC<{ route: string; method: "login" | "register" }> = ({ route, method }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const name = method === "login" ? "Login" : "Register";

    // Get the login function from AuthContext
    const { login: authLogin } = useAuth(); // Renamed to avoid conflict with `method === "login"`
    // Get the navigate function from TanStack Router
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true);
        setError(''); // Clear previous errors

        try {
            const res = await api.post(route, {username, password});
            if (method === "login") {
                // Call the centralized login function from AuthProvider
                authLogin(res.data.access, res.data.refresh);
                
                // Navigate to /events after successful login
                // We typically use `replace: true` here to prevent going back to login via browser back button
                navigate({ to: '/events', replace: true }); 
            } else {
                navigate({ to: '/login', replace: true });
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <form onSubmit={handleSubmit}>
            <h1>{name}</h1>
            <input type="text" value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
            <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            <button type="submit" disabled={loading}>{name}</button>
        </form>
    )
}

export default Form;