REGISTRO DE DECISIONES

## DEC-001 — Biblioteca independiente
Decisión:

La biblioteca será propiedad del usuario.

Motivo:

La aplicación no deberá depender de la existencia de los clientes externos.

## DEC-002 — Importación confirmada
Decisión:

Los escaneos generarán candidatos.

El usuario confirmará las importaciones.

Motivo:

Evitar entradas duplicadas y cambios no deseados.

## DEC-003 — No eliminar juegos automáticamente
Decisión:

La desaparición de una instalación no eliminará la entrada.

Motivo:

Preservar metadatos, imágenes y estadísticas.

## DEC-004 — Rust
Decisión:

Rust será el backend.

Motivo:

Seguridad, rendimiento y control del sistema.

## DEC-005 — Tauri 2
Decisión:

Tauri será el framework de escritorio.

Motivo:

Integración con frontend moderno y backend Rust.

## DEC-006 — React y TypeScript
Decisión:

El frontend utilizará React y TypeScript.

Motivo:

Flexibilidad y ecosistema.

## DEC-007 — SQLite
Decisión:

SQLite será la base de datos.

Motivo:

Persistencia local y funcionamiento offline.

## DEC-008 — Sin microservicios
Decisión:

La aplicación utilizará una arquitectura modular monolítica.

Motivo:

Reducir complejidad.

## DEC-009 — CSS personalizado
Decisión:

La interfaz utilizará tokens de diseño y CSS propio.

Motivo:

Facilitar personalización avanzada.

## DEC-010 — Plugins restringidos
Decisión:

Los plugins arbitrarios no estarán habilitados en la primera versión.

Motivo:

Reducir riesgos de seguridad.

## DEC-011 — Sin credenciales en primera versión
Decisión:

No se almacenarán credenciales de tiendas.

Motivo:

Evitar responsabilidad y exposición de datos sensibles.

## DEC-012 — Linux primero
Decisión:

El desarrollo inicial se centrará en Linux.

Motivo:

Reducir alcance y facilitar pruebas.

## Decisiones sobre interfaz y personalización

Las entradas siguientes distinguen requisitos aprobados de posibilidades futuras y de investigación pendiente. Registrar una idea futura no significa que esté implementada ni que su diseño técnico esté decidido.

### DEC-013 — Tema y perfil de interfaz son conceptos distintos

**Estado: Aprobada.**

Decisión:

- Un tema define identidad visual —tokens, tipografías, variantes de componentes, iconografía y recursos— y podrá declarar plantillas o valores predeterminados de composición compatibles con componentes y regiones. Esos valores no son preferencias personales del usuario.
- Un tema no contiene las preferencias personales guardadas para el usuario, como los paneles que decidió mostrar u ocultar o los tamaños específicos de su vista.
- Un perfil de interfaz seleccionable y persistente referencia un tema y puede combinarlo con ajustes explícitos de composición, paneles visibles y presentación. Puede ser compatible con uno o ambos modos, pero no elige ni cambia por sí mismo el modo activo.
- Las preferencias son valores del usuario, globales o específicos de un modo. Las específicas prevalecen sobre las globales solo en ese modo. No se sobrescriben silenciosamente al seleccionar un tema o perfil.

Motivo:

Esta separación permite que un tema cambie considerablemente la composición visual sin ejecutar código ni alterar silenciosamente las preferencias personales guardadas del usuario.

### DEC-014 — Personalización modular de paneles

**Estado: Aprobada.**

Decisión:

La interfaz deberá poder componerse de paneles independientes. En las vistas que lo permitan, el usuario podrá mostrar u ocultar paneles, redimensionar barras laterales y zonas de contenido, y guardar distintas distribuciones. Se respetarán límites mínimos y máximos, así como las restricciones propias de cada vista.

Motivo:

La personalización debe ser útil sin permitir distribuciones que oculten controles esenciales o hagan inusable una vista.

### DEC-015 — Personalización declarativa, accesible y graduable

**Estado: Aprobada.**

Decisión:

El sistema visual deberá permitir temas claros, oscuros y personalizados, y personalizar colores, paletas, degradados, transparencias, bordes, sombras, radios, tipografía y componentes. Los efectos, fondos dinámicos y sonidos deberán ser configurables, desactivables y acompañarse de opciones de accesibilidad y rendimiento.

Los temas serán declarativos y no ejecutarán código arbitrario. La configuración deberá ofrecer una presentación básica y otra avanzada.

Motivo:

La flexibilidad visual no debe comprometer seguridad, legibilidad, accesibilidad ni equipos con recursos modestos.

### DEC-016 — Importación y exportación con validación

**Estado: Aprobada como requisito; formato técnico pendiente.**

Decisión:

Los temas y perfiles de interfaz podrán exportarse e importarse mediante paquetes declarativos con metadatos, versiones y recursos claramente identificados. Los paquetes y sus rutas, versiones, configuraciones y recursos deberán validarse antes de aplicarse. La importación no ejecutará scripts ni código, no lanzará juegos y no deberá confiar en el nombre o autor declarado.

Motivo:

Compartir personalización no debe conceder permisos ni introducir contenido ejecutable o sobrescrituras silenciosas.

### DEC-017 — Complementos separados del sistema de temas

**Estado: Aprobada.**

Decisión:

Los temas son configuración de apariencia y no son complementos. La primera versión no ejecutará código arbitrario de complementos y no incluirá una tienda o repositorio interno de complementos.

**Idea futura:** un complemento podría aportar paneles, vistas o elementos visuales si existen interfaces estables y un modelo de seguridad aprobado.

Motivo:

Las extensiones funcionales tienen capacidades y riesgos diferentes de los temas declarativos.

### DEC-018 — Estructura de tres zonas para el modo escritorio

**Estado: Aprobada.**

Decisión:

El modo escritorio se organizará en tres zonas independientes: una barra lateral global y estrecha con iconos de navegación, una columna de biblioteca y búsqueda, y un área principal para presentar el juego seleccionado. La barra global y la biblioteca no se combinarán. La navegación deberá admitir secciones futuras sin requerir un rediseño completo.

