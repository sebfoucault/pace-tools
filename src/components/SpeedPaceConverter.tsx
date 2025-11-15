import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import { SwapVert } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TimeInput from './TimeInput';
import { tokens } from '../styles/tokens';
import presets from '../styles/presets';

interface ConversionState {
  speed: string;
  pace: string;
}

interface SpeedPaceConverterProps {
  unitSystem: 'metric' | 'imperial';
}

const SpeedPaceConverter: React.FC<SpeedPaceConverterProps> = ({ unitSystem }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<ConversionState>({
    speed: '',
    pace: '',
  });
  const [previousUnitSystem, setPreviousUnitSystem] = useState<'metric' | 'imperial'>(unitSystem);

  // Handle unit system changes
  useEffect(() => {
    if (previousUnitSystem !== unitSystem && state.speed) {
      const speedValue = parseFloat(state.speed);
      if (!isNaN(speedValue)) {
        let newSpeed: string;

        if (unitSystem === 'imperial' && previousUnitSystem === 'metric') {
          // km/h to mph
          newSpeed = (speedValue * 0.621371).toFixed(2);
        } else if (unitSystem === 'metric' && previousUnitSystem === 'imperial') {
          // mph to km/h
          newSpeed = (speedValue * 1.60934).toFixed(2);
        } else {
          newSpeed = state.speed;
        }

        // Recalculate pace based on new speed
        const newSpeedValue = parseFloat(newSpeed);
        if (newSpeedValue > 0) {
          const paceInMinutes = 60 / newSpeedValue;
          const minutes = Math.floor(paceInMinutes);
          const seconds = Math.round((paceInMinutes - minutes) * 60);
          const newPace = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          setState({ speed: newSpeed, pace: newPace });
        }
      }
    }
    setPreviousUnitSystem(unitSystem);
  }, [unitSystem, previousUnitSystem, state.speed]);

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const speed = event.target.value;
    setState(prev => ({ ...prev, speed }));

    if (speed && !isNaN(parseFloat(speed))) {
      const speedValue = parseFloat(speed);
      if (speedValue > 0) {
        // Convert speed to pace
        const paceInMinutes = 60 / speedValue;
        const minutes = Math.floor(paceInMinutes);
        const seconds = Math.round((paceInMinutes - minutes) * 60);
        const paceStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        setState(prev => ({ ...prev, speed, pace: paceStr }));
      }
    } else {
      setState(prev => ({ ...prev, speed, pace: '' }));
    }
  };

  const getSpeedUnit = () => {
    return unitSystem === 'metric' ? 'km/h' : 'mph';
  };

  const getPaceUnit = () => {
    return unitSystem === 'metric' ? 'min/km' : 'min/mile';
  };

  return (
    <Card elevation={3}>
      <CardContent sx={presets.cardContent}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ ...presets.title, mb: 3 }}
        >
          {t('converter.title')}
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label={t('converter.speed', { unit: getSpeedUnit() })}
              value={state.speed}
              onChange={handleSpeedChange}
              type="number"
              inputProps={{ step: '0.1', min: '0' }}
              placeholder={unitSystem === 'metric' ? '12.0' : '7.5'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={2} sx={{
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SwapVert
              sx={{
                fontSize: 40,
                color: 'action.active',
                animation: 'pulse 2s ease-in-out infinite',
                transform: 'rotate(90deg)',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TimeInput
              fullWidth
              label={t('converter.pace', { unit: getPaceUnit() })}
              value={state.pace}
              onChange={(pace) => {
                setState(prev => ({ ...prev, pace }));

                // Parse pace in MM:SS format
                const paceRegex = /^(\d+):([0-5]\d)$/;
                const match = pace.match(paceRegex);

                if (match) {
                  const minutes = parseInt(match[1]);
                  const seconds = parseInt(match[2]);
                  const totalMinutes = minutes + seconds / 60;

                  if (totalMinutes > 0) {
                    // Convert pace to speed
                    const speed = 60 / totalMinutes;
                    setState(prev => ({ ...prev, pace, speed: speed.toFixed(2) }));
                  }
                } else if (pace === '') {
                  setState(prev => ({ ...prev, pace, speed: '' }));
                }
              }}
              maxSegments={2}
              placeholder="5:00"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SpeedPaceConverter;
