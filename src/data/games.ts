import emberCover from "../assets/games/emberlight.svg";
import farHarborCover from "../assets/games/far-harbor.svg";
import glasshouseCover from "../assets/games/glasshouse.svg";
import hollowSignalCover from "../assets/games/hollow-signal.svg";
import northstarCover from "../assets/games/northstar.svg";
import velvetDepthsCover from "../assets/games/velvet-depths.svg";
import type { Game, GameLibraryStates } from "../library/models";

export const games: Game[] = [
  {
    id: "emberlight",
    metadata: {
      title: "Emberlight",
      developer: "Northbound Studio",
      publisher: "Northbound Studio",
      year: 2024,
      genre: ["Aventura", "Rol"],
      rating: "PEGI 12",
      platform: "Linux",
      systems: ["Linux", "Windows"],
      description:
        "Cruza un reino cubierto de ceniza, descubre los recuerdos que dejaron sus habitantes y devuelve la luz a los faros olvidados.",
    },
    presentation: {
      cover: emberCover,
      accent: "#d98a58",
      initials: "EL",
    },
  },
  {
    id: "hollow-signal",
    metadata: {
      title: "Hollow Signal",
      developer: "Quiet Current",
      publisher: "Quiet Current",
      year: 2023,
      genre: ["Terror", "Aventura"],
      rating: "PEGI 16",
      platform: "Windows",
      systems: ["Windows"],
      description:
        "Una transmisión interrumpida llega desde una estación polar deshabitada. Sigue la señal y reconstruye lo ocurrido durante la noche más larga.",
    },
    presentation: {
      cover: hollowSignalCover,
      accent: "#8fb9ad",
      initials: "HS",
    },
  },
  {
    id: "glasshouse",
    metadata: {
      title: "The Glasshouse",
      developer: "Soft Geometry",
      publisher: "Soft Geometry",
      year: 2025,
      genre: ["Puzles", "Aventura"],
      rating: "PEGI 7",
      platform: "Linux",
      systems: ["Linux", "Windows"],
      description:
        "Ordena habitaciones imposibles en una casa de cristal. Cada reflejo revela otra perspectiva y una nueva manera de avanzar.",
    },
    presentation: {
      cover: glasshouseCover,
      accent: "#dba9c0",
      initials: "TG",
    },
  },
  {
    id: "northstar",
    metadata: {
      title: "Northstar Drift",
      developer: "Lantern Works",
      publisher: "Lantern Works",
      year: 2022,
      genre: ["Carreras", "Arcade"],
      rating: "PEGI 3",
      platform: "Linux",
      systems: ["Linux"],
      description:
        "Traza rutas luminosas entre lunas heladas y busca la línea perfecta en carreras donde el horizonte nunca permanece quieto.",
    },
    presentation: {
      cover: northstarCover,
      accent: "#76c6d6",
      initials: "ND",
    },
  },
  {
    id: "velvet-depths",
    metadata: {
      title: "Velvet Depths",
      developer: "Blue Hour Atelier",
      publisher: "Blue Hour Atelier",
      year: 2021,
      genre: ["Terror", "Misterio"],
      rating: "PEGI 18",
      platform: "Windows",
      systems: ["Windows"],
      description:
        "Explora un hotel sumergido donde los pasillos cambian con la marea y cada habitación conserva una historia sin resolver.",
    },
    presentation: {
      cover: velvetDepthsCover,
      accent: "#a481b8",
      initials: "VD",
    },
  },
  {
    id: "far-harbor",
    metadata: {
      title: "Far Harbor Letters",
      developer: "Small Weather",
      publisher: "Small Weather",
      year: 2020,
      genre: ["Aventura", "Narrativa"],
      rating: "PEGI 7",
      platform: "Linux",
      systems: ["Linux", "Windows"],
      description:
        "Ordena cartas que nunca llegaron a destino y acompaña a una pequeña comunidad costera a través de cuatro estaciones.",
    },
    presentation: {
      cover: farHarborCover,
      accent: "#e7ae6e",
      initials: "FH",
    },
  },
];

export const initialGameStates: GameLibraryStates = {
  emberlight: { installed: true, favorite: true },
  "hollow-signal": { installed: true, favorite: false },
  glasshouse: { installed: false, favorite: true },
  northstar: { installed: true, favorite: false },
  "velvet-depths": { installed: false, favorite: false },
  "far-harbor": { installed: true, favorite: false },
};
