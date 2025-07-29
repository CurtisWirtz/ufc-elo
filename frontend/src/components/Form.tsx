import { useState } from 'react';
import { api } from "../api/client.ts";
import { REFRESH_TOKEN, ACCESS_TOKEN } from '@/constants';
import { redirect } from '@tanstack/react-router';


const Form: React.FC<{ route: string; method: "login" | "register" }> = ({ route, method }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true);

        try {
            const res = await api.post(route, {username, password});
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                redirect({ to: '/' });
            } else {
                redirect({ to: '/login' });
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