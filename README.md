# Hospeda+ Frontend

Interfaz de usuario moderna y responsive para el sistema de gestión hotelera Hospeda+, desarrollada con Next.js 15 y React 19. Proporciona una experiencia completa e intuitiva para la administración de establecimientos hoteleros con diseño profesional y funcionalidades avanzadas.

## 🚀 Características Principales

### 1. Sistema de Autenticación
- Autenticación JWT con roles diferenciados
- Gestión de sesiones con sessionStorage
- Protección de rutas basada en roles (admin, recepcionista)
- Redirección automática según rol de usuario
- Validación de tokens y expiración automática

### 2. Gestión de Reservas
- Listado completo de reservas con filtros avanzados
- Filtrado por fechas de entrada/salida y nombre de huésped
- Estados de reserva (confirmada, pendiente, cancelada)
- Creación y edición de reservas
- Asignación de habitaciones
- Cálculo automático de duración de estancia
- Integración directa con sistema de facturación

### 3. Sistema de Facturación
- Generación automática de facturas desde reservas
- Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- Cálculo de descuentos y totales
- Estados de factura (pendiente, pagada, anulada)
- Filtros por estado y método de pago
- Funcionalidad de impresión con jsPDF
- Exportación de facturas a PDF

### 4. Gestión de Huéspedes
- Registro completo de información de huéspedes
- Historial de reservas por huésped
- Gestión de contactos de emergencia
- Búsqueda y filtrado de huéspedes

### 5. Sistema de Habitaciones
- Gestión completa de habitaciones
- Estados de habitación y disponibilidad
- Historial de mantenimiento
- Asignación automática en reservas

### 6. Panel de Administración
- Gestión de usuarios (solo para administradores)
- Control de acceso basado en roles
- Navegación adaptativa según permisos
- Perfil de usuario editable

## 🛠️ Tecnologías Utilizadas

### Core Framework
- **Next.js 15.3.2** - Framework React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **JavaScript (ES6+)** - Lenguaje principal

### UI/UX
- **React Bootstrap 2.10.10** - Componentes de interfaz
- **Bootstrap 5.3.6** - Framework CSS
- **React Icons 5.5.0** - Iconografía
- **CSS Modules** - Estilos modulares

### Estado y Datos
- **React Context** - Gestión de estado global (AuthContext)
- **React Hooks** - useState, useEffect, useContext
- **Axios 1.9.0** - Cliente HTTP para API REST

### Autenticación
- **react-jwt 1.3.0** - Decodificación de tokens JWT
- **sessionStorage** - Almacenamiento de tokens

### Generación de PDFs
- **jsPDF 3.0.1** - Generación de documentos PDF
- **jsPDF-AutoTable 5.0.2** - Tablas en PDFs
- **html2canvas 1.4.1** - Captura de elementos HTML

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **Next.js ESLint Config** - Configuración específica

## 📦 Instalación y Configuración

### Requisitos del Sistema
- Node.js 18.17 o superior
- npm 9.x o superior
- Git

### Pasos de Instalación

1. **Clonar el Repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd hospeda
```

2. **Instalar Dependencias**
```bash
npm install
```

3. **Configurar Variables de Entorno**
```bash
# Crear archivo .env.local
# Configurar URL del backend (actualmente localhost:4000)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🚦 Comandos Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir aplicación para producción
npm run build

# Iniciar aplicación en modo producción
npm run start

# Ejecutar linter
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas y rutas (App Router)
│   ├── layout.jsx         # Layout principal
│   ├── page.jsx           # Página de inicio
│   ├── auth/              # Autenticación
│   ├── reservas/          # Gestión de reservas
│   ├── facturas/          # Sistema de facturación
│   ├── huespedes/         # Gestión de huéspedes
│   ├── habitaciones/      # Gestión de habitaciones
│   └── usuarios/          # Administración de usuarios
├── components/            # Componentes compartidos
│   ├── Navbar.jsx        # Barra de navegación
│   └── Cargando.jsx      # Componente de carga
├── context/              # Contextos de React
│   └── AuthContext.jsx   # Contexto de autenticación
├── modules/              # Módulos funcionales
│   ├── reservas/         # Componentes y servicios de reservas
│   ├── facturas/         # Componentes y servicios de facturas
│   ├── huespedes/        # Componentes y servicios de huéspedes
│   └── habitaciones/     # Componentes y servicios de habitaciones
└── services/             # Servicios API
    └── api.jsx           # Cliente Axios configurado
