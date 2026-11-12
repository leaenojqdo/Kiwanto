SISTEMA DE BIBLIOTECA

## 1. Modelo de biblioteca
La biblioteca será independiente de los clientes externos.

Cada juego tendrá un identificador interno único.

La identidad del juego no será un identificador externo ni una ruta. Se conservarán correspondencias a identificadores de proveedores por separado. Ediciones, remasterizaciones y versiones por plataforma no se fusionarán automáticamente por compartir título; las coincidencias dudosas requerirán revisión.

### Modelo persistido y fixtures del prototipo

La biblioteca persistida utiliza ediciones con IDs internos estables. El estado favorito se guarda en SQLite por separado de los datos descriptivos. Los seis registros de `src/data/games.ts` permanecen como fixtures de desarrollo; `App.tsx` no los carga ni los inserta en la biblioteca del usuario.

El contrato de presentación de TypeScript conserva `Game` y `GameLibraryState` para reutilizar la búsqueda, selección y UI. Los comandos Tauri devuelven entradas persistidas; Rust gestiona SQLite, y el servicio de `src/library/service.ts` es la frontera del frontend. La disponibilidad `installed` de la vista se deriva de instalaciones con estado `available`; no existe una columna `installed` en la edición y la gestión de instalaciones todavía no está implementada.

Plataforma de origen y sistemas operativos objetivo se almacenan por separado en plataformas, lanzamientos y sistemas asociados. El editor consulta el catálogo canónico de géneros y subgéneros desde SQLite y permite buscar y seleccionar varias opciones por sus IDs estables; escribir en la búsqueda no crea términos. Los términos libres y asociaciones existentes se conservan como pendientes de clasificación con su procedencia manual anterior. Las etiquetas personales permanecen en una entidad separada. El registro de términos pendientes con procedencia está preparado para fuentes futuras, pero no hay proveedores externos integrados. Las tablas de instalaciones, referencias de gestor, etiquetas, identificadores externos, procedencia de metadatos y recursos visuales forman parte de las migraciones, pero sus operaciones de gestión aún no están disponibles en la interfaz. Los perfiles de lanzamiento locales sí pueden consultarse, configurarse y utilizarse para un lanzamiento explícito básico; no hay gestión de instalaciones ni seguimiento de sesiones. Las colecciones manuales sí cuentan con operaciones de gestión; su alcance actual y las capacidades futuras se describen en la sección 8.

Las entradas nuevas pueden no tener género, plataforma, sistemas objetivo ni año conocidos. El editor manual no importa ejecutables, busca instalaciones ni almacena archivos gráficos dentro de SQLite. La carátula puede permanecer ausente hasta que se implemente su gestión.

La entrada del juego deberá conservarse aunque:

- Se desinstale.
- Se elimine su ejecutable.
- Se desactive su integración.
- Desaparezca un cliente externo.
- Se mueva su directorio.

## 2. Importación
El escaneo de fuentes deberá generar candidatos.

El usuario decidirá si desea importar cada candidato.

No se importarán juegos automáticamente sin consentimiento.

## 3. Escaneo
El usuario podrá configurar:

- Directorios.
- Fuentes.
- Exclusiones.
- Frecuencia.
- Escaneo manual.
- Escaneo al iniciar.
- Escaneo programado.
- Profundidad máxima.
- Extensiones permitidas.

## 4. Seguridad del escaneo
El escaneo:

- No ejecutará videojuegos.
- No ejecutará scripts.
- No realizará búsquedas indiscriminadas en todo el disco.
- No modificará los archivos encontrados.
- No eliminará juegos de la biblioteca.

## 5. Metadatos
Los metadatos deberán ser editables.

Los datos obtenidos externamente deberán poder corregirse manualmente.

La información podrá provenir de Kiwanto, de una fuente externa o de una edición manual. Cuando se utilicen datos externos, deberá poder consultarse su procedencia por campo cuando corresponda. La selección de un proveedor preferido no reemplazará la elección específica de un campo. Las ediciones manuales no se sobrescribirán silenciosamente, y una actualización parcial no borrará campos no incluidos en la respuesta de una fuente.

Los identificadores externos deberán asociarse con su proveedor y con la identidad interna del juego, sin asumir que una coincidencia por nombre confirma identidad. Las relaciones entre datos originales y traducciones, motores/proveedores y modificaciones manuales se especifican en [LOCALIZATION_AND_TRANSLATION.md](LOCALIZATION_AND_TRANSLATION.md). Los requisitos de normalización y resolución de conflictos se detallan en [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md).

## 6. Búsqueda, filtros y selección en el prototipo

La lógica actualmente implementada en `src/library/search.ts` recibe los juegos, sus estados de biblioteca y la consulta. Busca texto en el título sin distinguir mayúsculas ni diacríticos y reconoce `@aventura`, `@terror`, `@linux`, `@windows`, `@favoritos`, `@instalados`, `@instalado` y `@no-instalados`. Los criterios de una consulta se combinan; otros términos `@` se comparan con géneros, plataforma y sistemas. El filtro de Favoritos de la navegación también restringe los resultados a juegos favoritos. Los géneros, alias y criterios actuales son parte del prototipo, no una taxonomía definitiva.

`src/library/selectors.ts` resuelve la selección por el ID estable del juego:

- Si el juego seleccionado sigue entre los resultados, se conserva.
- Si queda excluido por búsqueda o filtro, se elige el primer resultado visible.
- Si no hay resultados, no queda juego seleccionado y el área principal muestra el estado vacío.
- Al borrar o cambiar la consulta, se vuelve a resolver la selección contra los nuevos resultados.

`App.tsx` coordina esta lógica con el estado React y actualiza la selección efectiva cuando cambia el conjunto visible. La lógica de consulta y selección no pertenece a `LibraryPanel` ni al detalle visual; puede reutilizarse desde otra composición. La selección no se identifica por posición o índice.

Esta búsqueda es la implementación básica de la biblioteca persistida: no proporciona todavía el panel avanzado de filtros, navegación jerárquica del DAG, consultas persistentes ni proveedores externos.

La búsqueda y los filtros básicos actuales reciben los registros persistidos y conservan la misma sintaxis del prototipo; no se ha implementado el sistema avanzado de facetas de [TAXONOMY_AND_FILTERS.md](TAXONOMY_AND_FILTERS.md). La selección sigue usando el ID estable de la edición.

## 7. Imágenes
Se admitirán:

- Portadas.
- Logos.
- Fondos.
- Capturas.
- Iconos.
- Imágenes personalizadas.
Se deberá permitir utilizar imágenes locales.

Las imágenes descargadas o importadas se conservarán como archivos locales independientes; SQLite almacenará referencias y metadatos, no los datos binarios de las imágenes. Se distinguirán las imágenes del juego de los recursos de temas e interfaz. Cada recurso deberá poder relacionarse con su juego, tipo, procedencia y atribución cuando aplique.

La selección, sustitución y eliminación de una imagen será explícita. La validación cubrirá formatos, dimensiones, tamaño, archivos dañados y referencias locales seguras. Las búsquedas futuras podrán combinar proveedores en una presentación común, pero no se presupone que el buscador o proveedores estén implementados.

El directorio administrado, deduplicación, caché, límites, respaldo y ciclo de vida de recursos quedan por definir. La limpieza no deberá eliminar silenciosamente archivos del usuario ni datos que todavía se referencien. Véase [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md) para los requisitos detallados.

## 8. Colecciones
Las colecciones manuales son agrupaciones locales que crea y administra el usuario. Tienen nombre obligatorio y descripción opcional; admiten varios juegos y un juego puede pertenecer a varias colecciones. Su pertenencia es independiente de favoritos, géneros, subgéneros y etiquetas personales. Quitar una asociación o eliminar una colección nunca elimina la entrada de biblioteca.

La primera versión está implementada en Desktop Mode: SQLite persiste nombre, descripción y asociaciones; Rust ofrece operaciones reutilizables para crear, consultar, editar y eliminar colecciones y para añadir o quitar juegos; la interfaz permite abrir colecciones vacías o con juegos y presenta errores y estados de carga. La clave primaria compuesta impide asociaciones duplicadas y las claves foráneas mantienen la integridad. Eliminar una colección elimina sus asociaciones en cascada, no los juegos. La implementación actual no incluye portada o fondo propios, orden personalizado ni contenido editorial.

Las colecciones inteligentes son futuras: sus resultados se derivarán de filtros configurados por el usuario y se actualizarán automáticamente. Las franquicias o sagas serán entidades distintas, con identidad, metadatos y relaciones propias; no se modelarán como colecciones manuales extendidas. La detección podrá sugerir posibles relaciones, pero no las confirmará ni creará definitivamente sin revisión explícita. Tipos de entrega, generaciones y cronologías pertenecen a ese futuro modelo.

La presentación visual futura podrá incluir portada y fondo independientes, varias orientaciones y composiciones interiores. Estos recursos no cambian la identidad ni las asociaciones de los juegos. La presentación y los recursos se especifican en [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md) y [UI_AND_THEMES.md](UI_AND_THEMES.md). El orden personalizado y las ordenaciones por título, lanzamiento, cronología argumental o recomendación son opciones futuras distintas; no se presupone una única cronología.

## 9. Estadísticas
La aplicación podrá registrar:

- Tiempo total.
- Número de sesiones.
- Última ejecución.
- Fecha de primera ejecución.
- Duración de sesiones.
- Historial de actividad.
Los datos deberán permanecer locales.

## 10. Detección de duplicados
Se utilizarán criterios como:

- Nombre.
- Ruta.
- Identificador de fuente.
- Ejecutable.
- Plataforma.
La detección no deberá fusionar automáticamente entradas sin consentimiento.

## 11. Datos de proveedores y funcionamiento offline

La biblioteca deberá distinguir información propia de Kiwanto, información externa con procedencia, modificaciones manuales, traducciones, archivos gráficos locales, y cachés o datos descargados. Estos conceptos no deben duplicarse innecesariamente ni confundirse con instalaciones o identidad del juego.

Los proveedores serán opcionales. La búsqueda y visualización de información local no deberán depender de la red; la indisponibilidad o desactivación de una fuente no eliminará información local ni impedirá usar la biblioteca. Solo se conservarán datos externos de acuerdo con condiciones de uso verificadas. No se define todavía un esquema SQL ni se declara integrado un proveedor.
