HOJA DE RUTA

## Orden de desarrollo acordado

Las etapas A–D representan el orden estratégico y las prioridades generales del proyecto. Las fases numeradas del 0 al 14 desglosan ese trabajo en hitos y tareas de implementación. Deben respetar el orden y las dependencias establecidos por A–D; la numeración detallada no autoriza adelantar trabajo perteneciente a una etapa estratégica posterior. En particular, Big Picture funcional debe implementarse y validarse antes de comenzar el motor de personalización completo.

### Fase A — Consolidación arquitectónica y documental

Definir responsabilidades y contratos compartidos, límites de seguridad, recursos, criterios de aceptación y preparación de Big Picture. Esta etapa documental se considera cerrada con la presente actualización: la documentación distingue tema, perfil, modo y preferencias con su precedencia; separa los subsistemas visuales y los dominios de medios; define paquetes declarativos seguros y ciclo de vida medible de recursos; fija estado compartido y composición independiente por modo; y declara las acciones semánticas y criterios de aceptación de Big Picture. La consolidación no implica que esos mecanismos estén implementados.

### Fase B — Big Picture funcional

Después de que la biblioteca persistente, los servicios compartidos y el lanzamiento local básico sean suficientemente estables, implementar Big Picture como experiencia completa que reutiliza esas capacidades. La primera versión no esperará integraciones externas pendientes ni el motor de personalización.

### Fase C — Motor de personalización completo

Con Desktop Mode y Big Picture funcionales, implementar los subsistemas visuales, componentes, composición, recursos, caché, perfiles, temas, importación/exportación y editor. La preparación de contratos puede hacerse antes; la implementación completa permanece después de la Fase B.

### Fase D — Evolución

Ampliar temas y recursos, contenido enriquecido de juegos y colecciones, manuales/documentos bajo demanda, música local opcional, franquicias, colecciones inteligentes, IA editorial, accesibilidad, integraciones y otras capacidades cuando sus requisitos y dependencias estén validados. Ninguna de estas capacidades es requisito previo de Big Picture.

La aceptación de Big Picture exige navegación utilizable mediante mando y teclado, biblioteca, búsqueda/filtros disponibles, selección y fichas, favoritos/colecciones disponibles, menús contextuales, lanzamiento mediante servicios existentes, configuración y retorno a Desktop Mode. Los destinos cuya función aún no exista deben indicarlo claramente y no simular resultados. La estabilidad y las regresiones se validarán sin convertir integraciones externas pendientes en requisito para esta primera versión.

## Fase 0 — Especificación
Objetivos:

- Definir arquitectura.
- Definir tecnologías.
- Definir seguridad.
- Definir modelo de biblioteca.
- Definir documentación.
Estado:

La documentación base y las interfaces Desktop Mode y Big Picture están presentes. La biblioteca SQLite, las colecciones manuales, las relaciones entre juegos y el lanzamiento local básico tienen operaciones implementadas; el producto completo, la paridad entre modos y las validaciones de hardware objetivo siguen pendientes. Véase [PROJECT_STATUS.md](PROJECT_STATUS.md) para el alcance comprobado.

## Fase 1 — Prototipo de escritorio e interfaz básica
Objetivos:

- Mantener una ventana Tauri funcional y una base de frontend React.
- Establecer la estructura del modo escritorio con barra de navegación global, columna de biblioteca/búsqueda y área principal como zonas independientes.
- Definir los destinos iniciales de la barra global y dejarla ampliable para secciones futuras.
- Definir la composición inicial del área principal para presentar el juego seleccionado, sin convertirla en una cuadrícula general de juegos.
- Validar el flujo de desarrollo y compilación en Linux.
- Iniciar la validación técnica de un paquete `.deb` de desarrollo, incluyendo instalación y funcionamiento básico en un entorno de prueba. Esto no constituye una distribución estable ni implica que el empaquetado ya esté implementado.

Esta fase no implementa por adelantado la biblioteca completa ni el sistema avanzado de personalización.

El repositorio contiene código de este prototipo, pero la presencia de código no demuestra que su comportamiento haya sido validado en los equipos objetivo.

