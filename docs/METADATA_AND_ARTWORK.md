# Metadatos e imágenes de videojuegos

## 1. Estado y alcance

Este documento define requisitos para obtener, normalizar y conservar información e imágenes de juegos. Describe capacidades futuras: no hay proveedores de metadatos o imágenes integrados ni un buscador común implementado en el prototipo.

La biblioteca local seguirá siendo útil sin conexión y no dependerá de un único proveedor. Las fuentes externas serán opcionales. La información manual y los recursos locales deberán seguir disponibles si una fuente deja de funcionar, se desactiva o cambia sus condiciones.

Los requisitos de identidad del juego, instalaciones y relaciones pertenecen al modelo de biblioteca descrito en [LIBRARY_SYSTEM.md](LIBRARY_SYSTEM.md). Este documento no define un esquema SQL ni una API concreta.

## 2. Obtención y clasificación de información

Kiwanto deberá permitir tres modalidades que puedan coexistir:

- **Automática:** consultar proveedores habilitados y actualizar únicamente la información que el usuario haya autorizado.
- **Manual:** introducir datos o importar archivos locales.
- **Asistida:** buscar coincidencias, comparar resultados y dejar que el usuario elija qué incorporar.

Cada proveedor se clasificará según su mecanismo real de acceso:

1. API oficial documentada.
2. Descarga de conjuntos de datos.
3. Importación de datos locales.
4. Integración comunitaria no oficial.
5. Introducción o importación manual.

La clasificación y el estado de cada integración deberán basarse en investigación vigente. No se inferirá que un proveedor ofrece acceso gratuito, almacenamiento permanente, redistribución, una API pública o autorización para extracción automatizada.

Antes de habilitar un proveedor, Kiwanto deberá describir sus capacidades y, cuando corresponda, registrar:

- Identificador estable y nombre visible.
- Tipo y método de acceso.
- Estado: planificado, experimental, disponible o deshabilitado.
- Necesidad de cuenta, autenticación, clave o credenciales.
- Límites de solicitudes y estrategia de actualización.
- Condiciones de uso, almacenamiento, redistribución y atribución conocidas.
- Datos y operaciones que ofrece.
- Dependencias, conectividad y modos de fallo.

Las credenciales no se escribirán en logs ni en archivos de configuración ordinarios. Su almacenamiento seguro, si alguna integración futura lo requiere, necesita una decisión específica; el diseño inicial no almacena credenciales de tiendas.

### Fuentes candidatas

Los nombres siguientes son candidatos de evaluación, no integraciones confirmadas. La forma de acceso, disponibilidad, licencias, cuotas y condiciones deben comprobarse antes de cada implementación.

| Candidato | Posible uso | Validación pendiente |
|---|---|---|
| IGDB | Metadatos mediante el mecanismo que su documentación vigente permita | Acceso, autenticación, cuotas, atribución, almacenamiento y uso de los datos |
| LaunchBox Games Database / `Metadata.zip` | Paquete descargable e importación local de metadatos e imágenes | Disponibilidad, formato, versión, condiciones de uso y actualización; no asumir URL ni estabilidad del paquete |
| Archivos de LaunchBox del usuario | Importación de XML, metadatos e imágenes existentes | Ubicación autorizada por el usuario, formatos, lectura exclusivamente no destructiva y licencias |
| SteamGridDB | Candidato principal para explorar carátulas, fondos, logos y otros recursos | API o mecanismo vigente, autenticación, cuotas, atribución, almacenamiento y términos |
| PlayStation Store, Wikipedia, IGN y fuentes comunitarias | Posibles datos complementarios | Método permitido, fiabilidad, términos y posibilidad de conservar cada campo |

No se recurrirá a evasión de autenticación, bloqueos, mecanismos antibots o restricciones de acceso. Una fuente comunitaria o no oficial deberá identificarse como tal, incluso si técnicamente funciona.

## 3. Contrato conceptual de proveedor

Los proveedores entregarán resultados al sistema común de Kiwanto; no implementarán cada uno su propio buscador visual ni serán dueños del modelo de biblioteca. Sus adaptadores deberán separar acceso remoto o lectura de archivos, normalización, atribución, errores y actualización de resultados.

El contrato futuro deberá permitir consultar capacidades, buscar, obtener detalles cuando el proveedor lo admita, cancelar operaciones cuando sea posible y reportar errores o límites sin ocultarlos. Deberá admitir que un proveedor no tenga ciertos campos o capacidades. Una indisponibilidad no deberá impedir consultar o editar los datos locales.

La lista final de operaciones, el tratamiento de límites y la compatibilidad de versiones se definirán después de validar proveedores reales. No se selecciona ahora un framework, protocolo interno ni dependencia.

## 4. Normalización, identidad y procedencia

La información externa deberá normalizarse a conceptos comunes sin descartar los valores y referencias de origen que sean necesarios para explicar su procedencia. Los campos previstos incluyen:

