# Kiwanto Taxonomy and Filters

**Conceptual requirements with a limited canonical-catalog implementation — not an advanced filter implementation or SQLite schema**

## 1. Goals and principles

This document defines the approved conceptual rules for canonical genres and subgenres, personal tags, external taxonomy values, search, and filtering. It complements [LIBRARY_DATA_MODEL.md](LIBRARY_DATA_MODEL.md), which describes the wider library model.

The design should:

- Give canonical terms stable identities independent of language and display labels.
- Preserve provider values and provenance while normalizing reliable equivalences.
- Keep personal organization separate from shared canonical taxonomy.
- Produce predictable filters that are consistent across Desktop Mode and Big Picture.
- Return each library edition at most once, regardless of how many terms, releases, or associations match.
- Avoid claiming that provider mappings or advanced filters are implemented.

The rules identified as **approved conceptual requirements** guide design and behavior. A small initial canonical catalog and its selector are now implemented as described in section 11; this does not settle the complete catalog, query syntax, advanced filter UI, or physical data model.

## 2. Genres, subgenres, and personal tags

### 2.1 Canonical genres and subgenres

Genres and subgenres are canonical classification terms. An edition may have multiple genres and multiple subgenres. A subgenre may relate to more than one genre where those relationships are meaningful.

Terms are concepts, not free-form provider labels. For example, a canonical *Survival Horror* subgenre may relate to both *Horror* and *Survival*. This illustrates multiple relationships; it does not establish a definitive list or require every provider to use the same terminology.

### 2.2 Personal tags

Personal tags are free-form and user-customizable annotations, separate from canonical genres and subgenres. Examples include:

- “childhood”
- “play someday”
- “difficult”
- “play with friends”

Tags can be used in search and filters. They do not become shared genres, subgenres, or official categories automatically. A personal tag must remain distinguishable from an externally supplied or canonically normalized term.

## 3. Canonical hierarchy and term identity

### 3.1 DAG, multiple parents, and cycles

**Approved:** the canonical hierarchy is a directed acyclic graph (DAG), not a tree-only structure. A term may have multiple parents, including a subgenre related to multiple genres. Cycles are not allowed.

For instance, a *Survival Horror* term may be related to *Horror* and *Survival*. Filtering from either parent must be able to reach that subgenre. A term is still one canonical term even if several parent paths reach it.

### 3.2 Stable IDs and localized labels

Each canonical term has a stable internal identifier. Names in different languages, translations, spelling variants, and accepted alternate labels belong to that same term; they do not create duplicate canonical terms. A display label may vary by user language without changing identity or associations.

An initial, deliberately small genre and subgenre catalog is implemented under DEC-044. It is a starting controlled vocabulary, not a claim that the full catalog, governance, localization, or user-facing taxonomy editing policy is complete.

## 4. Provider terminology and normalization

For each received provider term, retain its original text and provenance, including the provider and external identifier or language when available. Normalization must not discard the source value.

The conceptual treatment is:

1. Automatically normalize an equivalence when it is clear and reliable.
2. Leave ambiguous equivalences pending review instead of choosing silently.
3. Keep unknown terms as unmapped source terms; do not create canonical terms automatically.
4. Allow the user to correct or remove a mapping or taxonomy association.
5. Preserve manual corrections so a later provider refresh does not silently replace them.

### Example: Action RPG

Suppose providers return labels such as “Action RPG” and “Action role-playing game”. If evidence supports that they denote the same concept in the relevant context, both source terms may map to one canonical term while retaining their separate original values and provenance. A broader value such as “Action” or “Role-playing” must not be assumed equivalent without review when its meaning is ambiguous.

Normalization may relate one external value to more than one canonical term where justified, but it must not turn every unfamiliar label into a new canonical category.

## 5. Scope of taxonomy associations

Taxonomy associations normally belong to an **edition**, the library item. When there is a real and justified difference, an association may instead be specific to a platform release or release variant. Identical edition-level associations do not need to be copied onto every release or variant.

Association at **work** scope is not an approved requirement. Whether a work can carry taxonomy and whether such values could be inherited by editions require a separate decision; sharing a work does not by itself imply that editions share all classification.

