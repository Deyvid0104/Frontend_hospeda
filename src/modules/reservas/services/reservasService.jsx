// Servicio para llamadas API relacionadas con Reservas

import api from "../../../services/api";

export const obtenerReservas = () => api.get("/reserva");

export const obtenerReservaPorId = (id) => api.get(`/reserva/${id}`);

export const crearReserva = (datos) => api.post("/reserva", datos);

export const actualizarReserva = (id, datos) => api.put(`/reserva/${id}`, datos);

export const eliminarReserva = (id) => api.delete(`/reserva/${id}`);
