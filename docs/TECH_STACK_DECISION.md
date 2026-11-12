DECISIÓN SOBRE LAS TECNOLOGÍAS

## 1. Decisión
La combinación seleccionada es:

Rust + Tauri 2 + React + TypeScript + Vite + SQLite.

## 2. Rust
Rust será el lenguaje principal del backend.

Ventajas:

- Seguridad de memoria.
- Buen rendimiento.
- Control sobre procesos externos.
- Adecuado para aplicaciones de escritorio.
- Ecosistema de herramientas moderno.
- Buen soporte para operaciones del sistema.
Desventajas:

- Curva de aprendizaje elevada.
- Mayor complejidad inicial que Python.
- El desarrollo requiere comprender ownership, borrowing y tipos.

## 3. Tauri 2
Tauri será el contenedor de escritorio.

Ventajas:

- Menor consumo potencial que Electron.
- Comunicación entre frontend y backend.
- Integración con el sistema operativo.
- Permite usar React y TypeScript.
- Arquitectura apropiada para aplicaciones locales.
Limitaciones:

- Depende del WebView del sistema.
- En Linux utiliza WebKitGTK.
- La compatibilidad depende de la distribución.
- Las capacidades de Tauri no constituyen un sandbox completo para el backend Rust.

## 4. React
React se utilizará para la interfaz.

Ventajas:

- Ecosistema amplio.
- Componentes reutilizables.
- Adecuado para interfaces complejas.
- Facilita la personalización visual.
- Compatible con numerosas herramientas de desarrollo.

## 5. TypeScript
TypeScript será obligatorio en el frontend.

Objetivos:

- Reducir errores.
- Definir interfaces de datos.
- Facilitar el mantenimiento.
- Mejorar la colaboración con herramientas de IA.

## 6. Vite
Vite será el sistema de desarrollo y compilación del frontend.

## 7. SQLite
SQLite será la base de datos local.

Ventajas:

- No requiere servidor.
- Funciona sin conexión.
- Adecuada para bibliotecas locales.
- Fácil de respaldar.
- Buena integración con Rust.

## 8. CSS personalizado
Se evitará depender de frameworks visuales que impongan demasiadas restricciones.

La personalización visual existente utiliza variables CSS y tokens de diseño como base. No se asume que CSS por sí solo pueda describir todas las futuras composiciones: el motor deberá usar contratos declarativos de regiones, componentes y propiedades admitidas, y podrá coordinar esos contratos con la composición React.

Antes de adoptar tecnologías adicionales para layouts, fondos o efectos, se deberá validar su compatibilidad con React, Tauri 2, el WebView WebKitGTK en Linux y equipos con recursos modestos. Se medirán consumo de GPU y memoria, capacidad de respuesta y accesibilidad; ningún efecto costoso será obligatorio. Esta decisión no aprueba un framework o motor de composición adicional.

## 9. Alternativas descartadas inicialmente
Electron:

Se considera viable, pero su consumo potencial de recursos es superior.

Qt:

Es una alternativa sólida, pero aumentaría la complejidad del desarrollo y la integración con React no sería tan directa.

Python + PySide6:

Adecuado para prototipos, pero menos conveniente para la arquitectura elegida a largo plazo.

Flutter:

No ofrece una ventaja suficientemente clara para este proyecto.

## 10. Distribución
Primera distribución prevista:

Paquete .deb.

Distribución posterior:

Flatpak, una vez validado el acceso a bibliotecas externas, ejecutables y emuladores.

AppImage podrá evaluarse posteriormente.

## 11. Decisión sobre SQLite WAL
La primera implementación de biblioteca usa `rusqlite` con SQLite integrado y comprueba que la versión de ejecución sea al menos 3.9.0 antes de activar WAL. La conexión también verifica que WAL se haya aplicado y configura `synchronous=FULL`.

El uso de WAL debe seguir evaluándose para sistemas de archivos de red y para la futura copia de seguridad; copiar solo el archivo principal mientras WAL está activo no garantiza una copia consistente. Si la implementación cambia a la biblioteca SQLite del sistema, deberá comprobarse de nuevo la versión y compatibilidad en las distribuciones objetivo.

## 12. Entrada de mandos en Tauri, React y Linux

La interfaz React se ejecuta dentro del WebView de Tauri; no recibe automáticamente una abstracción de mando propia de React. La referencia técnica inicial que se evaluará es la [Gamepad API del W3C](https://w3c.github.io/gamepad/), expuesta en navegadores mediante interfaces como `navigator.getGamepads()` y los eventos `gamepadconnected` / `gamepaddisconnected` (véase también [MDN: Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)). La API proporciona estados de botones y ejes y puede informar el tipo de mapeo, pero la aplicación aún tendría que normalizarlos a acciones de navegación, confirmar, volver, menú y desplazamiento, y definir repetición, zona muerta y desconexión.

La documentación de [versiones de WebView de Tauri 2](https://v2.tauri.app/reference/webview-versions/) indica que en Linux se utiliza WebKit a través de `webkit2gtk`. La versión disponible depende del sistema de destino; por tanto, el soporte general de Gamepad API en navegadores no demuestra que todos los WebKitGTK incluidos por las distribuciones Linux objetivo expongan el mismo comportamiento. No hay una decisión de usar un plugin, dependencia JavaScript o puente nativo de Rust.

Antes de elegir una implementación se deberá probar la aplicación empaquetada y de desarrollo en las distribuciones objetivo con mandos USB y Bluetooth representativos; confirmar descubrimiento/conexión/desconexión, botones, ejes, mapeos estándar y no estándar, permisos/visibilidad del dispositivo, comportamiento en foco/ventana inactiva, latencia, repetición y estabilidad de la navegación. También se evaluará si el acceso al dispositivo funciona sin permisos elevados y cómo afecta el WebView de la distribución. Si la Gamepad API no ofrece cobertura suficiente, la opción de un puente nativo deberá investigarse y aprobarse aparte, incluyendo permisos mínimos, IPC limitado y mantenimiento; no se presupone que haga falta.

El contrato de interacción debe seguir siendo independiente del hardware para que teclado y ratón funcionen en ambos modos y para no atar la lógica de la biblioteca a una API de entrada. Esta sección documenta una investigación pendiente, no compatibilidad verificada ni aprobación de una dependencia.