## Fase 2 — Biblioteca funcional

**Estado actual: primera versión funcional de persistencia implementada; la Fase 2 continúa incompleta.** La biblioteca se inicializa vacía, permite crear y editar entradas manuales, favoritos, archivado, restauración y eliminación permanente protegida. Los seis juegos de demostración permanecen como fixtures y no se insertan en la base del usuario. Las colecciones manuales básicas también están implementadas con persistencia SQLite y gestión desde Desktop Mode; siguen pendientes las instalaciones, proveedores, etiquetas, imágenes, metadatos externos, estadísticas, filtros avanzados y respaldo/restauración. Las portadas/fondos propios, el orden personalizado y las presentaciones editoriales de colecciones son capacidades futuras.

Objetivos:

- Definir el modelo de biblioteca y su persistencia local en SQLite.
- Crear y editar entradas manualmente.
- Búsqueda.
- Filtros.
- Colecciones manuales persistentes (primera versión implementada; véase el estado anterior). Las colecciones inteligentes y las franquicias quedan para etapas posteriores.
- Etiquetas.
- Gestión de imágenes.
- Metadatos.
- Estadísticas básicas.
- Mostrar la biblioteca en lista compacta o en filas de carátulas que se adapten al ancho disponible.
- Mantener diferenciadas la identidad del juego, sus datos y sus instalaciones; permitir información introducida manualmente y conservar procedencia de metadatos cuando se incorporen fuentes.
- Planificar imágenes de juegos como archivos locales independientes, con referencias y metadatos estructurados; definir validación, atribución y ciclo de vida antes de implementar importación o descarga.
- Permitir agrupar por plataforma, contraer grupos o mostrar todos los juegos sin agrupar.
- Mantener los géneros disponibles como criterios de búsqueda y filtrado, sin exigirlos como categorías permanentes.
- Presentar en el área principal el juego seleccionado, su imagen artística disponible, carátula, descripción y metadatos disponibles.
- Incorporar búsqueda con prefijos `@` y combinación extensible de criterios.
- Proporcionar colecciones manuales persistentes con nombre, descripción, asociaciones múltiples, consulta, edición y eliminación independiente de los juegos.
- Ofrecer una interfaz de biblioteca funcional que sirva de base para validar paneles y vistas.
- Integrar progresivamente menús contextuales de biblioteca con acciones pertinentes al elemento y capacidades disponibles, una vez implementadas las operaciones correspondientes.

Las estadísticas básicas de biblioteca (por ejemplo, conteos o resúmenes derivados de los datos disponibles) forman parte de esta fase y no requieren por sí solas seguimiento de procesos. El seguimiento avanzado de procesos, sesiones y tiempo de juego medido por Kiwanto es una capacidad distinta, sujeta a la validación de lanzamiento, detección y sus dependencias; no debe inferirse de un intento de lanzamiento ni de una duración estimada o dato importado.

### Secuencia incremental del trabajo de biblioteca

- **Extracción de lógica compartida — completada en el prototipo:** `src/library/` contiene modelos TypeScript, consulta/filtros, selección entre resultados visibles y la operación de alternar favoritos. La capa cuenta con pruebas unitarias; `App.tsx` coordina el estado en memoria. Esto no completa la biblioteca funcional ni añade persistencia.
- **Documentación de arquitectura y decisiones — completada con esta actualización:** se describe el alcance real de la capa, sus límites y los requisitos futuros de menús contextuales y revisión de metadatos.
- **Modelo conceptual y taxonomía — definidos:** la edición es el elemento de biblioteca; obras, lanzamientos, variantes e instalaciones son entidades distintas. La taxonomía canónica admite un DAG y las etiquetas personales son independientes.
- **Persistencia SQLite — primera versión implementada:** Rust administra la base, las migraciones y las operaciones manuales; TypeScript usa comandos Tauri tipados. Colecciones manuales y perfiles locales básicos de lanzamiento están implementados; la gestión de instalaciones, proveedores e imágenes sigue pendiente.
- **Siguiente etapa:** completar las operaciones de biblioteca restantes que bloqueen el uso de Big Picture, según sus dependencias, sin adelantar el sistema avanzado de facetas ni las integraciones externas.

