use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::time::Duration;

use rusqlite::{params, Connection, OptionalExtension, Transaction, TransactionBehavior};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

const LATEST_SCHEMA_VERSION: i64 = 3;
const MINIMUM_SQLITE_VERSION: i32 = 3_009_000;
const MAX_TITLE_LENGTH: usize = 300;
const MAX_DESCRIPTION_LENGTH: usize = 100_000;
const MAX_LIST_LENGTH: usize = 40;
const MAX_FIELD_LENGTH: usize = 500;
const MAX_LAUNCH_ARGUMENTS: usize = 128;
const MAX_LAUNCH_ARGUMENT_LENGTH: usize = 8_192;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryError {
    code: String,
    message: String,
}

impl LibraryError {
    fn new(code: &str, message: impl Into<String>) -> Self {
        Self {
            code: code.to_string(),
            message: message.into(),
        }
    }

    fn database(error: rusqlite::Error) -> Self {
        let code = match error.sqlite_error_code() {
            Some(rusqlite::ErrorCode::ConstraintViolation) => "integrity",
            _ => "database",
        };
        Self::new(code, format!("SQLite operation failed: {error}"))
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameInput {
    pub title: String,
    pub developer: String,
    pub publisher: String,
    pub year: Option<i32>,
    pub genre_ids: Vec<String>,
    pub rating: String,
    pub score: Option<f64>,
    pub platform: String,
    pub systems: Vec<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameMetadata {
    title: String,
    developer: String,
    publisher: String,
    year: Option<i32>,
    genre: Vec<String>,
    genre_ids: Vec<String>,
    pending_genres: Vec<String>,
    rating: String,
    score: Option<f64>,
    platform: String,
    systems: Vec<String>,
    description: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GamePresentation {
    cover: Option<String>,
    accent: String,
    initials: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    id: String,
    metadata: GameMetadata,
    presentation: GamePresentation,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameLibraryState {
    installed: bool,
    favorite: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryEntry {
    game: Game,
    state: GameLibraryState,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionInput {
    name: String,
    description: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSummary {
    id: String,
    name: String,
    description: String,
    game_count: usize,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchProfileInput {
    executable_path: String,
    working_directory: Option<String>,
    arguments: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchProfile {
    executable_path: String,
    working_directory: Option<String>,
    arguments: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchResult {
    process_id: u32,
}

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum GameRelationType {
    Prequel,
    Sequel,
    SpinOff,
    Remake,
    Remaster,
    Other,
}

impl GameRelationType {
    fn as_str(self) -> &'static str {
        match self {
            Self::Prequel => "prequel",
            Self::Sequel => "sequel",
            Self::SpinOff => "spin_off",
            Self::Remake => "remake",
            Self::Remaster => "remaster",
            Self::Other => "other",
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameRelationInput {
    related_game_id: String,
    relation_type: GameRelationType,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameRelation {
    id: String,
    related_game: Game,
    relation_type: GameRelationType,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenreOption {
    id: String,
    display_name: String,
    kind: String,
    parent_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingTaxonomyInput {
    raw_value: String,
    source_kind: String,
    source_name: String,
    source_record_id: Option<String>,
    edition_id: Option<String>,
}

enum DatabaseState {
    Ready(Connection),
    Failed(String),
}

pub struct LibraryDatabase {
    connection: Mutex<DatabaseState>,
}

impl LibraryDatabase {
    pub fn open(path: &Path) -> Self {
        let state = match open_connection(path) {
            Ok(connection) => DatabaseState::Ready(connection),
            Err(error) => DatabaseState::Failed(error.message),
        };
        Self {
            connection: Mutex::new(state),
        }
    }

    pub fn failed(message: impl Into<String>) -> Self {
        Self {
            connection: Mutex::new(DatabaseState::Failed(message.into())),
        }
    }

    fn with_connection<T>(
        &self,
        operation: impl FnOnce(&mut Connection) -> Result<T, LibraryError>,
    ) -> Result<T, LibraryError> {
        let mut state = self
            .connection
            .lock()
            .map_err(|_| LibraryError::new("database", "The library database is unavailable."))?;
        match &mut *state {
            DatabaseState::Ready(connection) => operation(connection),
            DatabaseState::Failed(message) => Err(LibraryError::new("database", message.clone())),
        }
    }

    pub fn list(&self, archived_only: bool) -> Result<Vec<LibraryEntry>, LibraryError> {
        self.with_connection(|connection| list_entries(connection, archived_only))
    }

    pub fn list_canonical_genres(&self) -> Result<Vec<GenreOption>, LibraryError> {
        self.with_connection(|connection| query_canonical_genres(connection))
    }

    pub fn record_pending_taxonomy_term(
        &self,
        input: PendingTaxonomyInput,
    ) -> Result<String, LibraryError> {
        self.with_connection(|connection| {
            let transaction = connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(LibraryError::database)?;
            let edition_id = input.edition_id.as_deref().map(parse_id).transpose()?;
            let term_id = store_pending_taxonomy_term(
                &transaction,
                &input.raw_value,
                &input.source_kind,
                &input.source_name,
                input.source_record_id.as_deref(),
                edition_id,
            )?;
            let stable_id = transaction
                .query_row(
                    "SELECT stable_key FROM taxonomy_terms WHERE id = ?1",
                    [term_id],
                    |row| row.get::<_, String>(0),
                )
                .map_err(LibraryError::database)?;
            transaction.commit().map_err(LibraryError::database)?;
            Ok(stable_id)
        })
    }

    pub fn create(&self, input: GameInput) -> Result<LibraryEntry, LibraryError> {
        self.with_connection(|connection| create_game(connection, input))
    }

    pub fn update(&self, id: &str, input: GameInput) -> Result<LibraryEntry, LibraryError> {
        self.with_connection(|connection| update_game(connection, id, input))
    }

    pub fn set_favorite(&self, id: &str, favorite: bool) -> Result<(), LibraryError> {
        self.with_connection(|connection| set_favorite(connection, id, favorite))
    }

    pub fn archive(&self, id: &str) -> Result<(), LibraryError> {
        self.with_connection(|connection| set_archived(connection, id, true))
    }

    pub fn restore(&self, id: &str) -> Result<(), LibraryError> {
        self.with_connection(|connection| set_archived(connection, id, false))
    }

    pub fn delete_permanently(&self, id: &str) -> Result<(), LibraryError> {
        self.with_connection(|connection| delete_permanently(connection, id))
    }

    pub fn list_collections(&self) -> Result<Vec<CollectionSummary>, LibraryError> {
        self.with_connection(|connection| query_collections(connection))
    }

    pub fn list_collection_games(
        &self,
        collection_id: &str,
    ) -> Result<Vec<LibraryEntry>, LibraryError> {
        self.with_connection(|connection| query_collection_games(connection, collection_id))
    }

    pub fn create_collection(
        &self,
        input: CollectionInput,
    ) -> Result<CollectionSummary, LibraryError> {
        self.with_connection(|connection| insert_collection(connection, input))
    }

    pub fn update_collection(
        &self,
        id: &str,
        input: CollectionInput,
    ) -> Result<CollectionSummary, LibraryError> {
        self.with_connection(|connection| edit_collection(connection, id, input))
    }

    pub fn delete_collection(&self, id: &str) -> Result<(), LibraryError> {
        self.with_connection(|connection| remove_collection(connection, id))
    }

    pub fn add_game_to_collection(
        &self,
        collection_id: &str,
        game_id: &str,
    ) -> Result<(), LibraryError> {
        self.with_connection(|connection| {
            attach_game_to_collection(connection, collection_id, game_id)
        })
    }

    pub fn remove_game_from_collection(
        &self,
        collection_id: &str,
        game_id: &str,
    ) -> Result<(), LibraryError> {
        self.with_connection(|connection| {
            detach_game_from_collection(connection, collection_id, game_id)
        })
    }

    pub fn get_launch_profile(
        &self,
        edition_id: &str,
    ) -> Result<Option<LaunchProfile>, LibraryError> {
        self.with_connection(|connection| query_launch_profile(connection, edition_id))
    }

    pub fn save_launch_profile(
        &self,
        edition_id: &str,
        input: LaunchProfileInput,
    ) -> Result<LaunchProfile, LibraryError> {
        self.with_connection(|connection| persist_launch_profile(connection, edition_id, input))
    }

    pub fn launch_game(&self, edition_id: &str) -> Result<LaunchResult, LibraryError> {
        self.with_connection(|connection| spawn_launch_profile(connection, edition_id))
    }

    pub fn list_game_relations(&self, edition_id: &str) -> Result<Vec<GameRelation>, LibraryError> {
        self.with_connection(|connection| query_game_relations(connection, edition_id))
    }

    pub fn add_game_relation(
        &self,
        edition_id: &str,
        input: GameRelationInput,
    ) -> Result<GameRelation, LibraryError> {
        self.with_connection(|connection| insert_game_relation(connection, edition_id, input))
    }

    pub fn remove_game_relation(
        &self,
        edition_id: &str,
        relation_id: &str,
    ) -> Result<(), LibraryError> {
        self.with_connection(|connection| delete_game_relation(connection, edition_id, relation_id))
    }

    pub fn replace_game_relations(
        &self,
        edition_id: &str,
        relations: Vec<GameRelationInput>,
    ) -> Result<Vec<GameRelation>, LibraryError> {
        self.with_connection(|connection| replace_relations(connection, edition_id, relations))
    }

    pub fn list_game_collections(
        &self,
        edition_id: &str,
    ) -> Result<Vec<CollectionSummary>, LibraryError> {
        self.with_connection(|connection| query_game_collections(connection, edition_id))
    }
}

fn open_connection(path: &Path) -> Result<Connection, LibraryError> {
    let parent = path.parent().ok_or_else(|| {
        LibraryError::new(
            "database",
            "The library database path has no parent directory.",
        )
    })?;
    fs::create_dir_all(parent).map_err(|error| {
        LibraryError::new(
            "database",
            format!("Could not create the library data directory: {error}"),
        )
    })?;

    let connection = Connection::open(path).map_err(LibraryError::database)?;
    connection
        .busy_timeout(Duration::from_secs(5))
        .map_err(LibraryError::database)?;
    configure_connection(&connection)?;
    migrate(&connection)?;
    verify_foreign_keys(&connection)?;
    Ok(connection)
}

fn configure_connection(connection: &Connection) -> Result<(), LibraryError> {
    let sqlite_version = rusqlite::version_number();
    if sqlite_version < MINIMUM_SQLITE_VERSION {
        return Err(LibraryError::new(
            "database",
            format!(
                "SQLite {} is too old; version 3.9.0 or newer is required.",
                rusqlite::version()
            ),
        ));
    }

    connection
        .execute_batch(
            "PRAGMA foreign_keys = ON;
             PRAGMA journal_mode = WAL;
             PRAGMA synchronous = FULL;",
        )
        .map_err(LibraryError::database)?;

    let foreign_keys: i64 = connection
        .pragma_query_value(None, "foreign_keys", |row| row.get(0))
        .map_err(LibraryError::database)?;
    if foreign_keys != 1 {
        return Err(LibraryError::new(
            "database",
            "SQLite foreign-key enforcement could not be enabled.",
        ));
    }

    let journal_mode: String = connection
        .pragma_query_value(None, "journal_mode", |row| row.get(0))
        .map_err(LibraryError::database)?;
    if !journal_mode.eq_ignore_ascii_case("wal") {
        return Err(LibraryError::new(
            "database",
            format!("SQLite WAL mode could not be enabled (current mode: {journal_mode})."),
        ));
    }

    let synchronous: i64 = connection
        .pragma_query_value(None, "synchronous", |row| row.get(0))
        .map_err(LibraryError::database)?;
    if synchronous != 2 {
        return Err(LibraryError::new(
            "database",
            "SQLite full synchronous writes could not be enabled.",
        ));
    }

    Ok(())
}

fn migrate(connection: &Connection) -> Result<(), LibraryError> {
    migrate_with(
        connection,
        &[
            (1, INITIAL_SCHEMA),
            (2, CANONICAL_TAXONOMY_SCHEMA),
            (LATEST_SCHEMA_VERSION, GAME_RELATIONS_SCHEMA),
        ],
    )
}

fn migrate_with(connection: &Connection, migrations: &[(i64, &str)]) -> Result<(), LibraryError> {
    let current_version: i64 = connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .map_err(LibraryError::database)?;
    let latest_version = migrations
        .last()
        .map(|(version, _)| *version)
        .unwrap_or(current_version);

    if current_version > latest_version {
        return Err(LibraryError::new(
            "database",
            format!(
                "The library database schema version {current_version} is newer than this application supports ({latest_version})."
            ),
        ));
    }

    let transaction = connection
        .unchecked_transaction()
        .map_err(LibraryError::database)?;
    for (version, sql) in migrations {
        if *version > current_version {
            transaction
                .execute_batch(sql)
                .map_err(LibraryError::database)?;
            transaction
                .pragma_update(None, "user_version", version)
                .map_err(LibraryError::database)?;
        }
    }
    transaction.commit().map_err(LibraryError::database)
}

fn verify_foreign_keys(connection: &Connection) -> Result<(), LibraryError> {
    let mut statement = connection
        .prepare("PRAGMA foreign_key_check")
        .map_err(LibraryError::database)?;
    let mut rows = statement.query([]).map_err(LibraryError::database)?;
    if rows.next().map_err(LibraryError::database)?.is_some() {
        return Err(LibraryError::new(
            "integrity",
            "The library database contains a foreign-key integrity violation.",
        ));
    }
    Ok(())
}

fn validate_input(mut input: GameInput) -> Result<GameInput, LibraryError> {
    input.title = input.title.trim().to_string();
    input.developer = input.developer.trim().to_string();
    input.publisher = input.publisher.trim().to_string();
    input.rating = input.rating.trim().to_string();
    input.platform = input.platform.trim().to_string();

    if input.title.is_empty() || input.title.chars().count() > MAX_TITLE_LENGTH {
        return Err(LibraryError::new(
            "validation",
            format!("A title between 1 and {MAX_TITLE_LENGTH} characters is required."),
        ));
    }
    if input.description.chars().count() > MAX_DESCRIPTION_LENGTH {
        return Err(LibraryError::new(
            "validation",
            "The description is too long.",
        ));
    }
    if input.platform.chars().count() > MAX_FIELD_LENGTH {
        return Err(LibraryError::new(
            "validation",
            "The platform name is too long.",
        ));
    }
    for value in [
        input.developer.as_str(),
        input.publisher.as_str(),
        input.rating.as_str(),
    ] {
        if value.chars().count() > MAX_FIELD_LENGTH {
            return Err(LibraryError::new(
                "validation",
                "A game metadata field is too long.",
            ));
        }
    }
    if input
        .year
        .is_some_and(|year| !(1000..=9999).contains(&year))
    {
        return Err(LibraryError::new(
            "validation",
            "The release year must be between 1000 and 9999.",
        ));
    }
    if input
        .score
        .is_some_and(|score| !score.is_finite() || !(0.0..=100.0).contains(&score))
    {
        return Err(LibraryError::new(
            "validation",
            "The score must be between 0 and 100.",
        ));
    }

    input.genre_ids = normalize_stable_ids(input.genre_ids, "genre")?;
    input.systems = normalize_list(input.systems, "operating system")?;
    Ok(input)
}

fn normalize_stable_ids(values: Vec<String>, label: &str) -> Result<Vec<String>, LibraryError> {
    if values.len() > MAX_LIST_LENGTH {
        return Err(LibraryError::new(
            "validation",
            format!("Too many {label} values were supplied."),
        ));
    }
    let mut normalized = Vec::new();
    for value in values {
        let value = value.trim().to_string();
        if value.is_empty() {
            continue;
        }
        if value.chars().count() > MAX_FIELD_LENGTH {
            return Err(LibraryError::new(
                "validation",
                format!("A {label} ID is too long."),
            ));
        }
        if !normalized.contains(&value) {
            normalized.push(value);
        }
    }
    Ok(normalized)
}

fn normalize_list(values: Vec<String>, label: &str) -> Result<Vec<String>, LibraryError> {
    if values.len() > MAX_LIST_LENGTH {
        return Err(LibraryError::new(
            "validation",
            format!("Too many {label} values were supplied."),
        ));
    }

    let mut normalized = Vec::new();
    for value in values {
        let value = value.trim().to_string();
        if value.is_empty() {
            continue;
        }
        if value.chars().count() > MAX_FIELD_LENGTH {
            return Err(LibraryError::new(
                "validation",
                format!("A {label} value is too long."),
            ));
        }
        if !normalized
            .iter()
            .any(|existing: &String| existing.eq_ignore_ascii_case(&value))
        {
            normalized.push(value);
        }
    }
    Ok(normalized)
}

fn stable_key(value: &str) -> String {
    value
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}

fn parse_id(id: &str) -> Result<i64, LibraryError> {
    id.parse::<i64>()
        .ok()
        .filter(|value| *value > 0)
        .ok_or_else(|| LibraryError::new("validation", "The library entry ID is invalid."))
}

fn create_game(
    connection: &mut Connection,
    input: GameInput,
) -> Result<LibraryEntry, LibraryError> {
    let input = validate_input(input)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    let edition_id = insert_edition(&transaction, &input)?;
    let release_id = upsert_primary_release(&transaction, edition_id, &input)?;
    replace_release_systems(&transaction, release_id, &input.systems)?;
    replace_edition_genres(&transaction, edition_id, &input.genre_ids)?;
    transaction
        .execute(
            "INSERT INTO personal_state (edition_id) VALUES (?1)",
            [edition_id],
        )
        .map_err(LibraryError::database)?;
    record_input_claims(&transaction, edition_id, release_id, &input)?;
    transaction.commit().map_err(LibraryError::database)?;
    fetch_entry(connection, edition_id, false)
}

fn update_game(
    connection: &mut Connection,
    id: &str,
    input: GameInput,
) -> Result<LibraryEntry, LibraryError> {
    let edition_id = parse_id(id)?;
    let input = validate_input(input)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;

    let updated = transaction
        .execute(
            "UPDATE editions
             SET title = ?1, developer = ?2, publisher = ?3, age_rating = ?4,
                 score = ?5, description = ?6,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?7 AND archived_at IS NULL",
            params![
                input.title,
                input.developer,
                input.publisher,
                input.rating,
                input.score,
                input.description,
                edition_id
            ],
        )
        .map_err(LibraryError::database)?;
    if updated == 0 {
        return Err(missing_or_archived(&transaction, edition_id)?);
    }

    let release_id = upsert_primary_release(&transaction, edition_id, &input)?;
    replace_release_systems(&transaction, release_id, &input.systems)?;
    replace_edition_genres(&transaction, edition_id, &input.genre_ids)?;
    record_input_claims(&transaction, edition_id, release_id, &input)?;
    transaction.commit().map_err(LibraryError::database)?;
    fetch_entry(connection, edition_id, false)
}

fn insert_edition(transaction: &Transaction<'_>, input: &GameInput) -> Result<i64, LibraryError> {
    transaction
        .execute(
            "INSERT INTO editions (title, developer, publisher, age_rating, score, description)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                input.title,
                input.developer,
                input.publisher,
                input.rating,
                input.score,
                input.description
            ],
        )
        .map_err(LibraryError::database)?;
    Ok(transaction.last_insert_rowid())
}

fn upsert_primary_release(
    transaction: &Transaction<'_>,
    edition_id: i64,
    input: &GameInput,
) -> Result<Option<i64>, LibraryError> {
    let platform_id = if input.platform.is_empty() {
        None
    } else {
        let platform_key = stable_key(&input.platform);
        transaction
            .execute(
                "INSERT INTO platforms (stable_key, name)
                 VALUES (?1, ?2)
                 ON CONFLICT(stable_key) DO NOTHING",
                params![platform_key, input.platform],
            )
            .map_err(LibraryError::database)?;
        Some(
            transaction
                .query_row(
                    "SELECT id FROM platforms WHERE stable_key = ?1",
                    [platform_key],
                    |row| row.get::<_, i64>(0),
                )
                .map_err(LibraryError::database)?,
        )
    };
    let has_release_details =
        platform_id.is_some() || input.year.is_some() || !input.systems.is_empty();

    let release_id = transaction
        .query_row(
            "SELECT id FROM platform_releases WHERE edition_id = ?1 AND is_primary = 1",
            [edition_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(LibraryError::database)?;

    if let Some(release_id) = release_id {
        transaction
            .execute(
                "UPDATE platform_releases
                 SET platform_id = ?1, release_year = ?2,
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE id = ?3",
                params![platform_id, input.year, release_id],
            )
            .map_err(LibraryError::database)?;
        Ok(Some(release_id))
    } else if has_release_details {
        transaction
            .execute(
                "INSERT INTO platform_releases (edition_id, platform_id, release_year, is_primary)
                 VALUES (?1, ?2, ?3, 1)",
                params![edition_id, platform_id, input.year],
            )
            .map_err(LibraryError::database)?;
        Ok(Some(transaction.last_insert_rowid()))
    } else {
        Ok(None)
    }
}

fn replace_release_systems(
    transaction: &Transaction<'_>,
    release_id: Option<i64>,
    systems: &[String],
) -> Result<(), LibraryError> {
    transaction
        .execute(
            "DELETE FROM release_operating_systems WHERE release_id = ?1",
            [release_id],
        )
        .map_err(LibraryError::database)?;
    for system in systems {
        let key = stable_key(system);
        transaction
            .execute(
                "INSERT INTO operating_systems (stable_key, name)
                 VALUES (?1, ?2)
                 ON CONFLICT(stable_key) DO NOTHING",
                params![key, system],
            )
            .map_err(LibraryError::database)?;
        let system_id = transaction
            .query_row(
                "SELECT id FROM operating_systems WHERE stable_key = ?1",
                [key],
                |row| row.get::<_, i64>(0),
            )
            .map_err(LibraryError::database)?;
        transaction
            .execute(
                "INSERT INTO release_operating_systems (release_id, operating_system_id)
                 VALUES (?1, ?2)",
                params![release_id, system_id],
            )
            .map_err(LibraryError::database)?;
    }
    Ok(())
}

fn replace_edition_genres(
    transaction: &Transaction<'_>,
    edition_id: i64,
    genre_ids: &[String],
) -> Result<(), LibraryError> {
    transaction
        .execute(
            "DELETE FROM edition_taxonomy_terms
             WHERE edition_id = ?1
               AND term_id IN (
                   SELECT id FROM taxonomy_terms WHERE status = 'canonical'
               )",
            [edition_id],
        )
        .map_err(LibraryError::database)?;
    for genre_id in genre_ids {
        let inserted = transaction
            .execute(
                "INSERT INTO edition_taxonomy_terms (edition_id, term_id)
                 SELECT ?1, id FROM taxonomy_terms
                 WHERE stable_key = ?2 AND status = 'canonical'",
                params![edition_id, genre_id],
            )
            .map_err(LibraryError::database)?;
        if inserted != 1 {
            return Err(LibraryError::new(
                "validation",
                format!("The selected canonical genre is not available: {genre_id}"),
            ));
        }
    }
    Ok(())
}

fn record_input_claims(
    transaction: &Transaction<'_>,
    edition_id: i64,
    release_id: Option<i64>,
    input: &GameInput,
) -> Result<(), LibraryError> {
    for (field, value) in [
        ("title", json!(input.title)),
        ("developer", json!(input.developer)),
        ("publisher", json!(input.publisher)),
        ("ageRating", json!(input.rating)),
        ("score", json!(input.score)),
        ("description", json!(input.description)),
        ("genres", json!(input.genre_ids)),
    ] {
        record_claim(transaction, "edition_id", edition_id, field, value)?;
    }
    if let Some(release_id) = release_id {
        record_claim(
            transaction,
            "release_id",
            release_id,
            "year",
            json!(input.year),
        )?;
        record_claim(
            transaction,
            "release_id",
            release_id,
            "platform",
            json!(input.platform),
        )?;
        record_claim(
            transaction,
            "release_id",
            release_id,
            "operatingSystems",
            json!(input.systems),
        )?;
    }
    Ok(())
}

fn record_claim(
    transaction: &Transaction<'_>,
    target_column: &str,
    target_id: i64,
    field: &str,
    value: serde_json::Value,
) -> Result<(), LibraryError> {
    let value = serde_json::to_string(&value).map_err(|error| {
        LibraryError::new(
            "database",
            format!("Could not serialize metadata provenance: {error}"),
        )
    })?;
    let query = format!(
        "INSERT INTO metadata_claims
         ({target_column}, field_key, value_json, source_kind, source_name, status)
         VALUES (?1, ?2, ?3, 'manual', 'Kiwanto user', 'accepted')"
    );
    transaction
        .execute(&query, params![target_id, field, value])
        .map_err(LibraryError::database)?;
    Ok(())
}

fn store_pending_taxonomy_term(
    transaction: &Transaction<'_>,
    raw_value: &str,
    source_kind: &str,
    source_name: &str,
    source_record_id: Option<&str>,
    edition_id: Option<i64>,
) -> Result<i64, LibraryError> {
    let raw_value = raw_value.trim();
    let source_name = source_name.trim();
    if raw_value.is_empty()
        || raw_value.chars().count() > MAX_FIELD_LENGTH
        || source_name.is_empty()
        || source_name.chars().count() > MAX_FIELD_LENGTH
        || source_record_id.is_some_and(|id| id.chars().count() > MAX_FIELD_LENGTH)
        || !matches!(source_kind, "manual" | "provider" | "import")
    {
        return Err(LibraryError::new(
            "validation",
            "The pending taxonomy term or its provenance is invalid.",
        ));
    }

    let stable_key = format!("pending:{}", stable_key(raw_value));
    transaction
        .execute(
            "INSERT INTO taxonomy_terms (stable_key, kind, display_name, status)
             VALUES (?1, 'genre', ?2, 'pending')
             ON CONFLICT(stable_key) DO NOTHING",
            params![stable_key, raw_value],
        )
        .map_err(LibraryError::database)?;
    let term_id = transaction
        .query_row(
            "SELECT id FROM taxonomy_terms WHERE stable_key = ?1 AND status = 'pending'",
            [&stable_key],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(LibraryError::database)?
        .ok_or_else(|| {
            LibraryError::new(
                "integrity",
                "A pending term conflicts with a canonical taxonomy identity.",
            )
        })?;
    transaction
        .execute(
            "INSERT INTO taxonomy_term_sources
             (term_id, edition_id, raw_value, source_kind, source_name,
              source_record_id, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending')",
            params![
                term_id,
                edition_id,
                raw_value,
                source_kind,
                source_name,
                source_record_id
            ],
        )
        .map_err(LibraryError::database)?;
    if let Some(edition_id) = edition_id {
        transaction
            .execute(
                "INSERT INTO edition_taxonomy_terms (edition_id, term_id)
                 VALUES (?1, ?2)
                 ON CONFLICT(edition_id, term_id) DO NOTHING",
                params![edition_id, term_id],
            )
            .map_err(LibraryError::database)?;
    }
    Ok(term_id)
}

fn query_canonical_genres(connection: &Connection) -> Result<Vec<GenreOption>, LibraryError> {
    let mut statement = connection
        .prepare(
            "SELECT id, stable_key, display_name, kind
             FROM taxonomy_terms
             WHERE status = 'canonical'
             ORDER BY CASE kind WHEN 'genre' THEN 0 ELSE 1 END,
                      display_name COLLATE NOCASE, stable_key",
        )
        .map_err(LibraryError::database)?;
    let rows = statement
        .query_map([], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })
        .map_err(LibraryError::database)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)?;

    rows.into_iter()
        .map(|(term_id, stable_id, display_name, kind)| {
            let mut parent_statement = connection
                .prepare(
                    "SELECT parent.stable_key
                     FROM taxonomy_term_edges edge
                     JOIN taxonomy_terms parent ON parent.id = edge.parent_term_id
                     WHERE edge.child_term_id = ?1 AND parent.status = 'canonical'
                     ORDER BY parent.display_name COLLATE NOCASE, parent.stable_key",
                )
                .map_err(LibraryError::database)?;
            let parent_ids = parent_statement
                .query_map([term_id], |row| row.get::<_, String>(0))
                .map_err(LibraryError::database)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(LibraryError::database)?;
            Ok(GenreOption {
                id: stable_id,
                display_name,
                kind,
                parent_ids,
            })
        })
        .collect()
}

fn list_entries(
    connection: &Connection,
    archived_only: bool,
) -> Result<Vec<LibraryEntry>, LibraryError> {
    let mut statement = connection
        .prepare(
            "SELECT id FROM editions
             WHERE ((?1 = 1 AND archived_at IS NOT NULL)
                 OR (?1 = 0 AND archived_at IS NULL))
             ORDER BY title COLLATE NOCASE, id",
        )
        .map_err(LibraryError::database)?;
    let ids = statement
        .query_map([archived_only], |row| row.get::<_, i64>(0))
        .map_err(LibraryError::database)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)?;
    ids.into_iter()
        .map(|id| fetch_entry(connection, id, archived_only))
        .collect()
}

fn fetch_entry(
    connection: &Connection,
    edition_id: i64,
    archived_only: bool,
) -> Result<LibraryEntry, LibraryError> {
    let row = connection
        .query_row(
            "SELECT e.id, e.title, e.developer, e.publisher, r.release_year,
                    e.age_rating, e.score, e.description,
                    COALESCE(p.name, 'Sin plataforma'),
                    COALESCE(ps.favorite, 0),
                    EXISTS (
                        SELECT 1 FROM installations i
                        WHERE i.edition_id = e.id AND i.status = 'available'
                    )
             FROM editions e
             LEFT JOIN platform_releases r
               ON r.edition_id = e.id AND r.is_primary = 1
             LEFT JOIN platforms p ON p.id = r.platform_id
             LEFT JOIN personal_state ps ON ps.edition_id = e.id
             WHERE e.id = ?1
               AND ((?2 = 1 AND e.archived_at IS NOT NULL)
                 OR (?2 = 0 AND e.archived_at IS NULL))",
            params![edition_id, archived_only],
            |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, Option<i32>>(4)?,
                    row.get::<_, String>(5)?,
                    row.get::<_, Option<f64>>(6)?,
                    row.get::<_, String>(7)?,
                    row.get::<_, String>(8)?,
                    row.get::<_, bool>(9)?,
                    row.get::<_, bool>(10)?,
                ))
            },
        )
        .optional()
        .map_err(LibraryError::database)?
        .ok_or_else(|| LibraryError::new("notFound", "The library entry was not found."))?;

    let (
        id,
        title,
        developer,
        publisher,
        year,
        rating,
        score,
        description,
        platform,
        favorite,
        installed,
    ) = row;
    let genre = query_strings(
        connection,
        "SELECT t.display_name FROM edition_taxonomy_terms et
         JOIN taxonomy_terms t ON t.id = et.term_id
         WHERE et.edition_id = ?1 ORDER BY t.display_name COLLATE NOCASE, t.id",
        id,
    )?;
    let genre_ids = query_strings(
        connection,
        "SELECT t.stable_key FROM edition_taxonomy_terms et
         JOIN taxonomy_terms t ON t.id = et.term_id
         WHERE et.edition_id = ?1 AND t.status = 'canonical'
         ORDER BY t.display_name COLLATE NOCASE, t.stable_key",
        id,
    )?;
    let pending_genres = query_strings(
        connection,
        "SELECT t.display_name FROM edition_taxonomy_terms et
         JOIN taxonomy_terms t ON t.id = et.term_id
         WHERE et.edition_id = ?1 AND t.status = 'pending'
         ORDER BY t.display_name COLLATE NOCASE, t.id",
        id,
    )?;
    let systems = query_strings(
        connection,
        "SELECT os.name FROM release_operating_systems ros
         JOIN operating_systems os ON os.id = ros.operating_system_id
         JOIN platform_releases r ON r.id = ros.release_id
         WHERE r.edition_id = ?1 AND r.is_primary = 1
         ORDER BY os.name COLLATE NOCASE, os.id",
        id,
    )?;
    let cover = connection
        .query_row(
            "SELECT a.file_path FROM visual_asset_associations vaa
             JOIN visual_assets a ON a.id = vaa.asset_id
             WHERE vaa.edition_id = ?1 AND vaa.role = 'cover'
             ORDER BY vaa.id DESC LIMIT 1",
            [id],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map_err(LibraryError::database)?;

    Ok(LibraryEntry {
        game: Game {
            id: id.to_string(),
            metadata: GameMetadata {
                title: title.clone(),
                developer,
                publisher,
                year,
                genre,
                genre_ids,
                pending_genres,
                rating,
                score,
                platform,
                systems,
                description,
            },
            presentation: GamePresentation {
                cover,
                accent: "#99c774".to_string(),
                initials: initials(&title),
            },
        },
        state: GameLibraryState {
            installed,
            favorite,
        },
    })
}

fn query_strings(
    connection: &Connection,
    query: &str,
    edition_id: i64,
) -> Result<Vec<String>, LibraryError> {
    let mut statement = connection.prepare(query).map_err(LibraryError::database)?;
    let values = statement
        .query_map([edition_id], |row| row.get::<_, String>(0))
        .map_err(LibraryError::database)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)?;
    Ok(values)
}

fn initials(title: &str) -> String {
    title
        .split_whitespace()
        .take(2)
        .filter_map(|word| word.chars().next())
        .collect::<String>()
        .to_uppercase()
}

fn set_favorite(connection: &mut Connection, id: &str, favorite: bool) -> Result<(), LibraryError> {
    let edition_id = parse_id(id)?;
    let changed = connection
        .execute(
            "UPDATE personal_state SET favorite = ?1,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE edition_id = ?2",
            params![favorite, edition_id],
        )
        .map_err(LibraryError::database)?;
    if changed == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The library entry was not found.",
        ));
    }
    Ok(())
}

fn set_archived(connection: &mut Connection, id: &str, archived: bool) -> Result<(), LibraryError> {
    let edition_id = parse_id(id)?;
    let changed = connection
        .execute(
            "UPDATE editions
             SET archived_at = CASE WHEN ?1 = 1
                 THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ELSE NULL END,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?2 AND ((?1 = 1 AND archived_at IS NULL)
                              OR (?1 = 0 AND archived_at IS NOT NULL))",
            params![archived, edition_id],
        )
        .map_err(LibraryError::database)?;
    if changed == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The library entry was not found or is already in that state.",
        ));
    }
    Ok(())
}

fn delete_permanently(connection: &mut Connection, id: &str) -> Result<(), LibraryError> {
    let edition_id = parse_id(id)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    let archived: Option<bool> = transaction
        .query_row(
            "SELECT archived_at IS NOT NULL FROM editions WHERE id = ?1",
            [edition_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(LibraryError::database)?;
    match archived {
        None => {
            return Err(LibraryError::new(
                "notFound",
                "The library entry was not found.",
            ))
        }
        Some(false) => {
            return Err(LibraryError::new(
                "validation",
                "Archive the library entry before permanently deleting it.",
            ))
        }
        Some(true) => {}
    }
    transaction
        .execute("DELETE FROM editions WHERE id = ?1", [edition_id])
        .map_err(|error| {
            if matches!(
                error.sqlite_error_code(),
                Some(rusqlite::ErrorCode::ConstraintViolation)
            ) {
                LibraryError::new(
                    "integrity",
                    "This entry still has related installations or manager references. Resolve them before deleting it.",
                )
            } else {
                LibraryError::database(error)
            }
        })?;
    transaction.commit().map_err(LibraryError::database)
}

fn validate_collection_input(mut input: CollectionInput) -> Result<CollectionInput, LibraryError> {
    input.name = input.name.trim().to_string();
    input.description = input.description.trim().to_string();
    if input.name.is_empty() || input.name.chars().count() > MAX_FIELD_LENGTH {
        return Err(LibraryError::new(
            "validation",
            format!("A collection name between 1 and {MAX_FIELD_LENGTH} characters is required."),
        ));
    }
    if input.description.chars().count() > MAX_DESCRIPTION_LENGTH {
        return Err(LibraryError::new(
            "validation",
            "The collection description is too long.",
        ));
    }
    Ok(input)
}

fn query_collection(connection: &Connection, id: i64) -> Result<CollectionSummary, LibraryError> {
    connection
        .query_row(
            "SELECT c.id, c.name, c.description, COUNT(e.id)
             FROM collections c
             LEFT JOIN collection_editions ce ON ce.collection_id = c.id
             LEFT JOIN editions e ON e.id = ce.edition_id AND e.archived_at IS NULL
             WHERE c.id = ?1
             GROUP BY c.id",
            [id],
            |row| {
                Ok(CollectionSummary {
                    id: row.get::<_, i64>(0)?.to_string(),
                    name: row.get(1)?,
                    description: row.get(2)?,
                    game_count: row.get::<_, i64>(3)?.max(0) as usize,
                })
            },
        )
        .optional()
        .map_err(LibraryError::database)?
        .ok_or_else(|| LibraryError::new("notFound", "The collection was not found."))
}

fn query_collections(connection: &Connection) -> Result<Vec<CollectionSummary>, LibraryError> {
    let mut statement = connection
        .prepare(
            "SELECT c.id, c.name, c.description, COUNT(e.id)
             FROM collections c
             LEFT JOIN collection_editions ce ON ce.collection_id = c.id
             LEFT JOIN editions e ON e.id = ce.edition_id AND e.archived_at IS NULL
             GROUP BY c.id
             ORDER BY c.name COLLATE NOCASE, c.id",
        )
        .map_err(LibraryError::database)?;
    let rows = statement
        .query_map([], |row| {
            Ok(CollectionSummary {
                id: row.get::<_, i64>(0)?.to_string(),
                name: row.get(1)?,
                description: row.get(2)?,
                game_count: row.get::<_, i64>(3)?.max(0) as usize,
            })
        })
        .map_err(LibraryError::database)?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)
}

fn query_collection_games(
    connection: &Connection,
    collection_id: &str,
) -> Result<Vec<LibraryEntry>, LibraryError> {
    let collection_id = parse_id(collection_id)?;
    query_collection(connection, collection_id)?;
    let mut statement = connection
        .prepare(
            "SELECT e.id
             FROM collection_editions ce
             JOIN editions e ON e.id = ce.edition_id
             WHERE ce.collection_id = ?1 AND e.archived_at IS NULL
             ORDER BY e.title COLLATE NOCASE, e.id",
        )
        .map_err(LibraryError::database)?;
    let ids = statement
        .query_map([collection_id], |row| row.get::<_, i64>(0))
        .map_err(LibraryError::database)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)?;
    ids.into_iter()
        .map(|id| fetch_entry(connection, id, false))
        .collect()
}

fn query_game_relations(
    connection: &Connection,
    edition_id: &str,
) -> Result<Vec<GameRelation>, LibraryError> {
    let edition_id = parse_id(edition_id)?;
    ensure_active_edition_exists(connection, edition_id)?;
    let mut statement = connection.prepare("SELECT id, related_edition_id, relation_type FROM game_relations WHERE source_edition_id = ?1 ORDER BY id").map_err(LibraryError::database)?;
    let rows = statement
        .query_map([edition_id], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, i64>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .map_err(LibraryError::database)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)?;
    rows.into_iter()
        .map(|(id, related, kind)| {
            Ok(GameRelation {
                id: id.to_string(),
                related_game: fetch_entry(connection, related, false)?.game,
                relation_type: relation_type_from_str(&kind)?,
            })
        })
        .collect()
}

fn relation_type_from_str(value: &str) -> Result<GameRelationType, LibraryError> {
    match value {
        "prequel" => Ok(GameRelationType::Prequel),
        "sequel" => Ok(GameRelationType::Sequel),
        "spin_off" => Ok(GameRelationType::SpinOff),
        "remake" => Ok(GameRelationType::Remake),
        "remaster" => Ok(GameRelationType::Remaster),
        "other" => Ok(GameRelationType::Other),
        _ => Err(LibraryError::new("database", "Unknown game relation type.")),
    }
}

fn insert_game_relation(
    connection: &mut Connection,
    edition_id: &str,
    input: GameRelationInput,
) -> Result<GameRelation, LibraryError> {
    let source = parse_id(edition_id)?;
    let target = parse_id(&input.related_game_id)?;
    if source == target {
        return Err(LibraryError::new(
            "validation",
            "A game cannot be related to itself.",
        ));
    }
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    ensure_active_edition_exists(&transaction, source)?;
    ensure_active_edition_exists(&transaction, target)?;
    transaction.execute("INSERT INTO game_relations(source_edition_id, related_edition_id, relation_type) VALUES (?1, ?2, ?3)", params![source, target, input.relation_type.as_str()]).map_err(LibraryError::database)?;
    transaction.commit().map_err(LibraryError::database)?;
    let id: i64 = connection.query_row("SELECT id FROM game_relations WHERE source_edition_id=?1 AND related_edition_id=?2 AND relation_type=?3", params![source,target,input.relation_type.as_str()], |r| r.get(0)).map_err(LibraryError::database)?;
    Ok(GameRelation {
        id: id.to_string(),
        related_game: fetch_entry(connection, target, false)?.game,
        relation_type: input.relation_type,
    })
}

fn delete_game_relation(
    connection: &mut Connection,
    edition_id: &str,
    relation_id: &str,
) -> Result<(), LibraryError> {
    let source = parse_id(edition_id)?;
    let relation = parse_id(relation_id)?;
    let changed = connection
        .execute(
            "DELETE FROM game_relations WHERE id=?1 AND source_edition_id=?2",
            params![relation, source],
        )
        .map_err(LibraryError::database)?;
    if changed == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The game relation was not found.",
        ));
    }
    Ok(())
}

fn replace_relations(
    connection: &mut Connection,
    edition_id: &str,
    relations: Vec<GameRelationInput>,
) -> Result<Vec<GameRelation>, LibraryError> {
    let source = parse_id(edition_id)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    ensure_active_edition_exists(&transaction, source)?;
    transaction
        .execute(
            "DELETE FROM game_relations WHERE source_edition_id = ?1",
            [source],
        )
        .map_err(LibraryError::database)?;
    for relation in &relations {
        let target = parse_id(&relation.related_game_id)?;
        if target == source {
            return Err(LibraryError::new(
                "validation",
                "A game cannot be related to itself.",
            ));
        }
        ensure_active_edition_exists(&transaction, target)?;
        transaction
            .execute("INSERT INTO game_relations(source_edition_id, related_edition_id, relation_type) VALUES (?1, ?2, ?3)", params![source, target, relation.relation_type.as_str()])
            .map_err(LibraryError::database)?;
    }
    transaction.commit().map_err(LibraryError::database)?;
    query_game_relations(connection, &source.to_string())
}

fn query_game_collections(
    connection: &Connection,
    edition_id: &str,
) -> Result<Vec<CollectionSummary>, LibraryError> {
    let edition_id = parse_id(edition_id)?;
    let mut statement=connection.prepare("SELECT c.id,c.name,c.description,(SELECT COUNT(*) FROM collection_editions ce JOIN editions e ON e.id=ce.edition_id WHERE ce.collection_id=c.id AND e.archived_at IS NULL) FROM collections c JOIN collection_editions ce ON ce.collection_id=c.id WHERE ce.edition_id=?1 ORDER BY c.name COLLATE NOCASE").map_err(LibraryError::database)?;
    let rows = statement
        .query_map([edition_id], |row| {
            Ok(CollectionSummary {
                id: row.get::<_, i64>(0)?.to_string(),
                name: row.get(1)?,
                description: row.get(2)?,
                game_count: row.get::<_, i64>(3)?.max(0) as usize,
            })
        })
        .map_err(LibraryError::database)?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)
}

fn insert_collection(
    connection: &mut Connection,
    input: CollectionInput,
) -> Result<CollectionSummary, LibraryError> {
    let input = validate_collection_input(input)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    transaction
        .execute(
            "INSERT INTO collections (name, description) VALUES (?1, ?2)",
            params![input.name, input.description],
        )
        .map_err(LibraryError::database)?;
    let id = transaction.last_insert_rowid();
    transaction.commit().map_err(LibraryError::database)?;
    query_collection(connection, id)
}

fn edit_collection(
    connection: &mut Connection,
    id: &str,
    input: CollectionInput,
) -> Result<CollectionSummary, LibraryError> {
    let id = parse_id(id)?;
    let input = validate_collection_input(input)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    let changed = transaction
        .execute(
            "UPDATE collections SET name = ?1, description = ?2,
                 updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?3",
            params![input.name, input.description, id],
        )
        .map_err(LibraryError::database)?;
    if changed == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The collection was not found.",
        ));
    }
    transaction.commit().map_err(LibraryError::database)?;
    query_collection(connection, id)
}

