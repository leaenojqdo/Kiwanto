mod library;
mod user_preferences;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::Manager;

            let database = match app.path().data_dir() {
                Ok(data_directory) => {
                    library::LibraryDatabase::open(&library::database_path(&data_directory))
                }
                Err(error) => library::LibraryDatabase::failed(format!(
                    "Could not resolve the XDG data directory: {error}"
                )),
            };
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            library::list_library,
            library::list_canonical_genres,
            library::record_pending_taxonomy_term,
            library::create_library_entry,
            library::update_library_entry,
            library::set_library_favorite,
            library::archive_library_entry,
            library::restore_library_entry,
            library::delete_library_entry_permanently,
            library::list_collections,
            library::list_collection_games,
            library::create_collection,
            library::update_collection,
            library::delete_collection,
            library::add_game_to_collection,
            library::remove_game_from_collection,
            library::get_launch_profile,
            library::save_launch_profile,
            library::launch_game,
            library::list_game_relations,
            library::add_game_relation,
            library::remove_game_relation,
            library::replace_game_relations,
            library::list_game_collections,
            user_preferences::load_user_preferences,
            user_preferences::save_user_preferences,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Kiwanto");
}
