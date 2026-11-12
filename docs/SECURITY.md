POLÍTICA DE SEGURIDAD

## 1. Principios
La seguridad deberá ser una parte central del diseño.

La aplicación deberá priorizar:

- Privacidad.
- Transparencia.
- Consentimiento.
- Validación.
- Privilegios mínimos.
- Control del usuario.

## 2. Archivos
El programa no deberá realizar modificaciones destructivas sin autorización.

## 3. Escaneo
El escaneo no deberá ejecutar los archivos encontrados.

## 4. Ejecución
Los videojuegos deberán iniciarse únicamente mediante acciones explícitas del usuario.

## 5. Credenciales
La primera versión no almacenará credenciales de tiendas.

## 6. Integraciones
Las integraciones deberán utilizar interfaces públicas cuando existan.

No se deberá modificar automáticamente la configuración de otros clientes.

## 7. Backend
Las operaciones sensibles deberán ejecutarse en Rust.

El frontend no deberá disponer de acceso irrestricto al sistema de archivos.

## 8. IPC
Los comandos IPC deberán:

- Validar argumentos.
- Limitar operaciones.
- Devolver errores estructurados.
- Evitar permisos excesivos.

## 9. Logs
Los registros no deberán contener:

- Contraseñas.
- Tokens.
- Credenciales.
- Información privada innecesaria.

## 10. Actualizaciones
Las futuras actualizaciones deberán utilizar mecanismos verificables.

## 11. Reporte de vulnerabilidades
Se deberá habilitar un mecanismo de reporte privado antes de publicar versiones estables.

## 12. Temas, perfiles y paquetes importados
Los temas, perfiles de interfaz, manifests, configuraciones y recursos importados deberán considerarse datos no confiables, incluso si el paquete incluye un nombre, autor o descripción que parezca legítimo. Un nombre o una identidad declarada no demuestra autenticidad ni seguridad.

Antes de aceptar un paquete de tema o perfil, la futura implementación deberá:

- Validar que el archivo tenga el formato y el tipo de paquete esperados.
- Validar la sintaxis, estructura, campos obligatorios y versiones del manifest y de los datos.
- Diferenciar y comprobar la versión del formato del paquete, la versión del tema o perfil y la compatibilidad con la versión de Kiwanto.
- Rechazar rutas inseguras, incluidas rutas absolutas y rutas relativas que escapen del destino permitido mediante traversal.
- Limitar el tamaño total del paquete, el tamaño de cada recurso, la cantidad de recursos y cualquier otro valor que pueda consumir recursos excesivos. Los límites concretos deben investigarse y aprobarse antes de implementar el formato.
- Validar referencias y tipos de recursos; no confiar en extensiones o nombres de archivo como única comprobación.
- Rechazar scripts y cualquier mecanismo que ejecute código arbitrario dentro de un tema. Los temas deben permanecer declarativos.
- Mostrar errores e incompatibilidades de forma comprensible y evitar dejar una importación parcial o aplicar cambios silenciosamente.

Los perfiles importados únicamente describirán preferencias de interfaz. No ejecutarán acciones, no otorgarán permisos y no lanzarán juegos o complementos. Cualquier ruta a recursos deberá validarse; la importación de un perfil nunca será motivo para ejecutar el archivo al que una preferencia haga referencia.

La exportación deberá evitar incluir datos de biblioteca o recursos personales sin una decisión explícita del usuario. La inclusión de imágenes, tipografías u otros recursos deberá identificarse claramente y respetar los derechos y la privacidad aplicables.

Estos puntos son requisitos de diseño para una futura función de importación/exportación. No hay todavía un formato de paquete, un validador, límites definidos ni garantías implementadas. El formato y el flujo de aplicación segura deben diseñarse antes de afirmar que una importación está protegida.

## 13. Preferencias visuales del prototipo
La implementación inicial guarda únicamente la selección de un tema integrado en `~/.config/kiwanto/preferences.json` (o bajo `XDG_CONFIG_HOME`). El frontend no recibe acceso general al sistema de archivos: usa comandos Rust específicos para leer y guardar preferencias, y el backend solo resuelve la ruta fija de ese archivo. Las preferencias previas de `app_config_dir()` se validan y se migran sin eliminar otros archivos de configuración.

El backend valida la versión del esquema y deserializa el identificador de tema a una enumeración cerrada. Los valores desconocidos y los archivos malformados producen errores visibles; no se sustituyen silenciosamente por valores predeterminados. La escritura usa un archivo temporal y renombrado para evitar dejar el archivo principal parcialmente escrito. La restauración de valores predeterminados es una acción explícita que guarda el valor predeterminado.

Fuera de Tauri, la vista de desarrollo usa `localStorage` del navegador para que la pantalla de preferencias pueda probarse sin acceso nativo al sistema de archivos. Ese modo no se usa en la aplicación de escritorio.

Los temas actuales son definiciones locales tipadas, no paquetes importados. Los identificadores de recursos son referencias declarativas y no se resuelven como rutas arbitrarias. No se cargan JavaScript, CSS, scripts ni recursos de red de temas. La validación y los límites para paquetes importados siguen pendientes; la implementación inicial no constituye una garantía sobre futuras importaciones.

## 14. Biblioteca SQLite

La base de datos se crea bajo `app.path().data_dir()/kiwanto/library.sqlite3`; por defecto, `~/.local/share/kiwanto/library.sqlite3` en Linux. El frontend solo puede invocar operaciones concretas para listar, crear, editar, marcar favoritos, archivar, restaurar y eliminar entradas archivadas, además de gestionar colecciones manuales y sus asociaciones. No recibe acceso a archivos de base de datos, SQL, shell ni rutas generales.

