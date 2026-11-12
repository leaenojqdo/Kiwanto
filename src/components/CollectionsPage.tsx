import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Game } from "../library/models";
import {
  addGameToCollection,
  createCollection,
  deleteCollection,
  listCollectionGames,
  listCollections,
  removeGameFromCollection,
  updateCollection,
} from "../library/service";
import type { CollectionInput, CollectionSummary } from "../library/service";
import { Icon } from "./Icon";

interface CollectionsPageProps {
  games: Game[];
  gamesLoading: boolean;
  gamesError: string;
  onRetryGames: () => void;
  onOpenGame: (gameId: string) => void;
  initialCollectionId?: string | null;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function CollectionsPage({
  games,
  gamesLoading,
  gamesError,
  onRetryGames,
  onOpenGame,
  initialCollectionId = null,
}: CollectionsPageProps) {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<Game[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [membersReload, setMembersReload] = useState(0);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<"create" | CollectionSummary | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addGamesOpen, setAddGamesOpen] = useState(false);
  const [gameQuery, setGameQuery] = useState("");
  const [reload, setReload] = useState(0);
  const selectedCollection = collections.find((item) => item.id === selectedId) ?? null;
  const memberIds = useMemo(() => new Set(members.map((game) => game.id)), [members]);
  const availableGames = useMemo(() => {
    const normalizedQuery = gameQuery.trim().toLocaleLowerCase("es");
    return games.filter((game) =>
      !normalizedQuery || game.metadata.title.toLocaleLowerCase("es").includes(normalizedQuery),
    );
  }, [gameQuery, games]);

  useEffect(() => {
    let active = true;
    setCollectionsLoading(true);
    setCollectionsError("");
    listCollections()
      .then((result) => {
        if (!active) return;
        setCollections(result);
        setSelectedId((current) => initialCollectionId && result.some((collection) => collection.id === initialCollectionId) ? initialCollectionId : current && result.some((collection) => collection.id === current) ? current : null);
      })
      .catch((error: unknown) => {
        if (active) setCollectionsError(messageOf(error));
      })
      .finally(() => {
        if (active) setCollectionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialCollectionId, reload]);

  useEffect(() => {
    if (!selectedId) {
      setMembers([]);
      setMembersError("");
      return;
    }
    let active = true;
    setMembersLoading(true);
    setMembersError("");
    listCollectionGames(selectedId)
      .then((result) => {
        if (active) setMembers(result.map((entry) => entry.game));
      })
      .catch((error: unknown) => {
        if (active) setMembersError(messageOf(error));
      })
      .finally(() => {
        if (active) setMembersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [membersReload, selectedId]);

  async function saveCollection(input: CollectionInput) {
    setBusy(true);
    setActionError("");
    try {
      if (editor === "create") {
        const created = await createCollection(input);
        setReload((value) => value + 1);
        setSelectedId(created.id);
      } else if (editor) {
        const updated = await updateCollection(editor.id, input);
        setCollections((current) => current.map((item) => item.id === updated.id ? updated : item));
      }
      setEditor(null);
    } catch (error) {
      throw error;
    } finally {
      setBusy(false);
    }
  }

  async function removeSelectedCollection() {
    if (!selectedCollection) return;
    setBusy(true);
    setActionError("");
    try {
      await deleteCollection(selectedCollection.id);
      setConfirmDelete(false);
      setSelectedId(null);
      setMembers([]);
      setReload((value) => value + 1);
    } catch (error) {
      setActionError(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  async function changeMembership(game: Game, shouldAdd: boolean) {
    if (!selectedCollection) return;
    setBusy(true);
    setActionError("");
    try {
      if (shouldAdd) {
        await addGameToCollection(selectedCollection.id, game.id);
        setMembers((current) => current.some((item) => item.id === game.id) ? current : [...current, game]);
      } else {
        await removeGameFromCollection(selectedCollection.id, game.id);
        setMembers((current) => current.filter((item) => item.id !== game.id));
      }
      setReload((value) => value + 1);
    } catch (error) {
      setActionError(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="collections-title" className="collections-page">
      <header className="collections-header">
        <div>
          <p className="eyebrow">BIBLIOTECA PERSONAL</p>
          <h1 id="collections-title">Colecciones</h1>
          <p>Agrupa juegos a tu manera. Un juego puede estar en varias colecciones.</p>
        </div>
        <button className="primary-button" onClick={() => setEditor("create")} type="button">
          <Icon name="plus" /> Nueva colección
        </button>
      </header>

      {collectionsError && (
        <div className="collections-error" role="alert">
          <span>{collectionsError}</span>
          <button className="text-button" onClick={() => setReload((value) => value + 1)} type="button">
            Reintentar
          </button>
        </div>
      )}
      {actionError && <p className="collections-error" role="alert">{actionError}</p>}

      {!selectedCollection ? (
        <div className="collections-list">
          {collectionsLoading ? (
            <p className="collections-empty" role="status">Cargando colecciones…</p>
          ) : collections.length === 0 ? (
            <div className="collections-empty">
              <span className="collections-empty__icon"><Icon name="collections" /></span>
              <h2>Aún no tienes colecciones</h2>
              <p>Crea una colección para agrupar juegos sin cambiar sus favoritos, géneros o etiquetas.</p>
              <button className="text-button" onClick={() => setEditor("create")} type="button">
                Crear primera colección
              </button>
            </div>
          ) : (
            collections.map((collection) => (
              <button
                aria-label={`${collection.name}, ${collection.gameCount} juegos`}
                className="collection-card"
                key={collection.id}
                onClick={() => setSelectedId(collection.id)}
                type="button"
              >
                <span className="collection-card__icon"><Icon name="collections" /></span>
                <span className="collection-card__content">
                  <strong>{collection.name}</strong>
                  <small>{collection.description || "Colección personal"}</small>
                </span>
                <span className="collection-card__count">
                  {collection.gameCount} {collection.gameCount === 1 ? "juego" : "juegos"}
                </span>
                <Icon className="collection-card__chevron" name="chevron" />
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="collection-detail">
          <header className="collection-detail__header">
            <div>
              <button className="text-button collection-back" onClick={() => setSelectedId(null)} type="button">
                ← Todas las colecciones
              </button>
              <p className="eyebrow">COLECCIÓN MANUAL</p>
              <h2>{selectedCollection.name}</h2>
              {selectedCollection.description && <p>{selectedCollection.description}</p>}
              <span className="collection-detail__count">
                {selectedCollection.gameCount} {selectedCollection.gameCount === 1 ? "juego" : "juegos"}
              </span>
            </div>
            <div className="collection-detail__actions">
              <button className="secondary-button" onClick={() => setAddGamesOpen(true)} type="button">
                Añadir juegos
              </button>
              <button className="secondary-button" onClick={() => setEditor(selectedCollection)} type="button">
                Editar
              </button>
              <button className="secondary-button collection-danger" onClick={() => setConfirmDelete(true)} type="button">
                Eliminar
              </button>
            </div>
          </header>

          {membersError && (
            <div className="collections-error" role="alert">
              <span>{membersError}</span>
              <button className="text-button" onClick={() => setMembersReload((value) => value + 1)} type="button">
                Reintentar
              </button>
            </div>
          )}
          {membersLoading ? (
            <p className="collections-empty" role="status">Cargando juegos…</p>
          ) : members.length === 0 ? (
            <div className="collections-empty">
              <h3>Esta colección está vacía</h3>
              <p>Añade juegos existentes desde tu biblioteca. La colección no altera los datos del juego.</p>
              <button className="text-button" onClick={() => setAddGamesOpen(true)} type="button">
                Añadir juegos
              </button>
            </div>
          ) : (
            <div aria-label={`Juegos de ${selectedCollection.name}`} className="collection-games">
              {members.map((game) => (
                <article className="collection-game" key={game.id}>
                  <button className="collection-game__open" onClick={() => onOpenGame(game.id)} type="button">
                    <span className="collection-game__art">
                      {game.presentation.cover
                        ? <img alt="" loading="lazy" src={game.presentation.cover} />
                        : <span>{game.presentation.initials}</span>}
                    </span>
                    <span>
                      <strong>{game.metadata.title}</strong>
                      <small>{game.metadata.platform || "Plataforma sin especificar"}</small>
                    </span>
                  </button>
                  <button
                    aria-label={`Quitar ${game.metadata.title} de ${selectedCollection.name}`}
                    className="collection-game__remove"
                    disabled={busy}
                    onClick={() => void changeMembership(game, false)}
                    type="button"
                  >
                    Quitar
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {editor && (
        <CollectionEditor
          collection={editor === "create" ? null : editor}
          busy={busy}
          onClose={() => setEditor(null)}
          onSave={saveCollection}
        />
      )}
      {confirmDelete && selectedCollection && (
        <div className="dialog-backdrop">
          <section aria-labelledby="collection-delete-title" aria-modal="true" className="collection-dialog" role="dialog">
            <p className="eyebrow">ELIMINAR COLECCIÓN</p>
            <h2 id="collection-delete-title">¿Eliminar «{selectedCollection.name}»?</h2>
            <p>Se quitará esta agrupación y sus asociaciones. Los juegos seguirán en tu biblioteca.</p>
            <div className="collection-dialog__actions">
              <button className="secondary-button" disabled={busy} onClick={() => setConfirmDelete(false)} type="button">Cancelar</button>
              <button className="secondary-button collection-danger" disabled={busy} onClick={() => void removeSelectedCollection()} type="button">
                {busy ? "Eliminando…" : "Eliminar colección"}
              </button>
            </div>
          </section>
        </div>
      )}
      {addGamesOpen && selectedCollection && (
        <div className="dialog-backdrop">
          <section aria-labelledby="collection-add-title" aria-modal="true" className="collection-dialog collection-add-dialog" role="dialog">
            <header className="collection-dialog__header">
              <div>
                <p className="eyebrow">BIBLIOTECA</p>
                <h2 id="collection-add-title">Añadir juegos</h2>
              </div>
              <button aria-label="Cerrar" className="icon-button" onClick={() => setAddGamesOpen(false)} type="button">×</button>
            </header>
            <label className="collection-add-search">
              Buscar en la biblioteca
              <input autoFocus onChange={(event) => setGameQuery(event.target.value)} value={gameQuery} />
            </label>
            {gamesError ? (
              <div className="collections-error" role="alert">
                <span>{gamesError}</span>
                <button className="text-button" onClick={onRetryGames} type="button">Reintentar</button>
              </div>
            ) : gamesLoading ? (
              <p className="collections-empty" role="status">Cargando biblioteca…</p>
            ) : availableGames.length === 0 ? (
              <p className="collections-empty">No hay juegos que coincidan con la búsqueda.</p>
            ) : (
              <div className="collection-add-list">
                {availableGames.map((game) => (
                  <div className="collection-add-row" key={game.id}>
                    <span>{game.metadata.title}</span>
                    <button
                      className="secondary-button"
                      disabled={busy || memberIds.has(game.id)}
                      onClick={() => void changeMembership(game, true)}
                      type="button"
                    >
                      {memberIds.has(game.id) ? "Añadido" : busy ? "Guardando…" : "Añadir"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

function CollectionEditor({
  collection,
  busy,
  onClose,
  onSave,
}: {
  collection: CollectionSummary | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: CollectionInput) => Promise<void>;
}) {
  const [name, setName] = useState(collection?.name ?? "");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSave({ name, description });
    } catch (saveError) {
      setError(messageOf(saveError));
    }
  }

  return (
    <div className="dialog-backdrop">
      <section aria-labelledby="collection-editor-title" aria-modal="true" className="collection-dialog" role="dialog">
        <header className="collection-dialog__header">
          <div>
            <p className="eyebrow">COLECCIONES</p>
            <h2 id="collection-editor-title">{collection ? "Editar colección" : "Nueva colección"}</h2>
          </div>
          <button aria-label="Cerrar formulario" className="icon-button" disabled={busy} onClick={onClose} type="button">×</button>
        </header>
        <form className="collection-editor-form" onSubmit={(event) => void submit(event)}>
          <label>
            Nombre
            <input autoFocus maxLength={500} onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label>
            Descripción <span>(opcional)</span>
            <textarea maxLength={100000} onChange={(event) => setDescription(event.target.value)} rows={4} value={description} />
          </label>
          {error && <p className="collections-error" role="alert">{error}</p>}
          <div className="collection-dialog__actions">
            <button className="secondary-button" disabled={busy} onClick={onClose} type="button">Cancelar</button>
            <button className="primary-button" disabled={busy || !name.trim()} type="submit">
              {busy ? "Guardando…" : collection ? "Guardar cambios" : "Crear colección"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
