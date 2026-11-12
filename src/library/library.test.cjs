const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  module._compile(outputText, filename);
};

const { toggleGameFavorite } = require("./operations.ts");
const { filterGames } = require("./search.ts");
const { selectVisibleGame } = require("./selectors.ts");

const games = [
  {
    id: "emberlight",
    metadata: {
      title: "Emberlight",
      genre: ["Aventura", "Rol"],
      platform: "Linux",
      systems: ["Linux", "Windows"],
    },
  },
  {
    id: "glasshouse",
    metadata: {
      title: "The Glasshouse",
      genre: ["Puzles", "Aventura"],
      platform: "Linux",
      systems: ["Linux", "Windows"],
    },
  },
  {
    id: "far-harbor",
    metadata: {
      title: "Far Harbor Letters",
      genre: ["Aventura", "Narrativa"],
      platform: "Linux",
      systems: ["Linux", "Windows"],
    },
  },
  {
    id: "northstar",
    metadata: {
      title: "Northstar Drift",
      genre: ["Carreras", "Arcade"],
      platform: "Linux",
      systems: ["Linux"],
    },
  },
];

const initialStates = {
  emberlight: { installed: true, favorite: true },
  glasshouse: { installed: false, favorite: true },
  "far-harbor": { installed: true, favorite: false },
  northstar: { installed: true, favorite: false },
};

test("filters by title text and the existing search commands", () => {
  assert.deepEqual(
    filterGames(games, initialStates, "ember"),
    games.filter((game) => game.id === "emberlight"),
  );
  assert.deepEqual(
    filterGames(games, initialStates, "@linux @aventura"),
    games.filter((game) =>
      ["emberlight", "glasshouse", "far-harbor"].includes(game.id),
    ),
  );
  assert.deepEqual(
    filterGames(games, initialStates, "@instalados"),
    games.filter((game) => initialStates[game.id].installed),
  );
  assert.deepEqual(
    filterGames(games, initialStates, "@favoritos"),
    games.filter((game) => initialStates[game.id].favorite),
  );
});

test("keeps a visible selection and otherwise selects the first visible game", () => {
  const visibleGames = games.filter((game) =>
    ["glasshouse", "far-harbor"].includes(game.id),
  );

  assert.equal(selectVisibleGame(visibleGames, "far-harbor")?.id, "far-harbor");
  assert.equal(selectVisibleGame(visibleGames, "emberlight")?.id, "glasshouse");
  assert.equal(selectVisibleGame([], "emberlight"), null);
});

test("toggles favorites immutably and updates favorite-filter results", () => {
  const wasFavorite = initialStates.emberlight.favorite;
  const withoutFavorite = toggleGameFavorite(initialStates, "emberlight");
  assert.equal(withoutFavorite.emberlight.favorite, !wasFavorite);
  assert.equal(
    withoutFavorite.emberlight.installed,
    initialStates.emberlight.installed,
  );
  assert.equal(initialStates.emberlight.favorite, wasFavorite);

  const favoriteResults = filterGames(
    games,
    withoutFavorite,
    "",
    true,
  );
  assert.equal(favoriteResults.some((game) => game.id === "emberlight"), false);
  assert.equal(
    selectVisibleGame(favoriteResults, "emberlight")?.id,
    favoriteResults[0]?.id,
  );

  const restored = toggleGameFavorite(withoutFavorite, "emberlight");
  assert.equal(restored.emberlight.favorite, wasFavorite);
  assert.equal(
    filterGames(games, restored, "", true).some(
      (game) => game.id === "emberlight",
    ),
    wasFavorite,
  );
});

test("clears selection on empty results and restores a valid selection when cleared", () => {
  const results = filterGames(games, initialStates, "no existe");
  assert.deepEqual(results, []);
  assert.equal(selectVisibleGame(results, "emberlight"), null);

  const allGames = filterGames(games, initialStates, "");
  assert.equal(selectVisibleGame(allGames, null)?.id, "emberlight");
});
