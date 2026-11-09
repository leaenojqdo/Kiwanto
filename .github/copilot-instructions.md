INSTRUCCIONES PERMANENTES PARA COPILOT

## 1. Contexto
Estás colaborando en Game Library Launcher.

Es una aplicación de escritorio para Linux que centraliza bibliotecas de videojuegos.

La arquitectura seleccionada es:

- Rust.
- Tauri 2.
- React.
- TypeScript.
- Vite.
- SQLite.

## 2. Principios
La biblioteca pertenece al usuario.

Los clientes externos son integraciones opcionales.

Los escaneos generan candidatos y no importan juegos automáticamente.

La desaparición de una instalación no elimina entradas.

La aplicación debe priorizar privacidad y seguridad.

## 3. Desarrollo
Antes de modificar código:

- Revisar la documentación.
- Comprender el módulo.
- Identificar dependencias.
- Definir el alcance del cambio.
Los cambios deberán ser pequeños y verificables.

## 4. Rust
Utilizar:

- Tipos explícitos.
- Manejo correcto de errores.
- Validación.
- Separación de responsabilidades.
- Código seguro.
Evitar:

- unwrap() innecesarios.
- Operaciones inseguras sin justificación.
- Concatenación de comandos de shell.
- Acceso indiscriminado al sistema de archivos.

## 5. TypeScript
Utilizar TypeScript.

Evitar any cuando exista una alternativa adecuada.

Definir interfaces para los datos.

Separar componentes visuales de lógica de negocio.

## 6. Base de datos
Las modificaciones deberán incluir migraciones cuando corresponda.

No modificar el esquema sin actualizar la documentación.

No eliminar datos del usuario automáticamente.

## 7. Seguridad
No ejecutar juegos durante escaneos.

No almacenar credenciales.

No solicitar root.

No otorgar permisos excesivos.

No ejecutar código de plugins sin un sistema de aislamiento.

## 8. Pruebas
Agregar pruebas cuando corresponda.

No afirmar que las pruebas fueron ejecutadas si no se ejecutaron.

Informar claramente:

- Qué se modificó.
- Qué se probó.
- Qué no se pudo probar.
- Qué riesgos permanecen.

## 9. Restricciones
No reescribir módulos completos sin necesidad.

No introducir frameworks adicionales sin justificación.

No cambiar la arquitectura sin una decisión documentada.

No eliminar funcionalidades existentes para resolver problemas de forma superficial.

## 10. Documentación
La documentación es la fuente de referencia del proyecto.

Si una modificación contradice la documentación, señalarlo y proponer una actualización antes de implementarla.

# FIN DE LA DOCUMENTACIÓN v0.2.0
Esta documentación constituye una base inicial para comenzar el desarrollo.

El siguiente paso lógico sería construir el prototipo vertical de la Fase 1: una ventana Tauri funcional, una biblioteca SQLite, importación manual de juegos, escaneo seguro y un primer perfil de lanzamiento.

No se ha generado ningún archivo ZIP ni se ha ejecutado código; todo el contenido está directamente en este mensaje.
