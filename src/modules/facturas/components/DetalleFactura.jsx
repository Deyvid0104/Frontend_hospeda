import React, { useState } from "react";
import { crearDetalleFactura, actualizarDetalleFactura } from "../services/detallesFacturaService";
import { Form, Button, Alert } from "react-bootstrap";

export default function DetalleFactura({ idFactura }) {
  const [concepto, setConcepto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!concepto || !precioUnitario || cantidad <= 0) {
      setError("Por favor, complete todos los campos correctamente.");
      return;
    }

    const detalleData = {
      concepto,
      cantidad,
      precio_unitario: parseFloat(precioUnitario),
      id_factura: parseInt(idFactura),
    };

    try {
      await crearDetalleFactura(detalleData);
      setMensaje("Detalle de factura creado correctamente.");
      setConcepto("");
      setCantidad(1);
      setPrecioUnitario("");
    } catch (err) {
      setError("Error al crear el detalle de factura.");
    }
  };

  return (
    <>
      <h3>Formulario de Detalle de Factura #{idFactura}</h3>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="concepto" className="mb-3">
          <Form.Label>Concepto</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese el concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="cantidad" className="mb-3">
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            required
          />
        </Form.Group>

        <Form.Group controlId="precioUnitario" className="mb-3">
          <Form.Label>Precio Unitario (€)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0"
            placeholder="Ingrese el precio unitario"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Guardar Detalle
        </Button>
      </Form>
    </>
  );
}
