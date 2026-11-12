import type { GameLibraryStates } from "./models";

export function toggleGameFavorite(
  gameStates: GameLibraryStates,
  gameId: string,
): GameLibraryStates {
  const state = gameStates[gameId];
  if (!state) {
    throw new Error(`Cannot toggle favorite for unknown game "${gameId}".`);
  }

  return {
    ...gameStates,
    [gameId]: { ...state, favorite: !state.favorite },
  };
}
