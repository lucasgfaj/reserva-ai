import axios from "axios";

export const http = axios.create({
    baseURL: "http://localhost:3000/api/v1",
});

http.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        const parsed = JSON.parse(token);
        config.headers.Authorization = `Bearer ${parsed}`;
    }
    return config;
});



