# Kiwanto Architecture

**Proposed system architecture and technical boundaries**

## 1. Status and overview

This document records the target architecture and includes a source-audited implementation snapshot in section 5.2.1. Requirements elsewhere remain design guidance unless explicitly marked implemented; the latest concise status is [PROJECT_STATUS.md](PROJECT_STATUS.md).

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

### 5.2 Desktop mode composition

The desktop mode should compose three separate frontend regions:

1. A narrow global navigation sidebar with icons.
2. An independently hideable library and search column.
3. A main area that presents the selected game.

The global navigation and library column must have separate state and layout boundaries. Hiding the library must not hide global navigation. The navigation should accommodate the planned destinations—desktop mode, library, favorites, collections, statistics, future complements, and settings—and remain extensible without redesigning the overall shell.

The library column may group entries by platform, show or hide those groups, present collapsible groups, or show all games without platform grouping. Future custom grouping should not require treating genres as mandatory permanent categories; genres may instead act as search or filtering criteria. Grouping preferences belong to the library presentation, not to game identity or metadata.

Grouping preferences should be accessible from Settings and from a quick-configuration floating menu. The quick menu must update the same persisted preferences rather than maintaining a separate configuration source.

Search may support composable `@`-prefixed criteria, such as genre, platform, favorites, and installation status. The examples are not a closed list. Parsing the query and applying criteria should remain separate from rendering the library so the supported criteria can grow without coupling search behavior to a particular layout. Exact syntax and ambiguous-query behavior remain to be validated.

The library column should provide compact list and cover modes. List rows place an icon or logo to the left of the game name. Cover mode arranges artwork in rows and adapts cover size to the available column width. The main area is a selected-game presentation, not a general grid of games.

The main area should present the selected game's available artwork as a full-area background, a larger cover or box art toward the left, a normally sized user-activated launch control toward the right, and description and available metadata in the lower area. The launch control's color may be theme-configurable; its presence must not bypass the explicit launch flow described in section 10.

### 5.2.1 Current prototype status

The repository contains a functional but incomplete React/Tauri application. The frontend loads a persistent library through typed services and Tauri commands; Rust owns SQLite and the entry create, list, edit, favorite, archive, restore, and permanent-delete operations. The six records in `src/data/games.ts` remain fixtures and are not loaded into a user's database. Manual collections are implemented through shared Rust/SQLite operations and a Desktop Mode view: name, optional description, membership, listing/detail, editing, and deletion are persistent. Big Picture is implemented as a second presentation over the same library services, with library, favorites, collections, game detail, keyboard navigation, and persisted basic preferences; it is not full feature parity with Desktop Mode. Local launch profiles and explicit process launch are implemented, while installation management, process/session tracking, external integrations, statistics, extensions, advanced filtering, and backup/restore remain incomplete or absent. Smart collections, franchise entities, collection artwork/backgrounds, custom member order and editorial collection content remain future capabilities. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the audited status and limits.

The prototype's library rules are separated into `src/library/models.ts`, `search.ts`, `selectors.ts`, and `operations.ts`. The current query module filters the provided games using title text and the existing `@` criteria; the selector keeps the selected game when it remains visible, otherwise chooses the first visible result or returns no selection; and the operation module immutably toggles a favorite. `App.tsx` coordinates these functions with React state and passes results and actions to the visual components. This layer has no dependency on a desktop-specific component and is reusable by another presentation, but it is a small frontend domain layer rather than a persistent repository or a complete application-service system.

The frontend retains a stable string ID and a presentation DTO so the existing search, selection, and components can be reused. Favorite state comes from SQLite. The view's `installed` value is derived from an available installation record; it is not stored on an edition, and installation management is not yet exposed. Platform of origin and target operating systems are persisted separately.

Collection operations use the same Tauri/SQLite boundary as the library. Existing schema tables persist collection names, descriptions and edition associations; the compound primary key prevents duplicate membership, and foreign-key cascade on collection deletion removes association rows while preserving editions. The present implementation has no collection-specific artwork or ordering fields. Future presentation templates must not own or alter game identity or collection membership.