Associations may reflect accepted provider mappings or user corrections. Their provenance should remain available where relevant.

## 6. Search and filter model

Desktop Mode and Big Picture use the same functional query rules. They may expose different controls and layouts, but must not implement different taxonomy or facet semantics.

The conceptual search system can combine text with facets such as platform, target operating system, genre, subgenre, personal tag, favorite state, installation state, and collection. Textual search and selected facet values narrow the same result set. The exact query syntax, term-resolution behavior, and field weighting remain open.

Personal tags must be available to search and filtering. Whether free-text search matches tag labels directly or requires a tag-specific filter/control is a UI/query detail still to define.

## 7. OR/AND rules and examples

### 7.1 Approved combination rules

- **OR within one facet:** selecting multiple values in one facet matches any selected value.
- **AND across facets:** an edition must satisfy every active facet.
- **Personal tags:** multiple selected tags use OR by default. A future advanced mode may offer AND between selected tags; this is not part of the initial rule.
- **Text query:** narrows results in combination with active facets.
- **Unique editions:** an edition appears only once even if multiple associations, releases, or graph paths match.

### 7.2 Examples

| Selection | Expected conceptual result |
|---|---|
| Platform = PS2 OR Xbox | Editions with at least one selected platform release, once each. |
| Genre = Horror AND Platform = PS2 | Editions matching both the taxonomy and platform facets. |
| Tags = “difficult” OR “play with friends” | Editions with either selected personal tag. |
| Tags = “difficult” OR “play with friends”, AND Platform = PS2 | PS2 editions with at least one of the selected tags. |
| Genre = Adventure AND Platform = PC, plus text = “Island” | Editions satisfying all three constraints. |

An item matching several selected values in one facet is still one result. Selecting two tags does not imply that an edition must have both unless a future advanced AND-tag mode is explicitly selected.

## 8. Parent descendants and exact-term filtering

### 8.1 Include descendants by default

Selecting a parent genre includes its reachable descendants by default. In a DAG, this means all descendant terms reachable through one or more parent-child paths. A subgenre with multiple parents can therefore match a filter initiated from either parent.

### 8.2 Exact-term option

The user must be able to restrict a selection to the exact term, excluding descendant terms. This is a separate scope option from the default descendant-inclusive behavior.

### 8.3 Adventure example

- **Adventure, include descendants:** editions associated with Adventure itself or any reachable subgenre, such as a future point-and-click subgenre if it is modeled that way.
- **Adventure, exact term:** editions associated with the Adventure term itself. An edition associated only with a child subgenre does not match solely through that child.

The example does not settle whether a particular classification belongs as a genre, subgenre, style, or tag.

## 9. Duplicate prevention

Filtering resolves matches to unique editions. The same edition must not appear multiple times because:

- It has several matching subgenres.
- A subgenre is reachable from multiple selected or related parents.
- It has multiple releases or installations that satisfy a facet.
- Multiple provider mappings lead to matching canonical terms.

The rule concerns result identity, not loss of associations: all valid associations and provenance may remain available for details and editing.

## 10. Desktop Mode and Big Picture

Both modes query the same library identities and apply the same OR/AND, descendant, exact-term, and duplicate-prevention rules.

- **Desktop Mode** may expose compact search syntax, facet controls, or a more information-dense filter panel.
- **Big Picture / TV Mode** may use larger controls, simplified filter screens, or controller navigation.

These are presentation possibilities, not finalized UI designs. Selecting or clearing filters in either mode must not change their meaning in the other mode.

## 11. Current prototype and future behavior

The initial catalog currently seeded by schema version 2 is:

- **Genres:** Acción, Aventura, Rol, Estrategia, Simulación, Puzles, Plataformas, Disparos, Carreras, Deportes, Lucha, Terror, Supervivencia, Música y ritmo, Novela visual, Sigilo, Sandbox, Fiesta y multijugador, Cartas y tablero.
- **Subgenres:** RPG de acción (Acción, Rol); RPG táctico (Rol, Estrategia); Terror de supervivencia (Terror, Supervivencia); Metroidvania (Acción, Aventura, Plataformas); Aventura gráfica (Aventura); Roguelike (Acción, Rol); Construcción de ciudades (Estrategia, Simulación); Simulación de carreras (Carreras, Simulación); Battle royale (Disparos, Supervivencia).

