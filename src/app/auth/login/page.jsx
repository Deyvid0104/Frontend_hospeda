// Página de login con formulario para email y contraseña, manejo de sesión con JWT y redirección por rol

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import Carga from "../../../components/Cargando";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta = await api.post("/auth/login", { email, contraseña });
      if (respuesta.data && respuesta.data.access_token) {
        login(respuesta.data.access_token);
      } else {
        setError("Respuesta inválida del servidor");
      }
    } catch (err) {
      setError("Error en la autenticación. Verifique sus credenciales.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Iniciar sesión</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {cargando ? (
            <Carga />
          ) : (
            <Form onSubmit={manejarSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ingrese su correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Entrar
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}
