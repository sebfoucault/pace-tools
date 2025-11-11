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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Speed,
  Settings,
  Help,
  Calculate,
  SwapHoriz,
  Fullscreen,
  FullscreenExit,
  TrendingUp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import RunningCalculator from './components/RunningCalculator';
import SpeedPaceConverter from './components/SpeedPaceConverter';
import RacePredictor from './components/RacePredictor';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [performanceIndex, setPerformanceIndex] = useState<number | null>(null);

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

  const handlePerformanceIndexChange = (pi: number | null) => {
    setPerformanceIndex(pi);
  };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes (e.g., user pressing ESC)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Request fullscreen on mount
  React.useEffect(() => {
    const requestFullscreenOnLoad = async () => {
      try {
        // Only request fullscreen if not already in fullscreen and the API is supported
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        // Silently fail - browsers often block automatic fullscreen requests
        console.log('Automatic fullscreen blocked:', error);
      }
    };

    // Small delay to ensure the page is fully loaded
    const timer = setTimeout(requestFullscreenOnLoad, 500);
    return () => clearTimeout(timer);
  }, []);

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
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
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
          {/* Material-UI Tabs Navigation */}
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.875rem',
                textTransform: 'none',
              },
            }}
          >
            <Tab
              icon={<Calculate />}
              label={t('app.calculatorTab') || 'Calculator'}
              iconPosition="start"
            />
            <Tab
              icon={<TrendingUp />}
              label={t('app.racePredictorTab') || 'Race Predictor'}
              iconPosition="start"
            />
            <Tab
              icon={<SwapHoriz />}
              label={t('app.converterTab') || 'Converter'}
              iconPosition="start"
            />
          </Tabs>

          {/* Render all tabs but hide inactive ones to preserve state */}
          <Box
            sx={{
              display: currentTab === 0 ? 'block' : 'none',
            }}
          >
            <RunningCalculator
              unitSystem={unitSystem}
              onPerformanceIndexChange={handlePerformanceIndexChange}
            />
          </Box>

          <Box
            sx={{
              display: currentTab === 1 ? 'block' : 'none',
            }}
          >
            <RacePredictor
              unitSystem={unitSystem}
              performanceIndex={performanceIndex}
            />
          </Box>

          <Box
            sx={{
              display: currentTab === 2 ? 'block' : 'none',
            }}
          >
            <SpeedPaceConverter unitSystem={unitSystem} />
          </Box>
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
