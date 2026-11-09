# Kiwanto roadmap

This roadmap describes an intended sequence, not a delivery promise. Kiwanto is currently at the planning and documentation stage; no application functionality is claimed as complete. Phases may be reordered or revised as prototypes and contributor feedback validate the assumptions.

## Phase 0: Project foundations and documentation — current focus

Establish a clear product vision, scope, architectural direction, contribution process, security reporting guidance, and transparent project status. Record unresolved decisions rather than presenting proposals as commitments.

**Exit direction:** Documentation is coherent and the owner has a short list of technical questions to validate before application implementation begins.

## Phase 1: Minimal desktop prototype

Prototype the proposed Rust, Tauri 2, React, TypeScript, and Vite stack on Linux. Explore the application shell, basic navigation, accessibility, packaging/development workflow, frontend-to-backend command boundary, and safe settings storage. Keep the prototype deliberately small and do not present mock data as real integrations.

**Validate:** framework suitability, Linux development and packaging workflow, command permissions, error reporting, and the minimum UI foundation.

## Phase 2: Core library and database

Define and implement the core game and installation concepts separately. Add a local SQLite database with migrations and transactional operations, basic library views, manually managed entries, search/organization foundations, and a documented backup/restore approach.

**Validate:** data model evolution, consistency, recovery behavior, and what happens to an entry when an installation is missing. Do not automatically delete entries.

## Phase 3: Launch profiles and process tracking

Add user-configured launch profiles with executable path, argument list, working directory, environment variables, and applicable runner/prefix settings. Use safe process APIs, not shell-command construction. Represent launch requests, process start outcomes, running-process detection, and confirmed play sessions as distinct states.

**Validate:** process lifecycle behavior, error reporting, permissions, and reliable limits of playtime/session detection.

## Phase 4: Integrations

Introduce integrations incrementally, based on user need and feasibility. Evaluate each source independently—potentially including Steam, Heroic, Lutris, Bottles, Wine/Proton, itch.io, native installations, and emulators—before selecting an approach.

**Validate:** documented access, source-specific formats and failure modes, version compatibility, user consent, and safe behavior when source data changes. Discovery should be scoped by the user; discoveries are candidates for confirmation and are never executed automatically.

## Phase 5: Customization and themes

Grow customization through declarative themes and safe settings: library layouts, configurable sections, color palettes, typography, spacing, dimensions, artwork presentation, and animation/sound preferences. Keep user configuration understandable and recoverable.

**Validate:** accessibility, configuration migration, performance, and safeguards for imported theme assets/settings. Do not introduce arbitrary executable plugins as the first extensibility mechanism.

## Phase 6: Additional extensibility and future platforms

Consider more integrations, carefully bounded extension points, and possible support for other operating systems only after the Linux-first product is useful and its core boundaries are stable. Any plugin model requires a separate threat model and explicit permissions design.

**Validate:** maintenance cost, compatibility obligations, security boundaries, and whether future platform support can be added without compromising Linux priorities.

## Ongoing work

Privacy, security, accessibility, testing, documentation, and data integrity are ongoing responsibilities across all phases. This roadmap is not a feature-completion checklist; no phase should be called complete without implementation evidence and appropriate validation.
