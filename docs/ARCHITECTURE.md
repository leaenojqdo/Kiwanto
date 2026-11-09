# Kiwanto Architecture

**Proposed system architecture and technical boundaries**

## 1. Status and overview

This document describes the proposed architecture of Kiwanto. It is a design reference for future implementation, not a description of existing or tested code.

Kiwanto will follow a **Linux-first modular monolith architecture**, built around a single desktop application.

The current technical direction is:

- Rust for backend logic and system integration.
- Tauri 2 for the desktop application shell.
- React and TypeScript for the frontend.
- Vite for frontend tooling.
- SQLite for local structured data.
- Custom CSS for interface styling.

These technologies and architectural decisions must be validated through prototypes before being considered permanent.

The application will not use microservices in its initial development stages.

## 2. Architectural goals

The architecture should:

- Keep the core library local-first and usable without mandatory accounts, cloud services, telemetry, or store credentials.
- Separate game identity from installations and launch profiles.
- Keep external integrations independent from the core library.
- Make user-visible operations explicit and errors understandable.
- Protect user data through database migrations, transactions, and a validated backup and restoration strategy.
- Keep modules focused and maintainable.
- Minimize unnecessary permissions and system access.
- Support future expansion without introducing premature complexity.
- Keep the application functional when individual integrations are unavailable or disabled.

## 3. High-level architecture

The application is logically divided into the following layers:

```text
React + TypeScript frontend
          |
          | Typed Tauri commands and events
          |
Tauri desktop shell
          |
          |
Rust application backend
          |
          +-- Application services
          |      |
          |      +-- Library management
          |      +-- Discovery and imports
          |      +-- Game launching
          |      +-- Process tracking
          |      +-- Metadata and artwork
          |      +-- Configuration
          |
          +-- Core domain
          |      |
          |      +-- Games
          |      +-- Installations
          |      +-- Launch profiles
          |      +-- Collections
          |      +-- Play sessions
          |
          +-- Persistence and adapters
                 |
                 +-- SQLite database
                 +-- Filesystem and artwork
                 +-- External integrations
```

These are logical boundaries, not requirements for separate processes, services, or Rust crates.

The simplest implementation that preserves clear responsibilities should be preferred.

## 4. Backend

**Language:** Rust

The backend is responsible for application logic, persistent data, system interaction, and operations that require access to the operating system.

Its responsibilities include:

- Library management.
- SQLite access and database migrations.
- Directory scanning and game discovery.
- Import candidate validation.
- Metadata and artwork management.
- Game launching and process management.
- Play session tracking.
- Configuration management.
- Communication with external integrations.
- Request validation and security boundaries.
- Statistics and history.

The backend must remain the authority for sensitive operations. The frontend must not directly execute programs, manipulate database files, or access unrestricted filesystem operations.

### 4.1 Proposed Rust project organization

The following is a conceptual structure. The exact file and crate organization may change during implementation.

```text
src/
├── main.rs
├── lib.rs
└── modules/
    ├── library/
    ├── database/
    ├── scanning/
    ├── launching/
    ├── integrations/
    ├── metadata/
    ├── statistics/
    ├── configuration/
    ├── security/
    └── plugins/
```

Each module must have a clearly defined responsibility.

The plugin module represents a possible future extension point. It does not imply that arbitrary executable plugins will be supported in the initial release.

## 5. Frontend

**Technologies:**

- React.
- TypeScript.
- Vite.
- Custom CSS with design tokens and variables.

The frontend is responsible for the graphical interface and user interaction.

Its responsibilities include:

- Library visualization.
- Navigation and application layout.
- Game information and metadata editing.
- Search, filtering, and sorting.
- Collections and organization.
- Theme and appearance management.
- Settings and configuration interfaces.
- Statistics and history visualization.
- User feedback, notifications, and error presentation.
- Communication with the Rust backend.

### 5.1 Proposed frontend organization

```text
src/
├── app/
├── components/
├── pages/
├── library/
├── themes/
├── settings/
├── statistics/
├── services/
├── types/
└── styles/
```