Tauri commands initialize the library database and expose narrow typed operations, alongside versioned user preferences. The database is stored below the Linux XDG data directory in `kiwanto/library.sqlite3`; preferences use `~/.config/kiwanto/preferences.json`, with the previous Tauri configuration path migrated on read or save. Desktop and Big Picture are both mounted from `App.tsx`; they share persisted library, collection, favorite, relation and launch-profile services. Big Picture navigation currently covers library, favorites and collections and uses keyboard-oriented navigation helpers; a complete gamepad integration and all cross-mode context-preservation requirements are not verified as complete. Quick library settings remain local to the library component; there is no general overlay/focus manager. The two built-in themes use the existing compositions; the declared interface-profile type is not persisted or applied. These observations describe source structure and automated checks, not runtime verification on target systems.

The game editor loads canonical genre and subgenre options from SQLite, searches them without case or accent sensitivity, and saves selected stable IDs. The dropdown is rendered within the modal dialog but outside its scrolling form, and positioned against the viewport so it is not clipped by the form or window. Terms from the former free-text editor are retained as pending associations and are not selectable as canonical terms. Preferences migration reports divergent current and legacy files without replacing or deleting either.

The current selection policy is tied to the visible filtered result set. A filter change keeps a still-visible game, replaces a hidden selection with the first result, and produces an empty detail state when there are no results. Both modes now exist; their complete cross-mode selection and filter restoration behavior remains to be verified against the shared-context contract.

### 5.2.2 Big Picture / TV mode composition

Big Picture / TV mode is a separate frontend composition over the same application capabilities, not a larger rendering of the desktop grid. It should be designed for television viewing distance, large readable text and targets, visible selection/focus, remote-friendly navigation, and keyboard and pointer use. Its layouts must adapt to tested window resolutions and aspect ratios; exact breakpoints, minimum readable sizes, and supported dimensions require prototype validation.

The mode may present a clear home/section navigation, library shelves or card grids, and a television-specific game detail/action screen. It must also cover collections, favorites, statistics, settings, contextual and quick-action menus, confirmations, notifications, and empty/loading/error states. These views consume shared domain/application operations and must not introduce mode-specific copies of games, metadata, launch profiles, or business rules. A failed or not-yet-implemented destination must be represented honestly rather than appearing as a completed feature.

### 5.2.3 Shared application state and mode-local presentation state

The mode boundary belongs to presentation and interaction. Both compositions call the same application services and read/write the same canonical game, installation, metadata, artwork, collection, favorite, statistics, launch-profile, history, and preference data. Mode changes must not create another library, database, cache of authoritative records, or set of business rules.

Keep cross-mode context distinct from view mechanics:

- **Shared context:** selected game identity, query and active filters, active collection/section where meaningful, and any in-progress application operation/status.
- **Mode-local presentation state:** scroll position, expanded shelves/groups, selected navigation control, focused element, open non-modal menu, and layout-specific view preferences.
- **Persistent user preferences:** mode-specific layout, theme variant, composition, and accessibility/input settings when those are implemented; transient focus and open overlays are not profile data.

On a mode change, preserve the selected game ID and shared query/filter/collection context. If the selected game is not visible under the current filter, retain its identity but do not claim that a hidden card has focus; focus a valid search/filter or section control until the game is visible again. Restore a saved mode-local viewport/focus anchor only if its destination still exists and is usable. If an anchor is invalid, use a predictable fallback in the current section (selected game when visible, otherwise the section heading or first enabled control). Focus movement alone must never change game selection. A filtered-out or deleted item must not leave keyboard/controller focus on a detached element.

The current React application coordinates shared game identity and mode switching in `App.tsx`, and mounts either Desktop Mode or Big Picture. Each composition also owns presentation state such as its active section, detail view and focus. The complete cross-mode restoration contract is not yet verified; see [PROJECT_STATUS.md](PROJECT_STATUS.md). This section defines the target ownership contract and does not prescribe a state-management library or require moving the application into a new framework.

