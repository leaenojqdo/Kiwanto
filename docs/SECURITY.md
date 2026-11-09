POLÍTICA DE SEGURIDAD

## 1. Principios
La seguridad deberá ser una parte central del diseño.

La aplicación deberá priorizar:

- Privacidad.
- Transparencia.
- Consentimiento.
- Validación.
- Privilegios mínimos.
- Control del usuario.

## 2. Archivos
El programa no deberá realizar modificaciones destructivas sin autorización.

## 3. Escaneo
El escaneo no deberá ejecutar los archivos encontrados.

## 4. Ejecución
Los videojuegos deberán iniciarse únicamente mediante acciones explícitas del usuario.

## 5. Credenciales
La primera versión no almacenará credenciales de tiendas.

## 6. Integraciones
Las integraciones deberán utilizar interfaces públicas cuando existan.

No se deberá modificar automáticamente la configuración de otros clientes.

## 7. Backend
Las operaciones sensibles deberán ejecutarse en Rust.

El frontend no deberá disponer de acceso irrestricto al sistema de archivos.

## 8. IPC
Los comandos IPC deberán:

- Validar argumentos.
- Limitar operaciones.
- Devolver errores estructurados.
- Evitar permisos excesivos.

## 9. Logs
Los registros no deberán contener:

- Contraseñas.
- Tokens.
- Credenciales.
- Información privada innecesaria.

## 10. Actualizaciones
Las futuras actualizaciones deberán utilizar mecanismos verificables.

## 11. Reporte de vulnerabilidades
Se deberá habilitar un mecanismo de reporte privado antes de publicar versiones estables.
