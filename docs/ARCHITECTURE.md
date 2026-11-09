ARQUITECTURA DEL SISTEMA

## 1. Arquitectura general
El proyecto utilizará una arquitectura modular dentro de una única aplicación.

No se utilizarán microservicios en la primera versión.

La aplicación se dividirá en:

- Frontend.
- Backend.
- Base de datos.
- Integraciones.
- Sistema de lanzamiento.
- Sistema de personalización.
- Sistema de plugins.
- Sistema de seguridad.

## 2. Backend
Lenguaje:
Rust.

Responsabilidades:

- Gestión de la biblioteca.
- Acceso a SQLite.
- Escaneo de directorios.
- Detección de juegos.
- Gestión de metadatos.
- Lanzamiento de videojuegos.
- Seguimiento de procesos.
- Gestión de configuraciones.
- Comunicación con integraciones.
- Validación de solicitudes.
- Gestión de sesiones.

## 3. Frontend
Tecnologías:

- React.
- TypeScript.
- Vite.
- CSS personalizado.
Responsabilidades:

- Interfaz gráfica.
- Biblioteca visual.
- Navegación.
- Edición de metadatos.
- Gestión de temas.
- Configuración.
- Visualización de estadísticas.
- Comunicación con el backend.

## 4. Comunicación
El frontend se comunicará con el backend mediante comandos IPC de Tauri.

Los comandos deberán:

- Tener nombres claros.
- Validar sus argumentos.
- Devolver errores estructurados.
- Evitar exponer operaciones peligrosas innecesarias.
- Mantener responsabilidades específicas.

## 5. Organización del backend
Estructura prevista:

src/

- main.rs
- lib.rs
modules/

- library/
- database/
- scanning/
- launching/
- integrations/
- metadata/
- statistics/
- configuration/
- security/
- plugins/
Cada módulo deberá mantener una responsabilidad delimitada.

## 6. Organización del frontend
src/

- app/
- components/
- pages/
- library/
- themes/
- settings/
- statistics/
- services/
- types/
- styles/

## 7. Comunicación con aplicaciones externas
Las integraciones utilizarán preferentemente:

- CLI documentadas.
- URI schemes públicos.
- APIs documentadas.
- Archivos de configuración conocidos, cuando sea necesario y autorizado.
No se dependerá de interfaces internas inestables cuando exista una alternativa pública.

## 8. Independencia de módulos
Las integraciones deberán poder desactivarse individualmente.

La biblioteca principal no deberá depender de una integración específica para funcionar.

La ausencia de Steam, Heroic o Lutris no deberá impedir el funcionamiento de la aplicación.

## 9. Principio arquitectónico
La biblioteca local es el núcleo.

Los clientes externos son integraciones opcionales.

La interfaz es una capa de presentación.

El backend es responsable de las operaciones sensibles.