### 5.2.4 Shared navigation and input contract

Global navigation is a shared set of semantic destinations, not a shared fixed layout. Desktop may show a compact icon rail with accessible names; Big Picture may show an expanded horizontal or lateral bar with large controls and visible labels. Both must expose the same principal destinations, mode switch, and settings. The library remains a separate region/view, and selected-game presentation remains distinct from both global navigation and library browsing.

Introduce one interaction boundary that translates keyboard, pointer, and controller input to semantic actions such as `move focus`, `select`, `confirm`, `back/cancel`, `open/close menu`, `change section`, and `scroll`. Components expose navigable controls and stable logical relationships; a mode-specific focus/navigation policy chooses the next valid target. Do not scatter device-specific button handling or business actions through individual game cards. Keyboard and mouse continue to be supported in Big Picture, and no essential action may depend only on hover.

For browser-side controller input, the standards-based candidate is the Web Gamepad API: connection/disconnection events plus `navigator.getGamepads()` for button/axis state. This is a candidate integration surface, not a compatibility guarantee. Tauri 2 uses WebKit (`webkit2gtk`) on Linux; available WebKitGTK versions are supplied by the target system. Therefore support, standard/non-standard mapping, button/axis interpretation, focus behavior, permissions/device visibility, and disconnect handling must be tested on supported Linux distributions and physical controllers before choosing the implementation. Poll only while needed and while the application is active; use tested dead zones and repeat behavior so held axes neither skip unpredictably nor block navigation. Do not add a dependency or native input bridge until this validation demonstrates a need.

The interaction layer must always have a recovery path: when a target becomes disabled, filtered out, removed, or unmounted, move focus to a valid logical neighbor or containing section and announce the change where appropriate. Provide a visible focus treatment and consistent directional behavior across cards, lists, settings, and menus. A modal may intentionally contain focus; ordinary navigation must not become trapped behind an open menu.

### 5.2.5 Menus, dialogs, and focus lifecycle

Use a shared overlay policy with mode-specific visual sizing and placement for game context menus, quick actions, filtering/sorting, launch options, settings, confirmations, information, and errors. Reuse application actions and validation; only their presentation varies by mode.

Opening an overlay records its invoking control and gives focus to a meaningful first item (or the dialog heading/action group). Directional keys/controller navigation and Tab navigation must stay within the overlay only when it is a genuinely modal dialog. A non-modal menu must have a clear close/back action and must not make global navigation or its owning screen inaccessible. `Escape` on keyboard and the controller's cancel/back action close the topmost dismissible layer; they must not confirm a destructive action. Closing returns focus to the invoker when it still exists; otherwise restore to the nearest valid logical parent or section fallback.

Menus and dialogs must provide accessible names, visible focus/selection, disabled-state feedback, and explicit empty/loading/error states where relevant. Hover is supplementary only. Notifications must not steal focus unexpectedly. Closing an overlay or changing modes must not lose the shared game selection or an operation's result.

### 5.2.6 Mode switching

Provide a reversible mode-switch action from the global navigation or an equally discoverable control in both modes. `Ctrl+Shift+B` is the proposed default shortcut, not an implemented or final binding. Review conflicts with desktop environments, WebKit/browser handling, text editing, and other application shortcuts before adopting it; do not trigger it while a text input, editable control, or input-method composition owns the keystroke. A later Settings control should allow remapping and restoring the default.

The shortcut must never be the only way to switch. A request while a modal dialog is open must not close, bypass, or implicitly confirm it; keep the current mode and require the user to finish or dismiss the dialog before switching. A non-modal menu may close as part of a confirmed switch. Mode-independent background work continues, and its status remains available in either mode. A flow that needs a current-view confirmation must finish that confirmation before switching. Switching does not cancel a launch request or any other operation and must not duplicate or resubmit it.

When remapping is implemented, Settings must detect conflicts with other Kiwanto shortcuts and reject or resolve duplicate bindings with a clear message. Operating-system/global shortcut conflicts may not be discoverable by the application; document and test known conflicts on supported Linux desktop environments rather than claiming exclusive reservation. The default binding must be tested against WebKit handling and application shortcuts before adoption.

