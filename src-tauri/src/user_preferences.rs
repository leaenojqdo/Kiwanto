use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const PREFERENCES_FILE: &str = "preferences.json";
const PREFERENCES_SCHEMA_VERSION: u32 = 2;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BigPicturePreferences {
    pub interface_scale: u8,
    pub cover_orientation: String,
    pub cover_size: String,
    pub density: String,
}
impl Default for BigPicturePreferences {
    fn default() -> Self {
        Self {
            interface_scale: 100,
            cover_orientation: "portrait".into(),
            cover_size: "medium".into(),
            density: "comfortable".into(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThemeId {
    #[serde(rename = "kiwanto-dark")]
    KiwantoDark,
    #[serde(rename = "kiwanto-light")]
    KiwantoLight,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPreferences {
    pub schema_version: u32,
    pub theme_id: ThemeId,
    #[serde(default)]
    pub big_picture: BigPicturePreferences,
}

impl Default for UserPreferences {
    fn default() -> Self {
        Self {
            schema_version: PREFERENCES_SCHEMA_VERSION,
            theme_id: ThemeId::KiwantoDark,
            big_picture: BigPicturePreferences::default(),
        }
    }
}

impl UserPreferences {
    fn validate(&self) -> Result<(), String> {
        if self.schema_version != 1 && self.schema_version != PREFERENCES_SCHEMA_VERSION {
            return Err(format!(
                "Unsupported preferences schema version: {}",
                self.schema_version
            ));
        }
        if ![80, 90, 100, 110, 120].contains(&self.big_picture.interface_scale)
            || !["portrait", "landscape"].contains(&self.big_picture.cover_orientation.as_str())
            || !["small", "medium", "large"].contains(&self.big_picture.cover_size.as_str())
            || !["compact", "comfortable"].contains(&self.big_picture.density.as_str())
        {
            return Err("Big Picture preferences contain an unsupported value.".to_string());
        }
        Ok(())
    }
}

fn preferences_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .config_dir()
        .map(|directory| directory.join("kiwanto").join(PREFERENCES_FILE))
        .map_err(|error| format!("Could not resolve the application config directory: {error}"))
}

fn legacy_preferences_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|directory| directory.join(PREFERENCES_FILE))
        .map_err(|error| format!("Could not resolve the legacy preferences directory: {error}"))
}

fn parse_preferences(contents: &str) -> Result<UserPreferences, String> {
    let mut preferences: UserPreferences = serde_json::from_str(contents)
        .map_err(|error| format!("Could not parse preferences: {error}"))?;
    preferences.validate()?;
    preferences.schema_version = PREFERENCES_SCHEMA_VERSION;
    Ok(preferences)
}

fn read_preferences(path: &Path) -> Result<UserPreferences, String> {
    match fs::read_to_string(path) {
        Ok(contents) => parse_preferences(&contents),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            Ok(UserPreferences::default())
        }
        Err(error) => Err(format!("Could not read preferences: {error}")),
    }
}

fn read_preferences_with_migration(
    path: &Path,
    legacy_path: &Path,
) -> Result<UserPreferences, String> {
    if path == legacy_path {
        return read_preferences(path);
    }

    let current_contents = read_optional_file(path, "preferences")?;
    let legacy_contents = read_optional_file(legacy_path, "legacy preferences")?;

    match (current_contents, legacy_contents) {
        (Some(current), Some(legacy)) => {
            let current_preferences = parse_preferences(&current)?;
            let legacy_preferences = parse_preferences(&legacy)?;
            if current_preferences != legacy_preferences {
                return Err(
                    "Current and legacy preferences differ. Resolve the conflict without deleting either file."
                        .to_string(),
                );
            }
            remove_legacy_preferences(legacy_path)?;
            Ok(current_preferences)
        }
        (Some(current), None) => parse_preferences(&current),
        (None, Some(legacy)) => {
            let preferences = parse_preferences(&legacy)?;
            match write_preferences_without_replacing(path, &preferences) {
                Ok(()) => {
                    remove_legacy_preferences(legacy_path)?;
                    Ok(preferences)
                }
                Err(error) if path.exists() => {
                    read_preferences_with_migration(path, legacy_path).map_err(|migration_error| {
                        format!(
                            "Could not safely migrate legacy preferences ({error}): {migration_error}"
                        )
                    })
                }
                Err(error) => Err(error),
            }
        }
        (None, None) => Ok(UserPreferences::default()),
    }
}

fn read_optional_file(path: &Path, label: &str) -> Result<Option<String>, String> {
    match fs::read_to_string(path) {
        Ok(contents) => Ok(Some(contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("Could not read {label}: {error}")),
    }
}

fn remove_legacy_preferences(path: &Path) -> Result<(), String> {
    match fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(format!(
            "Could not remove migrated legacy preferences: {error}"
        )),
    }
}

fn write_preferences(path: &Path, preferences: &UserPreferences) -> Result<(), String> {
    preferences.validate()?;
    let temporary_path = write_temporary_preferences(path, preferences)?;
    if let Err(error) = fs::rename(&temporary_path, path) {
        let _ = fs::remove_file(&temporary_path);
        return Err(format!("Could not replace preferences: {error}"));
    }
    Ok(())
}

fn write_preferences_without_replacing(
    path: &Path,
    preferences: &UserPreferences,
) -> Result<(), String> {
    preferences.validate()?;
    let temporary_path = write_temporary_preferences(path, preferences)?;
    if let Err(error) = fs::hard_link(&temporary_path, path) {
        let _ = fs::remove_file(&temporary_path);
        return Err(format!(
            "Could not safely create migrated preferences without replacing an existing file: {error}"
        ));
    }
    fs::remove_file(&temporary_path)
        .map_err(|error| format!("Could not clean up temporary preferences: {error}"))?;
    Ok(())
}

fn write_temporary_preferences(
    path: &Path,
    preferences: &UserPreferences,
) -> Result<PathBuf, String> {
    let directory = path
        .parent()
        .ok_or_else(|| "Preferences path has no parent directory".to_string())?;
    fs::create_dir_all(directory)
        .map_err(|error| format!("Could not create the preferences directory: {error}"))?;

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("System clock is before the Unix epoch: {error}"))?
        .as_nanos();
    let temporary_path = directory.join(format!(".preferences-{timestamp}.tmp"));
    let contents = serde_json::to_vec_pretty(preferences)
        .map_err(|error| format!("Could not serialize preferences: {error}"))?;
    let mut temporary_file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temporary_path)
        .map_err(|error| format!("Could not create temporary preferences: {error}"))?;
    if let Err(error) = temporary_file
        .write_all(&contents)
        .and_then(|()| temporary_file.sync_all())
    {
        drop(temporary_file);
        let _ = fs::remove_file(&temporary_path);
        return Err(format!("Could not write temporary preferences: {error}"));
    }
    Ok(temporary_path)
}