La barra global incluirá accesos al modo escritorio, biblioteca, favoritos, colecciones, estadísticas, complementos futuros y configuración.

Motivo:

Separar navegación, exploración de juegos y presentación del juego seleccionado conserva límites claros y permite ocultar o ajustar la biblioteca sin perder la navegación global.

### DEC-019 — Organización y presentación de la biblioteca a elección del usuario

**Estado: Aprobada.**

Decisión:

El usuario podrá agrupar juegos por plataforma, ocultar grupos, usar grupos desplegables o mostrar todos los juegos sin agrupación. Se podrán considerar criterios de agrupación personalizados en el futuro. Los géneros no serán categorías permanentes obligatorias; podrán usarse para buscar y filtrar.

La biblioteca tendrá modos de lista compacta y carátulas adaptables al ancho disponible. La búsqueda podrá combinar criterios expresados mediante prefijos `@`, incluidos género, plataforma, favoritos e instalación. Los ejemplos de prefijos no forman una lista cerrada.

La columna de biblioteca podrá ocultarse desde un control de la barra global, pero no desactivarse permanentemente. Al restaurarla se conservarán el juego seleccionado, la posición de desplazamiento, los filtros activos y el estado de grupos desplegados. Las preferencias de agrupación también podrán ajustarse desde Configuración y desde un menú flotante de configuración rápida.

Motivo:

La organización debe responder a las preferencias del usuario y no imponer géneros como taxonomía fija. Ocultar temporalmente la columna no debe reiniciar el contexto de navegación ni ocultar la barra global.

### DEC-020 — Presentación principal del juego seleccionado

**Estado: Aprobada.**

Decisión:

El área principal del modo escritorio mostrará el juego seleccionado, no una cuadrícula general de juegos. Contemplará una imagen artística disponible como fondo, una carátula o box art de tamaño considerable hacia la izquierda, un botón de jugar de tamaño normal y color configurable hacia la derecha, y la descripción y los metadatos disponibles en la zona inferior, como desarrollador, editor, año, género, clasificación y plataforma.

Los fondos podrán usar fanart, ilustraciones, capturas u otras imágenes disponibles. Los efectos de fondo y las transiciones entre zonas deberán poder configurarse independientemente. El botón de jugar seguirá sujeto a la regla existente de que el lanzamiento requiere una acción explícita del usuario.

Motivo:

La biblioteca sirve para localizar y seleccionar un juego; el área principal ofrece su presentación y acceso explícito a las acciones disponibles sin convertir el modo escritorio en una cuadrícula de tarjetas.

### DEC-021 — Preferencia visual inicial en configuración local versionada

**Estado: Aprobada para el prototipo.**

Decisión:

La preferencia inicial de tema se almacenará en un archivo JSON dentro del directorio de configuración de Kiwanto. El acceso desde la aplicación Tauri se realizará mediante comandos Rust específicos, con una versión de esquema y una lista cerrada de identificadores de temas admitidos. Los errores de lectura, formato o versión deberán mostrarse; no se reemplazarán datos inválidos silenciosamente. La acción de restaurar valores predeterminados escribirá el valor predeterminado de forma explícita.

Este archivo de preferencias no sustituye SQLite para los datos de biblioteca ni decide el almacenamiento futuro de perfiles, distribuciones u otras preferencias. Los temas y perfiles seguirán siendo conceptos separados, y la selección de un tema no deberá sobrescribir preferencias de distribución.

Motivo:

La preferencia visual global actual es pequeña y no relacional. Un archivo local versionado permite guardarla sin introducir un plugin de persistencia ni abrir acceso general al sistema de archivos desde el frontend, manteniendo SQLite para los datos estructurados de la aplicación.

### DEC-022 — La composición forma parte del tema y es declarativa

**Estado: Aprobada como dirección arquitectónica; motor pendiente.**

Decisión:

Ampliando DEC-013, un tema podrá definir no solo estilos, sino también composiciones que cambien posición, tamaño, proporción, orden y alineación de componentes compatibles. La composición se describirá con contratos declarativos versionables que identifiquen regiones, componentes, ubicaciones admitidas y propiedades permitidas. No se asumirá que CSS por sí solo cubrirá todas las composiciones futuras.

El tema no podrá eliminar la responsabilidad funcional de un componente, alterar datos de biblioteca ni romper sus acciones. Adoptar composiciones alternativas no requerirá desechar o reemplazar la interfaz funcional actual.

Motivo:

La flexibilidad visual deseada requiere permitir cambios profundos de presentación sin mezclar apariencia con lógica funcional ni admitir código ejecutable.

### DEC-023 — Personalización visual independiente por región

**Estado: Aprobada como requisito; modelo y motor ampliados pendientes.**

Decisión:

Ampliando DEC-014 y DEC-018, las regiones visuales podrán configurarse de forma independiente mediante propiedades declarativas permitidas. Las regiones previstas incluyen navegación global, biblioteca y búsqueda, presentación del juego, información y descripción, controles y futuras secciones. Fondos, recursos, separadores y efectos podrán variar entre regiones.

Ejemplos futuros incluyen una biblioteca transparente sin desenfoque, una biblioteca con imagen y efectos propios, un separador oculto, una navegación con iconos, logotipos o texturas alternativas, y composiciones distintas para carátula, título, acción, descripción y metadatos. Estos ejemplos no describen capacidades actuales ni autorizan copiar recursos de otros proyectos.

Motivo:

La personalización no debe depender de una única paleta global ni obligar a que todas las zonas compartan apariencia y efectos.

### DEC-024 — El rendimiento visual es un requisito arquitectónico

**Estado: Aprobada.**

Decisión:

Ampliando DEC-015, ningún efecto visual costoso será obligatorio. Desenfoques, transparencias complejas, animaciones y transiciones deberán poder desactivarse individualmente; se evitarán animaciones permanentes innecesarias. Los recursos gráficos deberán optimizarse y utilizar una caché acotada con invalidación definida. La arquitectura evitará recálculos y renderizados innecesarios y medirá costos de GPU, memoria y capacidad de respuesta en equipos Linux, incluidos equipos con gráficos integrados y recursos modestos.

