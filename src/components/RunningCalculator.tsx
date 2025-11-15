import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Calculate,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TimeInput from './TimeInput';
import PerformanceGauge from './PerformanceGauge';
import { CalculatorModeToggle, type CalculatorMode } from './CalculatorModeToggle';
import { ChipsBar, type ChipOption } from './ChipsBar';
import { useCalculatorState } from '../hooks/useCalculatorState';
import { usePerformanceIndex } from '../hooks/usePerformanceIndex';
import { parseTimeToMinutes, parsePaceToMinutes, formatTime, formatPace } from '../utils/formatters';
import type { UnitSystem, UnitSystemConfig } from '../types';

interface RunningCalculatorProps {
  unitSystem: UnitSystem;
  onPerformanceIndexChange?: (pi: number | null) => void;
}

const RunningCalculator: React.FC<RunningCalculatorProps> = ({ unitSystem: systemType, onPerformanceIndexChange }) => {
  const { t } = useTranslation();
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('manual');

  // Use custom hooks for state management
  const { inputs, lockedField, updateField, toggleLock, canLockField } = useCalculatorState({ mode: calculatorMode });
  const performanceIndex = usePerformanceIndex({ inputs, unitSystem: systemType, onPerformanceIndexChange });

  // Derive unit system from prop
  const unitSystem: UnitSystemConfig = {
    distance: systemType === 'metric' ? 'km' : 'miles',
    pace: systemType === 'metric' ? 'min/km' : 'min/mile',
  };

  const handleInputChange = (field: keyof typeof inputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Prevent editing if field is locked
    if (lockedField === field) {
      return;
    }

    updateField(field, event.target.value);
    setError('');
    setResult('');
  };

  // Handle distance chip click
  const handleDistanceChipClick = (distance: number | string) => {
    // Prevent changing if field is locked
    if (lockedField === 'distance') {
      return;
    }
    updateField('distance', distance.toString());
    setError('');
    setResult('');
  };

  // Get distance shortcuts based on unit system
  const getDistanceChips = (): ChipOption[] => {
    if (systemType === 'metric') {
      return [
        { label: '1k', value: 1 },
        { label: '5k', value: 5 },
        { label: '10k', value: 10 },
        { label: '21k', value: 21.0975 },
        { label: '42k', value: 42.195 },
      ];
    } else {
      // Imperial distances
      return [
        { label: '1 mi', value: 1 },
        { label: '5 mi', value: 5 },
        { label: '10 mi', value: 10 },
        { label: '13.1mi', value: 13.1094 },
        { label: '26.2mi', value: 26.2188 },
      ];
    }
  };

  // Get time adjustment chips
  const getTimeChips = (): ChipOption[] => [
    { label: '+60s', value: 60 },
    { label: '+30s', value: 30 },
    { label: '-30s', value: -30 },
    { label: '-60s', value: -60 },
  ];

  // Get pace adjustment chips
  const getPaceChips = (): ChipOption[] => [
    { label: '-15s', value: -15 },
    { label: '-5s', value: -5 },
    { label: '+5s', value: 5 },
    { label: '+15s', value: 15 },
  ];

  // Adjust time by a given number of seconds
  const adjustTime = (deltaSeconds: number) => {
    // Prevent adjustment if field is locked
    if (lockedField === 'time') {
      return;
    }
    const currentTimeInMinutes = parseTimeToMinutes(inputs.time);
    if (isNaN(currentTimeInMinutes)) return;

    const newTimeInMinutes = Math.max(0, currentTimeInMinutes + (deltaSeconds / 60));
    const formattedTime = formatTime(newTimeInMinutes);

    updateField('time', formattedTime);
    setError('');
    setResult('');
  };

  // Adjust pace by a given number of seconds per km/mile
  const adjustPace = (deltaSeconds: number) => {
    // Prevent adjustment if field is locked
    if (lockedField === 'pace') {
      return;
    }
    const currentPaceInMinutes = parsePaceToMinutes(inputs.pace);
    if (isNaN(currentPaceInMinutes)) return;

    const newPaceInMinutes = Math.max(0, currentPaceInMinutes + (deltaSeconds / 60));
    const formattedPace = formatPace(newPaceInMinutes);

    updateField('pace', formattedPace);
    setError('');
    setResult('');
  };

  const calculateDistance = () => {
    const { time, pace } = inputs;

    if (time === '' || pace === '') {
      setError(t('calculator.errorNeedTimePace') || 'Please fill in both time and pace to calculate distance');
      return;
    }

    try {
      const timeInMinutes = parseTimeToMinutes(time);
      const paceInMinutes = parsePaceToMinutes(pace);

      if (isNaN(timeInMinutes) || isNaN(paceInMinutes)) {
        setError(t('calculator.errorInvalidInput') || 'Invalid input values');
        return;
      }

      const calculatedDistance = timeInMinutes / paceInMinutes;
      updateField('distance', calculatedDistance.toFixed(2));
      setError('');
      setResult('');
    } catch (err) {
      setError(t('calculator.errorInvalidInput') || 'Invalid input values');
    }
  };

  const calculateTime = () => {
    const { distance, pace } = inputs;

    if (distance === '' || pace === '') {
      setError(t('calculator.errorNeedDistancePace') || 'Please fill in both distance and pace to calculate time');
      return;
    }

    try {
      const dist = parseFloat(distance);
      const paceInMinutes = parsePaceToMinutes(pace);

      if (isNaN(dist) || isNaN(paceInMinutes)) {
        setError(t('calculator.errorInvalidInput') || 'Invalid input values');
        return;
      }

      const calculatedTime = dist * paceInMinutes;
      const formattedTime = formatTime(calculatedTime);
      updateField('time', formattedTime);
      setError('');
      setResult('');
    } catch (err) {
      setError(t('calculator.errorInvalidInput') || 'Invalid input values');
    }
  };

  const calculatePace = () => {
    const { distance, time } = inputs;

    if (distance === '' || time === '') {
      setError(t('calculator.errorNeedDistanceTime') || 'Please fill in both distance and time to calculate pace');
      return;
    }

    try {
      const dist = parseFloat(distance);
      const timeInMinutes = parseTimeToMinutes(time);

      if (isNaN(dist) || isNaN(timeInMinutes)) {
        setError(t('calculator.errorInvalidInput') || 'Invalid input values');
        return;
      }

      const calculatedPace = timeInMinutes / dist;
      updateField('pace', formatPace(calculatedPace));
      setError('');
      setResult('');
    } catch (err) {
      setError(t('calculator.errorInvalidInput') || 'Invalid input values');
    }
  };

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: '#1b2a41',
                mb: 1.5,
              }}
            >
              {t('calculator.title')}
            </Typography>
            <CalculatorModeToggle
              mode={calculatorMode}
              onChange={setCalculatorMode}
              manualLabel={t('calculator.modeManual')}
              autoLabel={t('calculator.modeAuto')}
              manualTooltip={t('calculator.modeManualTooltip')}
              autoTooltip={t('calculator.modeAutoTooltip')}
            />
          </Box>

          <PerformanceGauge
            performanceIndex={performanceIndex}
            tooltip={t('calculator.performanceIndexTooltip') || 'Performance Index: Calculated from distance and time'}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('calculator.distance', { unit: unitSystem.distance })}
              value={inputs.distance}
              onChange={handleInputChange('distance')}
              disabled={lockedField === 'distance'}
              type="number"
              inputProps={{ step: '0.1', min: '0' }}
              placeholder={systemType === 'metric' ? '10.5' : '6.5'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 0 }}>
                    <Divider orientation="vertical" sx={{ height: 32, alignSelf: 'center' }} />
                    {calculatorMode === 'auto' ? (
                      <IconButton
                        onClick={() => toggleLock('distance')}
                        disabled={lockedField !== 'distance' && !canLockField('distance')}
                        sx={{ color: lockedField === 'distance' ? '#324a5f' : '#000000' }}
                        title={lockedField === 'distance' ?
                          (t('calculator.unlockDistance') || 'Unlock distance field') :
                          (t('calculator.lockDistance') || 'Lock distance field')
                        }
                        aria-label={lockedField === 'distance' ?
                          (t('calculator.unlockDistance') || 'Unlock distance field') :
                          (t('calculator.lockDistance') || 'Lock distance field')
                        }
                      >
                        {lockedField === 'distance' ? <Lock /> : <LockOpen />}
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={calculateDistance}
                        disabled={lockedField !== null}
                        title="Calculate distance from time and pace"
                        aria-label="Calculate distance from time and pace"
                      >
                        <Calculate />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <ChipsBar
              chips={getDistanceChips()}
              onChipClick={handleDistanceChipClick}
              disabled={lockedField === 'distance'}
              selectedValue={inputs.distance}
            />
          </Grid>

          <Grid item xs={12}>
            <TimeInput
              fullWidth
              label={t('calculator.time')}
              value={inputs.time}
              disabled={lockedField === 'time'}
              onChange={(value) => {
                if (lockedField !== 'time') {
                  updateField('time', value);
                  setError('');
                  setResult('');
                }
              }}
              maxSegments={3}
              placeholder="1:25:30"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 0 }}>
                    <Divider orientation="vertical" sx={{ height: 32, alignSelf: 'center' }} />
                    {calculatorMode === 'auto' ? (
                      <IconButton
                        onClick={() => toggleLock('time')}
                        disabled={lockedField !== 'time' && !canLockField('time')}
                        sx={{ color: lockedField === 'time' ? '#324a5f' : '#000000' }}
                        title={lockedField === 'time' ?
                          (t('calculator.unlockTime') || 'Unlock time field') :
                          (t('calculator.lockTime') || 'Lock time field')
                        }
                        aria-label={lockedField === 'time' ?
                          (t('calculator.unlockTime') || 'Unlock time field') :
                          (t('calculator.lockTime') || 'Lock time field')
                        }
                      >
                        {lockedField === 'time' ? <Lock /> : <LockOpen />}
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={calculateTime}
                        disabled={lockedField !== null}
                        title="Calculate time from distance and pace"
                        aria-label="Calculate time from distance and pace"
                      >
                        <Calculate />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <ChipsBar
              chips={getTimeChips()}
              onChipClick={(value) => adjustTime(value as number)}
              disabled={lockedField === 'time' || !inputs.time || inputs.time.trim() === ''}
            />
          </Grid>

          <Grid item xs={12}>
            <TimeInput
              fullWidth
              label={t('calculator.pace', { unit: unitSystem.pace })}
              value={inputs.pace}
              disabled={lockedField === 'pace'}
              onChange={(value) => {
                if (lockedField !== 'pace') {
                  updateField('pace', value);
                  setError('');
                  setResult('');
                }
              }}
              maxSegments={2}
              placeholder="5:30"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 0 }}>
                    <Divider orientation="vertical" sx={{ height: 32, alignSelf: 'center' }} />
                    {calculatorMode === 'auto' ? (
                      <IconButton
                        onClick={() => toggleLock('pace')}
                        disabled={lockedField !== 'pace' && !canLockField('pace')}
                        sx={{ color: lockedField === 'pace' ? '#324a5f' : '#000000' }}
                        title={lockedField === 'pace' ?
                          (t('calculator.unlockPace') || 'Unlock pace field') :
                          (t('calculator.lockPace') || 'Lock pace field')
                        }
                        aria-label={lockedField === 'pace' ?
                          (t('calculator.unlockPace') || 'Unlock pace field') :
                          (t('calculator.lockPace') || 'Lock pace field')
                        }
                      >
                        {lockedField === 'pace' ? <Lock /> : <LockOpen />}
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={calculatePace}
                        disabled={lockedField !== null}
                        title="Calculate pace from distance and time"
                        aria-label="Calculate pace from distance and time"
                      >
                        <Calculate />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <ChipsBar
              chips={getPaceChips()}
              onChipClick={(value) => adjustPace(value as number)}
              disabled={lockedField === 'pace' || !inputs.pace || inputs.pace.trim() === ''}
            />
          </Grid>
        </Grid>

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 3,
              borderRadius: 2,
              boxShadow: '0px 2px 8px rgba(211, 47, 47, 0.15)',
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {error}
          </Alert>
        )}

        {result && (
          <Alert
            severity="success"
            sx={{
              mt: 3,
              borderRadius: 2,
              boxShadow: '0px 2px 8px rgba(46, 125, 50, 0.15)',
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {result}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RunningCalculator;
