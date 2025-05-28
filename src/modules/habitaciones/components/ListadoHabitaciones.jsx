/**
 * Componente ListadoHabitaciones
 * Muestra una tabla con el listado de habitaciones obtenidas desde el backend.
 * Permite eliminar habitaciones y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerHabitaciones, eliminarHabitacion } from "../services/habitacionesService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

export default function ListadoHabitaciones() {
  // Obtener usuario actual para control de acceso
  const { user } = useAuth();
  // Estado para lista de habitaciones
  const [habitaciones, setHabitaciones] = useState([]);
  // Estado para control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga las habitaciones desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarHabitaciones = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerHabitaciones();
      setHabitaciones(res.data);
    } catch (err) {
      setError("Error al cargar las habitaciones");
    } finally {
      setCargando(false);
    }
  };

  // Carga las habitaciones al montar el componente
  useEffect(() => {
    cargarHabitaciones();
  }, []);

  /**
   * Maneja la eliminación de una habitación.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * Solo disponible para admin.
   * @param {number} id - ID de la habitación a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!user || user.rol !== "admin") {
      setError("No tiene permisos para eliminar habitaciones");
      return;
    }
    if (!confirm("¿Está seguro de eliminar esta habitación?")) return;
    try {
      await eliminarHabitacion(id);
      setMensaje("Habitación eliminada correctamente");
      cargarHabitaciones();
    } catch (err) {
      setError("Error al eliminar la habitación");
    }
  };

  // Mostrar indicador de carga mientras se obtienen datos
  if (cargando) return <Carga />;

  // Renderizar tabla con listado de habitaciones y acciones
  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Tipo</th>
            <th>Precio Base</th>
            <th>Estado</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {habitaciones.map((hab) => (
            <tr key={hab.id_habitacion}>
              <td>{hab.id_habitacion}</td>
              <td>{hab.numero}</td>
              <td>{hab.tipo}</td>
              <td>€{hab.precio_base}</td>
              <td>{hab.estado}</td>
              <td>{hab.capacidad}</td>
              <td>
                <Button variant="info" size="sm" href={`/habitaciones/${hab.id_habitacion}`}>
                  Ver
                </Button>{" "}
                {user && user.rol === "admin" && (
                  <>
                    <Button variant="warning" size="sm" href={`/habitaciones/${hab.id_habitacion}?modo=editar`}>
                      Editar
                    </Button>{" "}
                    <Button variant="danger" size="sm" onClick={() => manejarEliminar(hab.id_habitacion)}>
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