Esta secuencia detalla dependencias de trabajo dentro de la hoja de ruta sin cambiar el orden general de sus fases. Completar la extracción o esta documentación no marca la Fase 2 como terminada.

Las fases 0–2 son la base de especificación, prototipo de escritorio y biblioteca persistente. La secuencia prioritaria futura conserva la definición de ambos modos, los contratos compartidos, la arquitectura común, el lanzamiento local básico, el prototipo de Big Picture y la validación de entrada, antes de completar la personalización. Los contratos del motor se prepararán antes de implementar recursos/composición; la implementación completa de la personalización de paneles y preferencias dependerá de que esos mecanismos estén disponibles. Las capacidades y fases siguientes son objetivos, no funciones implementadas. Las funciones de biblioteca de la Fase 2 que sigan pendientes continuarán de acuerdo con sus dependencias y sin reemplazar el modelo aprobado.

## Fase 3 — Definición y documentación de ambos modos
Objetivos:

- Documentar Desktop Mode y Big Picture / TV Mode, sus usuarios, composiciones y estados, distinguiendo lo existente de lo planificado.
- Definir Big Picture como una experiencia propia, no como escritorio ampliado.
- Fijar principios de navegación global, biblioteca y presentación del juego, legibilidad a distancia, estados y accesibilidad.
- Registrar necesidades de investigación para el WebView, WebKitGTK y mandos sin seleccionar dependencias.

Esta definición arquitectónica se documenta ahora; no implementa un modo TV.

## Fase 4 — Consolidación de contratos de navegación, estado e interacción
Objetivos:

- Especificar destinos globales semánticos comunes y su presentación adaptable a cada modo.
- Definir qué contexto se comparte (selección, búsqueda/filtros, colección/sección y operaciones) y qué estado es propio del modo (desplazamiento, foco y composición).
- Definir navegación por teclado/mando/ratón, selección, confirmar, volver/cancelar, listas/tarjetas, menús y recuperación del foco.
- Definir comportamiento y foco para menús, diálogos, errores, notificaciones y cambio de modo.
- Revisar conflictos de `Ctrl+Shift+B`, campos editables y remapeo futuro.
- Concretar criterios de accesibilidad y pruebas antes de implementar los contratos.

## Fase 5 — Preparación de la arquitectura compartida
Objetivos:

- Mantener una única identidad y fuente de verdad para juegos, instalaciones, metadatos, recursos, colecciones, favoritos, estadísticas, perfiles de lanzamiento, historial y preferencias.
- Definir contratos para proveedores de datos y distinguirlos de integraciones de plataforma y complementos funcionales; conservar procedencia y resoluciones de conflicto sin sobrescrituras manuales silenciosas.
- Definir los requisitos de localización nativa de la interfaz como preferencia general, separada de temas, complementos y traducciones de contenido.
- Separar responsabilidades compartidas de aplicación/dominio de las composiciones React específicas de cada modo, sin duplicar búsqueda, filtros, acciones ni reglas de negocio.
- Definir contratos para estado compartido, estado de presentación por modo y operaciones en curso, con recuperación de estado inválido.
- Distinguir modo, tema, composición y perfil de interfaz y planificar preferencias versionadas sin persistir estado efímero de foco.
- Preservar la interfaz de escritorio existente como referencia funcional; no reemplazarla ni introducir un framework de estado/layout sin necesidad demostrada.
- Mantener la lógica de consulta, selección y operaciones de biblioteca en una capa reutilizable sin dependencias de una composición concreta; la extracción inicial del prototipo está realizada y no sustituye los contratos de la biblioteca definitiva.

## Fase 6 — Lanzamiento local básico sobre biblioteca persistente
Objetivos:

