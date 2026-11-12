export type NavigationIntent =
  | { type: "move-focus"; direction: "left" | "right" | "up" | "down" }
  | { type: "confirm" }
  | { type: "back" }
  | { type: "move-tab-focus"; reverse: boolean }
  | { type: "open-context-menu" }
  | { type: "open-search" };

export type SemanticNavigationAction = "move-left" | "move-right" | "move-up" | "move-down" | "confirm" | "back" | "context-menu" | "search";
export function semanticNavigationIntent(action: SemanticNavigationAction): NavigationIntent {
  if (action === "context-menu") return { type: "open-context-menu" };
  if (action === "search") return { type: "open-search" };
  if (action === "confirm") return { type: "confirm" };
  if (action === "back") return { type: "back" };
  return { type: "move-focus", direction: action.slice(5) as "left"|"right"|"up"|"down" };
}

/** Maps physical keyboard keys to semantic navigation actions. Future controller
 * adapters can produce the same intents without adding device logic to views. */
export function keyboardNavigationIntent(key: string, shiftKey = false): NavigationIntent | null {
  switch (key) {
    case "ArrowLeft": return { type: "move-focus", direction: "left" };
    case "ArrowRight": return { type: "move-focus", direction: "right" };
    case "ArrowUp": return { type: "move-focus", direction: "up" };
    case "ArrowDown": return { type: "move-focus", direction: "down" };
    case "Enter": return { type: "confirm" };
    case "Escape": return { type: "back" };
    case "Tab": return { type: "move-tab-focus", reverse: shiftKey };
    case "F10": if (shiftKey) return { type: "open-context-menu" }; break;
    case "ContextMenu": return { type: "open-context-menu" };
    default: return null;
  }
  return null;
}
