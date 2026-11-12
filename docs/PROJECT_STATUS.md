# Estado del proyecto

**Auditoría del checkout: 2026-11-12.** Este documento resume el código que existe en el repositorio en esa fecha. La especificación y la hoja de ruta contienen objetivos futuros; no son evidencia de implementación.

## Qué es Kiwanto

Kiwanto es una aplicación local para organizar y lanzar videojuegos. El frontend React/TypeScript se ejecuta dentro de Tauri 2; Rust ofrece comandos acotados mediante Tauri IPC y administra SQLite y operaciones del sistema. No se verificó ninguna integración con cuentas o tiendas externas.

## Estado por capacidad

| Capacidad | Estado | Alcance real y límites | Código principal |
|---|---|---|---|
| Biblioteca persistente | **IMPLEMENTADO** | Alta, consulta, edición, favoritos, archivado, restauración y eliminación permanente protegida. La eliminación permanente solo acepta entradas archivadas; no borra archivos de usuario. | `src-tauri/src/library.rs`, `src/library/service.ts`, `src/App.tsx` |
| Colecciones manuales | **IMPLEMENTADO** | Nombre, descripción opcional, edición, consulta, asociaciones múltiples y eliminación independiente de juegos; se consumen en ambos modos. | `src/components/CollectionsPage.tsx`, `src/components/BigPicture.tsx`, `src-tauri/src/library.rs` |
| Relaciones entre juegos | **IMPLEMENTADO** | Relaciones tipadas persistidas y vista compartida; la presentación visual tiene asuntos pendientes en [KNOWN_ISSUES.md](KNOWN_ISSUES.md). No equivale a una entidad de franquicia. | `src/components/GameRelationsView.tsx`, `src/app/gameRelations.ts`, `src-tauri/src/library.rs` |
| Taxonomía | **PARCIAL** | Géneros/subgéneros canónicos y selección por IDs. Las etiquetas personales existen en el modelo SQLite pero su gestión completa de usuario no está expuesta en la UI. Los términos libres anteriores pueden conservarse como pendientes. | `src/components/GenreMultiSelect.tsx`, `src-tauri/src/library.rs`, [TAXONOMY_AND_FILTERS.md](TAXONOMY_AND_FILTERS.md) |
| Búsqueda y filtros | **PARCIAL** | Texto y prefijos `@` existentes para algunos géneros, plataformas/sistemas, favoritos e instalación derivada. No representa el sistema avanzado de facetas de la especificación. | `src/library/search.ts`, `src/components/GameSearch.tsx` |
| Instalaciones y proveedores | **PENDIENTE** | Hay tablas/modelos preparados, pero no gestión funcional de instalaciones ni importadores Steam, Heroic, Lutris, Bottles o emuladores. El estado `installed` se deriva de una instalación disponible si existe. | `src-tauri/src/library.rs`, `src/library/models.ts` |
| Perfiles y lanzamiento local | **PARCIAL** | Un perfil manual persistente por juego permite ejecutable, argumentos separados y directorio de trabajo; Rust inicia el proceso mediante `std::process::Command` a petición explícita. No hay integración externa, selección/importación avanzada de instalaciones, seguimiento de vida del proceso ni sesiones/tiempo de juego verificados. | `src/components/GameLaunchControl.tsx`, `src/library/service.ts`, `src-tauri/src/library.rs` |
| Desktop Mode | **IMPLEMENTADO** | Biblioteca, ficha, editor, favoritos, colecciones, relaciones, configuración básica y operaciones persistentes disponibles. Estadísticas y complementos no están implementados. | `src/App.tsx`, `src/components/` |
| Big Picture | **PARCIAL** | Composición separada con biblioteca, favoritos, colecciones, búsqueda, detalle, lanzamiento, edición, relaciones y preferencias básicas persistidas. Usa servicios compartidos. Hay navegación por teclado; no hay integración de gamepad comprobada ni paridad completa de capacidades, estado/foco entre modos o validación en televisores/hardware objetivo. | `src/components/BigPicture.tsx`, `src/app/bigPictureNavigation.ts`, `src/app/navigationInput.ts` |
| Preferencia de tema | **PARCIAL** | Dos temas integrados; identificador guardado en JSON local versionado. Big Picture tiene ajustes básicos propios persistidos. No existen motor completo, editor/importación de temas, perfiles de interfaz persistidos ni composición reconfigurable. | `src/themes/`, `src/preferences/userPreferences.ts`, `src-tauri/src/user_preferences.rs` |
| Artwork y contenido enriquecido | **PENDIENTE** | Hay fixtures de recursos gráficos y representación de descripción; no está implementada la gestión general de artwork ni bloques persistentes de imagen/GIF/video/documentos. | `src/components/GameDescriptionView.tsx`, `src/library/description.ts`, `src-tauri/src/library.rs` |
| Respaldo y restauración | **PENDIENTE** | No afirmar disponibilidad operativa: hay requisitos documentados, pero no flujo completo verificado. | [DATABASE_AND_BACKUP.md](DATABASE_AND_BACKUP.md) |

