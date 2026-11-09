# Kiwanto

A planned, customizable, modular, local-first game library and launcher designed for Linux.

Kiwanto aims to bring games from different stores, launchers, emulators, and manually configured installations into one interface—while keeping users in control of their data and their system.

> **Development status:** Kiwanto is at the documentation and planning stage. The application, integrations, and features described here are goals, not implemented or tested functionality. The proposed technology stack and architecture are subject to validation through prototypes.

## Project goals

Kiwanto is intended to:

- Provide a unified library for games from the varied Linux gaming ecosystem.
- Keep library data local and usable without an account or mandatory cloud service.
- Give users control over discovery, imports, launches, and customization.
- Use a modular architecture that can grow without becoming needlessly complex.
- Treat privacy, safe data handling, and clear communication as core product requirements.

Kiwanto takes inspiration from game-library applications such as Playnite, but is planned specifically around Linux and its ecosystem. See the [product specification](docs/PROJECT_SPEC.md) for the detailed vision and requirements.

## Principles

- **Local-first and user-owned:** Core library use should not require an online account, cloud synchronization, telemetry, or store credentials.
- **Privacy and transparency:** Explain what an integration accesses and why. Network access, where needed for optional services, should be clear and user-controlled.
- **Safe by default:** Discovery must not execute files or delete entries automatically. External metadata is untrusted input.
- **Linux-first:** Linux needs shape the design; possible future platform support must not undermine that focus.
- **Modular, maintainable design:** Prefer clear module boundaries in a modular monolith; add abstraction only when it solves a real problem.
- **Honest development:** Plans are not claims of completed functionality, and generated code requires human review and testing.

## Proposed technology

The current direction is **Rust** for application logic and system integration, **Tauri 2** for the desktop shell, **React** and **TypeScript** for the interface, **Vite** for frontend tooling, and **SQLite** for local persistence. These are proposals, not irreversible commitments. Prototypes should validate the framework fit, Linux integration needs, safe process launching, accessibility, packaging, database migrations, and backup strategy before the choices are treated as settled. See [Architecture](docs/ARCHITECTURE.md).

## Planned capabilities

Long-term goals include a library for native Linux games and games managed by Steam, Heroic, Lutris, Bottles, Wine/Proton, itch.io, emulators such as RetroArch, ROM collections, and user-configured executables. Other planned areas include metadata and artwork, collections, search and filtering, notes and ratings, launch profiles, process/session history, and extensive interface customization.

These capabilities will be introduced gradually. Integrations may have different technical requirements and should not be assumed to be available or uniform. Arbitrary executable plugins are not part of the initial plan; declarative themes and safe configuration are preferred first. The [roadmap](ROADMAP.md) describes the planned sequence.

## Development approach

Kiwanto is initiated and directed by an independent creator. AI coding assistants support research, documentation, architecture, implementation, and testing. The creator remains responsible for product direction, requirements, decisions, testing, feedback, and review. AI-generated output is not assumed to be correct and should be checked like any other contribution.

The project welcomes experienced developers and other contributors who want to help shape and build it. See [Contributing](CONTRIBUTING.md) for how to participate.

## Documentation

- [Project specification](docs/PROJECT_SPEC.md) — product vision, requirements, workflows, and scope.
- [Architecture](docs/ARCHITECTURE.md) — proposed modules, data flow, and technical boundaries.
- [Roadmap](ROADMAP.md) — staged development direction and open validation work.
- [Contributing](CONTRIBUTING.md) — issue, feature proposal, and contribution guidance.
- [Security](SECURITY.md) — vulnerability reporting guidance and current security status.
- [Copilot instructions](.github/copilot-instructions.md) — repository-specific guidance for AI coding assistants.

## License status

**No license has been selected for this repository.** Public visibility does not grant permission to reuse, modify, or redistribute the code. Do not assume the project is open source or add a license without the owner's explicit decision. See the [license discussion in the project specification](docs/PROJECT_SPEC.md#license-and-reuse).
