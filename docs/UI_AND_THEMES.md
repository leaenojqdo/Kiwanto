INTERFAZ Y PERSONALIZACIÓN

Esta especificación describe objetivos previstos para la interfaz de Kiwanto. No implica que estas funciones estén implementadas.

## 1. Objetivo
Crear una interfaz flexible que permita adaptar la biblioteca al estilo y a las necesidades de cada usuario sin comprometer accesibilidad, rendimiento ni facilidad de uso.

Como referencias conceptuales, Kiwanto toma la flexibilidad de personalización de Playnite y la identidad visual y presentación de Heronite. La arquitectura, el diseño y los recursos de Kiwanto serán propios; estas referencias no implican copiar código, recursos ni composiciones concretas.

## 2. Vistas
Se contemplan:

- Modo escritorio.
- Biblioteca en modo lista o carátulas.
- Vista detallada.
- Vista de juego individual.
- Colecciones.
- Estadísticas.
- Configuración.
- Gestión de integraciones.
- Gestión de perfiles de lanzamiento.

Las capacidades de distribución y personalización podrán variar según la vista.

### Modo escritorio
El modo escritorio tendrá tres zonas independientes:

1. Una barra lateral global y estrecha con iconos de navegación.
2. Una columna independiente para la biblioteca y la búsqueda.
3. Un área principal para presentar el juego seleccionado.

La barra global y la columna de biblioteca no se combinarán: ocultar la biblioteca no deberá ocultar ni desactivar la navegación global.

### Barra lateral global
La barra lateral global ofrecerá accesos a:

- Modo escritorio.
- Biblioteca.
- Favoritos.
- Colecciones.
- Estadísticas.
- Complementos, como funcionalidad futura.
- Configuración.

Su estructura deberá poder ampliarse con nuevas secciones sin requerir el rediseño completo de la interfaz.

### Organización y búsqueda de la biblioteca
La organización de la biblioteca será configurable por el usuario. Podrá agrupar juegos por plataforma, mostrar u ocultar esas agrupaciones, usar categorías desplegables o mostrar todos los juegos juntos sin agrupar por plataforma. En el futuro podrán añadirse criterios de agrupación personalizados.

Los géneros no serán categorías permanentes obligatorias; podrán utilizarse como criterios de búsqueda y filtrado. Las preferencias de agrupación podrán configurarse desde Ajustes y mediante un menú flotante de configuración rápida.

La búsqueda podrá interpretar filtros mediante prefijos `@`, por ejemplo `@aventura`, `@terror`, `@linux`, `@windows`, `@favoritos` y `@instalados`. Se podrán combinar varios filtros. La lista de prefijos no será cerrada: el sistema deberá admitir criterios adicionales sin limitarse a estos ejemplos. La sintaxis detallada y el tratamiento de consultas ambiguas quedan por validar.

## 3. Personalización visual
El sistema de personalización deberá admitir cambios profundos de la presentación de Kiwanto, no solo cambios de color. En el futuro, los temas podrán modificar:

- Posición, distribución y tamaño relativo de componentes y paneles.
- Orden y alineación de información.
- Apariencia, tamaño, posición y distribución permitida de botones, controles y elementos de navegación, sin alterar sus funciones ni estados (véase la sección 4).
- Fondos, imágenes, texturas, iconos y logotipos personalizados.
- Colores, tipografía, espaciado, bordes, separadores, sombras y radios.
- Transparencias, degradados, desenfoque y oscurecimiento.
- Animaciones y transiciones.

Los temas visualmente distintos deberán conservar las responsabilidades funcionales y las acciones disponibles de los controles. También deberán conservar sus estados funcionales y de accesibilidad —incluidos foco, deshabilitado, carga y selección— con una presentación perceptible y comprensible. Los valores deberán mantener contraste, legibilidad y uso accesible.

## 4. Temas
Se contemplan temas claros, oscuros y personalizados. Un tema define la apariencia, la composición y los recursos visuales declarativos que Kiwanto admita. No se debe asumir que CSS por sí solo será suficiente para reorganizar componentes: se necesitan contratos de composición versionables que describan regiones, componentes, ubicaciones compatibles y propiedades permitidas. La implementación podrá combinar estos contratos con las capacidades existentes de React y CSS, después de validar su compatibilidad con Tauri, WebKitGTK y Linux.

Los temas deberán poder producir presentaciones profundamente diferentes sin convertirse en programas ejecutables. El formato de tema y sus propiedades deberán ser validados; no se permitirá código arbitrario ni estilos importados sin restricciones.

Un tema define la apariencia visual y podrá proporcionar una composición predeterminada o plantilla compatible de componentes: posiciones relativas, orden, superficies por región, separadores y dimensiones admitidas. No contiene la selección de vista ni las preferencias personales guardadas de distribución, como tamaños y paneles que el usuario haya decidido mostrar u ocultar. El usuario podrá personalizar posteriormente la composición mediante sus preferencias de interfaz; estas preferencias son independientes del tema y podrán formar parte de un perfil de interfaz.

### Responsabilidades del motor visual

El futuro motor visual se organizará en subsistemas con contratos explícitos, no en un único cargador o archivo de tema que controle toda la interfaz:

