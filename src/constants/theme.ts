export type ThemeKey = 'pink' | 'blue';

export type AppTheme = {
  key: ThemeKey;
  name: string;

  background: string;
  surface: string;
  surfaceSoft: string;
  card: string;

  text: string;
  textSoft: string;
  muted: string;

  primary: string;
  primaryDark: string;
  primarySoft: string;

  border: string;

  success: string;
  danger: string;

  shadow: string;
};

export const THEMES: Record<ThemeKey, AppTheme> = {
  pink: {
    key: 'pink',
    name: 'Pink',

    background: '#FFF7FA',
    surface: '#FFFFFF',
    surfaceSoft: '#FFF0F5',
    card: '#FFFFFF',

    text: '#102A56',
    textSoft: '#42618D',
    muted: '#7890B0',

    primary: '#F45B91',
    primaryDark: '#E83F7A',
    primarySoft: '#FFE2EC',

    border: '#F6D6E1',

    success: '#5BC99A',
    danger: '#E95B75',

    shadow: '#C86B8B',
  },

  blue: {
    key: 'blue',
    name: 'Blue',

    background: '#F1F8FF',
    surface: '#FFFFFF',
    surfaceSoft: '#E8F3FF',
    card: '#FFFFFF',

    text: '#0B2C63',
    textSoft: '#386292',
    muted: '#7592B5',

    primary: '#2457A6',
    primaryDark: '#174487',
    primarySoft: '#DCEBFF',

    border: '#C9DFF7',

    success: '#43B987',
    danger: '#D9556E',

    shadow: '#4676AA',
  },
};