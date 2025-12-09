import React, { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline, type Theme } from '@mui/material';

// 1. Tipos y Contexto
interface ThemeContextType {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

const ThemeModeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook para usar el tema
export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode debe ser usado dentro de un ThemeModeProvider');
  }
  return context;
};

// 2. Definición del Tema (Claro y Oscuro)
const getAppTheme = (mode: 'light' | 'dark'): Theme =>
  createTheme({
    palette: {
      mode, // MUI ajusta colores de superficie y texto automáticamente
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9', // Azul Primario
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1', // Rojo Secundario
      },
      // MUI ya maneja bien los colores de fondo para 'dark' mode.
      // background: { ... }
    },
  });

// 3. Provider Principal
interface ThemeModeProviderProps {
  children: ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  // Inicialización: Leer desde localStorage o detectar el sistema
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('mui-mode') as 'light' | 'dark';
    if (savedMode) {
      return savedMode;
    }
    // Detección del sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Guardar la preferencia en localStorage
  useEffect(() => {
    localStorage.setItem('mui-mode', mode);
  }, [mode]);

  // Función de alternancia (disponible para componentes)
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  // Crear el tema (solo cuando 'mode' cambia)
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    // Proveedor del Contexto (para la función de alternancia)
    <ThemeModeContext.Provider value={colorMode}>
      {/* Proveedor de Temas de MUI */}
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline aplica los estilos base y los colores de fondo de MUI */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};