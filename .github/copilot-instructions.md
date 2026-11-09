# Copilot instructions for Kiwanto

## Project context

Kiwanto is a planned Linux-first, customizable, modular, local-first game library and launcher. The repository is currently at the documentation/planning stage. Described capabilities are future goals unless code and tests demonstrate otherwise. The product is initiated and directed by an independent creator; AI assistants support the work, while the creator owns product decisions and review. Welcome experienced contributors and provide clear explanations when useful.

Before making a change, consult the [README](../README.md), [project specification](../docs/PROJECT_SPEC.md), [architecture](../docs/ARCHITECTURE.md), and [roadmap](../ROADMAP.md) relevant to the task. Preserve useful existing work. Do not implement application code when asked only for planning or documentation.

## Proposed stack

The current proposal is Rust for application logic and system integration; Tauri 2 for the desktop shell; React and TypeScript for the frontend; Vite for frontend tooling; and SQLite for local data. This is a direction to validate, not an irreversible commitment. Do not introduce application frameworks, dependencies, or generated scaffolding unless the task explicitly asks for it and the choice is justified.

## Architecture principles

- Prefer a modular monolith with clear boundaries: desktop shell, frontend presentation, application commands/services, core domain, discovery, integrations, launch management, persistence, artwork/metadata, and settings/customization.
- Keep game identity separate from installation state. Missing files must not silently erase a library entry.
- Isolate source-specific and Linux/platform-specific behavior where practical; do not invent a universal integration API that hides real differences.
- Use SQLite migrations and transactions for persistent changes. Treat backup consistency and asset backup as explicit design concerns.
- Prefer focused, understandable designs. Avoid speculative abstractions, microservices, dependencies, and unrequested features.
- Linux is the initial target. Do not compromise Linux-first requirements for hypothetical future platforms.

## Security and privacy requirements

- Core use must not require accounts, cloud services, telemetry, or store credentials.
- Discovery must be user-scoped; no full-disk scanning by default. Present discoveries for confirmation.
- Never execute discovered/imported files or delete library entries automatically.
- Never build shell commands by concatenating strings. Keep executable paths and argument arrays separate and use safe process APIs.
- Distinguish launch attempts, process creation, running-process detection, and confirmed/inferred sessions.
- Validate paths and external input. Treat metadata, artwork, imported settings, and source data as untrusted.
- Minimize filesystem permissions and Tauri capabilities. Do not expose broad generic shell or filesystem commands to the frontend.
- Keep credentials out of logs and ordinary configuration files. Explain integration access and network behavior.
- Avoid destructive data operations; report errors clearly and preserve unrelated data.
- Do not claim security, privacy, compatibility, or audit guarantees that have not been implemented and verified.
- Do not add arbitrary executable plugins to the initial design; prefer declarative themes and constrained settings.

## Coding and documentation conventions

- Match the existing repository style and keep changes focused.
- Use clear technical English in repository documentation; distinguish requirements, current behavior, proposals, assumptions, and open questions.
- Update related documentation when behavior or architecture changes. Do not invent completed functionality, releases, badges, or test results.
- Handle errors explicitly and keep user-facing outcomes understandable.
- Do not add a license or claim reuse rights. The repository currently has no selected license.

## Testing expectations

Inspect the repository and available scripts before choosing tests. Add/update tests for changed behavior where appropriate, especially domain rules, migrations/transactions, input validation, process argument separation, and failure cases. Use safe isolated fixtures; never run user games or discovered executables as tests. Report exactly which checks were run and their outcome. If tests cannot be run, state that plainly. For documentation-only changes, check consistency and internal links where practical.

## AI-generated changes

AI output is a draft, not proof. Verify factual and technical claims against authoritative sources or repository evidence; inspect every generated change; consider security, privacy, data integrity, and platform-specific behavior; and run appropriate validation. Do not fabricate APIs, tests, implementation status, or user requirements. Ask for clarification only when repository context and task instructions cannot resolve a material ambiguity.
