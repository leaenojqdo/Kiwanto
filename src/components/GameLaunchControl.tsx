import { useEffect, useState } from "react";
import { getLaunchProfile, launchGame } from "../library/service";
import type { LaunchProfile } from "../library/service";
import { Icon } from "./Icon";

interface GameLaunchControlProps {
  gameId: string;
  disabled?: boolean;
  bigPicture?: boolean;
}

function messageOf(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return String(error);
}

export function GameLaunchControl({
  gameId,
  disabled = false,
  bigPicture = false,
}: GameLaunchControlProps) {
  const [profile, setProfile] = useState<LaunchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (disabled) {
      setLoading(false);
      setProfile(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    setStatus("");
    getLaunchProfile(gameId)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((loadError: unknown) => {
        if (active) setError(messageOf(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [disabled, gameId]);

  async function start() {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await launchGame(gameId);
      setStatus(`Proceso solicitado (PID ${result.processId}). Esto no confirma que el juego haya terminado de cargar.`);
    } catch (launchError) {
      setError(messageOf(launchError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`game-launch-control${bigPicture ? " game-launch-control--big-picture" : ""}`}>
      <div className="game-launch-control__buttons">
        <button
          className="play-button"
          disabled={disabled || loading || busy || !profile}
          onClick={() => void start()}
          type="button"
        >
          <Icon name="play" />
          <span>{loading ? "Comprobando…" : "Jugar"}</span>
        </button>
      </div>
      <p className="launch-hint" role="status">
        {disabled
          ? "Restaura el juego para poder lanzarlo."
          : loading
            ? "Consultando el perfil local…"
            : profile
              ? "Ejecutable local configurado."
              : "Sin perfil local: este juego no se puede iniciar todavía."}
      </p>
      {error && <p className="launch-feedback launch-feedback--error" role="alert">{error}</p>}
      {status && <p className="launch-feedback" role="status">{status}</p>}
    </div>
  );
}
