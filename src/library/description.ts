/** Versioned content shape reserved for future rich game descriptions. */
export type GameDescriptionBlock =
  | { type: "paragraph"; text: string }
  | { type: "image" | "gif"; source: string; altText: string }
  | { type: "video"; source: string; title?: string }
  | { type: "link"; href: string; label: string }
  | { type: "divider" };

export interface GameDescriptionDocument {
  version: 1;
  blocks: GameDescriptionBlock[];
}

/** Existing SQLite descriptions remain plain text and are adapted without loss. */
export function fromLegacyDescription(text: string): GameDescriptionDocument {
  return {
    version: 1,
    blocks: text.length > 0 ? [{ type: "paragraph", text }] : [],
  };
}
