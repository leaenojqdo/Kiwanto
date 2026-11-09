SISTEMA DE PLUGINS

## 1. Objetivo
Permitir ampliar la aplicación sin modificar su núcleo.

## 2. Plugins previstos

- Integraciones de clientes.
- Importadores.
- Proveedores de metadatos.
- Proveedores de imágenes.
- Temas.
- Herramientas de estadísticas.
- Funciones de biblioteca.

## 3. Primera versión
No se permitirá ejecutar plugins arbitrarios sin restricciones.

Los temas serán declarativos.

Las integraciones iniciales serán módulos internos.

## 4. Futuro sistema de plugins
Se podrá estudiar:

- WASM.
- API de plugins.
- Permisos.
- Límites de recursos.
- Aislamiento.
- Validación de manifest.
- Firma opcional.

## 5. Manifest
Un plugin deberá declarar:

- Identificador.
- Nombre.
- Versión.
- Autor.
- Descripción.
- Versión mínima del launcher.
- Permisos.
- Dependencias.

## 6. Seguridad
Los plugins no deberán acceder a:

- Credenciales.
- Datos privados.
- Archivos fuera de sus permisos.
El acceso a red deberá ser explícito.

El acceso a procesos externos deberá ser explícito.

La lectura de archivos deberá limitarse a las rutas autorizadas.

## 7. Permisos
Ejemplos:

- library.read
- library.write
- metadata.read
- metadata.write
- filesystem.read
- filesystem.write
- process.launch
- network.access

## 8. Desactivación
La desactivación de un plugin no deberá eliminar los datos generados por él.