### 5.3 Interface state, layout, and appearance

The visual system should remain a focused part of the existing frontend and modular monolith, not a separate service or a new architectural platform. It should keep distinct:

- **Application and library data:** games, metadata, and other domain records.
- **Interface state:** temporary state such as the active view, selection, and open dialogs.
- **Layout preferences:** panel visibility, ordering, sizes, and the layouts or interface profiles saved by the user.
- **Theme:** declarative visual tokens, component styles, and supported composition templates.
- **Presentation preferences:** effects, typography, backgrounds, and other user choices.

Keeping these concerns separate prevents a theme change from altering library data and prevents a temporary navigation state from being saved as a permanent preference.

The frontend should compose reusable panels within view-specific layouts. Sidebars and content regions may be resizable and hideable where the view supports them. Drag handles should enforce defined minimum and maximum sizes; layouts must remain usable at supported window sizes. View constraints should be explicit rather than assuming every panel can be moved to every position.

For the desktop mode, resizing the library column must not merge it with the global navigation. Hiding and restoring the library is a presentation state, not removal or disabling of the library. It should retain the selected game, scroll position, active filters, and expanded-group state while hidden.

Global preferences and view-specific preferences must be stored separately. A global theme or reduced-effects preference may apply across views, while a library layout may define its own panel visibility and dimensions. A theme may declare a supported composition template that rearranges presentation regions, but it must not silently overwrite the user's saved view-specific panel and sizing preferences. A profile can bind a theme to an explicit layout and panel configuration. Saved layouts or interface profiles should reference supported panel and theme identifiers, not executable code. Preferences must be validated when read and when imported.

The current frontend contains typed theme definitions and design tokens for colors, typography, spacing, borders, shadows, opacity, gradients, effects, and panel dimensions. Its composition contract currently defines three regions—navigation, library, and presentation—with placement, order, visibility, size bounds, and a separator. Resource references and a distinct interface-profile contract are also represented. These types are foundations, not a validated or importable package format.

The renderer applies theme tokens to the existing three-zone desktop layout and reads the library size bounds and separator visibility. It does not interpret alternate placements or ordering, independently style information, description, or control regions, load custom resources, or expose a theme editor. The dark and light built-in themes share the same composition. The only persisted visual preference is the built-in theme identifier in a versioned JSON configuration file; layouts and profiles are not persisted.

The current desktop interface is Kiwanto's first functional visual reference and the starting point for the future official default theme. The theme engine should grow around its functional behavior rather than discard or replace it.

The three visual-content domains are separate: theme packages own interface backgrounds, textures, icons and fonts; game artwork remains independent local game media with provenance/attribution; and future rich game-description blocks (ordered editable text and safe media) belong to the game record. None is an implicit dependency or export payload of another domain.

The first persisted visual preference is the selected built-in theme. The Tauri application stores it in a versioned JSON file in the application configuration directory through narrow Rust commands; unsupported values and schema versions are rejected. This small configuration file is appropriate for the current preference scope and does not replace SQLite for library records or other relational application data. Browser-only development previews use browser storage and do not call the native filesystem API. Migration behavior beyond the current schema version remains future work.

Future visual responsibilities remain separate within the existing frontend/modular monolith: tokenized visual identity; registered components and validated variants with preserved interaction states; declarative mode-specific composition using known regions and slots; a resource service that validates, loads, caches and releases local resources; and theme/profile coordination. This does not prescribe a new framework, package runtime, or service boundary. A theme provides identity and per-mode defaults; a profile persists an explicit theme reference plus compatible composition/presentation adjustments; the active mode sets its own interaction and layout contract; user preferences override defaults by scope. Global preferences apply first and preferences for the active mode override them only in that mode. Final resolution must satisfy mode, accessibility and security constraints. The current prototype persists only a built-in theme ID and does not implement this resolution pipeline.

