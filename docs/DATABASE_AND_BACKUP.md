BASE DE DATOS Y RESPALDOS

## 1. SQLite
SQLite será la base de datos principal.

## 2. Datos persistentes
La base de datos almacenará:

- Juegos.
- Metadatos.
- Colecciones.
- Etiquetas.
- Perfiles de lanzamiento.
- Estadísticas.
- Historial.
- Configuración.
- Referencias a imágenes.
- Integraciones.

## 3. Principio de persistencia
La información personal no deberá depender de los clientes externos.

## 4. Tablas iniciales
games

- id
- title
- description
- developer
- publisher
- release_date
- platform
- installation_status
- created_at
- updated_at
game_sources

- id
- game_id
- source_type
- external_id
- installation_path
- detected_at
launch_profiles

- id
- game_id
- name
- executable
- working_directory
- arguments
- environment
- runner
collections

- id
- name
- description
collection_games

- collection_id
- game_id
tags

- id
- name
game_tags

- game_id
- tag_id
sessions

- id
- game_id
- started_at
- ended_at
- duration
- confidence
media

- id
- game_id
- media_type
- path
settings

- key
- value

## 5. Migraciones
Las modificaciones de estructura deberán gestionarse mediante migraciones.

No se deberán modificar tablas de forma improvisada durante la ejecución.

## 6. Respaldos
El usuario podrá crear respaldos.

El respaldo deberá incluir:

- Base de datos.
- Configuración.
- Temas personalizados.
- Metadatos locales.
- Referencias necesarias.
Las imágenes podrán incluirse según la configuración.

## 7. Restauración
La restauración deberá:

- Validar el archivo.
- Detectar incompatibilidades.
- Solicitar confirmación.
- Evitar sobrescrituras accidentales.

## 8. SQLite WAL
El modo WAL se evaluará antes de activarse.

La versión de SQLite deberá verificarse.

Los respaldos deberán realizarse mediante mecanismos consistentes.

No se asumirá que copiar únicamente el archivo principal de SQLite constituye un respaldo seguro en todos los modos.