fn remove_collection(connection: &mut Connection, id: &str) -> Result<(), LibraryError> {
    let id = parse_id(id)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    let changed = transaction
        .execute("DELETE FROM collections WHERE id = ?1", [id])
        .map_err(LibraryError::database)?;
    if changed == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The collection was not found.",
        ));
    }
    transaction.commit().map_err(LibraryError::database)
}

fn collection_exists(connection: &Connection, id: i64) -> Result<bool, LibraryError> {
    connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM collections WHERE id = ?1)",
            [id],
            |row| row.get::<_, i64>(0),
        )
        .map(|exists| exists != 0)
        .map_err(LibraryError::database)
}

fn ensure_edition_exists(connection: &Connection, id: i64) -> Result<(), LibraryError> {
    let exists = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM editions WHERE id = ?1)",
            [id],
            |row| row.get::<_, i64>(0),
        )
        .map_err(LibraryError::database)?;
    if exists == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The library entry was not found.",
        ));
    }
    Ok(())
}

fn ensure_active_edition_exists(connection: &Connection, id: i64) -> Result<(), LibraryError> {
    let active = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM editions WHERE id = ?1 AND archived_at IS NULL)",
            [id],
            |row| row.get::<_, i64>(0),
        )
        .map_err(LibraryError::database)?;
    if active == 0 {
        return Err(LibraryError::new(
            "notFound",
            "The active library entry was not found.",
        ));
    }
    Ok(())
}

