import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined,
  );

const THEME_STORAGE_KEY = 'thrive_dark_mode';

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    darkMode,
    setDarkMode,
  ] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY,
          );

        if (savedTheme !== null) {
          setDarkMode(
            savedTheme === 'true',
          );
        }
      } catch (error) {
        console.error(
          'Failed to load theme:',
          error,
        );
      }
    };

    loadTheme();
  }, []);

  async function toggleDarkMode() {
    setDarkMode(
      (currentMode) => {
        const newMode = !currentMode;

        AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          String(newMode),
        ).catch((error) => {
          console.error(
            'Failed to save theme:',
            error,
          );
        });

        return newMode;
      },
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider',
    );
  }

  return context;
}