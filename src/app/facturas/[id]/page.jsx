/**
 * Página dinámica para mostrar y editar detalles de una factura.
 * Accesible por usuarios con rol admin y recepcionista.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { obtenerFacturaPorId, actualizarFactura } from "../../../modules/facturas/services/facturasService";
import Cargando from "../../../components/Cargando";
import { useAuth } from "../../../context/AuthContext";
import { Form, Button, Alert, Container } from "react-bootstrap";

export default function DetalleFactura() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [factura, setFactura] = useState(null);
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
        router.push("/facturas");
      }, 1500);
    } catch (err) {
      setError("Error al actualizar la factura");
    }
  };

  const cambiarModo = () => {
    const nuevoModo = modo === "ver" ? "editar" : "ver";
    if (nuevoModo === "ver") {
      router.push(`/facturas/${id}`);
    } else {
      router.push(`/facturas/${id}?modo=editar`);
    }
  };

  if (loading || !user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
    return null;
  }

  if (cargando) return <Cargando />;
  if (!factura) return <p>No se encontró la factura.</p>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Factura #{factura.id}</h1>
        <div>
          <Button 
            variant={modo === "ver" ? "warning" : "info"} 
            onClick={cambiarModo}
            className="me-2"
          >
            {modo === "ver" ? "Editar" : "Ver"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push("/facturas")}
          >
            Volver a Facturas
          </Button>
        </div>
      </div>
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
            disabled={modo === "ver"}
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
            disabled={modo === "ver"}
          />
        </Form.Group>
        {modo === "editar" && (
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        )}
      </Form>
    </Container>
  );
}
