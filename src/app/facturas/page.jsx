/**
 * Página principal del módulo Facturas.
 * Muestra el listado de facturas y un botón para crear nuevas facturas
 * si el usuario tiene rol de admin o recepcionista.
 */

// "use client" habilita el modo cliente para este componente
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ListadoFacturas from "../../modules/facturas/components/ListadoFacturas";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";
import ModalFactura from "../../modules/facturas/components/ModalFactura";
import { obtenerFacturaPorId } from "../../modules/facturas/services/facturasService";

export default function PaginaFacturas() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // Función para navegar a la página de creación de factura
  const handleCrearClick = () => {
    router.push("/facturas/crear");
  };

  // Función para abrir modal con factura para imprimir
  const handleImprimirClick = async (id) => {
    try {
      const res = await obtenerFacturaPorId(id);
      setFacturaSeleccionada(res.data);
      setShowModal(true);
    } catch (error) {
      alert("Error al cargar la factura para imprimir");
    }
  };

  return (
    <div className="mt-4">
      <h1>Facturas</h1>
      {/* Mostrar botón crear solo para roles admin o recepcionista */}
      {user && (user.rol === "admin" || user.rol === "recepcionista") && (
        <Button variant="primary" className="mb-3" onClick={handleCrearClick}>
          Crear Factura
        </Button>
      )}
      {/* Componente que muestra el listado de facturas */}
      <ListadoFacturas onImprimir={handleImprimirClick} />
      <ModalFactura
        show={showModal}
        onHide={() => setShowModal(false)}
        factura={facturaSeleccionada}
      />
    </div>
  );
}
