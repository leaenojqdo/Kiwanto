import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { Game, GameLibraryStates } from "../library/models";
import { filterGames } from "../library/search";
import { keyboardNavigationIntent } from "../app/navigationInput";
import { nearestSpatialCandidate, restoreLibraryContext } from "../app/bigPictureNavigation";
import { listCollectionGames, listCollections } from "../library/service";
import type { CollectionSummary } from "../library/service";
import { GameLaunchControl } from "./GameLaunchControl";
import { Icon } from "./Icon";
import { GameRelationsView } from "./GameRelationsView";
import { GameContextMenu } from "./GameContextMenu";
import { GameDescriptionView } from "./GameDescriptionView";
import type { UserPreferences } from "../themes/model";

type BigPictureSection = "library" | "favorites" | "collections";

interface BigPictureProps {
  games: Game[];
  allGames: Game[];
  loading: boolean;
  loadError: string;
  operationError: string;
  onRetry: () => void;
  gameStates: GameLibraryStates;
  selectedGameId: string | null;
  onSelectGame: (id: string | null) => void;
  onToggleFavorite: (id: string) => void;
  onReturnDesktop: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  preferences: UserPreferences["bigPicture"];
  onPreferencesChange: (preferences: UserPreferences["bigPicture"]) => void | Promise<void>;
  onEditGame: (game:Game)=>void;
  onArchiveGame: (id:string)=>void;
  onContextError: (message:string)=>void;
  presentationStyle: CSSProperties;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function BigPicture({
  games,
  allGames,
  loading,
  loadError,
  operationError,
  onRetry,
  gameStates,
  selectedGameId,
  onSelectGame,
  onToggleFavorite,
  onReturnDesktop,
  query,
  onQueryChange,
  preferences,
  onPreferencesChange,
  onEditGame,
  onArchiveGame,
  onContextError,
  presentationStyle,
}: BigPictureProps) {
  const [section, setSection] = useState<BigPictureSection>("library");
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collectionGames, setCollectionGames] = useState<Game[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState("");
  const [collectionRefresh, setCollectionRefresh] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const collectionRequest = useRef(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchRestore, setSearchRestore] = useState<{ section: BigPictureSection; collectionId: string | null; selectedId: string | null; query: string } | null>(null);
  const [detailHistory, setDetailHistory] = useState<string[]>([]);
  const [presentationError, setPresentationError] = useState("");
  const [settingsOpen,setSettingsOpen]=useState(false);

  const activeCollection = collections.find((item) => item.id === activeCollectionId) ?? null;
  const visibleGames = useMemo(() => {
    if (section === "favorites") return games.filter((game) => gameStates[game.id]?.favorite);
    if (section === "collections" && activeCollectionId) return filterGames(collectionGames, gameStates, query);
    return games;
  }, [activeCollectionId, collectionGames, gameStates, games, query, section]);
  const selectedGame = visibleGames.find((game) => game.id === selectedGameId) ?? visibleGames[0] ?? null;
  const detailGame = detailId ? allGames.find((game) => game.id === detailId) ?? collectionGames.find((game) => game.id === detailId) ?? null : null;

  useEffect(() => {
    if (detailId) requestAnimationFrame(() => document.querySelector<HTMLElement>(".bp-full-detail .bp-detail-back")?.focus());
  }, [detailId]);
  useEffect(() => { if(settingsOpen)requestAnimationFrame(()=>document.querySelector<HTMLElement>(".bp-settings-dialog select")?.focus()); },[settingsOpen]);

  useEffect(() => {
    function shortcut(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") { event.preventDefault(); setSearchRestore({ section, collectionId: activeCollectionId, selectedId: selectedGameId, query }); setSearchOpen(true); }
    }
    window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut);
  }, [activeCollectionId, query, section, selectedGameId]);

