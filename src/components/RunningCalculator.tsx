import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Straighten,
  Watch,
  DirectionsRun,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TimeInput from './TimeInput';

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

// Enhanced DirectionsRun icon with speed lines
const RunnerWithSpeedLines: React.FC<{ sx?: any; fontSize?: string }> = ({ sx, fontSize }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
    <DirectionsRun sx={{ fontSize }} />
    <Box
      sx={{
        position: 'absolute',
        left: '-8px',
        top: '30%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <Box sx={{ width: '6px', height: '1.5px', backgroundColor: 'currentColor', opacity: 0.6 }} />
      <Box sx={{ width: '8px', height: '1.5px', backgroundColor: 'currentColor', opacity: 0.7 }} />
      <Box sx={{ width: '6px', height: '1.5px', backgroundColor: 'currentColor', opacity: 0.6 }} />
    </Box>
  </Box>
);

interface CalculationInputs {
  distance: string;
  time: string;
  pace: string;
}

interface UnitSystem {
  distance: 'km' | 'miles';
  pace: 'min/km' | 'min/mile';
}

interface RunningCalculatorProps {
  unitSystem: 'metric' | 'imperial';
}

type LockableField = 'distance' | 'time' | 'pace' | null;

const RunningCalculator: React.FC<RunningCalculatorProps> = ({ unitSystem: systemType }) => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<CalculationInputs>({
    distance: '',
    time: '',
    pace: '',
  });
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [usePreciseTime, setUsePreciseTime] = useState<boolean>(false);
  const [lockedField, setLockedField] = useState<LockableField>(null);
  const lastAutoCalculatedRef = useRef<CalculationInputs>({ distance: '', time: '', pace: '' });

  // Derive unit system from prop
  const unitSystem: UnitSystem = {
    distance: systemType === 'metric' ? 'km' : 'miles',
    pace: systemType === 'metric' ? 'min/km' : 'min/mile',
  };

  // Parse time helper function
  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':').map(part => parseFloat(part));

    if (parts.length === 4) {
      const hours = parts[0];
      const minutes = parts[1];
      const seconds = parts[2];
      const tenths = parts[3];

      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(tenths) ||
          minutes >= 60 || seconds >= 60 || tenths >= 10) {
        throw new Error('Invalid time format');
      }

      return hours * 60 + minutes + seconds / 60 + tenths / 600;
    } else if (parts.length === 3) {
      const first = parts[0];
      const second = parts[1];
      const third = parts[2];

      if (third < 10 && first < 90 && third > 0) {
        if (isNaN(first) || isNaN(second) || isNaN(third) ||
            second >= 60 || third >= 10) {
          throw new Error('Invalid time format');
        }
        return first + second / 60 + third / 600;
      } else {
        if (isNaN(first) || isNaN(second) || isNaN(third) ||
            second >= 60 || third >= 60) {
          throw new Error('Invalid time format');
        }
        return first * 60 + second + third / 60;
      }
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

  // Format time helper function
  const formatTime = useCallback((minutes: number, includeDeciseconds: boolean = false): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const totalSeconds = (minutes % 1) * 60;

    if (includeDeciseconds) {
      const secs = Math.floor(totalSeconds);
      const deciseconds = Math.round((totalSeconds % 1) * 10);

      if (deciseconds >= 10) {
        return formatTime(minutes + 1/60, false);
      }

      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${deciseconds}`;
      } else {
        return `${mins}:${secs.toString().padStart(2, '0')}:${deciseconds}`;
      }
    } else {
      const secs = Math.round(totalSeconds);

      if (secs >= 60) {
        return formatTime(minutes + 1/60, false);
      }

      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }
    }
  }, []);

  // Format pace helper function
  const formatPace = useCallback((paceInMinutes: number): string => {
    const mins = Math.floor(paceInMinutes);
    const totalSeconds = (paceInMinutes % 1) * 60;
    const secs = Math.round(totalSeconds);

    if (secs >= 60) {
      return formatPace(paceInMinutes + 1/60);
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Auto-calculate whenever inputs change and a field is locked
  useEffect(() => {
    if (!lockedField) return;

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
            const formattedTime = formatTime(calculatedTime, usePreciseTime);
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
            const formattedTime = formatTime(calculatedTime, usePreciseTime);
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
  }, [inputs, lockedField, usePreciseTime, formatTime, formatPace]);

  const handleInputChange = (field: keyof CalculationInputs) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setLockedField(field);
    }
  };

  // Handle distance chip click
  const handleDistanceChipClick = (distance: number) => {
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
    const currentTimeInMinutes = parseTime(inputs.time);
    if (isNaN(currentTimeInMinutes)) return;

    const newTimeInMinutes = Math.max(0, currentTimeInMinutes + (deltaSeconds / 60));
    const formattedTime = formatTime(newTimeInMinutes, usePreciseTime);

    setInputs(prev => ({ ...prev, time: formattedTime }));
    setError('');
    setResult('');
  };

  // Adjust pace by a given number of seconds per km/mile
  const adjustPace = (deltaSeconds: number) => {
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
          const formattedTime = formatTime(calculatedTime, usePreciseTime);

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

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            color: '#1b2a41',
            mb: 3,
          }}
        >
          {t('calculator.title')}
        </Typography>

        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: 'rgba(27, 42, 65, 0.04)',
            borderRadius: 2,
            border: '1px solid rgba(27, 42, 65, 0.1)',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={usePreciseTime}
                onChange={(e) => setUsePreciseTime(e.target.checked)}
                color="primary"
              />
            }
            label={t('calculator.preciseTime') || 'Precise time (tenths of seconds)'}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('calculator.distance', { unit: unitSystem.distance })}
              value={inputs.distance}
              onChange={handleInputChange('distance')}
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
                      sx={{ color: '#000000' }}
                      title="Calculate distance from time and pace"
                      aria-label="Calculate distance from time and pace"
                    >
                      <Straighten />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, mx: 1, flexWrap: 'wrap', gap: 1 }}>
              {getDistanceChips().map((chip) => (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  onClick={() => handleDistanceChipClick(chip.value)}
                  size="small"
                  variant={inputs.distance === chip.value.toString() ? 'filled' : 'outlined'}
                  color={inputs.distance === chip.value.toString() ? 'primary' : 'default'}
                  sx={{
                    mb: 0.5,
                    fontWeight: 500,
                    cursor: 'pointer',
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
              onChange={(value) => {
                setInputs(prev => ({ ...prev, time: value }));
                setError('');
                setResult('');
              }}
              maxSegments={usePreciseTime ? 4 : 3}
              placeholder={usePreciseTime ? "1:25:30:5" : "1:25:30"}
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
                      sx={{ color: '#000000' }}
                      title="Calculate time from distance and pace"
                      aria-label="Calculate time from distance and pace"
                    >
                      <WatchWithHands />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, mx: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="-1min"
                onClick={() => adjustTime(-60)}
                disabled={!inputs.time || inputs.time.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="-30s"
                onClick={() => adjustTime(-30)}
                disabled={!inputs.time || inputs.time.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="+30s"
                onClick={() => adjustTime(30)}
                disabled={!inputs.time || inputs.time.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="+1min"
                onClick={() => adjustTime(60)}
                disabled={!inputs.time || inputs.time.trim() === ''}
                size="small"
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
              onChange={(value) => {
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
                      sx={{ color: '#000000' }}
                      title="Calculate pace from distance and time"
                      aria-label="Calculate pace from distance and time"
                    >
                      <RunnerWithSpeedLines />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, mx: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="-15s"
                onClick={() => adjustPace(-15)}
                disabled={!inputs.pace || inputs.pace.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="-5s"
                onClick={() => adjustPace(-5)}
                disabled={!inputs.pace || inputs.pace.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="+5s"
                onClick={() => adjustPace(5)}
                disabled={!inputs.pace || inputs.pace.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="+15s"
                onClick={() => adjustPace(15)}
                disabled={!inputs.pace || inputs.pace.trim() === ''}
                size="small"
                variant="outlined"
                sx={{
                  mb: 0.5,
                  fontWeight: 500,
                  cursor: 'pointer',
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