#[tauri::command]
pub fn load_user_preferences(app: AppHandle) -> Result<UserPreferences, String> {
    read_preferences_with_migration(&preferences_path(&app)?, &legacy_preferences_path(&app)?)
}

#[tauri::command]
pub fn save_user_preferences(
    app: AppHandle,
    preferences: UserPreferences,
) -> Result<UserPreferences, String> {
    preferences.validate()?;
    let path = preferences_path(&app)?;
    let legacy_path = legacy_preferences_path(&app)?;
    read_preferences_with_migration(&path, &legacy_path)?;
    write_preferences(&path, &preferences)?;
    Ok(preferences)
}

#[cfg(test)]
mod tests {
    use super::{
        read_preferences, read_preferences_with_migration, write_preferences,
        BigPicturePreferences, ThemeId, UserPreferences,
    };
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn test_preferences_path() -> PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("test clock should be after Unix epoch")
            .as_nanos();
        std::env::temp_dir()
            .join(format!("kiwanto-preferences-test-{timestamp}"))
            .join("preferences.json")
    }

    #[test]
    fn missing_file_returns_defaults_and_saved_preferences_round_trip() {
        let path = test_preferences_path();
        assert_eq!(read_preferences(&path).unwrap(), UserPreferences::default());

        let preferences = UserPreferences {
            schema_version: 2,
            theme_id: ThemeId::KiwantoLight,
            big_picture: BigPicturePreferences::default(),
        };
        write_preferences(&path, &preferences).unwrap();
        assert_eq!(read_preferences(&path).unwrap(), preferences);

        fs::remove_dir_all(path.parent().unwrap()).unwrap();
    }

    #[test]
    fn unsupported_schema_version_is_rejected() {
        let path = test_preferences_path();
        let invalid = UserPreferences {
            schema_version: 3,
            theme_id: ThemeId::KiwantoDark,
            big_picture: BigPicturePreferences::default(),
        };

        assert!(write_preferences(&path, &invalid).is_err());
        assert!(read_preferences(&path)
            .unwrap()
            .eq(&UserPreferences::default()));
    }

    #[test]
    fn version_one_preferences_migrate_with_big_picture_defaults() {
        let migrated =
            super::parse_preferences(r#"{"schemaVersion":1,"themeId":"kiwanto-light"}"#).unwrap();
        assert_eq!(migrated.schema_version, 2);
        assert_eq!(migrated.theme_id, ThemeId::KiwantoLight);
        assert_eq!(migrated.big_picture, BigPicturePreferences::default());
    }

    #[test]
    fn only_legacy_preferences_are_migrated() {
        let current_path = test_preferences_path();
        let legacy_path = current_path
            .parent()
            .unwrap()
            .join("legacy")
            .join("preferences.json");
        let preferences = UserPreferences {
            schema_version: 2,
            theme_id: ThemeId::KiwantoLight,
            big_picture: BigPicturePreferences::default(),
        };
        write_preferences(&legacy_path, &preferences).unwrap();

        assert_eq!(
            read_preferences_with_migration(&current_path, &legacy_path).unwrap(),
            preferences
        );
        assert_eq!(read_preferences(&current_path).unwrap(), preferences);
        assert!(!legacy_path.exists());

        fs::remove_dir_all(current_path.parent().unwrap()).unwrap();
    }

    #[test]
    fn only_current_preferences_are_used() {
        let current_path = test_preferences_path();
        let legacy_path = current_path
            .parent()
            .unwrap()
            .join("legacy")
            .join("preferences.json");
        let preferences = UserPreferences {
            schema_version: 2,
            theme_id: ThemeId::KiwantoLight,
            big_picture: BigPicturePreferences::default(),
        };
        write_preferences(&current_path, &preferences).unwrap();

        assert_eq!(
            read_preferences_with_migration(&current_path, &legacy_path).unwrap(),
            preferences
        );
        assert!(current_path.exists());
        assert!(!legacy_path.exists());

        fs::remove_dir_all(current_path.parent().unwrap()).unwrap();
    }

    #[test]
    fn equivalent_preferences_in_both_locations_are_resolved_without_loss() {
        let current_path = test_preferences_path();
        let legacy_path = current_path
            .parent()
            .unwrap()
            .join("legacy")
            .join("preferences.json");
        let preferences = UserPreferences {
            schema_version: 2,
            theme_id: ThemeId::KiwantoLight,
            big_picture: BigPicturePreferences::default(),
        };
        write_preferences(&current_path, &preferences).unwrap();
        write_preferences(&legacy_path, &preferences).unwrap();
        fs::write(
            &legacy_path,
            r#"{"schemaVersion":1,"themeId":"kiwanto-light"}"#,
        )
        .unwrap();

        assert_eq!(
            read_preferences_with_migration(&current_path, &legacy_path).unwrap(),
            preferences
        );
        assert_eq!(read_preferences(&current_path).unwrap(), preferences);
        assert!(!legacy_path.exists());

        fs::remove_dir_all(current_path.parent().unwrap()).unwrap();
    }

    #[test]
    fn differing_preferences_are_preserved_and_reported_as_a_conflict() {
        let current_path = test_preferences_path();
        let legacy_path = current_path
            .parent()
            .unwrap()
            .join("legacy")
            .join("preferences.json");
        let current = UserPreferences::default();
        let legacy = UserPreferences {
            schema_version: 2,
            theme_id: ThemeId::KiwantoLight,
            big_picture: BigPicturePreferences::default(),
        };
        write_preferences(&current_path, &current).unwrap();
        write_preferences(&legacy_path, &legacy).unwrap();

        assert!(read_preferences_with_migration(&current_path, &legacy_path)
            .unwrap_err()
            .contains("Resolve the conflict"));
        assert_eq!(read_preferences(&current_path).unwrap(), current);
        assert_eq!(read_preferences(&legacy_path).unwrap(), legacy);

        fs::remove_dir_all(current_path.parent().unwrap()).unwrap();
    }

    #[test]
    fn failed_migration_preserves_the_legacy_file_and_does_not_leave_a_partial_target() {
        let root = test_preferences_path().parent().unwrap().to_path_buf();
        fs::create_dir_all(&root).unwrap();
        let current_parent = root.join("blocked");
        fs::write(&current_parent, "not a directory").unwrap();
        let current_path = current_parent.join("preferences.json");
        let legacy_path = root.join("legacy").join("preferences.json");
        let legacy = UserPreferences {
            schema_version: 2,
            theme_id: ThemeId::KiwantoLight,
            big_picture: BigPicturePreferences::default(),
        };
        write_preferences(&legacy_path, &legacy).unwrap();
        let legacy_contents = fs::read(&legacy_path).unwrap();

        assert!(read_preferences_with_migration(&current_path, &legacy_path).is_err());
        assert!(!current_path.exists());
        assert_eq!(fs::read(&legacy_path).unwrap(), legacy_contents);

        fs::remove_dir_all(root).unwrap();
    }
}
