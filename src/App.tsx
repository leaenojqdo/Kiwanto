import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { GameDetail } from "./components/GameDetail";
import { GameEditorDialog } from "./components/GameEditorDialog";
import { GlobalSidebar } from "./components/GlobalSidebar";
import { LibraryPanel } from "./components/LibraryPanel";
import { CollectionsPage } from "./components/CollectionsPage";
import { BigPicture } from "./components/BigPicture";
import { SettingsPage } from "./components/SettingsPage";
import type { LibraryView } from "./components/LibraryPanel";
import type { Destination } from "./app/navigation";
import { filterGames } from "./library/search";
import { selectVisibleGame } from "./library/selectors";
import {
  archiveLibraryEntry,
  createLibraryEntry,
  deleteLibraryEntryPermanently,
  listCanonicalGenres,
  listLibrary,
  restoreLibraryEntry,
  setLibraryFavorite,
  updateLibraryEntry,
  replaceGameRelations,
  saveLaunchProfile,
} from "./library/service";
import type { CanonicalGenre, GameInput, GameRelationType } from "./library/service";
import type { Game, GameLibraryStates } from "./library/models";
import { loadUserPreferences, saveUserPreferences } from "./preferences/userPreferences";
import {
  builtInThemes,
  DEFAULT_USER_PREFERENCES,
  themeCssProperties,
} from "./themes/definitions";
import type { ThemeId, UserPreferences } from "./themes/model";

const futureSections: Record<
  Exclude<Destination, "desktop" | "library" | "favorites" | "collections" | "settings">,
  { title: string; description: string }
> = {
  statistics: {
    title: "Estadísticas",
    description: "El seguimiento y las estadísticas de juego se añadirán en una fase futura.",
  },
  extensions: {
    title: "Complementos",
    description: "El sistema de complementos todavía no está implementado.",
  },
};

function errorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return String(error);
}

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [gameStates, setGameStates] = useState<GameLibraryStates>({});
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [groupByPlatform, setGroupByPlatform] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [libraryView, setLibraryView] = useState<LibraryView>("list");
  const [showArchived, setShowArchived] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState("");
  const [canonicalGenres, setCanonicalGenres] = useState<CanonicalGenre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genreError, setGenreError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [libraryVisible, setLibraryVisible] = useState(true);
  const [libraryWidth, setLibraryWidth] = useState(() =>
    Number.parseInt(
      builtInThemes[DEFAULT_USER_PREFERENCES.themeId].tokens.dimensions.libraryDefaultWidth,
      10,
    ),
  );
  const [destination, setDestination] = useState<Destination>("desktop");
  const [requestedCollectionId, setRequestedCollectionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "big-picture">("desktop");
  const [notice, setNotice] = useState("");
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_USER_PREFERENCES.themeId);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [preferencesError, setPreferencesError] = useState("");
  const libraryScrollRef = useRef<HTMLDivElement>(null);
  const resizeStart = useRef<{ pointerX: number; width: number } | null>(null);
  const libraryRequestId = useRef(0);
  const filteredGames = useMemo(
    () => filterGames(games, gameStates, query, viewMode === "desktop" && destination === "favorites"),
    [destination, gameStates, games, query, viewMode],
  );
  const selectedGame = selectVisibleGame(filteredGames, selectedGameId);
  const effectiveSelectedGameId = selectedGame?.id ?? null;
  const activeSection =
    destination in futureSections
      ? futureSections[destination as keyof typeof futureSections]
      : null;

  async function refreshLibrary(archivedOnly = showArchived) {
    const requestId = ++libraryRequestId.current;
    setLibraryLoading(true);
    setLibraryError("");
    try {
      const entries = await listLibrary(archivedOnly);
      if (requestId !== libraryRequestId.current) return;
      setGames(entries.map((entry) => entry.game));
      setGameStates(
        Object.fromEntries(entries.map((entry) => [entry.game.id, entry.state])),
      );
      setCollapsedGroups((current) => {
        const next = { ...current };
        for (const entry of entries) {
          next[entry.game.metadata.platform] ??= false;
        }
        return next;
      });
    } catch (error) {
      if (requestId === libraryRequestId.current) {
        setLibraryError(errorMessage(error));
      }
    } finally {
      if (requestId === libraryRequestId.current) {
        setLibraryLoading(false);
      }
    }
  }

  useEffect(() => {
    void refreshLibrary(false);
  }, []);

  useEffect(() => {
    let active = true;
    listCanonicalGenres()
      .then((genres) => {
        if (active) setCanonicalGenres(genres);
      })
      .catch((error: unknown) => {
        if (active) setGenreError(errorMessage(error));
      })
      .finally(() => {
        if (active) setGenresLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (viewMode === "desktop" && selectedGameId !== effectiveSelectedGameId) {
      setSelectedGameId(effectiveSelectedGameId);
    }
  }, [effectiveSelectedGameId, selectedGameId, viewMode]);

  function libraryWidthBounds() {
    const theme = builtInThemes[themeId];
    const region = theme.composition.regions.library;
    const minimumWidth =
      region.minimumWidth ??
      Number.parseInt(theme.tokens.dimensions.libraryMinimumWidth, 10);
    const maximumWidth =
      region.maximumWidth ??
      Number.parseInt(theme.tokens.dimensions.libraryMaximumWidth, 10);
    const navigationWidth = Number.parseInt(
      theme.tokens.dimensions.navigationWidth,
      10,
    );
    return {
      minimumWidth,
      maximumWidth: Math.max(
        minimumWidth,
        Math.min(maximumWidth, window.innerWidth - navigationWidth - 360),
      ),
    };
  }

  useEffect(() => {
    let active = true;
    loadUserPreferences()
      .then((preferences) => {
        if (active) { setThemeId(preferences.themeId); setUserPreferences(preferences); }
      })
      .catch((error: unknown) => {
        if (active) {
          setPreferencesError(
            error instanceof Error ? error.message : String(error),
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function navigate(next: Destination) {
    setViewMode("desktop");
    setDestination(next);
    if (next === "desktop" || next === "library") {
      setLibraryVisible(true);
      setNotice("");
    } else if (next === "favorites") {
      setLibraryVisible(true);
      setNotice("");
    } else if (next === "collections") {
      setLibraryVisible(true);
      setShowArchived(false);
      void refreshLibrary(false);
      setNotice("");
    } else {
      setNotice("");
    }
  }

  function toggleGroup(platform: string) {
    setCollapsedGroups((current) => ({ ...current, [platform]: !current[platform] }));
  }

  async function toggleFavorite(gameId: string) {
    const current = gameStates[gameId];
    if (!current) return;
    setLibraryError("");
    try {
      await setLibraryFavorite(gameId, !current.favorite);
      setGameStates((states) => ({
        ...states,
        [gameId]: { ...states[gameId], favorite: !current.favorite },
      }));
    } catch (error) {
      setLibraryError(errorMessage(error));
    }
  }

  function openCreateDialog() {
    setEditingGame(null);
    setEditorOpen(true);
  }

  function openEditDialog(game: Game) {
    setEditingGame(game);
    setEditorOpen(true);
  }

  function editGameFromBigPicture(game:Game) {
    setSelectedGameId(game.id); setEditingGame(game); setEditorOpen(true); setViewMode("desktop");
  }

  async function saveGame(input: GameInput, relations: Array<{relatedGameId:string;relationType:GameRelationType}>, launchProfile: import("./library/service").LaunchProfileInput | null): Promise<string> {
    setLibraryError("");
    try {
      let savedId: string;
      let savedGame: Game;
      if (editingGame) {
        const updated = await updateLibraryEntry(editingGame.id, input);
        savedGame = updated.game;
        savedId = editingGame.id;
      } else {
        const created = await createLibraryEntry(input);
        savedGame = created.game;
        setSelectedGameId(created.game.id);
        setQuery("");
        savedId = created.game.id;
        setEditingGame(savedGame);
      }
      try { await replaceGameRelations(savedId, relations); }
      catch (error) {
        if (!editingGame) { setEditingGame(savedGame); await refreshLibrary(false); }
        throw error;
      }
      if (launchProfile) await saveLaunchProfile(savedId, launchProfile);
      setEditorOpen(false);
      await refreshLibrary(showArchived);
      return savedId;
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  }

  async function archiveGame(gameId: string) {
    setLibraryError("");
    try {
      await archiveLibraryEntry(gameId);
      await refreshLibrary(false);
    } catch (error) {
      setLibraryError(errorMessage(error));
    }
  }

  async function restoreGame(gameId: string) {
    setLibraryError("");
    try {
      await restoreLibraryEntry(gameId);
      await refreshLibrary(true);
    } catch (error) {
      setLibraryError(errorMessage(error));
    }
  }

  async function deleteGame(gameId: string) {
    setLibraryError("");
    try {
      await deleteLibraryEntryPermanently(gameId);
      await refreshLibrary(true);
    } catch (error) {
      setLibraryError(errorMessage(error));
    }
  }

  async function applyTheme(nextThemeId: ThemeId) {
    setPreferencesError("");
    try {
      const saved = await saveUserPreferences({
        ...userPreferences,
        themeId: nextThemeId,
      });
      setThemeId(saved.themeId);
      setUserPreferences(saved);
    } catch (error) {
      setPreferencesError(
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async function resetPreferences() {
    setPreferencesError("");
    try {
      const saved = await saveUserPreferences(DEFAULT_USER_PREFERENCES);
      setThemeId(saved.themeId);
      setUserPreferences(saved);
    } catch (error) {
      setPreferencesError(
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  function startResize(event: PointerEvent<HTMLButtonElement>) {
    resizeStart.current = { pointerX: event.clientX, width: libraryWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resizeLibrary(event: PointerEvent<HTMLButtonElement>) {
    if (!resizeStart.current) return;
    const { minimumWidth, maximumWidth } = libraryWidthBounds();
    const nextWidth = Math.min(
      maximumWidth,
      Math.max(
        minimumWidth,
        resizeStart.current.width + event.clientX - resizeStart.current.pointerX,
      ),
    );
    setLibraryWidth(nextWidth);
  }

  function stopResize(event: PointerEvent<HTMLButtonElement>) {
    resizeStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const { minimumWidth, maximumWidth } = libraryWidthBounds();
    setLibraryWidth((width) =>
      Math.min(
        maximumWidth,
        Math.max(
          minimumWidth,
          width + direction * (event.shiftKey ? 32 : 12),
        ),
      ),
    );
  }

  if (viewMode === "big-picture") {
    return (
      <BigPicture
        games={filteredGames}
        allGames={games}
        loading={libraryLoading}
        loadError={libraryError}
        operationError={libraryError}
        onRetry={() => void refreshLibrary(false)}
        gameStates={gameStates}
        selectedGameId={selectedGameId}
        onSelectGame={setSelectedGameId}
        onToggleFavorite={(gameId) => void toggleFavorite(gameId)}
        onReturnDesktop={() => setViewMode("desktop")}
        query={query}
        onQueryChange={setQuery}
        onEditGame={editGameFromBigPicture}
        onArchiveGame={(id)=>void archiveGame(id)}
        onContextError={setLibraryError}
        presentationStyle={themeCssProperties(themeId) as CSSProperties}
        preferences={userPreferences.bigPicture}
        onPreferencesChange={async (bigPicture) => {
          const saved = await saveUserPreferences({ ...userPreferences, bigPicture });
          setUserPreferences(saved);
        }}
      />
    );
  }

  return (
    <div
      className={`desktop-shell${libraryVisible ? "" : " desktop-shell--library-hidden"}`}
      data-theme={themeId}
      style={
        {
          ...themeCssProperties(themeId),
          "--library-width": `${libraryWidth}px`,
        } as CSSProperties
      }
    >
      <GlobalSidebar
        activeDestination={destination}
        libraryVisible={libraryVisible}
        onNavigate={navigate}
        onToggleLibrary={() => setLibraryVisible((visible) => !visible)}
        onEnterBigPicture={() => setViewMode("big-picture")}
      />
      <div
        aria-hidden={!libraryVisible}
        className={`library-region${libraryVisible ? "" : " library-region--hidden"}`}
        inert={!libraryVisible}
      >
        <LibraryPanel
          games={filteredGames}
          gameStates={gameStates}
          loading={libraryLoading}
          error={libraryError}
          showArchived={showArchived}
          onCreateGame={openCreateDialog}
          onRetry={() => void refreshLibrary(showArchived)}
          onToggleArchived={() => {
            const next = !showArchived;
            setShowArchived(next);
            void refreshLibrary(next);
          }}
          selectedGameId={effectiveSelectedGameId}
          query={query}
          onQueryChange={setQuery}
          groupByPlatform={groupByPlatform}
          onGroupByPlatformChange={setGroupByPlatform}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroup}
          view={libraryView}
          onViewChange={setLibraryView}
          onSelectGame={(game) => setSelectedGameId(game.id)}
          onEditGame={openEditDialog}
          onToggleFavorite={(id)=>void toggleFavorite(id)}
          onArchiveGame={(id)=>void archiveGame(id)}
          onRestoreGame={(id)=>void restoreGame(id)}
          onContextError={setLibraryError}
          scrollContainerRef={libraryScrollRef}
        />
      </div>
      <button
        aria-label="Redimensionar biblioteca"
        aria-orientation="vertical"
        aria-valuemin={libraryWidthBounds().minimumWidth}
        aria-valuemax={libraryWidthBounds().maximumWidth}
        aria-valuenow={libraryWidth}
        className="library-resizer"
        hidden={
          !libraryVisible ||
          builtInThemes[themeId].composition.separator.visible === false
        }
        onKeyDown={resizeWithKeyboard}
        onPointerDown={startResize}
        onPointerMove={resizeLibrary}
        onPointerUp={stopResize}
        role="separator"
        tabIndex={libraryVisible ? 0 : -1}
        type="button"
      />
      <main className="main-stage">
        {destination === "collections" ? (
          <CollectionsPage
            initialCollectionId={requestedCollectionId}
            games={games}
            gamesLoading={libraryLoading}
            gamesError={libraryError}
            onRetryGames={() => void refreshLibrary(false)}
            onOpenGame={(gameId) => {
              setQuery("");
              setSelectedGameId(gameId);
              navigate("desktop");
            }}
          />
        ) : destination === "settings" ? (
          <SettingsPage
            themeId={themeId}
            loadError={preferencesError}
            onThemeChange={applyTheme}
            onReset={resetPreferences}
          />
        ) : activeSection ? (
          <section aria-labelledby="future-section-title" className="future-view">
            <div className="future-view__icon" aria-hidden="true">
              <span>✦</span>
            </div>
            <p className="eyebrow">KIWANTO · EN DESARROLLO</p>
            <h1 id="future-section-title">{activeSection.title}</h1>
            <p>{activeSection.description}</p>
            <button className="text-button" onClick={() => navigate("desktop")} type="button">
              Volver al modo escritorio
            </button>
          </section>
        ) : selectedGame ? (
          <GameDetail
            game={selectedGame}
            libraryGames={games}
            onOpenRelated={(related)=>{setQuery("");setSelectedGameId(related.id);}}
            onOpenCollection={(collectionId)=>{setRequestedCollectionId(collectionId);navigate("collections");}}
            gameState={gameStates[selectedGame.id]}
            isArchived={showArchived}
            notice={notice}
            onDismissNotice={() => setNotice("")}
            onToggleFavorite={() => void toggleFavorite(selectedGame.id)}
            onEdit={() => openEditDialog(selectedGame)}
            onArchive={() => void archiveGame(selectedGame.id)}
            onRestore={() => void restoreGame(selectedGame.id)}
            onDelete={() => void deleteGame(selectedGame.id)}
          />
        ) : (
          <section className="empty-library">
            <p className="eyebrow">BIBLIOTECA</p>
            <h1>
              {libraryLoading
                ? "Cargando biblioteca…"
                : libraryError
                  ? "No se pudo cargar la biblioteca"
                  : games.length
                    ? "No hay juegos para mostrar"
                    : showArchived
                      ? "No hay juegos archivados"
                      : "Aún no has añadido juegos"}
            </h1>
            <p>{libraryError || (games.length ? "Prueba con otros términos o filtros." : "Añade una entrada manual para empezar.")}</p>
            {!showArchived && !libraryLoading && (
              <button className="primary-button" onClick={openCreateDialog} type="button">
                Añadir juego
              </button>
            )}
          </section>
        )}
      </main>
      {editorOpen && (
        <GameEditorDialog
          game={editingGame}
          availableGames={games}
          genreError={genreError}
          genres={canonicalGenres}
          genresLoading={genresLoading}
          onClose={() => setEditorOpen(false)}
          onSave={saveGame}
        />
      )}
    </div>
  );
}
