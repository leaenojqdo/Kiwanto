export interface GameMetadata {
  title: string;
  developer: string;
  publisher: string;
  year: number | null;
  genre: string[];
  genreIds?: string[];
  pendingGenres?: string[];
  rating: string;
  score?: number;
  platform: string;
  systems: string[];
  description: string;
}

export interface GamePresentation {
  cover: string | null;
  accent: string;
  initials: string;
}

export interface Game {
  id: string;
  metadata: GameMetadata;
  presentation: GamePresentation;
}

export interface GameLibraryState {
  installed: boolean;
  favorite: boolean;
}

export type GameLibraryStates = Record<string, GameLibraryState>;
