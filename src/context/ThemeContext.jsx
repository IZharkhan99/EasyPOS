import { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('easypos-theme') || 'dark';
  });

  const setTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('easypos-theme', t);
    setThemeState(t);
  }, []);

  // Set initial theme
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
