"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col, Modal } from "react-bootstrap";
import { obtenerReservas, obtenerReservaPorId } from "../../../modules/reservas/services/reservasService";
import { obtenerFacturaPorReserva } from "../../../modules/facturas/services/facturasService";
import Cargando from "@/components/Cargando";

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

  // Estado para la lista de reservas disponibles
  const [reservas, setReservas] = useState([]);

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
    if (montoParam) setMontoTotal(montoParam);

    // Cargar reservas disponibles para facturar (filtrando las que ya tienen factura)
    const cargarReservasDisponibles = async () => {
      try {
        const response = await obtenerReservas();
        if (response?.data) {
          const reservasTodas = response.data;
          // Filtrar reservas que no tengan factura
          const resultados = await Promise.all(
            reservasTodas.map(async (reserva) => {
              try {
                const facturaResp = await obtenerFacturaPorReserva(reserva.id_reserva);
                return !facturaResp?.data || facturaResp.data.length === 0;
              } catch (error) {
                // En caso de error, asumir que no tiene factura para no bloquear
                return true;
              }
            })
          );
          const reservasDisponibles = reservasTodas.filter((_, index) => resultados[index]);
          setReservas(reservasDisponibles);
          // Si hay idReserva en params, seleccionarlo y obtener monto
          if (idReservaParam) {
            const reservaSeleccionada = reservasDisponibles.find(r => r.id_reserva && r.id_reserva.toString() === idReservaParam);
            if (reservaSeleccionada) {
              setIdReserva(idReservaParam);
              // Solo obtener monto total desde la factura si no hay monto en params
              if (!montoParam) {
                obtenerFacturaPorReserva(idReservaParam).then(facturaResp => {
                  if (facturaResp?.data?.monto_total !== undefined) {
                    setMontoTotal(facturaResp.data.monto_total.toFixed(2));
                  } else {
                    setMontoTotal("");
                  }
                }).catch(() => setMontoTotal(""));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar reservas disponibles:", error);
      }
    };
    cargarReservasDisponibles();
  }, [searchParams]);

  // Manejar cambio en selección de reserva
  const manejarCambioReserva = async (e) => {
    const nuevoIdReserva = e.target.value;
    setIdReserva(nuevoIdReserva);
    if (!nuevoIdReserva || isNaN(Number(nuevoIdReserva))) {
      setMontoTotal("");
      return;
    }
    try {
      // Obtener factura asociada a la reserva para obtener monto total
      const facturaResp = await obtenerFacturaPorReserva(nuevoIdReserva);
      if (facturaResp?.data) {
        if (facturaResp.data.monto_total !== undefined) {
          setMontoTotal(facturaResp.data.monto_total.toFixed(2));
        } else {
          setMontoTotal("");
        }
      } else {
        // Si no hay factura, obtener detalles de la reserva para calcular monto total
        const reservaResp = await obtenerReservaPorId(nuevoIdReserva);
        if (reservaResp?.data) {
          // Calcular monto total sumando noches * precio_aplicado de detalles_reserva
          const detalles = reservaResp.data.detalles_reserva || [];
          const montoCalculado = detalles.reduce((total, detalle) => {
            return total + detalle.noches * Number(detalle.precio_aplicado);
          }, 0);
          setMontoTotal(montoCalculado.toFixed(2));
        } else {
          setMontoTotal("");
        }
      }
    } catch (error) {
      console.error("Error al obtener detalles de la reserva:", error);
      setMontoTotal("");
    }
  };

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
              <Form.Select
                value={idReserva}
                onChange={manejarCambioReserva}
                required
                disabled={Boolean(searchParams.get("id_reserva"))}
              >
                <option value="">Seleccione una reserva</option>
                {reservas.map((reserva, index) => (
                  <option key={`${reserva.id_reserva}-${index}`} value={reserva.id_reserva}>
                    {reserva.id_reserva && reserva.huesped ? `${reserva.id_reserva} - ${reserva.huesped.nombre} ${reserva.huesped.apellidos}` : `Reserva ${index + 1}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMontoTotal">
              <Form.Label>Monto Total</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={montoTotal}
                readOnly={true}
                disabled={true}
                tabIndex={-1}
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
    <Suspense fallback={<Cargando />}>
      <FormularioCrearFactura searchParams={searchParams} router={router} user={user} />
    </Suspense>
  );
}
