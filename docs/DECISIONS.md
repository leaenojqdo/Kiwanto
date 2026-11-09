REGISTRO DE DECISIONES

## DEC-001 — Biblioteca independiente
Decisión:

La biblioteca será propiedad del usuario.

Motivo:

La aplicación no deberá depender de la existencia de los clientes externos.

## DEC-002 — Importación confirmada
Decisión:

Los escaneos generarán candidatos.

El usuario confirmará las importaciones.

Motivo:

Evitar entradas duplicadas y cambios no deseados.

## DEC-003 — No eliminar juegos automáticamente
Decisión:

La desaparición de una instalación no eliminará la entrada.

Motivo:

Preservar metadatos, imágenes y estadísticas.

## DEC-004 — Rust
Decisión:

Rust será el backend.

Motivo:

Seguridad, rendimiento y control del sistema.

## DEC-005 — Tauri 2
Decisión:

Tauri será el framework de escritorio.

Motivo:

Integración con frontend moderno y backend Rust.

## DEC-006 — React y TypeScript
Decisión:

El frontend utilizará React y TypeScript.

Motivo:

Flexibilidad y ecosistema.

## DEC-007 — SQLite
Decisión:

SQLite será la base de datos.

Motivo:

Persistencia local y funcionamiento offline.

## DEC-008 — Sin microservicios
Decisión:

La aplicación utilizará una arquitectura modular monolítica.

Motivo:

Reducir complejidad.

## DEC-009 — CSS personalizado
Decisión:

La interfaz utilizará tokens de diseño y CSS propio.

Motivo:

Facilitar personalización avanzada.

## DEC-010 — Plugins restringidos
Decisión:

Los plugins arbitrarios no estarán habilitados en la primera versión.

Motivo:

Reducir riesgos de seguridad.

## DEC-011 — Sin credenciales en primera versión
Decisión:

No se almacenarán credenciales de tiendas.

Motivo:

Evitar responsabilidad y exposición de datos sensibles.

## DEC-012 — Linux primero
Decisión:

El desarrollo inicial se centrará en Linux.

Motivo:

Reducir alcance y facilitar pruebas.
