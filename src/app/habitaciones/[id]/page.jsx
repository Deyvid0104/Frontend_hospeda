/**
 * Página dinámica para mostrar y editar detalles de una habitación.
 * Controla la carga, edición y actualización de datos de la habitación.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { obtenerHabitacionPorId, actualizarHabitacion } from "../../../modules/habitaciones/services/habitacionesService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleHabitacion() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [habitacion, setHabitacion] = useState(null);
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
        cargarHabitacion();
      }
    }
  }, [loading, user]);

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

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setHabitacion({ ...habitacion, [name]: value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarHabitacion(id, habitacion);
      setMensaje("Habitación actualizada correctamente");
      setTimeout(() => {
        router.push("/habitaciones");
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la habitación");
    }
  };

  const cambiarModo = () => {
    const nuevoModo = modo === "ver" ? "editar" : "ver";
    if (nuevoModo === "ver") {
      router.push(`/habitaciones/${id}`);
    } else {
      router.push(`/habitaciones/${id}?modo=editar`);
    }
  };

  if (loading || !user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!habitacion) return <p>No se encontró la habitación.</p>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Habitación #{habitacion.id}</h1>
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
            onClick={() => router.push("/habitaciones")}
          >
            Volver a Habitaciones
          </Button>
        </div>
      </div>
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
            disabled={modo === "ver" || (user.rol === "recepcionista")}
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
            disabled={modo === "ver" || (user.rol === "recepcionista")}
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
            disabled={modo === "ver" || (user.rol === "recepcionista")}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="estado">
          <Form.Label>Estado</Form.Label>
          <Form.Select
            name="estado"
            value={habitacion.estado || ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver" || (user.rol === "recepcionista")}
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
            disabled={modo === "ver" || (user.rol === "recepcionista")}
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
            disabled={modo === "ver" || (user.rol === "recepcionista")}
          />
        </Form.Group>
        {modo === "editar" && user.rol === "admin" && (
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        )}
      </Form>
    </Container>
  );
}
