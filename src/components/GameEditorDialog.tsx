import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Game } from "../library/models";
import type { CanonicalGenre, GameInput } from "../library/service";
import { getLaunchProfile, listGameRelations } from "../library/service";
import type { GameRelationType, LaunchProfile, LaunchProfileInput } from "../library/service";
import { GenreMultiSelect } from "./GenreMultiSelect";

interface GameEditorDialogProps {
  game: Game | null;
  availableGames: Game[];
  genres: CanonicalGenre[];
  genresLoading: boolean;
  genreError: string;
  onClose: () => void;
  onSave: (input: GameInput, relations: Array<{relatedGameId:string;relationType:GameRelationType}>, launchProfile: LaunchProfileInput | null) => Promise<string>;
}

export function GameEditorDialog({
  game,
  availableGames,
  genres,
  genresLoading,
  genreError,
  onClose,
  onSave,
}: GameEditorDialogProps) {
  const [dialogElement, setDialogElement] = useState<HTMLElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(game?.metadata.title ?? "");
  const [developer, setDeveloper] = useState(game?.metadata.developer ?? "");
  const [publisher, setPublisher] = useState(game?.metadata.publisher ?? "");
  const [year, setYear] = useState(game?.metadata.year?.toString() ?? "");
  const [genreIds, setGenreIds] = useState(game?.metadata.genreIds ?? []);
  const [rating, setRating] = useState(game?.metadata.rating ?? "");
  const [score, setScore] = useState(game?.metadata.score?.toString() ?? "");
  const [platform, setPlatform] = useState(game?.metadata.platform ?? "");
  const [systems, setSystems] = useState<string[]>(game?.metadata.systems ?? []);
  const [newSystem, setNewSystem] = useState("");
  const [description, setDescription] = useState(
    game?.metadata.description ?? "",
  );
  const [formError, setFormError] = useState("");
  const [relations, setRelations] = useState<Array<{relatedGameId:string;relationType:GameRelationType}>>([]);
  const [relationTarget, setRelationTarget] = useState("");
  const [relationType, setRelationType] = useState<GameRelationType>("sequel");
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [relationsLoadError, setRelationsLoadError] = useState("");
  const [tab, setTab] = useState<"information" | "execution">("information");
  const [launchProfile, setLaunchProfile] = useState<LaunchProfile | null>(null);
  const [launchLoading, setLaunchLoading] = useState(!!game);
  const [launchError, setLaunchError] = useState("");
  const [executablePath, setExecutablePath] = useState("");
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [argumentsText, setArgumentsText] = useState("");
  const yearOptions = useMemo(() => [...new Set(availableGames.map((candidate) => candidate.metadata.year).filter((value): value is number => value !== null))].sort((a, b) => b - a), [availableGames]);
  const ratingOptions = useMemo(() => [...new Set(availableGames.map((candidate) => candidate.metadata.rating.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [availableGames]);
  const platformOptions = useMemo(() => [...new Set(availableGames.map((candidate) => candidate.metadata.platform.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [availableGames]);
  const systemOptions = useMemo(() => [...new Set([...availableGames.flatMap((candidate) => candidate.metadata.systems), ...systems])].filter(Boolean).sort((a, b) => a.localeCompare(b)), [availableGames, systems]);

  useEffect(() => {
    if (!game) return;
    let active = true;
    setLaunchLoading(true);
    getLaunchProfile(game.id).then((profile) => {
      if (!active) return;
      setLaunchProfile(profile);
      setExecutablePath(profile?.executablePath ?? "");
      setWorkingDirectory(profile?.workingDirectory ?? "");
      setArgumentsText(profile?.arguments.join("\n") ?? "");
    }).catch((error: unknown) => {
      if (active) setLaunchError(error instanceof Error ? error.message : String(error));
    }).finally(() => { if (active) setLaunchLoading(false); });
    return () => { active = false; };
  }, [game?.id]);

  useEffect(() => {
    if (!game) { setRelations([]); return; }
    let active=true; setRelationsLoading(true);setRelationsLoadError("");
    listGameRelations(game.id).then(items=>{if(active)setRelations(items.map(item=>({relatedGameId:item.relatedGame.id,relationType:item.relationType})));}).catch((error:unknown)=>{if(active)setRelationsLoadError(error instanceof Error?error.message:String(error));}).finally(()=>{if(active)setRelationsLoading(false);});
    return ()=>{active=false;};
  },[game?.id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if(relationsLoading||relationsLoadError||launchLoading||launchError){setFormError(relationsLoadError||launchError||"Espera a que se carguen los datos del juego.");return;}
    const parsedYear = year.trim() ? Number(year) : null;
    const parsedScore = score.trim() ? Number(score) : null;
    if (
      (parsedYear !== null && !Number.isInteger(parsedYear)) ||
      (parsedScore !== null && !Number.isFinite(parsedScore))
    ) {
      setFormError("Revisa el año y la puntuación.");
      return;
    }

    setSaving(true);
    try {
      const savedId = await onSave({
        title,
        developer,
        publisher,
        year: parsedYear,
        genreIds,
        rating,
        score: parsedScore,
        platform,
        systems,
        description,
      }, relations, executablePath.trim() ? {
        executablePath,
        workingDirectory: workingDirectory.trim() || null,
        arguments: argumentsText.split("\n").filter((argument) => argument.length > 0),
      } : launchProfile);
      if (!savedId) throw new Error("No se pudo confirmar el identificador del juego guardado.");
    } catch (saveError) {
      setFormError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop">
      <section
        aria-labelledby="game-editor-title"
        aria-modal="true"
        className="game-editor"
        ref={setDialogElement}
        role="dialog"
      >
        <header className="game-editor__header">
          <div>
            <p className="eyebrow">BIBLIOTECA</p>
            <h2 id="game-editor-title">
              {game ? "Editar juego" : "Añadir juego"}
            </h2>
          </div>
          <button
            aria-label="Cerrar formulario"
            className="icon-button"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        <nav aria-label="Secciones del editor" className="game-editor__tabs" role="tablist">
          <button aria-selected={tab === "information"} className={tab === "information" ? "is-active" : ""} onClick={() => setTab("information")} role="tab" type="button">Información</button>
          <button aria-selected={tab === "execution"} className={tab === "execution" ? "is-active" : ""} onClick={() => setTab("execution")} role="tab" type="button">Ejecución y ubicación</button>
        </nav>
        <form className={`game-editor__form game-editor__form--${tab}`} onSubmit={submit}>
          {tab === "information" ? <>
          <div className="game-editor__identity">
          <label>
            Título
            <input
              autoFocus
              maxLength={300}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </label>
          <div className="game-editor__row">
            <label>
              Desarrollador
              <input
                maxLength={500}
                onChange={(event) => setDeveloper(event.target.value)}
                value={developer}
              />
            </label>
            <label>
              Editor
              <input
                maxLength={500}
                onChange={(event) => setPublisher(event.target.value)}
                value={publisher}
              />
            </label>
          </div>
          </div>
          <div className="game-editor__details">
          <div className="game-editor__compact">
          <div className="game-editor__row game-editor__row--primary-metadata">
              <label>
              Año de lanzamiento
              <input
                  list="game-editor-years"
                inputMode="numeric"
                onChange={(event) => setYear(event.target.value)}
                  placeholder="Elegir o escribir un año"
                  type="text"
                value={year}
              />
                <datalist id="game-editor-years">{yearOptions.map((option) => <option key={option} value={option} />)}</datalist>
            </label>
            <label>
                Puntuación personal (0–100)
              <input
                max="100"
                min="0"
                onChange={(event) => setScore(event.target.value)}
                step="any"
                type="number"
                value={score}
              />
                <small>Es una valoración manual; las puntuaciones externas tendrán sus propias fuentes y escalas.</small>
            </label>
              <label className="game-editor__age-rating">
                Rango de edad
                <input
                  list="game-editor-ratings"
                  maxLength={500}
                  onChange={(event) => setRating(event.target.value)}
                  placeholder="Elegir o escribir un rango"
                  value={rating}
                />
                <datalist id="game-editor-ratings">{ratingOptions.map((option) => <option key={option} value={option} />)}</datalist>
              </label>
          </div>
          <div className="game-editor__row">
            <label>
              Plataforma de origen
              <input
                  list="game-editor-platforms"
                maxLength={500}
                onChange={(event) => setPlatform(event.target.value)}
                  placeholder="Elegir o escribir una plataforma"
                value={platform}
              />
                <datalist id="game-editor-platforms">{platformOptions.map((option) => <option key={option} value={option} />)}</datalist>
            </label>
            <div className="game-editor__field game-editor__system-picker">
              <span>Sistemas (puedes elegir varios)</span>
              <details>
                <summary>{systems.length ? `${systems.length} seleccionados` : "Seleccionar sistemas"}</summary>
                <div className="game-editor__system-options" role="group" aria-label="Sistemas asociados">
                  {systemOptions.map((system) => <label key={system}><input checked={systems.includes(system)} onChange={(event) => setSystems((current) => event.target.checked ? [...current, system] : current.filter((value) => value !== system))} type="checkbox"/><span>{system}</span></label>)}
                  {systemOptions.length === 0 && <span>No hay sistemas en la biblioteca todavía.</span>}
                </div>
              </details>
              <div className="game-editor__system-add"><input aria-label="Añadir otro sistema para este juego" maxLength={2000} onChange={(event) => setNewSystem(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); const value = newSystem.trim(); if (value && !systems.includes(value)) setSystems((current) => [...current, value]); setNewSystem(""); } }} placeholder="Añadir un sistema" value={newSystem}/><button className="secondary-button" disabled={!newSystem.trim() || systems.includes(newSystem.trim())} onClick={() => { const value = newSystem.trim(); if (value) setSystems((current) => current.includes(value) ? current : [...current, value]); setNewSystem(""); }} type="button">Añadir</button></div>
              {systems.length > 0 && <div className="game-editor__system-selected" aria-label="Sistemas elegidos">{systems.map((system) => <button key={system} onClick={() => setSystems((current) => current.filter((value) => value !== system))} title={`Quitar ${system}`} type="button">{system} ×</button>)}</div>}
            </div>
          </div>
          </div>
          <div className="game-editor__content-fields">
          <div className="game-editor__genre-field">
            <span>Géneros canónicos</span>
            <GenreMultiSelect
              disabled={saving}
              error={genreError}
              genres={genres}
              loading={genresLoading}
              onChange={setGenreIds}
              portalTarget={dialogElement}
              pendingNames={game?.metadata.pendingGenres ?? []}
              selectedIds={genreIds}
            />
          </div>
          <label>
            Descripción
            <textarea
              maxLength={100000}
              onChange={(event) => setDescription(event.target.value)}
              rows={12}
              value={description}
            />
          </label>
          </div>
          </div>
          <section aria-label="Relaciones con otros juegos" className="game-editor__relations">
            <div className="game-editor__relations-heading"><div><span>Relaciones</span><small>Se guardan junto con los datos de este juego.</small></div></div>
            <div className="game-editor__relation-add">
              <select aria-label="Juego relacionado" disabled={saving||relationsLoading} onChange={event=>setRelationTarget(event.target.value)} value={relationTarget}><option value="">Selecciona un juego</option>{availableGames.filter(candidate=>candidate.id!==game?.id&&!relations.some(relation=>relation.relatedGameId===candidate.id)).map(candidate=><option key={candidate.id} value={candidate.id}>{candidate.metadata.title}</option>)}</select>
              <select aria-label="Tipo de relación" disabled={saving} onChange={event=>setRelationType(event.target.value as GameRelationType)} value={relationType}>{(["prequel","sequel","spin_off","remake","remaster","other"] as GameRelationType[]).map(kind=><option key={kind} value={kind}>{({prequel:"Precuela",sequel:"Secuela",spin_off:"Spin-off",remake:"Remake",remaster:"Remasterización",other:"Other"})[kind]}</option>)}</select>
              <button className="secondary-button" disabled={!relationTarget||saving} onClick={()=>{setRelations(current=>[...current,{relatedGameId:relationTarget,relationType}]);setRelationTarget("");}} type="button">Añadir</button>
            </div>
            {relationsLoading?<p role="status">Cargando relaciones…</p>:relationsLoadError?<p className="game-editor__error" role="alert">No se pudieron recuperar las relaciones; guardar está deshabilitado. {relationsLoadError}</p>:relations.length===0?<p className="game-editor__relation-empty">Sin relaciones.</p>:<ul className="game-editor__relation-list">{relations.map((relation,index)=>{const related=availableGames.find(candidate=>candidate.id===relation.relatedGameId);return <li key={`${relation.relatedGameId}-${index}`}><span>{related?.metadata.title??"Juego no disponible"}</span><select aria-label={`Tipo de relación con ${related?.metadata.title??"juego"}`} disabled={saving} onChange={event=>setRelations(current=>current.map((item,itemIndex)=>itemIndex===index?{...item,relationType:event.target.value as GameRelationType}:item))} value={relation.relationType}>{(["prequel","sequel","spin_off","remake","remaster","other"] as GameRelationType[]).map(kind=><option key={kind} value={kind}>{kind.replace("_"," ")}</option>)}</select><button aria-label={`Quitar relación con ${related?.metadata.title??"juego"}`} disabled={saving} onClick={()=>setRelations(current=>current.filter((_,itemIndex)=>itemIndex!==index))} type="button">Quitar</button></li>})}</ul>}
          </section>
          </> : <section aria-label="Configuración de ejecución" className="game-editor__execution">
            <p>La ruta identifica el ejecutable local de este juego. Kiwanto no añade ni modifica opciones de lanzadores externos.</p>
            <label>Ruta absoluta del ejecutable<input autoComplete="off" disabled={launchLoading || saving} onChange={(event) => setExecutablePath(event.target.value)} placeholder="/home/usuario/Juegos/mi-juego" spellCheck={false} value={executablePath}/></label>
            <label>Carpeta de trabajo (opcional)<input autoComplete="off" disabled={launchLoading || saving} onChange={(event) => setWorkingDirectory(event.target.value)} placeholder="Usar la carpeta del ejecutable" spellCheck={false} value={workingDirectory}/></label>
            <label>Argumentos adicionales (opcional)<small>Un argumento por línea. Úsalos solo si el programa lo requiere.</small><textarea disabled={launchLoading || saving} onChange={(event) => setArgumentsText(event.target.value)} placeholder="Dejar vacío para no enviar argumentos" rows={5} value={argumentsText}/></label>
            {launchLoading && <p role="status">Cargando configuración…</p>}
            {launchError && <p className="game-editor__error" role="alert">No se pudo cargar la configuración de ejecución: {launchError}</p>}
          </section>}
          {formError && (
            <p className="game-editor__error" role="alert">
              {formError}
            </p>
          )}
          <footer className="game-editor__actions">
            <button
              className="text-button"
              disabled={saving}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
