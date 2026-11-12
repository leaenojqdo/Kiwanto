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

const {
  createGenreSelectorState,
  filterCanonicalGenres,
  genreSelectorReducer,
} = require("./genreSelector.ts");

const genres = [
  { id: "kiwanto.genre.action", displayName: "Acción", kind: "genre", parentIds: [] },
  { id: "kiwanto.genre.adventure", displayName: "Aventura", kind: "genre", parentIds: [] },
  {
    id: "kiwanto.subgenre.metroidvania",
    displayName: "Metroidvania",
    kind: "subgenre",
    parentIds: ["kiwanto.genre.action", "kiwanto.genre.adventure"],
  },
];

test("opens and closes the genre selector", () => {
  let state = createGenreSelectorState([]);
  state = genreSelectorReducer(state, { type: "open" });
  assert.equal(state.open, true);
  state = genreSelectorReducer(state, { type: "close" });
  assert.equal(state.open, false);
  assert.equal(state.query, "");
});

test("search filters genre names without case or accent sensitivity", () => {
  assert.deepEqual(
    filterCanonicalGenres(genres, "ACCION").map((genre) => genre.id),
    ["kiwanto.genre.action"],
  );
  assert.deepEqual(
    filterCanonicalGenres(genres, "metro").map((genre) => genre.id),
    ["kiwanto.subgenre.metroidvania"],
  );
  assert.deepEqual(filterCanonicalGenres(genres, "no existe"), []);
});

test("selects several genres without closing and removes a selected genre", () => {
  let state = genreSelectorReducer(createGenreSelectorState([]), {
    type: "open",
  });
  state = genreSelectorReducer(state, {
    type: "toggle",
    id: "kiwanto.genre.action",
  });
  state = genreSelectorReducer(state, {
    type: "toggle",
    id: "kiwanto.genre.adventure",
  });
  assert.equal(state.open, true);
  assert.deepEqual(state.selectedIds, [
    "kiwanto.genre.action",
    "kiwanto.genre.adventure",
  ]);
  state = genreSelectorReducer(state, {
    type: "remove",
    id: "kiwanto.genre.action",
  });
  assert.deepEqual(state.selectedIds, ["kiwanto.genre.adventure"]);
});

test("selection remains intact when searching and editing restores stored IDs", () => {
  let state = createGenreSelectorState([
    "kiwanto.genre.action",
    "kiwanto.genre.adventure",
  ]);
  state = genreSelectorReducer(state, { type: "search", query: "metro" });
  assert.deepEqual(state.selectedIds, [
    "kiwanto.genre.action",
    "kiwanto.genre.adventure",
  ]);
  assert.deepEqual(
    filterCanonicalGenres(genres, state.query).map((genre) => genre.id),
    ["kiwanto.subgenre.metroidvania"],
  );
  state = genreSelectorReducer(state, {
    type: "sync",
    selectedIds: ["kiwanto.genre.adventure"],
  });
  assert.deepEqual(state.selectedIds, ["kiwanto.genre.adventure"]);
});