La interfaz deberá conservar legibilidad, foco y accesibilidad sin depender de efectos, y ofrecer alternativas de bajo consumo gráfico. No se elegirá una tecnología adicional para composición o efectos sin validar compatibilidad con Tauri, React, WebKitGTK y Linux, y sin justificarla mediante pruebas.

Motivo:

La personalización visual debe seguir siendo utilizable en el hardware objetivo y no intercambiar legibilidad o capacidad de respuesta por efectos decorativos.

### DEC-025 — La interfaz actual se conserva como primera referencia visual

**Estado: Aprobada.**

Decisión:

Ampliando DEC-018 y DEC-020, la interfaz funcional actual de tres zonas será la primera interfaz de referencia de Kiwanto y la base del futuro tema oficial predeterminado. El motor de personalización deberá evolucionar sobre ella y preservar sus funciones; no se descartará ni reemplazará la interfaz para comenzar el desarrollo del motor.

La implementación actual de temas sigue limitada a dos apariencias integradas y a la composición existente. Esta decisión establece una base de evolución, no declara implementadas las composiciones alternativas.

Motivo:

Conservar la interfaz existente protege el trabajo funcional y proporciona un diseño real para validar el motor, sus contratos y sus alternativas.

### DEC-026 — Dos modos de presentación sobre una lógica compartida

**Estado de la decisión: aprobada. Estado de implementación al 2026-11-12: Big Picture cuenta con una primera implementación; véase [PROJECT_STATUS.md](PROJECT_STATUS.md).**

Decisión:

Kiwanto tendrá Desktop Mode, orientado principalmente a ratón y teclado, y Big Picture / TV Mode, diseñado para pantallas grandes y mando con compatibilidad de teclado y ratón. Son composiciones y políticas de interacción distintas que consumen el mismo catálogo, datos, servicios y operaciones de aplicación. Cambiar de modo no creará otra biblioteca, duplicará lógica de negocio ni separará instalaciones, metadatos o preferencias.

Aplicación al registrar esta decisión: el prototipo tenía una capa TypeScript reutilizable en `src/library/` para modelos, consulta/filtros, selección visible y la operación de alternar favoritos; Big Picture, persistencia y repositorios aún no estaban implementados. El estado vigente de estos componentes se mantiene en [PROJECT_STATUS.md](PROJECT_STATUS.md); esta nota conserva el contexto histórico de la decisión.

Motivo:

Permite ofrecer interacciones apropiadas para cada entorno sin fragmentar los datos ni el comportamiento de Kiwanto.

### DEC-027 — Big Picture / TV es una experiencia propia

**Estado de la decisión: aprobada. Big Picture tiene una primera implementación; la validación de cobertura, composición y medidas sigue pendiente.**

Decisión:

Big Picture / TV no será una ampliación de escala del modo escritorio. Tendrá navegación visible y controles grandes, biblioteca en tarjetas/portadas y secciones, fichas de juego apropiadas para TV, estados vacíos/de carga/error, diálogos, menús y notificaciones. La composición responderá a distintas resoluciones y proporciones y conservará el acceso a las funciones principales.

Su primera versión funcional se implementará después de estabilizar la biblioteca persistente, los servicios compartidos y el lanzamiento local básico. No esperará a que terminen todas las integraciones externas ni el motor completo de personalización. Big Picture funcional precederá a la implementación de ese motor completo.

Motivo:

Un uso a distancia y mediante mando requiere jerarquía, legibilidad, foco y distribución diseñados para esa experiencia, no solo controles de escritorio agrandados.

### DEC-028 — Contexto compartido, foco y navegación recuperables

**Estado: Aprobada como contrato de diseño; persistencia e implementación pendientes.**

Decisión:

Al cambiar de modo se conservarán el juego seleccionado, la consulta/filtros y la colección o sección activa cuando corresponda. Cada modo podrá conservar por separado su desplazamiento, expansión de grupos/estantes y ancla de navegación/foco. La selección de un juego y el elemento enfocado son estados distintos: mover el foco no seleccionará otro juego. Si un elemento deja de existir o de estar visible, el foco volverá a un control válido de la sección.

Los destinos globales conservarán la misma función en ambos modos. La barra podrá cambiar de forma (compacta con iconos en escritorio; ampliada, con nombres y controles grandes en TV), sin combinar navegación global, biblioteca y presentación del juego.

Motivo:

Mantener el contexto personal al cambiar de presentación evita reinicios y confusiones, a la vez que permite recorridos de foco diferentes para cada composición.

### DEC-029 — Entrada mediante acciones semánticas y foco visible

**Estado: Aprobada como contrato de interacción; tecnología de mando pendiente de validación.**

Decisión:

Mando, teclado y ratón se traducirán a acciones comunes de navegación, selección, confirmación, volver/cancelar, apertura/cierre de menús, cambio de sección y desplazamiento. Big Picture no dependerá del hover ni exclusivamente del ratón. Menús y diálogos recibirán y devolverán el foco de forma predecible, y toda pantalla tendrá una salida clara para evitar bloqueos de navegación.

El contrato distinguirá la **acción semántica** de su dispositivo y **adaptador** de entrada, y de los **gestos** que el adaptador reconoce. También especificará foco, recorrido de navegación, pulsación corta/larga, mantener, repetición controlada y combinaciones. Por ejemplo, `OpenContextMenu` podrá provenir de clic derecho, tecla Menú o Shift+F10, botón contextual del mando o pulsación larga configurable en Big Picture. Esos adaptadores producirán la misma acción y respetarán accesibilidad y conflictos con controles nativos. Enter o Espacio mantenidos no serán un mecanismo universal de pulsación larga.

Se evaluará primero la Gamepad API del WebView Tauri. La compatibilidad efectiva de WebKitGTK en Linux, la visibilidad de dispositivos y el mapeo de diferentes mandos quedan pendientes de pruebas; esta decisión no añade una dependencia ni selecciona un puente nativo.

Motivo:

Separar las acciones de aplicación del hardware permite compartir comportamientos sin asumir que todos los mandos, WebViews o pantallas tienen el mismo mapa de botones.

### DEC-030 — Cambio reversible de modo; atajo candidato

**Estado: Propuesta de interacción aprobada para validar; atajo y conflictos pendientes.**

Decisión:

Ambos modos tendrán un acceso visible y reversible para cambiar al otro. `Ctrl+Shift+B` es el atajo inicial propuesto, no implementado ni definitivo; deberá revisarse frente a conflictos con escritorio Linux, WebKit y campos de edición, y podrá configurarse desde Ajustes en el futuro. Al remapearlo, Ajustes deberá detectar duplicados con otros atajos de Kiwanto; los atajos globales del sistema se probarán y comunicarán si no se pueden detectar automáticamente.

Una solicitud no cerrará, omitirá ni confirmará un diálogo modal. Las operaciones independientes de la vista continuarán y mostrarán su estado en ambos modos; las confirmaciones ligadas a una vista se resolverán antes de cambiar. Cambiar de modo no cancelará ni repetirá una operación.

Motivo:

El cambio debe ser accesible sin atajo, reversible y no destructivo para el contexto o las operaciones en curso.

### DEC-031 — Variantes de tema y composición por modo

**Estado: Aprobada como requisito arquitectónico; modelo y motor pendientes.**

Decisión:

El motor futuro distinguirá modo, tema, composición, perfil de interfaz y preferencias. Un tema podrá declarar variantes específicas para escritorio y TV y reutilizar tokens o recursos cuando corresponda. Cada variante podrá tener composiciones y regiones compatibles propias; la personalización por región no podrá ocultar controles esenciales. Un perfil podrá tener ámbito de uno o ambos modos y combinará una variante de tema, composición y preferencias compatibles, sin seleccionar ni cambiar el modo activo.

Importar un tema no cambiará el modo ni sobrescribirá preferencias de distribución que no formen parte del tema. Las preferencias personales y los perfiles se mantendrán separados del paquete de tema y se validarán de forma independiente. Su precedencia se define en DEC-047.

Motivo:

Una sola identidad visual puede adaptarse a dos composiciones sin forzar distribuciones inadecuadas ni sobrescribir decisiones personales del usuario.

## Decisiones sobre proveedores, metadatos e idiomas

### DEC-032 — Proveedores de datos separados de complementos funcionales

**Estado: Aprobada como dirección arquitectónica; contratos de integración pendientes.**

Decisión:

Kiwanto distinguirá proveedores de datos, integraciones de plataforma y complementos funcionales. Un proveedor entrega datos al modelo y a las operaciones comunes; no debe duplicar buscadores, almacenamiento ni presentación. Proveedores e integraciones podrán comenzar como módulos internos. Su existencia no implica un runtime de plugins ejecutables.

Las fuentes externas serán opcionales. La biblioteca local deberá seguir operativa sin conexión y cuando un proveedor esté deshabilitado o no disponible. El mecanismo, los permisos, las capacidades y el estado de cada fuente se declararán explícitamente y se validarán antes de habilitarla.

Motivo:

Separar estas responsabilidades evita dependencias de un único servicio y reduce la necesidad de conceder capacidades de complemento a un simple origen de datos.

### DEC-033 — Procedencia y resolución no destructiva de metadatos

**Estado: Aprobada como requisito; modelo de datos pendiente.**

Decisión:

Los metadatos externos se normalizarán al modelo común conservando su procedencia por campo cuando corresponda. Las modificaciones manuales del usuario no se sobrescribirán silenciosamente. La prioridad general de una fuente se distinguirá de la elección individual de valores; una actualización podrá afectar campos seleccionados sin reemplazar información ajena a ella.

Los identificadores externos se asociarán con su proveedor y con una identidad interna estable. Coincidencias por título no bastarán para fusionar juegos, ediciones o versiones; los casos dudosos requerirán revisión del usuario.

Motivo:

Los proveedores pueden ser incompletos, contradictorios o cambiar. La procedencia y el control por campo preservan la confianza y los datos del usuario.

### DEC-034 — Imágenes de juegos como archivos locales independientes

**Estado: Aprobada; ciclo de vida y límites pendientes de diseño.**

Decisión:

Las imágenes descargadas o importadas se almacenarán como archivos independientes. SQLite conservará referencias y metadatos, no los bytes completos de las imágenes. Los recursos de juegos se mantendrán separados de los recursos de temas e interfaz. Descarga, importación, sustitución y eliminación respetarán validación, atribución, almacenamiento local y control explícito del usuario.

Motivo:

Separar binarios del almacenamiento relacional permite mantener un flujo de activos y respaldos definido y evita mezclar arte de juegos con personalización de interfaz.

### DEC-035 — Localización nativa e independiente de complementos

**Estado: Aprobada como requisito; formatos e idiomas iniciales pendientes.**

Decisión:

La localización de textos de la interfaz será una capacidad nativa de Kiwanto y una preferencia general, independiente de temas, perfiles y complementos. Los archivos de idioma serán datos declarativos con estructura y versiones validadas. La selección y el respaldo ante traducciones ausentes deberán ser deterministas. Una traducción comunitaria no recibirá permisos de complemento ni ejecutará código.

Motivo:

El idioma básico de la aplicación debe estar disponible sin instalar o ejecutar extensiones y no debe quedar acoplado a la apariencia.

### DEC-036 — Traducción de contenido separada y opcional

**Estado: Aprobada como requisito futuro; tecnologías y proveedores pendientes de investigación.**

Decisión:

La traducción de descripciones y metadatos de juegos será una capacidad distinta de la localización de la interfaz. Podrá ser manual, local o usar servicios remotos opcionales, con transparencia sobre datos transmitidos, costos, credenciales y disponibilidad. Se conservarán el texto original, idioma, traducción y procedencia según corresponda; una traducción nueva no sobrescribirá una modificación manual sin consentimiento.

Motivo:

El idioma de la interfaz no debe cambiar los datos del juego, y la traducción puede implicar proveedores, recursos y tratamiento de datos diferentes.

### DEC-037 — Métodos de acceso y estados de proveedor explícitos