- **Sistema visual:** tokens y variables visuales, colores semánticos, tipografías y jerarquías, tamaños y pesos, bordes y formas, sombras, transparencias, gradientes, blur, separadores, animaciones, estados y variantes. Las familias tipográficas podrán distinguir títulos, nombres de juegos, descripciones, menús, botones, metadatos e información secundaria.
- **Sistema de componentes:** variantes declarativas para botones, casillas, interruptores, campos, selectores, listas, tarjetas, menús, pestañas, navegación, paneles y otros componentes registrados. Cada componente conserva su semántica y los estados pertinentes (normal, hover, foco, seleccionado, deshabilitado, carga y error). Las variantes pueden cambiar estructura visual —por ejemplo, un interruptor con aspecto de botón físico o una barra con textura— sin reemplazar la acción ni su accesibilidad.
- **Sistema de composición:** regiones, slots, orden, posición, tamaño, espaciado, alineación, visibilidad opcional y fondos por región. Solo acepta componentes, slots, propiedades y relaciones registrados y validados. Sus contratos permiten resultados visualmente distintos de la interfaz original, sujetos a las capacidades y funciones esenciales de cada modo.
- **Sistema de recursos:** manifiesta, valida, carga, escala, cachea y libera recursos visuales según su uso. Los recursos de temas permanecen separados del artwork de juegos y del contenido enriquecido de sus fichas.
- **Sistema de temas y perfiles:** selecciona la identidad visual, la variante y las preferencias de composición aplicables mediante referencias explícitas; no mezcla validación/carga de recursos con datos de biblioteca ni con reglas de negocio.

Estos subsistemas describen responsabilidades futuras. El prototipo actual aplica dos temas integrados sobre una composición fija y no implementa estos motores completos.

### Tema, perfil, modo y preferencias: alcance y precedencia

- **Modo** elige la experiencia de uso y sus restricciones de interacción y composición: Desktop Mode o Big Picture. El modo define qué regiones, navegación y controles son necesarios y qué variantes son compatibles; no elige una identidad visual por sí solo.
- **Tema** aporta identidad visual: tokens, tipografías, variantes de componentes, iconografía, recursos y plantillas o valores predeterminados de composición compatibles con cada modo. Una plantilla de tema es un valor inicial, no una instrucción para reemplazar ajustes personales.
- **Perfil** es una configuración seleccionable y persistente que referencia un tema y puede reunir ajustes explícitos de composición y presentación. Podrá estar asociado a un modo o tener variantes compatibles para ambos; no contiene datos de biblioteca ni cambia por sí mismo el modo activo.
- **Preferencias** son los valores elegidos por el usuario. Hay preferencias globales y otras específicas de un modo; una preferencia de modo solo afecta ese modo. Incluyen selección de modo/perfil cuando corresponda, así como ajustes personales admitidos.

La resolución seguirá este orden: el modo activo determina el contrato y los destinos funcionales; los valores predeterminados de la variante del tema establecen la apariencia y la composición inicial; el perfil seleccionado aporta sus ajustes explícitos; las preferencias del usuario prevalecen sobre esos valores, aplicando primero las globales y luego las específicas del modo, que prevalecen solo dentro de su propio modo. Al final se validan los límites de seguridad, accesibilidad y compatibilidad del modo: ningún nivel puede desactivarlos. La selección de un perfil puede elegir qué tema y variante usar, pero no puede forzar el cambio de modo. Cambiar el tema o modo no borra ni reescribe las preferencias incompatibles: se identifican los valores afectados y se ofrece usar solo valores predeterminados compatibles o cancelar, conservando los demás.

Un tema podrá cambiar de forma considerable la presentación sin modificar la estructura funcional ni las acciones disponibles. Por ejemplo, podrá declarar una biblioteca transparente o con fondo propio, una navegación con otro logotipo o textura, un separador oculto y distintas composiciones de portada, título, descripción, metadatos y botón. Los temas podrán cambiar la apariencia, tamaño, posición y distribución permitida de los controles, pero no sus responsabilidades, acciones ni estados funcionales o de accesibilidad. Estos estados deberán seguir siendo distinguibles en cada presentación; en particular, foco, deshabilitado, carga y selección no podrán desaparecer al aplicar un tema. Las composiciones deberán resolverse mediante plantillas, regiones y propiedades declarativas permitidas; no requieren una posición fija para cada componente.

Al seleccionar o cambiar de tema, su composición podrá servir como plantilla predeterminada. Se conservarán las preferencias personales que sigan siendo compatibles con la nueva composición. Si alguna deja de serlo, Kiwanto deberá identificar qué preferencias concretas están afectadas y ofrecer una resolución explícita y predecible: aplicar a esos valores incompatibles únicamente los valores predeterminados documentados de la nueva plantilla, conservando el resto de la distribución, o cancelar el cambio de tema. No se reemplazará silenciosamente toda la distribución ni se descartarán otras preferencias personales. No se permitirá ejecutar código arbitrario desde un tema. Los detalles del formato y de su validación deberán definirse antes de implementar la importación de temas.

