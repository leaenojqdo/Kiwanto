import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Game } from "./models";

export interface CanonicalGenre {
  id: string;
  displayName: string;
  kind: "genre" | "subgenre";
  parentIds: string[];
}

export interface GameInput {
  title: string;
  developer: string;
  publisher: string;
  year: number | null;
  genreIds: string[];
  rating: string;
  score: number | null;
  platform: string;
  systems: string[];
  description: string;
}

export interface LibraryEntry {
  game: Game;
  state: {
    installed: boolean;
    favorite: boolean;
  };
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string;
  gameCount: number;
}

export interface CollectionInput {
  name: string;
  description: string;
}

export interface LaunchProfile {
  executablePath: string;
  workingDirectory: string | null;
  arguments: string[];
}

export interface LaunchProfileInput extends LaunchProfile {}

export interface LaunchResult {
  processId: number;
}

export type GameRelationType = "prequel" | "sequel" | "spin_off" | "remake" | "remaster" | "other";
export interface GameRelation { id: string; relatedGame: Game; relationType: GameRelationType }

function requireDesktopRuntime() {
  if (!isTauri()) {
    throw new Error(
      "La biblioteca persistente solo está disponible en la aplicación de escritorio de Kiwanto.",
    );
  }
}

export async function listLibrary(
  archivedOnly = false,
): Promise<LibraryEntry[]> {
  requireDesktopRuntime();
  return invoke<LibraryEntry[]>("list_library", { archivedOnly });
}

export async function listCanonicalGenres(): Promise<CanonicalGenre[]> {
  requireDesktopRuntime();
  return invoke<CanonicalGenre[]>("list_canonical_genres");
}

export async function createLibraryEntry(
  input: GameInput,
): Promise<LibraryEntry> {
  requireDesktopRuntime();
  return invoke<LibraryEntry>("create_library_entry", { input });
}

export async function updateLibraryEntry(
  id: string,
  input: GameInput,
): Promise<LibraryEntry> {
  requireDesktopRuntime();
  return invoke<LibraryEntry>("update_library_entry", { id, input });
}

export async function setLibraryFavorite(
  id: string,
  favorite: boolean,
): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("set_library_favorite", { id, favorite });
}

export async function archiveLibraryEntry(id: string): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("archive_library_entry", { id });
}

export async function restoreLibraryEntry(id: string): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("restore_library_entry", { id });
}

export async function deleteLibraryEntryPermanently(id: string): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("delete_library_entry_permanently", { id });
}

export async function listCollections(): Promise<CollectionSummary[]> {
  requireDesktopRuntime();
  return invoke<CollectionSummary[]>("list_collections");
}

export async function listCollectionGames(id: string): Promise<LibraryEntry[]> {
  requireDesktopRuntime();
  return invoke<LibraryEntry[]>("list_collection_games", { collectionId: id });
}

export async function createCollection(
  input: CollectionInput,
): Promise<CollectionSummary> {
  requireDesktopRuntime();
  return invoke<CollectionSummary>("create_collection", { input });
}

export async function updateCollection(
  id: string,
  input: CollectionInput,
): Promise<CollectionSummary> {
  requireDesktopRuntime();
  return invoke<CollectionSummary>("update_collection", { id, input });
}

export async function deleteCollection(id: string): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("delete_collection", { id });
}

export async function addGameToCollection(
  collectionId: string,
  gameId: string,
): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("add_game_to_collection", { collectionId, gameId });
}

export async function removeGameFromCollection(
  collectionId: string,
  gameId: string,
): Promise<void> {
  requireDesktopRuntime();
  await invoke<void>("remove_game_from_collection", { collectionId, gameId });
}

export async function getLaunchProfile(editionId: string): Promise<LaunchProfile | null> {
  requireDesktopRuntime();
  return invoke<LaunchProfile | null>("get_launch_profile", { editionId });
}

export async function saveLaunchProfile(
  editionId: string,
  input: LaunchProfileInput,
): Promise<LaunchProfile> {
  requireDesktopRuntime();
  return invoke<LaunchProfile>("save_launch_profile", { editionId, input });
}

export async function launchGame(editionId: string): Promise<LaunchResult> {
  requireDesktopRuntime();
  return invoke<LaunchResult>("launch_game", { editionId });
}

export async function listGameRelations(editionId: string): Promise<GameRelation[]> { requireDesktopRuntime(); return invoke<GameRelation[]>("list_game_relations", { editionId }); }
export async function addGameRelation(editionId: string, relatedGameId: string, relationType: GameRelationType): Promise<GameRelation> { requireDesktopRuntime(); return invoke<GameRelation>("add_game_relation", { editionId, input: { relatedGameId, relationType } }); }
export async function removeGameRelation(editionId: string, relationId: string): Promise<void> { requireDesktopRuntime(); await invoke<void>("remove_game_relation", { editionId, relationId }); }
export async function replaceGameRelations(editionId: string, relations: Array<{ relatedGameId: string; relationType: GameRelationType }>): Promise<GameRelation[]> { requireDesktopRuntime(); return invoke<GameRelation[]>("replace_game_relations", { editionId, relations }); }
export async function listGameCollections(editionId: string): Promise<CollectionSummary[]> { requireDesktopRuntime(); return invoke<CollectionSummary[]>("list_game_collections", { editionId }); }
