# DOCUMENTACIÓN COMPLETA — GAME LIBRARY LAUNCHER
Versión 0.2.0
Estado: Diseño inicial
Plataforma objetivo: Linux
Licencia: Por decidir
Idioma principal: Español

GAME LIBRARY LAUNCHER

Un gestor de bibliotecas y lanzador de videojuegos para Linux, centrado en la personalización, la privacidad, la modularidad y el control del usuario.

## 1. Descripción
Game Library Launcher busca ofrecer una experiencia similar a Playnite, adaptada al ecosistema Linux.

El programa permitirá centralizar videojuegos procedentes de diferentes plataformas, emuladores, gestores de compatibilidad y ejecutables independientes.

La aplicación no pretende reemplazar Steam, Heroic, Lutris, Bottles ni otros gestores. Su objetivo es unificar la biblioteca y proporcionar una interfaz desde la que el usuario pueda organizar y ejecutar sus juegos.

## 2. Objetivos principales

- Crear una biblioteca de juegos unificada.
- Mantener los datos del usuario independientemente de los clientes originales.
- Ofrecer una interfaz altamente personalizable.
- Permitir diferentes métodos de lanzamiento.
- Funcionar principalmente sin conexión a Internet.
- Evitar recopilación de telemetría innecesaria.
- Mantener una arquitectura modular.
- Facilitar futuras extensiones mediante plugins.
- No ejecutar programas automáticamente durante los escaneos.
- No eliminar juegos ni datos por desaparición de una instalación.

## 3. Tecnologías seleccionadas
Backend:
Rust

Aplicación de escritorio:
Tauri 2

Frontend:
React + TypeScript

Herramientas de frontend:
Vite

Base de datos:
SQLite

Estilos:
CSS personalizado con variables y tokens de diseño.

Sistema de control de versiones:
Git

Repositorio:
GitHub

## 4. Sistemas compatibles
Primera versión:

- Pop!_OS
- Ubuntu
- Distribuciones Linux basadas en Ubuntu
Compatibilidad futura:

- Fedora
- Debian
- Arch Linux
- Linux Mint
- Otras distribuciones con dependencias compatibles.

## 5. Filosofía
La biblioteca pertenece al usuario.

Los clientes externos son fuentes de información y métodos de ejecución, no propietarios de la biblioteca.

El usuario decide:

- Qué juegos importar.
- Qué juegos ejecutar.
- Qué información conservar.
- Qué directorios escanear.
- Qué integraciones activar.
- Qué modificaciones realizar.

## 6. Estado del proyecto
Actualmente se encuentra en fase de especificación y planificación.

Todavía no existe una implementación funcional completa.

La documentación debe considerarse la fuente de referencia para las futuras decisiones de desarrollo.
