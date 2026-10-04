import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type AppThemeName = 'pink' | 'blue';

export type AppTheme = {
  name: AppThemeName;

  background: string;
  surface: string;
  surfaceSoft: string;

  primary: string;
  primaryDark: string;
  primarySoft: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;

  success: string;
  danger: string;

  shadow: string;
};

const PINK_THEME: AppTheme = {
  name: 'pink',

  background: '#FFF8FB',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF0F6',

  primary: '#F45B91',
  primaryDark: '#E9437E',
  primarySoft: '#FFE1EC',

  text: '#102B57',
  textSecondary: '#47658F',
  textMuted: '#8EA0BA',

  border: '#F4DCE6',

  success: '#51B889',
  danger: '#EF667D',

  shadow: '#D88AA8',
};

const BLUE_THEME: AppTheme = {
  name: 'blue',

  background: '#F4F9FF',
  surface: '#FFFFFF',
  surfaceSoft: '#E8F3FF',

  primary: '#245AA5',
  primaryDark: '#174782',
  primarySoft: '#DCEBFF',

  text: '#102B57',
  textSecondary: '#47658F',
  textMuted: '#8EA0BA',

  border: '#D7E6F8',

  success: '#4DAF87',
  danger: '#E8667D',

  shadow: '#86A9D2',
};

type ThemeContextValue = {
  theme: AppTheme;
  colors: AppTheme & { card: string; textSoft: string; muted: string };
  themeName: AppThemeName;
  isPink: boolean;
  isBlue: boolean;
  isDark: boolean;

  setTheme: (theme: AppThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<AppThemeName>('pink');
  const [isDark, setIsDark] = useState(false);

  const setTheme = useCallback((nextTheme: AppThemeName) => {
    setThemeName(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeName((current) => {
      return current === 'pink' ? 'blue' : 'pink';
    });
  }, []);

  const theme = useMemo(() => {
    return themeName === 'pink' ? PINK_THEME : BLUE_THEME;
  }, [themeName]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      colors: {
        ...theme,
        card: theme.surface,
        textSoft: theme.textSecondary,
        muted: theme.textMuted,
      },
      themeName,
      isPink: themeName === 'pink',
      isBlue: themeName === 'blue',
      isDark,

      setTheme,

      toggleTheme,
    };
  }, [
    theme,
    themeName,
    isDark,
    setTheme,
    toggleTheme,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}

// 🔴 ADDED: Alias hook para sa screens na gumagamit ng `useAppTheme()` at `palette`
export function useAppTheme() {
  const context = useContext(ThemeContext);

  const currentTheme = context ? context.theme : PINK_THEME;

  const palette = {
    bg: currentTheme.background,
    bg2: currentTheme.surfaceSoft,
    primary: currentTheme.primary,
    primary2: currentTheme.primaryDark,
    text: currentTheme.text,
    muted: currentTheme.textMuted,
    card: currentTheme.surface,
    line: currentTheme.border,
    soft: currentTheme.primarySoft,
    yellow: '#FFF2B9',
    pink: '#FFDDEB',
    purple: '#E9DEFF',
    green: '#DDF6E9',
    blue: '#DDEEFF',
  };

  return {
    palette,
    theme: currentTheme,
    themeName: context?.themeName || 'pink',
    setTheme: context?.setTheme || (() => {}),
    toggleTheme: context?.toggleTheme || (() => {}),
  };
}