import { useState } from "react";
import type { ThemeId } from "../themes/model";
import { builtInThemes } from "../themes/definitions";
import { Icon } from "./Icon";

type SettingsCategory =
  | "appearance"
  | "layout"
  | "themes"
  | "effects"
  | "accessibility"
  | "general";

interface SettingsPageProps {
  themeId: ThemeId;
  loadError: string;
  onThemeChange: (themeId: ThemeId) => Promise<void>;
  onReset: () => Promise<void>;
}

const categories: { id: SettingsCategory; label: string; icon: "settings" | "covers" | "sliders" | "filter" | "desktop" | "library" }[] = [
  { id: "appearance", label: "Apariencia", icon: "desktop" },
  { id: "layout", label: "Diseño e interfaz", icon: "covers" },
  { id: "themes", label: "Temas", icon: "library" },
  { id: "effects", label: "Rendimiento y efectos", icon: "sliders" },
  { id: "accessibility", label: "Accesibilidad", icon: "filter" },
  { id: "general", label: "General", icon: "settings" },
];

const futureContent: Record<Exclude<SettingsCategory, "appearance">, { title: string; description: string }> = {
  layout: {
    title: "Diseño e interfaz",
    description: "La personalización de distribuciones y paneles se incorporará en una etapa posterior.",
  },
  themes: {
    title: "Temas",
    description: "La selección básica de apariencia está disponible en Apariencia. La creación, edición e importación de temas todavía no están implementadas.",
  },
  effects: {
    title: "Rendimiento y efectos",
    description: "Los controles de efectos, fondos y rendimiento aún no están disponibles.",
  },
  accessibility: {
    title: "Accesibilidad",
    description: "Aquí se agruparán futuras preferencias de accesibilidad. La aplicación ya respeta la preferencia del sistema para reducir movimiento.",
  },
  general: {
    title: "General",
    description: "Las preferencias generales de la aplicación se añadirán más adelante.",
  },
};

export function SettingsPage({
  themeId,
  loadError,
  onThemeChange,
  onReset,
}: SettingsPageProps) {
  const [category, setCategory] = useState<SettingsCategory>("appearance");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  async function applyTheme(nextTheme: ThemeId) {
    setSaving(true);
    setActionError("");
    try {
      await onThemeChange(nextTheme);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  async function resetPreferences() {
    setSaving(true);
    setActionError("");
    try {
      await onReset();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-label="Configuración" className="settings-page">
      <header className="settings-page__topbar">
        <p className="eyebrow">KIWANTO · PREFERENCIAS</p>
        <h1>Configuración</h1>
      </header>
      <div className="settings-layout">
        <nav aria-label="Categorías de configuración" className="settings-nav">
          {categories.map((item) => (
            <button
              aria-current={category === item.id ? "page" : undefined}
              className={`settings-nav__item${category === item.id ? " is-active" : ""}`}
              key={item.id}
              onClick={() => setCategory(item.id)}
              type="button"
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="settings-content">
          {category === "appearance" ? (
            <>
              <div className="settings-content__heading">
                <p className="eyebrow">PRESENTACIÓN</p>
                <h2>Apariencia</h2>
                <p>Elige la apariencia básica de Kiwanto. El cambio se guarda en este equipo.</p>
              </div>
              <fieldset className="theme-choices" disabled={saving || Boolean(loadError)}>
                <legend>Tema de color</legend>
                {Object.values(builtInThemes).map((theme) => (
                  <label
                    className={`theme-choice${themeId === theme.id ? " is-selected" : ""}`}
                    key={theme.id}
                  >
                    <input
                      checked={themeId === theme.id}
                      name="theme"
                      onChange={() => void applyTheme(theme.id)}
                      type="radio"
                      value={theme.id}
                    />
                    <span aria-hidden="true" className={`theme-choice__swatch theme-choice__swatch--${theme.appearance}`}>
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="theme-choice__copy">
                      <strong>{theme.name}</strong>
                      <small>{theme.description}</small>
                    </span>
                    <span aria-hidden="true" className="theme-choice__selected">
                      <Icon name="check" />
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="settings-actions">
                <button
                  className="settings-reset"
                  disabled={saving}
                  onClick={() => void resetPreferences()}
                  type="button"
                >
                  Restaurar valores predeterminados
                </button>
                {saving && <span role="status">Guardando…</span>}
              </div>
            </>
          ) : (
            <div className="settings-future">
              <span aria-hidden="true" className="settings-future__icon">
                <Icon name="settings" />
              </span>
              <p className="eyebrow">PREFERENCIA FUTURA</p>
              <h2>{futureContent[category].title}</h2>
              <p>{futureContent[category].description}</p>
            </div>
          )}
          {(loadError || actionError) && (
            <p className="settings-error" role="alert">
              No se pudo guardar o cargar la preferencia. {actionError || loadError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
