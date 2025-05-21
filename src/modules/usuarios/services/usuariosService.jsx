// Servicio para llamadas API relacionadas con Usuarios

import api from "../../../services/api";

export const obtenerUsuarios = () => api.get("/usuario");

export const obtenerUsuarioPorId = (id) => api.get(`/usuario/${id}`);

export const crearUsuario = (datos) => api.post("/usuario", datos);

export const actualizarUsuario = (id, datos) => api.put(`/usuario/${id}`, datos);

export const eliminarUsuario = (id) => api.delete(`/usuario/${id}`);

export const buscarPorRol = (rol) => api.get(`/usuario/rol?rol=${rol}`);

export const buscarPorNombre = (nombre) => api.get(`/usuario/buscar?nombre=${nombre}`);

export const buscarPorEmail = (email) => api.get(`/usuario/email?email=${email}`);

export const obtenerActivosRecientes = (fecha) => api.get(`/usuario/activos-recientes?fecha=${fecha}`);
