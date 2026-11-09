# Kiwanto architecture (proposed)

## Status

This is a proposed architecture for a planned application, not a description of existing code. The current direction is a Linux-first modular monolith using Rust, Tauri 2, React, TypeScript, Vite, and SQLite. Prototypes should validate the choices before they become fixed commitments. See the [project specification](PROJECT_SPEC.md) and [roadmap](../ROADMAP.md).

## Architectural goals

- Keep the core library local-first and useful without mandatory accounts, cloud services, telemetry, or store credentials.
- Separate game identity from installations and launch profiles.
- Isolate source-specific and platform-specific behavior behind focused interfaces where that reduces coupling.
- Make user-visible operations explicit and errors understandable.
- Protect user data through migrations, transactions, and a validated backup/restore design.
- Prefer a modular monolith over microservices; do not introduce service infrastructure without a demonstrated requirement.
- Keep the system understandable, testable, and appropriately small for the project's stage.

## High-level structure

```text
React + TypeScript presentation (Vite-built assets)
                │ typed, permission-limited Tauri commands/events
                ▼
Tauri desktop shell and Rust application boundary
                │
       Application services/use cases
       ├── library and organization
       ├── discovery/import orchestration
       ├── launch and process tracking
       ├── metadata/artwork operations
       └── settings/customization
                │
             Core domain
       ├── games and user-owned metadata
       ├── installations and availability
       ├── launch profiles and outcomes
       └── collections, sessions, and settings
                │
       Persistence and adapters
       ├── SQLite repositories/migrations
       ├── filesystem/artwork storage
       └── source-specific integration adapters
```

This is a logical separation, not a requirement for separate processes, packages, or crates at the outset. Keep boundaries clear while allowing the simplest implementation that remains maintainable.

## Modules and responsibilities

- **Desktop shell:** Window lifecycle, application startup, operating-system integration, and narrowly scoped Tauri capabilities. It should not contain product rules or broad filesystem/process permissions by default.
- **Frontend presentation:** Library views, forms, search/filter controls, customization, accessibility, and user feedback. It should not access the database or launch processes directly; it requests allowed operations through the application boundary.
- **Application commands and services:** Validate requests, coordinate domain operations, call persistence/integration adapters, and return explicit success or failure results. Commands exposed to the frontend are an API boundary and must be narrowly scoped and validated.
- **Core domain:** Source-independent concepts and rules. A game entry is distinct from installation state. Launch request, process-start result, running-process observation, and play session are distinct concepts.
- **Discovery:** User-selected source/folder scanning, candidate normalization, duplicate handling proposals, and progress/errors. Discovery returns candidates for review; it does not execute files, silently import everything, or delete missing entries.
- **Integrations:** Adapters for individual game stores, launchers, compatibility tools, and emulators. Each adapter documents its data access, permissions, format/version assumptions, failure modes, and any network behavior. Do not assume all integrations have a common API.
- **Launch management:** Validate and execute configured launch profiles using safe process APIs. Keep executable path and argument vector separate; do not build shell commands from strings. Record process outcomes and tracking confidence explicitly.
- **Persistence:** SQLite schema, migrations, transactions, and repositories. Persistence code owns database details; domain/application behavior should not depend on SQL layout.
- **Artwork and metadata:** Manage references and local assets separately from game identity. Treat downloaded or imported content as untrusted and make its source clear where practical.
- **Settings and customization:** Store constrained, versionable user preferences. Prefer declarative themes and validated configuration over executable extensions.

## Data model boundaries

The exact schema remains open. Conceptually, keep separate records or concepts for:

- **Game:** Stable library identity and user-maintained details.
- **Installation:** A location or source-managed instance, which may be absent or unavailable without invalidating the game.
- **Launch profile:** User-configured executable/runner details, working directory, arguments, environment, and applicable prefix.
- **Source/integration:** Information about where an installation or metadata was discovered, with source-specific fields isolated from the core model.
- **Metadata/artwork:** Values and assets that may have provenance, confidence, and replacement/removal lifecycle independent of the game entry.
- **Collection and user annotations:** User-created organization, notes, and ratings.
- **Launch attempt/process observation/session:** Separate lifecycle records so failed starts and uncertain detection are not counted as confirmed play sessions.

