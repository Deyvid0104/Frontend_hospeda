"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col, Modal } from "react-bootstrap";

function FormularioCrearFactura({ searchParams, router, user }) {
  const [fecha, setFecha] = useState("");
  const [idReserva, setIdReserva] = useState("");
  const [idFacturaExistente, setIdFacturaExistente] = useState(null);
  const [montoTotal, setMontoTotal] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [estado, setEstado] = useState("pendiente");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Nuevo estado para controlar si se muestra mensaje de error o éxito
  const [mensajeVisible, setMensajeVisible] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Estado para controlar la visibilidad del modal de factura existente
  const [showModalFacturaExistente, setShowModalFacturaExistente] = useState(false);

  useEffect(() => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      router.push("/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    // Leer parámetros de la URL para rellenar el formulario
    const fechaParam = searchParams.get("fecha");
    const idReservaParam = searchParams.get("id_reserva");
    const montoParam = searchParams.get("monto");

    if (fechaParam) setFecha(fechaParam);
    if (idReservaParam) setIdReserva(idReservaParam);
    if (montoParam) setMontoTotal(montoParam);
  }, [searchParams]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setMensajeVisible(null);
    setCargando(true);

    try {
      // Enviar monto total sin aplicar descuento, el backend aplicará el descuento
      const montoNum = parseFloat(montoTotal);
      const descuentoNum = parseFloat(descuento);
      const idReservaNum = Number(idReserva);
      const data = { fecha, id_reserva: idReservaNum, monto_total: montoNum.toFixed(2), descuento: descuentoNum, metodo_pago: metodoPago, estado };
      await api.post("/factura", data);
      setExito("Factura creada exitosamente");
      setMensajeVisible("exito");
      setFecha("");
      setIdReserva("");
      setMontoTotal("");
      setDescuento(0);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      if (err.response?.data?.message?.includes("Ya existe una factura para la reserva")) {
        const idFacturaExistente = err.response.data.id_factura || idReserva;
        setError(err.response.data.message);
        setMensajeVisible("factura_existente");
        setIdFacturaExistente(idFacturaExistente);
        setShowModalFacturaExistente(true);
      } else {
        setError("Error al crear la factura. Verifique los datos.");
        setMensajeVisible("error");
      }
    } finally {
      setCargando(false);
    }
  };

  const handleCloseModal = () => {
    setShowModalFacturaExistente(false);
    setMensajeVisible(null);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Crear Factura</h2>
          {mensajeVisible === "error" && <Alert variant="danger">{error}</Alert>}
          {mensajeVisible === "exito" && <Alert variant="success">{exito}</Alert>}

          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="formFecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                // Corregir formato de fecha para input date
                onFocus={(e) => {
                  if (fecha && fecha.includes('/')) {
                    const partes = fecha.split('/');
                    if (partes.length === 3) {
                      const fechaISO = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                      setFecha(fechaISO);
                    }
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formIdReserva">
              <Form.Label>ID Reserva</Form.Label>
              <Form.Control
                type="text"
                value={idReserva}
                onChange={(e) => setIdReserva(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMontoTotal">
              <Form.Label>Monto Total</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescuento">
              <Form.Label>Descuento (%)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formMetodoPago">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} required>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEstado">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)} required>
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="anulada">Anulada</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Factura"}
            </Button>
          </Form>

          <Modal show={showModalFacturaExistente} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Factura Existente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{error}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => { handleCloseModal(); router.push("/reservas"); }}>
                Volver a Reservas
              </Button>
              <Button variant="primary" onClick={() => { handleCloseModal(); router.push(`/facturas/${idFacturaExistente}`); }}>
                Ver Factura Existente
              </Button>
            </Modal.Footer>
          </Modal>

        </Col>
      </Row>
    </Container>
  );
}

export default function CrearFactura() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FormularioCrearFactura searchParams={searchParams} router={router} user={user} />
    </Suspense>
  );
}