**Estado: Aprobada como requisito de evaluación; proveedores concretos pendientes.**

Decisión:

Cada fuente se clasificará como API oficial documentada, conjunto de datos descargable, importación local, integración comunitaria no oficial o flujo manual, según lo que se compruebe. Su estado se identificará como planificado, experimental, disponible o deshabilitado. No se asumirán API, gratuidad, disponibilidad, autenticación, cuotas, permisos de almacenamiento, atribución ni redistribución sin verificar documentación y condiciones vigentes. No se evadirán mecanismos antibots, autenticación ni restricciones de acceso.

Motivo:

La clasificación y transparencia evitan presentar una posibilidad técnica como integración autorizada o sostenible.

### DEC-038 — Catálogo comunitario distinto de la ejecución de complementos

**Estado: Aprobada como posibilidad futura; formato y distribución pendientes.**

Decisión:

Podrá evaluarse un catálogo comunitario de complementos, proveedores, temas, idiomas y recursos opcionales. Podrá usar repositorios GitHub inicialmente, sin depender exclusivamente de ellos. El catálogo será metadato e índice, no un marketplace ni garantía de confianza; se mantendrá separado de la instalación y eventual ejecución de complementos. La aparición de un recurso en el catálogo no concederá permisos. No se implementa ni aprueba la instalación automática.

Motivo:

Descubrir recursos y otorgar capacidades ejecutables son decisiones distintas, con límites de confianza y seguridad diferentes.

### DEC-039 — Menús contextuales propios y dependientes del elemento

**Estado: Aprobada como requisito de diseño; implementación pendiente.**

Decisión:

Kiwanto utilizará menús contextuales propios del producto, cuyas acciones dependerán del elemento invocado y de las capacidades disponibles. Un menú de juego, de un espacio vacío de biblioteca o de un recurso visual no mostrará acciones irrelevantes; las acciones pertinentes pero no disponibles deberán indicarse como tales. Los menús respetarán tema, selección, foco y estado deshabilitado, y admitirán teclado y, cuando corresponda, mando.

En elementos y superficies administrados por Kiwanto, los menús propios reemplazarán las opciones predeterminadas del WebView, sin exponer recarga, inspección ni depuración durante el uso normal. Esta sustitución conservará las operaciones contextuales apropiadas de edición de texto, mediante un menú propio o el comportamiento nativo seguro cuando corresponda.

Las acciones de archivos y rutas tendrán límites explícitos: mostrar una carpeta usará una operación segura del sistema y no ejecutará archivos encontrados; renombrar cambiará inicialmente solo el nombre dentro de la biblioteca; modificar una ruta, ejecutable o archivo físico requerirá una acción expresa y validaciones adicionales. Ninguna acción contextual ejecutará comandos arbitrarios ni elevará privilegios.

Motivo:

Los menús deben facilitar acciones relevantes sin exponer controles de desarrollo ni convertir acciones de interfaz en accesos privilegiados o ambiguos al sistema.

### DEC-040 — Búsqueda de metadatos con selección y aplicación revisables

**Estado: Aprobada como flujo conceptual; proveedores y diálogo pendientes de implementación y validación.**

Decisión:

La acción «Buscar metadatos» abrirá un diálogo propio donde el usuario podrá elegir uno o varios proveedores disponibles. Los resultados se presentarán para revisión antes de aplicarlos y el usuario podrá aceptar valores de proveedores diferentes de forma independiente. Las modificaciones manuales tendrán precedencia y no se sobrescribirán silenciosamente. Las fuentes ofrecidas dependerán de las integraciones y capacidades realmente disponibles; no se presume la existencia de un proveedor o método de acceso concreto.

Este flujo es distinto del buscador unificado de imágenes, cuya responsabilidad es encontrar y seleccionar recursos visuales y que tiene requisitos propios de fuentes, atribución, validación y almacenamiento.

Motivo:

La revisión y aplicación selectiva conserva el control del usuario ante datos incompletos o contradictorios y distingue la edición de metadatos de la búsqueda de recursos gráficos.

### DEC-041 — Taxonomía canónica en DAG y etiquetas personales independientes

**Estado: Requisito conceptual aprobado; catálogo inicial controlado y selector implementados; gestión avanzada y proveedores pendientes.**

Decisión:

El detalle conceptual se documenta en [TAXONOMY_AND_FILTERS.md](TAXONOMY_AND_FILTERS.md) y se integra al modelo general en [LIBRARY_DATA_MODEL.md](LIBRARY_DATA_MODEL.md).

- Un juego podrá tener varios géneros y subgéneros. La taxonomía utilizará un DAG: un término podrá tener varios padres y un subgénero podrá relacionarse con más de un género cuando corresponda. No se permitirán ciclos.
- Cada término canónico tendrá un identificador estable. Traducciones, etiquetas localizadas y nombres alternativos serán etiquetas del mismo término, no términos canónicos duplicados. El catálogo inicial usa IDs estables y se administra desde SQLite.
- Las asociaciones corresponderán normalmente a una edición. Podrán tener alcance de lanzamiento o variante cuando una diferencia real lo justifique, sin duplicar asociaciones idénticas. No se establece una asociación a nivel de obra ni herencia desde la obra.
- Las etiquetas personales serán libres, modificables por el usuario, independientes de la taxonomía canónica y utilizables en búsqueda y filtros. No se convertirán automáticamente en categorías oficiales.
- Se conservarán el término original de cada proveedor y su procedencia. Las equivalencias claras podrán normalizarse automáticamente; las ambiguas quedarán pendientes de revisión. Un término desconocido no creará un término canónico. El usuario podrá corregir asociaciones.

No se aprueba una lista definitiva de géneros, subgéneros o etiquetas compartidas.

Motivo:

El DAG permite representar relaciones conceptuales múltiples sin duplicar términos. Identificadores estables y etiquetas localizadas separan la identidad canónica de su presentación. La procedencia y revisión de ambigüedades evitan perder información externa o crear categorías no aprobadas; las etiquetas personales conservan la organización propia del usuario.

