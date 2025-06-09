/**
 * Página dinámica para mostrar y editar detalles de una factura.
 * Accesible por usuarios con rol admin y recepcionista.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { obtenerFacturaPorId, actualizarFactura } from "../../../modules/facturas/services/facturasService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import ModalFactura from "../../../modules/facturas/components/ModalFactura";

export default function DetalleFactura() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [factura, setFactura] = useState(null);
  const [modo, setModo] = useState("ver");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const modoParam = searchParams.get("modo");
    setModo(modoParam || "ver");
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.rol !== "admin" && user.rol !== "recepcionista") {
        router.push("/");
      } else {
        cargarFactura();
      }
    }
  }, [loading, user]);

  const cargarFactura = async () => {
    setError("");
    setCargando(true);
    try {
      const res = await obtenerFacturaPorId(id);
      console.log("Factura recibida:", res.data);

      // Asegurar que reserva y huesped existan y estén bien formateados
      const reserva = res.data.reserva || null;
      if (reserva && reserva.huesped) {
        reserva.huesped.nombre = reserva.huesped.nombre || "-";
        reserva.huesped.documento_identidad = reserva.huesped.documento_identidad || "-";
      }

      // Convertir monto_total y descuento a números para el formulario
      const facturaData = {
        ...res.data,
        monto_total: parseFloat(res.data.monto_total),
        descuento: parseFloat(res.data.descuento),
        reserva: reserva,
      };
      setFactura(facturaData);
    } catch (err) {
      setError("Error al cargar la factura");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    let val = value;
    // Convertir a número para monto_total y descuento
    if (name === "monto_total" || name === "descuento") {
      val = value === "" ? "" : Number(value);
    }
    setFactura({ ...factura, [name]: val });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarFactura(id, factura);
      setMensaje("Factura actualizada correctamente");
      setTimeout(() => {
        router.push("/facturas");
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la factura");
    }
  };

  const cambiarModo = () => {
    const nuevoModo = modo === "ver" ? "editar" : "ver";
    if (nuevoModo === "ver") {
      router.push(`/facturas/${id}`);
    } else {
      router.push(`/facturas/${id}?modo=editar`);
    }
  };

  const handleImprimirClick = async () => {
    setError("");
    try {
      const res = await obtenerFacturaPorId(id);
      setFactura(res.data);
      setShowModal(true);
    } catch (error) {
      setError("Error al cargar la factura para imprimir");
    }
  };

  if (loading || !user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!factura) return <p>No se encontró la factura.</p>;

  // Calcular días de estancia
  const calcularDias = (fechaEntrada, fechaSalida) => {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diffTime = Math.abs(salida - entrada);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const diasEstancia = factura.reserva ? calcularDias(factura.reserva.fecha_entrada, factura.reserva.fecha_salida) : 0;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Factura #{factura.id_factura}</h1>
        <div>
          <Button
            variant={modo === "ver" ? "warning" : "info"}
            onClick={cambiarModo}
            className="me-2"
          >
            {modo === "ver" ? "Editar" : "Ver"}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/facturas")} className="me-2">
            Volver a Facturas
          </Button>
          <Button variant="success" onClick={handleImprimirClick} className="me-2">
            Imprimir
          </Button>
        </div>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <h5>Información del Huésped</h5>
          <p><strong>Nombre:</strong> {factura?.reserva && factura.reserva.huesped ? `${factura.reserva.huesped.nombre} ${factura.reserva.huesped.apellidos}` : "-"}</p>
          <p><strong>CIF:</strong> {factura?.reserva && factura.reserva.huesped ? factura.reserva.huesped.documento_identidad : "-"}</p>
          <p><strong>Teléfono:</strong> {factura?.reserva && factura.reserva.huesped ? factura.reserva.huesped.telefono || "-" : "-"}</p>
          <p><strong>Correo Electrónico:</strong> {factura?.reserva && factura.reserva.huesped ? factura.reserva.huesped.email || "-" : "-"}</p>
          <Button
            variant="primary"
            onClick={() => {
              if (factura?.reserva && factura.reserva.huesped) {
                const idHuesped = factura.reserva.huesped.id_huesped;
                if (idHuesped) {
                  router.push(`/huespedes/${idHuesped}?modo=editar`);
                }
              }
            }}
            className="mb-3"
          >
            Modificar Información del Huésped
          </Button>
          <p><strong>Estancia:</strong> {diasEstancia} Días</p>
          <p><strong>Costo por día de habitación:</strong> {factura?.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0 ? factura.reserva.detalles_reserva[0].precio_aplicado : "-"} €</p>
        </Col>
        <Col md={6}>
          <h5>Información de la Factura</h5>
          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="monto_total">
              <Form.Label>Monto total</Form.Label>
            <Form.Control
              type="number"
              name="monto_total"
              value={factura.monto_total !== undefined ? factura.monto_total : ""}
              onChange={manejarCambio}
              required
              disabled={modo === "ver"}
            />
            </Form.Group>
            <Form.Group className="mb-3" controlId="descuento">
              <Form.Label>Descuento (%)</Form.Label>
            <Form.Control
              type="number"
              name="descuento"
              value={factura.descuento !== undefined ? factura.descuento : 0}
              onChange={manejarCambio}
              disabled={modo === "ver"}
              min={0}
              max={100}
            />
            </Form.Group>
            <Form.Group className="mb-3" controlId="precio_con_descuento">
              <Form.Label>Precio con descuento</Form.Label>
              <Form.Control
                type="number"
                name="precio_con_descuento"
                value={
                  factura.monto_total !== undefined && factura.descuento !== undefined
                    ? (factura.monto_total - (factura.monto_total * factura.descuento) / 100).toFixed(2)
                    : ""
                }
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="metodo_pago">
              <Form.Label>Método de pago</Form.Label>
              <Form.Select
                name="metodo_pago"
                value={factura.metodo_pago !== undefined ? factura.metodo_pago : ""}
                onChange={manejarCambio}
                required
                disabled={modo === "ver"}
              >
                <option value="">Seleccione un método</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="estado">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={factura.estado || "pendiente"}
                onChange={manejarCambio}
                disabled={modo === "ver"}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="anulada">Anulada</option>
              </Form.Select>
            </Form.Group>
            {modo === "editar" && (
              <Button variant="primary" type="submit">
                Guardar cambios
              </Button>
            )}
          </Form>
        </Col>
      </Row>
      <ModalFactura show={showModal} onHide={() => setShowModal(false)} factura={factura} />
    </Container>
  );
}
