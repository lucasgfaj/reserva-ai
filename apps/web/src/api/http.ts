import axios from "axios";
import { router } from "@/router";
import { useLoading } from "@/modules/shared/composables/useLoading";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
    timeout: 30000,
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

const MAX_RETRIES = 2
const RETRYABLE_STATUSES = [0, 408, 429, 500, 502, 503, 504]

http.interceptors.response.use(
    (response) => {
        finish();
        return response;
    },
    async (error) => {
        finish();
        const config = error.config
        if (!config || config._retryCount === undefined) {
            config._retryCount = 0
        }
        const shouldRetry =
            config._retryCount < MAX_RETRIES &&
            (!error.response || RETRYABLE_STATUSES.includes(error.response.status))
        if (shouldRetry) {
            config._retryCount++
            const delay = Math.min(1000 * Math.pow(2, config._retryCount - 1), 4000)
            await new Promise(resolve => setTimeout(resolve, delay))
            start()
            return http(config)
        }
        if (error.code === 'ECONNABORTED') {
            error.retryMessage = 'O servidor está demorando para responder. Tente novamente.'
        }
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_condo')
            router.push('/login')
        }
        return Promise.reject(error)
    }
);