- Título principal y títulos alternativos.
- Descripción y argumento.
- Fecha de lanzamiento.
- Desarrolladores y distribuidores.
- Plataformas y sistemas.
- Géneros, etiquetas y temas.
- Clasificación por edades.
- Idiomas disponibles.
- Puntuaciones y valoraciones.
- Franquicias y relaciones con otros juegos.
- Campos que se incorporen más adelante.

La identidad interna del juego será independiente de cualquier proveedor. Se conservarán identificadores externos junto con el identificador de su proveedor, y sus correspondencias no se inferirán únicamente por el nombre. La resolución deberá tener en cuenta edición, remasterización, versión de plataforma y duplicados potenciales. Una coincidencia dudosa se presentará para revisión, no se fusionará automáticamente.

La procedencia deberá poder consultarse por campo cuando sea relevante: valor, fuente o autoría, fecha de obtención o modificación y, cuando aplique, referencia externa y atribución. No es necesario conservar todas las copias completas de cada respuesta si no son necesarias, legales o útiles; esa política se decidirá por proveedor.

Para resolver discrepancias:

- El usuario podrá comparar resultados y consultar fuentes alternativas.
- Podrá establecer una fuente preferida de forma general, sin convertir esa preferencia en una regla que reemplace toda decisión individual.
- Podrá seleccionar o actualizar campos concretos.
- Las modificaciones manuales prevalecerán hasta que el usuario autorice cambiarlas.
- Una actualización parcial no sustituirá campos ajenos a ella ni borrará valores porque la fuente no los haya devuelto.
- Kiwanto deberá mostrar qué cambiará antes de aplicar una actualización asistida o potencialmente destructiva.

La prioridad general de proveedor y la selección manual por campo son decisiones distintas. El formato de almacenamiento y el mecanismo de resolución siguen pendientes; estos requisitos no fijan tablas.

## 5. Búsqueda y selección de imágenes

El sistema de imágenes deberá admitir, al menos, carátulas verticales, portadas horizontales, fanart y fondos, banners, logos transparentes, iconos, capturas, imágenes de disco y tipos futuros. La búsqueda podrá consultar varios proveedores y presentar resultados en una experiencia común, sin obligar a cada proveedor a desarrollar una interfaz independiente.

La interfaz futura permitirá buscar por juego, elegir el tipo de imagen, filtrar por dimensiones, resolución, formato y proveedor, comparar resultados, seleccionar uno, importar un archivo local o proporcionar una URL. Sustituir o retirar la imagen seleccionada será una acción explícita. Los metadatos de un resultado deberán mostrar su proveedor y atribución cuando corresponda.

Estos son requisitos de producto, no funciones actuales. La descarga desde una URL tratará la URL, la respuesta y la imagen como contenido no confiable y deberá:

- Admitir únicamente esquemas HTTP y HTTPS.
- Bloquear localhost, loopback y direcciones de redes privadas o restringidas, de modo que la función no pueda convertirse en acceso arbitrario a la red local.
- Validar cada destino de redirección antes de continuar; no confiar solamente en la URL inicial.
- Aplicar límites configurables y seguros para tamaño de descarga, tiempo, dimensiones de imagen y consumo de recursos.
- Validar el contenido real como imagen, no limitarse a la extensión, nombre de archivo o tipo MIME declarado.

La política de URL y destino deberá aplicarse de forma que las redirecciones o respuestas no permitan eludir estas restricciones. Los valores, técnicas de validación y límites concretos quedan pendientes de investigación y aprobación; no se selecciona una biblioteca ni un mecanismo de implementación.

## 6. Archivos, referencias y ciclo de vida

Las imágenes de juegos descargadas o importadas se almacenarán como archivos locales independientes. SQLite podrá conservar referencias y metadatos, pero no los bytes binarios completos de las imágenes. El almacenamiento de imágenes de juegos estará separado del de temas e interfaces; sus permisos, ciclo de vida y política de exportación no se mezclarán.

El diseño del almacén deberá definir:

- Directorios administrados y resolución segura de referencias.
- Identidad de recursos, reutilización y detección de duplicados cuando sea viable.
- Formatos, dimensiones, resolución, tamaño y cantidad permitidos.
- Caché, invalidación y comportamiento cuando el recurso falte o esté dañado.
- Sustitución y eliminación sin borrar archivos del usuario fuera del ámbito administrado.
- Procedencia, atribución y requisitos para conservar o retirar recursos.
- Qué recursos y referencias incluyen los respaldos y cómo opera la biblioteca sin conexión.

La validación deberá considerar archivos corruptos, contenido engañoso, rutas no autorizadas y consumo excesivo de memoria o GPU. No se decidirán ahora el formato de imagen, límites numéricos ni el algoritmo de deduplicación. La limpieza nunca deberá borrar datos de usuario de forma silenciosa.

## 7. Paquetes de datos descargables e importación local

