import type { Game } from "./models";

export function selectVisibleGame(
  visibleGames: readonly Game[],
  selectedGameId: string | null,
): Game | null {
  return (
    visibleGames.find((game) => game.id === selectedGameId) ??
    visibleGames[0] ??
    null
  );
}
