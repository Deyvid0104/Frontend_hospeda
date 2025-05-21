
/**
 * Página dinámica para mostrar y editar detalles de un usuario.
 * Controla la carga, edición y actualización de datos del usuario.
 * Controla acceso según rol de usuario (admin o el mismo usuario).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerUsuarioPorId, actualizarUsuario } from "../../../modules/usuarios/services/usuariosService";
import Carga from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleUsuario() {
  // Obtener id del usuario desde parámetros de ruta
  const { id } = useParams();
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario y estado de carga
  const { user, loading } = useAuth();

  // Estado para datos del usuario
  const [usuario, setUsuario] = useState(null);
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
      } else if (user.rol !== "admin" && user.sub.toString() !== id.toString()) {
        // Redirigir a inicio si usuario no tiene permisos
        router.push("/");
      } else {
        // Cargar datos del usuario
        cargarUsuario();
      }
    }
  }, [loading, user]);

  // Función para cargar datos del usuario desde backend
  const cargarUsuario = async () => {
    setError("");
    setCargando(true);
    try {
      const res = await obtenerUsuarioPorId(id);
      setUsuario(res.data);
    } catch (err) {
      setError("Error al cargar el usuario");
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
  };

  // Manejar envío del formulario para actualizar datos
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarUsuario(id, usuario);
      setMensaje("Usuario actualizado correctamente");
      // Volver atrás después de 1.5 segundos
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al actualizar el usuario");
    }
  };

  // Mostrar cargando mientras se obtienen datos o estado de usuario
  if (cargando || loading) return <Cargando />;

  // Mostrar mensaje si no se encontró el usuario
  if (!usuario) return <p>No se encontró el usuario.</p>;

  // Renderizar formulario con datos del usuario
  return (
    <Container className="mt-4">
      <h1>Detalle de Usuario #{usuario.id}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Form onSubmit={manejarSubmit}>
        <Form.Group className="mb-3" controlId="nombre_usuario">
          <Form.Label>Nombre de usuario</Form.Label>
          <Form.Control
            type="text"
            name="nombre_usuario"
            value={usuario.nombre_usuario || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="rol">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            name="rol"
            value={usuario.rol || ""}
            onChange={manejarCambio}
            required
            disabled={user.rol === "recepcionista"}
          >
            <option value="">Seleccione un rol</option>
            <option value="admin">Admin</option>
            <option value="recepcionista">Recepcionista</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={usuario.password || ""}
            onChange={manejarCambio}
            placeholder="Dejar vacío para no cambiar"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar cambios
        </Button>
      </Form>
    </Container>
  );
}
