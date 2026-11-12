import type { Game, GameLibraryState, GameLibraryStates } from "./models";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

const aliases: Record<
  string,
  (game: Game, state: GameLibraryState) => boolean
> = {
  aventura: (game) => game.metadata.genre.some((genre) => normalize(genre).includes("aventura")),
  terror: (game) => game.metadata.genre.some((genre) => normalize(genre).includes("terror")),
  linux: (game) => game.metadata.systems.some((system) => normalize(system) === "linux"),
  windows: (game) => game.metadata.systems.some((system) => normalize(system) === "windows"),
  favoritos: (_game, state) => state.favorite,
  instalados: (_game, state) => state.installed,
  instalado: (_game, state) => state.installed,
  "no-instalados": (_game, state) => !state.installed,
};

function matchesCommand(game: Game, state: GameLibraryState, command: string) {
  const knownFilter = aliases[command];
  if (knownFilter) return knownFilter(game, state);

  const normalizedCommand = normalize(command);
  return [
    ...game.metadata.genre,
    game.metadata.platform,
    ...game.metadata.systems,
  ].some((value) => normalize(value).includes(normalizedCommand));
}

export function matchesSearch(
  game: Game,
  state: GameLibraryState,
  query: string,
  favoritesOnly = false,
) {
  if (favoritesOnly && !state.favorite) return false;

  const commands = [...query.matchAll(/@([^\s@]+)/gu)].map((match) =>
    normalize(match[1]),
  );
  const text = normalize(query.replace(/@[^\s@]+/gu, " ").trim());

  if (text && !normalize(game.metadata.title).includes(text)) return false;
  return commands.every((command) => matchesCommand(game, state, command));
}

export function filterGames(
  games: readonly Game[],
  gameStates: GameLibraryStates,
  query: string,
  favoritesOnly = false,
) {
  return games.filter((game) =>
    matchesSearch(game, gameStates[game.id], query, favoritesOnly),
  );
}
