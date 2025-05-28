/**
 * Componente ListadoFacturas
 * Muestra una tabla con el listado de facturas obtenidas desde el backend.
 * Permite eliminar facturas y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerFacturas, eliminarFactura } from "../services/facturasService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

export default function ListadoFacturas() {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  useEffect(() => {
    cargarFacturas();
  }, []);

  const manejarEliminar = async (id) => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      setError("No tiene permisos para eliminar facturas");
      return;
    }
    if (!confirm("¿Está seguro de eliminar esta factura?")) return;
    try {
      await eliminarFactura(id);
      setMensaje("Factura eliminada correctamente");
      cargarFacturas();
    } catch (err) {
      setError("Error al eliminar la factura");
    }
  };

  if (cargando) return <Carga />;

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
                <Button variant="info" size="sm" href={`/facturas/${factura.id}`}>
                  Ver
                </Button>{" "}
                {user && (user.rol === "admin" || user.rol === "recepcionista") && (
                  <>
                    <Button variant="warning" size="sm" href={`/facturas/${factura.id}?modo=editar`}>
                      Editar
                    </Button>{" "}
                    <Button variant="danger" size="sm" onClick={() => manejarEliminar(factura.id)}>
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
