import { Icon } from "./Icon";

interface GameSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function GameSearch({ value, onChange }: GameSearchProps) {
  return (
    <label className="game-search">
      <Icon className="game-search__icon" name="search" />
      <span className="visually-hidden">Buscar juegos o escribir filtros con @</span>
      <input
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar o filtrar…"
        spellCheck="false"
        value={value}
      />
      {value ? (
        <button
          aria-label="Limpiar búsqueda"
          className="game-search__clear"
          onClick={() => onChange("")}
          type="button"
        >
          <Icon name="close" />
        </button>
      ) : (
        <kbd className="game-search__hint">@</kbd>
      )}
    </label>
  );
}
