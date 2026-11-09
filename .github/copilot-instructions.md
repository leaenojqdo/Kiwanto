# Copilot Instructions for Kiwanto

## Project context

Kiwanto is a planned Linux-first, customizable, modular, local-first game library and launcher.

The repository may contain plans and proposed capabilities that are not yet implemented. Never describe a planned feature as completed unless the code and tests demonstrate that it exists.

The project is initiated and directed by an independent creator. AI assistants support development, but the creator owns product decisions, priorities, review, and approval.

The creator is a beginner in software development. Explain technical decisions, commands, changes, and potential risks in clear, accessible language. Do not assume prior programming knowledge or overwhelm the creator with unnecessary technical detail.

Before making a change, consult the relevant documentation, especially:

- [README](../README.md)
- [Project specification](../docs/PROJECT_SPEC.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [Roadmap](../ROADMAP.md)
- [Tech stack decisions](../docs/TECH_STACK_DECISION.md)
- [Security](../docs/SECURITY.md)
- [Game launching](../docs/GAME_LAUNCHING.md)
- [Database and backup](../docs/DATABASE_AND_BACKUP.md)

Preserve useful existing work. Do not implement application code when asked only for planning, review, or documentation.

## Proposed technology stack

The current proposal is:

- Rust for application logic and system integration.
- Tauri 2 for the desktop shell.
- React and TypeScript for the frontend.
- Vite for frontend tooling.
- SQLite for local persistence.

This is the current project direction, not an irreversible commitment. Do not introduce additional frameworks, dependencies, or generated scaffolding unless the task explicitly asks for them and the choice is justified.

## Architecture principles

- Prefer a modular monolith with clear boundaries: desktop shell, frontend presentation, application commands and services, core domain, discovery, integrations, launch management, persistence, artwork and metadata, and settings.
- Keep game identity separate from installation state. Missing files must not silently erase a library entry.
- Treat external clients and stores as optional integrations. The user's library must not depend on any single external service.
- Isolate source-specific and Linux/platform-specific behavior where practical. Do not invent a universal integration API that hides real differences.
- Use SQLite migrations and transactions for persistent changes. Treat backup consistency and asset backup as explicit design concerns.
- Prefer focused, understandable designs. Avoid speculative abstractions, microservices, dependencies, and unrequested features.
- Linux is the initial target. Do not compromise Linux-first requirements for hypothetical future platforms.

## Development workflow

Before modifying code:

1. Inspect the repository and relevant documentation.
2. Understand the module and its responsibilities.
3. Identify dependencies and possible side effects.
4. Explain the proposed change and its scope when appropriate.
5. Make small, focused, verifiable changes.
6. Run relevant checks and tests.
7. Report the outcome honestly.

Do not rewrite entire modules without a clear reason. Do not change unrelated files or remove existing functionality to solve a problem superficially.

Do not commit, push, or publish changes unless explicitly requested by the creator.

If requirements are ambiguous, first inspect the documentation and existing code. Ask for clarification only when a material ambiguity cannot be resolved from the available context.

## Rust guidelines

- Prefer explicit types, clear ownership, and separation of responsibilities.
- Handle errors properly and provide useful error context.
- Validate external input and filesystem paths.
- Avoid unnecessary `unwrap()` and `expect()` calls in production code.
- Avoid unsafe Rust unless strictly necessary and clearly justified.
- Never construct shell commands by concatenating strings.
- Keep executable paths and argument arrays separate.
- Use safe process APIs and avoid indiscriminate filesystem access.
- Do not request root privileges for ordinary application functionality.

## TypeScript and frontend guidelines

- Use TypeScript rather than plain JavaScript for application code.
- Avoid `any` when a suitable alternative exists.
- Define explicit interfaces and types for application data.
- Separate visual components from business logic.
- Keep frontend code organized and maintainable.
- Handle loading, empty, success, and error states.
- Consider accessibility, responsiveness, and performance.
- Do not expose unrestricted system operations through frontend commands.

## Database and data integrity

- Use migrations when database schema changes are necessary.
- Update the relevant documentation when changing the schema or data model.
- Use transactions for operations that must remain consistent.
- Avoid destructive operations and never delete user data automatically.
- Preserve library metadata when an installation disappears.
- Treat backups and restoration as important data-integrity operations.
- Never silently overwrite or discard existing user data.

## Security and privacy requirements

- Core use must not require accounts, cloud services, telemetry, or store credentials.
- Discovery must be limited to user-selected locations. Do not perform full-disk scans by default.
- Scanning must produce candidates for user confirmation, not automatically import or execute discovered files.
- Never execute discovered or imported files during scanning.
- Never delete library entries automatically.
- Never build shell commands by concatenating strings. Keep executable paths and argument arrays separate and use safe process APIs.
- Distinguish launch attempts, process creation, running-process detection, and confirmed or inferred play sessions.
- Validate paths and external input. Treat metadata, artwork, imported settings, and source data as untrusted.
- Minimize filesystem permissions and Tauri capabilities. Do not expose broad generic shell or filesystem commands to the frontend.
- Do not store credentials in ordinary configuration files or logs.
- Explain integration access and network behavior.
- Do not add arbitrary executable plugins to the initial design. Prefer declarative themes and constrained settings.
- Do not claim security, privacy, compatibility, or audit guarantees that have not been implemented and verified.

## Integrations and plugins

- External launchers, stores, emulators, and compatibility tools must remain optional integrations.
- Keep integrations isolated so that one integration failure does not compromise the rest of the application.
- Do not assume all external clients expose the same capabilities or data.
- Do not introduce arbitrary plugin code execution in the initial version.
- Do not store external account credentials unless a future, explicitly approved design establishes a secure mechanism.

## Coding and documentation conventions

- Match the existing repository style and keep changes focused.
- Use clear technical English in repository documentation.
- Distinguish requirements, current behavior, proposals, assumptions, and open questions.
- Update related documentation when behavior or architecture changes.
- Do not invent completed functionality, releases, badges, or test results.
- Handle errors explicitly and keep user-facing outcomes understandable.
- Do not add a license or claim reuse rights. The repository currently has no selected license.

## Testing expectations

- Inspect the repository and available scripts before choosing tests.
- Add or update tests for changed behavior where appropriate.
- Pay particular attention to domain rules, migrations and transactions, input validation, process argument separation, and failure cases.
- Use safe, isolated test fixtures.
- Never run user games or discovered executables as tests.
- Do not claim that tests were executed if they were not.
- Report exactly which checks were run and their outcomes.
- If tests cannot be run, state that plainly.
- For documentation-only changes, check consistency and internal links where practical.

When reporting completed work, explain:

- What was changed.
- Why it was changed.
- What was tested.
- What could not be tested.
- What risks or limitations remain.

## AI-generated changes

AI-generated output is a draft, not proof of correctness.

Verify technical claims against authoritative sources or repository evidence. Inspect every generated change, especially when it affects security, privacy, data integrity, or platform-specific behavior.

Do not fabricate APIs, tests, implementation status, or user requirements.

The creator's documented decisions and explicit instructions take precedence over AI assumptions. If a proposed change contradicts the documentation, identify the conflict and propose a documented update before implementing it.