"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Agregar clase home-page al body cuando estemos en la ruta raíz
    if (pathname === '/') {
      document.body.classList.add('home-page');
    } else {
      document.body.classList.remove('home-page');
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('home-page');
    };
  }, [pathname]);

  return <>{children}</>;
}
