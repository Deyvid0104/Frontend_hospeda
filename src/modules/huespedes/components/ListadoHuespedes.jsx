/**
 * Componente ListadoHuespedes
 * Muestra una tabla con el listado de huéspedes obtenidos desde el backend.
 * Permite eliminar huéspedes y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerHuespedes, eliminarHuesped } from "../services/huespedesService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

export default function ListadoHuespedes() {
  const { user } = useAuth();
  const [huespedes, setHuespedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  useEffect(() => {
    cargarHuespedes();
  }, []);

  const manejarEliminar = async (id) => {
    if (!user || (user.rol !== "admin")) {
      setError("No tiene permisos para eliminar huéspedes");
      return;
    }
    if (!confirm("¿Está seguro de eliminar este huésped?")) return;
    try {
      await eliminarHuesped(id);
      setMensaje("Huésped eliminado correctamente");
      cargarHuespedes();
    } catch (err) {
      setError("Error al eliminar el huésped");
    }
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
                <Button variant="info" size="sm" href={`/huespedes/${huesped.id_huesped}`}>
                  Ver
                </Button>{" "}
                {(user && (user.rol === "admin" || user.rol === "recepcionista")) && (
                  <>
                    <Button variant="warning" size="sm" href={`/huespedes/${huesped.id_huesped}?modo=editar`}>
                      Editar
                    </Button>{" "}
                    <Button 
                      variant="success" 
                      size="sm" 
                      href={`/reservas/crear?huespedId=${huesped.id_huesped}`}
                    >
                      Crear Reserva
                    </Button>
                  </>
                )}{" "}
                {user && user.rol === "admin" && (
                  <Button variant="danger" size="sm" onClick={() => manejarEliminar(huesped.id_huesped)}>
                    Eliminar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