Rust valida los datos recibidos, usa parámetros SQL, activa claves foráneas y aplica transacciones. La eliminación permanente no elimina archivos de juego y se bloquea si quedan dependencias de instalaciones o referencias de gestión. Una inicialización o escritura fallida se presenta como error; la aplicación no sustituye la base por juegos de demostración ni continúa como si la operación hubiera tenido éxito.

No están implementados el escaneo de archivos, las integraciones, el lanzamiento, la importación de recursos, ni el backup/restauración. Esta implementación no afirma garantías de copia de seguridad; el uso de WAL requiere una estrategia de respaldo consistente antes de ofrecer esa función.

## 15. Motor visual y regiones personalizables

La mayor flexibilidad visual no cambia el modelo de seguridad: los temas seguirán siendo datos declarativos, no programas. Ni el tema, ni una composición, ni un recurso podrán ejecutar JavaScript, CSS o scripts externos, comandos del sistema u otro código arbitrario. El motor deberá interpretar contratos y propiedades explícitamente permitidos; no deberá evaluar código o expresiones suministradas por un tema.

Los recursos de temas compartidos deberán ser locales. No se admitirán referencias que provoquen descargas o dependan de servicios de red para representar la interfaz. Las rutas se resolverán únicamente dentro de las ubicaciones autorizadas, después de validar rutas absolutas, traversal y referencias simbólicas según el diseño de importación aprobado. Los formatos, dimensiones, resolución, cantidad y tamaños deberán validarse para limitar contenido inválido y consumo excesivo de memoria, CPU o GPU.

La personalización de regiones y composiciones deberá respetar una lista de componentes, ubicaciones, propiedades y límites admitidos. Un tema no podrá ocultar o volver inaccesibles responsabilidades funcionales esenciales. Un tema importado tampoco podrá modificar silenciosamente la distribución personal, los paneles visibles, las preferencias de organización de biblioteca, los datos de juegos ni las preferencias fuera del ámbito explícito de ese tema. Los perfiles de interfaz conservarán su ámbito separado y se validarán de forma independiente.

Estos requisitos describen el futuro motor y flujo de importación. La implementación actual solo selecciona entre dos temas integrados y persiste ese identificador; no importa temas, procesa recursos personalizados ni interpreta composiciones alternativas. Por lo tanto, todavía no existen validadores ni garantías de seguridad para un formato de temas compartidos.

## 16. Entrada, foco y cambio de modo

La entrada de mando se tratará como entrada del usuario, no como una fuente confiable de acciones privilegiadas. Los botones y ejes solo podrán producir acciones explícitas de interfaz mediante el contrato de navegación; no otorgarán acceso al sistema, no ampliarán capacidades Tauri, no ejecutarán comandos y no lanzarán juegos sin una acción de confirmación clara. Las operaciones sensibles seguirán pasando por los comandos Rust acotados y su validación, con independencia del dispositivo que inició la interacción.

La aplicación no deberá solicitar permisos de sistema amplios ni privilegios de root para habilitar entrada de mandos. Si una futura integración nativa requiere permisos de dispositivo, deberán definirse alcance mínimo, necesidad, instalación y comunicación al usuario antes de implementarla. La disponibilidad de un mando no deberá usarse para recolectar identificadores del dispositivo ni telemetría.

Temas y composiciones de cualquiera de los modos no podrán ocultar, interceptar o volver inaccesibles controles esenciales, la navegación global, el foco visible, la salida de menús ni el cambio de modo. Las preferencias de modo, tema, distribución y perfil deberán validarse por separado; importar un tema no cambiará el modo ni modificará preferencias fuera de su ámbito.

Los paquetes deberán contener sus recursos redistribuibles requeridos y no podrán depender de rutas privadas del autor ni recursos remotos silenciosos. La importación validará manifiesto, compatibilidad, referencias, rutas confinadas, tipos reales de contenido y checksums antes de aplicar nada. Procedencia, licencias y atribuciones declaradas se mostrarán como metadatos no verificados por sí mismos. Los paquetes inválidos o incompatibles no dejarán estado parcialmente aplicado. El formato, los límites basados en mediciones y la política de migración deberán definirse antes de implementar importación/exportación.

El contenido enriquecido de juegos y colecciones también será entrada no confiable. Los tipos permitidos se validarán sin ejecutar HTML activo o scripts; los medios externos requerirán carga explícita, validación y caché local, y no iniciarán audio automáticamente. Los documentos adjuntos se validarán y cargarán únicamente al abrirlos por acción del usuario. Los recursos de tema, artwork de juegos/colecciones, documentos y bloques editoriales deberán permanecer diferenciados en almacenamiento y flujos de exportación. La música opcional solo usará archivos locales bajo referencias controladas y no se descargará automáticamente.

Las composiciones editables usarán plantillas, componentes y propiedades declarativos permitidos. No admitirán código arbitrario, rutas sin restricciones ni recursos externos silenciosos, y no podrán ocultar controles, foco o estados funcionales esenciales. La vista previa y validación deberán rechazar o explicar composiciones incompatibles antes de guardarlas.

La generación mediante IA, si se incorpora en etapas posteriores, estará desactivada por defecto y solo se iniciará ante una acción explícita. Antes de solicitudes externas se mostrarán los datos que saldrán del equipo; las credenciales permanecerán en almacenamiento seguro local y se excluirán del repositorio, registros, exportaciones y sincronización. Los resultados deberán indicar si son datos verificados, de proveedor o sugerencias generadas.
