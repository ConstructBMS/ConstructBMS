export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;

  // Border colors
  border: string;
  borderLight: string;

  // Accent colors
  primary: string;
  primaryHover: string;
  accent: string;

  // Interactive elements
  button: string;
  buttonHover: string;
  buttonText: string;

  // Form elements
  input: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;

  // Dropdown/Select
  dropdown: string;
  dropdownBorder: string;
  dropdownText: string;
}

export const darkTheme: ThemeColors = {
  // Background colors - Navy theme
  background: '#1e293b', // Dark navy background
  surface: '#334155', // Slightly lighter navy for cards
  card: '#374151', // Card background

  // Text colors - White theme
  text: '#f9fafb', // White text
  textSecondary: '#e5e7eb', // Light gray text
  textMuted: '#d1d5db', // Muted gray text

  // Border colors - White lines
  border: '#6b7280', // White/gray borders
  borderLight: '#4b5563', // Lighter borders

  // Accent colors - Light blue
  primary: '#3b82f6', // Light blue primary
  primaryHover: '#2563eb', // Darker blue on hover
  accent: '#60a5fa', // Light blue accent

  // Interactive elements
  button: '#4b5563', // Dark button background
  buttonHover: '#6b7280', // Lighter on hover
  buttonText: '#f9fafb', // White button text

  // Form elements
  input: '#4b5563', // Dark input background
  inputBorder: '#6b7280', // Input border
  inputText: '#f9fafb', // White input text
  inputPlaceholder: '#9ca3af', // Placeholder text

  // Dropdown/Select
  dropdown: '#4b5563', // Dark dropdown background
  dropdownBorder: '#6b7280', // Dropdown border
  dropdownText: '#f9fafb', // White dropdown text
};

export const lightTheme: ThemeColors = {
  // Background colors - Light theme
  background: '#ffffff', // White background
  surface: '#f9fafb', // Light gray surface
  card: '#ffffff', // White card background

  // Text colors - Dark theme
  text: '#1f2937', // Dark text
  textSecondary: '#374151', // Medium gray text
  textMuted: '#6b7280', // Muted gray text

  // Border colors - Gray lines
  border: '#d1d5db', // Light gray borders
  borderLight: '#e5e7eb', // Lighter borders

  // Accent colors - Blue theme
  primary: '#3b82f6', // Blue primary
  primaryHover: '#2563eb', // Darker blue on hover
  accent: '#60a5fa', // Light blue accent

  // Interactive elements
  button: '#f3f4f6', // Light button background
  buttonHover: '#e5e7eb', // Darker on hover
  buttonText: '#1f2937', // Dark button text

  // Form elements
  input: '#ffffff', // White input background
  inputBorder: '#d1d5db', // Input border
  inputText: '#1f2937', // Dark input text
  inputPlaceholder: '#9ca3af', // Placeholder text

  // Dropdown/Select
  dropdown: '#ffffff', // White dropdown background
  dropdownBorder: '#d1d5db', // Dropdown border
  dropdownText: '#1f2937', // Dark dropdown text
};

export const getThemeColors = (theme: 'light' | 'dark'): ThemeColors => {
  return theme === 'dark' ? darkTheme : lightTheme;
};