SQLite schema version 2 separates canonical terms from pending source terms. The migration seeds a small controlled genre/subgenre vocabulary with stable IDs and DAG relationships. The editor now searches and selects only those canonical IDs; typing never creates a term. Terms created by the former free-text editor are retained as pending, their existing associations are kept, and their source is recorded as legacy manual input. Unknown source terms can be recorded as pending with provenance; no provider integration currently calls that operation. Personal tags remain in their separate tables and are not converted to genres.

The selector filters case- and accent-insensitively, supports multiple selections, and preserves selected IDs while searching. The frontend search in `src/library/search.ts` continues to normalize text for case and diacritics, search titles and the current genre/system/favorite/installation `@` aliases, and apply the same basic matching behavior to persisted entries as it did to fixtures. It does not traverse the taxonomy DAG or expose the advanced filter contract, provider-term mapping workflow, personal-tag facets, or an advanced filter panel.

Therefore, the current command matching must not be described as implementing OR within a facet, descendant inclusion, or the complete future rules in this document. The current selection behavior is separately described in [LIBRARY_SYSTEM.md](LIBRARY_SYSTEM.md).

## 12. Special cases, risks, and open decisions

- **Ambiguous provider terms:** a label may have different meanings by provider or context; retain it and request review rather than over-normalizing.
- **Multiple parents:** an edge change can affect filtering under more than one parent; edits require cycle checks and predictable result behavior.
- **Similar labels:** translation and synonym handling must not create duplicate canonical identities or merge distinct concepts.
- **Personal tags:** free-form values may overlap with official labels; their personal scope must remain explicit.
- **Changing mappings:** correcting a mapping can affect facets and collections; the effect should be explainable and must not erase the original provider value.
- **Association scope:** work-level taxonomy and any inheritance remain undecided.
- **Presentation:** how hierarchies, multiple parents, exact-term controls, and multiple associations appear in each mode remains to be designed.
- **Advanced tags:** AND between personal tags is a future option, not an initial behavior.
- **Query syntax:** exact text syntax, taxonomy-label search, tag-label search, and parsing of ambiguous queries remain open.
- **Catalog governance:** expanding and maintaining the initial vocabulary, localization, canonical-term review, and merge/deprecation policy remain open.

## 13. Further SQLite evolution considerations

The initial relational structures are documented in [DATABASE_AND_BACKUP.md](DATABASE_AND_BACKUP.md). Future migrations and query services should continue to satisfy these constraints:

- Store canonical term identity separately from localized labels and alternate names.
- Represent multiple parent-child relationships while preventing cycles.
- Preserve source terms, provider provenance, normalization outcomes, and review/correction state.
- Keep edition, release, and variant association scopes distinguishable; do not assume work inheritance.
- Preserve personal tags separately from canonical taxonomy.
- Ensure that query planning can expand descendants and resolve matches to unique editions.
- Evaluate indexes for stable term identifiers, hierarchy traversal, provider-term matching, and association lookups against realistic library sizes.
- Keep taxonomy updates and dependent query state consistent; validate future migrations or canonical-term merges without losing user corrections.

This conceptual document does not prescribe a physical SQL shape, indexes, or migration strategy beyond the approved requirements and the currently documented initial implementation.

## 14. Decisions before implementation

The following details remain open before implementing the catalog, provider mappings, and advanced filters:

1. Expansion and governance of the initial canonical catalog, including its review, merge, rename, and deprecation workflow.
2. Whether work-level associations are ever needed and, if so, how inheritance behaves.
3. Exact representation and editing experience for provenance, ambiguity review, and manual corrections.
4. User interface for parent/descendant scope and hierarchy navigation in each mode.
5. Text-query syntax and whether taxonomy labels and personal tags participate in general text search.
6. Whether and how to expose a future AND-between-tags mode.
7. Query performance and integrity strategies for DAG traversal and unique-edition results in SQLite.
