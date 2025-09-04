import { createContext } from 'react';
import type { ThemeColors } from '../config/themes';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
