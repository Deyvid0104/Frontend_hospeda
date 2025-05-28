/**
 * Componente ListadoReservas
 * Muestra una tabla con el listado de reservas obtenidas desde el backend.
 * Permite eliminar reservas y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerReservas, eliminarReserva } from "../services/reservasService";
import { obtenerDetallesPorReserva } from "../services/detallesReservaService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert, Badge } from "react-bootstrap";

export default function ListadoReservas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      // Obtener las reservas
      const resReservas = await obtenerReservas();
      const reservasData = resReservas.data;
      
      // Para cada reserva, obtener sus detalles
      const errores = [];
      const reservasConDetalles = await Promise.all(
        reservasData.map(async (reserva) => {
          try {
            const resDetalles = await obtenerDetallesPorReserva(reserva.id_reserva);
            return {
              ...reserva,
              detalles_reserva: resDetalles.data || []
            };
          } catch (err) {
            console.error(`Error al obtener detalles para reserva ${reserva.id_reserva}:`, err);
            errores.push(`Error al cargar detalles de la reserva ${reserva.id_reserva}`);
            return {
              ...reserva,
              detalles_reserva: []
            };
          }
        })
      );

      // Ordenar reservas por fecha de entrada (más recientes primero)
      const reservasOrdenadas = reservasConDetalles.sort((a, b) => 
        new Date(b.fecha_entrada) - new Date(a.fecha_entrada)
      );

      if (reservasOrdenadas.length === 0) {
        setError("No hay reservas para mostrar");
      } else {
        setReservas(reservasOrdenadas);
        // Si hay errores pero se pudieron cargar algunas reservas, mostrar una advertencia
        if (errores.length > 0) {
          setError("Se han cargado las reservas, pero algunas habitaciones no están disponibles temporalmente.");
          console.warn("Detalles de los errores:", errores);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "No se pudieron cargar las reservas. Por favor, intente nuevamente más tarde.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarEliminar = async (id) => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      setError("No tiene permisos para eliminar reservas");
      return;
    }
    if (!confirm("¿Está seguro de eliminar esta reserva?")) return;
    try {
      await eliminarReserva(id);
      setMensaje("Reserva eliminada correctamente");
      cargarDatos(); // Recargar todos los datos después de eliminar
    } catch (err) {
      setError("Error al eliminar la reserva");
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'secondary';
    }
  };

  const mostrarHabitaciones = (detalles) => {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return "Sin asignar";
    }
    
    // Mostrar habitacion.numero si existe, sino id_habitacion
    const habitaciones = detalles
      .map(d => {
        if (d.habitacion && d.habitacion.numero) {
          return d.habitacion.numero;
        }
        if (d.id_habitacion) {
          return `#${d.id_habitacion}`;
        }
        return null;
      })
      .filter(id => id !== null);

    return habitaciones.length > 0 ? habitaciones.join(", ") : "Sin asignar";
  };

  if (cargando) return <Carga />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha entrada</th>
            <th>Fecha salida</th>
            <th>Estado</th>
            <th>ID Huésped</th>
            <th>Habitación(es)</th>
            <th>Duración</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => {
            const fechaEntrada = new Date(reserva.fecha_entrada);
            const fechaSalida = new Date(reserva.fecha_salida);
            const duracion = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
            
            return (
              <tr key={reserva.id_reserva}>
                <td>{reserva.id_reserva}</td>
                <td>{fechaEntrada.toLocaleDateString()}</td>
                <td>{fechaSalida.toLocaleDateString()}</td>
                <td>
                  <Badge bg={obtenerColorEstado(reserva.estado)}>
                    {reserva.estado || 'N/A'}
                  </Badge>
                </td>
                <td>{reserva.id_huesped}</td>
                <td>{mostrarHabitaciones(reserva.detalles_reserva)}</td>
                <td>{duracion} {duracion === 1 ? 'día' : 'días'}</td>
                <td>
                  <Button variant="info" size="sm" href={`/reservas/${reserva.id_reserva}`}>
                    Ver
                  </Button>{" "}
                  {user && (user.rol === "admin" || user.rol === "recepcionista") && (
                    <>
                      <Button variant="warning" size="sm" href={`/reservas/${reserva.id_reserva}?modo=editar`}>
                        Editar
                      </Button>{" "}
                      <Button variant="danger" size="sm" onClick={() => manejarEliminar(reserva.id_reserva)}>
                        Eliminar
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}