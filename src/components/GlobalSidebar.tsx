import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import type { Destination } from "../app/navigation";

interface GlobalSidebarProps {
  activeDestination: Destination;
  libraryVisible: boolean;
  onNavigate: (destination: Destination) => void;
  onToggleLibrary: () => void;
  onEnterBigPicture: () => void;
}

const primaryNavigation: { id: Destination; label: string; icon: IconName }[] = [
  { id: "desktop", label: "Modo escritorio", icon: "desktop" },
  { id: "library", label: "Biblioteca", icon: "library" },
  { id: "favorites", label: "Favoritos", icon: "heart" },
  { id: "collections", label: "Colecciones", icon: "collections" },
  { id: "statistics", label: "Estadísticas", icon: "statistics" },
  { id: "extensions", label: "Complementos", icon: "extensions" },
];

export function GlobalSidebar({
  activeDestination,
  libraryVisible,
  onNavigate,
  onToggleLibrary,
  onEnterBigPicture,
}: GlobalSidebarProps) {
  return (
    <nav aria-label="Navegación principal" className="global-sidebar">
      <button
        aria-label="Kiwanto, modo escritorio"
        className="brand-mark"
        onClick={() => onNavigate("desktop")}
        title="Modo escritorio"
        type="button"
      >
        <span className="brand-mark__glyph">k</span>
      </button>

      <div className="global-sidebar__navigation">
        {primaryNavigation.map((item) => (
          <button
            aria-current={activeDestination === item.id ? "page" : undefined}
            className={`nav-icon-button${activeDestination === item.id ? " is-active" : ""}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            type="button"
          >
            <Icon name={item.icon} />
            <span className="visually-hidden">{item.label}</span>
            {item.id === "extensions" && <span className="nav-future-dot" />}
          </button>
        ))}
      </div>

      <div className="global-sidebar__bottom">
        <button
          aria-label="Cambiar a Big Picture"
          className="nav-icon-button nav-icon-button--muted"
          onClick={onEnterBigPicture}
          title="Big Picture"
          type="button"
        >
          <span className="bp-sidebar-mark" aria-hidden="true">TV</span>
          <span className="visually-hidden">Big Picture</span>
        </button>
        <button
          aria-label={libraryVisible ? "Ocultar biblioteca" : "Mostrar biblioteca"}
          aria-pressed={!libraryVisible}
          className="nav-icon-button nav-icon-button--muted"
          onClick={onToggleLibrary}
          title={libraryVisible ? "Ocultar biblioteca" : "Mostrar biblioteca"}
          type="button"
        >
          <Icon name={libraryVisible ? "hide" : "show"} />
          <span className="visually-hidden">
            {libraryVisible ? "Ocultar biblioteca" : "Mostrar biblioteca"}
          </span>
        </button>
        <span className="sidebar-divider" />
        <button
          aria-current={activeDestination === "settings" ? "page" : undefined}
          className={`nav-icon-button nav-icon-button--muted${activeDestination === "settings" ? " is-active" : ""}`}
          onClick={() => onNavigate("settings")}
          title="Configuración"
          type="button"
        >
          <Icon name="settings" />
          <span className="visually-hidden">Configuración</span>
        </button>
        <div aria-label="Versión de demostración" className="sidebar-avatar">
          K
        </div>
      </div>
    </nav>
  );
}