### DEC-042 — Semántica compartida de filtros de taxonomía

**Estado: Aprobada como requisito conceptual; sintaxis, interfaz e implementación pendientes.**

Decisión:

El detalle conceptual se documenta en [TAXONOMY_AND_FILTERS.md](TAXONOMY_AND_FILTERS.md) y se integra al modelo general en [LIBRARY_DATA_MODEL.md](LIBRARY_DATA_MODEL.md).

- Los valores seleccionados dentro de una misma faceta se combinarán con OR; facetas diferentes se combinarán con AND.
- Las etiquetas personales seleccionadas se combinarán con OR por defecto. Un modo avanzado con AND entre etiquetas podrá evaluarse en el futuro.
- Seleccionar un género padre incluirá por defecto sus descendientes alcanzables en el DAG. Se podrá limitar la búsqueda al término exacto y excluir descendientes.
- Un subgénero con varios padres será alcanzable al filtrar por cualquiera de ellos. Las rutas o asociaciones múltiples no duplicarán una edición en los resultados.
- Desktop Mode y Big Picture compartirán estas reglas funcionales, aunque presenten controles distintos.

Estas reglas describen el comportamiento futuro del sistema de filtros y no afirman que esté implementado en el prototipo.

Motivo:

La combinación predecible de facetas, la navegación jerárquica y los resultados únicos permiten que distintas interfaces consulten la misma biblioteca sin divergir en sus reglas.

### DEC-043 — Persistencia local de biblioteca administrada por Rust

**Estado: Implementada para la primera versión funcional de biblioteca.**

Decisión:

- Rust administra SQLite mediante `rusqlite`; React usa un servicio TypeScript y comandos Tauri acotados, sin SQL en componentes.
- La base se guarda en `app.path().data_dir()/kiwanto/library.sqlite3`, que corresponde a `~/.local/share/kiwanto/library.sqlite3` por defecto en Linux y respeta `XDG_DATA_HOME`.
- El esquema usa ediciones con IDs internos estables, lanzamientos y sistemas objetivo separados, estado personal separado y estructuras relacionales preparadas para instalaciones, perfiles, taxonomía, colecciones, procedencia e imágenes externas.
- Archivar conserva los datos. La eliminación permanente requiere una entrada archivada, confirmación explícita y ausencia de dependencias de instalación; no modifica archivos del juego.
- Las migraciones versionadas usan `PRAGMA user_version` y transacciones. Las conexiones habilitan y verifican claves foráneas, y usan WAL con sincronización completa.
- Los datos ficticios son fixtures y no se insertan al inicializar la biblioteca.

Las operaciones de colecciones manuales (crear, listar, editar, borrar y gestionar asociaciones) están implementadas en SQLite/Rust con servicios tipados y vistas en Desktop Mode y Big Picture. La gestión de instalaciones, integraciones con gestores, gestión completa de etiquetas, selección de arte, filtros avanzados, backup y restauración siguen pendientes. El lanzamiento local manual básico sí está implementado; no incluye seguimiento de sesiones. Las colecciones inteligentes y las franquicias no están implementadas. Las preferencias de tema permanecen en JSON bajo la ruta XDG de configuración porque su alcance actual es pequeño y no relacional. Su migración desde la ruta anterior solo elimina el archivo anterior cuando la copia actual se ha publicado correctamente o ambas preferencias se han comparado como equivalentes; si difieren, conserva ambos y comunica el conflicto.

Motivo:

Esta separación permite que Desktop Mode y futuras presentaciones reutilicen los mismos datos y operaciones, y evita acoplar la UI a SQL, instalaciones externas o rutas mutables.

### DEC-044 — Catálogo canónico inicial y selección de géneros por ID

**Estado: Aprobado para la primera versión del catálogo e implementado; expansión y gobierno del catálogo pendientes.**

Decisión:

- La interfaz de edición solo permite seleccionar términos canónicos que Rust devuelve desde SQLite. El texto de búsqueda filtra opciones y nunca crea términos.
- Se siembra un catálogo inicial pequeño de géneros y subgéneros en la migración versionada, con IDs estables namespaced y relaciones DAG explícitas. El detalle del conjunto inicial está en [TAXONOMY_AND_FILTERS.md](TAXONOMY_AND_FILTERS.md).
- Los términos insertados por el editor libre de la versión anterior se mantienen, junto con sus asociaciones, como términos pendientes de clasificación y con procedencia manual legado. No se promueven automáticamente a canónicos ni se eliminan durante la migración.
- Los términos desconocidos recibidos de una fuente pueden registrarse como pendientes con su texto original, fuente y edición relacionada cuando se conoce. No se implementan integraciones de proveedores en esta etapa.
- Las etiquetas personales continúan separadas de la taxonomía y no se convierten entre sí.

Motivo:

El selector debe usar la identidad canónica estable y evitar que texto libre contamine el catálogo. El estado pendiente y el archivo de procedencia conservan tanto los datos anteriores como los valores futuros no clasificados sin confundirlos con géneros aceptados.

### DEC-045 — Migración conservadora de preferencias XDG

**Estado: Implementada.**

Decisión:

- Si solo existe el archivo previo, se crea una copia completa en la ruta actual antes de retirar la fuente.
- Si existen ambos archivos, se comparan las preferencias parseadas. Si son equivalentes, se conserva la actual y se puede retirar la anterior; si difieren, la lectura o escritura informa el conflicto y preserva ambos archivos.
- La migración publica la copia sin reemplazar un archivo actual que aparezca concurrentemente. Una escritura incompleta no sustituye la fuente anterior.

Motivo:

La configuración anterior debe seguir disponible si la migración falla o encuentra preferencias divergentes; una preferencia no debe perderse por elegir silenciosamente una de dos fuentes.

### DEC-046 — Subsistemas independientes del motor visual

**Estado: Aprobada como arquitectura futura; implementación pendiente.**

Decisión:

