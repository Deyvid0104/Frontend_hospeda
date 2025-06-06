// Servicio para llamadas API relacionadas con Huéspedes

import api from "../../../services/api";

export const obtenerHuespedes = (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.nombre) params.append("nombre", filtros.nombre);
  if (filtros.email) params.append("email", filtros.email);
  if (filtros.telefono) params.append("telefono", filtros.telefono);

  return api.get("/huesped", { params });
};

export const obtenerHuespedPorId = (id) => api.get(`/huesped/${id}`);

export const crearHuesped = (datos) => api.post("/huesped", datos);

export const actualizarHuesped = (id, datos) => api.put(`/huesped/${id}`, datos);

export const eliminarHuesped = (id) => api.delete(`/huesped/${id}`);
