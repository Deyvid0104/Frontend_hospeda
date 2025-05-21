// Componente para mostrar listado de facturas

"use client";

import React, { useEffect, useState } from "react";
import { obtenerFacturas, eliminarFactura } from "../services/facturasService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

/**
 * Componente ListadoFacturas
 * Muestra una tabla con el listado de facturas obtenidas desde el backend.
 * Permite eliminar facturas y navegar a la vista de edición.
 */
export default function ListadoFacturas() {
  // Estado para lista de facturas
  const [facturas, setFacturas] = useState([]);
  // Estado para control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga las facturas desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarFacturas = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerFacturas();
      setFacturas(res.data);
    } catch (err) {
      setError("Error al cargar las facturas");
    } finally {
      setCargando(false);
    }
  };

  // Carga las facturas al montar el componente
  useEffect(() => {
    cargarFacturas();
  }, []);

  /**
   * Maneja la eliminación de una factura.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * @param {number} id - ID de la factura a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta factura?")) return;
    try {
      await eliminarFactura(id);
      setMensaje("Factura eliminada correctamente");
      cargarFacturas();
    } catch (err) {
      setError("Error al eliminar la factura");
    }
  };

  // Mostrar indicador de carga mientras se obtienen datos
  if (cargando) return <Carga />;

  // Renderizar tabla con listado de facturas y acciones
  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Monto total</th>
            <th>Método de pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura) => (
            <tr key={factura.id}>
              <td>{factura.id}</td>
              <td>${factura.monto_total}</td>
              <td>{factura.metodo_pago}</td>
              <td>
                <Button variant="warning" size="sm" href={`/facturas/${factura.id}`}>
                  Ver / Editar
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => manejarEliminar(factura.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
