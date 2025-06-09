/**
 * Componente ListadoHuespedes
 * Muestra una tabla con el listado de huéspedes obtenidos desde el backend.
 * Permite eliminar huéspedes y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerHuespedes, eliminarHuesped } from "../services/huespedesService";
import Cargando from "../../../components/Cargando";
import { Table, Alert, Form, Row, Col } from "react-bootstrap";
import CustomButton from "../../../components/CustomButton";

export default function ListadoHuespedes() {
  const { user } = useAuth();
  const [huespedes, setHuespedes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState("");

  const cargarHuespedes = async (filtros = {}) => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerHuespedes(filtros);
      setHuespedes(res.data);
    } catch (err) {
      setError("Error al cargar los huéspedes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHuespedes();
  }, []);

  const manejarEliminar = async (id) => {
    if (!user || (user.rol !== "admin")) {
      setError("No tiene permisos para eliminar huéspedes");
      return;
    }
    if (!confirm("¿Está seguro de eliminar este huésped?")) return;
    try {
      await eliminarHuesped(id);
      setMensaje("Huésped eliminado correctamente");
      cargarHuespedes();
    } catch (err) {
      setError("Error al eliminar el huésped");
    }
  };

  const manejarFiltrar = () => {
    cargarHuespedes({
      nombre: filtroNombre,
      email: filtroEmail,
      telefono: filtroTelefono,
    });
  };

  const manejarLimpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEmail("");
    setFiltroTelefono("");
    cargarHuespedes();
  };

  if (cargando) return <Cargando />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      {/* Formulario de filtros */}
      <Form className="mb-3" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          manejarFiltrar();
        }
      }}>
        <Row>
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Filtrar por nombre"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </Col>
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="email"
              placeholder="Filtrar por email"
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
            />
          </Col>
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Filtrar por teléfono"
              value={filtroTelefono}
              onChange={(e) => setFiltroTelefono(e.target.value)}
            />
          </Col>
          <Col md={3} sm={6} className="mb-2 d-flex gap-2">
            <CustomButton variant="primary" onClick={manejarFiltrar}>
              Filtrar
            </CustomButton>
            <CustomButton variant="secondary" onClick={manejarLimpiarFiltros}>
              Limpiar
            </CustomButton>
          </Col>
        </Row>
      </Form>

      {/* Vista de tabla para pantallas grandes */}
      <div className="d-none d-lg-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {huespedes.map((huesped) => (
              <tr key={huesped.id_huesped}>
                <td>{huesped.id_huesped}</td>
                <td>{huesped.nombre}</td>
                <td>{huesped.apellidos}</td>
                <td>{huesped.email}</td>
                <td>{huesped.telefono}</td>
                <td>
                  <CustomButton variant="info" size="sm" icon="view" href={`/huespedes/${huesped.id_huesped}`}>
                    Ver
                  </CustomButton>{" "}
                  {(user && (user.rol === "admin" || user.rol === "recepcionista")) && (
                    <>
                      <CustomButton variant="warning" size="sm" icon="edit" href={`/huespedes/${huesped.id_huesped}?modo=editar`}>
                        Editar
                      </CustomButton>{" "}
                      <CustomButton 
                        variant="success" 
                        size="sm" 
                        href={`/reservas/crear?huespedId=${huesped.id_huesped}`}
                      >
                        Crear Reserva
                      </CustomButton>
                    </>
                  )}{" "}
                  {user && user.rol === "admin" && (
                    <CustomButton variant="danger" size="sm" icon="delete" onClick={() => manejarEliminar(huesped.id_huesped)}>
                      Eliminar
                    </CustomButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="d-lg-none">
        {huespedes.map((huesped) => (
          <div key={huesped.id_huesped} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="card-title mb-0 fw-bold text-primary">
                  {huesped.nombre} {huesped.apellidos}
                </h6>
                <small className="text-muted">#{huesped.id_huesped}</small>
              </div>

              <div className="mb-3">
                <div className="row g-2">
                  <div className="col-12">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-semibold small">
                      <a href={`mailto:${huesped.email}`} className="text-decoration-none">
                        {huesped.email}
                      </a>
                    </div>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Teléfono</small>
                    <div className="fw-semibold small">
                      <a href={`tel:${huesped.telefono}`} className="text-decoration-none">
                        {huesped.telefono}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <CustomButton 
                  variant="info" 
                  size="sm" 
                  className="flex-fill"
                  icon="view"
                  href={`/huespedes/${huesped.id_huesped}`}
                >
                  Ver
                </CustomButton>
                
                {(user && (user.rol === "admin" || user.rol === "recepcionista")) && (
                  <>
                    <CustomButton 
                      variant="warning" 
                      size="sm" 
                      className="flex-fill"
                      icon="edit"
                      href={`/huespedes/${huesped.id_huesped}?modo=editar`}
                    >
                      Editar
                    </CustomButton>
                    
                    <CustomButton 
                      variant="success" 
                      size="sm" 
                      className="flex-fill"
                      href={`/reservas/crear?huespedId=${huesped.id_huesped}`}
                    >
                      Crear Reserva
                    </CustomButton>
                  </>
                )}
                
                {user && user.rol === "admin" && (
                  <CustomButton 
                    variant="danger" 
                    size="sm" 
                    className="w-100 mt-2"
                    icon="delete"
                    onClick={() => manejarEliminar(huesped.id_huesped)}
                  >
                    Eliminar
                  </CustomButton>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
