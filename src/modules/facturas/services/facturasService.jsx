// Servicio para llamadas API relacionadas con Facturas

import api from "../../../services/api";

export const obtenerFacturas = (estado = "", metodo_pago = "") => {
  const params = {};
  if (estado) params.estado = estado;
  if (metodo_pago) params.metodo_pago = metodo_pago;
  return api.get("/factura", { params });
};

export const obtenerFacturaPorId = (id) => api.get(`/factura/${id}`);

export const obtenerFacturaPorReserva = (id_reserva) => api.get(`/factura/por-reserva/${id_reserva}`);

export const crearFactura = (datos) => api.post("/factura", datos);

export const actualizarFactura = (id, datos) => api.put(`/factura/${id}`, datos);

export const eliminarFactura = (id) => api.delete(`/factura/${id}`);

export const buscarPorRangoMonto = (min, max) =>
  api.get(`/factura/rango-monto?montoMin=${min}&montoMax=${max}`);

export const buscarPorMetodoPago = (metodo) =>
  api.get(`/factura/metodo-pago?metodo=${metodo}`);
