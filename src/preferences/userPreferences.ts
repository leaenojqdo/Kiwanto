import { invoke, isTauri } from "@tauri-apps/api/core";
import { DEFAULT_USER_PREFERENCES } from "../themes/definitions";
import type { ThemeId, UserPreferences } from "../themes/model";

const browserStorageKey = "kiwanto.user-preferences";
const supportedThemes = new Set<ThemeId>(["kiwanto-dark", "kiwanto-light"]);

function isUserPreferences(value: unknown): value is UserPreferences {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const bigPicture = candidate.bigPicture;
  return (
    (candidate.schemaVersion === 1 || candidate.schemaVersion === 2) &&
    typeof candidate.themeId === "string" &&
    supportedThemes.has(candidate.themeId as ThemeId) &&
    (candidate.schemaVersion === 1 || (typeof bigPicture === "object" && bigPicture !== null && [80,90,100,110,120].includes((bigPicture as {interfaceScale?:number}).interfaceScale ?? -1) && ["portrait","landscape"].includes((bigPicture as {coverOrientation?:string}).coverOrientation ?? "") && ["small","medium","large"].includes((bigPicture as {coverSize?:string}).coverSize ?? "") && ["compact","comfortable"].includes((bigPicture as {density?:string}).density ?? "")))
  );
}

function validatePreferences(value: unknown): UserPreferences {
  if (!isUserPreferences(value)) {
    throw new Error("Las preferencias tienen un formato o una versión no compatibles.");
  }
  const source = value as UserPreferences & { bigPicture?: UserPreferences["bigPicture"] };
  return { schemaVersion: 2, themeId: source.themeId, bigPicture: source.bigPicture ?? DEFAULT_USER_PREFERENCES.bigPicture };
}

export async function loadUserPreferences(): Promise<UserPreferences> {
  if (isTauri()) {
    return validatePreferences(await invoke<unknown>("load_user_preferences"));
  }

  const saved = window.localStorage.getItem(browserStorageKey);
  if (saved === null) return DEFAULT_USER_PREFERENCES;
  return validatePreferences(JSON.parse(saved) as unknown);
}

export async function saveUserPreferences(
  preferences: UserPreferences,
): Promise<UserPreferences> {
  const validated = validatePreferences(preferences);
  if (isTauri()) {
    return validatePreferences(
      await invoke<unknown>("save_user_preferences", { preferences: validated }),
    );
  }

  window.localStorage.setItem(browserStorageKey, JSON.stringify(validated));
  return validated;
}
