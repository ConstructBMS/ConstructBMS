export interface ThemeColors {
  // Accent colors
  // Background colors
  // Border colors
  // Interactive colors
  // Primary brand colors
  // Status colors
  // Text colors
  accent: string;
  accentSecondary: string;
  active: string;
  background: string;
  border: string;
  borderSecondary: string;
  error: string;
  focus: string;
  hover: string;
  info: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  success: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  warning: string;
}

export interface ThemeDefinition {
    accentColor: string;
    backgroundColor: string;
  category: 'professional' | 'modern' | 'classic' | 'creative' | 'minimal';
  dark: ThemeColors;
  description: string;
  id: string;
  light: ThemeColors;
  name: string;
  preview: {
    primaryColor: string;
};
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeId = 'napwood' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'lavender';

export interface ThemeSettings {
  effectiveMode: 'light' | 'dark';
  mode: ThemeMode;
  themeId: ThemeId;
} 
