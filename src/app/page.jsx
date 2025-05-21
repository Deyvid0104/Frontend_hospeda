"use client";

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

/**
 * Página principal de la aplicación Hospeda+.
 * Muestra una bienvenida y descripción general del sistema de gestión hotelera.
 * Utiliza componentes de react-bootstrap para el diseño responsivo y estilizado.
 */
export default function HomePage() {
  return (
    <div className="home-background">
      <Container>
        <Row className="justify-content-md-center">
          <Col md={8}>
            <Card bg="transparent" border="light" text="black">
              <Card.Body>
                <Card.Title>Bienvenido a Hospeda+</Card.Title>
                <Card.Text>
                  Hospeda+ es un sistema de gestión hotelera que permite administrar usuarios, habitaciones, reservas, facturas y huéspedes de manera eficiente y sencilla.
                </Card.Text>
                <Card.Text>
                  Este proyecto está diseñado para facilitar el trabajo del personal administrativo y de recepción, ofreciendo una interfaz intuitiva y funcionalidades completas para la gestión diaria del hotel.
                </Card.Text>
                <Card.Text>
                  Use el menú de navegación para acceder a las diferentes secciones del sistema y comenzar a gestionar su hotel.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
