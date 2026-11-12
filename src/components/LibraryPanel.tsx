import { useMemo, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import type { Game, GameLibraryState, GameLibraryStates } from "../library/models";
import { GameSearch } from "./GameSearch";
import { Icon } from "./Icon";
import { GameContextMenu } from "./GameContextMenu";

export type LibraryView = "list" | "covers";

interface LibraryPanelProps {
  games: Game[];
  gameStates: GameLibraryStates;
  loading: boolean;
  error: string;
  showArchived: boolean;
  onCreateGame: () => void;
  onToggleArchived: () => void;
  onRetry: () => void;
  selectedGameId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  groupByPlatform: boolean;
  onGroupByPlatformChange: (value: boolean) => void;
  collapsedGroups: Record<string, boolean>;
  onToggleGroup: (platform: string) => void;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
  onSelectGame: (game: Game) => void;
  onEditGame: (game: Game) => void;
  onToggleFavorite: (id:string)=>void;
  onArchiveGame: (id:string)=>void;
  onRestoreGame: (id:string)=>void;
  onContextError: (message:string)=>void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

function GameRow({
  game,
  state,
  selected,
  view,
  onSelect,
  onEdit,
  onToggleFavorite,
  onArchive,
  onRestore,
  onContextError,
  showArchived,
}: {
  game: Game;
  state: GameLibraryState;
  selected: boolean;
  view: LibraryView;
  onSelect: () => void;
  onEdit:()=>void; onToggleFavorite:()=>void; onArchive:()=>void; onRestore:()=>void; onContextError:(message:string)=>void; showArchived:boolean;
}) {
  return (
    <GameContextMenu archived={showArchived} game={game} mode="desktop" onArchive={onArchive} onEdit={showArchived?undefined:onEdit} onError={onContextError} onOpen={onSelect} onRestore={onRestore} onToggleFavorite={onToggleFavorite} state={state}>
    <button
      aria-pressed={selected}
      className={`game-entry game-entry--${view}${selected ? " is-selected" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <span className="game-entry__art">
        {game.presentation.cover && (
          <img alt="" loading="lazy" src={game.presentation.cover} />
        )}
        {(view === "list" || !game.presentation.cover) && (
          <span className="game-entry__initials" style={{ "--game-accent": game.presentation.accent } as CSSProperties}>
            {game.presentation.initials}
          </span>
        )}
      </span>
      <span className="game-entry__name">{game.metadata.title}</span>
      {view === "list" && state.favorite && (
        <Icon aria-label="Favorito" className="game-entry__favorite" name="heart" />
      )}
      {view === "list" && !state.installed && (
        <span
          aria-label="Sin instalación verificada"
          className="game-entry__availability"
          title="Sin instalación verificada"
        />
      )}
    </button>
    </GameContextMenu>
  );
}

export function LibraryPanel({
  games,
  gameStates,
  loading,
  error,
  showArchived,
  onCreateGame,
  onToggleArchived,
  onRetry,
  selectedGameId,
  query,
  onQueryChange,
  groupByPlatform,
  onGroupByPlatformChange,
  collapsedGroups,
  onToggleGroup,
  view,
  onViewChange,
  onSelectGame,
  onEditGame,
  onToggleFavorite,
  onArchiveGame,
  onRestoreGame,
  onContextError,
  scrollContainerRef,
}: LibraryPanelProps) {
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const groups = useMemo(() => {
    const result = new Map<string, Game[]>();
    for (const game of games) {
      const current = result.get(game.metadata.platform) ?? [];
      current.push(game);
      result.set(game.metadata.platform, current);
    }
    return [...result.entries()];
  }, [games]);

  return (
    <aside aria-label="Biblioteca de juegos" className="library-panel">
      <header className="library-header">
        <div>
          <p className="eyebrow">TU COLECCIÓN</p>
          <div className="library-header__title">
            <h1>{showArchived ? "Archivados" : "Biblioteca"}</h1>
            <span className="library-count">{games.length.toString().padStart(2, "0")}</span>
          </div>
        </div>
        <div className="library-header__actions">
          {!showArchived && (
            <button
              aria-label="Añadir juego"
              className="icon-button library-header__action"
              onClick={onCreateGame}
              title="Añadir juego"
              type="button"
            >
              <Icon name="plus" />
            </button>
          )}
          <button
            aria-label={showArchived ? "Volver a la biblioteca" : "Ver entradas archivadas"}
            aria-pressed={showArchived}
            className={`icon-button library-header__action${showArchived ? " is-active" : ""}`}
            onClick={onToggleArchived}
            title={showArchived ? "Volver a la biblioteca" : "Ver entradas archivadas"}
            type="button"
          >
            <Icon name={showArchived ? "library" : "archive"} />
          </button>
          <button
            aria-expanded={quickSettingsOpen}
            aria-label="Configuración rápida de biblioteca"
            className={`icon-button quick-settings-trigger${quickSettingsOpen ? " is-active" : ""}`}
            onClick={() => setQuickSettingsOpen((open) => !open)}
            title="Configuración rápida"
            type="button"
          >
            <Icon name="sliders" />
          </button>
        </div>
        {quickSettingsOpen && (
          <div aria-label="Configuración rápida de biblioteca" className="quick-settings" role="dialog">
            <div className="quick-settings__heading">
              <div>
                <p className="eyebrow">PERSONALIZAR</p>
                <h2>Vista de biblioteca</h2>
              </div>
              <button
                aria-label="Cerrar configuración rápida"
                className="icon-button icon-button--small"
                onClick={() => setQuickSettingsOpen(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <p className="quick-settings__label">Presentación</p>
            <div aria-label="Modo de visualización" className="view-switch" role="group">
              <button
                aria-pressed={view === "list"}
                className={view === "list" ? "is-active" : ""}
                onClick={() => onViewChange("list")}
                type="button"
              >
                <Icon name="list" />
                Lista
              </button>
              <button
                aria-pressed={view === "covers"}
                className={view === "covers" ? "is-active" : ""}
                onClick={() => onViewChange("covers")}
                type="button"
              >
                <Icon name="covers" />
                Carátulas
              </button>
            </div>
            <label className="toggle-setting">
              <span>
                <strong>Agrupar por plataforma</strong>
                <small>Organiza los juegos en secciones</small>
              </span>
              <input
                checked={groupByPlatform}
                onChange={(event) => onGroupByPlatformChange(event.target.checked)}
                type="checkbox"
              />
              <span aria-hidden="true" className="toggle-setting__switch" />
            </label>
          </div>
        )}
      </header>

      <div className="library-search-area">
        <GameSearch onChange={onQueryChange} value={query} />
        <div className="search-guide">
          <span>PRUEBA</span>
          <code>@aventura</code>
          <code>@linux</code>
          <code>@favoritos</code>
        </div>
        {error && <p className="library-error" role="alert">{error}</p>}
      </div>

      <div className="library-list-heading">
        <span>{groupByPlatform ? "PLATAFORMAS" : "JUEGOS"}</span>
        <span className="library-list-heading__count">
          {games.length} {games.length === 1 ? "juego" : "juegos"}
        </span>
      </div>

      <div className={`library-scroll library-scroll--${view}`} ref={scrollContainerRef}>
        {games.length === 0 ? (
          <div className="library-empty">
            <span className="library-empty__icon">
              <Icon name="search" />
            </span>
            <strong>
              {loading
                ? "Cargando biblioteca…"
                : error
                  ? "Biblioteca no disponible"
                  : query.trim()
                    ? "No encontramos juegos"
                    : showArchived
                      ? "No hay juegos archivados"
                      : "Aún no hay juegos"}
            </strong>
            <span>
              {error
                ? "Revisa el error para conocer el motivo."
                : query.trim()
                  ? "Prueba con otro nombre o filtro."
                  : showArchived
                    ? "Los juegos archivados aparecerán aquí."
                    : "Usa el botón «Añadir juego» de la cabecera para crear una entrada manual."}
            </span>
            {error && (
              <button className="text-button" onClick={onRetry} type="button">
                Reintentar
              </button>
            )}
          </div>
        ) : groupByPlatform ? (
          groups.map(([platform, platformGames]) => (
            <section aria-label={`Plataforma ${platform}`} className="platform-group" key={platform}>
              <button
                aria-expanded={!collapsedGroups[platform]}
                className="platform-group__heading"
                onClick={() => onToggleGroup(platform)}
                type="button"
              >
                <Icon
                  className={collapsedGroups[platform] ? "platform-group__chevron is-collapsed" : "platform-group__chevron"}
                  name="chevron"
                />
                <span>{platform}</span>
                <span className="platform-group__count">
                  {platformGames.length.toString().padStart(2, "0")}
                </span>
              </button>
              {!collapsedGroups[platform] && (
                <div className={`game-entries game-entries--${view}`}>
                  {platformGames.map((game) => (
                    <GameRow
                      game={game}
                      state={gameStates[game.id]}
                      key={game.id}
                      onSelect={() => onSelectGame(game)}
                      onEdit={() => onEditGame(game)}
                      onToggleFavorite={() => onToggleFavorite(game.id)}
                      onArchive={() => onArchiveGame(game.id)}
                      onRestore={() => onRestoreGame(game.id)}
                      onContextError={onContextError}
                      showArchived={showArchived}
                      selected={selectedGameId === game.id}
                      view={view}
                    />
                  ))}
                </div>
              )}
            </section>
          ))
        ) : (
          <div className={`game-entries game-entries--${view}`}>
            {games.map((game) => (
              <GameRow
                game={game}
                state={gameStates[game.id]}
                key={game.id}
                onSelect={() => onSelectGame(game)}
                onEdit={() => onEditGame(game)}
                onToggleFavorite={() => onToggleFavorite(game.id)}
                onArchive={() => onArchiveGame(game.id)}
                onRestore={() => onRestoreGame(game.id)}
                onContextError={onContextError}
                showArchived={showArchived}
                selected={selectedGameId === game.id}
                view={view}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="library-footer">
        <span className="library-footer__status">
          <span className="status-dot" />
          {showArchived ? "Entradas archivadas" : "Biblioteca local"}
        </span>
        <span>LOCAL</span>
      </footer>
    </aside>
  );
}
