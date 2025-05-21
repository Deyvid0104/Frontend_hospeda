"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";

export default function CrearFactura() {
  const router = useRouter();
  const { user } = useAuth();

  const [fecha, setFecha] = useState("");
  const [idReserva, setIdReserva] = useState("");
  const [monto, setMonto] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);

    try {
      const data = { fecha, id_reserva: idReserva, monto };
      await api.post("/factura", data);
      setExito("Factura creada exitosamente");
      setFecha("");
      setIdReserva("");
      setMonto("");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al crear la factura. Verifique los datos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Crear Factura</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Form onSubmit={manejarSubmit}>
            <Form.Group className="mb-3" controlId="formFecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formIdReserva">
              <Form.Label>ID Reserva</Form.Label>
              <Form.Control
                type="text"
                value={idReserva}
                onChange={(e) => setIdReserva(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMonto">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Factura"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
