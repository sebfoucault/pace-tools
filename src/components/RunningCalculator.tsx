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
            const formattedTime = formatTime(calculatedTime, false);
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
            const formattedTime = formatTime(calculatedTime, false);
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
    const formattedTime = formatTime(newTimeInMinutes, false);

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
          const formattedTime = formatTime(calculatedTime, false);

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

      // Convert distance to meters (assuming input is in km or miles)
      const distanceInMeters = systemType === 'metric' ? dist * 1000 : dist * 1609.34;

      // Calculate velocity in m/min
      const velocity = distanceInMeters / timeInMinutes;

      // Calculate i = -4.60 + 0.182258 * v + 0.000104 * v^2
      const i = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;

      // Calculate imax = 0.8 + 0.1894393 * exp(-0.012778 * t) + 0.2989558 * exp(-0.1932605 * t)
      const imax = 0.8 +
                   0.1894393 * Math.exp(-0.012778 * timeInMinutes) +
                   0.2989558 * Math.exp(-0.1932605 * timeInMinutes);

      // Calculate performance index pi = i / imax
      const pi = i / imax;

      // Return as raw value (not percentage)
      return Math.max(0, pi);
    } catch (error) {
      return null;
    }
  };

  const performanceIndex = calculatePerformanceIndex();

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

          {(() => {
            if (performanceIndex === null) {
              // Display N/A when PI cannot be calculated
              return (
                <Box
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={t('calculator.performanceIndexTooltip') || 'Performance Index: Calculated from distance and time'}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '6px solid rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Typography
                    sx={{
                      position: 'relative',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#9e9e9e',
                      zIndex: 1,
                    }}
                  >
                    N/A
                  </Typography>
                </Box>
              );
            }

            // Gauge range based on marathon benchmarks:
            // - Lowest: 5h00 marathon = PI ~29
            // - Highest: 1h55 marathon = PI ~90
            const minPI = 29;
            const maxPI = 90;

            // Cap the displayed performance index at 100 to avoid infinity display
            const displayPI = Math.min(100, performanceIndex);
            const gaugePercentage = Math.max(0, Math.min(100, ((displayPI - minPI) / (maxPI - minPI)) * 100));

            // Gauge: Arc from 7 o'clock (left) to 5 o'clock (right) going through the TOP
            // This creates a 300° arc that avoids the bottom section (6 o'clock)
            const radius = 34;
            const centerX = 40;
            const centerY = 40;

            // 7 o'clock = 210°, 5 o'clock = 150°
            // Going clockwise from 210° to 150° = 300° (through 9, 12, 3 o'clock)
            const startAngleDeg = 210; // Start at 7 o'clock on the LEFT
            const totalArcDegrees = 300; // Span 300° to reach 5 o'clock on the RIGHT (going the long way)

            // Helper: convert angle to cartesian (0° = 3 o'clock, goes clockwise)
            const polarToCartesian = (angleInDegrees: number) => {
              const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
              return {
                x: centerX + radius * Math.cos(angleInRadians),
                y: centerY + radius * Math.sin(angleInRadians),
              };
            };

            // Create arc path from start angle spanning given degrees clockwise
            const createArcPath = (arcDegrees: number) => {
              const start = polarToCartesian(startAngleDeg);
              const end = polarToCartesian(startAngleDeg + arcDegrees);

              // Use large arc flag for arcs > 180°
              const largeArcFlag = arcDegrees > 180 ? '1' : '0';

              return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
            };

            // Calculate how many degrees to fill based on percentage
            const filledArcDegrees = (totalArcDegrees * gaugePercentage) / 100;            // Color based on performance level (use displayPI for color)
            const gaugeColor = displayPI >= 70
              ? '#4caf50'  // Green for excellent
              : displayPI >= 55
              ? '#42a5f5'  // Blue for good
              : displayPI >= 40
              ? '#ff9800'  // Orange for moderate
              : '#f44336'; // Red for low

            return (
              <Box
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={t('calculator.performanceIndexTooltip') || 'Performance Index: Calculated from distance and time'}
              >
                {/* SVG with arcs */}
                <svg
                  width="80"
                  height="80"
                  style={{ position: 'absolute' }}
                >
                  {/* Thin inner circle for decoration */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius - 8}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.12)"
                    strokeWidth="1"
                  />

                  {/* Gray background arc - full 300° */}
                  <path
                    d={createArcPath(totalArcDegrees)}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Colored arc - filled portion */}
                  {gaugePercentage > 0 && (
                    <path
                      d={createArcPath(filledArcDegrees)}
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Performance index value - display capped at 100 */}
                <Typography
                  sx={{
                    position: 'relative',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#1b2a41',
                    zIndex: 1,
                  }}
                >
                  {displayPI.toFixed(1)}
                </Typography>
              </Box>
            );
          })()}
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
