"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function CrearHabitacion() {
  const router = useRouter();
  const { user } = useAuth();

  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("individual");
  const [precioBase, setPrecioBase] = useState("");
  const [estado, setEstado] = useState("libre");
  const [capacidad, setCapacidad] = useState("1");
  const [foto, setFoto] = useState("");
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
        numero: parseInt(numero),
        tipo,
        precio_base: parseFloat(precioBase),
        estado,
        capacidad: parseInt(capacidad),
        foto,
      };
      await api.post("/habitacion", data);
      setExito("Habitación creada exitosamente");
      setNumero("");
      setTipo("individual");
      setPrecioBase("");
      setEstado("libre");
      setCapacidad("1");
      setFoto("");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al crear la habitación. Verifique los datos.");
    } finally {
      setCargando(false);
    }
  };

  const manejarPrecioBaseChange = (e) => {
    const valor = e.target.value;
    if (valor === "" || parseFloat(valor) >= 0) {
      setPrecioBase(valor);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Crear Habitación</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="formNumero">
              <Form.Label>Número</Form.Label>
              <Form.Control
                type="number"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTipo">
              <Form.Label>Tipo</Form.Label>
              <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                <option value="individual">individual</option>
                <option value="doble">doble</option>
                <option value="triple">triple</option>
                <option value="dormitorio">dormitorio</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPrecioBase">
              <Form.Label>Precio Base</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={precioBase}
                onChange={manejarPrecioBaseChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEstado">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)} required>
                <option value="libre">libre</option>
                <option value="ocupado">ocupado</option>
                <option value="mantenimiento">mantenimiento</option>
                <option value="reservado">reservado</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCapacidad">
              <Form.Label>Capacidad</Form.Label>
              <Form.Select value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required>
                <option value="1">1 huésped</option>
                <option value="2">2 huéspedes</option>
                <option value="3">3 huéspedes</option>
                <option value="4">4 huéspedes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFoto">
              <Form.Label>Foto (URL)</Form.Label>
              <Form.Control
                type="url"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Habitación"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
