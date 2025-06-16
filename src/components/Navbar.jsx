// Componente Navbar con menú de navegación y control de sesión

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

export default function BarraNavegacion() {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(!expanded);
  const handleClose = () => setExpanded(false);

  return (
    <Navbar bg="light" expand="lg" className="mb-3" expanded={expanded} onToggle={handleToggle}>
      <Container>
        <Navbar.Brand as={Link} href="/" onClick={handleClose}>
          Hospeda+
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" onClick={handleClose}>
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
              <NavDropdown.Item as={Link} href={`/usuarios/${user.sub}`} onClick={handleClose}>
                Modificar cuenta
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => { handleClose(); logout(); }}>
                Cerrar sesión
              </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} href="/auth/login" onClick={handleClose}>
                Iniciar sesión
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
