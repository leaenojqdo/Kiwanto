import type { CanonicalGenre } from "./service";

export interface GenreSelectorState {
  open: boolean;
  query: string;
  selectedIds: string[];
}

export type GenreSelectorAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "search"; query: string }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }
  | { type: "sync"; selectedIds: string[] };

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function filterCanonicalGenres(
  genres: readonly CanonicalGenre[],
  query: string,
) {
  const search = normalize(query.trim());
  if (!search) return [...genres];
  return genres.filter((genre) =>
    normalize(genre.displayName).includes(search),
  );
}

export function createGenreSelectorState(
  selectedIds: readonly string[],
): GenreSelectorState {
  return { open: false, query: "", selectedIds: [...new Set(selectedIds)] };
}

export function genreSelectorReducer(
  state: GenreSelectorState,
  action: GenreSelectorAction,
): GenreSelectorState {
  switch (action.type) {
    case "open":
      return state.open ? state : { ...state, open: true };
    case "close":
      return !state.open && !state.query
        ? state
        : { ...state, open: false, query: "" };
    case "search":
      return { ...state, open: true, query: action.query };
    case "toggle":
      return {
        ...state,
        open: true,
        selectedIds: state.selectedIds.includes(action.id)
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      };
    case "remove":
      return {
        ...state,
        selectedIds: state.selectedIds.filter((id) => id !== action.id),
      };
    case "sync": {
      const selectedIds = [...new Set(action.selectedIds)];
      if (
        selectedIds.length === state.selectedIds.length &&
        selectedIds.every((id, index) => id === state.selectedIds[index])
      ) {
        return state;
      }
      return { ...state, selectedIds };
    }
  }
}