El caso de un conjunto de datos de LaunchBox requiere un adaptador que no dependa de una URL, nombre de paquete o formato inmutable. Si `Metadata.zip` u otro paquete estuviera disponible y su uso fuera compatible con sus condiciones, el flujo podrá contemplar:

- Comprobación de versión y disponibilidad.
- Descarga automática opcional, descarga manual o selección de un paquete existente.
- Verificación de integridad cuando el proveedor publique un mecanismo fiable.
- Cancelación, recuperación de descargas y errores visibles.
- Extracción y procesamiento local sin ejecutar archivos incluidos.
- Construcción de índices de búsqueda y actualización incremental cuando sea viable.
- Conservación del índice funcional anterior si la actualización falla.
- Retirada explícita de los datos descargados y comunicación del espacio recuperable.

Los archivos XML, metadatos e imágenes de una instalación existente de LaunchBox solo podrán leerse desde una ubicación que el usuario haya seleccionado o autorizado. La importación será de solo lectura y no modificará ni eliminará los archivos originales. Formato, acceso, términos y viabilidad siguen pendientes de investigación.

## 8. Funcionamiento sin conexión

La búsqueda, edición y visualización de los datos locales disponibles no deberán requerir conexión. Las consultas remotas y actualizaciones serán explícitas, opcionales y comunicarán qué proveedor se contacta. La falta de red o una fuente deshabilitada no eliminará datos locales ni impedirá abrir la biblioteca.

Los datos descargados podrán conservarse localmente únicamente en la medida permitida por las condiciones verificadas de su proveedor. La antigüedad de un resultado o caché no se presentará como actualización confirmada. La disponibilidad offline no implica que todos los datos externos puedan almacenarse indefinidamente.

## 9. Aspectos pendientes

Antes de implementar proveedores o importadores, se debe investigar por separado la documentación y condiciones actuales de cada candidato; confirmar métodos de acceso, autenticación, cuotas, atribución, almacenamiento, actualización y redistribución; validar formatos reales con fixtures seguros; y definir límites y políticas de retención. No se declara ningún proveedor integrado, autorizado, gratuito o permanentemente disponible.

Véase también [LOCALIZATION_AND_TRANSLATION.md](LOCALIZATION_AND_TRANSLATION.md) para idiomas de interfaz y traducción de contenido, [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md) para la clasificación de proveedores y extensiones, y [SECURITY.md](SECURITY.md) para el tratamiento de datos externos no confiables.

## 10. Contenido enriquecido de juegos y colecciones

El contenido enriquecido es distinto de los recursos de tema, del artwork y de la composición visual. En una evolución futura, una ficha de juego o una colección podrá contener bloques que el usuario añada, edite, ordene y quite, incluidos texto, imágenes, GIF, galerías, videos, trailers, líneas del tiempo, secciones informativas, enlaces y otros tipos seguros que se aprueben. El contenido asociado a una colección pertenece a esa colección; el contenido asociado a un juego pertenece a la ficha y no depende de que el juego esté en una colección.

Las colecciones podrán referenciar una portada y un fondo independientes, con imágenes verticales u horizontales adaptadas mediante recorte/ajuste y elección explícita del usuario. Estos recursos de presentación no son bloques editoriales ni artwork de un juego. El modelo de presentaciones y composiciones se describe en [UI_AND_THEMES.md](UI_AND_THEMES.md).

Los medios locales se validarán y solo se leerán desde ubicaciones autorizadas; los medios externos deberán tener una carga explícita y validada, caché local/offline y fallos comprensibles. No habrá scripts, HTML activo, ejecución de código ni reproducción automática de audio. La reproducción de video, sus controles, consumo y accesibilidad deberán validarse antes de ofrecerse. El contenido enriquecido no se incluirá en paquetes de temas y los paquetes de temas no podrán modificarlo.

Los manuales y documentos serán adjuntos separados del artwork y del contenido editorial, y podrán asociarse a juegos o, cuando tenga sentido, a contenido de colecciones. La vista habitual podrá usar una tarjeta de libro: portada propia si existe, artwork de juego como sustituto provisional o una imagen elegida por el usuario. El archivo original seguirá separado de su cubierta visual. Los documentos se validarán por formato, tamaño, ruta e integridad y se cargarán/abrirán solo ante una acción explícita de consulta, nunca al abrir por sí sola una ficha o colección.

Una futura música opcional de colección será un recurso de audio local distinto del contenido editorial, desactivado/no configurado por defecto y sujeto a las referencias controladas y reglas de seguridad de [DECISIONS.md](DECISIONS.md). No se descargarán pistas automáticamente.

No existe actualmente un editor de bloques, almacenamiento de contenido enriquecido, gestión de documentos/manuales ni música de colecciones. Los modelos, formatos admitidos, atribución, almacenamiento, eliminación, caché y respaldo siguen pendientes de diseño. Las capacidades de generación mediante IA se describen como futuras y no son requisito de esta función; véase [DECISIONS.md](DECISIONS.md).