fn attach_game_to_collection(
    connection: &mut Connection,
    collection_id: &str,
    game_id: &str,
) -> Result<(), LibraryError> {
    let collection_id = parse_id(collection_id)?;
    let game_id = parse_id(game_id)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    if !collection_exists(&transaction, collection_id)? {
        return Err(LibraryError::new(
            "notFound",
            "The collection was not found.",
        ));
    }
    ensure_active_edition_exists(&transaction, game_id)?;
    transaction
        .execute(
            "INSERT INTO collection_editions (collection_id, edition_id)
             VALUES (?1, ?2) ON CONFLICT(collection_id, edition_id) DO NOTHING",
            params![collection_id, game_id],
        )
        .map_err(LibraryError::database)?;
    transaction.commit().map_err(LibraryError::database)
}

fn detach_game_from_collection(
    connection: &mut Connection,
    collection_id: &str,
    game_id: &str,
) -> Result<(), LibraryError> {
    let collection_id = parse_id(collection_id)?;
    let game_id = parse_id(game_id)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    if !collection_exists(&transaction, collection_id)? {
        return Err(LibraryError::new(
            "notFound",
            "The collection was not found.",
        ));
    }
    ensure_edition_exists(&transaction, game_id)?;
    transaction
        .execute(
            "DELETE FROM collection_editions WHERE collection_id = ?1 AND edition_id = ?2",
            params![collection_id, game_id],
        )
        .map_err(LibraryError::database)?;
    transaction.commit().map_err(LibraryError::database)
}

