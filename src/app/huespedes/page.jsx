/**
 * Página principal del módulo Huéspedes.
 * Muestra el listado de huéspedes y un botón para crear nuevos huéspedes
 * si el usuario tiene rol de admin o recepcionista.
 */

// "use client" habilita el modo cliente para este componente
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ListadoHuespedes from "../../modules/huespedes/components/ListadoHuespedes";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

export default function PaginaHuespedes() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Función para navegar a la página de creación de huésped
  const handleCrearClick = () => {
    router.push("/huespedes/crear");
  };

  return (
    <div className="mt-4">
      <h1>Huéspedes</h1>
      {/* Mostrar botón crear solo para roles admin o recepcionista */}
      {user && (user.rol === "admin" || user.rol === "recepcionista") && (
        <Button variant="primary" className="mb-3" onClick={handleCrearClick}>
          Crear Huésped
        </Button>
      )}
      {/* Componente que muestra el listado de huéspedes */}
      <ListadoHuespedes />
    </div>
  );
}