The frontend should not access SQLite directly or launch games independently.

All privileged operations must pass through the application boundary.

## 6. Frontend and backend communication

The frontend will communicate with Rust through Tauri commands and events using IPC.

Commands exposed to the frontend represent an application API boundary.

They must:

- Have clear and descriptive names.
- Validate all incoming arguments.
- Return structured results and errors.
- Expose only the permissions and operations actually required.
- Maintain narrowly defined responsibilities.
- Avoid unrestricted filesystem access and arbitrary command execution.
- Avoid exposing sensitive internal implementation details.

Frontend input must always be treated as untrusted, even when it originates from the application's own interface.

Events should have documented purposes, minimal payloads, and predictable lifecycles.

## 7. Core modules and responsibilities

### 7.1 Library

Manages the user's game collection and its organization.

The library must remain independent of the installation state and external game clients.

### 7.2 Database

Manages SQLite persistence, repositories, schema migrations, and transactions.

Database implementation details should remain isolated from the core domain.

### 7.3 Scanning and discovery

Responsible for discovering games from user-selected directories and supported sources.

It must produce candidates for review instead of silently importing or executing discovered files.

### 7.4 Launching

Manages launch profiles, executable resolution, process creation, and launch outcomes.

Executable paths, arguments, working directories, environment variables, and compatibility prefixes must be handled as separate structured values.

### 7.5 Integrations

Provides adapters for individual game stores, launchers, compatibility tools, and emulators.

Each integration must document its capabilities, data access, permissions, assumptions, failure modes, and network behavior.

### 7.6 Metadata and artwork

Manages game information, artwork references, and locally stored assets.

Metadata and downloaded assets must be treated as untrusted external content.

### 7.7 Statistics

Manages playtime, launch history, session information, and related statistics.

Uncertain process detection must not be represented as confirmed playtime.

### 7.8 Configuration

Manages application preferences, interface settings, and other persistent user configuration.

Settings should be validated and versionable where appropriate.

### 7.9 Security

Provides shared validation and security-related rules for filesystem operations, process launching, external input, and application permissions.

### 7.10 Plugins

Represents a future extension mechanism.

The initial implementation should prioritize declarative themes and validated configuration rather than arbitrary executable plugin code.

## 8. Data model boundaries

The exact database schema remains open.

However, the architecture must distinguish the following concepts:

- **Game:** Stable library identity and user-maintained information.
- **Installation:** A particular installed instance or location. It may become unavailable without invalidating the game.
- **Launch profile:** Executable, runner, arguments, working directory, environment variables, and applicable compatibility prefix.
- **Source/integration:** Information about where an installation or metadata was discovered.
- **Metadata and artwork:** Information and assets with their own provenance and lifecycle.
- **Collection and annotations:** User-created organization, notes, ratings, and tags.
- **Launch attempt:** A request to start a game.
- **Process observation:** Evidence that a process was created or detected.
- **Play session:** A tracked period of gameplay based on explicit tracking rules.

These concepts must not be collapsed into a single game record.

In particular, a failed launch attempt must not automatically become a successful play session.

Stable identifiers and explicit relationships should be used. A filesystem path must never be the sole identity of a game.

## 9. Discovery and import workflow

The expected workflow is:

1. The user selects a supported source or directory.
2. The application explains what will be scanned.
3. The backend validates the request.
4. The relevant discovery adapter reads the necessary information.
5. The backend returns normalized candidates, warnings, and source information.
6. The frontend displays the candidates for review.
7. The user confirms which games to import.
8. The backend validates the confirmed records and stores them transactionally.

Discovery must never:

- Execute discovered executables.
- Automatically import every candidate without user confirmation.
- Delete existing library entries when files disappear.
- Scan the entire filesystem by default.
- Leave partially imported records after an interrupted operation.

## 10. Game launching and process tracking

The expected launch workflow is:

