/**
 * Componente ListadoHabitaciones
 * Muestra una tabla con el listado de habitaciones obtenidas desde el backend.
 * Permite eliminar habitaciones y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerHabitaciones, eliminarHabitacion } from "../services/habitacionesService";
import Cargando from "../../../components/Cargando";
import { Table, Alert } from "react-bootstrap";
import CustomButton from "../../../components/CustomButton";

export default function ListadoHabitaciones({ fechaInicio, fechaFin }) {
  // Obtener usuario actual para control de acceso
  const { user } = useAuth();
  // Estado para lista de habitaciones
  const [habitaciones, setHabitaciones] = useState([]);
  // Estado para control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga las habitaciones desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarHabitaciones = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      // Importar función para obtener habitaciones disponibles y fechas de ocupación
      const { obtenerHabitacionesDisponibles, obtenerHabitaciones, obtenerFechasOcupacionPorHabitacion } = await import("../services/habitacionesService");
      const resHabitaciones = await obtenerHabitaciones();
      const habitacionesData = resHabitaciones.data;

      // Obtener fechas de ocupación por habitación
      const resFechasOcupacion = await obtenerFechasOcupacionPorHabitacion();
      const fechasOcupacionMap = new Map();
      resFechasOcupacion.data.forEach(item => {
        fechasOcupacionMap.set(item.id_habitacion, item.fechas_ocupacion);
      });

      // Usar fechas recibidas por props o fecha actual si no hay
      const fechaInicioConsulta = fechaInicio || new Date().toISOString().split('T')[0];
      const fechaFinConsulta = fechaFin || fechaInicioConsulta;

      // Consultar habitaciones disponibles para el rango de fechas
      const resDisponibles = await obtenerHabitacionesDisponibles(fechaInicioConsulta, fechaFinConsulta);
      const habitacionesDisponiblesIds = new Set(resDisponibles.data.map(h => h.id_habitacion));

      // Actualizar estado y fechas de ocupación de cada habitación
      const habitacionesConEstado = habitacionesData.map(hab => {
        return {
          ...hab,
          estado: habitacionesDisponiblesIds.has(hab.id_habitacion) ? 'libre' : 'ocupada',
          fechas_ocupacion: fechasOcupacionMap.get(hab.id_habitacion) || ''
        };
      });

      setHabitaciones(habitacionesConEstado);
    } catch (err) {
      setError("Error al cargar las habitaciones");
    } finally {
      setCargando(false);
    }
  };

  // Carga las habitaciones al montar el componente o cuando cambian las fechas
  React.useEffect(() => {
    cargarHabitaciones();
  }, [fechaInicio, fechaFin]);

  /**
   * Maneja la eliminación de una habitación.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * Solo disponible para admin.
   * @param {number} id - ID de la habitación a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!user || user.rol !== "admin") {
      setError("No tiene permisos para eliminar habitaciones");
      return;
    }
    if (!confirm("¿Está seguro de eliminar esta habitación?")) return;
    try {
      await eliminarHabitacion(id);
      setMensaje("Habitación eliminada correctamente");
      cargarHabitaciones();
    } catch (err) {
      setError("Error al eliminar la habitación");
    }
  };

  // Mostrar indicador de carga mientras se obtienen datos
  if (cargando) return <Cargando />;

  // Función para formatear fecha a DD/MM/YYYY
  function formatDate(dateString) {
    const fecha = new Date(dateString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Renderizar tabla con listado de habitaciones y acciones
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
              <th>Número</th>
              <th>Tipo</th>
              <th>Precio Base</th>
              <th>Estado</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Capacidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((hab) => {
              let fechaInicio = '';
              let fechaFin = '';
              if (hab.estado === 'ocupada' && hab.fechas_ocupacion) {
                const rangos = hab.fechas_ocupacion.split(',').map(r => r.trim());
                if (rangos.length > 0) {
                  const primerRango = rangos[0].split(' a ');
                  const ultimoRango = rangos[rangos.length - 1].split(' a ');
                  if (primerRango.length === 2) fechaInicio = formatDate(primerRango[0]);
                  if (ultimoRango.length === 2) fechaFin = formatDate(ultimoRango[1]);
                }
              }
              return (
                <tr key={hab.id_habitacion}>
                  <td>{hab.id_habitacion}</td>
                  <td>{hab.numero}</td>
                  <td>{hab.tipo}</td>
                  <td>€{hab.precio_base}</td>
                  <td>
                    <span className={`badge bg-${hab.estado === 'libre' ? 'success' : 'danger'}`}>
                      {hab.estado}
                    </span>
                  </td>
                  <td>{fechaInicio}</td>
                  <td>{fechaFin}</td>
                  <td>{hab.capacidad}</td>
                  <td>
                    <CustomButton variant="info" size="sm" icon="view" className="btn-view" href={`/habitaciones/${hab.id_habitacion}`}>
                      Ver
                    </CustomButton>{" "}
                    {user && user.rol === "admin" && (
                      <>
                        <CustomButton variant="warning" size="sm" className="btn-edit" icon="edit" href={`/habitaciones/${hab.id_habitacion}?modo=editar`}>
                          Editar
                        </CustomButton>{" "}
                        <CustomButton variant="danger" size="sm" icon="delete" onClick={() => manejarEliminar(hab.id_habitacion)}>
                          Eliminar
                        </CustomButton>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="d-lg-none">
        {habitaciones.map((hab) => {
          let fechaInicio = '';
          let fechaFin = '';
          if (hab.estado === 'ocupada' && hab.fechas_ocupacion) {
            const rangos = hab.fechas_ocupacion.split(',').map(r => r.trim());
            if (rangos.length > 0) {
              const primerRango = rangos[0].split(' a ');
              const ultimoRango = rangos[rangos.length - 1].split(' a ');
              if (primerRango.length === 2) fechaInicio = formatDate(primerRango[0]);
              if (ultimoRango.length === 2) fechaFin = formatDate(ultimoRango[1]);
            }
          }
          return (
            <div key={hab.id_habitacion} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="card-title mb-0 fw-bold text-primary">
                    Habitación {hab.numero}
                  </h6>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge bg-${hab.estado === 'libre' ? 'success' : 'danger'}`}>
                      {hab.estado}
                    </span>
                    <small className="text-muted">#{hab.id_habitacion}</small>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Tipo</small>
                    <div className="fw-semibold">{hab.tipo}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Capacidad</small>
                    <div className="fw-semibold">{hab.capacidad} personas</div>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Precio Base</small>
                  <div className="fw-bold text-success fs-5">€{hab.precio_base}</div>
                </div>

                {/* Agregado: mostrar fechas inicio y fin en versión móvil */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Inicio</small>
                    <div className="fw-semibold">{fechaInicio}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Fin</small>
                    <div className="fw-semibold">{fechaFin}</div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <CustomButton 
                    variant="info" 
                    size="sm" 
                    className="flex-fill"
                    icon="view"
                    href={`/habitaciones/${hab.id_habitacion}`}
                  >
                    Ver
                  </CustomButton>
                  
                  {user && user.rol === "admin" && (
                    <>
                      <CustomButton 
                        variant="warning" 
                        size="sm" 
                        className="flex-fill"
                        icon="edit"
                        href={`/habitaciones/${hab.id_habitacion}?modo=editar`}
                      >
                        Editar
                      </CustomButton>
                      
                      <CustomButton 
                        variant="danger" 
                        size="sm" 
                        className="w-100 mt-2"
                        icon="delete"
                        onClick={() => manejarEliminar(hab.id_habitacion)}
                      >
                        Eliminar
                      </CustomButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
