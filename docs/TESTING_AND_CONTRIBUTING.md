PRUEBAS Y CONTRIBUCIÓN

## 1. Objetivo
Garantizar que los cambios no rompan funcionalidades existentes.

## 2. Pruebas
Se contemplan:

- Unit tests.
- Integration tests.
- Pruebas de base de datos.
- Pruebas de lanzamiento.
- Pruebas de interfaz.
- Pruebas de seguridad.
- Pruebas de rendimiento.

### Comprobaciones disponibles en el checkout

Los scripts concretos del frontend están definidos en `package.json`: `npm run build` ejecuta TypeScript (`tsc --noEmit`) y Vite; `npm test` ejecuta las pruebas Node de biblioteca, selector de géneros y navegación Big Picture. Rust usa Cargo:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
git diff --check
```

Para iniciar el servidor de Vite: `npm run dev`. La app Tauri requiere además las dependencias nativas de Linux/WebKitGTK del entorno. No declarar resultados de ejecución sin ejecutar el comando en el checkout actual.

## 3. Backend
Se deberán probar:

- CRUD de juegos.
- Migraciones.
- Escaneo.
- Validación de rutas.
- Perfiles de lanzamiento.
- Gestión de sesiones.
- Errores de integraciones.

## 4. Frontend
Se deberán probar:

- Navegación.
- Búsqueda.
- Filtros.
- Edición.
- Temas.
- Persistencia de configuraciones.
- Estados de error.

## 5. Entorno de pruebas
El desarrollo inicial se realizará en Linux.

Entorno principal:

Pop!_OS 24.04 LTS con COSMIC.

También se evaluará Ubuntu u otra distribución compatible.

## 6. Contribuciones
Los cambios deberán:

- Tener un propósito definido.
- Respetar la arquitectura.
- Incluir pruebas cuando corresponda.
- Mantener la documentación actualizada.
- Evitar cambios innecesarios.
- No introducir dependencias sin justificación.

## 7. Git
Se recomienda:

- Commits pequeños.
- Mensajes descriptivos.
- Ramas para funcionalidades.
- Revisión antes de integrar cambios.

## 8. IA durante el desarrollo
Las herramientas de IA podrán colaborar.

Sin embargo:

- No se aceptará código sin revisión.
- No se afirmará que una prueba fue ejecutada si no lo fue.
- No se permitirán modificaciones masivas sin justificación.
- No se mezclarán múltiples tareas independientes en un único cambio.
- La documentación será la fuente de referencia.

## 9. Validación de los modos de interfaz

Las pruebas de interfaz deben verificar:

- Que Desktop y Big Picture utilizan los mismos datos y acciones, sin crear bibliotecas ni reglas de negocio paralelas.
- Que un cambio de modo conserva el juego seleccionado, consulta/filtros y colección/sección aplicable, y no confunde el foco con la selección.
- Que el desplazamiento y el ancla de foco se restauran solo cuando siguen siendo válidos; si un elemento desaparece, el foco vuelve a un destino utilizable.
- Que acciones esenciales se pueden completar con mando y teclado, además de ratón, sin depender del hover.
- Que los menús y diálogos reciben el foco inicial adecuado, ofrecen volver/cancelar, devuelven el foco a un control válido y no dejan la navegación bloqueada.
- Que un cambio de modo no confirma ni cierra a la fuerza un diálogo, cancela o repite una operación.
- Que Big Picture es legible y navegable a distancia y funciona con distintas resoluciones y proporciones, incluidos los estados vacíos, de carga y error.
- Que los mandos USB/Bluetooth representativos funcionan y se desconectan correctamente en las versiones WebKitGTK de las distribuciones Linux que se decida soportar; registrar mapeo, latencia, foco y permisos observados.
- Que `Ctrl+Shift+B` no se activa mientras un campo editable o método de entrada consume la combinación, que se han revisado conflictos y que existe un control visible alternativo.

Desktop Mode y Big Picture ya existen, así como navegación de Big Picture por teclado con pruebas unitarias de sus helpers. La lista anterior sigue siendo criterio de aceptación pendiente para validar el comportamiento de extremo a extremo y la compatibilidad con mandos; no se ha verificado soporte de Gamepad API/WebKitGTK ni hardware objetivo. Véase [PROJECT_STATUS.md](PROJECT_STATUS.md) para el alcance actual.
