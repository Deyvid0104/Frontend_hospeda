/**
 * Página principal del módulo Habitaciones.
 * Muestra el listado de habitaciones y un botón para crear nuevas habitaciones
 * si el usuario tiene rol de admin.
 */

// "use client" habilita el modo cliente para este componente
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ListadoHabitaciones from "../../modules/habitaciones/components/ListadoHabitaciones";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

export default function PaginaHabitaciones() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Función para navegar a la página de creación de habitación
  const handleCrearClick = () => {
    router.push("/habitaciones/crear");
  };

  return (
    <div className="mt-4">
      <h1>Habitaciones</h1>
      {/* Mostrar botón crear solo para rol admin */}
      {user && user.rol === "admin" && (
        <Button variant="primary" className="mb-3" onClick={handleCrearClick}>
          Crear Habitación
        </Button>
      )}
      {/* Componente que muestra el listado de habitaciones */}
      <ListadoHabitaciones />
    </div>
  );
}