```

## 📱 Rutas y Navegación

### Públicas
- `/` - Página de inicio
- `/auth/login` - Iniciar sesión

### Protegidas (requieren autenticación)
- `/reservas` - Listado de reservas
- `/reservas/crear` - Crear nueva reserva
- `/reservas/[id]` - Ver/editar reserva específica
- `/facturas` - Listado de facturas
- `/facturas/crear` - Crear nueva factura
- `/facturas/[id]` - Ver/editar factura específica
- `/huespedes` - Gestión de huéspedes
- `/huespedes/[id]` - Perfil de huésped
- `/habitaciones` - Gestión de habitaciones

### Solo Administradores
- `/usuarios` - Gestión de usuarios del sistema

## 🔄 Integración con Backend

### Configuración de API
- **Base URL**: `http://localhost:4000` (desarrollo)
- **Interceptores de Request**: Añade automáticamente token JWT
- **Interceptores de Response**: Manejo centralizado de errores
- **Autenticación**: Bearer Token en headers
- **Manejo de Errores**: 
  - 401: Redirección a login
  - 403: Error de permisos
  - 404: Recurso no encontrado
  - 500: Error del servidor

### Servicios Principales
- **Servicio de Reservas**: CRUD completo con filtros
- **Servicio de Facturas**: Gestión de facturación
- **Servicio de Huéspedes**: Gestión de clientes
- **Servicio de Habitaciones**: Administración de habitaciones

## 🎨 Diseño y UX

### Responsive Design
- **Bootstrap Grid System** - Layout responsive
- **Mobile First** - Optimizado para dispositivos móviles
- **Navegación Adaptativa** - Menú colapsible en móviles
- **Tablas Responsive** - Scroll horizontal automático

### Componentes de UI
- **Tablas Interactivas** - Ordenación y filtrado
- **Formularios Validados** - Validación en tiempo real
- **Modales y Alertas** - Feedback visual
- **Estados de Carga** - Indicadores de progreso
- **Badges de Estado** - Identificación visual de estados

## 🔒 Seguridad

### Autenticación y Autorización
- **JWT Tokens** - Autenticación segura
- **Roles de Usuario** - Control de acceso granular
- **Protección de Rutas** - Verificación de permisos
- **Expiración de Sesión** - Logout automático
- **Validación de Tokens** - Verificación de integridad

### Buenas Prácticas
- **Sanitización de Datos** - Prevención de XSS
- **Validación Client-Side** - Verificación de formularios
- **Manejo Seguro de Errores** - No exposición de información sensible
- **HTTPS Ready** - Preparado para comunicación segura

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
# Aplicación disponible en http://localhost:3000
```

### Producción
```bash
npm run build
npm run start
```

### Docker (si está configurado)
```bash
docker build -t hospeda-frontend .
docker run -p 3000:3000 hospeda-frontend
```

## 🔧 Configuración Adicional

### Variables de Entorno
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Configuración de API
- Modificar `baseURL` en `src/services/api.jsx`
- Configurar interceptores según necesidades
- Ajustar manejo de errores

## 📊 Características Técnicas

### Performance
- **Next.js App Router** - Renderizado optimizado
- **Lazy Loading** - Carga bajo demanda
- **Image Optimization** - Optimización automática de imágenes
- **Code Splitting** - División automática de código

### Accesibilidad
- **Semantic HTML** - Estructura semántica
- **ARIA Labels** - Etiquetas de accesibilidad
- **Keyboard Navigation** - Navegación por teclado
- **Screen Reader Support** - Soporte para lectores de pantalla

## 🤝 Contribución

### Estándares de Código
- Seguir convenciones de ESLint
- Documentar componentes y funciones
- Usar nombres descriptivos para variables y funciones
- Mantener componentes pequeños y reutilizables

### Flujo de Desarrollo
1. Crear rama feature desde main
2. Desarrollar funcionalidad
3. Probar localmente
4. Crear Pull Request
5. Revisión de código
6. Merge a main

## 📄 Licencia

Este proyecto pertenece a Deyver Rios - ASIR

---

**Hospeda+** - Sistema de Gestión Hotelera Moderno y Eficiente