- Depender de la biblioteca persistente de la Fase 2; completar o verificar sus operaciones persistentes necesarias para asociar un juego con un perfil manual de lanzamiento antes de habilitar el flujo.
- Permitir que el usuario seleccione explícitamente un ejecutable local y configure uno o más perfiles de lanzamiento manuales.
- Admitir argumentos como elementos separados, directorio de trabajo y variables de entorno por perfil; mantener separados ejecutable, argumentos, directorio y entorno.
- Validar las rutas y comunicar claramente ejecutables inexistentes, inaccesibles, argumentos inválidos y errores de invocación. No sustituir rutas o perfiles silenciosamente.
- Invocar procesos mediante APIs seguras, sin concatenar comandos de shell y sin requerir privilegios de root; iniciar únicamente por acción explícita del usuario.
- Mantener diferenciados el intento de lanzamiento, el resultado de invocar/crear el proceso, la detección posterior del proceso y el seguimiento de una sesión. El resultado de invocación no afirmará por sí mismo que el juego está ejecutándose.
- Limitar esta fase al lanzamiento local manual: no implementar integraciones externas ni seguimiento avanzado de procesos o sesiones.

Esta fase antecede a Big Picture para que su prototipo pueda usar tanto datos de demostración como la biblioteca persistente y el flujo de lanzamiento local cuando estén disponibles.

## Fase 7 — Implementación funcional de Big Picture / TV
Objetivos:

- Implementar una composición TV independiente que consuma las mismas capacidades y datos que el modo escritorio.
- Incorporar navegación global visible, biblioteca de tarjetas/portadas y ficha de juego adaptada, conservando las diferencias entre navegación, biblioteca y presentación.
- Proporcionar entradas a colecciones, favoritos, estadísticas y ajustes; representar honestamente las funciones que aún no estén implementadas.
- Cubrir menús, diálogos, confirmaciones, notificaciones y estados vacíos, de carga y error.
- Adaptar el diseño a distintas resoluciones y proporciones y medir legibilidad/targets a distancia.
- Mantener teclado y ratón utilizables desde el primer prototipo.
- Conservar fixtures de demostración para desarrollo sin insertarlos en la base del usuario, y añadir pruebas de flujo con juegos reales cuyos ejecutables hayan sido configurados explícitamente mediante la Fase 6. Las pruebas automatizadas no ejecutarán juegos arbitrarios; las pruebas con juegos reales serán controladas, explícitas y apropiadas para verificación manual.
- No adelantar integraciones externas, seguimiento avanzado de procesos ni el motor de personalización.
- Usar las colecciones manuales existentes mediante los mismos servicios y datos compartidos; no depender de portadas personalizadas, presentaciones editoriales, colecciones inteligentes, franquicias ni del editor visual.

## Fase 8 — Validación de navegación por teclado, ratón y mandos
Objetivos:

- Probar en Linux la Gamepad API del WebView Tauri/WebKitGTK en las versiones de las distribuciones objetivo.
- Evaluar mandos USB y Bluetooth, conexión/desconexión, reconexión, mapeos estándar/no estándar, botones, ejes, repetición, zona muerta, foco y latencia.
- Validar selección del mando principal y uso con múltiples mandos conectados, indicadores de botones según el dispositivo y necesidades de reasignación.
- Validar teclado, ratón, accesibilidad, menús modales/no modales, volver/cancelar y recuperación del foco en ambos modos.
- Verificar operación sin privilegios elevados y definir pruebas de regresión para dispositivos/versiones soportados.
- Adoptar una dependencia o puente nativo solo si las pruebas demuestran una necesidad y la decisión de permisos/mantenimiento se aprueba.

La aceptación funcional y de navegación de las fases 7–8 cierra la Etapa B. La Fase 9 y la implementación completa de personalización no comienzan hasta validar esta puerta.

## Fase 9 — Contratos y modelos del motor de personalización
Objetivos:

- Consolidar los contratos de temas, tokens, regiones, composiciones y perfiles ya representados parcialmente en el modelo actual.
- Distinguir modo, variante de tema, plantilla de composición, preferencias personales, preferencias globales y específicas de vista, y perfil de interfaz.
- Definir modelos, validación, compatibilidad y tratamiento de versiones para ambos modos, incluida la resolución explícita y localizada de preferencias incompatibles al cambiar de tema.
- Definir límites de componentes y estados funcionales/accesibles que los temas no pueden eliminar.
- Definir plantillas reutilizables como estructuras distintas de temas, perfiles y preferencias; no hacer de estas plantillas ni del editor una dependencia de Big Picture.
- Preparar los contratos de preferencias y persistencia versionada sin implementar todavía el editor ni la personalización completa de paneles.