El motor visual separará sistema visual (tokens, tipografía, estados y efectos), sistema de componentes registrados (variantes declarativas), sistema de composición (regiones, slots y disposición), sistema de recursos (validación, carga, caché y liberación) y coordinación de temas/perfiles. Cada componente conservará semántica y estados pertinentes; los contratos permitirán composiciones significativamente distintas sin permitir que un tema altere lógica de negocio o elimine funciones esenciales. El tema puede incluir valores predeterminados de composición, pero las elecciones persistentes del usuario pertenecen al perfil/preferencias.

Motivo:

Separar contratos mantiene validación, seguridad y ciclo de vida comprensibles, y evita que una sola estructura monolítica limite la variedad visual o concentre responsabilidades distintas.

### DEC-047 — Precedencia entre modo, tema, perfil y preferencias

**Estado: Aprobada como contrato conceptual; persistencia y resolución implementables pendientes.**

Decisión:

El modo activo define la experiencia, las restricciones de composición, navegación e interacción y las variantes compatibles; no define por sí solo el tema. El tema aporta identidad visual y valores predeterminados para una variante del modo. El perfil persistente selecciona una referencia de tema y puede aportar ajustes explícitos de composición/presentación; puede estar asociado a un modo o declarar variantes compatibles para ambos, pero no cambia el modo activo. Las preferencias guardan las elecciones del usuario en ámbito global o específico del modo.

La resolución aplica las restricciones funcionales del modo, después los valores predeterminados del tema, los ajustes del perfil y finalmente las preferencias del usuario: las preferencias específicas del modo prevalecen sobre las globales solo en ese modo. Los límites de seguridad, accesibilidad y compatibilidad se validan al final y ningún tema, perfil o preferencia puede anularlos. Un tema nuevo no reemplaza preferencias personales: ante incompatibilidad se ofrece aplicar solo valores predeterminados a los campos afectados o cancelar, conservando los demás. Cambiar modo no altera preferencias del otro modo.

Motivo:

Una precedencia explícita evita duplicar valores o crear configuraciones contradictorias, preserva las elecciones personales y permite que un tema ofrezca una identidad coherente en composiciones distintas.

### DEC-048 — Paquetes de tema autocontenidos y versionados

**Estado: Aprobada como requisito; formato y límites concretos pendientes.**

Decisión:

Los paquetes declarativos de temas tendrán identificador estable, nombre y autoría declarada, versión del tema y del formato, descripción, compatibilidad de Kiwanto, variantes de Desktop y Big Picture, configuración visual, composición, recursos, procedencia, licencias y atribuciones. Un paquete incluirá los recursos redistribuibles necesarios; no dependerá silenciosamente de archivos del creador ni de recursos remotos. El manifiesto y las referencias se validarán, y los checksums permitirán comprobar integridad. Autoría declarada no equivale a autenticidad.

El diseño será independiente del sistema de complementos para permitir una biblioteca comunitaria futura. No aprueba ni implementa ahora un catálogo o marketplace. Versionado, compatibilidad y migraciones del formato deberán tratarse explícitamente.

Motivo:

La portabilidad requiere que el paquete describa y transporte sus dependencias visuales y permita validar su contenido sin conceder capacidades ejecutables.

### DEC-049 — Recursos visuales con ciclo de vida acotado

**Estado: Aprobada como requisito arquitectónico; umbrales por validar antes de implementar.**

Decisión:

El motor cargará el tema y configuración activos, priorizará recursos visibles, resolverá el resto bajo demanda, limitará cachés y expulsará/liberará recursos no utilizados. Ajustará imágenes al uso real, evitará decodificaciones innecesarias y suspenderá animaciones o video fuera de pantalla. Respetará movimiento reducido y preferencias de efectos; no precargará todo ni mostrará cargas para recursos no usados. Los límites numéricos se establecerán a partir de mediciones en hardware objetivo, incluyendo GPU integrada.

La evaluación medirá memoria, GPU, tiempos de carga, respuesta y estabilidad con imágenes grandes, SVG, GIF, video, fuentes, blur, transparencias, sombras y composiciones complejas.

Motivo:

La carga oportunista y los presupuestos basados en mediciones reducen presión de recursos sin impedir temas variados en hardware modesto.

### DEC-050 — Recursos de temas, artwork y contenido de fichas separados

**Estado: Aprobada como límite de datos y empaquetado; contenido enriquecido de juegos y colecciones pendiente de implementación.**

Decisión:

Los recursos visuales de temas pertenecen a sus paquetes. El artwork de juegos y colecciones conserva procedencia, atribución, licencia cuando se conozca y almacenamiento independiente; no se incluye automáticamente en un tema. El contenido enriquecido editable podrá asociarse a una ficha de juego o a una colección y conserva ese ámbito con independencia de la composición visual. Podrá consistir en bloques ordenables de texto, imágenes, GIF, galerías, video/trailers, líneas del tiempo, secciones informativas, enlaces y documentos admitidos. Sus medios podrán ser locales o externos con validación y caché offline. No se permitirán scripts, contenido activo ni reproducción automática de audio. Los documentos originales se mantienen separados de su portada visual y se cargan únicamente cuando el usuario pide abrirlos.

Motivo:

Identidad de interfaz, materiales de presentación del juego y contenido editorial tienen propiedad, procedencia, seguridad y ciclo de vida diferentes.

### DEC-051 — Colecciones manuales, inteligentes y franquicias son conceptos distintos

**Estado: Aprobada; colecciones manuales básicas implementadas, capacidades inteligentes y de franquicia futuras.**

Decisión:

Las colecciones manuales son agrupaciones creadas por el usuario, persistentes e independientes de favoritos y taxonomía. Un juego puede pertenecer a varias y la eliminación de una colección solo elimina sus asociaciones. Las colecciones inteligentes derivarán sus miembros de filtros configurados y se actualizarán automáticamente. Una franquicia tendrá identidad, metadatos y relaciones propias y no será una colección manual con campos añadidos. Cualquier detección de franquicia será una sugerencia revisable; nunca establecerá relaciones definitivas sin confirmación del usuario.

La implementación actual de colecciones manuales cubre nombre, descripción, asociaciones persistentes, operaciones de gestión y vista Desktop. Portada/fondo propios, orden personalizado e identidad visual avanzada siguen pendientes.

