# Transferencia de contexto para Copilot/Codex

## Empezar aquí

1. Lee [README.md](README.md), [PROJECT_STATUS.md](PROJECT_STATUS.md) y [KNOWN_ISSUES.md](KNOWN_ISSUES.md).
2. Revisa [ROADMAP.md](ROADMAP.md) y [DECISIONS.md](DECISIONS.md) antes de proponer cambios de alcance o secuencia.
3. Inspecciona `git status`, diffs y los archivos afectados antes de editar. El código y el estado actual del checkout son la fuente de verdad para implementación; la documentación describe contratos, intención y backlog.

## Contexto operativo

Kiwanto es una app Tauri 2 con React 19, TypeScript, Vite, Rust y SQLite. Rust expone servicios por Tauri IPC; `src/library/service.ts` encapsula las llamadas desde React. La biblioteca persistente, colecciones manuales, relaciones, favoritos, archivado, perfiles de lanzamiento locales y una primera composición de Big Picture existen. Las limitaciones y estados exactos están en [PROJECT_STATUS.md](PROJECT_STATUS.md); no inferir implementación a partir de tablas o requisitos.

Para desarrollo y verificaciones, consultar [TESTING_AND_CONTRIBUTING.md](TESTING_AND_CONTRIBUTING.md) y ejecutar `npm run dev`, `npm run build`, `npm test`, `cargo test --manifest-path src-tauri/Cargo.toml`, `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` y `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` según el cambio. Inspección CSS en navegador no sustituye WebKitGTK/Tauri; indicar explícitamente si no se dispuso de visualización real.

## Decisiones y límites que conservar

- La biblioteca es local y las operaciones persistentes pasan por Rust/SQLite. Mantener identidad, instalaciones, colecciones, taxonomía y preferencias como conceptos separados.
- Colección manual, colección inteligente y franquicia son entidades/funciones distintas. Una colección manual no cambia ni elimina juegos al borrarse.
- Los prefijos de búsqueda y géneros actuales son parciales; no llamarlos sistema avanzado completo.
- El lanzamiento solo ocurre por acción explícita y el frontend no construye comandos de shell. No declarar procesos/sesiones monitorizados.
- Desktop y Big Picture comparten servicios y datos. Big Picture tiene alcance inicial funcional, pero su validación/paridad y soporte gamepad no están cerrados.
- **Modo** elige la experiencia; **tema** ofrece identidad/valores de plantilla; **perfil** reúne ajustes compatibles; **preferencias** guardan elecciones personales. Resolver según DEC-047: modo/seguridad y accesibilidad fijan límites, perfil aporta ajustes y las preferencias personales prevalecen; las específicas del modo prevalecen sobre las globales solo en ese modo. No borrar preferencias incompatibles silenciosamente.
- Big Picture debe quedar implementado y validado antes del motor completo de personalización (DEC-055). No adelantar integraciones externas como requisito previo sin una dependencia demostrada.
- Los desplegables están **PAUSADOS** (H6). No tocar su aspecto hasta que el usuario lo solicite.

## Trabajo visual pendiente

Antes de modificar un punto visual reportado en [KNOWN_ISSUES.md](KNOWN_ISSUES.md), confirmar que sigue presente en la interfaz actual. H1–H5 son reportes del usuario sobre relaciones, acciones Editar/Jugar y favoritos; H6 permanece pausado; H7 documenta el límite de Firefox headless; H8 distingue el texto actual de un editor multimedia futuro. No implementar ninguno dentro de una tarea documental.

## Preservación del checkout

Al realizar esta transferencia, había numerosos archivos modificados y sin seguimiento preexistentes en la raíz, `src/`, `src-tauri/` y `docs/`. No se intentó limpiarlos ni atribuir su origen: parte del código fuente no aparece en el historial Git local porque está sin seguimiento. Antes de cambiar un archivo ya modificado, leer su contenido/diff y conservar los cambios ajenos. No revertir, reemplazar en bloque, hacer commits ni push salvo instrucción explícita del usuario.

## Cómo registrar avances

Actualizar estado solo después de inspeccionar la implementación y verificaciones pertinentes. Etiquetar **IMPLEMENTADO**, **PARCIAL**, **PLANIFICADO**, **PAUSADO** o **PENDIENTE**. Si el estado no puede verificarse (por ejemplo, entorno visual o dispositivo ausente), declararlo como limitación y no como validación exitosa. Mantener las especificaciones futuras separadas de los informes del código real y enlazar entre documentos en lugar de duplicar decisiones.
