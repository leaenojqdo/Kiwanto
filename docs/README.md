# Documentación de Kiwanto

Este índice conduce a los documentos del proyecto. Para saber qué funciona hoy, empezar por [Estado del proyecto](PROJECT_STATUS.md); los documentos de arquitectura y producto describen también contratos y capacidades futuras, por lo que sus requisitos no deben confundirse con implementación.

## Estado, trabajo y transferencia

- [Estado del proyecto](PROJECT_STATUS.md): fotografía auditada del código y prioridades inmediatas.
- [Problemas conocidos y backlog](KNOWN_ISSUES.md): problemas visuales reportados, elementos pausados y capacidades pendientes.
- [Transferencia a otro asistente](ASSISTANT_HANDOFF.md): contexto y reglas prácticas para continuar el trabajo.
- [Hoja de ruta](ROADMAP.md): orden estratégico A–D y fases numeradas.
- [Pruebas y contribución](TESTING_AND_CONTRIBUTING.md): comandos y flujo de desarrollo.

## Arquitectura y datos

- [Arquitectura](ARCHITECTURE.md): límites frontend/backend, IPC y modos de interfaz.
- [Sistema de biblioteca](LIBRARY_SYSTEM.md): operaciones y reglas del catálogo.
- [Modelo de datos de biblioteca](LIBRARY_DATA_MODEL.md): entidades, relaciones e integridad.
- [Base de datos y respaldo](DATABASE_AND_BACKUP.md): SQLite, migraciones y estado del respaldo.
- [Lanzamiento de juegos](GAME_LAUNCHING.md): perfiles, invocación y requisitos pendientes.
- [Taxonomía y filtros](TAXONOMY_AND_FILTERS.md): géneros canónicos, subgéneros y búsqueda.
- [Metadatos y artwork](METADATA_AND_ARTWORK.md): procedencia y recursos visuales.
- [Localización](LOCALIZATION_AND_TRANSLATION.md): idioma de interfaz y contenido.

## Producto y decisiones

- [Especificación del proyecto](PROJECT_SPEC.md): visión y alcance del producto.
- [Decisiones](DECISIONS.md): decisiones registradas, su motivo y alcance.
- [Interfaz y temas](UI_AND_THEMES.md): contrato visual, distinción entre modo/tema/perfil/preferencias y personalización futura.
- [Sistema de complementos](PLUGIN_SYSTEM.md): límites de extensibilidad.
- [Decisión tecnológica](TECH_STACK_DECISION.md): plataforma y herramientas.
- [Referencias técnicas](TECHNICAL_REFERENCES.md): referencias consultadas.
- [Seguridad](SECURITY.md): límites de confianza y operaciones sensibles.

## Convención de estado

Los estados **IMPLEMENTADO**, **PARCIAL**, **PLANIFICADO**, **PAUSADO** y **PENDIENTE** distinguen capacidades verificadas en código de requisitos, planes y asuntos deliberadamente detenidos. La fecha de la fotografía actual es 2026-11-12; al retomar el trabajo, comprobar `git status` y contrastar el código antes de actualizarla.
