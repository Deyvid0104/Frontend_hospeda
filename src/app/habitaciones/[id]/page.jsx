/**
 * Página dinámica para mostrar y editar detalles de una habitación.
 * Controla la carga, edición y actualización de datos de la habitación.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams, notFound } from "next/navigation";
import { obtenerHabitacionPorId, actualizarHabitacion, obtenerFechasOcupacionPorHabitacion } from "../../../modules/habitaciones/services/habitacionesService";
import Cargando from "@/components/Cargando";
import { useAuth } from "@/context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../../globals.css';

export default function DetalleHabitacion() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Wrapper class para aislar estilos
  const wrapperClass = "habitacion-page-wrapper";

  const [habitacion, setHabitacion] = useState(null);
  const [modo, setModo] = useState("ver");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [precioBaseValido, setPrecioBaseValido] = useState(true);
  const [fechasReservadas, setFechasReservadas] = useState([]);

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
        cargarFechasReservadas();
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

  const cargarFechasReservadas = async () => {
    try {
      const res = await obtenerFechasOcupacionPorHabitacion();
      // Filtrar fechas para la habitación actual
      const fechas = res.data.find(item => item.id_habitacion === Number(id));
      if (fechas && fechas.fechas_ocupacion) {
        // Parsear fechas ocupadas en un array de fechas individuales
        const fechasArray = [];
        // Separar rangos por coma, pero también considerar que puede haber espacios
        const rangos = fechas.fechas_ocupacion.split(',').map(r => r.trim()).filter(r => r.length > 0);
        rangos.forEach(rango => {
          // Separar inicio y fin por ' a ', si no hay ' a ', considerar solo un día
          const partes = rango.split(' a ');
          if (partes.length === 2) {
            // Limpiar fecha para eliminar hora y convertir a formato ISO
            const inicioStr = partes[0].split(' ')[0];
            const finStr = partes[1].split(' ')[0];
            const inicio = new Date(inicioStr);
            const fin = new Date(finStr);
            let current = new Date(inicio);
            while (current <= fin) {
              fechasArray.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
          } else if (partes.length === 1) {
            // Solo un día
            const diaStr = partes[0].split(' ')[0];
            fechasArray.push(new Date(diaStr));
          }
        });
        setFechasReservadas(fechasArray);
      } else {
        setFechasReservadas([]);
      }
    } catch (err) {
      setError("Error al cargar las fechas reservadas");
    }
  };
  
  // Normalize date to midnight for comparison
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d;
  };
  
  // Function to check if two dates are the same day
  const isSameDay = (d1, d2) => {
    return normalizeDate(d1).getTime() === normalizeDate(d2).getTime();
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === "precio_base") {
      const valorNumerico = parseFloat(value);
      if (isNaN(valorNumerico) || valorNumerico < 0.01) {
        setPrecioBaseValido(false);
      } else {
        setPrecioBaseValido(true);
      }
      setHabitacion({ ...habitacion, [name]: value });
    } else {
      setHabitacion({ ...habitacion, [name]: value });
    }
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!precioBaseValido) {
      setError("El precio base debe ser un valor positivo mayor o igual a 0.01");
      return;
    }
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
    router.push(`/habitaciones/${id}?modo=${nuevoModo}`);
  };

  if (loading || !user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!habitacion) return notFound();

  // Función para deshabilitar fechas reservadas en el calendario
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      return fechasReservadas.some(d => isSameDay(d, date));
    }
    return false;
  };
  

  // Función para agregar clase a fechas reservadas en el calendario
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const isReserved = fechasReservadas.some(d => isSameDay(d, date));
      const today = new Date();
      const isToday = isSameDay(today, date);
      return (
        <>
          {isReserved && (
            <div
              style={{
                backgroundColor: '#007bff',
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                margin: '0 auto',
                marginTop: '2px',
              }}
              title="Fecha reservada"
            />
          )}
          {isToday && (
            <div
              style={{
                border: '2px solid #28a745',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                margin: '0 auto',
                marginTop: '0px',
                position: 'relative',
                zIndex: 10,
              }}
              title="Fecha actual"
            />
          )}
        </>
      );
    }
    return null;
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Habitación # {habitacion.numero}</h1>
        <div>
          {user.rol === "admin" && (
            <Button 
              variant={modo === "ver" ? "warning" : "info"} 
              onClick={cambiarModo}
              className="me-2"
            >
              {modo === "ver" ? "Editar" : "Ver"}
            </Button>
          )}
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
      <div className="row">
        <div className="col-lg-8">
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
              <Form.Select
                name="tipo"
                value={habitacion.tipo || ""}
                onChange={manejarCambio}
                required
                disabled={modo === "ver" || (user.rol === "recepcionista")}
              >
                <option value="individual">Individual</option>
                <option value="doble">Doble</option>
                <option value="triple">Triple</option>
                <option value="dormitorio">Dormitorio</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="precio_base">
              <Form.Label>Precio Base</Form.Label>
              <Form.Control
                type="number"
                name="precio_base"
                value={habitacion.precio_base || ""}
                onChange={manejarCambio}
                min="0.01"
                step="0.01"
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
                <option value="libre">libre</option>
                <option value="ocupado">ocupado</option>
                <option value="mantenimiento">mantenimiento</option>
                <option value="reservado">reservado</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="capacidad">
              <Form.Label>Capacidad</Form.Label>
              <Form.Select
                name="capacidad"
                value={habitacion.capacidad || ""}
                onChange={manejarCambio}
                required
                disabled={modo === "ver" || (user.rol === "recepcionista")}
              >
                <option value="1">1 huésped</option>
                <option value="2">2 huéspedes</option>
                <option value="3">3 huéspedes</option>
                <option value="4">4 huéspedes</option>
              </Form.Select>
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
        </div>
        <div className="col-lg-3 mt-4 mt-lg-0">
          {modo === "ver" && (
            <>
              <h3>Fechas de Reserva</h3>
              <div style={{ position: 'relative', zIndex: 1100 }}>
                <Calendar
                  tileContent={tileContent}
                  tileDisabled={tileDisabled}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
