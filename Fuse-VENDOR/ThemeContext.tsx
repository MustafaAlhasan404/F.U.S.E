import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme, override?: boolean) => void;
  isThemeOverridden: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemTheme = Appearance.getColorScheme();
  const initialTheme = systemTheme === 'light' || systemTheme === 'dark' ? systemTheme : 'light'; // Default to 'light' if 'no-preference'
  
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [isThemeOverridden, setIsThemeOverridden] = useState<boolean>(false);

  useEffect(() => {
    if (!isThemeOverridden) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        const newTheme = colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : 'light'; // Default to 'light' if 'no-preference'
        setTheme(newTheme);
      });

      return () => subscription.remove();
    }
  }, [isThemeOverridden]);

  const handleSetTheme = (newTheme: Theme, override: boolean = false) => {
    setTheme(newTheme);
    setIsThemeOverridden(override);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isThemeOverridden }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