### Regiones visuales independientes

El motor deberá permitir definir la apariencia y los efectos de cada región de forma independiente, mediante propiedades permitidas y con valores predeterminados seguros. Al personalizar controles por región, se aplican los límites funcionales y de estado definidos en esta sección. Las regiones iniciales previstas son:

- Barra de navegación global.
- Biblioteca y búsqueda.
- Área de presentación del juego.
- Información y descripción.
- Controles y botones.
- Futuras secciones y paneles.

Entre las composiciones futuras que deberán poder expresarse están una biblioteca transparente que muestre el fondo general sin desenfoque; una biblioteca con imagen, desenfoque y oscurecimiento propios; un separador oculto; y una barra central con iconos, logotipos, fondos o texturas personalizadas. La barra podrá adoptar identidades visuales variadas —por ejemplo, recordar el lateral de una caja de PlayStation 2 o el inventario de Minecraft— sin copiar recursos ni diseños protegidos. El área de juego podrá reorganizar carátula, título, botón, descripción y metadatos. Estos ejemplos describen capacidades futuras, no funciones actuales.

### Estructura funcional y presentación

La estructura funcional conserva navegación, biblioteca, búsqueda y filtros, selección de juegos, acciones, configuración y futuras funciones. La presentación determina composición, posiciones, dimensiones, recursos gráficos, colores, efectos y tipografía. Un tema podrá reorganizar visualmente componentes mediante contratos declarativos, pero no deberá eliminar responsabilidades funcionales, alterar datos de biblioteca ni romper acciones.

## 5. Diseño modular y distribución de paneles
Los componentes visuales deberán ser reutilizables.

Ejemplos:

- GameCard.
- GameList.
- GameDetails.
- Sidebar.
- SearchBar.
- FilterPanel.
- CollectionView.
- StatisticsPanel.
- SettingsPanel.

La interfaz podrá componerse de paneles independientes. En las vistas compatibles, el usuario podrá:

- Mostrar y ocultar paneles.
- Redimensionar barras laterales y zonas de contenido.
- Arrastrar separadores para ajustar las dimensiones.
- Cambiar la distribución de paneles cuando la vista lo permita.
- Guardar y volver a seleccionar diferentes distribuciones.

Los paneles y zonas redimensionables deberán respetar tamaños mínimos y máximos razonables para mantener la interfaz utilizable. Las distribuciones disponibles y sus límites dependerán de cada vista y deberán validarse con prototipos.

En el modo escritorio, la columna de biblioteca podrá ocultarse mediante un control ubicado en la barra lateral global, pero no podrá desactivarse permanentemente. Al volver a mostrarla deberá conservar el juego seleccionado, la posición de desplazamiento, los filtros activos y el estado de las categorías desplegadas.

La biblioteca tendrá dos modos principales de visualización:

- **Lista:** filas compactas con el icono o logotipo del juego a la izquierda y su nombre a la derecha.
- **Carátulas:** carátulas distribuidas en filas, con tamaño adaptable al ancho disponible. Al ampliar la columna de biblioteca, las carátulas podrán mostrarse a mayor tamaño.

Estos modos corresponden a la columna de biblioteca. El área principal del modo escritorio no será una cuadrícula general de juegos: presentará el juego seleccionado.

El área principal presentará:

- Una imagen artística del juego seleccionado ocupando el fondo del área.
- Una carátula, portada o box art de tamaño considerable hacia la izquierda.
- Un botón de jugar de tamaño normal hacia la derecha, con color configurable.
- Descripción y metadatos en la zona inferior, incluyendo desarrollador, editor, año, género, clasificación y plataforma cuando estén disponibles.

Las preferencias de distribución deberán persistir localmente. Las preferencias globales de aplicación se distinguirán de las específicas de una vista, para que cambiar la distribución de una vista no altere inesperadamente las demás.

## 6. Accesibilidad
La interfaz deberá considerar:

- Navegación mediante teclado.
- Contraste suficiente.
- Escalado de texto.
- Estados de foco visibles.
- Etiquetas accesibles.
- Reducción de animaciones.
- Legibilidad con temas y fondos personalizados.

La personalización no deberá ocultar controles esenciales ni hacerlos inaccesibles.

## 7. Rendimiento
La interfaz deberá evitar cargar toda la biblioteca simultáneamente cuando existan grandes cantidades de juegos.

El rendimiento visual es un requisito arquitectónico, no un refinamiento posterior. Se evaluará la virtualización de listas y cuadrículas. Ningún efecto costoso será obligatorio; desenfoque, transparencias complejas, animaciones y transiciones deberán poder desactivarse individualmente. Se evitarán animaciones permanentes sin una función clara.

Los recursos gráficos deberán optimizarse en resolución, formato y tamaño, y utilizar una caché con límites, invalidación y ciclo de vida definidos. Se evitarán recálculos y renderizados innecesarios. Se medirá el costo de los efectos en GPU, memoria y respuesta de la interfaz, y se ofrecerán alternativas de bajo consumo gráfico. La legibilidad y accesibilidad no dependerán de desenfoques, animaciones ni otros efectos. El sistema deberá seguir siendo utilizable en equipos con gráficos integrados y recursos modestos.

