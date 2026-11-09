SISTEMA DE LANZAMIENTO

## 1. Objetivo
Permitir ejecutar videojuegos desde la biblioteca mediante diferentes métodos.

## 2. Métodos admitidos

- Steam URI.
- Heroic CLI.
- Lutris CLI.
- Bottles CLI.
- Ejecutables nativos.
- Ejecutables de Windows mediante Wine.
- Ejecutables mediante Proton.
- Emuladores.
- RetroArch.
- Comandos de lanzamiento configurados manualmente.

## 3. Perfiles de lanzamiento
Cada juego podrá tener uno o varios perfiles.

Un perfil podrá contener:

- Nombre.
- Ejecutable.
- Argumentos.
- Directorio de trabajo.
- Variables de entorno.
- Runner.
- Prefix.
- Método de ejecución.
- Opciones adicionales.

## 4. Argumentos
Los argumentos deberán almacenarse como elementos separados.

No se utilizará concatenación insegura de cadenas para construir comandos de shell.

## 5. Variables de entorno
El usuario podrá configurar variables específicas por perfil.

Estas variables no deberán modificar permanentemente el entorno del sistema.

## 6. Registro de ejecución
El sistema deberá distinguir entre:

- Solicitud de lanzamiento.
- Cliente externo invocado.
- Proceso detectado.
- Sesión iniciada.
- Sesión finalizada.
- Error de ejecución.
No se asumirá que una solicitud de lanzamiento significa que el juego se inició correctamente.

## 7. Seguimiento del proceso
El sistema podrá detectar procesos asociados.

El seguimiento deberá admitir situaciones donde:

- El cliente externo permanece abierto.
- El juego utiliza un proceso secundario.
- El juego se ejecuta mediante Wine.
- El juego finaliza sin cerrar el launcher.

## 8. Seguridad
No se ejecutarán comandos con privilegios de root.

Las operaciones deberán validar rutas y parámetros.

Las configuraciones manuales deberán mostrar claramente qué programa será ejecutado.
