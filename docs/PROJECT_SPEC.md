# Kiwanto project specification

## Status and terminology

Kiwanto is a planned Linux-first desktop application at the documentation and planning stage. This specification describes goals and intended requirements; it is not evidence that the application or any integration exists.

- **Current direction** means the project's present proposal, subject to validation.
- **Requirement** means an intended product behavior, not necessarily implemented behavior.
- **Open question** identifies a decision needing research, prototype evidence, or owner review.

## Product vision

Kiwanto aims to provide one customizable, modular, local-first place to organize and launch games across Linux stores, launchers, emulators, and manually configured installations. It takes inspiration from applications such as Playnite while designing around Linux's diverse game sources, runners, filesystems, and user workflows.

The product should help users understand and manage their library without taking ownership away from them. Core library use should not depend on an account, mandatory cloud sync, telemetry, or store credentials. Optional integrations must explain what they access and why.

## Product principles

1. **User control:** Users choose sources and folders, confirm discoveries, configure launches, and decide what to remove.
2. **Local-first ownership:** Library data remains useful locally and is not contingent on a remote service.
3. **Privacy and transparency:** Network access and access to external applications' data are limited, explained, and appropriate to the feature.
4. **Safe handling:** Discovered files are not executed, missing files do not silently erase library entries, and external data is untrusted.
5. **Linux-first compatibility:** Linux ecosystem needs guide design; integrations are evaluated separately rather than flattened into a false one-size-fits-all model.
6. **Maintainability:** Build a modular monolith with clear boundaries and only justified dependencies and abstractions.
7. **Honest claims:** Planned, prototyped, implemented, and verified behavior must be clearly distinguished.

## Users and primary workflows

The intended users are Linux players who want a unified view of games managed by multiple sources, emulators, or local installations, and who value control over their local data and interface. The workflows below are goals, not currently available functionality.

### Add and organize games

1. A user adds a game manually or selects a supported source/folder for discovery.
2. Kiwanto presents possible games as candidates with source and location information where available.
3. The user reviews and confirms which candidates to add.
4. Kiwanto stores a library entry independently from the installation and lets the user organize it with metadata, tags, collections, notes, or ratings.
5. If files later become unavailable, the entry and its user-managed data remain, with availability clearly indicated.

### Review and find a game

A user browses a library using available layouts, search, sorting, filters, and collections. Metadata and artwork should be attributable to their source when practical, and users should be able to review or correct information. Customization must not make core actions inaccessible.

### Configure and launch a game

A user selects or configures a launch profile, reviews its executable and arguments, and requests launch. The application reports whether process creation succeeded. Running-process detection and a confirmed play session are represented separately; an attempted launch is not automatically counted as a successful session.

### Customize the interface

A user chooses layouts, themes, colors, typography, spacing, artwork presentation, and relevant animation or sound preferences through declarative settings. Initial customization must not require installing arbitrary executable extensions.

## Functional requirements

### Library and installations

- Model a game/library entry independently from one or more installations or launch configurations.
- Preserve a game entry, user metadata, artwork references, notes, and history if installation files disappear.
- Represent installation availability without automatically deleting entries or files.
- Plan gradual source support for native Linux installations; Steam; Heroic (GOG, Epic Games Store, and Amazon Games); Lutris; Bottles; Wine/Proton; itch.io; RetroArch and other emulators; ROM collections; and manually configured executables or portable games.
- Do not assume all sources provide the same data, APIs, formats, or permissions.

### Metadata and organization

Planned data includes titles, descriptions, cover and background artwork, developers, publishers, release information, genres, tags, custom collections, notes, ratings, and installation/availability information. Search, sorting, and filtering are intended. Metadata, playtime, and session history may come from different sources and should not be represented as equally certain without justification.

### Launch management and session tracking

A configurable launch profile may include an executable path, an argument list, working directory, environment variables, runner/compatibility tool, and Wine/Proton prefix when applicable. Executable and arguments must be passed separately through safe process APIs. Never construct shell commands by concatenating untrusted strings.

The system must distinguish at least:

- A launch request or attempt.
- Successful or failed process creation.
- Detection that a process is running (which may be uncertain for wrappers and child processes).
- A confirmed or inferred play session and its history.

Playtime and session recording should communicate limitations and avoid implying certainty when only an estimate is available.

### Discovery and importing

- Discovery is initiated and scoped by the user; no full-disk scan by default.
- Users select sources/folders and can review the scope before scanning.
- Results are candidates for user confirmation, not automatically trusted library entries.
- Never execute a file merely because it was discovered or imported.
- Missing files do not automatically remove library entries.
- Avoid destructive changes; explain actions and provide clear feedback.

