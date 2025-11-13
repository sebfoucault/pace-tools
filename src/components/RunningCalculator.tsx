import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Straighten,
  Watch,
  Lock,
  LockOpen,
  Speed,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TimeInput from './TimeInput';
import PerformanceGauge from './PerformanceGauge';
import { calculatePerformanceIndex as calcPI, convertDistanceToMeters } from '../utils/performanceIndex';
import { formatTime as sharedFormatTime, formatPace as sharedFormatPace } from '../utils/formatters';
import type { UnitSystem, CalculationInputs, UnitSystemConfig, LockableField } from '../types';

// Enhanced Watch icon with clock hands - simplified and cleaner
const WatchWithHands: React.FC<{ sx?: any; fontSize?: string }> = ({ sx, fontSize }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
    <Watch sx={{ fontSize }} />
    {/* Hour hand */}
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '28%',
        height: '1.5px',
        backgroundColor: 'currentColor',
        transformOrigin: '0% 50%',
        transform: 'rotate(-50deg)',
        opacity: 0.85,
      }}
    />
    {/* Minute hand */}
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '38%',
        height: '1px',
        backgroundColor: 'currentColor',
        transformOrigin: '0% 50%',
        transform: 'rotate(110deg)',
        opacity: 0.85,
      }}
    />
  </Box>
);

// Gauge icon similar to Performance Index gauge
const GaugeIcon: React.FC<{ sx?: any; fontSize?: string }> = ({ sx, fontSize }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
    <Speed sx={{ fontSize }} />
  </Box>
);

interface RunningCalculatorProps {
  unitSystem: UnitSystem;
  onPerformanceIndexChange?: (pi: number | null) => void;
}