No se seleccionarán tecnologías adicionales para efectos o recursos hasta validar su compatibilidad con Tauri, React, el WebView de Linux y los equipos objetivo. No se afirmará que un efecto carece de impacto sin medirlo.

El ciclo futuro de recursos será bajo demanda: cargar la configuración del tema activo, priorizar recursos visibles y traer recursos adicionales cuando una región los necesite. Las imágenes se decodificarán al tamaño de presentación requerido cuando sea viable; no se decodificarán ni precargarán todos los temas, variantes, fuentes, GIF o videos al iniciar. La caché tendrá límites, política de expulsión, invalidación y liberación explícitos. Recursos fuera de pantalla reducirán o suspenderán animación y video. El movimiento reducido y las preferencias de efectos se respetarán antes de iniciar trabajo animado; no se mostrarán pantallas de carga para recursos que no se usarán.

La validación medirá memoria residente y de recursos, uso/costo de GPU disponible, tiempo de carga inicial y al cambiar de vista/tema, respuesta de interacción, estabilidad y recuperación tras navegación prolongada. Las pruebas incluirán imágenes grandes, SVG, GIF con muchos fotogramas, video, fuentes personalizadas, blur, transparencias, sombras, animaciones y composiciones complejas, incluyendo combinaciones representativas en hardware Linux modesto con GPU integrada. Los presupuestos numéricos se establecerán a partir de perfiles y dispositivos objetivo antes de implementar límites; no se fijan umbrales arbitrarios en esta especificación. Un recurso inválido o demasiado costoso debe fallar de manera acotada y comprensible sin dejar retenida memoria innecesaria.

## 8. Animaciones
Las animaciones y transiciones serán opcionales y no deberán afectar significativamente al rendimiento ni impedir el uso de la interfaz.

## 9. Fondos dinámicos
El fondo del área principal podrá utilizar fanart, ilustraciones, capturas u otras imágenes disponibles del juego seleccionado. A partir de imágenes disponibles localmente o ya presentes en la biblioteca, podrá extraer colores dominantes para crear fondos y degradados adaptativos. Los efectos podrán abarcar el área principal y ofrecer transiciones visuales entre zonas de la interfaz.

El usuario podrá configurar por separado:

- Oscurecimiento de la imagen.
- Oscurecimiento localizado.
- Desenfoque.
- Transparencias y superposición de capas.
- Transiciones visuales al cambiar de juego.
- Degradados y colores derivados de la imagen.
- Uso del fondo dinámico y de sus efectos.

Cada efecto deberá poder configurarse independientemente.

Los colores extraídos podrán guardarse en caché para evitar repetir el procesamiento. La caché deberá poder invalidarse cuando cambie la imagen o la configuración que afecta al resultado. El método de extracción, la identificación de cada entrada y el ciclo de vida de la caché deberán validarse antes de implementarse.

El uso de estos fondos no implica que Kiwanto descargue imágenes automáticamente ni habilita acceso de red por sí mismo.

## 10. Efectos y comportamiento visual
Además de los fondos dinámicos, podrán configurarse animaciones, transiciones, sombras, desenfoques y otros efectos visuales, así como sonidos opcionales y pantallas de carga personalizables.

El usuario deberá poder:

- Activar o desactivar individualmente los efectos y sonidos.
- Reducir o desactivar el movimiento.
- Reducir efectos costosos, como desenfoques o transiciones complejas.
- Elegir una presentación simplificada para equipos modestos o para quienes prefieran una interfaz sin efectos.

Las opciones deberán considerar las necesidades de accesibilidad y rendimiento. Sus costos y comportamiento deberán medirse en los equipos objetivo.

## 11. Configuración de interfaz
La configuración podrá presentarse en un modo básico y otro avanzado. El modo básico mostrará controles comunes; el avanzado expondrá opciones adicionales sin ocultar ni alterar silenciosamente las preferencias existentes.

Las opciones se organizarán en estas categorías:

- Distribución.
- Temas.
- Colores.
- Fondos.
- Efectos.
- Tipografía.
- Elementos.
- Comportamiento.
- Rendimiento.
- Perfiles.

Las preferencias deberán persistir localmente. La configuración global se distinguirá de las preferencias específicas de cada vista.

El idioma de la interfaz será una preferencia general de la aplicación: no pertenecerá a un tema, composición o complemento. La localización deberá ser nativa y utilizar archivos de idioma declarativos validados; las traducciones comunitarias no tendrán permisos de complemento. El idioma de la interfaz es independiente de los idiomas de metadatos o descripciones de cada juego y de su traducción. Los requisitos de formato, selección y respaldo de idiomas se describen en [LOCALIZATION_AND_TRANSLATION.md](LOCALIZATION_AND_TRANSLATION.md).

### Implementación inicial del prototipo

La interfaz actual del modo escritorio se conserva como la primera interfaz de referencia de Kiwanto y base funcional para el futuro tema oficial predeterminado. El motor deberá evolucionar sobre ella, no desecharla ni reemplazarla para empezar de cero.

