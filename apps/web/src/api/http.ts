import axios from "axios";

export const http = axios.create({
    baseURL: "http://localhost:3000/api",
});

http.interceptors.response.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});



