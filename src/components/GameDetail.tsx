import { useState } from "react";
import type { CSSProperties } from "react";
import type { Game, GameLibraryState } from "../library/models";
import { Icon } from "./Icon";
import { GameLaunchControl } from "./GameLaunchControl";
import { GameRelationsView } from "./GameRelationsView";
import { GameDescriptionView } from "./GameDescriptionView";

interface GameDetailProps {
  game: Game;
  gameState: GameLibraryState;
  notice: string;
  onDismissNotice: () => void;
  onToggleFavorite: () => void;
  isArchived: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  libraryGames: Game[];
  onOpenRelated: (game: Game) => void;
  onOpenCollection?: (collectionId:string)=>void;
}

export function GameDetail({
  game,
  gameState,
  notice,
  onDismissNotice,
  onToggleFavorite,
  isArchived,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  libraryGames,
  onOpenRelated,
  onOpenCollection,
}: GameDetailProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  return (
    <article
      className="game-detail"
      style={{
        "--game-accent": game.presentation.accent,
        "--game-art": game.presentation.cover
          ? `url("${game.presentation.cover}")`
          : "none",
      } as CSSProperties}
    >
      <div aria-hidden="true" className="game-detail__backdrop" />
      <div aria-hidden="true" className="game-detail__vignette" />

      <header className="detail-topbar">
        <div className="detail-breadcrumb">
          <span className="detail-breadcrumb__dot" />
          <span>ESCRITORIO</span>
          <span className="detail-breadcrumb__slash">/</span>
          <span>JUEGO</span>
        </div>
        <div className="detail-topbar__actions">
          {isArchived ? (
            <>
              <button className="detail-action" onClick={onRestore} type="button">
                Restaurar
              </button>
              <button
                className="detail-action detail-action--danger"
                onClick={() => setConfirmingDelete(true)}
                type="button"
              >
                Eliminar definitivamente
              </button>
            </>
          ) : (
            <button className="detail-action" onClick={onArchive} type="button">
              Archivar
            </button>
          )}
          <button
            aria-label={gameState.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-pressed={gameState.favorite}
            className={`favorite-button${gameState.favorite ? " is-favorite" : ""}`}
            onClick={onToggleFavorite}
            title={gameState.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            type="button"
          >
            <Icon name="heart" />
          </button>
        </div>
      </header>

      <div className="game-detail__content">
        <section aria-labelledby="selected-game-title" className="game-hero">
          <div className="game-cover">
            {game.presentation.cover ? (
              <img
                alt={`Arte de portada de ${game.metadata.title}`}
                src={game.presentation.cover}
              />
            ) : (
              <span className="game-cover__initials">{game.presentation.initials}</span>
            )}
            <span className="game-cover__edge" />
          </div>
          <div className="game-hero__info">
            <h1 id="selected-game-title">{game.metadata.title}</h1>
            <div className="game-hero__actions">
              <GameLaunchControl
                disabled={isArchived}
                gameId={game.id}
              />
              {!isArchived && <button className="detail-action game-detail__edit" onClick={onEdit} type="button">Editar</button>}
            </div>
          </div>
        </section>

        <section
          aria-label={`Información de ${game.metadata.title}`}
          className="game-overview"
        >
          <div className="game-overview__description">
            <p className="eyebrow">ACERCA DEL JUEGO</p>
            <div className="description-content">
              <GameDescriptionView text={game.metadata.description} />
            </div>
          </div>
          <dl className="game-metadata">
            <div className="metadata-item">
              <dt>Desarrollador</dt>
              <dd>{game.metadata.developer}</dd>
            </div>
            <div className="metadata-item">
              <dt>Editor</dt>
              <dd>{game.metadata.publisher}</dd>
            </div>
            <div className="metadata-item">
              <dt>Año de lanzamiento</dt>
              <dd>{game.metadata.year ?? "—"}</dd>
            </div>
            <div className="metadata-item">
              <dt>Géneros</dt>
              <dd>{game.metadata.genre.join(", ")}</dd>
            </div>
            <div className="metadata-item">
              <dt>Clasificación por edades</dt>
              <dd>{game.metadata.rating}</dd>
            </div>
            <div className="metadata-item">
              <dt>Plataforma</dt>
              <dd>{game.metadata.platform}</dd>
            </div>
            {game.metadata.score !== undefined && (
              <div className="metadata-item">
                <dt>Puntuación</dt>
                <dd>{game.metadata.score}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      {!isArchived && <GameRelationsView gameId={game.id} games={libraryGames} onOpenCollection={onOpenCollection} onOpenGame={onOpenRelated} />}

      {notice && (
        <div className="feedback-toast" role="status">
          <span className="feedback-toast__mark">i</span>
          <span>{notice}</span>
          <button aria-label="Cerrar aviso" onClick={onDismissNotice} type="button">
            <Icon name="close" />
          </button>
        </div>
      )}
      {confirmingDelete && (
        <div className="dialog-backdrop">
          <section
            aria-labelledby="delete-entry-title"
            aria-modal="true"
            className="delete-confirmation"
            role="alertdialog"
          >
            <p className="eyebrow">ACCIÓN PERMANENTE</p>
            <h2 id="delete-entry-title">Eliminar «{game.metadata.title}»</h2>
            <p>
              Se eliminarán los datos de esta entrada de Kiwanto. No se borrarán
              archivos del juego. Esta acción no se puede deshacer.
            </p>
            <footer>
              <button
                className="text-button"
                onClick={() => setConfirmingDelete(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="danger-button"
                onClick={() => {
                  setConfirmingDelete(false);
                  onDelete();
                }}
                type="button"
              >
                Eliminar definitivamente
              </button>
            </footer>
          </section>
        </div>
      )}
    </article>
  );
}
