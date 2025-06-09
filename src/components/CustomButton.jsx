"use client";

import React from "react";
import { Button } from "react-bootstrap";
import { IconContext } from "react-icons";

import {
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
  FaPrint,
  FaEdit,
  FaEye,
  FaTrash,
} from "react-icons/fa";

const iconMap = {
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
  danger: FaTimesCircle,
  success: FaCheckCircle,
  print: FaPrint,
  edit: FaEdit,
  view: FaEye,
  delete: FaTrash,
};

/**
 * Componente CustomButton
 * Botón personalizado que unifica estilos, iconos y comportamientos.
 * Props:
 * - variant: string (variante de bootstrap: primary, warning, danger, success, info)
 * - icon: string (clave para iconMap)
 * - children: contenido del botón
 * - ...rest: otros props para Button
 */
export default function CustomButton({ variant = "primary", icon, children, ...rest }) {
  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <Button
      variant={variant}
      className="custom-btn"
      {...rest}
    >
      <IconContext.Provider value={{ className: "custom-btn-icon", size: "1.1em" }}>
        {IconComponent && <IconComponent style={{ marginRight: children ? "0.5em" : 0 }} />}
        {children}
      </IconContext.Provider>
    </Button>
  );
}