fn validate_launch_profile(input: LaunchProfileInput) -> Result<LaunchProfile, LibraryError> {
    let raw_executable = input.executable_path.as_str();
    if raw_executable.trim().is_empty() || raw_executable.len() > 4096 {
        return Err(LibraryError::new(
            "validation",
            "Choose an executable path no longer than 4096 bytes.",
        ));
    }
    let executable = Path::new(raw_executable);
    if !executable.is_absolute() {
        return Err(LibraryError::new(
            "validation",
            "The executable path must be absolute.",
        ));
    }
    let executable = executable.canonicalize().map_err(|error| {
        LibraryError::new(
            "validation",
            format!("The executable path cannot be opened: {error}"),
        )
    })?;
    let metadata = executable.metadata().map_err(|error| {
        LibraryError::new(
            "validation",
            format!("The executable cannot be inspected: {error}"),
        )
    })?;
    if !metadata.is_file() {
        return Err(LibraryError::new(
            "validation",
            "The selected executable is not a regular file.",
        ));
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if metadata.permissions().mode() & 0o111 == 0 {
            return Err(LibraryError::new(
                "validation",
                "The selected file is not executable.",
            ));
        }
    }
    if input.arguments.len() > MAX_LAUNCH_ARGUMENTS
        || input
            .arguments
            .iter()
            .any(|argument| argument.len() > MAX_LAUNCH_ARGUMENT_LENGTH || argument.contains('\0'))
    {
        return Err(LibraryError::new(
            "validation",
            "The launch profile contains too many or too-long arguments.",
        ));
    }
    let working_directory = input
        .working_directory
        .filter(|value| !value.is_empty())
        .map(|value| {
            if value.len() > 4096 || !Path::new(&value).is_absolute() {
                return Err(LibraryError::new(
                    "validation",
                    "The working directory must be an absolute path no longer than 4096 bytes.",
                ));
            }
            let directory = Path::new(&value).canonicalize().map_err(|error| {
                LibraryError::new(
                    "validation",
                    format!("The working directory cannot be opened: {error}"),
                )
            })?;
            if !directory.is_dir() {
                return Err(LibraryError::new(
                    "validation",
                    "The working directory is not a directory.",
                ));
            }
            Ok(directory.to_string_lossy().into_owned())
        })
        .transpose()?;

    Ok(LaunchProfile {
        executable_path: executable.to_string_lossy().into_owned(),
        working_directory,
        arguments: input.arguments,
    })
}

