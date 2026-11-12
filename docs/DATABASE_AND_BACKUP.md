# Base de datos y respaldos

## 1. Estado implementado

SQLite es la persistencia local de la biblioteca. Rust administra la conexión y las operaciones mediante `rusqlite`; React no ejecuta SQL. `src/library/service.ts` invoca comandos Tauri tipados y acotados, y los componentes consumen el mismo estado y las reglas compartidas de búsqueda y selección.

La aplicación permite crear, listar, editar y marcar favoritos en ediciones manuales; archivar y restaurar entradas; y eliminar permanentemente una entrada archivada después de confirmación. También permite crear, listar, editar y eliminar colecciones manuales persistentes y gestionar sus asociaciones desde Desktop Mode. La eliminación permanente de una edición afecta a los registros de Kiwanto, nunca a los archivos del juego. Las tablas de instalaciones y referencias de gestores impiden borrar una edición que aún dependa de ellas.

La migración inicial crea estructuras para relaciones aprobadas que todavía no tienen operaciones de interfaz. La migración de esquema 2 añade el estado y la procedencia de los términos de taxonomía y siembra un catálogo canónico inicial pequeño. Que una tabla exista no significa que la función correspondiente esté implementada.

## 2. Ubicaciones

En Linux, Tauri resuelve las ubicaciones base según XDG:

- Datos: `app.path().data_dir()/kiwanto/library.sqlite3` (por defecto `~/.local/share/kiwanto/library.sqlite3`, o bajo `XDG_DATA_HOME` cuando está definido).
- Configuración actual: `app.path().config_dir()/kiwanto/preferences.json` (por defecto `~/.config/kiwanto/preferences.json`, o bajo `XDG_CONFIG_HOME`).
- Cachés regenerables: no se usan todavía.

El identificador de aplicación es `com.kiwanto.desktop`; la base de datos no se guarda dentro de un directorio con ese identificador y otro directorio `kiwanto` anidado. Las preferencias previas guardadas mediante `app_config_dir()` se validan y se migran a la nueva ubicación cuando se leen o guardan. La migración compara las preferencias ya parseadas si existen ambos archivos: si difieren, informa el conflicto y preserva ambos; si son equivalentes, conserva la copia actual y retira la anterior; si solo existe la anterior, crea la actual sin reemplazar un archivo que pudiera aparecer en paralelo y solo entonces retira la fuente. La escritura temporal se completa y sincroniza antes de publicar la copia. No elimina otros archivos o carpetas de configuración.

El frontend no recibe rutas arbitrarias ni acceso general al sistema de archivos. En una vista de desarrollo ejecutada fuera de Tauri, las operaciones de biblioteca muestran un error explícito; no se sustituye SQLite por los juegos de demostración ni se escriben en la biblioteca del usuario.

## 3. Esquema SQLite inicial

Las claves internas son enteros autoincrementales; el frontend los recibe como cadenas estables. Las fechas técnicas se guardan como texto UTC ISO-8601.

```text
works (optional)
└── editions (library identity, editable metadata, archive timestamp)
    ├── platform_releases ── platforms
    │   ├── release_operating_systems ── operating_systems
    │   └── release_variants
    ├── installations
    │   ├── installation_locations
    │   ├── installation_artifacts
    │   └── installation_manager_references
    ├── launch_profiles ── launch_profile_arguments
    │                     └── launch_profile_environment
    ├── personal_state (favorite, notes, personal rating)
    ├── edition_taxonomy_terms ── taxonomy_terms ── taxonomy_term_labels
    ├── edition_personal_tags ── personal_tags
    └── collection_editions ── collections
```

La migración también define:

- `execution_environments`, independiente y potencialmente compartido entre instalaciones o perfiles.
- `taxonomy_term_edges`, una relación de varios padres que forma el DAG; los triggers de SQLite rechazan ciclos.
- `taxonomy_terms.status` distingue `canonical` de `pending`. La versión 2 conserva todos los términos y asociaciones provenientes del editor libre anterior como pendientes, registra su origen manual legado en `taxonomy_term_sources` y conserva los IDs numéricos y asociaciones de edición, lanzamiento o variante. Las reclamaciones manuales previas del campo de géneros pasan a estado pendiente; no se eliminan términos ni asociaciones.
- El catálogo canónico inicial de géneros y subgéneros tiene IDs estables `kiwanto.genre.*` y `kiwanto.subgenre.*`. Es un vocabulario inicial pequeño y ampliable, no un catálogo completo aprobado. Los términos desconocidos pueden registrarse como pendientes con fuente y, cuando se conoce, edición asociada; no se insertan como canónicos.
- `release_taxonomy_terms` y `variant_taxonomy_terms`, para asociaciones futuras con el alcance aprobado.
- `metadata_claims`, con valor JSON, campo, fuente, estado y exactamente un destino tipado (obra, edición, lanzamiento, variante o instalación). La edición manual actual registra sus valores aceptados dentro de la misma transacción que guarda la entrada.
- `external_identifiers`, separado de la identidad interna.
- `visual_assets` y `visual_asset_associations`; SQLite guarda rutas y metadatos, nunca los binarios de carátulas u otras imágenes.