Esta fase establece contratos y estructuras de datos; no implementa capacidades que dependan del sistema de recursos o del renderizador de composiciones.

## Fase 10 — Implementación de recursos, regiones y composición declarativa
Objetivos:

- Gestionar referencias y recursos visuales locales por tema, variante, modo y región; permitir reutilización cuando sea compatible.
- Validar formatos, rutas, dimensiones, resolución, tamaños y cantidades; optimizar carga y escalado.
- Definir caché acotada, invalidación y ciclo de vida para recursos y resultados derivados.
- Implementar regiones y composición declarativa para posiciones, tamaños, proporciones, orden y alineación de componentes permitidos en cada modo.
- Soportar variantes de temas para escritorio y TV, recursos y fondos por región, y ejemplos como bibliotecas transparentes, navegación con identidad propia y distintas distribuciones de carátula/metadatos.
- Evaluar extracción de colores dominantes, fondos/degradados adaptativos, oscurecimiento, blur, transparencias, sombras, transiciones, sonidos y pantallas de carga sin hacerlos requisitos.
- Medir costos de GPU/memoria y respuesta en equipos modestos; ofrecer reducción de efectos, movimiento reducido y alternativas legibles.
- Validar React, Tauri, WebKitGTK y Linux antes de adoptar tecnología adicional; la interfaz no dependerá de servicios de red para sus recursos.
- Crear temas locales de demostración diversos para probar coherencia, accesibilidad y dimensiones de ventana, sin copiar diseños o recursos de terceros.

## Fase 11 — Motor de personalización completo para ambos modos
Objetivos:

- Implementar personalización independiente de las regiones y paneles que los contratos y la composición de la Fase 10 admitan.
- Permitir mostrar, ocultar y redimensionar paneles compatibles, con límites definidos; no ofrecer controles para capacidades inexistentes.
- Aplicar y persistir preferencias globales, por modo y por vista con validación versionada.
- Conservar las preferencias personales compatibles al cambiar de tema; cuando una preferencia concreta no sea compatible, ofrecer la resolución explícita definida en la Fase 9 sin reemplazar toda la distribución.
- Mantener selección, desplazamiento, filtros y grupos/estantes al ocultar o recuperar la biblioteca.
- Conservar la interfaz actual como tema/base de escritorio y los estados funcionales y accesibles de los controles.

La implementación de paneles y preferencias depende de los mecanismos de recursos, regiones y composición de la Fase 10; por ello, esta fase no los anticipa.

## Fase 12 — Importación y exportación segura de temas
Objetivos:

- Definir y versionar un formato declarativo compatible con los contratos por modo.
- Validar tipo de paquete, estructura, versiones, compatibilidad, rutas, tipos de recurso, tamaños, cantidades y propiedades antes de aceptar cambios.
- Rechazar código, scripts, comandos, recursos remotos y composiciones no admitidas.
- No cambiar el modo activo ni sobrescribir perfiles, distribuciones, preferencias de biblioteca o valores ajenos al ámbito del tema.
- Evitar importaciones parciales o silenciosas, explicar incompatibilidades y probar recuperación ante paquetes inválidos.
- Identificar claramente recursos incluidos al exportar y no incluir datos de biblioteca o imágenes personales por defecto.

## Fase 13 — Editor y perfiles de interfaz
Objetivos:

