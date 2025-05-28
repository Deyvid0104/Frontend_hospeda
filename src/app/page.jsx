"use client";

import React from "react";
import Image from 'next/image';
import { Row, Col, Container } from "react-bootstrap";

/**
 * Página principal de la aplicación Hospeda+.
 * Diseño responsive con fondo adaptativo y elementos interactivos.
 * @returns {JSX.Element} Componente de la página principal
 */
export default function HomePage() {
  return (
    <main role="main" aria-label="Página principal">
      <div className="home-background" aria-hidden="true">
        <Container fluid>
          <div className="content-wrapper">
            <Row className="justify-content-center w-100">
              <Col xs={12} lg={10} xl={8}>
                <div className="home-card">
                  {/* Logo de la aplicación */}
                  <div className="logo-container" role="img" aria-label="Logo de Hospeda+">
                    <Image
                      src="/logo.png"
                      alt="Hospeda+ Logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>

                  {/* Título principal */}
                  <h1 className="text-center">Bienvenido a Hospeda+</h1>

                  {/* Descripción del sistema */}
                  <p className="text-center">
                    Sistema de gestión hotelera diseñado para optimizar y simplificar 
                    las operaciones diarias de tu establecimiento.
                  </p>

                  {/* Características principales */}
                  <div className="features-section mt-4">
                    <Row className="justify-content-center">
                      <Col xs={12} md={6} className="mb-4">
                        <div className="feature-container text-center">
                          <div className="feature-icon mb-3">
                            <Image
                              src="/globe.svg"
                              alt="Icono de gestión global"
                              width={50}
                              height={50}
                            />
                          </div>
                          <p className="feature-text">
                            Gestión integral de reservas, habitaciones y huéspedes en una
                            sola plataforma.
                          </p>
                        </div>
                      </Col>
                      <Col xs={12} md={6} className="mb-4">
                        <div className="feature-container text-center">
                          <div className="feature-icon mb-3">
                            <Image
                              src="/window.svg"
                              alt="Icono de interface intuitiva"
                              width={50}
                              height={50}
                            />
                          </div>
                          <p className="feature-text">
                            Interface intuitiva y moderna para una experiencia de usuario
                            óptima en cualquier dispositivo.
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Instrucciones de uso */}
                  <div className="instructions-section mt-4">
                    <p className="text-center" style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                      Utiliza el menú de navegación para acceder a todas las funcionalidades
                      del sistema y comenzar a gestionar tu hotel de manera eficiente.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </main>
  );
}