1. The user selects a game and a launch profile.
2. The frontend requests the launch operation.
3. The backend validates the profile.
4. The launch manager resolves the executable and runner.
5. The backend starts the process using safe operating-system APIs.
6. The application reports whether process creation succeeded or failed.
7. Process detection and session tracking operate independently according to explicit rules.

Executable paths and argument vectors must remain separate.

Shell command strings must not be constructed by concatenating untrusted values.

The system should communicate uncertainty when it cannot reliably determine whether a game is running or how long it has been played.

## 11. External integrations

Integrations should use supported and documented interfaces whenever possible.

Preferred methods include:

- Documented command-line interfaces.
- Public URI schemes.
- Documented APIs.
- Known configuration files, when access is necessary and authorized.

Unstable internal interfaces should be avoided when a public alternative exists.

Each integration should be independently activatable and deactivatable.

The core library must not depend on Steam, Heroic, Lutris, or any other specific external application to function.

Integrations should use focused adapters rather than spreading source-specific assumptions throughout the frontend and core domain.

Read-only access should be preferred initially where practical.

Credentials must not be accessed unless a clearly justified feature requires them, and they must never be written to logs.

Optional network access and data collection must be transparent and user-controlled.

## 12. Database and file responsibilities

SQLite is the proposed local structured database.

It will be responsible for persistent library records, relationships, settings, and history.

Database operations must use appropriate migrations and transactions.

The following areas require validation:

- Database journal mode.
- Consistent backup and restoration.
- Recovery from interrupted operations.
- Migration reliability.
- Database integrity during application use.

A live database file must not be assumed to be safe to copy directly for backup without considering SQLite's behavior.

Large artwork files may be stored in a managed local asset directory, with references maintained in SQLite, if prototypes demonstrate that this is reliable and maintainable.

Asset cleanup must never unexpectedly remove user-owned data.

Backups must account for both the database and referenced assets, or clearly document exclusions.

## 13. Security, privacy, and failure handling

The architecture must follow these constraints:

- Validate filesystem paths, arguments, settings, and external input.
- Minimize Tauri capabilities and filesystem permissions.
- Never execute files merely because they were discovered or imported.
- Never concatenate untrusted strings into shell commands.
- Treat external metadata, artwork, and imported configuration as untrusted.
- Keep credentials out of logs, error messages, and ordinary configuration files.
- Avoid destructive operations.
- Preserve library entries when installations disappear.
- Make external source access and network activity visible.
- Handle partial failures without silently losing unrelated data.

These requirements describe the intended design. They are not evidence that the application is already secure or audited.

See [SECURITY.md](SECURITY.md) for the security requirements.

## 14. Testing strategy

Testing will be introduced alongside implementation.

Planned areas include:

- Core domain rules without desktop dependencies.
- Database migrations and transactional behavior.
- Import candidate validation and confirmation.
- Launch argument separation.
- Process creation and failure handling.
- Process tracking and session accuracy.
- Frontend command validation.
- User-visible errors and recovery behavior.
- Integration behavior using isolated test fixtures.
- Linux-specific functionality and packaging.

Integration tests must not execute arbitrary user games.

Tests and manual verification must be documented honestly.

## 15. Open architecture decisions

The following decisions require further research or practical prototypes:

- Exact Rust project and crate organization.
- Frontend/backend command typing strategy.
- Tauri permission and capability configuration.
- Final game, installation, and launch profile schema.
- Integration adapter capabilities.
- Process detection and tracking limitations.
- Artwork asset storage and cleanup lifecycle.
- SQLite journal mode and backup/restore implementation.
- Linux packaging targets and dependency requirements.
- Future plugin architecture and its security boundaries.

The guiding rule is to choose the simplest architecture that satisfies validated requirements.

Avoid speculative abstractions and unnecessary infrastructure.

## 16. Architectural principle

The local library is the core of Kiwanto.

External clients and integrations are optional.

The frontend is the presentation layer.

The Rust backend is responsible for application logic and sensitive operations.

The user remains in control of their games, data, system, and configuration.

---

*This document describes the proposed architecture of Kiwanto and will evolve as implementation and testing validate its design.*