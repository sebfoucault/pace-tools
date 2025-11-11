import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Speed,
  Settings,
  Help,
  Calculate,
  SwapHoriz,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import RunningCalculator from './components/RunningCalculator';
import SpeedPaceConverter from './components/SpeedPaceConverter';
import SettingsDialog from './components/SettingsDialog';
import HelpDialog from './components/HelpDialog';
import './i18n/config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b2a41',
      light: '#324a5f',
      dark: '#0c1821',
    },
    secondary: {
      main: '#324a5f',
      light: '#ccc9dc',
      dark: '#1b2a41',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.12)',
    '0px 16px 32px rgba(0,0,0,0.14)',
    '0px 20px 40px rgba(0,0,0,0.16)',
    '0px 24px 48px rgba(0,0,0,0.18)',
    '0px 28px 56px rgba(0,0,0,0.2)',
    '0px 32px 64px rgba(0,0,0,0.22)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 2px 4px rgba(0,0,0,0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
            },
            '&.Mui-focused': {
              boxShadow: '0px 4px 12px rgba(27,42,65,0.15)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.95rem',
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            '& + .MuiSwitch-track': {
              opacity: 0.7,
            },
          },
        },
      },
    },
  },
});

type UnitSystem = 'metric' | 'imperial';

function App() {
  const { t } = useTranslation();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [currentTab, setCurrentTab] = useState(0);

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleHelpOpen = () => {
    setHelpOpen(true);
  };

  const handleHelpClose = () => {
    setHelpOpen(false);
  };

  const handleUnitSystemChange = (newUnitSystem: UnitSystem) => {
    setUnitSystem(newUnitSystem);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        flexGrow: 1,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ccc9dc 100%)',
      }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'linear-gradient(90deg, #0c1821 0%, #1b2a41 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Toolbar>
            <Speed sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {t('app.title')}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleSettingsOpen}
              aria-label="Settings"
            >
              <Settings />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleHelpOpen}
              aria-label="Help"
            >
              <Help />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ py: 4, position: 'relative' }}>
          {/* Floating Navigation Pills */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              gap: 2,
            }}
          >
            <Box
              onClick={() => handleTabChange(null as any, 0)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                borderRadius: 20,
                cursor: 'pointer',
                background: currentTab === 0
                  ? 'linear-gradient(135deg, #1b2a41 0%, #324a5f 100%)'
                  : 'white',
                color: currentTab === 0 ? 'white' : '#1b2a41',
                boxShadow: currentTab === 0
                  ? '0px 4px 20px rgba(27, 42, 65, 0.25)'
                  : '0px 2px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: currentTab === 0
                    ? '0px 6px 25px rgba(27, 42, 65, 0.35)'
                    : '0px 4px 15px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Calculate sx={{ fontSize: 20 }} />
              {t('app.calculatorTab') || 'Calculator'}
            </Box>

            <Box
              onClick={() => handleTabChange(null as any, 1)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                borderRadius: 20,
                cursor: 'pointer',
                background: currentTab === 1
                  ? 'linear-gradient(135deg, #1b2a41 0%, #324a5f 100%)'
                  : 'white',
                color: currentTab === 1 ? 'white' : '#1b2a41',
                boxShadow: currentTab === 1
                  ? '0px 4px 20px rgba(27, 42, 65, 0.25)'
                  : '0px 2px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: currentTab === 1
                    ? '0px 6px 25px rgba(27, 42, 65, 0.35)'
                    : '0px 4px 15px rgba(0,0,0,0.15)',
                },
              }}
            >
              <SwapHoriz sx={{ fontSize: 20 }} />
              {t('app.converterTab') || 'Converter'}
            </Box>
          </Box>

          {currentTab === 0 && (
            <Box
              sx={{
                animation: 'fadeSlide 0.4s ease-out',
                '@keyframes fadeSlide': {
                  from: { opacity: 0, transform: 'translateX(-20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <RunningCalculator unitSystem={unitSystem} />
            </Box>
          )}

          {currentTab === 1 && (
            <Box
              sx={{
                animation: 'fadeSlide 0.4s ease-out',
                '@keyframes fadeSlide': {
                  from: { opacity: 0, transform: 'translateX(20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <SpeedPaceConverter unitSystem={unitSystem} />
            </Box>
          )}
        </Container>

        <SettingsDialog
          open={settingsOpen}
          onClose={handleSettingsClose}
          unitSystem={unitSystem}
          onUnitSystemChange={handleUnitSystemChange}
        />

        <HelpDialog
          open={helpOpen}
          onClose={handleHelpClose}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
