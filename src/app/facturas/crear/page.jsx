import { Suspense } from 'react';
import CrearFactura from './CrearFactura';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearFactura />
    </Suspense>
  );
}
