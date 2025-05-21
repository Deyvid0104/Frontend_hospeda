// Servicio para llamadas API relacionadas con Huéspedes

import api from "../../../services/api";

export const obtenerHuespedes = () => api.get("/huesped");

export const obtenerHuespedPorId = (id) => api.get(`/huesped/${id}`);

export const crearHuesped = (datos) => api.post("/huesped", datos);

export const actualizarHuesped = (id, datos) => api.put(`/huesped/${id}`, datos);

export const eliminarHuesped = (id) => api.delete(`/huesped/${id}`);
