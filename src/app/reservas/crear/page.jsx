/**
 * Página para crear una nueva reserva.
 * Controla el formulario de creación y envía los datos al backend.
 * Incluye validación de fechas y selección de habitación disponible.
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { FiPlus } from "react-icons/fi";

// Componente que maneja la lógica del formulario
function CrearReservaForm() {
  // Hook para navegación programática
  const router = useRouter();
  // Hook para obtener parámetros de búsqueda en la URL
  const searchParams = useSearchParams();
  // Contexto de autenticación para obtener usuario actual
  const { user, loading } = useAuth();

  // Estados para los campos del formulario
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idHuesped, setIdHuesped] = useState("");
  const [idHabitacion, setIdHabitacion] = useState("");
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  // Estados para mensajes de error y éxito
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  // Estado para controlar el estado de carga del formulario
  const [cargando, setCargando] = useState(false);

  // Efecto para controlar acceso según rol de usuario
  useEffect(() => {
    if (!loading) {
      if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
        router.push("/auth/login");
        return;
      }
      
      // Cargar datos iniciales solo si el usuario está autenticado
      const huespedIdParam = searchParams.get("huespedId");
      if (huespedIdParam) {
        setIdHuesped(huespedIdParam);
      }
      
      cargarHabitaciones();
    }
  }, [loading, user, router, searchParams, fechaInicio, fechaFin]);

  // Función para cargar habitaciones disponibles desde el backend
  const cargarHabitaciones = async () => {
    try {
      if (!fechaInicio || !fechaFin) {
        setHabitacionesDisponibles([]);
        return;
      }
      // Importar la función obtenerHabitacionesDisponibles del servicio
      const { obtenerHabitacionesDisponibles } = await import("../../../modules/habitaciones/services/habitacionesService");
      const res = await obtenerHabitacionesDisponibles(fechaInicio, fechaFin);
      setHabitacionesDisponibles(res.data);
    } catch (err) {
      setError("Error al cargar las habitaciones disponibles");
    }
  };

  // Función para validar que la fecha fin sea posterior a la fecha inicio y que la fecha inicio no sea anterior a hoy
  const validarFechas = () => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (inicio < hoy) {
      setError("La fecha de inicio no puede ser anterior a hoy");
      return false;
    }
    if (fin <= inicio) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      return false;
    }
    return true;
  };

  // Manejar el envío del formulario para crear la reserva
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    // Validar fechas antes de enviar
    if (!validarFechas()) {
      return;
    }

    setCargando(true);
    try {
      // Calcular el número de noches
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const noches = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

      // Obtener el precio de la habitación seleccionada
      const habitacion = habitacionesDisponibles.find(h => h.id_habitacion === Number(idHabitacion));
      const precioAplicado = habitacion ? habitacion.precio_base : 0;

      const data = {
        fecha_entrada: fechaInicio,
        fecha_salida: fechaFin,
        estado: 'confirmada',
        huespedId: Number(idHuesped),
        detalles_reserva: [{
          id_habitacion: Number(idHabitacion),
          noches: noches,
          precio_aplicado: precioAplicado
        }]
      };

      // Enviar petición POST para crear la reserva
      await api.post("/reserva", data);
      setExito("Reserva creada exitosamente");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al crear la reserva. Verifique los datos.");
    } finally {
      setCargando(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) return null;

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Crear Reserva</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="formFechaInicio">
              <Form.Label>Fecha de Inicio</Form.Label>
            <Form.Control
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFechaFin">
              <Form.Label>Fecha de Fin</Form.Label>
            <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formIdHuesped">
              <Form.Label>ID Huésped</Form.Label>
              <Form.Control
                type="text"
                value={idHuesped}
                onChange={(e) => setIdHuesped(e.target.value)}
                required
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formIdHabitacion">
              <Form.Label>Habitación</Form.Label>
              <Form.Select
                value={idHabitacion}
                onChange={(e) => setIdHabitacion(e.target.value)}
                required
              >
                <option value="">Seleccione una habitación</option>
                {habitacionesDisponibles.map((habitacion) => (
                  <option key={habitacion.id_habitacion} value={habitacion.id_habitacion}>
                    Habitación {habitacion.numero} - {habitacion.tipo} - {habitacion.precio_base}€
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" disabled={cargando} className="btn-primary btn-action">
              {cargando ? (
                "Creando..."
              ) : (
                <>
                  <FiPlus />
                  Crear Reserva
                </>
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

// Componente principal envuelto en Suspense
export default function CrearReserva() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearReservaForm />
    </Suspense>
  );
}
