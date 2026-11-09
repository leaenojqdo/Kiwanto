# Kiwanto

**A customizable, modular, local-first game library and launcher for Linux.**

Kiwanto is a planned desktop application designed to bring games from different stores, launchers, emulators, compatibility tools, and manually configured installations into one unified library.

Inspired by applications such as Playnite, Kiwanto aims to provide a Linux-first experience focused on customization, privacy, modularity, and user control.

> **Development status:** Kiwanto is currently in the documentation and planning stage. The application and its proposed features are not yet implemented or tested. The technology stack and architecture remain subject to validation through prototypes.

## Project goals

Kiwanto aims to:

- Provide a unified library for games from different sources.
- Keep library data locally owned and independent of external clients.
- Work without requiring an online account or cloud service.
- Offer extensive interface customization.
- Support different game launch methods and compatibility environments.
- Provide a modular, maintainable architecture.
- Prioritize privacy, transparency, and safe system interaction.
- Allow users to control what is discovered, imported, stored, and launched.
- Preserve library metadata even when a game is uninstalled or its original installation disappears.

Kiwanto is not intended to replace Steam, Heroic, Lutris, Bottles, or other existing game managers. Instead, it aims to unify the user's library and provide a central interface for organizing and launching games.

## Core principles

- **Local-first:** Core functionality should work without accounts, mandatory cloud synchronization, or external services.
- **User ownership:** The library and its metadata belong to the user, not to the original game stores or launchers.
- **Privacy:** No mandatory telemetry or unnecessary data collection.
- **Safe by default:** Scanning directories must never execute discovered files or automatically delete library entries.
- **Transparency:** Integrations must clearly communicate what information they access and what actions they perform.
- **Linux-first:** Linux requirements and conventions guide the design and implementation.
- **Modularity:** Prefer well-defined modules within a modular monolith rather than unnecessary complexity.
- **Honest development:** Planned features must not be presented as implemented functionality. AI-generated code must be reviewed and tested.

## Proposed technology stack

| Component | Technology |
|---|---|
| Backend and application logic | Rust |
| Desktop framework | Tauri 2 |
| Frontend | React + TypeScript |
| Frontend tooling | Vite |
| Local database | SQLite |
| Styling | Custom CSS with design tokens |
| Version control | Git |
| Repository hosting | GitHub |

These choices represent the current technical direction, not irreversible commitments. Prototypes and practical testing will help validate framework compatibility, Linux integration, process launching, accessibility, packaging, database migrations, and backup strategies.

See [TECH_STACK_DECISION.md](docs/TECH_STACK_DECISION.md) and [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Planned compatibility

### Initial target

- Pop!_OS
- Ubuntu
- Ubuntu-based Linux distributions

### Possible future support

- Debian
- Fedora
- Arch Linux
- Linux Mint
- Other Linux distributions with compatible dependencies.

## Planned integrations and capabilities

The long-term vision includes support for games from:

- Steam
- Heroic (GOG, Epic Games Store, and Amazon Games)
- itch.io
- Lutris
- Bottles
- Native Linux installations
- Wine and Proton environments
- RetroArch and other emulators
- ROM collections
- Manually configured executables and portable games

Other planned capabilities include:

- Game metadata and artwork management.
- Collections, tags, ratings, and notes.
- Search, filtering, and sorting.
- Multiple launch profiles and execution configurations.
- Playtime tracking and session history.
- Custom layouts, themes, colors, fonts, and interface elements.

These integrations and features will be developed gradually. Their availability and technical requirements will be evaluated individually.

Arbitrary executable plugins are not part of the initial development scope. Declarative themes and safe configuration are preferred as the first customization mechanisms.

## Security and data ownership

Kiwanto is designed to minimize unnecessary access to the user's system.

Some fundamental requirements include:

- Directory scans must be explicitly selected by the user.
- Discovered executables must never be launched automatically.
- Imported games must be confirmed by the user.
- Uninstalling a game must not automatically erase its library metadata.
- Launch configurations must use structured arguments rather than unsafe shell command concatenation.
- External metadata and integration data must be treated as untrusted input.
- Backups and database operations must preserve data consistency.

Security is a design requirement, not a feature to be added later.

See [SECURITY.md](SECURITY.md) and [docs/SECURITY.md](docs/SECURITY.md).

## Development approach

Kiwanto is an independent project directed by its creator, who does not have formal programming education.

AI coding assistants are used to support research, documentation, architecture, implementation, and testing. The creator remains responsible for defining requirements, making project decisions, testing the application, evaluating results, and directing its development.

AI-generated code and suggestions are not assumed to be correct. They must be reviewed, validated, and tested.

Contributions from experienced developers and other interested community members are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

The project documentation is the primary reference for its requirements, architecture, technical decisions, and development guidelines.

| Document | Description |
|---|---|
| [Project specification](docs/PROJECT_SPEC.md) | Product vision, requirements, scope, and workflows. |
| [Architecture](docs/ARCHITECTURE.md) | Modules, system boundaries, and data flow. |
| [Technology decisions](docs/TECH_STACK_DECISION.md) | Selected technologies and their rationale. |
| [Technical references](docs/TECHNICAL_REFERENCES.md) | Relevant frameworks, libraries, and technical resources. |
| [Library system](docs/LIBRARY_SYSTEM.md) | Game discovery, imports, metadata, and organization. |
| [Game launching](docs/GAME_LAUNCHING.md) | Launch profiles, execution, and session tracking. |
| [UI and themes](docs/UI_AND_THEMES.md) | Interface design and customization. |
| [Plugin system](docs/PLUGIN_SYSTEM.md) | Future extensibility and plugin architecture. |
| [Security](docs/SECURITY.md) | Security principles and requirements. |
| [Database and backup](docs/DATABASE_AND_BACKUP.md) | Persistence, migrations, and backup strategy. |
| [Decisions](docs/DECISIONS.md) | Recorded project decisions. |
| [Roadmap](docs/ROADMAP.md) | Development stages and future goals. |
| [Testing and contributing](docs/TESTING_AND_CONTRIBUTING.md) | Testing strategy and development guidelines. |
| [Contributing](CONTRIBUTING.md) | How to participate in the project. |

Additional repository guidance is available in [.github/copilot-instructions.md](.github/copilot-instructions.md).

## License

**No license has been selected yet.**

Although this repository is publicly visible, that does not automatically grant permission to reuse, modify, or redistribute its contents.

The licensing decision will be made explicitly by the project owner before an open-source license is added.

---

*Kiwanto — Your games, your library, your rules.*