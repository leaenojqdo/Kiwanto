import { useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CanonicalGenre } from "../library/service";
import {
  createGenreSelectorState,
  filterCanonicalGenres,
  genreSelectorReducer,
} from "../library/genreSelector";

interface GenreMultiSelectProps {
  genres: CanonicalGenre[];
  selectedIds: string[];
  pendingNames: string[];
  loading: boolean;
  error: string;
  portalTarget: HTMLElement | null;
  disabled?: boolean;
  onChange: (selectedIds: string[]) => void;
}

interface DropdownPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

export function GenreMultiSelect({
  genres,
  selectedIds,
  pendingNames,
  loading,
  error,
  portalTarget,
  disabled = false,
  onChange,
}: GenreMultiSelectProps) {
  const [state, dispatch] = useReducer(
    genreSelectorReducer,
    selectedIds,
    createGenreSelectorState,
  );
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const genresById = useMemo(
    () => new Map(genres.map((genre) => [genre.id, genre])),
    [genres],
  );
  const filteredGenres = useMemo(
    () =>
      filterCanonicalGenres(genres, state.query).sort(
        (left, right) =>
          left.displayName.localeCompare(right.displayName, "es", {
            sensitivity: "base",
          }) || left.id.localeCompare(right.id),
      ),
    [genres, state.query],
  );

  useEffect(() => {
    dispatch({ type: "sync", selectedIds });
  }, [selectedIds]);

  useEffect(() => {
    if (!state.open) return;
    function dismissOutside(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        dispatch({ type: "close" });
      }
    }
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        dispatch({ type: "close" });
        containerRef.current?.querySelector("input")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [state.open]);

  useLayoutEffect(() => {
    if (!state.open) {
      setPosition(null);
      return;
    }
    const updatePosition = () => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const below = window.innerHeight - bounds.bottom - 12;
      const above = bounds.top - 12;
      const openAbove = below < 220 && above > below;
      const available = openAbove ? above : below;
      const maxHeight = Math.max(120, Math.min(260, available - 8));
      setPosition({
        left: Math.max(8, Math.min(bounds.left, window.innerWidth - bounds.width - 8)),
        top: openAbove
          ? Math.max(8, bounds.top - maxHeight - 8)
          : bounds.bottom + 8,
        width: bounds.width,
        maxHeight,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [state.open, selectedIds.length]);

  function toggleGenre(id: string) {
    const next = state.selectedIds.includes(id)
      ? state.selectedIds.filter((selectedId) => selectedId !== id)
      : [...state.selectedIds, id];
    dispatch({ type: "toggle", id });
    onChange(next);
  }

  function removeGenre(id: string) {
    const next = selectedIds.filter((selectedId) => selectedId !== id);
    dispatch({ type: "remove", id });
    onChange(next);
  }

  const dropdown =
    state.open &&
    position &&
    portalTarget &&
    createPortal(
      <div
        className="genre-selector__dropdown"
        id={listId}
        ref={dropdownRef}
        role="group"
        aria-label="Géneros canónicos"
        style={{
          left: position.left,
          maxHeight: position.maxHeight,
          top: position.top,
          width: position.width,
        }}
      >
        {loading ? (
          <p className="genre-selector__message">Cargando géneros…</p>
        ) : error ? (
          <p className="genre-selector__message genre-selector__message--error" role="alert">
            {error}
          </p>
        ) : filteredGenres.length === 0 ? (
          <p className="genre-selector__message">No se encontraron géneros</p>
        ) : (
          filteredGenres.map((genre) => {
            const parentNames = genre.parentIds
              .map((parentId) => genresById.get(parentId)?.displayName)
              .filter((name): name is string => Boolean(name));
            const selected = state.selectedIds.includes(genre.id);
            return (
              <label
                className={`genre-selector__option genre-selector__option--${genre.kind}${selected ? " is-selected" : ""}`}
                key={genre.id}
              >
                <input
                  checked={selected}
                  onChange={() => toggleGenre(genre.id)}
                  type="checkbox"
                />
                <span aria-hidden="true" className="genre-selector__checkbox" />
                <span className="genre-selector__option-copy">
                  <span className="genre-selector__option-name">
                    {genre.displayName}
                  </span>
                  {genre.kind === "subgenre" && (
                    <span className="genre-selector__option-kind">
                      Subgénero
                      {parentNames.length ? ` · ${parentNames.join(" / ")}` : ""}
                    </span>
                  )}
                </span>
              </label>
            );
          })
        )}
      </div>,
      portalTarget,
    );

  return (
    <div className="genre-selector">
      <div
        className={`genre-selector__field${state.open ? " is-open" : ""}`}
        onClick={(event) => {
          if (!(event.target instanceof HTMLButtonElement)) {
            dispatch({ type: "open" });
          }
        }}
        ref={containerRef}
      >
        <div className="genre-selector__search">
          <input
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={state.open}
            aria-label="Buscar y seleccionar géneros"
            autoComplete="off"
            disabled={disabled || loading}
            id={inputId}
            onChange={(event) =>
              dispatch({ type: "search", query: event.target.value })
            }
            onFocus={() => dispatch({ type: "open" })}
            onKeyDown={(event) => {
              if (event.key === "Escape" && state.open) {
                event.preventDefault();
                dispatch({ type: "close" });
              }
            }}
            placeholder={loading ? "Cargando géneros…" : "Buscar géneros…"}
            role="searchbox"
            value={state.query}
          />
          <button
            aria-label={state.open ? "Cerrar géneros" : "Abrir géneros"}
            aria-expanded={state.open}
            className="genre-selector__toggle"
            disabled={disabled || loading}
            onClick={() =>
              dispatch({ type: state.open ? "close" : "open" })
            }
            type="button"
          >
            <span aria-hidden="true">{state.open ? "⌃" : "⌄"}</span>
          </button>
        </div>
        <div className="genre-selector__chips" aria-label="Géneros seleccionados">
          {selectedIds.map((id) => {
            const genre = genresById.get(id);
            if (!genre) return null;
            return (
              <span className="genre-selector__chip" key={id}>
                {genre.displayName}
                <button
                  aria-label={`Quitar ${genre.displayName}`}
                  disabled={disabled}
                  onClick={() => removeGenre(id)}
                  type="button"
                >
                  ×
                </button>
              </span>
            );
          })}
          {pendingNames.map((name, index) => (
            <span
              className="genre-selector__chip genre-selector__chip--pending"
              key={`${name}-${index}`}
              title="              Se conserva como término pendiente de clasificación"
            >
              {name} <span>Pendiente</span>
            </span>
          ))}
        </div>
      </div>
      {pendingNames.length > 0 && (
        <p className="genre-selector__pending-note">
          Los términos pendientes se conservan; asígnales un género canónico
          cuando la taxonomía los cubra.
        </p>
      )}
      {dropdown}
    </div>
  );
}
