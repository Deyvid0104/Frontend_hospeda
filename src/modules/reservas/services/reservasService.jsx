import api from "../../../services/api";

/**
 * Obtiene todas las reservas con filtros opcionales
 * @param {Object} filtros - Filtros para la consulta
 * @param {string} filtros.fecha_entrada - Fecha mínima de entrada
 * @param {string} filtros.fecha_salida - Fecha máxima de salida
 * @param {string} filtros.nombre_huesped - Nombre o apellidos del huésped
 * @param {string} filtros.numero_habitacion - Número de habitación
 * @returns {Promise} Promesa con la respuesta de la API
 */
export const obtenerReservas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();

    if (filtros.fecha_entrada) {
      params.append('fecha_entrada', filtros.fecha_entrada);
    }
    if (filtros.fecha_salida) {
      params.append('fecha_salida', filtros.fecha_salida);
    }
    if (filtros.nombre_huesped) {
      params.append('nombre_huesped', filtros.nombre_huesped);
    }
    if (filtros.numero_habitacion) {
      params.append('numero_habitacion', filtros.numero_habitacion);
    }

    const response = await api.get(`/reserva?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    throw error;
  }
};

/**
 * Obtiene una reserva por su ID
 * @param {number|string} id - ID de la reserva
 * @returns {Promise} Promesa con la respuesta de la API
 */
export const obtenerReservaPorId = async (id) => {
  try {
    const response = await api.get(`/reserva/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener reserva con id ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza una reserva existente
 * @param {number|string} id - ID de la reserva a actualizar
 * @param {Object} data - Datos de la reserva a actualizar
 * @returns {Promise} Promesa con la respuesta de la API
 */
export const actualizarReserva = async (id, data) => {
  try {
    const response = await api.put(`/reserva/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar reserva con id ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una reserva por su ID
 * @param {number|string} id - ID de la reserva a eliminar
 * @returns {Promise} Promesa con la respuesta de la API
 */
export const eliminarReserva = async (id) => {
  try {
    const response = await api.delete(`/reserva/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar reserva con id ${id}:`, error);
    throw error;
  }
};
