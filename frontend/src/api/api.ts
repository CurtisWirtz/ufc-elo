import axios from "axios";
import { ACCESS_TOKEN } from "@/constants";

// 'interceptor' function to add authorization headers

const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL, //'http://127.0.0.1:8000/api', // PRODUCTION_XXX
    // headers: {
    //     'Content-Type': 'application/json'
    // }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;