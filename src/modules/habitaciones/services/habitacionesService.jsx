import api from "../../../services/api.jsx";

export const obtenerHabitaciones = () => api.get("/habitacion");

export const obtenerHabitacionPorId = (id) => api.get(`/habitacion/${id}`);

export const crearHabitacion = (datos) => api.post("/habitacion", datos);

export const actualizarHabitacion = (id, datos) => api.put(`/habitacion/${id}`, datos);

export const eliminarHabitacion = (id) => api.delete(`/habitacion/${id}`);

export const buscarPorTipo = (tipo) => api.get(`/habitacion/tipo?tipo=${tipo}`);

export const buscarPorEstado = (estado) => api.get(`/habitacion/estado?estado=${estado}`);

export const buscarPorRangoPrecio = (min, max) =>
  api.get(`/habitacion/rango-precio?precioMin=${min}&precioMax=${max}`);

export const buscarPorNumero = (numero) => api.get(`/habitacion/buscar-numero?numero=${numero}`);

// Nueva función para obtener habitaciones disponibles en un rango de fechas
export const obtenerHabitacionesDisponibles = (fechaInicio, fechaFin) => {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);
  return api.get(`/habitacion/disponibilidad?${params.toString()}`);
};
