/**
 * Página dinámica para mostrar y editar detalles de un huésped.
 * Controla la carga, edición y actualización de datos del huésped.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerHuespedPorId, actualizarHuesped } from "../../../modules/huespedes/services/huespedesService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleHuesped() {
  // Obtener id del huésped desde parámetros de ruta
  const { id } = useParams();
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario y estado de carga
  const { user, loading } = useAuth();

  // Estado para datos del huésped
  const [huesped, setHuesped] = useState(null);
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
        // Cargar datos del huésped
        cargarHuesped();
      }
    }
  }, [loading, user]);

  // Función para cargar datos del huésped desde backend
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

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setHuesped({ ...huesped, [name]: value });
  };

  // Manejar envío del formulario para actualizar datos
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarHuesped(id, huesped);
      setMensaje("Huésped actualizado correctamente");
      // Volver atrás después de 1.5 segundos
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al actualizar el huésped");
    }
  };

  // Mostrar cargando mientras se obtienen datos o estado de usuario
  if (cargando || loading) return <Cargando />;

  // Mostrar mensaje si no se encontró el huésped
  if (!huesped) return <p>No se encontró el huésped.</p>;

  // Renderizar formulario con datos del huésped
  return (
    <Container className="mt-4">
      <h1>Detalle de Huésped #{huesped.id}</h1>
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
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar cambios
        </Button>
      </Form>
    </Container>
  );
}
