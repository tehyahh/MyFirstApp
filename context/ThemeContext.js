import React, { createContext, useContext, useMemo, useState } from 'react';

// Every color the app uses, defined once for light and once for dark.
// Add new colors here rather than hardcoding hex values in components,
// so both themes stay in sync as the app grows.
const lightColors = {
  mode: 'light',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#111111',
  subtext: '#6B6B6B',
  mutedText: '#8A8A8A',
  border: '#E2E2E2',
  iconButtonBg: '#F0F0F0',
  icon: '#111111',

  // Home screen method cards
  methodCardBg: '#CBDCFF',
  methodCardIconBg: '#7FA3F5',
  methodCardIconColor: '#1E3A8A',

  // Feynman note pill + expanded card
  pillBg: '#DDE9FF',
  pillIconCircleBg: '#FFFFFF',
  expandedCardBg: '#FFFFFF',
  stepNumberBg: '#EEEEEE',
  stepNumberText: '#555555',

  // Bottom nav
  navBg: '#F2F2F2',
  navActiveBg: '#E3E3E3',

  // Inputs / modals
  inputBg: '#FFFFFF',
  inputText: '#111111',
  placeholder: '#A0A0A0',
  modalBg: '#FFFFFF',
  modalBackdrop: 'rgba(0, 0, 0, 0.45)',

  // Buttons
  primaryButtonBg: '#CBDCFF',
  primaryButtonText: '#1E3A8A',
  secondaryButtonBg: '#EFEFEF',
  secondaryButtonText: '#111111',

  // Pomodoro
  gradient: ['#D9D4F5', '#F5C7DA', '#FCE3AE'],
  timerTrack: '#FFFFFF',
  timerProgress: '#F2A0BE',
  timerCenterBg: '#FFFFFF',
  presetCardBg: '#FFFFFF',
  presetLabelColor: '#E8899F',
  sideButtonBg: '#FFFFFF',
  sideButtonBorder: '#F0D77A',
  playButtonBg: '#F2A0BE',
  applyButtonBg: '#F2A0BE',
};

const darkColors = {
  mode: 'dark',
  background: '#121212',
  surface: '#1C1C1E',
  text: '#F2F2F2',
  subtext: '#A8A8A8',
  mutedText: '#8E8E8E',
  border: '#3A3A3C',
  iconButtonBg: '#2A2A2C',
  icon: '#F2F2F2',

  methodCardBg: '#2C3A63',
  methodCardIconBg: '#4C64A8',
  methodCardIconColor: '#DCE6FF',

  pillBg: '#232B45',
  pillIconCircleBg: '#1C1C1E',
  expandedCardBg: '#1C1C1E',
  stepNumberBg: '#2E2E30',
  stepNumberText: '#CFCFCF',

  navBg: '#1E1E1E',
  navActiveBg: '#333335',

  inputBg: '#232323',
  inputText: '#F2F2F2',
  placeholder: '#787878',
  modalBg: '#1E1E1E',
  modalBackdrop: 'rgba(0, 0, 0, 0.65)',

  primaryButtonBg: '#3A4F8F',
  primaryButtonText: '#E4EAFF',
  secondaryButtonBg: '#2A2A2C',
  secondaryButtonText: '#F2F2F2',

  gradient: ['#2B2640', '#3B2636', '#3C2E1B'],
  timerTrack: '#2E2E30',
  timerProgress: '#F2A0BE',
  timerCenterBg: '#1C1C1E',
  presetCardBg: '#1E1E1E',
  presetLabelColor: '#F2A0BE',
  sideButtonBg: '#1E1E1E',
  sideButtonBorder: '#5C5230',
  playButtonBg: '#F2A0BE',
  applyButtonBg: '#F2A0BE',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ isDark, toggleTheme, colors }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
