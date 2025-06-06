import api from "../../../services/api";

/**
 * Obtiene los detalles de una factura específica
 * @param {number} idFactura - ID de la factura
 * @returns {Promise} Promesa que resuelve con los detalles de la factura
 * @throws {Error} Si hay un error al obtener los detalles
 */
export const obtenerDetallesPorFactura = async (idFactura) => {
  const idFacturaNum = Number(idFactura);
  if (!Number.isInteger(idFacturaNum) || idFacturaNum <= 0) {
    console.error('ID de factura no proporcionado o inválido:', idFactura);
    return { data: [] };
  }

  const url = `/detalle-factura/factura?id_factura=${idFacturaNum}`;
  try {
    const response = await api.get(url);
    if (!response.data) {
      console.warn(`No se encontraron detalles para la factura ${idFacturaNum}`);
      return { data: [] };
    }
    const detalles = Array.isArray(response.data) ? response.data : [];
    return { data: detalles };
  } catch (error) {
    console.error(`Error al obtener detalles de la factura ${idFacturaNum}:`, error);
    return { data: [] };
  }
};

/**
 * Crea un nuevo detalle de factura
 * @param {Object} data - Datos del detalle de factura
 * @returns {Promise} Promesa que resuelve con la respuesta del servidor
 */
export const crearDetalleFactura = async (data) => {
  try {
    const response = await api.post('/detalle-factura', data);
    return response;
  } catch (error) {
    console.error('Error al crear detalle de factura:', error);
    throw error;
  }
};

/**
 * Actualiza un detalle de factura existente
 * @param {number} id - ID del detalle de factura a actualizar
 * @param {Object} data - Datos a actualizar
 * @returns {Promise} Promesa que resuelve con la respuesta del servidor
 */
export const actualizarDetalleFactura = async (id, data) => {
  try {
    const response = await api.put(`/detalle-factura/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Error al actualizar detalle de factura ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un detalle de factura
 * @param {number} id - ID del detalle de factura a eliminar
 * @returns {Promise} Promesa que resuelve con la respuesta del servidor
 */
export const eliminarDetalleFactura = async (id) => {
  try {
    const response = await api.delete(`/detalle-factura/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al eliminar detalle de factura ${id}:`, error);
    throw error;
  }
};
