// Componente Navbar con menú de navegación y control de sesión

"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

export default function BarraNavegacion() {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} href="/">
          Hospeda+
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} href="/habitaciones">
                  Habitaciones
                </Nav.Link>
                <Nav.Link as={Link} href="/reservas">
                  Reservas
                </Nav.Link>
                <Nav.Link as={Link} href="/facturas">
                  Facturas
                </Nav.Link>
                <Nav.Link as={Link} href="/huespedes">
                  Huéspedes
                </Nav.Link>
                {user.rol === "admin" && (
                  <Nav.Link as={Link} href="/usuarios">
                    Usuarios
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown title={user.nombre_usuario || user.email || "Usuario"} id="user-nav-dropdown" align="end">
                <NavDropdown.Item as={Link} href={`/usuarios/${user.sub}`}>
                  Modificar cuenta
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Cerrar sesión</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} href="/auth/login">
                Iniciar sesión
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
