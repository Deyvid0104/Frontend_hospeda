
/**
 * Página dinámica para mostrar y editar detalles de una reserva.
 * Controla la carga, edición y actualización de datos de la reserva.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerReservaPorId, actualizarReserva } from "../../../modules/reservas/services/reservasService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleReserva() {
  // Obtener id de la reserva desde parámetros de ruta
  const { id } = useParams();
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario y estado de carga
  const { user, loading } = useAuth();

  // Estado para datos de la reserva
  const [reserva, setReserva] = useState(null);
  // Estado para control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Efecto para controlar acceso y cargar datos al montar o cambiar usuario
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirigir a login si no hay usuario
        router.push("/auth/login");
      } else if (user.rol !== "admin" && user.rol !== "recepcionista") {
        // Redirigir a inicio si usuario no tiene permisos
        router.push("/");
      } else {
        // Cargar datos de la reserva
        cargarReserva();
      }
    }
  }, [loading, user]);

  // Función para cargar datos de la reserva desde backend
  const cargarReserva = async () => {
    setError("");
    setCargando(true);
    try {
      const res = await obtenerReservaPorId(id);
      setReserva(res.data);
    } catch (err) {
      setError("Error al cargar la reserva");
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setReserva({ ...reserva, [name]: value });
  };

  // Manejar envío del formulario para actualizar datos
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarReserva(id, reserva);
      setMensaje("Reserva actualizada correctamente");
      // Volver atrás después de 1.5 segundos
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la reserva");
    }
  };

  // Mostrar cargando mientras se obtienen datos o estado de usuario
  if (cargando || loading) return <Cargando />;

  // Mostrar mensaje si no se encontró la reserva
  if (!reserva) return <p>No se encontró la reserva.</p>;

  // Renderizar formulario con datos de la reserva
  return (
    <Container className="mt-4">
      <h1>Detalle de Reserva #{reserva.id}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Form onSubmit={manejarSubmit}>
        <Form.Group className="mb-3" controlId="fecha_inicio">
          <Form.Label>Fecha inicio</Form.Label>
          <Form.Control
            type="date"
            name="fecha_inicio"
            value={reserva.fecha_inicio || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="fecha_fin">
          <Form.Label>Fecha fin</Form.Label>
          <Form.Control
            type="date"
            name="fecha_fin"
            value={reserva.fecha_fin || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="id_huesped">
          <Form.Label>ID Huésped</Form.Label>
          <Form.Control
            type="number"
            name="id_huesped"
            value={reserva.id_huesped || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="id_habitacion">
          <Form.Label>ID Habitación</Form.Label>
          <Form.Control
            type="number"
            name="id_habitacion"
            value={reserva.id_habitacion || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar cambios
        </Button>
      </Form>
    </Container>
  );
}
