// Servicio Axios para consumir la API REST del sistema de gestión hotelera

import axios from "axios";

const api = axios.create({
  // const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://5.189.171.241:30400";
  baseURL: "http://5.189.171.241:30400",
});

// Interceptor para añadir el token JWT en las cabeceras de las peticiones
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
