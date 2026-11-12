export interface LibraryContext {
  section: "library" | "favorites" | "collections";
  collectionId: string | null;
  selectedId: string | null;
  query: string;
}

export function restoreLibraryContext(context: LibraryContext) {
  return { ...context };
}

/** Selects the closest candidate in the requested visual direction. */
export function nearestSpatialCandidate<T>(
  current: { x: number; y: number },
  candidates: Array<{ value: T; x: number; y: number }>,
  direction: "left" | "right" | "up" | "down",
): T | null {
  const primary = (point: { x: number; y: number }) => direction === "left" ? current.x-point.x : direction === "right" ? point.x-current.x : direction === "up" ? current.y-point.y : point.y-current.y;
  const horizontal = direction === "left" || direction === "right";
  return candidates.map((candidate) => ({ candidate, advance: primary(candidate), offset: Math.abs(horizontal ? candidate.y-current.y : candidate.x-current.x) }))
    .filter((item) => item.advance > 1)
    .sort((a,b) => a.advance+a.offset*1.8-(b.advance+b.offset*1.8))[0]?.candidate.value ?? null;
}