fn query_launch_profile(
    connection: &Connection,
    edition_id: &str,
) -> Result<Option<LaunchProfile>, LibraryError> {
    let edition_id = parse_id(edition_id)?;
    ensure_active_edition_exists(connection, edition_id)?;
    let profile_id = connection
        .query_row(
            "SELECT id FROM launch_profiles
             WHERE edition_id = ?1 AND name = 'Kiwanto local' ORDER BY id LIMIT 1",
            [edition_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(LibraryError::database)?;
    let Some(profile_id) = profile_id else {
        return Ok(None);
    };
    let (executable_path, working_directory) = connection
        .query_row(
            "SELECT executable_path, working_directory FROM launch_profiles WHERE id = ?1",
            [profile_id],
            |row| {
                Ok((
                    row.get::<_, Option<String>>(0)?,
                    row.get::<_, Option<String>>(1)?,
                ))
            },
        )
        .map_err(LibraryError::database)?;
    let mut statement = connection
        .prepare(
            "SELECT argument FROM launch_profile_arguments
             WHERE profile_id = ?1 ORDER BY position",
        )
        .map_err(LibraryError::database)?;
    let arguments = statement
        .query_map([profile_id], |row| row.get::<_, String>(0))
        .map_err(LibraryError::database)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(LibraryError::database)?;
    match executable_path {
        Some(executable_path) => Ok(Some(LaunchProfile {
            executable_path,
            working_directory,
            arguments,
        })),
        None => Ok(None),
    }
}

fn persist_launch_profile(
    connection: &mut Connection,
    edition_id: &str,
    input: LaunchProfileInput,
) -> Result<LaunchProfile, LibraryError> {
    let edition_id = parse_id(edition_id)?;
    let profile = validate_launch_profile(input)?;
    let transaction = connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(LibraryError::database)?;
    ensure_active_edition_exists(&transaction, edition_id)?;
    let profile_id = transaction
        .query_row(
            "SELECT id FROM launch_profiles
             WHERE edition_id = ?1 AND name = 'Kiwanto local' ORDER BY id LIMIT 1",
            [edition_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(LibraryError::database)?;
    let id = match profile_id {
        Some(id) => {
            transaction
                .execute(
                    "UPDATE launch_profiles SET executable_path = ?1, working_directory = ?2,
                         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?3",
                    params![profile.executable_path, profile.working_directory, id],
                )
                .map_err(LibraryError::database)?;
            id
        }
        None => {
            transaction
                .execute(
                    "INSERT INTO launch_profiles
                        (edition_id, name, executable_path, working_directory)
                     VALUES (?1, 'Kiwanto local', ?2, ?3)",
                    params![
                        edition_id,
                        profile.executable_path,
                        profile.working_directory
                    ],
                )
                .map_err(LibraryError::database)?;
            transaction.last_insert_rowid()
        }
    };
    transaction
        .execute(
            "DELETE FROM launch_profile_arguments WHERE profile_id = ?1",
            [id],
        )
        .map_err(LibraryError::database)?;
    for (position, argument) in profile.arguments.iter().enumerate() {
        transaction
            .execute(
                "INSERT INTO launch_profile_arguments (profile_id, position, argument)
                 VALUES (?1, ?2, ?3)",
                params![id, position as i64, argument],
            )
            .map_err(LibraryError::database)?;
    }
    transaction.commit().map_err(LibraryError::database)?;
    Ok(profile)
}

fn spawn_launch_profile(
    connection: &Connection,
    edition_id: &str,
) -> Result<LaunchResult, LibraryError> {
    let profile = query_launch_profile(connection, edition_id)?.ok_or_else(|| {
        LibraryError::new(
            "notReady",
            "Configure a local executable before launching this game.",
        )
    })?;
    let executable = Path::new(&profile.executable_path);
    let current_executable = executable.canonicalize().map_err(|error| {
        LibraryError::new(
            "launch",
            format!("The configured executable is no longer available: {error}"),
        )
    })?;
    let metadata = current_executable.metadata().map_err(|error| {
        LibraryError::new(
            "launch",
            format!("Could not inspect the executable: {error}"),
        )
    })?;
    if !metadata.is_file() {
        return Err(LibraryError::new(
            "launch",
            "The configured executable is not a regular file.",
        ));
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if metadata.permissions().mode() & 0o111 == 0 {
            return Err(LibraryError::new(
                "launch",
                "The configured file is no longer executable.",
            ));
        }
    }
    let mut command = Command::new(current_executable);
    command.args(&profile.arguments);
    if let Some(directory) = profile.working_directory {
        command.current_dir(directory);
    }
    let child = command.spawn().map_err(|error| {
        LibraryError::new("launch", format!("Could not start the game: {error}"))
    })?;
    let process_id = child.id();
    std::thread::spawn(move || {
        let mut child = child;
        let _ = child.wait();
    });
    Ok(LaunchResult { process_id })
}

fn missing_or_archived(
    transaction: &Transaction<'_>,
    edition_id: i64,
) -> Result<LibraryError, LibraryError> {
    let archived: Option<bool> = transaction
        .query_row(
            "SELECT archived_at IS NOT NULL FROM editions WHERE id = ?1",
            [edition_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(LibraryError::database)?;
    Ok(match archived {
        Some(true) => {
            LibraryError::new("validation", "Restore the library entry before editing it.")
        }
        _ => LibraryError::new("notFound", "The library entry was not found."),
    })
}

#[tauri::command]
pub fn list_library(
    database: State<'_, LibraryDatabase>,
    archived_only: bool,
) -> Result<Vec<LibraryEntry>, LibraryError> {
    database.list(archived_only)
}

#[tauri::command]
pub fn list_canonical_genres(
    database: State<'_, LibraryDatabase>,
) -> Result<Vec<GenreOption>, LibraryError> {
    database.list_canonical_genres()
}

#[tauri::command]
pub fn record_pending_taxonomy_term(
    database: State<'_, LibraryDatabase>,
    input: PendingTaxonomyInput,
) -> Result<String, LibraryError> {
    database.record_pending_taxonomy_term(input)
}

#[tauri::command]
pub fn create_library_entry(
    database: State<'_, LibraryDatabase>,
    input: GameInput,
) -> Result<LibraryEntry, LibraryError> {
    database.create(input)
}

#[tauri::command]
pub fn update_library_entry(
    database: State<'_, LibraryDatabase>,
    id: String,
    input: GameInput,
) -> Result<LibraryEntry, LibraryError> {
    database.update(&id, input)
}

#[tauri::command]
pub fn set_library_favorite(
    database: State<'_, LibraryDatabase>,
    id: String,
    favorite: bool,
) -> Result<(), LibraryError> {
    database.set_favorite(&id, favorite)
}

#[tauri::command]
pub fn archive_library_entry(
    database: State<'_, LibraryDatabase>,
    id: String,
) -> Result<(), LibraryError> {
    database.archive(&id)
}

#[tauri::command]
pub fn restore_library_entry(
    database: State<'_, LibraryDatabase>,
    id: String,
) -> Result<(), LibraryError> {
    database.restore(&id)
}

#[tauri::command]
pub fn delete_library_entry_permanently(
    database: State<'_, LibraryDatabase>,
    id: String,
) -> Result<(), LibraryError> {
    database.delete_permanently(&id)
}

#[tauri::command]
pub fn list_collections(
    database: State<'_, LibraryDatabase>,
) -> Result<Vec<CollectionSummary>, LibraryError> {
    database.list_collections()
}

#[tauri::command]
pub fn list_collection_games(
    database: State<'_, LibraryDatabase>,
    collection_id: String,
) -> Result<Vec<LibraryEntry>, LibraryError> {
    database.list_collection_games(&collection_id)
}

#[tauri::command]
pub fn create_collection(
    database: State<'_, LibraryDatabase>,
    input: CollectionInput,
) -> Result<CollectionSummary, LibraryError> {
    database.create_collection(input)
}

#[tauri::command]
pub fn update_collection(
    database: State<'_, LibraryDatabase>,
    id: String,
    input: CollectionInput,
) -> Result<CollectionSummary, LibraryError> {
    database.update_collection(&id, input)
}

#[tauri::command]
pub fn delete_collection(
    database: State<'_, LibraryDatabase>,
    id: String,
) -> Result<(), LibraryError> {
    database.delete_collection(&id)
}

#[tauri::command]
pub fn add_game_to_collection(
    database: State<'_, LibraryDatabase>,
    collection_id: String,
    game_id: String,
) -> Result<(), LibraryError> {
    database.add_game_to_collection(&collection_id, &game_id)
}

#[tauri::command]
pub fn remove_game_from_collection(
    database: State<'_, LibraryDatabase>,
    collection_id: String,
    game_id: String,
) -> Result<(), LibraryError> {
    database.remove_game_from_collection(&collection_id, &game_id)
}

#[tauri::command]
pub fn get_launch_profile(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
) -> Result<Option<LaunchProfile>, LibraryError> {
    database.get_launch_profile(&edition_id)
}

#[tauri::command]
pub fn save_launch_profile(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
    input: LaunchProfileInput,
) -> Result<LaunchProfile, LibraryError> {
    database.save_launch_profile(&edition_id, input)
}

#[tauri::command]
pub fn launch_game(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
) -> Result<LaunchResult, LibraryError> {
    database.launch_game(&edition_id)
}

#[tauri::command]
pub fn list_game_relations(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
) -> Result<Vec<GameRelation>, LibraryError> {
    database.list_game_relations(&edition_id)
}
#[tauri::command]
pub fn add_game_relation(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
    input: GameRelationInput,
) -> Result<GameRelation, LibraryError> {
    database.add_game_relation(&edition_id, input)
}
#[tauri::command]
pub fn remove_game_relation(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
    relation_id: String,
) -> Result<(), LibraryError> {
    database.remove_game_relation(&edition_id, &relation_id)
}
#[tauri::command]
pub fn replace_game_relations(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
    relations: Vec<GameRelationInput>,
) -> Result<Vec<GameRelation>, LibraryError> {
    database.replace_game_relations(&edition_id, relations)
}
#[tauri::command]
pub fn list_game_collections(
    database: State<'_, LibraryDatabase>,
    edition_id: String,
) -> Result<Vec<CollectionSummary>, LibraryError> {
    database.list_game_collections(&edition_id)
}

pub fn database_path(data_directory: &Path) -> PathBuf {
    data_directory.join("kiwanto").join("library.sqlite3")
}

const INITIAL_SCHEMA: &str = r#"
CREATE TABLE works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stable_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE operating_systems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stable_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE editions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER REFERENCES works(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 300),
    developer TEXT NOT NULL DEFAULT '',
    publisher TEXT NOT NULL DEFAULT '',
    age_rating TEXT NOT NULL DEFAULT '',
    score REAL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    description TEXT NOT NULL DEFAULT '',
    archived_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (id, work_id)
);

CREATE INDEX editions_active_title_idx ON editions(title COLLATE NOCASE, id)
    WHERE archived_at IS NULL;
CREATE INDEX editions_archived_title_idx ON editions(title COLLATE NOCASE, id)
    WHERE archived_at IS NOT NULL;

CREATE TABLE platform_releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    platform_id INTEGER REFERENCES platforms(id) ON DELETE RESTRICT,
    release_year INTEGER CHECK (release_year IS NULL OR release_year BETWEEN 1000 AND 9999),
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (id, edition_id)
);
CREATE UNIQUE INDEX platform_releases_one_primary_idx
    ON platform_releases(edition_id) WHERE is_primary = 1;
CREATE INDEX platform_releases_edition_idx ON platform_releases(edition_id);
CREATE INDEX platform_releases_platform_idx ON platform_releases(platform_id, edition_id);

CREATE TABLE release_operating_systems (
    release_id INTEGER NOT NULL REFERENCES platform_releases(id) ON DELETE CASCADE,
    operating_system_id INTEGER NOT NULL REFERENCES operating_systems(id) ON DELETE RESTRICT,
    PRIMARY KEY (release_id, operating_system_id)
);
CREATE INDEX release_operating_systems_os_idx
    ON release_operating_systems(operating_system_id, release_id);

CREATE TABLE release_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    release_id INTEGER NOT NULL REFERENCES platform_releases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    region TEXT,
    revision TEXT,
    UNIQUE (id, release_id)
);

CREATE TABLE execution_environments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('wine', 'proton', 'emulator', 'native', 'other')),
    name TEXT NOT NULL,
    configuration_reference TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE installations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE RESTRICT,
    release_id INTEGER,
    variant_id INTEGER,
    execution_environment_id INTEGER REFERENCES execution_environments(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'missing', 'unavailable', 'incomplete', 'uninstalled', 'unknown')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (id, edition_id),
    CHECK (variant_id IS NULL OR release_id IS NOT NULL),
    FOREIGN KEY (release_id, edition_id)
        REFERENCES platform_releases(id, edition_id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id, release_id)
        REFERENCES release_variants(id, release_id) ON DELETE RESTRICT
);
CREATE INDEX installations_edition_status_idx ON installations(edition_id, status);

CREATE TABLE installation_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    installation_id INTEGER NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    location_kind TEXT NOT NULL CHECK (location_kind IN ('directory', 'executable', 'rom', 'other')),
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    last_seen_at TEXT,
    UNIQUE (installation_id, path),
    UNIQUE (id, installation_id)
);
CREATE UNIQUE INDEX installation_locations_one_primary_idx
    ON installation_locations(installation_id) WHERE is_primary = 1;

CREATE TABLE installation_artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    installation_id INTEGER NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES installation_locations(id) ON DELETE SET NULL,
    artifact_kind TEXT NOT NULL CHECK (artifact_kind IN ('game_directory', 'executable', 'rom', 'data', 'other')),
    path TEXT NOT NULL,
    checksum_algorithm TEXT,
    checksum TEXT,
    UNIQUE (installation_id, path),
    FOREIGN KEY (location_id, installation_id)
        REFERENCES installation_locations(id, installation_id) ON DELETE RESTRICT
);

CREATE TABLE installation_manager_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    installation_id INTEGER NOT NULL REFERENCES installations(id) ON DELETE RESTRICT,
    manager_name TEXT NOT NULL,
    external_id TEXT,
    management_location TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (manager_name, external_id)
);
CREATE INDEX installation_manager_references_installation_idx
    ON installation_manager_references(installation_id);

CREATE TABLE launch_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    release_id INTEGER,
    installation_id INTEGER,
    execution_environment_id INTEGER REFERENCES execution_environments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    executable_path TEXT,
    working_directory TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (id, edition_id),
    FOREIGN KEY (release_id, edition_id)
        REFERENCES platform_releases(id, edition_id) ON DELETE CASCADE,
    FOREIGN KEY (installation_id, edition_id)
        REFERENCES installations(id, edition_id) ON DELETE CASCADE
);
CREATE TABLE launch_profile_arguments (
    profile_id INTEGER NOT NULL REFERENCES launch_profiles(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    argument TEXT NOT NULL,
    PRIMARY KEY (profile_id, position)
);
CREATE TABLE launch_profile_environment (
    profile_id INTEGER NOT NULL REFERENCES launch_profiles(id) ON DELETE CASCADE,
    variable_name TEXT NOT NULL,
    variable_value TEXT NOT NULL,
    PRIMARY KEY (profile_id, variable_name)
);

CREATE TABLE personal_state (
    edition_id INTEGER PRIMARY KEY REFERENCES editions(id) ON DELETE CASCADE,
    favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1)),
    notes TEXT NOT NULL DEFAULT '',
    user_rating REAL CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 100)),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX personal_state_favorite_idx ON personal_state(favorite, edition_id);

CREATE TABLE taxonomy_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stable_key TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL CHECK (kind IN ('genre', 'subgenre')),
    display_name TEXT NOT NULL
);
CREATE TABLE taxonomy_term_labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
    language_tag TEXT NOT NULL,
    label TEXT NOT NULL,
    label_kind TEXT NOT NULL CHECK (label_kind IN ('display', 'translation', 'alternative')),
    UNIQUE (term_id, language_tag, label)
);
CREATE TABLE taxonomy_term_edges (
    parent_term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
    child_term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_term_id, child_term_id),
    CHECK (parent_term_id <> child_term_id)
);
CREATE TRIGGER taxonomy_term_edges_no_cycle_insert
BEFORE INSERT ON taxonomy_term_edges
WHEN EXISTS (
    WITH RECURSIVE descendants(id) AS (
        SELECT child_term_id FROM taxonomy_term_edges WHERE parent_term_id = NEW.child_term_id
        UNION
        SELECT edge.child_term_id
        FROM taxonomy_term_edges edge
        JOIN descendants current ON edge.parent_term_id = current.id
    )
    SELECT 1 FROM descendants WHERE id = NEW.parent_term_id
)
BEGIN
    SELECT RAISE(ABORT, 'taxonomy relationships must be acyclic');
