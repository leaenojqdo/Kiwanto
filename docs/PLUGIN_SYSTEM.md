SISTEMA DE PLUGINS

## 1. Objetivo
Permitir ampliar la aplicación sin modificar su núcleo.

Los complementos y los temas son sistemas diferentes:

- Un **tema** es configuración declarativa de apariencia visual y no ejecuta código.
- Un **complemento** es una extensión funcional que podría aportar comportamiento y, en el futuro, elementos de interfaz. Por su mayor capacidad, requiere un diseño de permisos y seguridad independiente.

## 2. Tipos de extensión e integración previstos

Kiwanto deberá distinguir estos conceptos, aunque una futura extensión pueda agrupar más de una capacidad:

- **Proveedor de datos:** obtiene metadatos, imágenes, traducciones u otros datos y los entrega a contratos comunes de Kiwanto. No es propietario del buscador visual ni del modelo de biblioteca.
- **Integración de plataforma:** conecta una fuente, launcher, tienda, emulador, cuenta o servicio externo para descubrir o gestionar capacidades que esa fuente realmente ofrece.
- **Complemento funcional:** añade una capacidad a la aplicación. Su alcance, permisos y ciclo de vida deben declararse y aprobarse; esta categoría no autoriza código arbitrario en la primera versión.

Las categorías futuras podrán incluir:

- Integraciones de plataformas y tiendas.
- Proveedores de metadatos e imágenes.
- Proveedores de traducción.
- Logros y seguimiento de progreso.
- Duración estimada de juegos.
- Seguimiento avanzado del tiempo de juego y estadísticas.
- Funciones de biblioteca y, en una etapa posterior, paneles, vistas u otros elementos visuales.

Un proveedor puede ser un módulo interno o, si se aprobara un sistema de extensiones seguro, parte de un complemento. Su mecanismo de búsqueda, normalización, atribución, almacenamiento y presentación deberá integrarse con los servicios comunes y no duplicarlos.

RetroAchievements, HowLongToBeat, PlayStation Network, IGDB, SteamGridDB y fuentes de LaunchBox son candidatos de evaluación, no integraciones confirmadas ni afirmaciones de disponibilidad, autorización, API o condiciones vigentes. Véase [METADATA_AND_ARTWORK.md](METADATA_AND_ARTWORK.md) para candidatos de metadatos e imágenes.

Al evaluar estos candidatos, se contemplan los siguientes alcances conceptuales, sujetos a disponibilidad real de datos, compatibilidad y condiciones que deberán investigarse:

- **RetroAchievements:** logros y progreso para juegos o emuladores compatibles. No se presupone compatibilidad universal ni que todos los juegos, plataformas o emuladores puedan ofrecer estas capacidades.
- **HowLongToBeat:** estimaciones para historia principal, historia principal con extras y completionist, únicamente cuando existan datos aplicables. Son estimaciones externas, no tiempo de juego medido por Kiwanto.
- **Tiempo de juego:** deberán distinguirse los tiempos medidos por Kiwanto mediante seguimiento validado, los importados de otras fuentes y las duraciones estimadas. No se combinarán ni presentarán como una única medición equivalente; se conservará su origen y naturaleza.

Estos alcances no confirman integraciones, métodos de acceso, autenticación, permisos, APIs, endpoints, disponibilidad ni condiciones de uso para ninguno de los servicios.

## 3. Primera versión
La primera versión no permitirá ejecutar código arbitrario de complementos, con o sin restricciones. Los temas declarativos no se cargarán ni tratarán como complementos.

Las integraciones iniciales serán módulos internos.

No se construirá todavía un repositorio o una tienda interna de complementos. La disponibilidad, distribución, actualización y revisión de complementos de terceros quedan fuera del alcance inicial.

## 4. Futuro sistema de plugins
Se podrá estudiar:

- WASM.
- API de plugins.
- Permisos.
- Límites de recursos.
- Aislamiento.
- Validación de manifest.
- Firma opcional.

