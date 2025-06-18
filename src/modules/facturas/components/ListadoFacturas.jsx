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
import Cargando from "@/components/Cargando";
import { Table, Alert, Form, Row, Col } from "react-bootstrap";
import CustomButton from "../../../components/CustomButton";

export default function ListadoFacturas({ onImprimir }) {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtros, setFiltros] = useState({ estado: "", metodo_pago: "" });

  // Nueva función para cargar facturas con huésped
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
        // Para cada factura, extraer nombre del huésped directamente de reserva
        let facturasConHuesped = res.data.map((factura) => {
          const nombreHuesped =
            factura.reserva && factura.reserva.huesped
              ? `${factura.reserva.huesped.nombre} ${factura.reserva.huesped.apellidos}`
              : "-";
          return { ...factura, nombreHuesped };
        });
        // Filtrar por nombre de huésped si filtroNombre no está vacío
        if (filtroNombre.trim() !== "") {
          const filtroMinuscula = filtroNombre.toLowerCase();
          facturasConHuesped = facturasConHuesped.filter((factura) =>
            factura.nombreHuesped.toLowerCase().includes(filtroMinuscula)
          );
        }
        setFacturas(facturasConHuesped);
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

  if (cargando) return <Cargando />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Form className="mb-3">
        <Row>
          <Col md={4}>
            <Form.Group controlId="filtroNombre">
              <Form.Label>Buscar por Huésped</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre del huésped"
                value={filtroNombre}
                onChange={(e) => {
                  setFiltroNombre(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    cargarFacturas(filtros);
                  }
                }}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="filtroEstado">
              <Form.Label>Estado</Form.Label>
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
          <Col md={3}>
            <Form.Group controlId="filtroMetodoPago">
              <Form.Label>Método de Pago</Form.Label>
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
                setFiltroNombre("");
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

              // Calcular subtotal igual que en ModalFactura.jsx
              let subtotal = 0;
              if (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) {
                const entrada = new Date(factura.reserva.fecha_entrada);
                const salida = new Date(factura.reserva.fecha_salida);
                const diffTime = Math.abs(salida - entrada);
                const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
                subtotal += dias * precio;
              }
              if (factura.detalles_factura && factura.detalles_factura.length > 0) {
                factura.detalles_factura.forEach(detalle => {
                  subtotal += detalle.cantidad * detalle.precio_unitario;
                });
              }

              // Calcular total aplicando descuento
              let total = subtotal;
              if (descuentoNum > 0) {
                const descuentoMonto = (subtotal * descuentoNum) / 100;
                total -= descuentoMonto;
              }

              return (
                <tr key={factura.id_factura}>
                  <td>{factura.id_factura}</td>
                  <td>{factura.nombreHuesped}</td>
                  <td>{subtotal.toFixed(2)} €</td>
                  <td>{descuentoNum.toFixed(2)}%</td>
                  <td>{total.toFixed(2)} €</td>
                  <td>
                    <span className={`badge bg-${factura.estado === 'pagada' ? 'success' : 'warning'}`}>
                      {factura.estado ?? "pendiente"}
                    </span>
                  </td>
                  <td>{factura.metodo_pago}</td>
                  <td>
                    <CustomButton variant="info" size="sm" icon="view" className="btn-view" href={`/facturas/${factura.id_factura}`}>
                      Ver
                    </CustomButton>
                    <CustomButton variant="warning" size="sm" icon="edit" className="btn-edit" href={`/facturas/${factura.id_factura}?modo=editar`}>
                      Editar
                    </CustomButton>{" "}
                    <CustomButton variant="success" size="sm" icon="print" className="btn-success" onClick={() => onImprimir(factura.id_factura)}>
                      Imprimir
                    </CustomButton>{" "}
                    <CustomButton variant="danger" size="sm" icon="delete" className="btn-danger" onClick={() => manejarEliminar(factura.id_factura)}>
                      Eliminar
                    </CustomButton>
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

          // Calcular subtotal igual que en ModalFactura.jsx
          let subtotal = 0;
          if (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) {
            const entrada = new Date(factura.reserva.fecha_entrada);
            const salida = new Date(factura.reserva.fecha_salida);
            const diffTime = Math.abs(salida - entrada);
            const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
            subtotal += dias * precio;
          }
          if (factura.detalles_factura && factura.detalles_factura.length > 0) {
            factura.detalles_factura.forEach(detalle => {
              subtotal += detalle.cantidad * detalle.precio_unitario;
            });
          }

          // Calcular total aplicando descuento
          let total = subtotal;
          if (descuentoNum > 0) {
            const descuentoMonto = (subtotal * descuentoNum) / 100;
            total -= descuentoMonto;
          }
          
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

                <div className="mb-3">
                  <small className="text-muted d-block">Huésped</small>
                  <div className="fw-semibold">{factura.nombreHuesped}</div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Precio</small>
                    <div className="fw-semibold">€{subtotal.toFixed(2)}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Descuento</small>
                    <div className="fw-semibold">{descuentoNum.toFixed(2)}%</div>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Total con Descuento</small>
                    <div className="fw-bold text-success">€{total.toFixed(2)}</div>
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
              
                    <CustomButton variant="warning" size="sm" className="btn-edit" icon="edit" href={`/facturas/${factura.id_factura}?modo=editar`}>
                      Editar
                    </CustomButton>
                    
                    <CustomButton variant="success" size="sm" className="flex-fill" icon="print" onClick={() => onImprimir(factura.id_factura)}>
                      Imprimir
                    </CustomButton>
                    
                    <CustomButton variant="danger" size="sm" className="w-100 mt-2" icon="delete" onClick={() => manejarEliminar(factura.id_factura)}>
                      Eliminar
                    </CustomButton>                 
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