### Customization

Long-term goals include multiple library layouts; configurable panels and sections; themes and color palettes; typography and font sizes; element dimensions, spacing, and borders; backgrounds and artwork presentation; and animation, sound, loading, and startup options. Prefer declarative themes and constrained settings initially. Do not implement an arbitrary executable plugin system in the initial version.

## Non-functional requirements

- **Linux-first:** Make Linux the initial design and validation target. Other operating systems are future possibilities, not a current compatibility promise.
- **Local-first:** Core library browsing and management should not require a network connection, account, cloud synchronization, telemetry, or store credentials.
- **Privacy:** Limit filesystem and integration access to what a feature needs, explain access, and do not expose credentials in logs or configuration files.
- **Safety:** Validate external input and paths, use safe process APIs, and treat metadata, artwork, imported configuration, and source files as untrusted.
- **Data integrity:** Use database migrations and transactions. Design backups to preserve a consistent database state; evaluate SQLite journal modes and SQLite-supported backup approaches rather than assuming copying a live database file is always safe.
- **Reliability:** Handle unavailable sources, missing files, malformed metadata, process failures, and interrupted operations without losing unrelated user data.
- **Usability and accessibility:** Provide understandable feedback, discoverable controls, and customization that does not make important actions inaccessible.
- **Maintainability:** Favor explicit module boundaries, tests for critical behavior, and dependencies with a clear need.

These are intended requirements, not audited or measured guarantees.

## Scope boundaries

### Initial version direction

An early useful version should focus on a minimal Linux desktop shell, a local library and database, manually added entries, basic organization, and safe user-configured launch profiles after the process model is validated. The precise minimum feature set remains an owner decision informed by prototypes.

### Longer-term goals

Broader launcher/emulator integrations, richer metadata and artwork, play-session history, extensive declarative customization, more extension mechanisms, and any additional operating systems are longer-term goals. Each integration should have its own feasibility, permissions, privacy, and maintenance review.

### Explicitly not a core requirement

Mandatory accounts, mandatory cloud services, mandatory telemetry, automatic full-disk scanning, automatic execution of discovered files, automatic deletion of entries when files disappear, and arbitrary executable plugins in the initial version are outside the intended scope.

## Proposed stack and assumptions to validate

The current proposed stack is Rust for application logic and system integration; Tauri 2 for the desktop shell; React and TypeScript for the frontend; Vite for frontend tooling; and SQLite for local persistence.

The proposal aims to combine a native-oriented backend, a web-based customizable interface, and a small embedded local database. It is not a final commitment. Prototypes and research should validate Linux packaging and desktop integration, frontend/backend command security, process lifecycle behavior, accessibility and performance, migration and backup behavior, and long-term dependency/maintenance costs. See [Architecture](ARCHITECTURE.md) and [Roadmap](../ROADMAP.md).

## Development and project ownership

The project is initiated and directed by an independent creator without formal programming experience. AI coding assistants help with research, documentation, architecture, implementation, and testing. The creator is responsible for vision, requirements, decisions, testing, feedback, and review. AI output must be independently checked; it is not presumed correct. Experienced contributors are welcome. See [Contributing](../CONTRIBUTING.md).

## Security and privacy status

Security is a design responsibility from the beginning, not a claim that the project is secure. Intended safeguards include user-controlled discovery, no execution of discovered files, safe process APIs, input/path validation, limited permissions, careful credential handling, and clear integration disclosures. These safeguards require implementation, testing, and review. Kiwanto has not been represented as security-audited. See [Security](../SECURITY.md).

## License and reuse

**No license has been selected for the repository.** A public GitHub repository is not automatically licensed for reuse, modification, or redistribution. The owner must make an explicit license decision before granting such permissions. Contributors should not add or infer a license.

## Open questions

- Which minimal library and launch workflows define a useful first release?
- Which Tauri permissions and command boundaries are necessary, and how should they be reviewed?
- Which Linux distributions, desktop environments, and packaging formats should be used for prototype validation?
- What is the appropriate game/installation/profile data model and migration policy?
- Which SQLite journal and backup approach best supports safe backups and restoration?
- How should process tracking work when a launcher starts wrappers, child processes, or detached processes?
- Which metadata/artwork sources, if any, are acceptable without undermining local-first privacy?
- Which integrations have stable, documented interfaces and manageable maintenance costs?
- What declarative theme/configuration format is understandable and safe?
- What license does the owner want to select?