La primera base de personalización incluye tokens tipados para colores, tipografía, espaciado, bordes, sombras, opacidad, degradados, efectos y dimensiones, además de contratos para tres regiones (navegación, biblioteca y presentación), composición y referencias locales de recursos. Actualmente se aplican dos temas integrados (oscuro y claro) sobre la composición funcional existente de tres zonas. El renderizador no interpreta composiciones alternativas ni personalización independiente para las regiones de información, descripción y controles; tampoco carga recursos de tema. La pantalla Configuración permite seleccionar y restaurar el tema, pero no es todavía un editor.

La única preferencia persistida actualmente es el identificador de tema integrado, en un archivo JSON local mediante comandos Rust acotados, con versión de esquema y validación de los identificadores permitidos. La aplicación rechaza datos con formato o versión no compatibles en lugar de reemplazarlos silenciosamente. Esto no establece todavía un formato importable de temas o perfiles ni persistencia de distribuciones.

El editor manual de juegos usa un selector desplegable con búsqueda y multiselección respaldado por la taxonomía canónica de SQLite. Los términos seleccionados se muestran como etiquetas removibles; los términos heredados no clasificados se conservan aparte. El selector no crea categorías a partir del texto de búsqueda. El catálogo inicial es limitado y la edición avanzada de la taxonomía sigue pendiente.

El contrato de composición define ubicación, orden, visibilidad y límites para las tres regiones actuales, además de un separador. El código de aplicación de tokens utiliza los tokens visuales y algunos límites de la biblioteca y visibilidad del separador; no consume las ubicaciones, el orden ni una composición alternativa. El modelo incluye un contrato de perfil de interfaz, pero no permite crear temas, escoger otras composiciones, cargar recursos de tema ni guardar distribuciones o perfiles. Las categorías de configuración que no tienen controles implementados se identifican como futuras.

## 12. Paquetes de temas y perfiles de interfaz
La distinción entre tema, composición y preferencias personales se define en la sección 4. Esta sección especifica el empaquetado y la validación para importación y exportación; no cambia el ámbito de esos elementos.

Los temas y perfiles podrán exportarse e importarse como paquetes declarativos. Los paquetes deberán incluir metadatos para identificar su tipo, su versión de formato y la compatibilidad con Kiwanto. La versión del formato deberá distinguirse de la versión de Kiwanto y de la versión propia del tema o perfil.

Los paquetes de tema deberán ser autocontenidos respecto de los recursos redistribuibles que requieran para su apariencia. Podrán referenciar recursos integrados o recursos explícitamente opcionales, pero no depender silenciosamente de una ruta local del autor ni de una descarga remota. Al exportar, los recursos redistribuibles usados por el tema deberán acompañarlo, con licencias y atribuciones declaradas; el exportador informará de los recursos que no pueda incluir y no producirá un paquete aparentemente completo. No se incluirán datos de biblioteca, artwork personal de juegos ni contenido de fichas en un paquete de tema o perfil.

El manifiesto versionado deberá identificar de forma estable el paquete y declarar nombre, autoría declarada, versión del tema, versión del formato, descripción, compatibilidad con Kiwanto, variantes de Desktop y Big Picture, tokens/configuración, composición, recursos, procedencia, licencias y atribuciones. La identidad y autoría declaradas no son prueba de autenticidad. Integridad mediante checksums y validación completa del manifiesto forman parte del contrato; el formato exacto y la política de confianza siguen pendientes.

La importación deberá validar el formato, las versiones, los metadatos, la configuración, las referencias y los recursos antes de aceptarlos, incluidos tipos, integridad, procedencia y compatibilidad. No resolverá dependencias de red ni buscará silenciosamente recursos fuera del paquete o de ubicaciones permitidas. Importar un tema no activará otro modo ni sobrescribirá preferencias personales compatibles; las incompatibilidades se resolverán según el procedimiento explícito de la sección 4. Los errores e incompatibilidades deberán comunicarse claramente, sin aplicar cambios parciales de forma silenciosa. El esquema de manifiesto, límites justificados de tamaño/cantidad, algoritmos de checksum, empaquetado y migración del formato quedan pendientes de diseño; esta especificación no implica que la importación o exportación esté implementada. El formato se diseñará para que una biblioteca comunitaria futura pueda distribuir paquetes declarativos sin depender del sistema de complementos; no se implementa ahora un catálogo o marketplace.

## 13. Extensibilidad visual futura
En el futuro, la interfaz podrá contemplar espacios acotados para que complementos aporten paneles, vistas o elementos visuales. Los temas seguirán siendo configuración declarativa de apariencia; los complementos serán extensiones funcionales sujetas a un diseño de interfaces y seguridad separado.

Estos espacios no constituyen una API de complementos disponible. Sus interfaces estables, compatibilidad por vista y reglas de composición deberán definirse antes de permitir extensiones visuales.

## 14. Aspectos pendientes de validar
Antes de implementar las funciones avanzadas se deberá investigar y probar:

