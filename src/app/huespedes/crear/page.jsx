
/**
 * Página para crear un nuevo huésped.
 * Controla el formulario de creación y envía los datos al backend.
 * Controla acceso según rol de usuario (admin o recepcionista).
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function CrearHuesped() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Estados para campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documentoIdentidad, setDocumentoIdentidad] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  // Estados para mensajes y carga
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  // Efecto para controlar acceso según rol
  useEffect(() => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Manejar envío del formulario para crear huésped
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);

    try {
      const data = {
        nombre,
        apellidos,
        documento_identidad: documentoIdentidad,
        email,
        telefono,
        fecha_registro: new Date(),
      };
      await api.post("/huesped", data);
      setExito("Huésped creado exitosamente");
      // Limpiar campos
      setNombre("");
      setApellidos("");
      setDocumentoIdentidad("");
      setEmail("");
      setTelefono("");
      // Volver atrás después de 1.5 segundos
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al crear el huésped. Verifique los datos.");
    } finally {
      setCargando(false);
    }
  };

  // Renderizar formulario de creación
  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Crear Huésped</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formApellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDocumentoIdentidad">
              <Form.Label>Documento de Identidad</Form.Label>
              <Form.Control
                type="text"
                value={documentoIdentidad}
                onChange={(e) => setDocumentoIdentidad(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTelefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Huésped"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
