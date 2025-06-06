"use client";

import React from "react";
import styles from "./Cargando.module.css";

export default function Cargando({ mensaje = "Cargando..." }) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <img
        src="/Cargando.gif"
        alt="Indicador de carga"
        className={styles.image}
        loading="eager"
      />
      <div className={styles.loadingText} aria-label={mensaje}>
        {mensaje}
      </div>
    </div>
  );
}
