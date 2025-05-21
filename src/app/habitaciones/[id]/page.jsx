
/**
 * Página dinámica para mostrar y editar detalles de una habitación.
 * Controla la carga, edición y actualización de datos de la habitación.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerHabitacionPorId, actualizarHabitacion } from "../../../modules/habitaciones/services/habitacionesService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleHabitacion() {
  // Obtener id de la habitación desde parámetros de ruta
  const { id } = useParams();
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario y estado de carga
  const { user, loading } = useAuth();

  // Estado para datos de la habitación
  const [habitacion, setHabitacion] = useState(null);
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
        // Cargar datos de la habitación
        cargarHabitacion();
      }
    }
  }, [loading, user]);

  // Función para cargar datos de la habitación desde backend
  const cargarHabitacion = async () => {
    setError("");
    setCargando(true);
    try {
      const res = await obtenerHabitacionPorId(id);
      setHabitacion(res.data);
    } catch (err) {
      setError("Error al cargar la habitación");
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setHabitacion({ ...habitacion, [name]: value });
  };

  // Manejar envío del formulario para actualizar datos
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarHabitacion(id, habitacion);
      setMensaje("Habitación actualizada correctamente");
      // Volver atrás después de 1.5 segundos
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la habitación");
    }
  };

  // Mostrar cargando mientras se obtienen datos o estado de usuario
  if (cargando || loading) return <Cargando />;

  // Mostrar mensaje si no se encontró la habitación
  if (!habitacion) return <p>No se encontró la habitación.</p>;

  // Renderizar formulario con datos de la habitación
  return (
    <Container className="mt-4">
      <h1>Detalle de Habitación #{habitacion.id}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Form onSubmit={manejarSubmit}>
        <Form.Group className="mb-3" controlId="numero">
          <Form.Label>Número</Form.Label>
          <Form.Control
            type="text"
            name="numero"
            value={habitacion.numero || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="tipo">
          <Form.Label>Tipo</Form.Label>
          <Form.Control
            type="text"
            name="tipo"
            value={habitacion.tipo || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="precio_base">
          <Form.Label>Precio Base</Form.Label>
          <Form.Control
            type="number"
            name="precio_base"
            value={habitacion.precio_base || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="estado">
          <Form.Label>Estado</Form.Label>
          <Form.Select
            name="estado"
            value={habitacion.estado || ""}
            onChange={manejarCambio}
            required
          >
            <option value="">Seleccione un estado</option>
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="reservado">Reservado</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="capacidad">
          <Form.Label>Capacidad</Form.Label>
          <Form.Control
            type="number"
            name="capacidad"
            value={habitacion.capacidad || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="foto">
          <Form.Label>Foto (URL)</Form.Label>
          <Form.Control
            type="url"
            name="foto"
            value={habitacion.foto || ""}
            onChange={manejarCambio}
            placeholder="Ingrese URL de la foto"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar cambios
        </Button>
      </Form>
    </Container>
  );
}