Los seis registros en `src/data/games.ts` son fixtures de desarrollo y no se cargan en SQLite como datos del usuario. No confundir los recursos de muestra con artwork administrable por el usuario.

## Persistencia y arquitectura actuales

- `src-tauri/src/lib.rs` registra comandos Tauri para biblioteca, taxonomía, colecciones, relaciones, perfiles/lanzamiento y preferencias.
- `src-tauri/src/library.rs` reúne el esquema/migraciones SQLite, validaciones, transacciones y servicios de biblioteca. Las claves foráneas y restricciones de unicidad protegen las asociaciones; eliminar una colección no elimina juegos.
- `src/library/service.ts` es el límite tipado del frontend y utiliza `invoke`; React no accede directamente a SQLite ni ejecuta procesos.
- La base se ubica bajo el directorio de datos resuelto por Tauri (`kiwanto/library.sqlite3`); preferencias versionadas, en `~/.config/kiwanto/preferences.json`.
- `src/App.tsx` coordina datos y cambio de presentación. Big Picture y Desktop usan la misma biblioteca persistida, no catálogos separados.
- Las tablas de instalaciones, referencias de gestores, etiquetas, perfiles y recursos superan las operaciones que la interfaz ofrece hoy. La existencia de una tabla no equivale a una funcionalidad terminada.

### Comandos Tauri registrados

`src-tauri/src/lib.rs` registra los siguientes grupos de comandos (las firmas y validaciones concretas están en sus módulos):

- **Biblioteca y taxonomía:** `list_library`, `list_canonical_genres`, `record_pending_taxonomy_term`, `create_library_entry`, `update_library_entry`, `set_library_favorite`, `archive_library_entry`, `restore_library_entry`, `delete_library_entry_permanently`.
- **Colecciones:** `list_collections`, `list_collection_games`, `create_collection`, `update_collection`, `delete_collection`, `add_game_to_collection`, `remove_game_from_collection`, `get_game_collections`.
- **Lanzamiento:** `get_launch_profile`, `save_launch_profile`, `launch_game`.
- **Relaciones:** `list_game_relations`, `add_game_relation`, `remove_game_relation`, `replace_game_relations`.
- **Preferencias:** `load_user_preferences`, `save_user_preferences`.

No hay comandos registrados para importación de proveedores, CRUD de instalaciones, detección de procesos/sesiones, backup/restore, colecciones inteligentes o franquicias.

### Modo, tema, perfil y preferencias

La decisión aprobada en [DECISIONS.md](DECISIONS.md) separa estos conceptos: el **modo** define la experiencia activa; el **tema** aporta identidad visual y valores de plantilla; el **perfil** puede seleccionar tema y ajustes compatibles; las **preferencias** guardan elecciones del usuario. La precedencia acordada es: contrato del modo y límites de seguridad/accesibilidad; valores predeterminados de variante de tema; ajustes explícitos de perfil; preferencias globales del usuario y, por último, preferencias específicas del modo, que prevalecen solo en ese modo. Seleccionar un perfil no cambia el modo por sí solo y ningún cambio sobrescribe silenciosamente preferencias incompatibles. Esta es la regla arquitectónica aprobada; el motor que la aplique de forma completa aún está pendiente.

## Pruebas y herramientas disponibles

En el checkout hay pruebas frontend Node para operaciones/modelos, selector de géneros y navegación de Big Picture; Rust contiene pruebas unitarias en `library.rs` y `user_preferences.rs`.

```bash
npm run dev
npm run build
npm test
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
git diff --check
```

Estos comandos describen verificaciones disponibles; **no se ejecutaron durante esta actualización documental**, así que no se afirma un resultado de aprobación actual.

La inspección visual reciente del editor usó Vite y Firefox headless a 1600 × 1100 con un mock temporal de Tauri. La revisión reportó ajustes al alineado de año/puntuación y a la franja del scrollbar; ese método es útil para CSS, pero no sustituye la prueba en la ventana Tauri, WebKitGTK ni una validación Wayland nativa. El registro y su límite constan en [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## Próximo orden recomendado

1. Resolver los defectos visuales reportados y validados por el usuario, respetando la pausa explícita de desplegables.
2. Completar una validación funcional reproducible de Desktop y Big Picture con la misma base, incluidos estados vacíos, errores, foco y lanzamiento manual.
3. Cerrar los contratos compartidos pendientes de estado y navegación por teclado/mando; probar el gamepad en WebKitGTK antes de declarar soporte.
4. Priorizar después las operaciones de instalaciones que habiliten necesidades concretas; no bloquear Big Picture por integraciones externas completas.
5. Implementar capacidades avanzadas de biblioteca y el motor de personalización solo siguiendo [ROADMAP.md](ROADMAP.md) y [DECISIONS.md](DECISIONS.md). Big Picture funcional y validado precede al motor completo (DEC-055).

El backlog detallado y las cuestiones deliberadamente pausadas están en [KNOWN_ISSUES.md](KNOWN_ISSUES.md). Esta fotografía debe actualizarse después de contrastar el código y el estado local del repositorio.
