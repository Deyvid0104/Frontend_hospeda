/**
 * Página principal del módulo Reservas.
 * Muestra el listado de reservas y un botón para crear nuevas reservas
 * si el usuario tiene rol de admin o recepcionista.
 */

// "use client" habilita el modo cliente para este componente
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ListadoReservas from "../../modules/reservas/components/ListadoReservas";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

export default function PaginaReservas() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Función para navegar a la página de creación de reserva
  const handleCrearClick = () => {
    router.push("/reservas/crear");
  };

  return (
    <div className="mt-4">
      <h1>Reservas</h1>
      {/* Mostrar botón crear solo para roles admin o recepcionista */}
      {user && (user.rol === "admin" || user.rol === "recepcionista") && (
        <Button variant="primary" className="mb-3" onClick={handleCrearClick}>
          Crear Reserva
        </Button>
      )}
      {/* Componente que muestra el listado de reservas */}
      <ListadoReservas />
    </div>
  );
}