`editions` no tiene una columna `installed`. Los lanzamientos de plataforma son filas independientes; año, plataforma de origen y sistemas operativos objetivo se relacionan con el lanzamiento. Una entrada puede no tener todavía plataforma, año, géneros ni sistemas objetivo conocidos. El editor consulta el catálogo canónico desde Rust, permite buscar y seleccionar múltiples IDs estables, y reemplaza solo las asociaciones canónicas durante la edición. Las asociaciones pendientes existentes se conservan y se muestran aparte; las etiquetas personales siguen siendo independientes.

Las tablas `collections` y `collection_editions` ya respaldan colecciones manuales: la primera guarda nombre y descripción; la segunda asocia colecciones con ediciones mediante clave primaria compuesta, evitando duplicados. El borrado en cascada elimina las asociaciones al borrar una colección, mientras la clave foránea de edición conserva la integridad. No existen todavía columnas para artwork propio, fondo, orden o contenido enriquecido de colección; no forman parte de la implementación actual.

Los perfiles tienen una referencia obligatoria a su edición y pueden tener referencias adicionales a un lanzamiento o instalación. Claves foráneas compuestas exigen que todas las referencias pertenezcan a la misma edición. Los argumentos de perfil, cuando se implementen, son filas ordenadas en `launch_profile_arguments`, no una cadena de shell. Los entornos Wine, Proton y emuladores están separados de la identidad de instalación.

### Integridad y conservación

- Las claves foráneas se habilitan y verifican en cada conexión.
- IDs, nombres normalizados y asociaciones tienen restricciones `UNIQUE` o claves primarias compuestas.
- La eliminación lógica usa `editions.archived_at`; las relaciones, favoritos y datos de usuario se conservan.
- La eliminación permanente solo admite entradas archivadas. SQLite borra sus asociaciones de biblioteca; instalaciones y referencias de gestor usan `RESTRICT` para bloquear la operación mientras haya dependencias.
- Nunca se borran ni modifican archivos del juego, prefijos, ROMs o recursos visuales al borrar una entrada.
- Los valores externos y rutas deberán validarse antes de ser utilizados. La detección e importación de juegos no están implementadas. El lanzamiento local manual sí está implementado de forma básica: Rust invoca el ejecutable configurado y sus argumentos separados mediante `Command`, sin concatenar una cadena de shell; véase [GAME_LAUNCHING.md](GAME_LAUNCHING.md). No incluye seguimiento completo del proceso o sesiones.

## 4. Migraciones y transacciones

La versión de esquema se guarda en `PRAGMA user_version`; la versión actual es 2. La migración inicial y la migración de taxonomía, así como cada migración futura, se ejecutan dentro de transacciones. Si una sentencia falla, se revierte tanto el DDL como la actualización de versión; la aplicación informa el error y no sustituye la base por una nueva vacía. Una base con versión posterior a la admitida se rechaza.

`PRAGMA foreign_keys=ON` se aplica por conexión y se comprueba; al inicializar también se ejecuta `foreign_key_check`. Los cambios que tocan varias tablas —creación y edición de una entrada, lanzamiento de plataforma, géneros, sistemas y procedencia— se confirman en una transacción `IMMEDIATE`. La selección de géneros solo acepta IDs cuyo estado sea canónico. El registro de valores desconocidos los conserva en estado pendiente junto con su procedencia y nunca crea géneros canónicos.

La conexión exige SQLite 3.9.0 o posterior, usa WAL, espera hasta cinco segundos ante un bloqueo y configura `synchronous=FULL`; también verifica esas opciones al inicializar. WAL y los respaldos no deben asumirse adecuados para todos los sistemas de archivos de red. No existe aún una función de respaldo/restauración; antes de implementarla deberá usar la API de respaldo de SQLite o coordinar la base de forma consistente, en vez de copiar solo el archivo principal mientras WAL está activo.

`launch_profile_environment` prepara futuras variables de entorno por perfil. No se usa actualmente y no establece un mecanismo para almacenar secretos; las credenciales requieren un diseño de almacenamiento seguro separado.

## 5. Datos ficticios

Los seis juegos de `src/data/games.ts` siguen disponibles como fixtures de desarrollo. No se cargan al iniciar Kiwanto ni se insertan al inicializar o migrar SQLite. Una base nueva queda vacía; el usuario agrega entradas manualmente.

## 6. Respaldo y restauración — pendientes

Una futura función de respaldo deberá ofrecer una copia consistente de la base y explicar qué configuración y recursos locales incluye. La restauración deberá validar la versión, integridad y compatibilidad, pedir confirmación, evitar sobrescribir datos accidentalmente y conservar archivos existentes si hay errores.

No se declara implementado ningún mecanismo de backup, restauración, sincronización en la nube o copia de carátulas.
