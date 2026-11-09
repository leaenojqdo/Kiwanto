ESPECIFICACIÓN GENERAL DEL PROYECTO

## 1. Propósito
Crear un gestor de bibliotecas de videojuegos para Linux que unifique juegos instalados y no instalados, permitiendo organizarlos, personalizarlos y ejecutarlos desde una sola interfaz.

## 2. Usuarios objetivo

- Usuarios de Linux.
- Jugadores que utilizan múltiples plataformas.
- Usuarios de Wine y Proton.
- Usuarios de emuladores.
- Usuarios que mantienen bibliotecas locales.
- Usuarios que prefieren controlar sus datos.
- Usuarios que desean personalizar profundamente la interfaz.

## 3. Fuentes de juegos
La aplicación deberá permitir integrar:

- Steam.
- Heroic Games Launcher.
- GOG.
- Epic Games Store.
- Amazon Games mediante Heroic cuando corresponda.
- itch.io.
- Lutris.
- Bottles.
- RetroArch.
- Emuladores individuales.
- Juegos nativos de Linux.
- Juegos de Windows mediante Wine o Proton.
- Ejecutables portátiles.
- Juegos instalados manualmente.
- ROMs.
- Juegos no instalados.
- Entradas creadas manualmente.
Las integraciones deberán ser independientes.

Un fallo en una integración no deberá impedir que funcionen las demás.

## 4. Gestión de biblioteca
Cada juego podrá contener:

- Identificador interno.
- Nombre.
- Descripción.
- Desarrollador.
- Distribuidor.
- Fecha de lanzamiento.
- Géneros.
- Plataforma.
- Idiomas.
- Clasificación.
- Estado de instalación.
- Ruta de instalación.
- Método de lanzamiento.
- Imagen de portada.
- Logo.
- Fondo.
- Capturas.
- Etiquetas.
- Colecciones.
- Favoritos.
- Tiempo de juego.
- Historial de sesiones.
- Valoración personal.
- Notas.
- Metadatos personalizados.
Los campos deberán poder editarse manualmente.

## 5. Estados de instalación
Un juego podrá estar:

- Instalado.
- No instalado.
- Instalación no encontrada.
- Instalación desconocida.
- Disponible mediante cliente externo.
- Disponible mediante emulador.
- Ejecutable portátil.
- Pendiente de configuración.
La desaparición de un ejecutable no deberá borrar la entrada del juego.

## 6. Funciones de biblioteca

- Búsqueda.
- Filtros.
- Ordenamiento.
- Colecciones.
- Etiquetas.
- Favoritos.
- Vista de cuadrícula.
- Vista de lista.
- Vista detallada.
- Edición de metadatos.
- Gestión de imágenes.
- Importación manual.
- Escaneo de directorios.
- Estadísticas.
- Seguimiento de sesiones.

## 7. Personalización
El usuario deberá poder configurar:

- Tema.
- Colores.
- Fuentes.
- Tamaños de texto.
- Espaciado.
- Bordes.
- Paneles.
- Visibilidad de elementos.
- Orden de elementos.
- Distribución de la biblioteca.
- Fondos.
- Animaciones.
- Sonidos de interfaz.
- Pantallas de carga.

## 8. Seguridad
La aplicación deberá:

- Evitar ejecución automática durante escaneos.
- No almacenar credenciales de tiendas en la primera versión.
- No ejecutar comandos arbitrarios construidos mediante concatenación de cadenas.
- No requerir privilegios de root.
- Solicitar consentimiento para acciones destructivas.
- Validar rutas.
- Mantener registros de operaciones importantes.
- Tratar los plugins como componentes potencialmente inseguros.

## 9. Restricciones iniciales
La primera versión no deberá incluir:

- Tienda de videojuegos.
- Sistema de cuentas propio.
- Sincronización obligatoria en la nube.
- Servicios web obligatorios.
- Telemetría obligatoria.
- Ejecución de plugins arbitrarios sin aislamiento.
- Modificación automática de clientes externos.
