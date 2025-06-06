"use client";

import React, { useRef } from "react";
import { Modal, Button, Table, Row, Col, Card, Image } from "react-bootstrap";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FaFilePdf, FaFileAlt } from 'react-icons/fa';

export default function ModalFactura({ show, onHide, factura }) {
  if (!factura) return null;

  const obtenerNumeroHabitacion = (detalle) => {
    if (detalle.habitacion && detalle.habitacion.numero) {
      return detalle.habitacion.numero;
    }
    if (detalle.id_habitacion) {
      return `ID Habitación: ${detalle.id_habitacion}`;
    }
    if (detalle.habitacion && detalle.habitacion.id_habitacion) {
      return `ID Habitación: ${detalle.habitacion.id_habitacion}`;
    }
    return "N/A";
  };

  // Función para generar texto de la factura para descarga
  const generarTextoFactura = () => {
    let texto = "FACTURA HOSPEDA+\n";
    texto += "==============================\n\n";
    texto += "FACTURA\n";
    texto += "ID Factura: " + factura.id_factura + "\n\n";
     texto += "==============================\n\n";
    texto += "Empresa: Hospeda+\n";
    texto += "CIF: 07117678Y\n";
    texto += "Dirección: Calle ancha #2 - Vera, Almería\n";
    texto += "==============================\n\n";
    
    // Información del huésped
    if (factura.reserva && factura.reserva.huesped) {
      const huesped = factura.reserva.huesped;
      texto += "INFORMACIÓN DEL HUÉSPED\n";
      texto += "------------------------------\n";
      texto += "Nombre: " + (huesped.nombre || "-") + " " + (huesped.apellidos || "") + "\n";
      texto += "CIF: " + (huesped.documento_identidad || "-") + "\n";
      texto += "Teléfono: " + (huesped.telefono || "-") + "\n";
      texto += "Email: " + (huesped.email || "-") + "\n\n";
    }

    // Información de la factura
    texto += "DETALLES DE LA FACTURA\n";
    texto += "------------------------------\n";
    texto += "Estado: " + (factura.estado || "pendiente") + "\n";
    texto += "Método de pago: " + factura.metodo_pago + "\n\n";

    // Detalles de servicios
    texto += "DETALLES DE SERVICIOS\n";
    texto += "------------------------------\n";
    
    // Agregar habitación si existe
    if (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) {
      const entrada = new Date(factura.reserva.fecha_entrada);
      const salida = new Date(factura.reserva.fecha_salida);
      const diffTime = Math.abs(salida - entrada);
      const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
      const detalle = factura.reserva.detalles_reserva[0];
      const habitacion = obtenerNumeroHabitacion(detalle);
      
      texto += `1. Habitación ${habitacion} - Días: ${dias} - Precio unitario: €${precio.toFixed(2)} - Subtotal: €${(dias * precio).toFixed(2)}\n`;
    }
    
    // Agregar servicios adicionales si existen
    if (factura.detalles_factura && factura.detalles_factura.length > 0) {
      factura.detalles_factura.forEach((detalle, index) => {
        const numeroItem = (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) ? index + 2 : index + 1;
        texto += `${numeroItem}. ${detalle.descripcion} - Cantidad: ${detalle.cantidad} - Precio unitario: €${detalle.precio_unitario.toFixed(2)} - Subtotal: €${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}\n`;
      });
    }
    
    // Si no hay habitación ni servicios
    if ((!factura.reserva || !factura.reserva.detalles_reserva || factura.reserva.detalles_reserva.length === 0) && 
        (!factura.detalles_factura || factura.detalles_factura.length === 0)) {
      texto += "No hay detalles disponibles.\n";
    }

    // Calcular y agregar subtotal
    let subtotal = 0;
    if (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) {
      const entrada = new Date(factura.reserva.fecha_entrada);
      const salida = new Date(factura.reserva.fecha_salida);
      const diffTime = Math.abs(salida - entrada);
      const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
      subtotal += dias * precio;
    }
    if (factura.detalles_factura && factura.detalles_factura.length > 0) {
      factura.detalles_factura.forEach(detalle => {
        subtotal += detalle.cantidad * detalle.precio_unitario;
      });
    }
    texto += "\n------------------------------\n";
    texto += `Subtotal: €${subtotal.toFixed(2)}\n`;

    // Agregar descuento si existe
    if (factura.descuento && factura.descuento > 0) {
      const descuentoMonto = (subtotal * factura.descuento) / 100;
      texto += `Descuento (${factura.descuento}%): -€${descuentoMonto.toFixed(2)}\n`;
    }

    // Agregar total
    let total = subtotal;
    if (factura.descuento && factura.descuento > 0) {
      const descuentoMonto = (subtotal * factura.descuento) / 100;
      total -= descuentoMonto;
    }
    texto += `TOTAL: ${total.toFixed(2)} €\n`;

    return texto;
  };

  // Función para descargar el archivo de texto
  const descargarFactura = () => {
    const texto = generarTextoFactura();
    const blob = new Blob([texto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `factura_${factura.id_factura}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="modal-factura-custom">
      <div id="modal-factura-content">
      <Modal.Header closeButton className="border-0 pb-2">
        <Modal.Title className="d-flex align-items-center gap-3">
          <Image 
            src="/icono_azul.png" 
            alt="Hospeda+" 
            width={50} 
            height={50} 
            className="rounded"
          />
          <div>
            <div className="fw-bold fs-4">Hospeda+</div>
            <div className="fs-6 text-muted">Factura #{factura.id_factura}</div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <Row className="mb-4">
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-3 border-bottom pb-2 fw-semibold fs-5">Información de la Empresa</Card.Title>
                <p className="mb-2"><strong>Empresa:</strong> Hospeda+</p>
                <p className="mb-2"><strong>CIF:</strong> 07117678Y</p>
                <p className="mb-2"><strong>Teléfono:</strong> 615325325</p>
                <p className="mb-2"><strong>Dirección:</strong> Calle ancha #2 - Vera, Almería</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-3 border-bottom pb-2 fw-semibold fs-5">Información del Huésped</Card.Title>
                {factura.reserva && factura.reserva.huesped ? (
                  <>
                    <p className="mb-2"><strong>Nombre:</strong> {factura.reserva.huesped.nombre} {factura.reserva.huesped.apellidos}</p>
                    <p className="mb-2"><strong>CIF:</strong> {factura.reserva.huesped.documento_identidad}</p>
                    <p className="mb-2"><strong>Teléfono:</strong> {factura.reserva.huesped.telefono || "-"}</p>
                    <p className="mb-2"><strong>Email:</strong> {factura.reserva.huesped.email || "-"}</p>
                  </>
                ) : (
                  <p>No hay información del huésped disponible</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={6}>
            <Card className="p-3 h-100 shadow-sm border-0">
              <p className="mb-0 fw-semibold">Método de pago:</p>
              <p className="mb-0 text-capitalize">{factura.metodo_pago}</p>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="p-3 h-100 shadow-sm border-0">
              <p className="mb-0 fw-semibold">Estado:</p>
              <p className="mb-0 text-capitalize">{factura.estado || "pendiente"}</p>
            </Card>
          </Col>
        </Row>        
        <Card className="shadow-sm border-0 mt-4">
          <Card.Body>
            <Card.Title className="mb-3 fw-semibold fs-5 border-bottom pb-2">Detalles de los Servicios</Card.Title>
            <Table striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descripción</th>
                  <th>Días</th>
                  <th>Precio (€)</th>
                  <th>Subtotal (€)</th>
                </tr>
              </thead>
              <tbody>
                {/* Mostrar habitación por días de estancia */}
                {factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0 && (
                  <tr>
                    <td>1</td>
                    <td>
                      Habitación {obtenerNumeroHabitacion(factura.reserva.detalles_reserva[0])} 
                    </td>
                    <td>
                      {factura.reserva ? (() => {
                        const entrada = new Date(factura.reserva.fecha_entrada);
                        const salida = new Date(factura.reserva.fecha_salida);
                        const diffTime = Math.abs(salida - entrada);
                        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      })() : 0}
                    </td>
                    <td>{factura.reserva.detalles_reserva[0].precio_aplicado || "0.00"}</td>
                    <td>
                      {factura.reserva ? (() => {
                        const entrada = new Date(factura.reserva.fecha_entrada);
                        const salida = new Date(factura.reserva.fecha_salida);
                        const diffTime = Math.abs(salida - entrada);
                        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
                        return (dias * precio).toFixed(2);
                      })() : "0.00"}
                    </td>
                  </tr>
                )}
                
                {/* Mostrar servicios adicionales si existen */} 
                {factura.detalles_factura && factura.detalles_factura.length > 0 && 
                  factura.detalles_factura.map((detalle, index) => (
                    <tr key={detalle.id_detalle_factura || index}>
                      <td>{index + 2}</td>
                      <td>{detalle.descripcion}</td>
                      <td>{detalle.cantidad}</td>
                      <td>{detalle.precio_unitario.toFixed(2)}</td>
                      <td>{(detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
                    </tr>
                  ))
                }
              </tbody>
              <tfoot>
                {factura.descuento && factura.descuento > 0 && (
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Descuento ({factura.descuento}%):</strong></td>
                    <td><strong>-€{(() => {
                      let subtotal = 0;
                      
                      // Calcular subtotal
                      if (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) {
                        const entrada = new Date(factura.reserva.fecha_entrada);
                        const salida = new Date(factura.reserva.fecha_salida);
                        const diffTime = Math.abs(salida - entrada);
                        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
                        subtotal += dias * precio;
                      }
                      
                      if (factura.detalles_factura && factura.detalles_factura.length > 0) {
                        factura.detalles_factura.forEach(detalle => {
                          subtotal += detalle.cantidad * detalle.precio_unitario;
                        });
                      }
                      
                      const descuentoMonto = (subtotal * factura.descuento) / 100;
                      return descuentoMonto.toFixed(2);
                    })()}</strong></td>
                  </tr>
                )}
                <tr className="table-active">
                  <td colSpan="4" className="text-end"><strong>TOTAL:</strong></td>
                  <td><strong>€{(() => {
                    let subtotal = 0;
                    
                    // Calcular subtotal
                    if (factura.reserva && factura.reserva.detalles_reserva && factura.reserva.detalles_reserva.length > 0) {
                      const entrada = new Date(factura.reserva.fecha_entrada);
                      const salida = new Date(factura.reserva.fecha_salida);
                      const diffTime = Math.abs(salida - entrada);
                      const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const precio = parseFloat(factura.reserva.detalles_reserva[0].precio_aplicado || 0);
                      subtotal += dias * precio;
                    }
                    
                    if (factura.detalles_factura && factura.detalles_factura.length > 0) {
                      factura.detalles_factura.forEach(detalle => {
                        subtotal += detalle.cantidad * detalle.precio_unitario;
                      });
                    }
                    
                    // Aplicar descuento si existe
                    if (factura.descuento && factura.descuento > 0) {
                      const descuento = (subtotal * factura.descuento) / 100;
                      subtotal -= descuento;
                    }
                    
                    return subtotal.toFixed(2);
                  })()}</strong></td>
                </tr>
              </tfoot>
            </Table>
          </Card.Body>
        </Card>
      </Modal.Body>
      </div>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={descargarFactura}
            className="d-flex align-items-center gap-2"
          >
            <FaFileAlt />
            <span>TXT</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={async () => {
          const content = document.getElementById('modal-factura-content');
          if (!content) return;

          try {
            const canvas = await html2canvas(content, {
              scale: 2,
              useCORS: true,
              logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`factura_${factura.id_factura}.pdf`);
          } catch (error) {
            console.error('Error al generar el PDF:', error);
          }
        }}
            className="d-flex align-items-center gap-2"
          >
            <FaFilePdf />
            <span>PDF</span>
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