Motivo:

La distinción conserva el control del usuario y evita confundir una agrupación arbitraria con una entidad editorial o relaciones de franquicia.

### DEC-052 — Plantillas de composición y editor visual guiado

**Estado: Aprobada como arquitectura futura; editor y plantillas editables pendientes.**

Decisión:

Las colecciones podrán tener presentaciones visuales propias, con portada y fondo independientes, orientaciones de imagen adaptables y composiciones interiores elegibles, como galerías, estanterías horizontales o verticales y presentaciones editoriales por secciones. Las plantillas son estructuras reutilizables distintas de temas, perfiles y preferencias: el tema aporta identidad/estilos, la plantilla estructura regiones y slots, y perfil/preferencias guardan elecciones compatibles del usuario. Se mantiene la precedencia y validación establecida en DEC-047.

El editor tendrá una modalidad sencilla para personalizar una plantilla existente y otra avanzada para organizar regiones, componentes, contenedores y capas permitidos. No será un lienzo sin restricciones ni permitirá código arbitrario. Usará composición guiada, alineación, límites, slots tipados y validación antes de guardar; las superposiciones intencionales podrán permitirse. Protegerá legibilidad, accesibilidad, acciones y estados funcionales. Será reutilizable para colecciones, juegos y regiones de Desktop Mode y Big Picture, sin ser requisito previo para que Big Picture sea funcional.

Antes de implementar el editor existirán plantillas prediseñadas utilizables sin edición. Su versionado deberá preservar compatibilidad y definir migración antes de modificar composiciones guardadas.

Motivo:

La composición reutilizable permite variar la presentación sin duplicar negocio ni habilitar diseños que rompan controles esenciales.

### DEC-053 — Audio local opcional de colecciones

**Estado: Aprobada como posibilidad futura; no implementada.**

Decisión:

Una colección podrá referenciar música local general o pistas asociadas a juegos dentro de ella. La reproducción será opcional y desactivada si no hay configuración explícita; podrá prever volumen independiente, secuencia/aleatorio, silencio, pausa y detención al salir. Los archivos permanecerán fuera de SQLite bajo referencias locales controladas. No habrá descarga automática ni dependencia de servicios externos.

Motivo:

El audio ambiental es una preferencia opcional y sus archivos tienen un ciclo de vida distinto de los datos relacionales.

### DEC-054 — IA editorial explícita y posterior

**Estado: Aprobada como capacidad futura de etapas posteriores; no implementada.**

Decisión:

La generación de descripciones, cronologías u otro contenido editorial no será dependencia de biblioteca, colecciones, editor ni Big Picture. Estará desactivada por defecto y solo se ejecutará bajo solicitud explícita, sin actividad automática o de fondo. La arquitectura podrá admitir proveedores intercambiables y modelos locales; antes de una solicitud externa se mostrará qué datos se enviarán y se limitarán a los necesarios. Los resultados se guardarán localmente, podrán editarse, regenerarse o eliminarse y distinguirán datos verificados, información de proveedores y sugerencias generadas.

Las credenciales se mantendrán en almacenamiento seguro del equipo, fuera del repositorio, archivos versionados, ejemplos reales, registros, exportaciones y sincronización. Kiwanto no contactará a proveedores de IA sin acción explícita del usuario.

Motivo:

La generación editorial debe conservar privacidad, procedencia y control del usuario, y no bloquear las capacidades centrales sin IA.

### DEC-055 — Big Picture funcional precede al motor completo y editor

**Estado: Aprobada; reflejada en el orden estratégico de ROADMAP.md.**

Decisión:

Big Picture se implementará y validará como experiencia utilizable sobre la biblioteca, colecciones manuales y servicios compartidos existentes antes de comenzar el motor completo de personalización o el editor visual. Podrá usar composiciones iniciales integradas y accesibles. No dependerá de franquicias, colecciones inteligentes, contenido enriquecido, manuales, música, IA ni integraciones externas completas.

Motivo:

Entregar primero ambos modos funcionales permite validar los contratos compartidos antes de añadir la complejidad de personalización avanzada.

## Ideas previstas para el futuro

Las siguientes posibilidades están planificadas para evaluación gradual, no aprobadas como implementación inmediata:

- Usar ilustraciones o imágenes panorámicas de los juegos como fondos dinámicos.
- Extraer colores dominantes y generar paletas o degradados adaptativos.
- Guardar en caché los colores extraídos y ofrecer transiciones al cambiar de juego.
- Incorporar desenfoques, sombras, sonidos opcionales y pantallas de carga personalizables.
- Permitir que complementos aporten paneles, vistas o elementos visuales en etapas posteriores.

La prioridad es construir primero vistas y una biblioteca funcional. La personalización avanzada no deberá adelantarse a esa base.

## Investigación y decisiones técnicas pendientes

No se selecciona todavía ninguna biblioteca o framework adicional para la interfaz. Antes de implementar las funciones avanzadas se deberá investigar y validar:

- Qué vistas admiten redimensionamiento y reordenamiento, y cuáles son sus límites mínimos y máximos.
- Cómo ampliar la persistencia actual de preferencias globales para cubrir preferencias específicas de vistas, distribuciones y perfiles.
- Cómo versionar y migrar temas, distribuciones y perfiles.
- Qué formato de paquete declarativo conviene y qué recursos debe incluir.
- Límites de tamaño, cantidad de recursos y tratamiento seguro de rutas importadas.
- Cómo extraer colores dominantes y cuándo invalidar la caché.
- Coste de fondos dinámicos, desenfoque, transiciones y otros efectos en equipos objetivo.
- Cómo mantener contraste, foco, legibilidad y reducción de movimiento con temas personalizados.
- Qué espacios de integración y contratos estables serían necesarios para extensiones visuales.
- Qué modelo de permisos y aislamiento exigirían los complementos antes de habilitar código externo.
- Sintaxis exacta y tratamiento de consultas ambiguas para los filtros de búsqueda con prefijo `@`; la combinación de facetas queda definida en DEC-042.
- Qué información de juego debe mostrarse cuando determinados metadatos no estén disponibles.
