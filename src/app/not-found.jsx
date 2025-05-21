/**
 * Página 404 personalizada para Hospeda+.
 * Muestra un mensaje amigable y acorde al diseño general del proyecto.
 * Incluye botón para volver a la página principal.
 */

"use client";

import React from "react";
import Link from "next/link";
import { Container, Button } from "react-bootstrap";

export default function NotFound() {
  return (
    <Container className="text-center mt-5">
      <h1 className="display-4">404 - Página no encontrada</h1>
      <p className="lead">
        Lo sentimos, la página que buscas no existe en Hospeda+.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg">
          Volver al inicio
        </Button>
      </Link>
    </Container>
  );
}
