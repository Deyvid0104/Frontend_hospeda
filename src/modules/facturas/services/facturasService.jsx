// Servicio para llamadas API relacionadas con Facturas

import api from "../../../services/api";

export const obtenerFacturas = () => api.get("/factura");

export const obtenerFacturaPorId = (id) => api.get(`/factura/${id}`);

export const crearFactura = (datos) => api.post("/factura", datos);

export const actualizarFactura = (id, datos) => api.put(`/factura/${id}`, datos);

export const eliminarFactura = (id) => api.delete(`/factura/${id}`);

export const buscarPorRangoMonto = (min, max) =>
  api.get(`/factura/rango-monto?montoMin=${min}&montoMax=${max}`);

export const buscarPorMetodoPago = (metodo) =>
  api.get(`/factura/metodo-pago?metodo=${metodo}`);
