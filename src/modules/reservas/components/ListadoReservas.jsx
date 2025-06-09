/**
 * Componente ListadoReservas
 * Muestra una tabla con el listado de reservas obtenidas desde el backend.
 * Permite eliminar reservas y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { obtenerReservas, eliminarReserva } from "../services/reservasService";
import { obtenerFacturaPorReserva } from "../../facturas/services/facturasService";
import Cargando from "../../../components/Cargando";
import CustomButton from "../../../components/CustomButton";
import { Table, Alert, Badge, Form, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ListadoReservas() {
  const router = useRouter();
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [facturasMap, setFacturasMap] = useState({}); // id_reserva -> id_factura
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtros, setFiltros] = useState({
    fecha_entrada: "",
    fecha_salida: "",
    nombre_huesped: "",
  });

  // Debounce para el filtro de nombre
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const [debouncedNombre, setDebouncedNombre] = useState(nombreBusqueda);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNombre(nombreBusqueda);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [nombreBusqueda]);

  // El filtro de nombre solo se actualiza al presionar Enter, no con debounce automático
  // Por lo tanto, eliminamos el efecto que actualiza filtros con debounce
  // React.useEffect(() => {
  //   setFiltros((prev) => ({ ...prev, nombre_huesped: debouncedNombre }));
  // }, [debouncedNombre]);

  const cargarDatos = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      // Para evitar recarga en cada tecla, se usa debounce en nombreBusqueda y se pasa a filtros
      // Pero el input de texto estaba usando filtros.nombre_huesped directamente, lo corregimos
      const resReservas = await obtenerReservas(filtros);
      const reservasData = resReservas.data;

      console.log("Datos de reservas recibidos:", reservasData);

      const reservasValidas = reservasData.filter(reserva => {
        const valido = Number.isInteger(reserva.id_reserva) && reserva.id_reserva > 0;
        if (!valido) {
          console.warn(`ID de reserva inválido filtrado: ${reserva.id_reserva}`, reserva);
        }
        return valido;
      });

      const reservasOrdenadas = reservasValidas.sort((a, b) => 
        new Date(b.fecha_entrada) - new Date(a.fecha_entrada)
      );

      if (reservasOrdenadas.length === 0) {
        setError("No hay reservas para mostrar");
      } else {
        setReservas(reservasOrdenadas);
      }

      // Obtener facturas asociadas a reservas
      const facturasMapTemp = {};
      await Promise.all(reservasOrdenadas.map(async (reserva) => {
        try {
          const resFactura = await obtenerFacturaPorReserva(reserva.id_reserva);
          if (resFactura.data && resFactura.data.id_factura) {
            facturasMapTemp[reserva.id_reserva] = resFactura.data.id_factura;
          }
        } catch (error) {
          // No hay factura para esta reserva o error, ignorar
        }
      }));
      setFacturasMap(facturasMapTemp);

    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "No se pudieron cargar las reservas. Por favor, intente nuevamente más tarde.");
    } finally {
      setCargando(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const manejarEliminar = async (id) => {
    if (!user || (user.rol !== "admin" && user.rol !== "recepcionista")) {
      setError("No tiene permisos para eliminar reservas");
      return;
    }
    if (!confirm("¿Está seguro de eliminar esta reserva?")) return;
    try {
      await eliminarReserva(id);
      setMensaje("Reserva eliminada correctamente");
      cargarDatos(); // Recargar todos los datos después de eliminar
    } catch (err) {
      setError("Error al eliminar la reserva");
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'secondary';
    }
  };

  const mostrarHabitaciones = (detalles) => {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return "Sin asignar";
    }
    
    // Mostrar habitacion.numero si existe, sino id_habitacion con prefijo #
    const habitaciones = detalles
      .map(d => {
        if (d.habitacion && d.habitacion.numero) {
          return d.habitacion.numero;
        }
        if (d.id_habitacion) {
          return `ID Habitación: ${d.id_habitacion}`;
        }
        if (d.habitacion && d.habitacion.id_habitacion) {
          return `ID Habitación: ${d.habitacion.id_habitacion}`;
        }
        return null;
      })
      .filter(id => id !== null);

    return habitaciones.length > 0 ? habitaciones.join(", ") : "Sin asignar";
  };

  if (cargando) return <Cargando />;

  return (
    <>
      <Form className="mb-3" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setFiltros((prev) => ({ ...prev, nombre_huesped: nombreBusqueda }));
        }
      }}>
        <Row>
          <Col md={3}>
            <Form.Group controlId="fechaEntrada">
              <Form.Label>Fecha Entrada</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fecha_entrada}
                onChange={(e) => setFiltros({ ...filtros, fecha_entrada: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="fechaSalida">
              <Form.Label>Fecha Salida</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fecha_salida}
                onChange={(e) => setFiltros({ ...filtros, fecha_salida: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="nombreHuesped">
              <Form.Label>Nombre Huésped</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o apellidos"
                  value={nombreBusqueda}
                  onChange={(e) => setNombreBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFiltros((prev) => ({ ...prev, nombre_huesped: nombreBusqueda }));
                    }
                  }}
                />
                <CustomButton variant="primary" className="ms-2" onClick={() => {
                    setFiltros((prev) => ({ ...prev, nombre_huesped: nombreBusqueda }));
                  }}
                >
                  Filtrar
                </CustomButton>
                <CustomButton
                  variant="secondary" className="ms-2" onClick={() => {
                    setNombreBusqueda(""); setFiltros({
                      fecha_entrada: "", fecha_salida: "", nombre_huesped: "",
                    });
                  }}
                >
                  Limpiar
                </CustomButton>
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {/* Vista de tabla para pantallas grandes */}
      <div className="d-none d-lg-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha entrada</th>
              <th>Fecha salida</th>
              <th>Estado</th>
              <th>Nombre Huésped</th>
              <th>Habitación</th>
              <th>Duración</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => {
              const fechaEntrada = new Date(reserva.fecha_entrada);
              const fechaSalida = new Date(reserva.fecha_salida);
              const duracion = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
              
              return (
                <tr key={reserva.id_reserva}>
                  <td>{reserva.id_reserva}</td>
                  <td>{fechaEntrada.toLocaleDateString()}</td>
                  <td>{fechaSalida.toLocaleDateString()}</td>
                  <td>
                    <Badge bg={obtenerColorEstado(reserva.estado)}>
                      {reserva.estado || 'N/A'}
                    </Badge>
                  </td>
                  <td>{reserva.huesped?.nombre ?? ''} {reserva.huesped?.apellidos ?? ''}</td>
                  <td>{mostrarHabitaciones(reserva.detalles_reserva)}</td>
                  <td>{duracion} {duracion === 1 ? 'día' : 'días'}</td>
                  <td>
                    <CustomButton variant="info" size="sm" onClick={() => router.push(`/reservas/${reserva.id_reserva}`)}>
                      Ver
                    </CustomButton>{" "}
                    {user && (user.rol === "admin" || user.rol === "recepcionista") && (
                      <>
                    <CustomButton variant="warning" size="sm" onClick={() => router.push(`/reservas/${reserva.id_reserva}?modo=editar`)}>
                      Editar
                    </CustomButton>{" "}
                    {facturasMap[reserva.id_reserva] ? (
                      <CustomButton variant="primary" size="sm" onClick={() => {
                        router.push(`/facturas/${facturasMap[reserva.id_reserva]}`);
                      }}>
                        Imprimir
                      </CustomButton>
                    ) : (
                      <CustomButton variant="success" size="sm" onClick={() => {
                        const fechaSalida = new Date(reserva.fecha_salida).toISOString().split('T')[0];
                        const fechaEntrada = new Date(reserva.fecha_entrada);
                        const fechaFin = new Date(reserva.fecha_salida);
                        const diasEstancia = Math.ceil((fechaFin - fechaEntrada) / (1000 * 60 * 60 * 24));
                        let monto = 0;
                        if (reserva.detalles_reserva && reserva.detalles_reserva.length > 0) {
                          reserva.detalles_reserva.forEach(detalle => {
                            const precio = detalle.precio_aplicado || 0;
                            const noches = detalle.noches || diasEstancia;
                            monto += precio * noches;
                          });
                        }
                        router.push(`/facturas/crear?fecha=${fechaSalida}&id_reserva=${reserva.id_reserva}&monto=${monto}`);
                      }}>
                        Facturar
                      </CustomButton>
                    )}
                    <CustomButton variant="danger" size="sm" onClick={() => manejarEliminar(reserva.id_reserva)}>
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
        {reservas.map((reserva) => {
          const fechaEntrada = new Date(reserva.fecha_entrada);
          const fechaSalida = new Date(reserva.fecha_salida);
          const duracion = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={reserva.id_reserva} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="card-title mb-0 fw-bold text-primary">
                    Reserva #{reserva.id_reserva}
                  </h6>
                  <Badge bg={obtenerColorEstado(reserva.estado)} className="ms-2">
                    {reserva.estado || 'N/A'}
                  </Badge>
                </div>
                
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Huésped</small>
                    <div className="fw-semibold">
                      {reserva.huesped?.nombre ?? ''} {reserva.huesped?.apellidos ?? ''}
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Habitación</small>
                    <div className="fw-semibold">
                      {mostrarHabitaciones(reserva.detalles_reserva)}
                    </div>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <small className="text-muted d-block">Entrada</small>
                    <div className="small fw-semibold">
                      {fechaEntrada.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Salida</small>
                    <div className="small fw-semibold">
                      {fechaSalida.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Duración</small>
                    <div className="small fw-semibold">
                      {duracion} {duracion === 1 ? 'día' : 'días'}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <CustomButton 
                    variant="info" 
                    size="sm" 
                    className="flex-fill"
                    onClick={() => router.push(`/reservas/${reserva.id_reserva}`)}
                  >
                    Ver
                  </CustomButton>
                  
                  {user && (user.rol === "admin" || user.rol === "recepcionista") && (
                    <>
                      <CustomButton 
                        variant="warning" 
                        size="sm" 
                        className="flex-fill"
                        onClick={() => router.push(`/reservas/${reserva.id_reserva}?modo=editar`)}
                      >
                        Editar
                      </CustomButton>
                      
                      {facturasMap[reserva.id_reserva] ? (
                        <CustomButton
                          variant="primary"
                          size="sm"
                          className="flex-fill"
                          onClick={() => router.push(`/facturas/${facturasMap[reserva.id_reserva]}`)}
                        >
                          Imprimir
                        </CustomButton>
                      ) : (
                        <CustomButton 
                          variant="success" 
                          size="sm" 
                          className="flex-fill"
                          onClick={() => {
                            const fechaSalida = new Date(reserva.fecha_salida).toISOString().split('T')[0];
                            const fechaEntrada = new Date(reserva.fecha_entrada);
                            const fechaFin = new Date(reserva.fecha_salida);
                            const diasEstancia = Math.ceil((fechaFin - fechaEntrada) / (1000 * 60 * 60 * 24));
                            let monto = 0;
                            if (reserva.detalles_reserva && reserva.detalles_reserva.length > 0) {
                              reserva.detalles_reserva.forEach(detalle => {
                                const precio = detalle.precio_aplicado || 0;
                                const noches = detalle.noches || diasEstancia;
                                monto += precio * noches;
                              });
                            }
                            router.push(`/facturas/crear?fecha=${fechaSalida}&id_reserva=${reserva.id_reserva}&monto=${monto}`);
                          }}
                        >
                          Facturar
                        </CustomButton>
                      )}
                      
                      <CustomButton 
                        variant="danger" 
                        size="sm" 
                        className="w-100 mt-2"
                        onClick={() => manejarEliminar(reserva.id_reserva)}
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