END;
CREATE TRIGGER taxonomy_term_edges_no_cycle_update
BEFORE UPDATE OF parent_term_id, child_term_id ON taxonomy_term_edges
WHEN EXISTS (
    WITH RECURSIVE descendants(id) AS (
        SELECT child_term_id FROM taxonomy_term_edges
        WHERE parent_term_id = NEW.child_term_id
          AND NOT (parent_term_id = OLD.parent_term_id AND child_term_id = OLD.child_term_id)
        UNION
        SELECT edge.child_term_id
        FROM taxonomy_term_edges edge
        JOIN descendants current ON edge.parent_term_id = current.id
        WHERE NOT (edge.parent_term_id = OLD.parent_term_id AND edge.child_term_id = OLD.child_term_id)
    )
    SELECT 1 FROM descendants WHERE id = NEW.parent_term_id
)
BEGIN
    SELECT RAISE(ABORT, 'taxonomy relationships must be acyclic');
END;
CREATE TRIGGER taxonomy_term_edges_kind_insert
BEFORE INSERT ON taxonomy_term_edges
WHEN (SELECT kind FROM taxonomy_terms WHERE id = NEW.child_term_id) <> 'subgenre'
BEGIN
    SELECT RAISE(ABORT, 'only a subgenre may have a taxonomy parent');
END;
CREATE TRIGGER taxonomy_term_edges_kind_update
BEFORE UPDATE OF parent_term_id, child_term_id ON taxonomy_term_edges
WHEN (SELECT kind FROM taxonomy_terms WHERE id = NEW.child_term_id) <> 'subgenre'
BEGIN
    SELECT RAISE(ABORT, 'only a subgenre may have a taxonomy parent');
END;
CREATE INDEX taxonomy_term_edges_child_idx ON taxonomy_term_edges(child_term_id, parent_term_id);
CREATE TABLE edition_taxonomy_terms (
    edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE RESTRICT,
    PRIMARY KEY (edition_id, term_id)
);
CREATE INDEX edition_taxonomy_terms_term_idx ON edition_taxonomy_terms(term_id, edition_id);
CREATE TABLE release_taxonomy_terms (
    release_id INTEGER NOT NULL REFERENCES platform_releases(id) ON DELETE CASCADE,
    term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE RESTRICT,
    PRIMARY KEY (release_id, term_id)
);
CREATE TABLE variant_taxonomy_terms (
    variant_id INTEGER NOT NULL REFERENCES release_variants(id) ON DELETE CASCADE,
    term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE RESTRICT,
    PRIMARY KEY (variant_id, term_id)
);

CREATE TABLE personal_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
);
CREATE TABLE edition_personal_tags (
    edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES personal_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (edition_id, tag_id)
);
CREATE INDEX edition_personal_tags_tag_idx ON edition_personal_tags(tag_id, edition_id);

CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE collection_editions (
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, edition_id)
);
CREATE INDEX collection_editions_edition_idx ON collection_editions(edition_id, collection_id);

CREATE TABLE metadata_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    edition_id INTEGER REFERENCES editions(id) ON DELETE CASCADE,
    release_id INTEGER REFERENCES platform_releases(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES release_variants(id) ON DELETE CASCADE,
    installation_id INTEGER REFERENCES installations(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    value_json TEXT NOT NULL CHECK (json_valid(value_json)),
    normalized_value_json TEXT CHECK (normalized_value_json IS NULL OR json_valid(normalized_value_json)),
    source_kind TEXT NOT NULL CHECK (source_kind IN ('manual', 'provider', 'import')),
    source_name TEXT NOT NULL,
    source_record_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (
        (work_id IS NOT NULL) + (edition_id IS NOT NULL) + (release_id IS NOT NULL)
        + (variant_id IS NOT NULL) + (installation_id IS NOT NULL) = 1
    )
);
CREATE INDEX metadata_claims_edition_field_idx ON metadata_claims(edition_id, field_key, created_at);
CREATE INDEX metadata_claims_release_field_idx ON metadata_claims(release_id, field_key, created_at);

CREATE TABLE external_identifiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    edition_id INTEGER REFERENCES editions(id) ON DELETE CASCADE,
    release_id INTEGER REFERENCES platform_releases(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES release_variants(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    external_id TEXT NOT NULL,
    CHECK ((work_id IS NOT NULL) + (edition_id IS NOT NULL) + (release_id IS NOT NULL) + (variant_id IS NOT NULL) = 1),
    UNIQUE (provider, external_id)
);

CREATE TABLE visual_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,
    media_type TEXT NOT NULL CHECK (media_type IN ('cover', 'background', 'banner', 'logo', 'screenshot', 'other')),
    source_kind TEXT NOT NULL CHECK (source_kind IN ('manual', 'provider', 'import', 'generated')),
    source_name TEXT,
    attribution TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE visual_asset_associations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES visual_assets(id) ON DELETE RESTRICT,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    edition_id INTEGER REFERENCES editions(id) ON DELETE CASCADE,
    release_id INTEGER REFERENCES platform_releases(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES release_variants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('cover', 'background', 'banner', 'logo', 'screenshot', 'other')),
    CHECK ((work_id IS NOT NULL) + (edition_id IS NOT NULL) + (release_id IS NOT NULL) + (variant_id IS NOT NULL) = 1)
);
CREATE INDEX visual_asset_associations_edition_role_idx
    ON visual_asset_associations(edition_id, role);
"#;

const CANONICAL_TAXONOMY_SCHEMA: &str = r#"
ALTER TABLE taxonomy_terms
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('canonical', 'pending'));

UPDATE taxonomy_terms
SET stable_key = 'legacy:' || id || ':' || stable_key
WHERE stable_key LIKE 'kiwanto.genre.%'
   OR stable_key LIKE 'kiwanto.subgenre.%';

CREATE INDEX taxonomy_terms_catalog_idx
    ON taxonomy_terms(status, kind, display_name COLLATE NOCASE);

CREATE TABLE taxonomy_term_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_id INTEGER NOT NULL REFERENCES taxonomy_terms(id) ON DELETE CASCADE,
    edition_id INTEGER REFERENCES editions(id) ON DELETE CASCADE,
    raw_value TEXT NOT NULL,
    source_kind TEXT NOT NULL CHECK (source_kind IN ('manual', 'provider', 'import')),
    source_name TEXT NOT NULL,
    source_record_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX taxonomy_term_sources_term_status_idx
    ON taxonomy_term_sources(term_id, status, created_at);

INSERT INTO taxonomy_term_sources
    (term_id, edition_id, raw_value, source_kind, source_name, status)
SELECT term.id, association.edition_id, term.display_name, 'manual',
       'Legacy free-text editor', 'pending'
FROM taxonomy_terms term
LEFT JOIN edition_taxonomy_terms association ON association.term_id = term.id;

UPDATE metadata_claims
SET status = 'pending'
WHERE field_key = 'genres'
  AND source_kind = 'manual'
  AND source_name = 'Kiwanto user';

INSERT INTO taxonomy_terms (stable_key, kind, display_name, status) VALUES
    ('kiwanto.genre.action', 'genre', 'Acción', 'canonical'),
    ('kiwanto.genre.adventure', 'genre', 'Aventura', 'canonical'),
    ('kiwanto.genre.role-playing', 'genre', 'Rol', 'canonical'),
    ('kiwanto.genre.strategy', 'genre', 'Estrategia', 'canonical'),
    ('kiwanto.genre.simulation', 'genre', 'Simulación', 'canonical'),
    ('kiwanto.genre.puzzle', 'genre', 'Puzles', 'canonical'),
    ('kiwanto.genre.platformer', 'genre', 'Plataformas', 'canonical'),
    ('kiwanto.genre.shooter', 'genre', 'Disparos', 'canonical'),
    ('kiwanto.genre.racing', 'genre', 'Carreras', 'canonical'),
    ('kiwanto.genre.sports', 'genre', 'Deportes', 'canonical'),
    ('kiwanto.genre.fighting', 'genre', 'Lucha', 'canonical'),
    ('kiwanto.genre.horror', 'genre', 'Terror', 'canonical'),
    ('kiwanto.genre.survival', 'genre', 'Supervivencia', 'canonical'),
    ('kiwanto.genre.music-rhythm', 'genre', 'Música y ritmo', 'canonical'),
    ('kiwanto.genre.visual-novel', 'genre', 'Novela visual', 'canonical'),
    ('kiwanto.genre.stealth', 'genre', 'Sigilo', 'canonical'),
    ('kiwanto.genre.sandbox', 'genre', 'Sandbox', 'canonical'),
    ('kiwanto.genre.party', 'genre', 'Fiesta y multijugador', 'canonical'),
    ('kiwanto.genre.card-board', 'genre', 'Cartas y tablero', 'canonical'),
    ('kiwanto.subgenre.action-rpg', 'subgenre', 'RPG de acción', 'canonical'),
    ('kiwanto.subgenre.tactical-rpg', 'subgenre', 'RPG táctico', 'canonical'),
    ('kiwanto.subgenre.survival-horror', 'subgenre', 'Terror de supervivencia', 'canonical'),
    ('kiwanto.subgenre.metroidvania', 'subgenre', 'Metroidvania', 'canonical'),
    ('kiwanto.subgenre.graphic-adventure', 'subgenre', 'Aventura gráfica', 'canonical'),
    ('kiwanto.subgenre.roguelike', 'subgenre', 'Roguelike', 'canonical'),
    ('kiwanto.subgenre.city-building', 'subgenre', 'Construcción de ciudades', 'canonical'),
    ('kiwanto.subgenre.racing-simulation', 'subgenre', 'Simulación de carreras', 'canonical'),
    ('kiwanto.subgenre.battle-royale', 'subgenre', 'Battle royale', 'canonical');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.action-rpg'
WHERE parent.stable_key IN ('kiwanto.genre.action', 'kiwanto.genre.role-playing');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.tactical-rpg'
WHERE parent.stable_key IN ('kiwanto.genre.role-playing', 'kiwanto.genre.strategy');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.survival-horror'
WHERE parent.stable_key IN ('kiwanto.genre.horror', 'kiwanto.genre.survival');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.metroidvania'
WHERE parent.stable_key IN (
    'kiwanto.genre.action', 'kiwanto.genre.adventure', 'kiwanto.genre.platformer'
);

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.graphic-adventure'
WHERE parent.stable_key = 'kiwanto.genre.adventure';

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.roguelike'
WHERE parent.stable_key IN ('kiwanto.genre.action', 'kiwanto.genre.role-playing');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.city-building'
WHERE parent.stable_key IN ('kiwanto.genre.strategy', 'kiwanto.genre.simulation');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.racing-simulation'
WHERE parent.stable_key IN ('kiwanto.genre.racing', 'kiwanto.genre.simulation');

INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
SELECT parent.id, child.id
FROM taxonomy_terms parent
JOIN taxonomy_terms child ON child.stable_key = 'kiwanto.subgenre.battle-royale'
WHERE parent.stable_key IN ('kiwanto.genre.shooter', 'kiwanto.genre.survival');
"#;

