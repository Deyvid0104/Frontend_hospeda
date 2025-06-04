import api from "../../../services/api";

/**
 * Obtiene los detalles de una reserva específica
 * @param {number} idReserva - ID de la reserva
 * @returns {Promise} Promesa que resuelve con los detalles de la reserva
 * @throws {Error} Si hay un error al obtener los detalles
 */
export const obtenerDetallesPorReserva = async (idReserva) => {
  console.log('Parámetro idReserva recibido en frontend:', idReserva);
  // Validar que idReserva sea un entero positivo válido
  const idReservaNum = Number(idReserva);
  if (!Number.isInteger(idReservaNum) || idReservaNum <= 0) {
    console.error('ID de reserva no proporcionado o inválido:', idReserva);
    return { data: [] };
  }

  const url = `/detalle-reserva/reserva?id_reserva=${idReservaNum}`;
  console.log(`Llamando a la API: ${url}`);

  try {
    const response = await api.get(url);
    
    // Verificar si la respuesta contiene datos
    if (!response.data) {
      console.warn(`No se encontraron detalles para la reserva ${idReservaNum}`);
      return { data: [] };
    }

    // Asegurarse de que los datos sean un array
    const detalles = Array.isArray(response.data) ? response.data : [];
    
    // Validar y transformar los detalles
    const detallesValidos = detalles.map(detalle => {
      // Si no hay id_habitacion, no es un detalle válido
      if (!detalle.id_habitacion) {
        console.warn(`Detalle sin id_habitacion en reserva ${idReservaNum}`);
        return null;
      }

      // Si hay relación con habitación pero no tiene número, usar el id_habitacion
      if (!detalle.habitacion || !detalle.habitacion.numero) {
        console.warn(`Habitación sin número para id ${detalle.id_habitacion}, aplicando fallback`);
        detalle.habitacion = detalle.habitacion || {};
        detalle.habitacion.numero = detalle.id_habitacion;
      }

      // Añadir id_habitacion explícitamente para asegurar que esté presente
      detalle.id_habitacion = detalle.id_habitacion || (detalle.habitacion && detalle.habitacion.id_habitacion) || null;

      return detalle;
    }).filter(Boolean);

    console.log('Detalles procesados:', detallesValidos);
    return { data: detallesValidos };
  } catch (error) {
    console.error(`Error al obtener detalles de la reserva ${idReservaNum}:`, error);
    return { data: [] };
  }
};

/**
 * Crea un nuevo detalle de reserva
 * @param {Object} data - Datos del detalle de reserva
 * @returns {Promise} Promesa que resuelve con la respuesta del servidor
 */
export const crearDetalleReserva = async (data) => {
  try {
    const response = await api.post('/detalle-reserva', data);
    return response;
  } catch (error) {
    console.error('Error al crear detalle de reserva:', error);
    throw error;
  }
};

/**
 * Actualiza un detalle de reserva existente
 * @param {number} id - ID del detalle de reserva a actualizar
 * @param {Object} data - Datos a actualizar
 * @returns {Promise} Promesa que resuelve con la respuesta del servidor
 */
export const actualizarDetalleReserva = async (id, data) => {
  try {
    const response = await api.put(`/detalle-reserva/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar detalle de reserva ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un detalle de reserva
 * @param {number} id - ID del detalle de reserva a eliminar
 * @returns {Promise} Promesa que resuelve con la respuesta del servidor
 */
export const eliminarDetalleReserva = async (id) => {
  try {
    const response = await api.delete(`/detalle-reserva/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar detalle de reserva ${id}:`, error);
    throw error;
  }
};
