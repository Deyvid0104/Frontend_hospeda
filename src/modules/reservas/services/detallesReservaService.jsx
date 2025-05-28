// Servicio para llamadas API relacionadas con Detalles de Reservas
import api from "../../../services/api";

/**
 * Obtiene los detalles de una reserva específica
 * @param {number} idReserva - ID de la reserva
 * @returns {Promise} Promesa que resuelve con los detalles de la reserva
 * @throws {Error} Si hay un error al obtener los detalles
 */
export const obtenerDetallesPorReserva = async (idReserva) => {
  if (!idReserva) {
    console.error('ID de reserva no proporcionado');
    return { data: [] };
  }

  try {
    const response = await api.get(`/detalle-reserva/reserva?id_reserva=${idReserva}`);
    
    // Verificar si la respuesta contiene datos
    if (!response.data) {
      console.warn(`No se encontraron detalles para la reserva ${idReserva}`);
      return { data: [] };
    }

    // Asegurarse de que los datos sean un array
    const detalles = Array.isArray(response.data) ? response.data : [];
    
    // Validar y transformar los detalles
    const detallesValidos = detalles.map(detalle => {
      // Si no hay id_habitacion, no es un detalle válido
      if (!detalle.id_habitacion) {
        console.warn(`Detalle sin id_habitacion en reserva ${idReserva}`);
        return null;
      }

      // Si hay relación con habitación pero no tiene número, usar el id_habitacion
      if (detalle.habitacion && !detalle.habitacion.numero) {
        console.warn(`Habitación sin número para id ${detalle.id_habitacion}`);
        detalle.habitacion.numero = detalle.id_habitacion;
      }

      return detalle;
    }).filter(Boolean);

    console.log('Detalles procesados:', detallesValidos);
    return { data: detallesValidos };
  } catch (error) {
    console.error(`Error al obtener detalles de la reserva ${idReserva}:`, error);
    // Retornar un array vacío en lugar de propagar el error
    return { data: [] };
  }
};