- Proporcionar vista previa, edición y restauración segura de temas y composiciones admitidas.
- Editar paletas, colores, degradados, tipografía, fondos, recursos locales y efectos ya implementados.
- Guardar y duplicar temas declarativos; no mostrar opciones que el motor no soporte ni permitir código.
- Definir perfiles que combinen modo, variante de tema, composición compatible, paneles visibles y preferencias de organización/presentación.
- Permitir guardar, seleccionar, duplicar, restaurar e importar/exportar perfiles con validación de referencias y compatibilidad.
- Mantener tema y perfil como conceptos separados; importar un tema no activará un modo ni cambiará un perfil.
- Considerar capacidades de composición avanzadas después de validar los temas de demostración y los límites del editor básico.
- Ofrecer edición sencilla de una plantilla y edición avanzada de regiones, componentes y capas permitidos. La composición guiada, validación y accesibilidad protegen la integridad funcional; no se admite código arbitrario.
- Reutilizar el editor en colecciones, fichas de juegos y regiones de Desktop Mode y Big Picture; las colecciones son un caso de uso, no un subsistema exclusivo.

## Fase 14 — Integraciones y ampliaciones posteriores
Esta fase desarrolla capacidades de la Fase D y no es un requisito previo para la primera versión de Big Picture:

- Implementar integraciones independientes para Steam, Heroic, Lutris, Bottles y emuladores; las rutas de ejecutables manuales y perfiles locales corresponden a la Fase 6.
- Evaluar e implementar individualmente proveedores candidatos de metadatos e imágenes, tras verificar métodos de acceso, autenticación, cuotas, licencias, atribución, almacenamiento y uso. IGDB, LaunchBox, SteamGridDB, PlayStation Store, Wikipedia, IGN y fuentes comunitarias son candidatos de investigación, no integraciones confirmadas.
- Implementar el diálogo de búsqueda de metadatos con selección de proveedores disponibles y aplicación revisable por campo; conservar la precedencia de cambios manuales y no confundir este flujo con la búsqueda común de imágenes.
- Diseñar adaptadores para datos descargables e importaciones locales autorizadas, incluidos posibles archivos XML/paquetes de LaunchBox solo si su disponibilidad, formato y condiciones vigentes se validan. La lectura de datos locales será no destructiva.
- Incorporar búsqueda común de imágenes de varios proveedores, recursos locales y atribución solo después de validar sus fuentes, derechos, formatos, límites y almacenamiento. No guardar binarios de imágenes dentro de SQLite.
- Evaluar por separado traducción opcional de contenido: tecnología local candidata como Bergamot, posibles servicios en línea como Google Cloud Translation o Microsoft Translator, y métodos comunitarios experimentales. Ninguna opción se presume gratuita, disponible, autorizada o seleccionada.
- Evaluar e implementar, cuando sus dependencias estén validadas, el seguimiento avanzado de procesos, sesiones y tiempo de juego medido por Kiwanto, manteniendo diferenciados el intento, la invocación, la detección del proceso y la sesión. No duplicar aquí las estadísticas básicas contempladas en la Fase 2.
- Completar historial, sesiones y colecciones automáticas cuando sus dependencias estén disponibles.
- Evaluar contenido editorial, manuales y documentos de carga bajo demanda, música local opcional y generación editorial mediante IA bajo solicitud explícita únicamente en las etapas posteriores de evolución.
- Diseñar puntos de extensión visual, compatibilidad por vista, ciclo de vida, permisos y manejo de fallos. No incluye una tienda interna ni código arbitrario de complementos en la primera versión.
- Investigar localización nativa mediante archivos de idioma declarativos y validados, independiente del sistema de complementos; las traducciones comunitarias no ejecutarán código.
- Evaluar un catálogo comunitario de recursos que pueda empezar con repositorios de GitHub y admitir otros orígenes, sin convertirlo en marketplace ni habilitar instalación automática.
- Completar la validación para una distribución estable: actualizaciones, documentación de usuario y compatibilidad Linux de los paquetes soportados. Esta etapa depende de las pruebas tempranas de empaquetado de la Fase 1 y no adelanta un lanzamiento comercial ni declara implementado el empaquetado.
- Evaluar más adelante Flatpak, sincronización opcional, proveedores externos de metadatos, más integraciones, importación de bibliotecas y composición avanzada.

Cada integración y ampliación deberá conservar la independencia de la biblioteca, la seguridad, la privacidad y el uso de una única fuente de datos compartida.