const RunningCalculator: React.FC<RunningCalculatorProps> = ({ unitSystem: systemType, onPerformanceIndexChange }) => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<CalculationInputs>({
    distance: '',
    time: '',
    pace: '',
  });
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [lockedField, setLockedField] = useState<LockableField>(null);
  const lastAutoCalculatedRef = useRef<CalculationInputs>({ distance: '', time: '', pace: '' });

  // Derive unit system from prop
  const unitSystem: UnitSystemConfig = {
    distance: systemType === 'metric' ? 'km' : 'miles',
    pace: systemType === 'metric' ? 'min/km' : 'min/mile',
  };

  // Parse time helper function
  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':').map(part => parseFloat(part));

    if (parts.length === 3) {
      const first = parts[0];
      const second = parts[1];
      const third = parts[2];

      // Always interpret 3-part format as H:M:S
      if (isNaN(first) || isNaN(second) || isNaN(third) ||
          second >= 60 || third >= 60) {
        throw new Error('Invalid time format');
      }
      return first * 60 + second + third / 60;
    } else if (parts.length === 2) {
      return parts[0] + parts[1] / 60;
    } else if (parts.length === 1) {
      return parts[0];
    }

    throw new Error('Invalid time format');
  };

  // Parse pace helper function
  const parsePace = (paceStr: string): number => {
    const parts = paceStr.split(':');

    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);

      if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) {
        throw new Error('Invalid pace format');
      }

      return minutes + seconds / 60;
    } else if (parts.length === 1) {
      const minutes = parseFloat(parts[0]);
      if (isNaN(minutes)) {
        throw new Error('Invalid pace format');
      }
      return minutes;
    }

    throw new Error('Invalid pace format');
  };

  // Format time helper function - uses shared formatter
  const formatTime = useCallback((minutes: number): string => {
    return sharedFormatTime(minutes);
  }, []);

  // Format pace helper function - uses shared formatter
  const formatPace = useCallback((paceInMinutes: number): string => {
    return sharedFormatPace(paceInMinutes);
  }, []);

  // Auto-calculate whenever inputs change and a field is locked
  useEffect(() => {
    if (!lockedField) return;

    // If the locked field is now empty, unlock it
    const lockedFieldValue = inputs[lockedField];
    if (!lockedFieldValue || lockedFieldValue.trim() === '') {
      setLockedField(null);
      return;
    }

    try {
      const { distance, time, pace } = inputs;
      let newInputs = { ...inputs };
      let shouldUpdate = false;

      // When a field is locked, treat it as CONSTANT and calculate the unlocked field
      const hasDistance = distance && parseFloat(distance) > 0;
      const hasTime = time && time.trim() !== '';
      const hasPace = pace && pace.trim() !== '';

      if (lockedField === 'distance' && hasDistance) {
        // Distance is LOCKED (constant) - calculate time or pace based on other inputs
        if (hasPace && (pace !== lastAutoCalculatedRef.current.pace || distance !== lastAutoCalculatedRef.current.distance)) {
          // Calculate time from locked distance + pace
          const dist = parseFloat(distance);
          const paceInMinutes = parsePace(pace);
          if (dist > 0 && paceInMinutes > 0) {
            const calculatedTime = dist * paceInMinutes;
            const formattedTime = formatTime(calculatedTime);
            newInputs.time = formattedTime;
            shouldUpdate = true;
          }
        } else if (hasTime && (time !== lastAutoCalculatedRef.current.time || distance !== lastAutoCalculatedRef.current.distance)) {
          // Calculate pace from locked distance + time
          const dist = parseFloat(distance);
          const timeInMinutes = parseTime(time);
          if (dist > 0 && timeInMinutes > 0) {
            const calculatedPace = timeInMinutes / dist;
            newInputs.pace = formatPace(calculatedPace);
            shouldUpdate = true;
          }
        }
      } else if (lockedField === 'time' && hasTime) {
        // Time is LOCKED (constant) - calculate distance or pace based on other inputs
        if (hasPace && (pace !== lastAutoCalculatedRef.current.pace || time !== lastAutoCalculatedRef.current.time)) {
          // Calculate distance from locked time + pace
          const timeInMinutes = parseTime(time);
          const paceInMinutes = parsePace(pace);
          if (timeInMinutes > 0 && paceInMinutes > 0) {
            const calculatedDistance = timeInMinutes / paceInMinutes;
            newInputs.distance = calculatedDistance.toFixed(2);
            shouldUpdate = true;
          }
        } else if (hasDistance && (distance !== lastAutoCalculatedRef.current.distance || time !== lastAutoCalculatedRef.current.time)) {
          // Calculate pace from locked time + distance
          const dist = parseFloat(distance);
          const timeInMinutes = parseTime(time);
          if (dist > 0 && timeInMinutes > 0) {
            const calculatedPace = timeInMinutes / dist;
            newInputs.pace = formatPace(calculatedPace);
            shouldUpdate = true;
          }
        }
      } else if (lockedField === 'pace' && hasPace) {
        // Pace is LOCKED (constant) - calculate distance or time based on other inputs
        if (hasDistance && (distance !== lastAutoCalculatedRef.current.distance || pace !== lastAutoCalculatedRef.current.pace)) {
          // Calculate time from locked pace + distance
          const dist = parseFloat(distance);
          const paceInMinutes = parsePace(pace);
          if (dist > 0 && paceInMinutes > 0) {
            const calculatedTime = dist * paceInMinutes;
            const formattedTime = formatTime(calculatedTime);
            newInputs.time = formattedTime;
            shouldUpdate = true;
          }
        } else if (hasTime && (time !== lastAutoCalculatedRef.current.time || pace !== lastAutoCalculatedRef.current.pace)) {
          // Calculate distance from locked pace + time
          const timeInMinutes = parseTime(time);
          const paceInMinutes = parsePace(pace);
          if (timeInMinutes > 0 && paceInMinutes > 0) {
            const calculatedDistance = timeInMinutes / paceInMinutes;
            newInputs.distance = calculatedDistance.toFixed(2);
            shouldUpdate = true;
          }
        }
      }

      if (shouldUpdate) {
        lastAutoCalculatedRef.current = newInputs;
        setInputs(newInputs);
        setError('');
      }
    } catch (error) {
      // Silently ignore auto-calculation errors
    }
  }, [inputs, lockedField, formatTime, formatPace]);

  const handleInputChange = (field: keyof CalculationInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Prevent editing if field is locked
    if (lockedField === field) {
      return;
    }

    const newValue = event.target.value;
    setInputs(prev => ({
      ...prev,
      [field]: newValue,
    }));
    setError('');
    setResult('');
  };

  const toggleLock = (field: LockableField) => {
    if (lockedField === field) {
      // Unlocking the current field
      setLockedField(null);
    } else {
      // Locking a new field (this automatically unlocks any other locked field)
      // Only allow locking if the field has a value
      const fieldValue = inputs[field as keyof CalculationInputs];
      if (fieldValue && fieldValue.trim() !== '') {
        setLockedField(field);
      }
    }
  };

  // Check if a field can be locked (has a non-empty value)
  const canLockField = (field: keyof CalculationInputs): boolean => {
    const fieldValue = inputs[field];
    return fieldValue !== '' && fieldValue.trim() !== '';
  };

  // Handle distance chip click
  const handleDistanceChipClick = (distance: number) => {
    // Prevent changing if field is locked
    if (lockedField === 'distance') {
      return;
    }
    setInputs(prev => ({
      ...prev,
      distance: distance.toString(),
    }));
    setError('');
    setResult('');
  };

  // Get distance shortcuts based on unit system
  const getDistanceChips = () => {
    if (systemType === 'metric') {
      return [
        { label: '1 km', value: 1 },
        { label: '5 km', value: 5 },
        { label: '10 km', value: 10 },
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

  // Adjust time by a given number of seconds
  const adjustTime = (deltaSeconds: number) => {
    // Prevent adjustment if field is locked
    if (lockedField === 'time') {
      return;
    }
    const currentTimeInMinutes = parseTime(inputs.time);
    if (isNaN(currentTimeInMinutes)) return;

    const newTimeInMinutes = Math.max(0, currentTimeInMinutes + (deltaSeconds / 60));
    const formattedTime = formatTime(newTimeInMinutes);

    setInputs(prev => ({ ...prev, time: formattedTime }));
    setError('');
    setResult('');
  };

  // Adjust pace by a given number of seconds per km/mile
  const adjustPace = (deltaSeconds: number) => {
    // Prevent adjustment if field is locked
    if (lockedField === 'pace') {
      return;
    }
    const currentPaceInMinutes = parsePace(inputs.pace);
    if (isNaN(currentPaceInMinutes)) return;

    const newPaceInMinutes = Math.max(0, currentPaceInMinutes + (deltaSeconds / 60));
    const formattedPace = formatPace(newPaceInMinutes);

    setInputs(prev => ({ ...prev, pace: formattedPace }));
    setError('');
    setResult('');
  };

  const calculateDistance = () => {
    try {
      // Use callback to ensure we get the latest state
      setInputs(currentInputs => {
        const { time, pace } = currentInputs;

        if (time === '' || pace === '') {
          setError(t('calculator.errorNeedTimePace') || 'Please fill in both time and pace to calculate distance');
          return currentInputs;
        }

        try {
          const timeInMinutes = parseTime(time);
          const paceInMinutes = parsePace(pace);
          const calculatedDistance = timeInMinutes / paceInMinutes;

          setError('');
          setResult('');

          return { ...currentInputs, distance: calculatedDistance.toFixed(2) };
        } catch (parseErr) {
          setError(t('calculator.errorInvalidInput') || 'Invalid input values');
          return currentInputs;
        }
      });
    } catch (err) {
      setError(t('calculator.errorInvalidInput') || 'Invalid input values');
    }
  };

  const calculateTime = () => {
    try {
      // Use callback to ensure we get the latest state
      setInputs(currentInputs => {
        const { distance, pace } = currentInputs;

        if (distance === '' || pace === '') {
          setError(t('calculator.errorNeedDistancePace') || 'Please fill in both distance and pace to calculate time');
          return currentInputs;
        }

        try {
          const dist = parseFloat(distance);
          const paceInMinutes = parsePace(pace);
          const calculatedTime = dist * paceInMinutes;
          const formattedTime = formatTime(calculatedTime);

          setError('');
          setResult('');

          return { ...currentInputs, time: formattedTime };
        } catch (parseErr) {
          setError(t('calculator.errorInvalidInput') || 'Invalid input values');
          return currentInputs;
        }
      });
    } catch (err) {
      setError(t('calculator.errorInvalidInput') || 'Invalid input values');
    }
  };

  const calculatePace = () => {
    try {
      // Use callback to ensure we get the latest state
      setInputs(currentInputs => {
        const { distance, time } = currentInputs;

        if (distance === '' || time === '') {
          setError(t('calculator.errorNeedDistanceTime') || 'Please fill in both distance and time to calculate pace');
          return currentInputs;
        }

        try {
          const dist = parseFloat(distance);
          const timeInMinutes = parseTime(time);
          const calculatedPace = timeInMinutes / dist;

          setError('');
          setResult('');

          return { ...currentInputs, pace: formatPace(calculatedPace) };
        } catch (parseErr) {
          setError(t('calculator.errorInvalidInput') || 'Invalid input values');
          return currentInputs;
        }
      });
    } catch (err) {
      setError(t('calculator.errorInvalidInput') || 'Invalid input values');
    }
  };

  // Calculate Performance Index
  const calculatePerformanceIndex = (): number | null => {
    const { distance, time } = inputs;

    if (!distance || !time || distance.trim() === '' || time.trim() === '') {
      return null;
    }

    try {
      const dist = parseFloat(distance);
      const timeInMinutes = parseTime(time);

      if (dist <= 0 || timeInMinutes <= 0) {
        return null;
      }

      // Convert distance to meters using utility
      const distanceInMeters = convertDistanceToMeters(dist, systemType === 'metric' ? 'km' : 'miles');

      // Calculate performance index using utility function
      return calcPI(distanceInMeters, timeInMinutes);
    } catch (error) {
      return null;
    }
  };

  const performanceIndex = calculatePerformanceIndex();

  // Notify parent of performance index changes
  useEffect(() => {
    if (onPerformanceIndexChange) {
      onPerformanceIndexChange(performanceIndex);
    }
  }, [performanceIndex, onPerformanceIndexChange]);

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: '#1b2a41',
            }}
          >
            {t('calculator.title')}
          </Typography>

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
                    <IconButton
                      onClick={calculateDistance}
                      edge="end"
                      disabled={lockedField !== null}
                      title="Calculate distance from time and pace"
                      aria-label="Calculate distance from time and pace"
                    >
                      <Straighten />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, flexWrap: 'wrap', gap: 1 }}>
              {getDistanceChips().map((chip) => (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  onClick={() => handleDistanceChipClick(chip.value)}
                  disabled={lockedField === 'distance'}
                  size="medium"
                  variant={inputs.distance === chip.value.toString() ? 'filled' : 'outlined'}
                  color={inputs.distance === chip.value.toString() ? 'primary' : 'default'}
                  sx={{
                    mb: 0.5,
                    fontWeight: 500,
                    cursor: lockedField === 'distance' ? 'not-allowed' : 'pointer',
                    ...(inputs.distance === chip.value.toString() && {
                      background: 'linear-gradient(90deg, #1b2a41 0%, #324a5f 100%)',
                    }),
                  }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <TimeInput
              fullWidth
              label={t('calculator.time')}
              value={inputs.time}
              disabled={lockedField === 'time'}
              onChange={(value) => {
                // Prevent editing if field is locked
                if (lockedField === 'time') {
                  return;
                }
                setInputs(prev => ({ ...prev, time: value }));
                setError('');
                setResult('');
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
                    <IconButton
                      onClick={calculateTime}
                      edge="end"
                      disabled={lockedField !== null}
                      title="Calculate time from distance and pace"
                      aria-label="Calculate time from distance and pace"
                    >
                      <WatchWithHands />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="-60s"
                onClick={() => adjustTime(-60)}
                disabled={lockedField === 'time' || !inputs.time || inputs.time.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'time' ? 'not-allowed' : 'pointer',
                }}
              />
              <Chip
                label="-30s"
                onClick={() => adjustTime(-30)}
                disabled={lockedField === 'time' || !inputs.time || inputs.time.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'time' ? 'not-allowed' : 'pointer',
                }}
              />
              <Chip
                label="+30s"
                onClick={() => adjustTime(30)}
                disabled={lockedField === 'time' || !inputs.time || inputs.time.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'time' ? 'not-allowed' : 'pointer',
                }}
              />
              <Chip
                label="+60s"
                onClick={() => adjustTime(60)}
                disabled={lockedField === 'time' || !inputs.time || inputs.time.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <TimeInput
              fullWidth
              label={t('calculator.pace', { unit: unitSystem.pace })}
              value={inputs.pace}
              disabled={lockedField === 'pace'}
              onChange={(value) => {
                // Prevent editing if field is locked
                if (lockedField === 'pace') {
                  return;
                }
                setInputs(prev => ({ ...prev, pace: value }));
                setError('');
                setResult('');
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
                    <IconButton
                      onClick={calculatePace}
                      edge="end"
                      disabled={lockedField !== null}
                      title="Calculate pace from distance and time"
                      aria-label="Calculate pace from distance and time"
                    >
                      <GaugeIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="-15s"
                onClick={() => adjustPace(-15)}
                disabled={lockedField === 'pace' || !inputs.pace || inputs.pace.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'pace' ? 'not-allowed' : 'pointer',
                }}
              />
              <Chip
                label="-5s"
                onClick={() => adjustPace(-5)}
                disabled={lockedField === 'pace' || !inputs.pace || inputs.pace.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'pace' ? 'not-allowed' : 'pointer',
                }}
              />
              <Chip
                label="+5s"
                onClick={() => adjustPace(5)}
                disabled={lockedField === 'pace' || !inputs.pace || inputs.pace.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'pace' ? 'not-allowed' : 'pointer',
                }}
              />
              <Chip
                label="+15s"
                onClick={() => adjustPace(15)}
                disabled={lockedField === 'pace' || !inputs.pace || inputs.pace.trim() === ''}
                size="medium"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: lockedField === 'pace' ? 'not-allowed' : 'pointer',
                }}
              />
            </Stack>
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
