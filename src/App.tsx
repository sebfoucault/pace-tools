import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, AppBar, Toolbar, Typography, Box, IconButton, Tabs, Tab } from '@mui/material';
import { Speed, Settings, Help, Fullscreen, FullscreenExit, Calculate, TrendingUp, SwapHoriz, FitnessCenter } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import RunningCalculator from './components/RunningCalculator';
import RacePredictor from './components/RacePredictor';
import SpeedPaceConverter from './components/SpeedPaceConverter';
import TrainingPaces from './components/TrainingPaces';
import SettingsDialog from './components/SettingsDialog';
import HelpDialog from './components/HelpDialog';
import type { UnitSystem } from './types';
import './i18n/config';
import theme from './theme';

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
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        <AppBar
          position="sticky"
          elevation={0}

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
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 48,
                minWidth: { xs: 'auto', sm: 120 },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                textTransform: 'none',
                '& .MuiTab-iconWrapper': {
                  marginRight: { xs: 0.5, sm: 1 },
                },
              },
              '& .MuiTabs-scrollButtons': {
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
            }}
          >
            <Tab
              icon={<Calculate fontSize="small" />}
              label={t('app.calculatorTab') || 'Calculator'}
              iconPosition="start"
            />
            <Tab
              icon={<FitnessCenter fontSize="small" />}
              label={t('app.trainingTab') || 'Training'}
              iconPosition="start"
            />
            <Tab
              icon={<TrendingUp fontSize="small" />}
              label={t('app.racePredictorTab') || 'Race Predictor'}
              iconPosition="start"
            />
            <Tab
              icon={<SwapHoriz fontSize="small" />}
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
            <TrainingPaces
              unitSystem={unitSystem}
              performanceIndex={performanceIndex}
            />
          </Box>

          <Box
            sx={{
              display: currentTab === 2 ? 'block' : 'none',
            }}
          >
            <RacePredictor
              unitSystem={unitSystem}
              performanceIndex={performanceIndex}
            />
          </Box>

          <Box
            sx={{
              display: currentTab === 3 ? 'block' : 'none',
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
