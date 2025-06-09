// Servicio Axios para consumir la API REST del sistema de gestión hotelera

import axios from "axios";

const api = axios.create({
  baseURL: "http://5.189.171.241:30400",   
  // baseURL: "http://localhost:4000",


});

// Interceptor para añadir el token JWT en las cabeceras de las peticiones
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error de red o servidor no disponible
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject(new Error('Error de conexión. Por favor, verifique su conexión a internet.'));
    }

    // Error del servidor
    const { status, data } = error.response;

    switch (status) {
      case 401:
        console.error('Error de autenticación:', data);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
        return Promise.reject(new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
      case 403:
        console.error('Error de autorización:', data);
        return Promise.reject(new Error('No tiene permisos para realizar esta acción.'));
      case 404:
        console.error('Recurso no encontrado:', data);
        return Promise.reject(new Error('El recurso solicitado no existe.'));
      case 500:
        // Intentar obtener un mensaje más específico del error
        const errorMessage = data?.message || 'Error interno del servidor';
        console.error('Error del servidor:', errorMessage);
        return Promise.reject(new Error(errorMessage));
      default:
        const defaultMessage = data?.message || error.message || `Error ${status}`;
        if (!(status === 409 && defaultMessage.includes("Ya existe una factura para la reserva"))) {
          console.error(`Error ${status}:`, defaultMessage);
        }
        return Promise.reject(new Error(defaultMessage));
    }
  }
);

export default api;
