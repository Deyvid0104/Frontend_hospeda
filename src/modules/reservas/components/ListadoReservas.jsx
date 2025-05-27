/**
 * Componente ListadoReservas
 * Muestra una tabla con el listado de reservas obtenidas desde el backend.
 * Permite eliminar reservas y navegar a la vista de edición.
 */

"use client";

import React, { useEffect, useState } from "react";
import { obtenerReservas, eliminarReserva } from "../services/reservasService";
import Carga from "../../../components/Cargando";
import { Table, Button, Alert } from "react-bootstrap";

export default function ListadoReservas() {
  // Estado para lista de reservas
  const [reservas, setReservas] = useState([]);
  // Estado para control de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  /**
   * Carga las reservas desde el backend y actualiza el estado.
   * Maneja errores y estado de carga.
   */
  const cargarReservas = async () => {
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      const res = await obtenerReservas();
      console.log('Datos de reservas recibidos:', res.data);
      setReservas(res.data);
    } catch (err) {
      setError("Error al cargar las reservas");
    } finally {
      setCargando(false);
    }
  };

  // Carga las reservas al montar el componente
  useEffect(() => {
    cargarReservas();
  }, []);

  /**
   * Maneja la eliminación de una reserva.
   * Solicita confirmación al usuario antes de eliminar.
   * Actualiza el estado con mensajes de éxito o error.
   * @param {number} id - ID de la reserva a eliminar
   */
  const manejarEliminar = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta reserva?")) return;
    try {
      await eliminarReserva(id);
      setMensaje("Reserva eliminada correctamente");
      cargarReservas();
    } catch (err) {
      setError("Error al eliminar la reserva");
    }
  };

  // Mostrar indicador de carga mientras se obtienen datos
  if (cargando) return <Carga />;

  // Función para mostrar habitaciones concatenadas de detalles_reserva
  const mostrarHabitaciones = (detalles) => {
    if (!detalles || detalles.length === 0) return "N/A";
    return detalles.map(d => d.id_habitacion).join(", ");
  };

  // Renderizar tabla con listado de reservas y acciones
  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha entrada</th>
            <th>Fecha salida</th>
            <th>ID Huésped</th>
            <th>ID Habitación(es)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id_reserva}>
              <td>{reserva.id_reserva}</td>
              <td>{new Date(reserva.fecha_entrada).toLocaleDateString()}</td>
              <td>{new Date(reserva.fecha_salida).toLocaleDateString()}</td>
              <td>{reserva.id_huesped}</td>
              <td>{mostrarHabitaciones(reserva.detalles_reserva)}</td>
              <td>
                <Button variant="warning" size="sm" href={`/reservas/${reserva.id_reserva}`}>
                  Ver / Editar
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => manejarEliminar(reserva.id_reserva)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}


// /**
//  * Componente ListadoReservas
//  * Muestra una tabla con el listado de reservas obtenidas desde el backend.
//  * Permite eliminar reservas y navegar a la vista de edición.
//  */

// "use client";

// import React, { useEffect, useState } from "react";
// import { obtenerReservas, eliminarReserva } from "../services/reservasService";
// import Carga from "../../../components/Cargando";
// import { Table, Button, Alert } from "react-bootstrap";

// export default function ListadoReservas() {
//   // Estado para lista de reservas
//   const [reservas, setReservas] = useState([]);
//   // Estado para control de carga y mensajes
//   const [cargando, setCargando] = useState(true);
//   const [error, setError] = useState("");
//   const [mensaje, setMensaje] = useState("");

//   /**
//    * Carga las reservas desde el backend y actualiza el estado.
//    * Maneja errores y estado de carga.
//    */
//   const cargarReservas = async () => {
//     setError("");
//     setMensaje("");
//     setCargando(true);
//     try {
//       const res = await obtenerReservas();
//       setReservas(res.data);
//     } catch (err) {
//       setError("Error al cargar las reservas");
//     } finally {
//       setCargando(false);
//     }
//   };

//   // Carga las reservas al montar el componente
//   useEffect(() => {
//     cargarReservas();
//   }, []);

//   /**
//    * Maneja la eliminación de una reserva.
//    * Solicita confirmación al usuario antes de eliminar.
//    * Actualiza el estado con mensajes de éxito o error.
//    * @param {number} id - ID de la reserva a eliminar
//    */
//   const manejarEliminar = async (id) => {
//     if (!confirm("¿Está seguro de eliminar esta reserva?")) return;
//     try {
//       await eliminarReserva(id);
//       setMensaje("Reserva eliminada correctamente");
//       cargarReservas();
//     } catch (err) {
//       setError("Error al eliminar la reserva");
//     }
//   };

//   // Mostrar indicador de carga mientras se obtienen datos
//   if (cargando) return <Carga />;

//   // Renderizar tabla con listado de reservas y acciones
//   return (
//     <>
//       {error && <Alert variant="danger">{error}</Alert>}
//       {mensaje && <Alert variant="success">{mensaje}</Alert>}
//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Fecha inicio</th>
//             <th>Fecha fin</th>
//             <th>ID Huésped</th>
//             <th>ID Habitación</th>
//             <th>Acciones</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reservas.map((reserva) => (
//             <tr key={reserva.id_reserva}>
//               <td>{reserva.id_reserva}</td>
//               <td>{reserva.fecha_inicio}</td>
//               <td>{reserva.fecha_fin}</td>
//               <td>{reserva.id_huesped}</td>
//               <td>{reserva.id_habitacion}</td>
//               <td>
//                 <Button variant="warning" size="sm" href={`/reservas/${reserva.id_reserva}`}>
//                   Ver / Editar
//                 </Button>{" "}
//                 <Button variant="danger" size="sm" onClick={() => manejarEliminar(reserva.id_reserva)}>
//                   Eliminar
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </>
//   );
// }