Themes and interface profiles are distinct data:

- A theme defines visual appearance.
- An interface profile combines a theme with compatible layout, visible panels, and presentation preferences.

Import/export packaging and format versioning must be designed with validation and migration in mind. This section describes intended boundaries, not an implemented persistence or package format.

### 5.4 Dynamic artwork and visual effects

The existing metadata and artwork responsibilities remain the source of game imagery. The presentation layer may use an available game panorama or illustration as a dynamic background, but should not fetch remote assets merely to render a view. Network access, if introduced for any separate artwork feature, remains explicit and independently controlled.

Color extraction should be isolated from layout and component code. Results may be cached locally and associated with the relevant image identity and extraction settings so that image or setting changes can invalidate stale results. The extraction method, cache location, size limits, and cleanup policy require validation before implementation.

The selected game's available fan art, illustrations, screenshots, or other artwork may be used for the main area's background. Background gradients, localized darkening, blur, transparency, derived colors, and transitions between interface regions should be controlled by separate presentation preferences. Reduced-motion and low-effects options should provide a usable experience on modest hardware and for accessibility needs. Expensive effects must be measurable and may be disabled independently. The architecture should not require a separate rendering engine or new framework for these effects without evidence that existing CSS and frontend capabilities are insufficient.

### 5.5 Functional structure and visual presentation

The functional structure owns navigation, library behavior, search and filters, game selection, actions, settings, and future application capabilities. The presentation system owns visual composition, component positions and dimensions, artwork and other visual resources, colors, effects, and typography.

Themes may rearrange the presentation through declarative composition contracts, but must not remove functional responsibilities, alter library data, or sever the actions from their controls. The renderer must not assume that CSS alone can express every future layout. Composition contracts should identify supported regions, components, placements, ordering constraints, and properties; the rendering approach should be validated against React, Tauri, WebKitGTK, and Linux before adding a new layout system or dependency.

The visual engine should support independent presentation settings for at least:

- Global navigation.
- Library and search.
- Selected-game presentation.
- Game information and description.
- Controls and buttons.
- Future sections and panels.

Independent region styling should include only validated properties and must preserve functional relationships, accessible names, keyboard behavior, focus visibility, and readable contrast. For example, a library may be transparent over the general background or have its own image and effects; a separator may be hidden; navigation may use alternate icons, logos, backgrounds, or textures; and the selected-game presentation may rearrange cover, title, action, description, and metadata. These are future capabilities, not current renderer behavior.

### 5.6 Visual performance requirements

Performance is an architectural constraint for visual composition and effects. No expensive effect may be mandatory. Blur, complex transparency, animation, and transitions should be independently disableable, and persistent animation should be avoided unless it serves a clear purpose. Text and controls must remain legible without visual effects.

Artwork and theme assets should have validated resolution, format, and size limits. Resource caching must define bounds, invalidation, and lifecycle so that cached assets do not grow without control or retain stale derived results. Theme and UI updates should avoid unnecessary recalculation and rendering. Costs in GPU, memory, and interface responsiveness should be measured on Linux, including systems with integrated graphics and modest resources. Provide low-graphics-cost alternatives.

Do not select a rendering framework or effect technology solely for theoretical flexibility. Validate compatibility with the current Tauri/WebView stack and representative Linux hardware before adding dependencies or architecture. Performance requirements and accessible fallbacks apply to each visual feature, not only to a global low-effects mode.

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

In the current frontend, reusable library rules and the typed IPC service live in `src/library/`:

- `models.ts` defines the current game metadata, presentation, library-state, and state-map TypeScript types.
- `search.ts` implements title search, the current `@` criteria, and filtering of a supplied game list.
- `selectors.ts` resolves a selected game against visible results, choosing the first result when necessary and returning `null` for an empty result set.
- `operations.ts` provides the immutable favorite-toggle operation and reports an unknown game ID as an error.
- `service.ts` calls narrowly scoped Tauri commands and defines the library command DTOs.

