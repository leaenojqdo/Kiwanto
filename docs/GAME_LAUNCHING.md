SISTEMA DE LANZAMIENTO

## Estado actual

**Estado: PARCIAL.** Existe un perfil manual persistente asociado a cada juego con ruta de ejecutable, directorio de trabajo opcional y argumentos almacenados por separado. El editor de juego expone configuración del perfil y una acción explícita de lanzamiento. Rust valida los datos disponibles y crea el proceso con `std::process::Command`, pasando los argumentos como elementos separados; no interpola una orden de shell. La llamada devuelve el ID de proceso, pero Kiwanto todavía no ofrece seguimiento completo de procesos secundarios, detección del juego efectivo, sesiones ni tiempo de juego. No hay importación automática de ejecutables ni integraciones Steam, Heroic, Lutris, Bottles, Proton o emuladores verificadas.

Código principal: `src/components/GameLaunchControl.tsx`, `src/components/GameEditorDialog.tsx`, `src/library/service.ts` y `src-tauri/src/library.rs`. Este estado describe el flujo presente y no afirma compatibilidad con todos los ejecutables o sistemas.

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
