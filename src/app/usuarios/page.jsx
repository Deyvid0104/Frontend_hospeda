
/**
 * Página principal del módulo Usuarios.
 * Muestra el listado de usuarios y un botón para crear nuevos usuarios
 * si el usuario tiene rol de admin.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ListadoUsuarios from "../../modules/usuarios/components/ListadoUsuarios";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

export default function PaginaUsuarios() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Función para navegar a la página de creación de usuario
  const handleCrearClick = () => {
    router.push("/usuarios/crear");
  };

  return (
    <div className="mt-4">
      <h1>Usuarios</h1>
      {/* Mostrar botón crear solo para rol admin */}
      {user && user.rol === "admin" && (
        <Button variant="primary" className="mb-3" onClick={handleCrearClick}>
          Crear Usuario
        </Button>
      )}
      {/* Componente que muestra el listado de usuarios */}
      <ListadoUsuarios />
    </div>
  );
}