  useEffect(() => {
    mainRef.current?.focus();
    let active = true;
    setCollectionsLoading(true);
    listCollections()
      .then((result) => {
        if (active) setCollections(result);
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
  }, []);

  useEffect(() => {
    if (section !== "collections" || !activeCollectionId) {
      setCollectionGames([]);
      setCollectionError("");
      return;
    }
    const requestId = ++collectionRequest.current;
    let active = true;
    setCollectionLoading(true);
    setCollectionError("");
    listCollectionGames(activeCollectionId)
      .then((entries) => {
        if (active && requestId === collectionRequest.current) {
          setCollectionGames(entries.map((entry) => entry.game));
        }
      })
      .catch((error: unknown) => {
        if (active && requestId === collectionRequest.current) setCollectionError(messageOf(error));
      })
      .finally(() => {
        if (active && requestId === collectionRequest.current) setCollectionLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeCollectionId, collectionRefresh, section]);

  useEffect(() => {
    if (section !== "collections" || !activeCollectionId || collectionLoading) return;
    requestAnimationFrame(() => (document.querySelector<HTMLElement>("[data-bp-game='true']") ?? document.querySelector<HTMLElement>(".bp-collection-title [data-bp-nav='true']"))?.focus());
  }, [activeCollectionId, collectionLoading, collectionGames.length, section]);

  function backToCollections() {
    const previousId = activeCollectionId;
    setActiveCollectionId(null);
    requestAnimationFrame(() => (previousId ? document.querySelector<HTMLElement>(`[data-collection-id='${CSS.escape(previousId)}']`) : null)?.focus());
  }

  function closeDetail() {
    const previousId = detailId;
    setDetailId(null);
    setDetailHistory([]);
    requestAnimationFrame(() => (previousId ? document.querySelector<HTMLElement>(`[data-game-id='${CSS.escape(previousId)}']`) : null)?.focus());
  }

  function returnFromDetail(){if(detailHistory.length){setDetailId(detailHistory[detailHistory.length-1]);setDetailHistory(current=>current.slice(0,-1));}else closeDetail();}

  function closeSettings(){setSettingsOpen(false);requestAnimationFrame(()=>document.querySelector<HTMLElement>(".bp-topbar__actions [aria-label='Configuración de Big Picture']")?.focus());}

  function openRelatedGame(game:Game) { if(detailId)setDetailHistory(current=>[...current,detailId]); setDetailId(game.id); }
  function openSharedCollection(collectionId:string){setDetailId(null);setDetailHistory([]);setSection("collections");setActiveCollectionId(collectionId);}

  useEffect(() => {
    const visibleIds = new Set(visibleGames.map((game) => game.id));
    if (!selectedGameId || !visibleIds.has(selectedGameId)) {
      onSelectGame(visibleGames[0]?.id ?? null);
    }
  }, [onSelectGame, selectedGameId, visibleGames]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const intent = keyboardNavigationIntent(event.key, event.shiftKey);
    if (intent?.type === "confirm") {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches("[data-bp-game='true']")) { event.preventDefault(); setDetailId(target.dataset.gameId ?? null); return; }
    }
    if (intent?.type === "back") {
      if (searchOpen) { closeSearch(); return; }
      if (settingsOpen) { closeSettings(); return; }
      if (detailId) { returnFromDetail(); return; }
      if (activeCollectionId) {
        backToCollections();
      } else {
        onReturnDesktop();
      }
      return;
    }
    if (intent?.type !== "move-focus") return;
    const eventTarget = event.target;
    if (eventTarget instanceof HTMLElement && (eventTarget.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(eventTarget.tagName))) return;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !event.currentTarget.contains(active)) return;
    const navigationScope = searchOpen ? event.currentTarget.querySelector<HTMLElement>(".bp-search-dialog") : settingsOpen ? event.currentTarget.querySelector<HTMLElement>(".bp-settings-dialog") : detailId ? event.currentTarget.querySelector<HTMLElement>(".bp-full-detail") : event.currentTarget;
    const nodes = [...(navigationScope ?? event.currentTarget).querySelectorAll<HTMLElement>("[data-bp-nav='true']:not(:disabled)")];
    const activeRect = active.getBoundingClientRect();
    const current = {
      x: activeRect.left + activeRect.width / 2,
      y: activeRect.top + activeRect.height / 2,
    };
    const focusCandidate = nearestSpatialCandidate(current, nodes.filter((node)=>node!==active).map((node)=>{const rect=node.getBoundingClientRect();return {value:node,x:rect.left+rect.width/2,y:rect.top+rect.height/2};}), intent.direction);
    if (focusCandidate) {
      event.preventDefault();
      focusCandidate.focus();
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    if (!searchRestore) return;
    const restored = restoreLibraryContext(searchRestore);
    setSection(restored.section); setActiveCollectionId(restored.collectionId); onQueryChange(restored.query); onSelectGame(restored.selectedId); setSearchRestore(null);
    requestAnimationFrame(()=>{const target=restored.selectedId?document.querySelector<HTMLElement>(`[data-game-id='${CSS.escape(restored.selectedId)}']`):null;(target??mainRef.current)?.focus();});
  }

  async function updatePresentation(next: UserPreferences["bigPicture"]) {
    setPresentationError("");
    try { await onPreferencesChange(next); }
    catch (error) { setPresentationError(messageOf(error)); }
  }

  return (
    <main
      aria-label="Big Picture"
      className={`big-picture bp--${preferences.coverOrientation} bp--${preferences.coverSize} bp--${preferences.density}`}
      style={{ ...presentationStyle, "--bp-scale": preferences.interfaceScale / 100 } as CSSProperties}
      onKeyDown={handleKeyDown}
      ref={mainRef}
      tabIndex={-1}
    >
      <header className="bp-topbar">
        <div className="bp-brand">
          <span className="bp-brand__mark">K</span>
          <span>Kiwanto <small>BIG PICTURE</small></span>
        </div>
        <nav aria-label="Secciones Big Picture" className="bp-sections">
          <button aria-pressed={section === "library"} className={section === "library" ? "is-active" : ""} data-bp-nav="true" onClick={() => { setSection("library"); setActiveCollectionId(null); requestAnimationFrame(()=>mainRef.current?.focus()); }} type="button">Biblioteca</button>
          <button aria-pressed={section === "favorites"} className={section === "favorites" ? "is-active" : ""} data-bp-nav="true" onClick={() => { setSection("favorites"); setActiveCollectionId(null); requestAnimationFrame(()=>mainRef.current?.focus()); }} type="button">Favoritos</button>
          <button aria-pressed={section === "collections"} className={section === "collections" ? "is-active" : ""} data-bp-nav="true" onClick={() => { setSection("collections"); setActiveCollectionId(null); requestAnimationFrame(()=>mainRef.current?.focus()); }} type="button">Colecciones</button>
        </nav>
        <div className="bp-topbar__actions">
          <button aria-label="Buscar" className="bp-icon-button" data-bp-nav="true" data-tooltip="Buscar" onClick={() => { setSearchRestore({section, collectionId: activeCollectionId, selectedId: selectedGameId, query}); setSearchOpen(true); }} title="Buscar" type="button"><Icon name="search" /></button>
          <button aria-label="Configuración de Big Picture" aria-pressed={settingsOpen} className={`bp-icon-button${settingsOpen?" is-active":""}`} data-bp-nav="true" data-tooltip="Configuración" onClick={()=>setSettingsOpen(value=>!value)} title="Configuración" type="button"><Icon name="settings" /></button>
          <button aria-label="Modo escritorio" className="bp-icon-button" data-bp-nav="true" data-tooltip="Modo escritorio" onClick={onReturnDesktop} title="Modo escritorio" type="button"><Icon name="desktop" /></button>
        </div>
      </header>

      <div className="bp-workspace">
        <section aria-label="Navegación de Big Picture" className="bp-library-area">
          <div className="bp-library-heading">
            <div>
              <p className="eyebrow">{activeCollection ? "COLECCIÓN" : "TU BIBLIOTECA"}</p>
              <h1>{activeCollection?.name ?? (section === "favorites" ? "Favoritos" : section === "collections" ? "Colecciones" : "Descubrir")}</h1>
            </div>
          </div>
          {operationError && <p className="bp-error" role="alert">{operationError}</p>}
          {presentationError && <p className="bp-error" role="alert">No se pudo guardar la presentación: {presentationError}</p>}

          {section === "collections" && !activeCollection && (
            <div aria-label="Colecciones manuales" className="bp-collection-strip">
              {collectionsLoading ? <p role="status">Cargando colecciones…</p> : collectionsError ? (
                <div className="bp-error" role="alert"><span>{collectionsError}</span><button className="bp-retry" data-bp-nav="true" onClick={() => { setCollectionsError(""); void listCollections().then(setCollections).catch((error: unknown) => setCollectionsError(messageOf(error))); }} type="button">Reintentar</button></div>
              ) : collections.length ? collections.map((collection) => (
                <button className={`bp-collection-chip${collection.id === activeCollectionId ? " is-active" : ""}`} data-bp-nav="true" data-collection-id={collection.id} key={collection.id} onClick={() => setActiveCollectionId(collection.id)} type="button">
                  <span>{collection.name}</span><small>{collection.gameCount} juegos</small>
                </button>
              )) : <p>Aún no hay colecciones. Puedes crearlas desde Desktop Mode.</p>}
            </div>
          )}

          {activeCollection && <div className="bp-collection-title"><button className="bp-back" data-bp-nav="true" onClick={backToCollections} type="button">← Colecciones</button><p>{activeCollection.description || "Colección personal"}</p></div>}

          <div aria-label="Juegos" aria-live="polite" className="bp-game-grid">
            {section === "collections" && !activeCollection ? null : loading && !activeCollectionId ? <p className="bp-state" role="status">Cargando biblioteca…</p> : loadError && !activeCollectionId ? <div className="bp-state bp-error" role="alert"><span>{loadError}</span><button className="bp-retry" data-bp-nav="true" onClick={onRetry} type="button">Reintentar</button></div> : collectionLoading ? <p className="bp-state" role="status">Cargando juegos de la colección…</p> : collectionError ? <div className="bp-state bp-error" role="alert"><span>{collectionError}</span><button className="bp-retry" data-bp-nav="true" onClick={() => setCollectionRefresh((value) => value + 1)} type="button">Reintentar</button></div> : visibleGames.length ? visibleGames.map((game) => (
              <GameContextMenu activeCollectionId={activeCollectionId} game={game} key={game.id} mode="big-picture" onArchive={()=>onArchiveGame(game.id)} onCollectionChanged={()=>{setCollectionRefresh(value=>value+1);void listCollections().then(setCollections);}} onEdit={()=>onEditGame(game)} onError={onContextError} onOpen={()=>{onSelectGame(game.id);setDetailHistory([]);setDetailId(game.id);}} onToggleFavorite={()=>onToggleFavorite(game.id)} state={gameStates[game.id]??{favorite:false,installed:false}}>
              <button
                aria-pressed={game.id === selectedGame?.id}
                className={`bp-game-card${game.id === selectedGame?.id ? " is-selected" : ""}`}
                data-bp-nav="true"
                data-bp-game="true"
                data-game-id={game.id}
                onClick={() => { onSelectGame(game.id); setDetailHistory([]); setDetailId(game.id); }}
                onFocus={() => onSelectGame(game.id)}
                type="button"
              >
                <span className="bp-game-card__art" style={{ "--bp-game-accent": game.presentation.accent } as CSSProperties}>
                  {game.presentation.cover ? <img alt="" loading="lazy" src={game.presentation.cover} /> : <span>{game.presentation.initials}</span>}
                  {gameStates[game.id]?.favorite && <span className="bp-game-card__favorite" aria-label="Favorito">♥</span>}
                </span>
                <span className="bp-game-card__title">{game.metadata.title}</span>
                <span className="bp-game-card__platform">{game.metadata.platform}</span>
              </button>
              </GameContextMenu>
              )) : <div className="bp-state"><span className="bp-empty-mark">✦</span><h2>{section === "favorites" ? "Aún no tienes favoritos" : activeCollection ? "Esta colección está vacía" : "Tu biblioteca está vacía"}</h2><p>{section === "favorites" ? "Marca un juego con el corazón para encontrarlo aquí." : activeCollection ? "Añade juegos desde Desktop Mode; aparecerán aquí al instante." : "Añade tus juegos desde Desktop Mode para verlos aquí."}</p></div>}
          </div>
        </section>

        {selectedGame && !(section === "collections" && !activeCollection) && <aside aria-label="Previsualización del juego seleccionado" className="bp-preview" key={selectedGame.id}><h2>{selectedGame.metadata.title}</h2><p className="bp-preview__description">{selectedGame.metadata.description||"Sin descripción disponible."}</p><p className="bp-preview__meta">{selectedGame.metadata.year??"Año desconocido"} <span aria-hidden="true">·</span> {selectedGame.metadata.platform}{selectedGame.metadata.systems.length>0?` · ${selectedGame.metadata.systems.join(", ")}`:""}</p></aside>}
      </div>
      {settingsOpen && <div className="bp-settings-scrim" onMouseDown={event=>{if(event.target===event.currentTarget)setSettingsOpen(false);}}><section aria-label="Configuración de Big Picture" aria-modal="true" className="bp-settings-dialog" role="dialog"><header><div><p className="eyebrow">PRESENTACIÓN</p><h2>Big Picture</h2></div><button aria-label="Cerrar configuración" className="bp-icon-button" data-bp-nav="true" onClick={closeSettings} type="button"><Icon name="close"/></button></header><label>Escala de interfaz<select data-bp-nav="true" onChange={e=>void updatePresentation({...preferences,interfaceScale:Number(e.target.value)})} value={preferences.interfaceScale}>{[80,90,100,110,120].map(n=><option key={n} value={n}>{n}%</option>)}</select></label><label>Tamaño de carátulas<select data-bp-nav="true" onChange={e=>void updatePresentation({...preferences,coverSize:e.target.value as "small"|"medium"|"large"})} value={preferences.coverSize}><option value="small">Pequeño</option><option value="medium">Mediano</option><option value="large">Grande</option></select></label><label>Densidad<select data-bp-nav="true" onChange={e=>void updatePresentation({...preferences,density:e.target.value as "compact"|"comfortable"})} value={preferences.density}><option value="compact">Compacta</option><option value="comfortable">Cómoda</option></select></label><label>Formato de carátulas<select data-bp-nav="true" onChange={e=>void updatePresentation({...preferences,coverOrientation:e.target.value as "portrait"|"landscape"})} value={preferences.coverOrientation}><option value="portrait">Vertical</option><option value="landscape">Horizontal</option></select></label>{presentationError&&<p role="alert">{presentationError}</p>}</section></div>}
      {searchOpen && <div className="bp-search-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeSearch(); }}><section aria-label="Buscar en la biblioteca" aria-modal="true" className="bp-search-dialog" role="dialog"><button aria-label="Cerrar búsqueda" className="bp-search-close" data-bp-nav="true" onClick={closeSearch} type="button">×</button><label><Icon name="search"/><input autoFocus data-bp-nav="true" onChange={(event)=>onQueryChange(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"&&visibleGames[0]){onSelectGame(visibleGames[0].id);setDetailHistory([]);setDetailId(visibleGames[0].id);setSearchOpen(false);}}} placeholder="Buscar juegos…" value={query}/></label><p>Escribe para filtrar; Enter abre el primer resultado. Escape restaura tu vista.</p></section></div>}
      {detailGame && <section aria-label={`Detalles de ${detailGame.metadata.title}`} className="bp-full-detail">
        <button className="bp-detail-back" data-bp-nav="true" onClick={returnFromDetail} type="button">← Volver a la biblioteca</button>
        <div className="bp-full-detail__body">
          <div className="bp-detail-art" style={{"--bp-game-accent":detailGame.presentation.accent} as CSSProperties}>{detailGame.presentation.cover?<img alt={`Carátula de ${detailGame.metadata.title}`} src={detailGame.presentation.cover}/>:<span>{detailGame.presentation.initials}</span>}</div>
          <div><p className="eyebrow">{detailGame.metadata.platform}{detailGame.metadata.year ? ` · ${detailGame.metadata.year}` : ""}</p><h1>{detailGame.metadata.title}</h1>{detailGame.metadata.description ? <GameDescriptionView className="bp-detail-description" text={detailGame.metadata.description} /> : <p className="bp-detail-description">Sin descripción disponible.</p>}
            <dl className="bp-full-meta">{detailGame.metadata.developer && <><dt>Desarrollador</dt><dd>{detailGame.metadata.developer}</dd></>}{detailGame.metadata.publisher && <><dt>Distribuidor</dt><dd>{detailGame.metadata.publisher}</dd></>}{detailGame.metadata.genre.length>0 && <><dt>Géneros</dt><dd>{detailGame.metadata.genre.join(" · ")}</dd></>}{detailGame.metadata.systems.length>0 && <><dt>Sistemas</dt><dd>{detailGame.metadata.systems.join(" · ")}</dd></>}</dl>
            <div className="bp-detail-actions"><GameLaunchControl bigPicture gameId={detailGame.id}/><button className="bp-detail-edit" data-bp-nav="true" onClick={()=>onEditGame(detailGame)} type="button">Editar</button><button aria-pressed={!!gameStates[detailGame.id]?.favorite} className="bp-favorite" data-bp-nav="true" onClick={()=>onToggleFavorite(detailGame.id)} type="button"><Icon name="heart"/> {gameStates[detailGame.id]?.favorite?"En favoritos":"Añadir a favoritos"}</button></div>
          </div>
        </div>
        <GameRelationsView className="game-relations--big-picture" gameId={detailGame.id} games={allGames} onOpenCollection={openSharedCollection} onOpenGame={openRelatedGame}/>
      </section>}
      <footer className="bp-footer"><span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> Navegar</span><span><kbd>Enter</kbd> Seleccionar</span><span><kbd>Esc</kbd> Volver</span><span>Tab también recorre todos los controles</span></footer>
    </main>
  );
}