Ninguna de estas opciones se considera ya seleccionada ni implementada.

Antes de definir contratos ejecutables se deberán investigar el ciclo de vida, configuración, compatibilidad, errores y recuperación, actualizaciones, desinstalación y tratamiento de datos generados. El aislamiento, los límites de recursos y solicitudes, permisos mínimos, autenticación y almacenamiento seguro de credenciales deben ser parte del diseño. El acceso a red, archivos, procesos y datos se limitará por capacidad y no se supondrá concedido por instalar una extensión.

Los proveedores y las integraciones iniciales podrán implementarse como módulos internos y acotados, sin esperar un runtime de plugins. No se almacenarán credenciales en archivos de configuración ordinarios ni logs. Si un servicio requiere autenticación, la necesidad y el almacenamiento seguro deberán aprobarse antes de implementarlo.

## 5. Extensiones de interfaz
En el futuro, un complemento podría aportar paneles, vistas o elementos visuales. La interfaz deberá contemplar puntos de integración acotados, por ejemplo:

- Zonas de panel en vistas compatibles.
- Entradas o vistas de navegación.
- Elementos visuales asociados a una página o panel.
- Secciones de configuración propias de un complemento.

Estos espacios son posibilidades de diseño, no permisos concedidos ni una API disponible. Antes de permitir extensiones visuales se definirán interfaces estables, ciclo de vida, compatibilidad de versiones, límites de composición y comportamiento ante errores o desactivación. Un complemento no deberá poder alterar sin control la distribución completa ni acceder a capacidades que no le hayan sido otorgadas.

El sistema de temas seguirá siendo independiente: un tema podrá cambiar la apariencia de los componentes compatibles, pero no aportar lógica ejecutable, vistas funcionales ni permisos de complemento.

## 6. Manifest
Un plugin deberá declarar:

- Identificador.
- Nombre.
- Versión.
- Autor.
- Descripción.
- Versión mínima del launcher.
- Permisos.
- Dependencias.

El formato del manifest y su compatibilidad deberán diseñarse y validarse antes de habilitar complementos externos.

## 7. Seguridad
Los plugins no deberán acceder a:

- Credenciales.
- Datos privados.
- Archivos fuera de sus permisos.
El acceso a red deberá ser explícito.

El acceso a procesos externos deberá ser explícito.

La lectura de archivos deberá limitarse a las rutas autorizadas.

## 8. Permisos
Ejemplos:

- library.read
- library.write
- metadata.read
- metadata.write
- filesystem.read
- filesystem.write
- process.launch
- network.access

Estos ejemplos describen capacidades que podrían requerir autorización en un futuro sistema. No implican que exista ya un modelo de permisos o aislamiento.

## 9. Desactivación
La desactivación de un plugin no deberá eliminar los datos generados por él.

## 10. Catálogo comunitario de recursos

En el futuro podrá evaluarse un catálogo comunitario distribuido inicialmente mediante repositorios de GitHub, sin depender exclusivamente de GitHub. La arquitectura podrá admitir otros índices o repositorios compatibles.

Las entradas podrán clasificarse como complementos, proveedores, temas, idiomas o recursos opcionales. Los metadatos propuestos incluyen nombre, descripción, autor declarado, versión, compatibilidad con Kiwanto, categoría, repositorio de origen, licencia declarada, dependencias, permisos declarados, estado de mantenimiento y última actualización conocida.

El catálogo será un índice de recursos, no una prueba de confianza, autenticidad o seguridad. Los metadatos declarados deberán validarse y las fuentes y licencias deberán mostrarse sin inferir que el recurso es seguro o compatible. Los temas y archivos de idioma seguirán siendo datos declarativos sin permisos de complemento; un recurso catalogado no recibirá permisos por aparecer en el índice.

El catálogo de recursos declarativos se mantendrá separado del sistema que eventualmente ejecute complementos funcionales. No se implementan ahora marketplace, catálogo, instalación automática, firma ni sistema de distribución.