const GAME_RELATIONS_SCHEMA: &str = r#"
CREATE TABLE game_relations (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 source_edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
 related_edition_id INTEGER NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
 relation_type TEXT NOT NULL CHECK (relation_type IN ('prequel','sequel','spin_off','remake','remaster','other')),
 CHECK (source_edition_id <> related_edition_id),
 UNIQUE(source_edition_id, related_edition_id, relation_type)
);
CREATE INDEX game_relations_related_idx ON game_relations(related_edition_id, source_edition_id);
"#;

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    struct TestDatabase {
        directory: PathBuf,
        path: PathBuf,
        database: LibraryDatabase,
    }

    impl TestDatabase {
        fn new() -> Self {
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("test clock should be after Unix epoch")
                .as_nanos();
            let directory = std::env::temp_dir().join(format!("kiwanto-library-test-{timestamp}"));
            let path = database_path(&directory);
            let database = LibraryDatabase::open(&path);
            Self {
                directory,
                path,
                database,
            }
        }
    }

    impl Drop for TestDatabase {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.directory);
        }
    }

    fn input(title: &str) -> GameInput {
        GameInput {
            title: title.to_string(),
            developer: "Studio".to_string(),
            publisher: "Publisher".to_string(),
            year: Some(2024),
            genre_ids: vec!["kiwanto.genre.adventure".to_string()],
            rating: "PEGI 12".to_string(),
            score: Some(85.0),
            platform: "PC".to_string(),
            systems: vec!["Linux".to_string(), "Windows".to_string()],
            description: "A local library entry".to_string(),
        }
    }

    fn collection_input(name: &str, description: &str) -> CollectionInput {
        CollectionInput {
            name: name.to_string(),
            description: description.to_string(),
        }
    }

    fn launch_profile_input(executable: &str) -> LaunchProfileInput {
        LaunchProfileInput {
            executable_path: executable.to_string(),
            working_directory: None,
            arguments: vec!["argument with spaces".to_string(), "--safe".to_string()],
        }
    }

    fn raw_connection(path: &Path) -> Connection {
        Connection::open(path).expect("test database should open")
    }

    #[test]
    fn initializes_an_empty_database_without_demo_entries() {
        let database = TestDatabase::new();
        assert_eq!(database.database.list(false).unwrap().len(), 0);
        assert!(rusqlite::version_number() >= MINIMUM_SQLITE_VERSION);
        database
            .database
            .with_connection(|connection| {
                let journal_mode: String = connection
                    .pragma_query_value(None, "journal_mode", |row| row.get(0))
                    .map_err(LibraryError::database)?;
                let synchronous: i64 = connection
                    .pragma_query_value(None, "synchronous", |row| row.get(0))
                    .map_err(LibraryError::database)?;
                assert_eq!(journal_mode.to_lowercase(), "wal");
                assert_eq!(synchronous, 2);
                Ok(())
            })
            .unwrap();

        let connection = raw_connection(&database.path);
        let version: i64 = connection
            .pragma_query_value(None, "user_version", |row| row.get(0))
            .unwrap();
        assert_eq!(version, LATEST_SCHEMA_VERSION);
    }

    #[test]
    fn database_is_placed_in_the_application_xdg_subdirectory() {
        assert_eq!(
            database_path(Path::new("/home/test/.local/share")),
            PathBuf::from("/home/test/.local/share/kiwanto/library.sqlite3")
        );
    }

    #[test]
    fn creates_and_recovers_an_entry_after_reopening_the_database() {
        let database = TestDatabase::new();
        let created = database.database.create(input("A New Game")).unwrap();
        let id = created.game.id.clone();
        assert!(created.game.metadata.systems.contains(&"Linux".to_string()));
        assert_eq!(created.game.metadata.platform, "PC");

        let reopened = LibraryDatabase::open(&database.path);
        let entries = reopened.list(false).unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].game.id, id);
        assert_eq!(entries[0].game.metadata.title, "A New Game");
        assert!(!entries[0].state.installed);
    }

    #[test]
    fn edits_entry_and_persists_favorite_state() {
        let database = TestDatabase::new();
        let created = database.database.create(input("Before")).unwrap();
        database
            .database
            .update(&created.game.id, input("After"))
            .unwrap();
        database
            .database
            .set_favorite(&created.game.id, true)
            .unwrap();

        let reopened = LibraryDatabase::open(&database.path);
        let entry = &reopened.list(false).unwrap()[0];
        assert_eq!(entry.game.metadata.title, "After");
        assert!(entry.state.favorite);
    }

    #[test]
    fn archives_and_restores_without_losing_entry_or_favorite() {
        let database = TestDatabase::new();
        let created = database.database.create(input("Archived")).unwrap();
        database.database.create(input("Still active")).unwrap();
        database
            .database
            .set_favorite(&created.game.id, true)
            .unwrap();
        database.database.archive(&created.game.id).unwrap();

        let active = database.database.list(false).unwrap();
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].game.metadata.title, "Still active");
        let archived = database.database.list(true).unwrap();
        assert_eq!(archived.len(), 1);
        assert!(archived[0].state.favorite);

        database.database.restore(&created.game.id).unwrap();
        assert_eq!(database.database.list(false).unwrap().len(), 2);
        assert!(database.database.list(true).unwrap().is_empty());
    }

    #[test]
    fn permanent_deletion_requires_archiving_and_removes_only_database_records() {
        let database = TestDatabase::new();
        let created = database.database.create(input("Remove")).unwrap();
        assert_eq!(
            database
                .database
                .delete_permanently(&created.game.id)
                .unwrap_err()
                .code,
            "validation"
        );
        database.database.archive(&created.game.id).unwrap();
        database
            .database
            .delete_permanently(&created.game.id)
            .unwrap();
        assert!(database.database.list(true).unwrap().is_empty());
    }

    #[test]
    fn rejects_missing_or_invalid_ids() {
        let database = TestDatabase::new();
        assert_eq!(
            database
                .database
                .update("123", input("Missing"))
                .unwrap_err()
                .code,
            "notFound"
        );
        assert_eq!(
            database.database.archive("no-id").unwrap_err().code,
            "validation"
        );
        assert_eq!(
            database.database.restore("123").unwrap_err().code,
            "notFound"
        );
    }

    #[test]
    fn multiline_game_descriptions_preserve_paragraphs_across_reopen_and_edit() {
        let database = TestDatabase::new();
        let mut game_input = input("Paragraphs");
        game_input.description =
            "Opening line\n\nSecond paragraph\n  indented line  \n\nFinal paragraph".to_string();
        let created = database.database.create(game_input.clone()).unwrap();
        let reopened = LibraryDatabase::open(&database.path);
        let loaded = reopened.list(false).unwrap().remove(0);
        assert_eq!(loaded.game.metadata.description, game_input.description);

        let replacement = "First edited paragraph\n\nSecond edited paragraph\n";
        game_input.description = replacement.to_string();
        reopened.update(&created.game.id, game_input).unwrap();
        let after_edit = LibraryDatabase::open(&database.path)
            .list(false)
            .unwrap()
            .remove(0);
        assert_eq!(after_edit.game.metadata.description, replacement);
    }

    #[test]
    fn foreign_keys_are_enabled_and_prevent_cross_edition_profiles() {
        let database = TestDatabase::new();
        let first = database.database.create(input("First")).unwrap();
        let second = database.database.create(input("Second")).unwrap();
        let connection = raw_connection(&database.path);
        let foreign_keys: i64 = connection
            .pragma_query_value(None, "foreign_keys", |row| row.get(0))
            .unwrap();
        assert_eq!(foreign_keys, 1);

        connection.execute("PRAGMA foreign_keys = ON", []).unwrap();
        let first_id = parse_id(&first.game.id).unwrap();
        let second_id = parse_id(&second.game.id).unwrap();
        let second_release: i64 = connection
            .query_row(
                "SELECT id FROM platform_releases WHERE edition_id = ?1",
                [second_id],
                |row| row.get(0),
            )
            .unwrap();
        let result = connection.execute(
            "INSERT INTO launch_profiles (edition_id, release_id, name)
             VALUES (?1, ?2, 'invalid cross-edition profile')",
            params![first_id, second_release],
        );
        assert!(result.is_err());

        let integrity_issues: i64 = connection
            .query_row("SELECT count(*) FROM pragma_foreign_key_check", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(integrity_issues, 0);
    }

    #[test]
    fn taxonomy_relationships_allow_multiple_parents_but_reject_cycles() {
        let database = TestDatabase::new();
        let connection = raw_connection(&database.path);
        connection.execute("PRAGMA foreign_keys = ON", []).unwrap();
        connection
            .execute(
                "INSERT INTO taxonomy_terms (stable_key, kind, display_name)
                 VALUES ('first', 'genre', 'First')",
                [],
            )
            .unwrap();
        let first = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO taxonomy_terms (stable_key, kind, display_name)
                 VALUES ('second', 'subgenre', 'Second')",
                [],
            )
            .unwrap();
        let second = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO taxonomy_terms (stable_key, kind, display_name)
                 VALUES ('third', 'genre', 'Third')",
                [],
            )
            .unwrap();
        let third = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO taxonomy_terms (stable_key, kind, display_name)
                 VALUES ('fourth', 'subgenre', 'Fourth')",
                [],
            )
            .unwrap();
        let fourth = connection.last_insert_rowid();
        assert!(first > 0 && second > 0 && third > 0 && fourth > 0);

        connection
            .execute(
                "INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
                 VALUES (?1, ?2), (?3, ?2), (?2, ?4)",
                params![first, second, third, fourth],
            )
            .unwrap();
        let cycle = connection.execute(
            "INSERT INTO taxonomy_term_edges (parent_term_id, child_term_id)
             VALUES (?1, ?2)",
            params![fourth, second],
        );
        assert!(cycle.is_err());
    }

    #[test]
    fn canonical_genres_can_be_selected_and_recovered_by_stable_id() {
        let database = TestDatabase::new();
        let genres = database.database.list_canonical_genres().unwrap();
        let adventure = genres
            .iter()
            .find(|genre| genre.id == "kiwanto.genre.adventure")
            .unwrap();
        assert_eq!(adventure.display_name, "Aventura");
        assert_eq!(adventure.kind, "genre");
        let metroidvania = genres
            .iter()
            .find(|genre| genre.id == "kiwanto.subgenre.metroidvania")
            .unwrap();
        assert_eq!(metroidvania.parent_ids.len(), 3);

        let created = database.database.create(input("Selected genre")).unwrap();
        assert_eq!(
            created.game.metadata.genre_ids,
            vec!["kiwanto.genre.adventure"]
        );
        assert_eq!(created.game.metadata.genre, vec!["Aventura"]);

        let reopened = LibraryDatabase::open(&database.path);
        assert_eq!(
            reopened.list(false).unwrap()[0].game.metadata.genre_ids,
            vec!["kiwanto.genre.adventure"]
        );
    }

    #[test]
    fn editing_canonical_genres_preserves_legacy_pending_associations() {
        let database = TestDatabase::new();
        let created = database
            .database
            .create(input("Preserve legacy term"))
            .unwrap();
        let edition_id = parse_id(&created.game.id).unwrap();
        let connection = raw_connection(&database.path);
        connection.execute("PRAGMA foreign_keys = ON", []).unwrap();
        connection
            .execute(
                "INSERT INTO taxonomy_terms (stable_key, kind, display_name, status)
                 VALUES ('pending:old-tag', 'genre', 'Old genre', 'pending')",
                [],
            )
            .unwrap();
        let pending_id = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO edition_taxonomy_terms (edition_id, term_id)
                 VALUES (?1, ?2)",
                params![edition_id, pending_id],
            )
            .unwrap();
        drop(connection);

        let mut updated = input("Preserve legacy term");
        updated.genre_ids = vec!["kiwanto.genre.action".to_string()];
        let entry = database.database.update(&created.game.id, updated).unwrap();
        assert_eq!(entry.game.metadata.genre_ids, vec!["kiwanto.genre.action"]);
        assert_eq!(entry.game.metadata.pending_genres, vec!["Old genre"]);
        assert!(entry.game.metadata.genre.contains(&"Old genre".to_string()));
    }

    #[test]
    fn free_text_cannot_create_a_canonical_genre() {
        let database = TestDatabase::new();
        let canonical_count = database.database.list_canonical_genres().unwrap().len();
        let mut game = input("Unknown genre");
        game.genre_ids = vec!["Mystery RPG".to_string()];

        let error = database.database.create(game).unwrap_err();
        assert_eq!(error.code, "validation");
        assert!(database.database.list(false).unwrap().is_empty());
        assert_eq!(
            database.database.list_canonical_genres().unwrap().len(),
            canonical_count
        );
    }

    #[test]
    fn unknown_external_terms_are_pending_with_provenance() {
        let database = TestDatabase::new();
        let created = database.database.create(input("Provider term")).unwrap();
        let stable_id = database
            .database
            .record_pending_taxonomy_term(PendingTaxonomyInput {
                raw_value: "Unmapped genre".to_string(),
                source_kind: "provider".to_string(),
                source_name: "Example metadata source".to_string(),
                source_record_id: Some("record-42".to_string()),
                edition_id: Some(created.game.id.clone()),
            })
            .unwrap();
        let raw_connection = raw_connection(&database.path);

        let (status, raw_value, source_name, source_record_id, source_edition_id): (
            String,
            String,
            String,
            Option<String>,
            Option<i64>,
        ) = raw_connection
            .query_row(
                "SELECT term.status, source.raw_value, source.source_name,
                        source.source_record_id, source.edition_id
                 FROM taxonomy_terms term
                 JOIN taxonomy_term_sources source ON source.term_id = term.id
                 WHERE term.stable_key = ?1",
                [&stable_id],
                |row| {
                    Ok((
                        row.get(0)?,
                        row.get(1)?,
                        row.get(2)?,
                        row.get(3)?,
                        row.get(4)?,
                    ))
                },
            )
            .unwrap();
        assert_eq!(status, "pending");
        assert_eq!(raw_value, "Unmapped genre");
        assert_eq!(source_name, "Example metadata source");
        assert_eq!(source_record_id.as_deref(), Some("record-42"));
        assert_eq!(source_edition_id, Some(parse_id(&created.game.id).unwrap()));
        assert!(database.database.list(false).unwrap()[0]
            .game
            .metadata
            .pending_genres
            .contains(&"Unmapped genre".to_string()));
        assert!(!database
            .database
            .list_canonical_genres()
            .unwrap()
            .iter()
            .any(|genre| genre.id == stable_id));
    }

    #[test]
    fn taxonomy_migration_preserves_existing_associations_as_pending() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch("PRAGMA foreign_keys = ON")
            .unwrap();
        connection.execute_batch(INITIAL_SCHEMA).unwrap();
        connection
            .execute("INSERT INTO editions (title) VALUES ('Legacy entry')", [])
            .unwrap();
        let edition_id = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO taxonomy_terms (stable_key, kind, display_name)
                 VALUES ('adventure', 'genre', 'Adventure')",
                [],
            )
            .unwrap();
        let term_id = connection.last_insert_rowid();
        connection
            .execute(
                "INSERT INTO edition_taxonomy_terms (edition_id, term_id)
                 VALUES (?1, ?2)",
                params![edition_id, term_id],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO metadata_claims
                 (edition_id, field_key, value_json, source_kind, source_name, status)
                 VALUES (?1, 'genres', '[\"Adventure\"]', 'manual', 'Kiwanto user', 'accepted')",
                [edition_id],
            )
            .unwrap();
        connection.pragma_update(None, "user_version", 1).unwrap();

        migrate(&connection).unwrap();

        let (status, key): (String, String) = connection
            .query_row(
                "SELECT status, stable_key FROM taxonomy_terms WHERE id = ?1",
                [term_id],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .unwrap();
        let association_count: i64 = connection
            .query_row(
                "SELECT count(*) FROM edition_taxonomy_terms
                 WHERE edition_id = ?1 AND term_id = ?2",
                params![edition_id, term_id],
                |row| row.get(0),
            )
            .unwrap();
        let source_count: i64 = connection
            .query_row(
                "SELECT count(*) FROM taxonomy_term_sources
                 WHERE term_id = ?1 AND raw_value = 'Adventure' AND status = 'pending'",
                [term_id],
                |row| row.get(0),
            )
            .unwrap();
        let claim_status: String = connection
            .query_row(
                "SELECT status FROM metadata_claims
                 WHERE edition_id = ?1 AND field_key = 'genres'",
                [edition_id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(status, "pending");
        assert_eq!(key, "adventure");
        assert_eq!(association_count, 1);
        assert_eq!(source_count, 1);
        assert_eq!(claim_status, "pending");
    }

    #[test]
    fn personal_tags_remain_independent_from_canonical_genres() {
        let database = TestDatabase::new();
        let connection = raw_connection(&database.path);
        connection.execute("PRAGMA foreign_keys = ON", []).unwrap();
        connection
            .execute("INSERT INTO personal_tags (name) VALUES ('Aventura')", [])
            .unwrap();
        let tag_id = connection.last_insert_rowid();
        let canonical_genre_id: i64 = connection
            .query_row(
                "SELECT id FROM taxonomy_terms
                 WHERE stable_key = 'kiwanto.genre.adventure' AND status = 'canonical'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_ne!(tag_id, canonical_genre_id);
        let tag_count: i64 = connection
            .query_row(
                "SELECT count(*) FROM personal_tags WHERE name = 'Aventura'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(tag_count, 1);
    }

    #[test]
    fn a_failed_write_is_reported_without_partially_creating_an_entry() {
        let database = TestDatabase::new();
        let connection = raw_connection(&database.path);
        connection
            .execute_batch(
                "CREATE TRIGGER reject_test_insert BEFORE INSERT ON editions
                 BEGIN SELECT RAISE(ABORT, 'write rejected for test'); END;",
            )
            .unwrap();
        drop(connection);

        let error = database.database.create(input("Rejected")).unwrap_err();
        assert_eq!(error.code, "integrity");
        assert!(database.database.list(false).unwrap().is_empty());
    }

    #[test]
    fn failed_migration_rolls_back_schema_and_version() {
        let connection = Connection::open_in_memory().unwrap();
        connection
            .execute_batch("PRAGMA foreign_keys = ON")
            .unwrap();
        let migrations = [
            (1, "CREATE TABLE migration_probe (id INTEGER PRIMARY KEY);"),
            (2, "CREATE TABL invalid_syntax (id INTEGER);"),
        ];
        assert!(migrate_with(&connection, &migrations).is_err());
        let version: i64 = connection
            .pragma_query_value(None, "user_version", |row| row.get(0))
            .unwrap();
        let table_count: i64 = connection
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'migration_probe'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(version, 0);
        assert_eq!(table_count, 0);
    }

    #[test]
    fn write_failure_when_database_cannot_be_opened_is_returned_to_callers() {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let directory = std::env::temp_dir().join(format!("kiwanto-not-a-database-{timestamp}"));
        fs::create_dir_all(&directory).unwrap();
        let database = LibraryDatabase::open(&directory);
        assert_eq!(database.list(false).unwrap_err().code, "database");
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn permanent_delete_is_blocked_by_installation_references() {
        let database = TestDatabase::new();
        let created = database.database.create(input("Installed")).unwrap();
        let edition_id = parse_id(&created.game.id).unwrap();
        let connection = raw_connection(&database.path);
        let release_id: i64 = connection
            .query_row(
                "SELECT id FROM platform_releases WHERE edition_id = ?1",
                [edition_id],
                |row| row.get(0),
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO installations (edition_id, release_id, status)
             VALUES (?1, ?2, 'available')",
                params![edition_id, release_id],
            )
            .unwrap();
        drop(connection);
        database.database.archive(&created.game.id).unwrap();
        assert_eq!(
            database
                .database
                .delete_permanently(&created.game.id)
                .unwrap_err()
                .code,
            "integrity"
        );
        assert_eq!(database.database.list(true).unwrap().len(), 1);
    }

    #[test]
    fn collections_create_list_edit_delete_and_persist_without_deleting_games() {
        let database = TestDatabase::new();
        let game = database.database.create(input("Collection game")).unwrap();
        let created = database
            .database
            .create_collection(collection_input("  Weekend  ", "  Co-op games  "))
            .unwrap();
        assert_eq!(created.name, "Weekend");
        assert_eq!(created.description, "Co-op games");
        assert_eq!(created.game_count, 0);
        assert!(database
            .database
            .list_collection_games(&created.id)
            .unwrap()
            .is_empty());

        database
            .database
            .add_game_to_collection(&created.id, &game.game.id)
            .unwrap();
        let updated = database
            .database
            .update_collection(&created.id, collection_input("Friday", "Friends"))
            .unwrap();
        assert_eq!(updated.name, "Friday");
        assert_eq!(updated.description, "Friends");
        assert_eq!(updated.game_count, 1);

        let reopened = LibraryDatabase::open(&database.path);
        let stored = reopened.list_collections().unwrap();
        assert_eq!(stored.len(), 1);
        assert_eq!(stored[0].id, created.id);
        assert_eq!(stored[0].name, "Friday");
        assert_eq!(
            reopened.list_collection_games(&created.id).unwrap().len(),
            1
        );

        reopened.delete_collection(&created.id).unwrap();
        assert!(reopened.list_collections().unwrap().is_empty());
        assert_eq!(reopened.list(false).unwrap().len(), 1);
        reopened
            .with_connection(|connection| {
                verify_foreign_keys(connection)?;
                Ok(())
            })
            .unwrap();
    }

    #[test]
    fn games_can_belong_to_multiple_collections_and_duplicate_adds_are_idempotent() {
        let database = TestDatabase::new();
        let first_game = database.database.create(input("First game")).unwrap();
        let second_game = database.database.create(input("Second game")).unwrap();
        let first_collection = database
            .database
            .create_collection(collection_input("Co-op", ""))
            .unwrap();
        let second_collection = database
            .database
            .create_collection(collection_input("Favorites", "Personal grouping"))
            .unwrap();

        database
            .database
            .add_game_to_collection(&first_collection.id, &first_game.game.id)
            .unwrap();
        database
            .database
            .add_game_to_collection(&first_collection.id, &first_game.game.id)
            .unwrap();
        database
            .database
            .add_game_to_collection(&first_collection.id, &second_game.game.id)
            .unwrap();
        database
            .database
            .add_game_to_collection(&second_collection.id, &first_game.game.id)
            .unwrap();

        let first_members = database
            .database
            .list_collection_games(&first_collection.id)
            .unwrap();
        assert_eq!(first_members.len(), 2);
        assert_eq!(
            database.database.list_collections().unwrap()[0].game_count,
            2
        );
        assert_eq!(
            database
                .database
                .list_collection_games(&second_collection.id)
                .unwrap()[0]
                .game
                .id,
            first_game.game.id
        );

        database
            .database
            .remove_game_from_collection(&first_collection.id, &first_game.game.id)
            .unwrap();
        assert_eq!(
            database
                .database
                .list_collection_games(&first_collection.id)
                .unwrap()[0]
                .game
                .id,
            second_game.game.id
        );
        assert_eq!(database.database.list(false).unwrap().len(), 2);
        assert_eq!(
            database
                .database
                .list_collection_games(&second_collection.id)
                .unwrap()[0]
                .game
                .id,
            first_game.game.id
        );

        let connection = raw_connection(&database.path);
        let association_count: i64 = connection
            .query_row("SELECT count(*) FROM collection_editions", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(association_count, 2);
    }

    #[test]
    fn collection_names_are_required_and_unique_without_case_sensitivity() {
        let database = TestDatabase::new();
        assert_eq!(
            database
                .database
                .create_collection(collection_input("  ", ""))
                .unwrap_err()
                .code,
            "validation"
        );
        database
            .database
            .create_collection(collection_input("Arcade", ""))
            .unwrap();
        assert_eq!(
            database
                .database
                .create_collection(collection_input("arcade", ""))
                .unwrap_err()
                .code,
            "integrity"
        );
        assert_eq!(database.database.list_collections().unwrap().len(), 1);
    }

    #[test]
    fn collections_reject_missing_games_and_report_empty_membership_consistently() {
        let database = TestDatabase::new();
        let collection = database
            .database
            .create_collection(collection_input("Empty", ""))
            .unwrap();
        assert_eq!(collection.game_count, 0);
        assert!(database
            .database
            .list_collection_games(&collection.id)
            .unwrap()
            .is_empty());
        assert_eq!(
            database
                .database
                .add_game_to_collection(&collection.id, "999999")
                .unwrap_err()
                .code,
            "notFound"
        );
        database
            .database
            .with_connection(|connection| {
                verify_foreign_keys(connection)?;
                Ok(())
            })
            .unwrap();
    }

    #[test]
    fn local_launch_profile_persists_and_launches_without_a_shell() {
        let database = TestDatabase::new();
        let game = database.database.create(input("Launch test")).unwrap();
        let executable = if cfg!(target_os = "linux") {
            "/bin/true"
        } else {
            return;
        };
        if !Path::new(executable).exists() {
            return;
        }
        let saved = database
            .database
            .save_launch_profile(&game.game.id, launch_profile_input(executable))
            .unwrap();
        assert_eq!(saved.arguments, vec!["argument with spaces", "--safe"]);

        let reopened = LibraryDatabase::open(&database.path);
        let loaded = reopened
            .get_launch_profile(&game.game.id)
            .unwrap()
            .expect("saved profile should persist");
        assert_eq!(loaded.executable_path, saved.executable_path);
        assert_eq!(loaded.arguments, saved.arguments);

        let result = reopened.launch_game(&game.game.id).unwrap();
        assert!(result.process_id > 0);
    }

    #[test]
    fn launch_requires_a_profile_and_rejects_non_executable_files() {
        let database = TestDatabase::new();
        let game = database
            .database
            .create(input("Unconfigured launch"))
            .unwrap();
        assert_eq!(
            database
                .database
                .launch_game(&game.game.id)
                .unwrap_err()
                .code,
            "notReady"
        );

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let plain_file = database.directory.join("not-executable");
            fs::write(&plain_file, "not executable").unwrap();
            fs::set_permissions(&plain_file, fs::Permissions::from_mode(0o600)).unwrap();
            let error = database
                .database
                .save_launch_profile(
                    &game.game.id,
                    launch_profile_input(plain_file.to_str().unwrap()),
                )
                .unwrap_err();
            assert_eq!(error.code, "validation");
        }
    }

    #[test]
    fn relations_persist_are_unique_and_do_not_delete_games() {
        let database = TestDatabase::new();
        let first = database.database.create(input("First")).unwrap();
        let second = database.database.create(input("Second")).unwrap();
        let _relation = database
            .database
            .add_game_relation(
                &first.game.id,
                GameRelationInput {
                    related_game_id: second.game.id.clone(),
                    relation_type: GameRelationType::Sequel,
                },
            )
            .unwrap();
        assert_eq!(
            database
                .database
                .list_game_relations(&first.game.id)
                .unwrap()
                .len(),
            1
        );
        assert_eq!(
            database
                .database
                .add_game_relation(
                    &first.game.id,
                    GameRelationInput {
                        related_game_id: second.game.id.clone(),
                        relation_type: GameRelationType::Sequel
                    }
                )
                .unwrap_err()
                .code,
            "integrity"
        );
        let replaced = database
            .database
            .replace_game_relations(
                &first.game.id,
                vec![GameRelationInput {
                    related_game_id: second.game.id.clone(),
                    relation_type: GameRelationType::Prequel,
                }],
            )
            .unwrap();
        assert_eq!(replaced.len(), 1);
        assert!(matches!(
            replaced[0].relation_type,
            GameRelationType::Prequel
        ));
        assert!(database
            .database
            .replace_game_relations(
                &first.game.id,
                vec![GameRelationInput {
                    related_game_id: first.game.id.clone(),
                    relation_type: GameRelationType::Other
                }]
            )
            .is_err());
        assert_eq!(
            database
                .database
                .list_game_relations(&first.game.id)
                .unwrap()
                .len(),
            1,
            "failed relationship edits must roll back"
        );
        database
            .database
            .remove_game_relation(&first.game.id, &replaced[0].id)
            .unwrap();
        assert!(database
            .database
            .list_game_relations(&first.game.id)
            .unwrap()
            .is_empty());
        assert!(database
            .database
            .list(false)
            .unwrap()
            .iter()
            .any(|entry| entry.game.id == second.game.id));
        assert_eq!(
            database
                .database
                .add_game_relation(
                    &first.game.id,
                    GameRelationInput {
                        related_game_id: first.game.id.clone(),
                        relation_type: GameRelationType::Other
                    }
                )
                .unwrap_err()
                .code,
            "validation"
        );
        drop(database);
    }

    #[test]
    fn schema_version_two_database_receives_the_relations_migration() {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let directory = std::env::temp_dir().join(format!("kiwanto-migration-test-{timestamp}"));
        fs::create_dir_all(&directory).unwrap();
        let path = database_path(&directory);
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        let connection = Connection::open(&path).unwrap();
        migrate_with(
            &connection,
            &[(1, INITIAL_SCHEMA), (2, CANONICAL_TAXONOMY_SCHEMA)],
        )
        .unwrap();
        drop(connection);
        let upgraded = LibraryDatabase::open(&path);
        upgraded.with_connection(|connection| {
            let version: i64 = connection.pragma_query_value(None, "user_version", |row| row.get(0)).map_err(LibraryError::database)?;
            let table_count: i64 = connection.query_row("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='game_relations'", [], |row| row.get(0)).map_err(LibraryError::database)?;
            assert_eq!(version, 3);
            assert_eq!(table_count, 1);
            Ok(())
        }).unwrap();
        fs::remove_dir_all(directory).unwrap();
    }
}
