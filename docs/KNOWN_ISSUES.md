# Problemas conocidos y backlog

Este registro conserva asuntos comunicados por el usuario y trabajo futuro. Los puntos visuales H1–H6 son reportes pendientes de una nueva comprobación en ejecución; no se presentan como verificados en esta auditoría. No modificar la apariencia de desplegables mientras H6 siga pausado.

## Problemas visuales reportados

### H1 — Relaciones en Desktop Mode

**Estado: PENDIENTE.** Se reporta que la sección de relaciones queda fija sobre la interfaz al desplazar la descripción.

Deseado: mantenerla en el flujo normal de la ficha, después del contenido descriptivo, sin superponer ni recortar texto durante el scroll.

### H2 — Relaciones en Big Picture

**Estado: PENDIENTE.** Se reporta que las relaciones ocupan demasiado espacio al final de la ficha.

Deseado: presentación compacta y adaptable a la derecha de Jugar/Editar; miniaturas menores; eliminar marcos grises o contenedores que generen recorte; evitar que la descripción se desplace detrás del panel.

### H3 — Proximidad y alineación de Editar

**Estado: PENDIENTE.** En Desktop, Editar se reporta demasiado lejos de Jugar. En Big Picture se reporta separado y más abajo. Agrupar y alinear ambos controles en cada composición.

### H4 — Favoritos en Big Picture

**Estado: PENDIENTE.** El reporte describe un control de favoritos debajo de Editar. Reubicarlo como acción discreta y contextual (por ejemplo, un corazón accesible en una esquina de la ficha) y evitar duplicados. El estado actual del componente debe revisarse antes del cambio.

### H5 — Favoritos en Desktop Mode

**Estado: PENDIENTE.** Revisar el corazón reportado como demasiado alejado del foco de interacción; conservar una acción accesible, discreta y no dominante.

### H6 — Apariencia de menús desplegables

**Estado: PAUSADO deliberadamente por el usuario.** Algunos desplegables se reportaron blancos y con aspecto genérico. El selector de géneros canónicos de `src/components/GenreMultiSelect.tsx` sirve de referencia visual.

No volver a intentar este ajuste ni modificar la apariencia de desplegables hasta que el usuario lo retome. Los intentos previos se describieron como fallidos, pero esta auditoría no verificó sus detalles ni autoría.

### H7 — Límite de la validación visual del editor

**Estado: PARCIAL.** La última inspección reportada utilizó Firefox headless a 1600 × 1100, Vite y un mock temporal de Tauri. Se reportó una corrección en `src/styles.css` para alinear año/puntuación y reducir la franja blanca del scrollbar; también se informó que build, pruebas frontend y `git diff --check` pasaron en aquella iteración. No se puede reconstruir ni atribuir ese cambio a partir del historial disponible: el árbol fuente aparece sin seguimiento en este checkout. Firefox no valida el WebView de Tauri/WebKitGTK ni el renderizado nativo Wayland. Repetir una validación visual en el entorno objetivo antes de darla por cerrada.

### H8 — Editor de descripción y contenido enriquecido

**Estado: PARCIAL / PLANIFICADO.** El editor actual maneja descripción de texto, y existen representación/estructuras TypeScript relacionadas (`src/library/description.ts`, `src/components/GameDescriptionView.tsx`). SQLite conserva la descripción como texto; no se verificó persistencia de bloques enriquecidos. Imágenes entre párrafos, GIF, video, editor enriquecido/redimensionable y una futura composición guiada tipo Canva están pendientes. No implementar un lienzo libre que permita superposiciones ilegibles: las decisiones aprobadas requieren contratos semánticos, límites, accesibilidad y seguridad. Los manuales/documentos adjuntos también son futuros y deben cargarse solo al abrirse; no mezclarlos con colecciones.

## Pendientes funcionales y de validación

- **PENDIENTE:** validar Big Picture en la app Tauri real con teclado, resoluciones y aspecto de TV; gamepad y WebKitGTK requieren dispositivos/versiones objetivo.
- **PENDIENTE:** verificar persistencia y recuperación entre cambios de modo para foco, sección, colección, filtros y juego seleccionado según contratos aprobados.
- **PENDIENTE:** administración de instalaciones, importadores/proveedores externos, seguimiento de procesos/sesiones, estadísticas y respaldo/restauración.
- **PENDIENTE:** gestión completa de etiquetas personales y artwork de usuario; colecciones inteligentes, franquicias y contenido editorial.
- **PENDIENTE:** editor/paquetes de temas, perfiles de interfaz persistidos y motor de composición. Big Picture se implementa y valida antes del motor completo (DEC-055).
- **PENDIENTE:** localización completa y revisión de cadenas de interfaz.

Estas tareas no hacen que Steam, Heroic, Lutris, Bottles, todos los emuladores, importación avanzada de ROMs o personalización completa sean requisitos previos de Big Picture. Respetar el orden de etapas A–D y fases de [ROADMAP.md](ROADMAP.md).