Use stable identifiers and explicit relationships; do not make a filesystem path the sole identity of a game. The schema must evolve through migrations.

## Data flow

### Discovery and import

1. The frontend asks the user to select a supported source or folder and explains the scope.
2. A narrowly permissioned command validates the request and invokes the relevant discovery adapter.
3. The adapter reads only the needed source data and returns normalized candidates plus warnings/provenance.
4. The frontend presents candidates; the user confirms what to add.
5. An application service validates the confirmed records and persists them transactionally.

Discovery must not execute candidate files or automatically remove existing library entries. Interrupted scans should not leave half-applied imports.

### Launch and tracking

1. The frontend requests launch for a selected profile.
2. An application service validates the profile and resolves the intended executable/runner using explicit rules.
3. The launch manager starts a process through safe operating-system APIs with a separate argument vector and controlled environment.
4. The system reports process creation success/failure distinctly from whether a game is detected as running.
5. A session is recorded only according to explicit tracking rules; the UI should communicate uncertainty and avoid converting a launch attempt directly into a successful play session.

### Frontend/backend communication

Use Tauri's command/event mechanism as a deliberate boundary. Expose a small set of typed operations with validated inputs and explicit result/error shapes. Frontend input is untrusted, even when generated by the application UI. Avoid broad commands such as arbitrary command execution, unrestricted path access, or generic filesystem APIs. Keep event payloads minimal and document their lifecycle.

## Integration boundaries

An integration should be an adapter around one source, not a collection of assumptions spread across the UI and core domain. The common boundary may cover capabilities such as listing installations or reading source metadata, but source-specific capabilities and limitations should remain explicit. Prefer read-only access initially where practical. Do not access credentials unless a clearly justified feature requires it; never log credentials. Make optional network requests and data access visible and user-controlled.

Platform-specific behavior—filesystem conventions, process control, desktop integration, and paths—should be isolated behind focused abstractions where it materially improves clarity or later portability. Avoid designing a generic cross-platform framework before another platform is in scope.

## Database and file responsibilities

SQLite is the proposed local structured store. It should own durable library records, settings that need structured migration, and relationships/history where appropriate. Use schema migrations and transactions for related changes. Decide and document the journal mode and backup strategy based on actual SQLite behavior and application needs; do not assume copying a live database file always gives a consistent backup. Evaluate SQLite's supported backup mechanisms, consistency during application use, restoration, and failure recovery.

Large artwork files may live in a managed local asset directory with database references, rather than as database blobs, if prototypes confirm that this is simpler and reliable. Define cleanup carefully: unused-file cleanup must not remove user data unexpectedly. Backups must account for both database and referenced assets, or clearly state what is excluded.

## Security, privacy, and failure handling constraints

- Validate paths, arguments, settings, and all external input at the application boundary.
- Minimize Tauri capabilities and filesystem permissions; avoid broad access where scoped access is possible.
- Never execute a file merely because it was discovered or imported.
- Never concatenate untrusted strings into a shell command.
- Treat metadata, artwork, source files, and imported configuration as untrusted.
- Keep credentials out of logs, error messages, and ordinary configuration files.
- Avoid destructive operations and do not remove entries when files disappear.
- Make source access, network use, and failures visible to the user.
- Handle partial failures and database errors without silently losing unrelated data.

These are design constraints, not evidence that the application is secure or audited.

## Testing strategy (planned)

As implementation begins, test core domain rules without desktop dependencies; migration and transactional behavior against temporary databases; import candidate and confirmation flows; launch argument separation and process outcomes using controlled test fixtures; and frontend command validation and user-visible error handling. Integration tests should use isolated fixtures and must not run arbitrary user games. Linux-specific integration and packaging should be tested on declared environments. Tests and manual checks should be documented honestly.

## Open architecture decisions

Prototype and research should determine the project layout and Rust crate boundaries, exact frontend command typing strategy, Tauri permission model, game/installation/profile schema, source adapter capabilities, process tracking limits, artwork asset lifecycle, SQLite journal and backup/restore approach, and Linux packaging targets. Choose the simplest design that meets validated requirements; do not resolve these questions by adding speculative abstractions.
