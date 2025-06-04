"use client";

import React from "react";
import styles from "./Cargando.module.css";

export default function Cargando() {
  return (
    <div className={styles.container}>
      <img
        src="/Cargando.gif"
        alt="Cargando..."
        className={styles.image}
      />
    </div>
  );
}