- Qué vistas admiten qué distribuciones, y sus tamaños mínimos y máximos.
- Cómo representar y validar los contratos declarativos de composición, componentes y propiedades admitidas sin depender exclusivamente de CSS.
- Cómo permitir personalización independiente por región sin duplicar comportamiento ni romper accesibilidad.
- Cómo representar y persistir las preferencias globales y específicas de vista.
- Qué formato declarativo permite versionar, importar, exportar y migrar temas y perfiles.
- Qué recursos podrán incluirse en los paquetes y cómo validarlos.
- Límites de resolución, formato, tamaño, cantidad y memoria para los recursos gráficos y su caché.
- Qué método de extracción de colores ofrece resultados útiles con un costo aceptable.
- Cómo identificar e invalidar la caché si cambian las imágenes o los ajustes.
- Cómo medir el costo de cada efecto en GPU, memoria y capacidad de respuesta en equipos con gráficos integrados y recursos modestos.
- Cómo mantener contraste, foco, legibilidad y reducción de movimiento con temas personalizados.
- Cómo validar Big Picture con varios mandos conectados, elegir o cambiar el mando principal y resolver la entrada cuando más de uno está activo.
- Qué comportamiento ofrecer al desconectar y reconectar el mando principal, incluidos la selección de dispositivo, el estado de navegación y la recuperación del foco a un control que siga disponible.
- Cómo mostrar indicadores de botones adecuados al dispositivo y su mapeo, con alternativas comprensibles cuando no se conozca el modelo o la asignación.
- Qué controles podrán reasignarse, cómo guardar y restablecer las asignaciones, detectar conflictos y ofrecer valores predeterminados recuperables.
- Cómo asegurar que los cambios o pérdidas de dispositivo no bloqueen la navegación ni alteren la selección compartida de juegos.

No se deberán incorporar bibliotecas adicionales ni mecanismos de ejecución de temas o complementos sin una necesidad demostrada, una decisión aprobada y una evaluación de seguridad.

## 15. Modos de interfaz: escritorio y Big Picture / TV

Los modos son dos presentaciones del mismo producto y de los mismos datos, no dos aplicaciones ni dos bibliotecas:

- **Desktop Mode:** orientado principalmente a ratón y teclado. La referencia actual conserva una barra global estrecha, una biblioteca lateral independiente y ocultable, y la presentación del juego seleccionado. Su evolución podrá cambiar la apariencia de la barra sin perder sus destinos ni mezclar navegación, biblioteca y presentación.
- **Big Picture / TV Mode:** experiencia propia para televisores y pantallas grandes, legible desde varios metros y controlable mediante mando, teclado y ratón. No será una versión de escritorio ampliada.

La aplicación actual implementa Desktop Mode y Big Picture sobre la biblioteca persistente en SQLite y los servicios compartidos; los fixtures de `src/data/games.ts` no se insertan en la base del usuario. Desktop ofrece navegación global, búsqueda/filtros básicos, favoritos, colecciones manuales, selección de juego y tema. Big Picture ofrece biblioteca, favoritos, colecciones, detalle y navegación por teclado, con diferencias y limitaciones registradas en [PROJECT_STATUS.md](PROJECT_STATUS.md) y [KNOWN_ISSUES.md](KNOWN_ISSUES.md). Estadísticas y complementos siguen siendo destinos sin funcionalidad. La arquitectura tipada de temas contiene regiones visuales y dos temas integrados, pero no implementa composiciones alternativas, variantes de tema por modo ni el motor completo de personalización.

Big Picture deberá diseñar desde el inicio:

- Tipografía, portadas, botones y áreas de selección grandes, legibles y con contraste suficiente.
- Composición adaptable a resoluciones y proporciones diferentes; tamaños mínimos, safe areas y puntos de adaptación quedan por medir en prototipos.
- Navegación principal visible con iconos y nombres, y biblioteca organizada mediante tarjetas, portadas y secciones.
- Presentación de juego propia de TV, con acciones primarias distinguibles y metadatos legibles.
- Accesos a biblioteca, favoritos, colecciones, estadísticas y configuración, con estados honestos cuando una función aún no esté disponible.
- Menús contextuales y de acción rápida, filtros/orden, opciones de lanzamiento, ajustes, confirmaciones, diálogos informativos/errores y notificaciones.
- Indicadores persistentes de foco y selección; estados vacíos, de carga y error; ninguna acción esencial condicionada al hover.

## 16. Estado compartido y navegación entre modos

Los modos comparten el catálogo, las instalaciones, metadatos y recursos gráficos, colecciones, favoritos, estadísticas, reglas de búsqueda y filtros, perfiles de lanzamiento, historial y preferencias de aplicación. Cambiar de modo nunca crea otra biblioteca ni duplica reglas de negocio.

Se preservarán el identificador del juego seleccionado, la consulta y filtros activos y la colección/sección vigente cuando tenga sentido en ambos modos. Cada modo podrá conservar por separado su desplazamiento, grupo o estante expandido, vista de biblioteca, destino de navegación y ancla de foco. La posición de foco es estado temporal de presentación, no una preferencia persistente ni una selección de juego. Si el destino enfocado deja de existir o ya no es visible, se restaurará un control válido de la sección; mover el foco no cambiará por sí solo el juego seleccionado.

