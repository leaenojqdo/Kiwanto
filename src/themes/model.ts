export type ThemeId = "kiwanto-dark" | "kiwanto-light";

export type ThemeRegion = "navigation" | "library" | "presentation";

export type RegionPlacement =
  | "navigation-rail"
  | "side-column"
  | "main-canvas"
  | "overlay";

export interface ThemeRegionLayout {
  placement: RegionPlacement;
  order: number;
  visible: boolean;
  backgroundToken: string;
  minimumWidth?: number;
  maximumWidth?: number;
}

export interface ThemeComposition {
  preset: "desktop-three-zone";
  regions: Record<ThemeRegion, ThemeRegionLayout>;
  separator: {
    visible: boolean;
    styleToken: string;
  };
}

export interface DesignTokens {
  colors: {
    appBackground: string;
    navigationBackground: string;
    libraryBackground: string;
    libraryInputBackground: string;
    surface: string;
    surfaceRaised: string;
    surfaceHover: string;
    mainBackground: string;
    presentationBackground: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textQuiet: string;
    border: string;
    accent: string;
    accentStrong: string;
    accentText: string;
    focus: string;
  };
  typography: {
    interfaceFamily: string;
    displayFamily: string;
    baseSize: string;
    smallSize: string;
  };
  spacing: {
    panelInset: string;
    contentGap: string;
  };
  borders: {
    separator: string;
    radiusSmall: string;
    radiusMedium: string;
    radiusLarge: string;
  };
  shadows: {
    panel: string;
    floating: string;
  };
  opacity: {
    panel: string;
    overlay: string;
  };
  gradients: {
    accent: string;
    presentationOverlay: string;
  };
  effects: {
    blur: string;
    transitionDuration: string;
  };
  dimensions: {
    navigationWidth: string;
    libraryDefaultWidth: string;
    libraryMinimumWidth: string;
    libraryMaximumWidth: string;
  };
}

export interface ThemeDefinition {
  formatVersion: 1;
  id: ThemeId;
  name: string;
  description: string;
  appearance: "dark" | "light";
  tokens: DesignTokens;
  composition: ThemeComposition;
  resources: {
    logoId: string;
    iconSetId: string;
    backgrounds: Partial<Record<ThemeRegion, string>>;
  };
}

export interface InterfaceProfileDefinition {
  formatVersion: 1;
  id: string;
  name: string;
  themeId: ThemeId;
  layoutId: string;
  visiblePanels: string[];
  presentationPreferences: Record<string, string | number | boolean>;
  viewPreferences: Record<string, Record<string, string | number | boolean>>;
}

export interface UserPreferences {
  schemaVersion: 2;
  themeId: ThemeId;
  bigPicture: { interfaceScale: number; coverOrientation: "portrait" | "landscape"; coverSize: "small" | "medium" | "large"; density: "compact" | "comfortable" };
}
