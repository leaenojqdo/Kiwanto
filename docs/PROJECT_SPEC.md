# Kiwanto — Project Specification

**Product vision, functional requirements, scope, and design principles**

## 1. Project overview

Kiwanto is a planned Linux-first desktop application designed to unify video game libraries from different stores, launchers, emulators, compatibility tools, and manually configured installations.

Inspired by applications such as Playnite, Kiwanto aims to provide a highly customizable, modular, local-first game library and launcher built around Linux and its gaming ecosystem.

The application is not intended to replace Steam, Heroic, Lutris, Bottles, or other existing game managers. Instead, it will provide a unified interface for organizing and launching games managed by different sources.

**Development status:** Kiwanto is currently in the documentation and planning stage. The requirements described here are intended goals, not implemented or verified functionality.

## 2. Product principles

1. **User control:** Users decide which games to import, launch, modify, and remove.
2. **Local-first ownership:** Library data remains locally available and independent of external clients.
3. **Privacy:** No mandatory accounts, cloud synchronization, telemetry, or unnecessary data collection.
4. **Safety:** Discovered files are never executed automatically, and missing installations do not silently erase library entries.
5. **Transparency:** Integrations must explain what information they access and what operations they perform.
6. **Linux-first:** Linux requirements and conventions guide the initial design and development.
7. **Modularity:** External integrations should remain independent from the core library.
8. **Maintainability:** Prefer a modular monolith with clear boundaries over unnecessary infrastructure.
9. **Honest development:** Planned, prototyped, implemented, and verified functionality must be clearly distinguished.

## 3. Target users

Kiwanto is intended for:

- Linux users who maintain game libraries from multiple sources.
- Players who use several stores and launchers.
- Users of Wine and Proton.
- Emulator users.
- Players who maintain local or portable game collections.
- Users who prefer control over their personal data.
- Users who want extensive control over their application interface.

## 4. Game sources and integrations

The application should gradually support games from the following sources:

### Game stores and launchers

- Steam.
- Heroic Games Launcher.
- GOG.
- Epic Games Store.
- Amazon Games through Heroic, where applicable.
- itch.io.
- Lutris.
- Bottles.

### Native and manually managed games

- Native Linux games.
- Windows games through Wine or Proton.
- Portable executables.
- Manually installed games.
- User-configured executable paths.
- Games that are not currently installed.
- Manually created library entries.

### Emulators and ROM collections

- RetroArch.
- Individual emulators.
- ROM collections.
- Other compatible emulation environments.

Integrations must be independent.

A failure or missing dependency in one integration must not prevent the rest of the application or other integrations from functioning.

Kiwanto must not assume that all sources expose the same APIs, metadata, configuration formats, or capabilities.

## 5. Library management

Each game should have a stable internal identity independent of its installation path or original launcher.

Planned game information includes:

### Basic information

- Internal identifier.
- Name and alternative titles.
- Description.
- Developer.
- Publisher.
- Release date.
- Genres.
- Platform.
- Supported languages.
- Age classification.

### Installation and launching information

- Installation status.
- Installation location.
- Associated source or integration.
- Available launch profiles.
- Executable and runner configuration.
- Compatibility environment where applicable.

### Artwork and media

- Cover artwork.
- Logos.
- Background images.
- Screenshots.
- Other visual assets.

### User organization

- Tags.
- Custom collections.
- Favorites.
- Personal ratings.
- Notes.
- Custom metadata fields.

### History and statistics

- Playtime.
- Launch history.
- Play session history.
- Relevant execution information.

Fields should be editable manually where appropriate.

Metadata and artwork obtained externally should have identifiable provenance where practical. External information must not silently overwrite user-managed data.

## 6. Installation states

A game may have different availability states, including:

- Installed.
- Not installed.
- Installation not found.
- Installation status unknown.
- Available through an external client.
- Available through an emulator.
- Portable executable.
- Pending launch configuration.

These states must be represented independently from the game's library identity.

If an executable disappears or a game is uninstalled, Kiwanto must preserve the library entry, user metadata, artwork references, notes, collections, and relevant history.

The application must not automatically delete the game or its associated user data.

## 7. Library functionality

Planned library features include:

- Search.
- Filtering.
- Sorting.
- Collections.
- Tags.
- Favorites.
- Grid view.
- List view.
- Detailed game view.
- Metadata editing.
- Artwork management.
- Manual game creation.
- Manual importing.
- Directory scanning.
- Statistics.
- Play session tracking.

The exact first-release feature set remains subject to prioritization and prototype validation.

## 8. Discovery and importing

Discovery must be initiated and controlled by the user.

The intended workflow is:

1. The user selects a supported source or directory.
2. Kiwanto explains the scope of the operation.
3. The backend validates the request.
4. The discovery system identifies possible games.
5. Results are presented as candidates with available source and location information.
6. The user reviews and confirms which games to import.
7. Confirmed entries are validated and stored.

Requirements:

- No full-disk scanning by default.
- No automatic execution of discovered files.
- No silent bulk imports without user confirmation.
- No automatic deletion of library entries when files disappear.
- Interrupted operations must not leave inconsistent or partially imported records.
- Errors and unavailable sources must be communicated clearly.

## 9. Game launching and session tracking

Kiwanto should support configurable launch profiles.

A launch profile may contain:

- Executable path.
- Argument list.
- Working directory.
- Environment variables.
- Selected runner or compatibility tool.
- Wine or Proton prefix, where applicable.

Executable paths and arguments must remain separate structured values.

The application must use safe process APIs and must never construct shell commands by concatenating untrusted strings.

The system must distinguish between:

1. A launch request or attempt.
2. Successful or failed process creation.
3. Detection that a game is running.
4. A confirmed or inferred play session.

An attempted launch must not automatically count as a successful play session.

Process detection may be uncertain when launchers, wrappers, child processes, or detached processes are involved. Such uncertainty must be represented honestly.

## 10. Interface customization

Extensive customization is one of Kiwanto's central goals.

The user should eventually be able to configure:

### Appearance

- Themes.
- Color palettes.
- Fonts.
- Font sizes.
- Text styling.
- Backgrounds.
- Artwork presentation.

### Layout and structure

- Grid and list layouts.
- Panels and sections.
- Element visibility.
- Element ordering.
- Spacing.
- Element dimensions.
- Borders.
- Library organization.

### Behavior and effects

- Animations.
- Interface sounds.
- Loading screens.
- Startup presentation.
- Other appearance and interaction preferences.

Customization must not make essential controls inaccessible or compromise application usability.

The initial customization system should prioritize declarative themes and validated configuration instead of arbitrary executable extensions.

## 11. Non-functional requirements

### Compatibility

Linux is the initial development and validation target.

The initial target includes:

- Pop!_OS.
- Ubuntu.
- Ubuntu-based Linux distributions.

Possible future compatibility includes:

- Debian.
- Fedora.
- Arch Linux.
- Linux Mint.
- Other distributions with compatible dependencies.

These targets are goals, not verified compatibility claims.

### Performance

The application should remain reasonably lightweight and responsive while managing large libraries.

Database queries, artwork handling, scanning, and interface rendering should be designed with performance in mind.

Actual performance targets require prototype measurements.

### Reliability

The application should handle:

- Missing installations.
- Unavailable integrations.
- Malformed external metadata.
- Invalid launch configurations.
- Process failures.
- Interrupted scans.
- Database errors.

Failures should not silently destroy unrelated user data.

### Accessibility and usability

The interface should provide understandable feedback, discoverable controls, and customization that does not compromise essential interactions.

## 12. Security and privacy requirements

Kiwanto must:

- Avoid automatic execution during scanning and importing.
- Avoid storing game-store credentials in the initial version.
- Never construct shell commands through unsafe string concatenation.
- Avoid requiring root privileges for ordinary functionality.
- Validate filesystem paths and external input.
- Request confirmation for destructive operations.
- Keep important operation and error information available without exposing sensitive data.
- Treat external metadata, artwork, and configuration as untrusted input.
- Minimize filesystem and integration permissions.
- Avoid logging credentials or other sensitive information.

Future plugin mechanisms must be treated as potentially unsafe components and require an appropriate security model.

These requirements are design goals, not evidence that the application has already been audited or proven secure.

See [SECURITY.md](SECURITY.md).

## 13. Scope boundaries

### Initial version direction

The first useful version should prioritize:

- A working Linux desktop application.
- A local SQLite database.
- A basic game library.
- Manually created game entries.
- Basic metadata and organization.
- User-controlled discovery.
- Safe, explicitly configured game launching after its process model has been validated.

The precise minimum feature set remains an open project decision.

### Longer-term goals

Future development may introduce:

- More store and launcher integrations.
- Emulator and ROM management.
- Rich metadata and artwork.
- Playtime and session history.
- Extensive interface customization.
- Additional extension mechanisms.
- More Linux distributions and potentially other operating systems.

Each integration and feature must be evaluated independently.

### Explicitly outside the initial scope

The initial version should not require:

- A built-in video game store.
- Its own mandatory account system.
- Mandatory cloud synchronization.
- Mandatory web services.
- Mandatory telemetry.
- Automatic full-disk scanning.
- Automatic execution of discovered files.
- Automatic deletion of entries when installations disappear.
- Arbitrary executable plugins without an appropriate isolation and security model.
- Automatic modification of external game clients.

## 14. Proposed technology stack

The current technical direction is:

| Component | Technology |
|---|---|
| Backend | Rust |
| Desktop framework | Tauri 2 |
| Frontend | React + TypeScript |
| Frontend tooling | Vite |
| Database | SQLite |
| Styling | Custom CSS with design tokens |

These choices must be validated through practical prototypes.

Important areas include Linux packaging, desktop integration, process launching, IPC security, accessibility, performance, database migrations, and backup/restoration.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [TECH_STACK_DECISION.md](TECH_STACK_DECISION.md).

## 15. Development approach and project ownership

Kiwanto is initiated and directed by an independent creator without formal programming education.

AI coding assistants support research, documentation, architecture, implementation, and testing.

The creator remains responsible for:

- Product vision.
- Requirements and priorities.
- Project decisions.
- Testing and feedback.
- Evaluating functionality.
- Directing development.

AI-generated code and suggestions must be reviewed and tested. They must never be assumed correct simply because they were generated by an AI assistant.

Experienced contributors and community members are welcome.

See [CONTRIBUTING.md](../CONTRIBUTING.md).

## 16. Open questions

The following decisions remain open and should be resolved through research, prototypes, and project-owner review:

- Which exact features define the minimum useful first release?
- Which game sources should receive integration priority?
- Which Linux distributions and desktop environments should be used for initial validation?
- How should the game, installation, and launch profile data model evolve?
- Which process tracking mechanisms are reliable for different launchers and compatibility tools?
- Which metadata and artwork sources are acceptable without undermining local-first privacy?
- Which SQLite journal and backup/restore approach provides the required data integrity?
- What is the safest and most maintainable theme format?
- How should future plugin capabilities be isolated?
- Which packaging formats should be supported initially?
- Which license should the project owner select?

---

*This specification defines the intended direction of Kiwanto. Requirements may evolve as prototypes, implementation, testing, and practical experience provide new evidence.*