Search and selection remain independent of React rendering and of Desktop Mode. `App.tsx` coordinates the loaded records and sends user actions through the service; `LibraryPanel` and `GameDetail` render supplied values. A future interface can reuse these same rules and commands without copying business logic. Manual collection management is implemented through shared Rust/SQLite operations and a Desktop Mode view; smart collections, franchise entities, tag management, metadata-provider workflows, installation operations, and launching remain unimplemented.

### 7.2 Database

Rust manages SQLite through `rusqlite`. The initial versioned migration creates the edition-centered relational model, enables and verifies foreign keys, uses WAL with full synchronous writes, and runs migrations and multi-table changes transactionally. A failed initialization is returned through library commands so the frontend can show an error instead of silently substituting demo data.

The database lives below `app.path().data_dir()/kiwanto/library.sqlite3`, which resolves the Linux XDG data base directory without adding the bundle identifier as a second application folder. Runtime operations currently cover manual edition CRUD, favorites, archiving/restoration, and guarded permanent deletion. Tables for releases, installations, execution environments, launch profiles, taxonomy, metadata provenance, external identifiers, and artwork references are prepared but are not yet managed by the UI. Manual collection operations are implemented; smart collections and franchise management remain unimplemented. Backup and restore remain unimplemented.

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

Manages application preferences, interface settings, and other persistent user configuration. Global settings must be distinguishable from view-specific layout and presentation preferences.

Settings should be validated and versionable where appropriate. In the current prototype, Rust owns read/write access to `~/.config/kiwanto/preferences.json`, accepts only the supported built-in theme identifiers, writes through a temporary file followed by a rename, and reports malformed or unsupported preferences instead of silently resetting them. A one-time migration preserves preferences from the previous Tauri application-config location. The frontend exposes a reset action that explicitly saves the default preference.

The visual system should store themes, layouts, and interface profiles as separate concepts. Theme and profile import/export must not mix presentation configuration with library records. Exact persistence tables or file formats remain subject to design and should not be added before the feature needs them.

### 7.9 Security

Provides shared validation and security-related rules for filesystem operations, process launching, external input, and application permissions.

### 7.10 Plugins

Represents a future extension mechanism.

The initial implementation should prioritize declarative themes and validated configuration rather than arbitrary executable plugin code.

Themes are visual configuration and are not plugins. At a later stage, plugins may contribute panels, views, or visual elements through stable, explicitly designed interface extension points. This must not introduce executable plugin support or a plugin marketplace into the initial implementation. The extension API, supported UI slots, permissions, lifecycle, compatibility, and isolation require separate design and review.

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

When visual preferences are added, persistence and backup planning should include user-created themes, layouts, and interface profiles. Artwork-derived color caches are reproducible data and should be treated separately from user-authored preferences; whether they are included in backups should be decided based on their size, reproducibility, and invalidation behavior. Imported theme resources must follow the same validated asset handling and data-preservation principles as other local assets.

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
- Separation and persistence of global visual preferences, view-specific layouts, themes, and interface profiles.
- Panel layout constraints and which views support rearrangement or resizing.
- Mode-specific compositions and cross-mode state restoration, including selected-game, search/filter, collection, scroll, and focus recovery.
- How the current visible-result selection rule should interact with preserving a selected-game identity across modes when mode-specific views or filters differ.
- Big Picture / TV resolution, aspect-ratio, distance-legibility, and responsive-layout validation targets.
- The gamepad input path for Tauri 2 on Linux: supported WebKitGTK versions, browser Gamepad API behavior, controller mappings, device visibility/permissions, dead zones, repeat/latency, and fallback requirements.
- Shortcut conflicts and remapping behavior for the proposed `Ctrl+Shift+B` mode switch.
- Overlay modality, controller back behavior, focus restoration, and navigation recovery criteria.
- Declarative theme and profile package format, versioning, migration, resource inclusion, and validation rules.
- Dominant-color extraction method, cache identity, invalidation, size limits, and cleanup policy.
- Accessibility and performance criteria for dynamic backgrounds and visual effects.
- Stable interface extension points for a future plugin system.
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
