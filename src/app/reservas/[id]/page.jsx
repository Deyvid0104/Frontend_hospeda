/**
 * Página dinámica para mostrar y editar detalles de una reserva.
 * Controla la carga, edición y actualización de datos de la reserva.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { obtenerReservaPorId, actualizarReserva } from "../../../modules/reservas/services/reservasService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleReserva() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [reserva, setReserva] = useState(null);
  const [modo, setModo] = useState("ver");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

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
        cargarReserva();
      }
    }
  }, [loading, user]);

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

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setReserva({ ...reserva, [name]: value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarReserva(id, reserva);
      setMensaje("Reserva actualizada correctamente");
      setTimeout(() => {
        router.push("/reservas");
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la reserva");
    }
  };

  const cambiarModo = () => {
    const nuevoModo = modo === "ver" ? "editar" : "ver";
    if (nuevoModo === "ver") {
      router.push(`/reservas/${id}`);
    } else {
      router.push(`/reservas/${id}?modo=editar`);
    }
  };

  if (loading || !user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!reserva) return <p>No se encontró la reserva.</p>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Reserva #{reserva.id}</h1>
        <div>
          <Button 
            variant={modo === "ver" ? "warning" : "info"} 
            onClick={cambiarModo}
            className="me-2"
          >
            {modo === "ver" ? "Editar" : "Ver"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push("/reservas")}
          >
            Volver a Reservas
          </Button>
        </div>
      </div>
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
            disabled={modo === "ver"}
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
            disabled={modo === "ver"}
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
            disabled={modo === "ver"}
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
            disabled={modo === "ver"}
          />
        </Form.Group>
        {modo === "editar" && (
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        )}
      </Form>
    </Container>
  );
}
