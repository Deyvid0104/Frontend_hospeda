/**
 * Componente ListadoFacturas
 * Muestra una tabla con el listado de facturas obtenidas desde el backend.
 * Permite eliminar facturas y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerFacturas, eliminarFactura } from "../services/facturasService";
import { obtenerReservaPorId } from "../../reservas/services/reservasService";
import { obtenerHuespedPorId } from "../../huespedes/services/huespedesService";
import Cargando from "../../../components/Cargando";
import { Table, Alert, Form, Row, Col } from "react-bootstrap";
import CustomButton from "../../../components/CustomButton";

export default function ListadoFacturas({ onImprimir }) {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [huespedes, setHuespedes] = useState({});

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("");
  const [filtros, setFiltros] = useState({ estado: "", metodo_pago: "" });

  const cargarFacturas = async (filtros) => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerFacturas(filtros.estado, filtros.metodo_pago);
      if (!res || !res.data) {
        setError("Error al cargar las facturas: respuesta inválida del servidor");
        setFacturas([]);
      } else {
        setFacturas(res.data);
      }
    } catch (err) {
      setError("Error al cargar las facturas");
      setFacturas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFacturas(filtros);
  }, [filtros]);

const obtenerNombreHuesped = async (idReserva) => {
    try {
      const reserva = await obtenerReservaPorId(idReserva);
      if (reserva && reserva.data && reserva.data.huesped) {
        return reserva.data.huesped;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener el nombre del huésped:", error);
      return null;
    }
  };

  const manejarEliminar = async (id) => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      setError("No tiene permisos para eliminar facturas");
      return;
    }
    if (!confirm("¿Está seguro de eliminar esta factura?")) return;
    try {
      await eliminarFactura(id);
      setMensaje("Factura eliminada correctamente");
      // Forzar recarga con filtros actuales para evitar error
      await cargarFacturas(filtros);
    } catch (err) {
      setError("Error al eliminar la factura");
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Form className="mb-3">
        <Row>
          <Col md={5}>
            <Form.Group controlId="filtroEstado">
              <Form.Label>Filtrar por Estado</Form.Label>
              <Form.Select
                value={filtroEstado}
                onChange={(e) => {
                  const valor = e.target.value;
                  setFiltroEstado(valor);
                  setFiltros((prev) => ({ ...prev, estado: valor }));
                }}
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="anulada">Anulada</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group controlId="filtroMetodoPago">
              <Form.Label>Filtrar por Método de Pago</Form.Label>
              <Form.Select
                value={filtroMetodoPago}
                onChange={(e) => {
                  const valor = e.target.value;
                  setFiltroMetodoPago(valor);
                  setFiltros((prev) => ({ ...prev, metodo_pago: valor }));
                }}
              >
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <CustomButton
              variant="secondary"
              onClick={() => {
                setFiltroEstado("");
                setFiltroMetodoPago("");
                setFiltros({ estado: "", metodo_pago: "" });
              }}
            >
              Limpiar
            </CustomButton>
          </Col>
        </Row>
      </Form>

      {/* Vista de tabla para pantallas grandes */}
      <div className="d-none d-lg-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Huésped</th>
              <th>Precio</th>
              <th>Descuento</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Método de pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => {
              const descuentoNum = parseFloat(factura.descuento) || 0;
              const montoTotalNum = parseFloat(factura.monto_total) || 0;
              const precioConDescuento = montoTotalNum - (montoTotalNum * descuentoNum) / 100;
              return (
                <tr key={factura.id_factura}>
                  <td>{factura.id_factura}</td>
                  <td>
                    {/* Mostrar el nombre del huésped directamente desde la factura */}
                    {factura.id_reserva ? (
                      factura.reserva?.huesped?.nombre + " " + factura.reserva?.huesped?.apellidos
                    ) : (
                      "Sin reserva"
                    )}
                  </td>
                  <td>€{montoTotalNum.toFixed(2)}</td>
                  <td>{descuentoNum.toFixed(2)}%</td>
                  <td>€{precioConDescuento.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${factura.estado === 'pagada' ? 'success' : 'warning'}`}>
                      {factura.estado ?? "pendiente"}
                    </span>
                  </td>
                  <td>{factura.metodo_pago}</td>
                  <td>
                    <CustomButton variant="info" size="sm" icon="view" href={`/facturas/${factura.id_factura}`}>
                      Ver
                    </CustomButton>{" "}
                    {user && (user.rol === "admin" || user.rol === "recepcionista") && (
                      <>
                        <CustomButton variant="warning" size="sm" icon="edit" href={`/facturas/${factura.id_factura}?modo=editar`}>
                          Editar
                        </CustomButton>{" "}
                        <CustomButton variant="success" size="sm" icon="print" onClick={() => onImprimir(factura.id_factura)}>
                          Imprimir
                        </CustomButton>{" "}
                        <CustomButton variant="danger" size="sm" icon="delete" onClick={() => manejarEliminar(factura.id_factura)}>
                          Eliminar
                        </CustomButton>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="d-lg-none">
        {facturas.map((factura) => {
          const descuentoNum = parseFloat(factura.descuento) || 0;
          const montoTotalNum = parseFloat(factura.monto_total) || 0;
          const precioConDescuento = montoTotalNum - (montoTotalNum * descuentoNum) / 100;
          
          return (
            <div key={factura.id_factura} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="card-title mb-0 fw-bold text-primary">
                    Factura #{factura.id_factura}
                  </h6>
                  <span className={`badge bg-${factura.estado === 'pagada' ? 'success' : 'warning'}`}>
                    {factura.estado ?? "pendiente"}
                  </span>
                </div>

                {/* Agregar el nombre del huésped */}
                {factura.id_reserva && (
                  <div className="mb-3">
                    <small className="text-muted d-block">Huésped</small>
                    <div className="fw-semibold">
                      <ObtenerNombreHuesped idReserva={factura.id_reserva} />
                    </div>
                  </div>
                )}

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Precio</small>
                    <div className="fw-semibold">€{montoTotalNum.toFixed(2)}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Descuento</small>
                    <div className="fw-semibold">{descuentoNum.toFixed(2)}%</div>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Total con Descuento</small>
                    <div className="fw-bold text-success">€{precioConDescuento.toFixed(2)}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Método de pago</small>
                    <div className="fw-semibold">{factura.metodo_pago}</div>
                  </div>
                </div>

                  <div className="d-flex flex-wrap gap-2">
                    <CustomButton variant="info" size="sm" className="flex-fill" icon="view" href={`/facturas/${factura.id_factura}`}>
                      Ver
                    </CustomButton>
                    
                    {user && (user.rol === "admin" || user.rol === "recepcionista") && (
                      <>
                        <CustomButton variant="warning" size="sm" className="btn-edit" icon="edit" href={`/facturas/${factura.id_factura}?modo=editar`}>
                          Editar
                        </CustomButton>
                        
                        <CustomButton variant="success" size="sm" className="flex-fill" icon="print" onClick={() => onImprimir(factura.id_factura)}>
                          Imprimir
                        </CustomButton>
                        
                        <CustomButton variant="danger" size="sm" className="w-100 mt-2" icon="delete" onClick={() => manejarEliminar(factura.id_factura)}>
                          Eliminar
                        </CustomButton>
                      </>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Componente auxiliar para obtener el nombre del huésped
function ObtenerNombreHuesped({ idReserva }) {
  const [nombreHuesped, setNombreHuesped] = useState("Cargando...");
  useEffect(() => {
    async function cargarNombreHuesped() {
      try {
        const reserva = await obtenerReservaPorId(idReserva);
        if (reserva?.data?.huesped?.nombre && reserva?.data?.huesped?.apellidos) {
          setNombreHuesped(reserva.data.huesped.nombre + " " + reserva.data.huesped.apellidos);
        } else {
          setNombreHuesped("Huésped no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el nombre del huésped:", error);
        setNombreHuesped("Error al cargar");
      }
    }

    cargarNombreHuesped();
  }, [idReserva]);

  return <>{nombreHuesped}</>;
}
