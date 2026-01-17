import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Settings, Help, Fullscreen, FullscreenExit, Calculate, TrendingUp, SwapHoriz, FitnessCenter, UTurnLeft, Menu } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import RunningCalculator from './components/RunningCalculator';
import RacePredictor from './components/RacePredictor';
import SpeedPaceConverter from './components/SpeedPaceConverter';
import TrainingPaces from './components/TrainingPaces';
import CatchUpCalculator from './components/CatchUpCalculator';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (index: number) => {
    setCurrentTab(index);
    setDrawerOpen(false);
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
            <IconButton
              color="inherit"
              aria-label="open navigation"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
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
          {/* Render all views but hide inactive ones to preserve state */}
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

          <Box
            sx={{
              display: currentTab === 4 ? 'block' : 'none',
            }}
          >
            <CatchUpCalculator unitSystem={unitSystem} />
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

        {/* Drawer Navigation */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ p: 2, background: 'linear-gradient(90deg, #0c1821 0%, #1b2a41 100%)', color: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('app.title')}
            </Typography>
          </Box>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentTab === 0}
                onClick={() => handleNavigate(0)}
              >
                <ListItemIcon>
                  <Calculate color={currentTab === 0 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={t('calculator.title') || 'Pace Calculator'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentTab === 1}
                onClick={() => handleNavigate(1)}
              >
                <ListItemIcon>
                  <FitnessCenter color={currentTab === 1 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={t('trainingPaces.title') || 'Training Paces'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentTab === 2}
                onClick={() => handleNavigate(2)}
              >
                <ListItemIcon>
                  <TrendingUp color={currentTab === 2 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={t('racePredictor.title') || 'Race Predictor'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentTab === 3}
                onClick={() => handleNavigate(3)}
              >
                <ListItemIcon>
                  <SwapHoriz color={currentTab === 3 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={t('converter.title') || 'Speed ↔ Pace Converter'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentTab === 4}
                onClick={() => handleNavigate(4)}
              >
                <ListItemIcon>
                  <UTurnLeft color={currentTab === 4 ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={t('catchUpCalculator.title') || 'Catch-Up Calculator'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

      </Box>
    </ThemeProvider>
  );
}

export default App;
