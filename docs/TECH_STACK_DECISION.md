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

La personalización será gestionada mediante variables CSS y tokens de diseño.

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
El modo WAL no se activará automáticamente sin verificar la versión de SQLite utilizada.

Se deberá considerar la compatibilidad con las correcciones de SQLite relacionadas con WAL.

La primera implementación podrá utilizar el modo de journal tradicional.
