// Componente reutilizable para mostrar estado de carga (loading)

"use client";

import React from "react";
import { Spinner } from "react-bootstrap";

export default function Carga() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
      <Spinner animation="border" role="status" variant="primary" >
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </div>
  );
}
