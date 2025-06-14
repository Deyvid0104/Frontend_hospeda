/**
 * Componente ListadoUsuarios
 * Muestra una tabla con el listado de usuarios obtenidos desde el backend.
 * Permite eliminar usuarios y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { obtenerUsuarios, eliminarUsuario } from "../services/usuariosService";
import Cargando from "../../../components/Cargando";
import { Table, Alert } from "react-bootstrap";
import CustomButton from "../../../components/CustomButton";

export default function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga los usuarios desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarUsuarios = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      setError("Error al cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  // Carga los usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  /**
   * Maneja la eliminación de un usuario.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * @param {number} id - ID del usuario a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      setMensaje("Usuario eliminado correctamente");
      cargarUsuarios();
    } catch (err) {
      setError("Error al eliminar el usuario");
    }
  };

  if (cargando) return <Cargando />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {/* Vista de tabla para pantallas grandes */}
      <div className="d-none d-lg-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>{usuario.id_usuario}</td>
                <td>{usuario.nombre_usuario}</td>
                <td>
                  <span className={`badge bg-${
                    usuario.rol === 'admin' ? 'primary' : 
                    usuario.rol === 'recepcionista' ? 'info' : 'secondary'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td>
                  <CustomButton variant="info" size="sm" icon="view" href={`/usuarios/${usuario.id_usuario}`}>
                    Ver
                  </CustomButton>{" "}
                  <CustomButton variant="warning" size="sm" className="btn-edit" icon="edit" href={`/usuarios/${usuario.id_usuario}?modo=editar`}>
                    Editar
                  </CustomButton>{" "}
                  <CustomButton variant="danger" size="sm" icon="delete" onClick={() => manejarEliminar(usuario.id_usuario)}>
                    Eliminar
                  </CustomButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="d-lg-none">
        {usuarios.map((usuario) => (
          <div key={usuario.id_usuario} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="card-title mb-0 fw-bold text-primary">
                  {usuario.nombre_usuario}
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge bg-${
                    usuario.rol === 'admin' ? 'primary' : 
                    usuario.rol === 'recepcionista' ? 'info' : 'secondary'
                  }`}>
                    {usuario.rol}
                  </span>
                  <small className="text-muted">#{usuario.id_usuario}</small>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <CustomButton 
                  variant="info" 
                  size="sm" 
                  className="flex-fill"
                  icon="view"
                  href={`/usuarios/${usuario.id_usuario}`}
                >
                  Ver
                </CustomButton>
                
                <CustomButton 
                  variant="warning" 
                  size="sm" 
                  className="flex-fill"
                  icon="edit"
                  href={`/usuarios/${usuario.id_usuario}?modo=editar`}
                >
                  Editar
                </CustomButton>
                
                <CustomButton 
                  variant="danger" 
                  size="sm" 
                  className="w-100 mt-2"
                  icon="delete"
                  onClick={() => manejarEliminar(usuario.id_usuario)}
                >
                  Eliminar
                </CustomButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
