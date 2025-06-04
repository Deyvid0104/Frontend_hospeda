/**
 * Página dinámica para mostrar y editar detalles de una reserva.
 * Controla la carga, edición y actualización de datos de la reserva.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams, notFound } from "next/navigation";
import { obtenerReservaPorId, actualizarReserva } from "../../../modules/reservas/services/reservasService";
import { obtenerHabitaciones } from "../../../modules/habitaciones/services/habitacionesService";
import { obtenerHuespedes } from "../../../modules/huespedes/services/huespedesService";
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
  const [habitaciones, setHabitaciones] = useState([]);
  const [huespedes, setHuespedes] = useState([]);

  useEffect(() => {
    const modoParam = searchParams.get("modo");
    setModo(modoParam || "ver");
  }, [searchParams]);

  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        const res = await obtenerHabitaciones();
        setHabitaciones(res.data);
      } catch (err) {
        // Manejar error si es necesario
      }
    };

    const cargarHuespedes = async () => {
      try {
        const res = await obtenerHuespedes();
        setHuespedes(res.data);
      } catch (err) {
        // Manejar error si es necesario
      }
    };

    cargarHabitaciones();
    cargarHuespedes();
  }, []);

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
      // Inicializar id_huesped e id_habitacion para modo editar
      const reservaData = res.data;
      if (reservaData) {
        reservaData.id_huesped = reservaData.huesped ? reservaData.huesped.id_huesped : null;
        reservaData.id_habitacion = (reservaData.detalles_reserva && reservaData.detalles_reserva.length > 0 && reservaData.detalles_reserva[0].habitacion)
          ? reservaData.detalles_reserva[0].habitacion.id_habitacion
          : null;
      }
      setReserva(reservaData);
    } catch (err) {
      setError("Error al cargar la reserva");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === "id_habitacion") {
      setReserva({ ...reserva, id_habitacion: Number(value) });
    } else if (name === "id_huesped") {
      setReserva({ ...reserva, id_huesped: Number(value) });
    } else {
      setReserva({ ...reserva, [name]: value });
    }
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      // Construir objeto con estructura esperada por backend
      const reservaActualizar = {
        fecha_entrada: new Date(reserva.fecha_entrada),
        fecha_salida: new Date(reserva.fecha_salida),
        estado: reserva.estado || 'confirmada',
        huespedId: Number(reserva.id_huesped),
        detalles_reserva: [
          {
            id_habitacion: Number(reserva.id_habitacion),
            noches: reserva.detalles_reserva && reserva.detalles_reserva.length > 0 ? reserva.detalles_reserva[0].noches : 1,
            precio_aplicado: reserva.detalles_reserva && reserva.detalles_reserva.length > 0 ? reserva.detalles_reserva[0].precio_aplicado : 0,
          }
        ]
      };
      await actualizarReserva(id, reservaActualizar);
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
  if (!reserva) return notFound();

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
        <Form.Group className="mb-3" controlId="fecha_entrada">
          <Form.Label>Fecha entrada</Form.Label>
          <Form.Control
            type="date"
            name="fecha_entrada"
            value={reserva.fecha_entrada ? new Date(reserva.fecha_entrada).toISOString().split("T")[0] : ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
            min={new Date().toISOString().split("T")[0]}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="fecha_salida">
          <Form.Label>Fecha salida</Form.Label>
          <Form.Control
            type="date"
            name="fecha_salida"
            value={reserva.fecha_salida ? new Date(reserva.fecha_salida).toISOString().split("T")[0] : ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
            min={new Date().toISOString().split("T")[0]}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="id_huesped">
          <Form.Label>Huésped</Form.Label>
          {modo === "ver" ? (
            <Form.Control
              type="text"
              value={reserva.huesped ? reserva.huesped.nombre : ""}
              disabled
            />
          ) : (
            <Form.Control
              type="text"
              value={
                huespedes.find(h => h.id_huesped === reserva.id_huesped)
                  ? `${huespedes.find(h => h.id_huesped === reserva.id_huesped).nombre} ${huespedes.find(h => h.id_huesped === reserva.id_huesped).apellidos}`
                  : ""
              }
              disabled
            />
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="id_habitacion">
          <Form.Label>Nº Habitación</Form.Label>
          {modo === "ver" ? (
            <Form.Control
              type="text"
              disabled
              value={
                reserva.detalles_reserva && reserva.detalles_reserva.length > 0 && reserva.detalles_reserva[0].habitacion && reserva.detalles_reserva[0].habitacion.numero
                  ? reserva.detalles_reserva[0].habitacion.numero
                  : reserva.id_habitacion || ""
              }
            />
          ) : (
            <Form.Select
              name="id_habitacion"
              value={reserva.id_habitacion || ""}
              onChange={manejarCambio}
              required
              disabled={false}
            >
              <option value="">Seleccione una habitación</option>
              {habitaciones.map((habitacion) => (
                <option key={habitacion.id_habitacion} value={habitacion.id_habitacion}>
                  Habitación {habitacion.numero} - {habitacion.tipo} - {habitacion.precio_base}€
                </option>
              ))}
            </Form.Select>
          )}
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
