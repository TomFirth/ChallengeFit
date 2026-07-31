import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const Colors = {
  light: {
    background: '#f5f6fa',
    card: '#ffffff',
    text: '#2d3436',
    subtext: '#636e72',
    primary: '#6c5ce7',
    secondary: '#0984e3',
    success: '#00b894',
    border: '#dcdde1',
    xpBar: '#f1f2f6',
    xpBarFill: '#00b894',
    streak: '#e67e22',
    isDarkMode: false,
  },
  dark: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#f5f6fa',
    subtext: '#b2bec3',
    primary: '#a29bfe',
    secondary: '#74b9ff',
    success: '#55efc4',
    border: '#2d3436',
    xpBar: '#2d3436',
    xpBarFill: '#55efc4',
    streak: '#fab1a0',
    isDarkMode: true,
  }
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  colors: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await SecureStore.setItemAsync('theme', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const colors = isDarkMode ? Colors.dark : Colors.light;

  const value = {
    isDarkMode,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