La navegación global conserva los mismos destinos y responsabilidades en ambos modos. En escritorio puede seguir siendo una barra compacta de iconos accesibles; en TV puede ser una barra horizontal o lateral ampliada, con etiquetas visibles y objetivos grandes. La biblioteca permanece diferenciada de la navegación global y la presentación del juego seleccionado permanece diferenciada de ambas. La barra global tendrá un acceso reversible al cambio de modo y a configuración desde los dos modos.

## 17. Interacción, mando y foco

La navegación lógica deberá ser independiente del dispositivo. Mando, teclado y ratón activarán las mismas acciones semánticas: mover foco, seleccionar, confirmar, volver/cancelar, abrir/cerrar menús, cambiar de sección y desplazarse por listas/tarjetas. Cada modo determinará el recorrido de foco apropiado para su composición. Big Picture conservará navegación completa por teclado y uso de ratón; el foco no dependerá del hover.

Al abrir una ventana emergente, el foco pasará a una opción o encabezado significativo y se guardará el control que la abrió. Al cerrar, volverá al invocador si sigue disponible; si no, se recuperará en el elemento lógico más cercano o en el encabezado/control válido de la sección. Los elementos deshabilitados, eliminados o filtrados no podrán dejar el foco perdido. Habrá una indicación visual clara de foco y selección, direcciones coherentes, y una salida de cancelar/volver en cada nivel.

La propuesta técnica inicial para mandos es evaluar la Gamepad API expuesta por el WebView, sin añadir dependencias ahora. La compatibilidad real en Linux/WebKitGTK, controladores y versiones de WebView requiere validación en los equipos objetivo; véase [TECH_STACK_DECISION.md](TECH_STACK_DECISION.md). No se asumirá que una asignación estándar está disponible para todos los mandos.

## 18. Menús, diálogos y cambio de modo

Los menús contextuales de juego, acciones rápidas, filtros/orden, opciones de lanzamiento y ajustes compartirán contratos de interacción, acciones y cierre; su tamaño, ubicación y distribución podrán variar por modo. Un menú no modal no ocultará la navegación restante y siempre ofrecerá una acción clara de volver/cerrar. Un diálogo verdaderamente modal podrá contener el foco mientras esté abierto. Escape y cancelar/volver cierran el nivel superior cuando sea seguro; nunca equivalen a confirmar una acción destructiva. Las notificaciones no robarán el foco sin una razón explícita.

La propuesta inicial para alternar modos es `Ctrl+Shift+B`, sin implementarlo todavía. El atajo deberá revisarse frente a conflictos con escritorio Linux, WebKit y otras acciones, ignorarse mientras un campo editable o método de entrada consume la combinación y poder configurarse en Ajustes en el futuro. Al remapear, Ajustes deberá detectar combinaciones duplicadas con otros atajos de Kiwanto; los conflictos con atajos globales del sistema se probarán y comunicarán cuando no puedan detectarse automáticamente. No será la única vía: habrá un control visible y reversible en ambos modos.

Si se solicita cambiar de modo con un diálogo modal abierto, Kiwanto permanecerá en el modo actual y no cerrará, omitirá ni confirmará el diálogo. Los menús no modales podrán cerrarse al completar un cambio. Las operaciones independientes de la presentación continuarán y mostrarán su estado en el modo nuevo; los flujos que requieran una confirmación vinculada a la vista deberán resolverla antes del cambio. Cambiar de modo nunca cancelará ni repetirá una operación.

## 19. Temas, regiones y perfiles compatibles con ambos modos

Los conceptos de modo, tema, composición y perfil de interfaz, y la relación entre plantilla y preferencias personales, se definen en la sección 4. Para ambos modos, el motor podrá ofrecer variantes de tema y composiciones compatibles específicas de escritorio y TV, reutilizando tokens o recursos cuando sean apropiados, sin forzar una misma distribución en ambas experiencias. La personalización independiente por región deberá admitir las diferencias de cada modo y preservar las responsabilidades, acciones y estados de los controles establecidos en la sección 4.

La selección de variante y el cambio de tema deberán respetar la compatibilidad de preferencias descrita en la sección 4. Los perfiles deberán validar la compatibilidad entre modo, variante, composición y preferencias sin redefinir estos conceptos; el alcance de importar y exportar esos perfiles se especifica en la sección 12.

Actualmente existen dos temas integrados aplicados a la composición de escritorio existente y un tipo de perfil en TypeScript, pero no variantes TV, motor de composición, editor ni persistencia de perfiles. Todo el sistema descrito en este apartado es diseño futuro.

## 20. Menús contextuales del producto

Kiwanto tendrá menús contextuales propios y adaptados al elemento sobre el que se invocan. No serán un menú universal con acciones irrelevantes: mostrarán las operaciones pertinentes y reflejarán claramente cuándo una operación no está disponible. Este sistema es un requisito de diseño futuro; no implica que estos menús o sus operaciones estén implementados actualmente.

Las acciones previstas incluyen:

**Sobre un juego:**

- Mostrar la carpeta asociada, cuando exista y sea accesible.
- Renombrar el juego dentro de la biblioteca.
- Editar su información.
- Buscar metadatos.
- Cambiar la carátula.
- Añadir o quitar de favoritos.
- Abrir sus propiedades.

