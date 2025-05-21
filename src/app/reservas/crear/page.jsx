
/**
 * Página para crear una nueva reserva.
 * Controla el formulario de creación y envía los datos al backend.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function CrearReserva() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Estados para campos del formulario
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idHuesped, setIdHuesped] = useState("");
  const [idHabitacion, setIdHabitacion] = useState("");
  // Estados para mensajes y carga
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  // Efecto para controlar acceso según rol
  useEffect(() => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Manejar envío del formulario para crear reserva
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);

    try {
      const data = { fecha_inicio: fechaInicio, fecha_fin: fechaFin, id_huesped: idHuesped, id_habitacion: idHabitacion };
      await api.post("/reserva", data);
      setExito("Reserva creada exitosamente");
      // Limpiar campos
      setFechaInicio("");
      setFechaFin("");
      setIdHuesped("");
      setIdHabitacion("");
      // Volver atrás después de 1.5 segundos
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al crear la reserva. Verifique los datos.");
    } finally {
      setCargando(false);
    }
  };

  // Renderizar formulario de creación
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
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFechaFin">
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
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
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formIdHabitacion">
              <Form.Label>ID Habitación</Form.Label>
              <Form.Control
                type="text"
                value={idHabitacion}
                onChange={(e) => setIdHabitacion(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Reserva"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
