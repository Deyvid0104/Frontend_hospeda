/**
 * Página dinámica para mostrar y editar detalles de un huésped.
 * Controla la carga, edición y actualización de datos del huésped.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { obtenerHuespedPorId, actualizarHuesped } from "../../../modules/huespedes/services/huespedesService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleHuesped() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [huesped, setHuesped] = useState(null);
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
        cargarHuesped();
      }
    }
  }, [loading, user]);

  const cargarHuesped = async () => {
    setError("");
    setCargando(true);
    try {
      const res = await obtenerHuespedPorId(id);
      setHuesped(res.data);
    } catch (err) {
      setError("Error al cargar el huésped");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setHuesped({ ...huesped, [name]: value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarHuesped(id, huesped);
      setMensaje("Huésped actualizado correctamente");
      setTimeout(() => {
        router.push("/huespedes");
      }, 1500);
    } catch (err) {
      setError("Error al actualizar el huésped");
    }
  };

  const cambiarModo = () => {
    const nuevoModo = modo === "ver" ? "editar" : "ver";
    if (nuevoModo === "ver") {
      router.push(`/huespedes/${id}`);
    } else {
      router.push(`/huespedes/${id}?modo=editar`);
    }
  };

  const crearReserva = () => {
    router.push(`/reservas/crear?huespedId=${id}`);
  };

  if (loading || !user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!huesped) return <p>No se encontró el huésped.</p>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Huésped # {huesped.id_huesped}</h1>
        <div>
          <Button 
            variant={modo === "ver" ? "warning" : "info"} 
            onClick={cambiarModo}
            className="me-2"
          >
            {modo === "ver" ? "Editar" : "Ver"}
          </Button>
          <Button 
            variant="success" 
            onClick={crearReserva}
            className="me-2"
          >
            Crear Reserva
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push("/huespedes")}
          >
            Volver a Huéspedes
          </Button>
        </div>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Form onSubmit={manejarSubmit}>
        <Form.Group className="mb-3" controlId="nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={huesped.nombre || ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="apellidos">
          <Form.Label>Apellidos</Form.Label>
          <Form.Control
            type="text"
            name="apellidos"
            value={huesped.apellidos || ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={huesped.email || ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="telefono">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={huesped.telefono || ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="documento_identidad">
          <Form.Label>Documento de Identidad</Form.Label>
          <Form.Control
            type="text"
            name="documento_identidad"
            value={huesped.documento_identidad || ""}
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
