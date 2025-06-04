"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams, notFound } from "next/navigation";
import { obtenerUsuarioPorId, actualizarUsuario } from "../../../modules/usuarios/services/usuariosService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleUsuario() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [usuario, setUsuario] = useState(null);
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
      if (!user || user.rol !== "admin") {
        router.push("/");
      } else {
        cargarUsuario();
      }
    }
  }, [loading, user]);

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

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarUsuario(id, usuario);
      setMensaje("Usuario actualizado correctamente");
      setTimeout(() => {
        router.push("/usuarios");
      }, 1500);
    } catch (err) {
      setError("Error al actualizar el usuario");
    }
  };

  const cambiarModo = () => {
    const nuevoModo = modo === "ver" ? "editar" : "ver";
    if (nuevoModo === "ver") {
      router.push(`/usuarios/${id}`);
    } else {
      router.push(`/usuarios/${id}?modo=editar`);
    }
  };

  if (loading || !user || user.rol !== "admin") {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!usuario) return notFound();

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Usuario #{usuario.id}</h1>
        <div>
          {/* Botón "Crear Reserva" eliminado según indicación */}
          <Button 
            variant={modo === "ver" ? "warning" : "info"} 
            onClick={cambiarModo}
            className="me-2"
          >
            {modo === "ver" ? "Editar" : "Ver"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push("/usuarios")}
          >
            Volver a Usuarios
          </Button>
        </div>
      </div>
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
            disabled={modo === "ver"}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="rol">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            name="rol"
            value={usuario.rol || ""}
            onChange={manejarCambio}
            required
            disabled={modo === "ver"}
          >
            <option value="">Seleccione un rol</option>
            <option value="admin">Admin</option>
            <option value="recepcionista">Recepcionista</option>
          </Form.Select>
        </Form.Group>
        {modo === "editar" && (
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
        )}
        {modo === "editar" && (
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        )}
      </Form>
    </Container>
  );
}
