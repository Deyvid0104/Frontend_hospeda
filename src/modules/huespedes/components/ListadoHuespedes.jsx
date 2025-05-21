
/**
 * Componente ListadoHuespedes
 * Muestra una tabla con el listado de huéspedes obtenidos desde el backend.
 * Permite eliminar huéspedes y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { obtenerHuespedes, eliminarHuesped } from "../services/huespedesService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

export default function ListadoHuespedes() {
  // Estado para lista de huéspedes
  const [huespedes, setHuespedes] = useState([]);
  // Estado para control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga los huéspedes desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarHuespedes = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerHuespedes();
      setHuespedes(res.data);
    } catch (err) {
      setError("Error al cargar los huéspedes");
    } finally {
      setCargando(false);
    }
  };

  // Carga los huéspedes al montar el componente
  useEffect(() => {
    cargarHuespedes();
  }, []);

  /**
   * Maneja la eliminación de un huésped.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * @param {number} id - ID del huésped a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!confirm("¿Está seguro de eliminar este huésped?")) return;
    try {
      await eliminarHuesped(id);
      setMensaje("Huésped eliminado correctamente");
      cargarHuespedes();
    } catch (err) {
      setError("Error al eliminar el huésped");
    }
  };

  // Mostrar indicador de carga mientras se obtienen datos
  if (cargando) return <Carga />;

  // Renderizar tabla con listado de huéspedes y acciones
  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {huespedes.map((huesped) => (
            <tr key={huesped.id_huesped}>
              <td>{huesped.id_huesped}</td>
              <td>{huesped.nombre}</td>
              <td>{huesped.apellidos}</td>
              <td>{huesped.email}</td>
              <td>{huesped.telefono}</td>
              <td>
                <Button variant="warning" size="sm" href={`/huespedes/${huesped.id_huesped}`}>
                  Ver / Editar
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => manejarEliminar(huesped.id_huesped)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
