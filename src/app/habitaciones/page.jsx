/**
 * Página principal del módulo Habitaciones.
 * Muestra el listado de habitaciones y un botón para crear nuevas habitaciones
 * si el usuario tiene rol de admin.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ListadoHabitaciones from "@/modules/habitaciones/components/ListadoHabitaciones";
import { useAuth } from "@/context/AuthContext";
import { Button, Form, Row, Col } from "react-bootstrap";

const TIPOS_HABITACION = ["individual", "doble", "triple", "dormitorio"];

export default function PaginaHabitaciones() {
  // Hook para navegación programática
  const router = useRouter();
  // Contexto de autenticación para obtener usuario actual
  const { user } = useAuth();

  // Estados para filtro de fechas
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Nuevos estados para filtros de número y tipo de habitación
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Función para navegar a la página de creación de habitación
  const handleCrearClick = () => {
    router.push("/habitaciones/crear");
  };

  // Función para limpiar el filtro
  const limpiarFiltro = () => {
    setFechaInicio("");
    setFechaFin("");
    setFiltroNumero("");
    setFiltroTipo("");
  };

  // Asegurar que fechaFin sea igual a fechaInicio si está vacía o es menor
  const handleFechaInicioChange = (value) => {
    setFechaInicio(value);
    if (!fechaFin || value > fechaFin) {
      setFechaFin(value);
    }
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

      {/* Filtros de fecha para disponibilidad */}
      <Form className="mb-3">
        <Row className="align-items-end g-3">
          <Col md={2}>
            <Form.Group controlId="fechaInicio">
              <Form.Label>Entrada</Form.Label>
              <Form.Control
                type="date"
                value={fechaInicio}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
                max={fechaFin || undefined}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="fechaFin">
              <Form.Label>Salida</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || undefined}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="filtroNumero">
              <Form.Label>Nº de Habitación</Form.Label>
              <Form.Control
                type="text"
                placeholder="Buscar por número"
                value={filtroNumero}
                onChange={(e) => setFiltroNumero(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="filtroTipo">
              <Form.Label>Tipo de Habitación</Form.Label>
              <Form.Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                {TIPOS_HABITACION.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md="auto" className="d-flex gap-2">
            <Button variant="primary" onClick={() => {}}>
              Filtrar
            </Button>
            <Button variant="secondary" onClick={limpiarFiltro}>
              Limpiar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Componente que muestra el listado de habitaciones con filtro de fechas */}
      <ListadoHabitaciones
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        filtroNumero={filtroNumero}
        filtroTipo={filtroTipo}
      />
    </div>
  );
}