**Sobre un espacio vacío de biblioteca:**

- Opciones de visualización y organización.
- Acciones generales pertinentes para la biblioteca.

**Sobre un recurso visual:**

- Cambiar la imagen.
- Buscar alternativas.
- Restablecer la imagen.

Solo aparecerán acciones aplicables al elemento y contexto actuales. Una acción pertinente pero temporalmente no disponible deberá mostrar un estado deshabilitado comprensible y, cuando sea útil, el motivo. Los menús respetarán el tema y harán distinguibles foco, selección y deshabilitado. Deberán ser navegables por teclado y, cuando corresponda a la vista, mediante gamepad. Al abrirlos y cerrarlos, seguirán el ciclo de foco y recuperación descrito en las secciones 17 y 18; un menú no modal no bloqueará sin salida el resto de la navegación.

En los elementos y superficies administrados por Kiwanto, los menús propios reemplazarán las opciones contextuales predeterminadas del WebView; durante el uso normal no mostrarán acciones como recargar, inspeccionar elemento ni opciones de depuración. Las herramientas de desarrollo conservarán un acceso deliberado y separado para uso de desarrollo.

Esta sustitución no eliminará las operaciones contextuales de edición de texto. Los campos de texto, áreas editables y controles equivalentes conservarán las acciones apropiadas —como copiar, pegar, cortar y seleccionar todo— mediante un menú de edición propio o el comportamiento nativo seguro cuando corresponda.

Los límites de operaciones sobre el sistema son explícitos:

- «Mostrar carpeta» abrirá la ubicación mediante una operación segura del sistema. No ejecutará ni abrirá automáticamente archivos de juego encontrados.
- «Renombrar» modificará inicialmente solo el nombre de la entrada en la biblioteca, no el ejecutable ni los archivos físicos.
- Cambiar rutas, ejecutables o archivos requerirá una acción expresa, validaciones adicionales y un resultado comunicado al usuario.
- Ninguna acción contextual ejecutará comandos arbitrarios ni solicitará privilegios elevados.

## 21. Búsqueda y aplicación de metadatos

La acción «Buscar metadatos» abrirá un diálogo propio. En él, el usuario podrá elegir uno o varios proveedores que estén realmente disponibles según las integraciones y capacidades instaladas. No se presupone que una fuente candidata ya esté implementada, accesible o autorizada.

El diálogo presentará los resultados para revisión antes de aplicarlos. El usuario podrá aceptar valores de distintos proveedores de manera independiente, en vez de reemplazar toda la ficha con una única fuente. Las modificaciones manuales tendrán precedencia y nunca se sobrescribirán silenciosamente; los conflictos y los campos afectados deberán quedar claros antes de confirmar.

Esta acción consulta datos descriptivos del juego. Es distinta del buscador unificado de imágenes, cuya responsabilidad es localizar y presentar recursos visuales para selección, con sus propios requisitos de procedencia, atribución, validación y almacenamiento local (véase [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md)). Los proveedores, sus permisos, métodos de acceso y condiciones de uso deberán verificarse antes de ofrecerlos.

El diálogo y el flujo de aplicación selectiva son requisitos conceptuales: no están implementados por el prototipo.

## 22. Plantillas y editor visual de composiciones

Una plantilla define una composición reutilizable de regiones, contenedores y slots compatibles; no es un tema ni guarda por sí sola las elecciones personales del usuario. El tema aporta identidad visual y estilos, mientras el perfil y las preferencias conservan las selecciones y ajustes compatibles, de acuerdo con la precedencia de la sección 4. Las plantillas iniciales prediseñadas deberán poder usarse sin edición y evolucionar con versiones y migraciones que preserven composiciones guardadas.

El editor será visual y ofrecerá dos modalidades. La edición sencilla permitirá elegir una plantilla y ajustar recursos visuales, colores, tipografías, tamaños, alineación, espaciado, posición dentro de límites seguros y visibilidad de elementos opcionales. La edición avanzada permitirá reorganizar regiones, mover/redimensionar componentes compatibles, configurar contenedores, filas, columnas, proporciones y capas, y guardar composiciones reutilizables.

No será un lienzo libre ni permitirá insertar HTML, CSS, JavaScript, scripts, comandos, recursos externos silenciosos o acceso irrestricto a archivos. Usará componentes registrados, slots con tipos admitidos, guías/rejillas, límites de tamaño, reglas explícitas para superposición intencional, vista previa y validación antes de guardar. La validación protegerá foco, contraste, legibilidad, navegación, acciones y estados funcionales. La composición nunca cambia la lógica del producto ni elimina requisitos de accesibilidad.

El editor y sus componentes se diseñarán para reutilizarse en presentaciones de colecciones y juegos, Desktop Mode, Big Picture y otras regiones componibles. Las colecciones serán uno de los primeros usos, no el único. El editor completo viene después de Big Picture funcional y validado; esta etapa no lo requiere. El contrato de seguridad para composiciones y recursos se integra con [SECURITY.md](SECURITY.md), y el contenido enriquecido/documentos permanecen separados según [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md).
