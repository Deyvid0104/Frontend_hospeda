"use client";

import React from "react";
import Image from 'next/image';
import { Row, Col, Container } from "react-bootstrap";

/**
 * Página principal de la aplicación Hospeda+.
 * Diseño responsive optimizado para móviles con fondo adaptativo y elementos interactivos.
 * @returns {JSX.Element} Componente de la página principal
 */
export default function HomePage() {
  return (
    <main role="main" aria-label="Página principal" className="home-page">
      <div className="home-background" aria-hidden="true"></div>
      <Container fluid className="h-100">
        <div className="content-wrapper">
          <Row className="w-100 mx-0 justify-content-center justify-content-lg-start">
            <Col xs={12} sm={12} md={8} lg={7} xl={6} className="mt-n5 desktop-offset">
              <div className="home-card">
                {/* Logo de la aplicación */}
                <div className="logo-container" role="img" aria-label="Logo de Hospeda+">
                  <Image
                    src="/logo.png"
                    alt="Hospeda+ Logo"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    sizes="(max-width: 768px) 150px, 240px"
                  />
                </div>

                {/* Título principal */}
                <h1 className="text-center mb-3 fw-bold">Bienvenido a Hospeda+</h1>

                {/* Descripción del sistema */}
                <p className="text-center mb-4 lh-base">
                  Sistema de gestión hotelera diseñado para optimizar y simplificar 
                  las operaciones diarias de tu establecimiento.
                </p>

                {/* Características principales */}
                <div className="features-section mt-4">
                  <Row className="g-4">
                    <Col xs={12} sm={6} className="d-flex">
                      <div className="feature-container text-center flex-fill p-3">
                        <div className="feature-icon mb-2 d-flex justify-content-center">
                          <Image
                            src="/globe.svg"
                            alt="Icono de gestión global"
                            width={40}
                            height={40}
                            className="d-block"
                          />
                        </div>
                        <p className="feature-text mb-0 small">
                          Gestión integral de reservas, habitaciones y huéspedes en una
                          sola plataforma.
                        </p>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} className="d-flex">
                      <div className="feature-container text-center flex-fill p-3">
                        <div className="feature-icon mb-2 d-flex justify-content-center">
                          <Image
                            src="/window.svg"
                            alt="Icono de interface intuitiva"
                            width={40}
                            height={40}
                            className="d-block"
                          />
                        </div>
                        <p className="feature-text mb-0 small">
                          Interface intuitiva y moderna para una experiencia de usuario
                          óptima en cualquier dispositivo.
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Instrucciones de uso */}
                <div className="instructions-section mt-4">
                  <p className="text-center mb-0 small">
                    Utiliza el menú de navegación para acceder a todas las funcionalidades
                    del sistema y comenzar a gestionar tu hotel de manera eficiente.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </main>
  );
}
