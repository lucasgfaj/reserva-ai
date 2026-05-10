import axios from "axios";
import { router } from "@/router";

export const http = axios.create({
    baseURL: "http://localhost:3000/api/v1",
});

http.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_condo')
            router.push('/login')
        }
        return Promise.reject(error)
    }
);



