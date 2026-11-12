# Localización de interfaz y traducción de contenido

## 1. Estado y separación de responsabilidades

Este documento establece requisitos futuros; el prototipo actual no cuenta con un sistema de localización ni de traducción de contenido.

La **localización de la interfaz** traduce los textos propios de Kiwanto y es una capacidad nativa de la aplicación. La **traducción de contenido** transforma metadatos o descripciones de juegos y es opcional, asociada al contenido y al motor o proveedor utilizado. Son sistemas distintos: cambiar el idioma de la interfaz no debe traducir ni modificar los datos de un juego, y la traducción de un juego no cambia el idioma de la interfaz.

Ninguno de los dos sistemas debe requerir un complemento ejecutable. Los archivos de idioma serán datos declarativos validados. El idioma de la interfaz será una preferencia general de Kiwanto, no una propiedad del tema ni de una distribución concreta. Los requisitos de temas e interfaz se relacionan en [UI_AND_THEMES.md](UI_AND_THEMES.md).

## 2. Localización nativa de la interfaz

La interfaz deberá utilizar identificadores estables para los textos y archivos de idioma independientes. Se mantendrá una plantilla de referencia que permita comparar y validar claves. Como ejemplos de nombres regionales pueden utilizarse `en-US`, `es-AR`, `es-ES` y `pt-BR`; estos ejemplos no determinan qué idiomas estarán disponibles en la primera versión.

El sistema deberá contemplar:

- Un idioma elegido por el usuario y un idioma predeterminado documentado.
- Detección opcional del idioma del sistema, con elección o configuración clara por parte del usuario.
- Una regla determinista de respaldo cuando falte un idioma o una clave. La selección regional podrá recurrir a una variante base compatible y, finalmente, al idioma predeterminado; la decisión final sobre idiomas iniciales queda pendiente.
- Archivos de traducción comunitarios que puedan validarse e instalarse como datos, sin ejecutar código.
- Importación y exportación con validación de estructura, claves, versiones y compatibilidad.
- Errores comprensibles para archivos incompletos, claves inválidas o incompatibles.

Los ejemplos `template.json`, `en-US.json`, `es.json`, `es-AR.json` y `pt-BR.json` ilustran una posible organización, no fijan formato ni ubicación. El esquema, interpolación, pluralización, formato de fechas/números y compatibilidad deberán diseñarse y probarse antes de implementar. Los textos visibles deben evitarse como claves implícitas.

Una traducción ausente no debe bloquear una acción ni dejar un control sin nombre accesible. El respaldo debe mantener textos funcionales y accesibles y, durante desarrollo, ayudar a detectar claves faltantes.

## 3. Traducción opcional de descripciones y metadatos

La traducción de contenido podrá ofrecer métodos locales, APIs oficiales, servicios comunitarios no oficiales o traducción manual. Deberá ser optativa, informar si el contenido se procesará localmente o se enviará a un servicio remoto, y permitir seguir usando el texto original.

Los candidatos de investigación incluyen:

- **Bergamot**, asociado con Firefox Translations, como posible tecnología de traducción local. No se presupone que los modelos, licencias, empaquetado, idiomas o rendimiento permitan integrarlo.
- **Google Cloud Translation** y **Microsoft Translator** como posibles servicios en línea, sujetos a validación de documentación, credenciales, cuotas, costos, términos, tratamiento de datos y retención.
- Métodos comunitarios que imiten servicios web se considerarán experimentales. No serán el método predeterminado y no podrán evadir bloqueos, autenticación, mecanismos antibots ni restricciones de acceso.
- Traducción manual como opción que no requiere proveedor de red.

No se selecciona motor, dependencia ni proveedor. La traducción local solo podrá prometer funcionamiento sin conexión una vez que modelos y componentes necesarios estén disponibles localmente y se haya validado su funcionamiento.

## 4. Conservación de originales, traducciones y procedencia

El contenido original seguirá disponible y no se reemplazará por una traducción. Para cada traducción se deberá poder conservar, cuando aplique:

- Texto original e idioma de origen.
- Texto traducido e idioma de destino.
- Proveedor o motor, fecha y versión del modelo.
- Indicación de edición manual y valor manual vigente.

Una traducción nueva no sobrescribirá silenciosamente una edición manual ni borrará una traducción previa. El usuario podrá seleccionar o actualizar contenido por campo, revisar cambios y conservar alternativas según las capacidades del proveedor y los derechos aplicables. Esta información pertenece al contenido del juego, no a las preferencias de idioma de la interfaz.

Los nombres propios, títulos, personajes, franquicias y términos técnicos podrán necesitar protección o revisión manual. La calidad y disponibilidad variarán por motor e idioma; no se garantizará equivalencia lingüística ni disponibilidad uniforme.

## 5. Privacidad, seguridad y funcionamiento sin conexión

La localización de interfaz deberá funcionar con los archivos locales instalados. Las operaciones de traducción remota requerirán una acción y consentimiento claros; antes de enviar texto se explicarán el proveedor y los datos transmitidos. Las credenciales y textos sensibles no deberán aparecer en logs ni archivos ordinarios de configuración.

Los archivos de idioma y resultados importados se tratarán como datos no confiables: validar estructura, tamaño, claves y versiones; rechazar código ejecutable, referencias remotas inesperadas y rutas no autorizadas. Un archivo de idioma no tendrá permisos de complemento.

Las traducciones almacenadas localmente podrán consultarse sin conexión. La disponibilidad de traducción nueva dependerá del motor local o de la red, pero una interrupción no deberá borrar el original, traducciones existentes ni bloquear la biblioteca.

## 6. Aspectos pendientes de validar

- Idiomas y locales incluidos inicialmente y elección del idioma predeterminado.
- Formato, interpolación, pluralización, respaldo y validación de catálogos de interfaz.
- Flujo de contribución, revisión y compatibilidad de traducciones comunitarias.
- Distribución, modelos, licencias, idiomas y costo de recursos de Bergamot u otras opciones locales.
- Privacidad, cuotas, costos, retención y condiciones de proveedores en línea.
- Campos de juego traducibles, actualización selectiva y tratamiento de modificaciones manuales.
- Consumo de almacenamiento, memoria, CPU y rendimiento por idioma/modelo.

Estas decisiones deben validarse antes de prometer idiomas, motores o proveedores concretos. Para metadatos e imágenes, véase [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md); para complementos y capacidades, véase [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md).
