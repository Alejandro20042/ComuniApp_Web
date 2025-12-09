import React from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Luna
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sol
import { useThemeMode } from './ThemeModeContext'; 

const ThemeToggleButton: React.FC = () => {
  const { mode, toggleColorMode } = useThemeMode();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ mr: 1 }}>{mode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</Typography>
      <IconButton onClick={toggleColorMode} color="inherit" aria-label="alternar modo de color">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Box>
  );
};

export default ThemeToggleButton;