// Página dinámica para mostrar y editar detalles de una factura

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerFacturaPorId, actualizarFactura } from "../../../modules/facturas/services/facturasService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleFactura() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [factura, setFactura] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.rol !== "admin" && user.rol !== "recepcionista") {
        router.push("/");
      } else {
        cargarFactura();
      }
    }
  }, [loading, user]);

  const cargarFactura = async () => {
    setError("");
    setCargando(true);
    try {
      const res = await obtenerFacturaPorId(id);
      setFactura(res.data);
    } catch (err) {
      setError("Error al cargar la factura");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFactura({ ...factura, [name]: value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await actualizarFactura(id, factura);
      setMensaje("Factura actualizada correctamente");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la factura");
    }
  };

  if (cargando || loading) return <Cargando />;

  if (!factura) return <p>No se encontró la factura.</p>;

  return (
    <Container className="mt-4">
      <h1>Detalle de Factura #{factura.id}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Form onSubmit={manejarSubmit}>
        <Form.Group className="mb-3" controlId="monto_total">
          <Form.Label>Monto total</Form.Label>
          <Form.Control
            type="number"
            name="monto_total"
            value={factura.monto_total || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="metodo_pago">
          <Form.Label>Método de pago</Form.Label>
          <Form.Control
            type="text"
            name="metodo_pago"
            value={factura.metodo_pago || ""}
            onChange={manejarCambio}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar cambios
        </Button>
      </Form>
    </Container>
  );
}
