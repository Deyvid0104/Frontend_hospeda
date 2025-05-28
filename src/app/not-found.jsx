"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, Button } from "react-bootstrap";

export default function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Container className="error-page">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="Hospeda+ Logo"
          width={325}
          height={100}
          priority
          className="mb-4"
        />
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p className="lead">
          Lo sentimos, la página que buscas no existe en Hospeda+
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button 
            variant="primary" 
            onClick={handleGoBack}
          >
            Volver atrás
          </Button>
          <Link href="/" passHref>
            <Button variant="outline-primary">
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
