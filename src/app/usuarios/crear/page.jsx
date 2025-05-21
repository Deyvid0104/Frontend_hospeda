"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function CrearUsuario() {
  const router = useRouter();
  const { user } = useAuth();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/auth/login");
    }
  }, [user, router]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);

    try {
      const data = {
        nombre_usuario: nombreUsuario,
        email,
        rol,
        contraseña: password,
        ultimo_acceso: new Date().toISOString(),
      };
      await api.post("/usuario", data);
      setExito("Usuario creado exitosamente");
      setNombreUsuario("");
      setRol("admin");
      setPassword("");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al crear el usuario. Verifique los datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Crear Usuario</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="formNombreUsuario">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                value={nombreUsuario}
                onChange={(e) => {
                  setNombreUsuario(e.target.value);
                  if (!password) {
                    setPassword(e.target.value);
                  }
                }}
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

            <Form.Group className="mb-3" controlId="formRol">
              <Form.Label>Rol</Form.Label>
              <Form.Select value={rol} onChange={(e) => setRol(e.target.value)} required>
                <option value="admin">Admin</option>
                <option value="recepcionista">Recepcionista</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Por defecto es el nombre de usuario"
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Usuario"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
