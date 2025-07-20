export interface Theme {
  colors: {
    accent: string;
    background: string;
    border: string;
    error: string;
    info: string;
    primary: string;
    secondary: string;
    success: string;
    surface: string;
    text: string;
    textSecondary: string;
    warning: string;
  };
  cssVariables: Record<string, string>;
  name: string;
}

export const themes: Theme[] = [
  {
    name: 'ConstructBMS Light',
    colors: {
      primary: '#1A1A1A',
      secondary: '#4D5A6C',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F6F8FA',
      text: '#1A1A1A',
      textSecondary: '#4D5A6C',
      border: '#E5E7EB',
      success: '#3CB371',
      warning: '#FFB84D',
      error: '#E6504D',
      info: '#3B82F6'
    },
    cssVariables: {
      '--color-primary': '#1A1A1A',
      '--color-secondary': '#4D5A6C',
      '--color-accent': '#D4AF37',
      '--color-background': '#FFFFFF',
      '--color-surface': '#F6F8FA',
      '--color-text': '#1A1A1A',
      '--color-text-secondary': '#4D5A6C',
      '--color-border': '#E5E7EB',
      '--color-success': '#3CB371',
      '--color-warning': '#FFB84D',
      '--color-error': '#E6504D',
      '--color-info': '#3B82F6',
      '--color-card-bg': '#FFFFFF',
      '--color-card-border': '#E5E7EB',
      '--color-input-bg': '#FFFFFF',
      '--color-input-border': '#D1D5DB',
      '--color-button-primary': '#3B82F6',
      '--color-button-primary-hover': '#2563EB',
      '--color-button-secondary': '#F6F8FA',
      '--color-button-secondary-hover': '#E5E7EB'
    }
  },
  {
    name: 'ConstructBMS Dark',
    colors: {
      primary: '#FFFFFF',
      secondary: '#D1D5DB',
      accent: '#3B82F6',
      background: '#0C1C2E',
      surface: '#1A2B44',
      text: '#FFFFFF',
      textSecondary: '#D1D5DB',
      border: '#374151',
      success: '#3CB371',
      warning: '#FFB84D',
      error: '#E6504D',
      info: '#60A5FA'
    },
    cssVariables: {
      '--color-primary': '#FFFFFF',
      '--color-secondary': '#D1D5DB',
      '--color-accent': '#3B82F6',
      '--color-background': '#0C1C2E',
      '--color-surface': '#1A2B44',
      '--color-text': '#FFFFFF',
      '--color-text-secondary': '#D1D5DB',
      '--color-border': '#374151',
      '--color-success': '#3CB371',
      '--color-warning': '#FFB84D',
      '--color-error': '#E6504D',
      '--color-info': '#60A5FA',
      '--color-card-bg': '#1A2B44',
      '--color-card-border': '#374151',
      '--color-input-bg': '#1A2B44',
      '--color-input-border': '#374151',
      '--color-button-primary': '#3B82F6',
      '--color-button-primary-hover': '#2563EB',
      '--color-button-secondary': '#1A2B44',
      '--color-button-secondary-hover': '#2D3B52'
    }
  }
];

export const defaultTheme = themes[0]; 
