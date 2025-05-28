/**
 * Componente ListadoUsuarios
 * Muestra una tabla con el listado de usuarios obtenidos desde el backend.
 * Permite eliminar usuarios y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { obtenerUsuarios, eliminarUsuario } from "../services/usuariosService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

export default function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga los usuarios desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarUsuarios = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      setError("Error al cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  // Carga los usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  /**
   * Maneja la eliminación de un usuario.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * @param {number} id - ID del usuario a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      setMensaje("Usuario eliminado correctamente");
      cargarUsuarios();
    } catch (err) {
      setError("Error al eliminar el usuario");
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
            <th>Nombre de usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>{usuario.id_usuario}</td>
              <td>{usuario.nombre_usuario}</td>
              <td>{usuario.rol}</td>
              <td>
                <Button variant="info" size="sm" href={`/usuarios/${usuario.id_usuario}`}>
                  Ver
                </Button>{" "}
                <Button variant="warning" size="sm" href={`/usuarios/${usuario.id_usuario}?modo=editar`}>
                  Editar
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => manejarEliminar(usuario.id_usuario)}>
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
