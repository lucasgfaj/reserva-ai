import axios from "axios";
import { router } from "@/router";
import { useLoading } from "@/modules/shared/composables/useLoading";

export const http = axios.create({
    baseURL: "http://localhost:3000/api/v1",
});

const { start, finish } = useLoading();

http.interceptors.request.use((config) => {
    start();
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (response) => {
        finish();
        return response;
    },
    (error) => {
        finish();
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_condo')
            router.push('/login')
        }
        return Promise.reject(error)
    }
);