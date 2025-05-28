/**
 * Página principal del módulo Usuarios.
 * Solo accesible por usuarios con rol de admin.
 * Muestra el listado de usuarios y un botón para crear nuevos usuarios.
 */

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ListadoUsuarios from "../../modules/usuarios/components/ListadoUsuarios";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";

export default function PaginaUsuarios() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user, loading } = useAuth();

  // Control de acceso: solo admin puede acceder
  useEffect(() => {
    if (!loading) {
      if (!user || user.rol !== "admin") {
        router.push("/");
      }
    }
  }, [loading, user]);

  // Si está cargando o no es admin, no mostrar nada
  if (loading || !user || user.rol !== "admin") {
    return null;
  }

  // Función para navegar a la página de creación de usuario
  const handleCrearClick = () => {
    router.push("/usuarios/crear");
  };

  return (
    <div className="mt-4">
      <h1>Usuarios</h1>
      <Button variant="primary" className="mb-3" onClick={handleCrearClick}>
        Crear Usuario
      </Button>
      <ListadoUsuarios />
    </div>
  );
}
