import React from 'react';
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
import { CalculatorModeToggle } from './CalculatorModeToggle';
import { ChipsBar, type ChipOption } from './ChipsBar';
import { useCalculatorMachine, type FieldName } from '../hooks/useCalculatorMachine';
import { usePerformanceIndex } from '../hooks/usePerformanceIndex';
import type { UnitSystem, UnitSystemConfig } from '../types';
import { tokens } from '../styles/tokens';
import presets from '../styles/presets';

interface RunningCalculatorProps {
  unitSystem: UnitSystem;
  onPerformanceIndexChange?: (pi: number | null) => void;
}

/**
 * Running Calculator using State Machine pattern
 * All lock management, field updates, and calculation logic is abstracted to useCalculatorMachine
 */
const RunningCalculator: React.FC<RunningCalculatorProps> = ({
  unitSystem: systemType,
  onPerformanceIndexChange
}) => {
  const { t } = useTranslation();

  // State machine handles all logic
  const {
    inputs,
    lockedField,
    error,
    mode,
    dispatch,
    canLockField,
    isFieldLocked,
  } = useCalculatorMachine();

  const performanceIndex = usePerformanceIndex({ inputs, unitSystem: systemType, onPerformanceIndexChange });

  const unitSystem: UnitSystemConfig = {
    distance: systemType === 'metric' ? 'km' : 'miles',
    pace: systemType === 'metric' ? 'min/km' : 'min/mile',
  };

  // Chip configurations
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
      return [
        { label: '1 mi', value: 1 },
        { label: '5 mi', value: 5 },
        { label: '10 mi', value: 10 },
        { label: '13.1mi', value: 13.1094 },
        { label: '26.2mi', value: 26.2188 },
      ];
    }
  };

  const getTimeChips = (): ChipOption[] => [
    { label: '+60s', value: 60 },
    { label: '+30s', value: 30 },
    { label: '-30s', value: -30 },
    { label: '-60s', value: -60 },
  ];

  const getPaceChips = (): ChipOption[] => [
    { label: '-15s', value: -15 },
    { label: '-5s', value: -5 },
    { label: '+5s', value: 5 },
    { label: '+15s', value: 15 },
  ];

  // Render field with lock/calculate button
  const renderFieldWithAction = (
    field: FieldName,
    label: string,
    value: string,
    placeholder?: string,
    isTimeField: boolean = false
  ) => {
    const locked = isFieldLocked(field);

    const handleChange = (valueOrEvent: string | React.ChangeEvent<HTMLInputElement>) => {
      const newValue = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent.target.value;
      dispatch({ type: 'UPDATE_FIELD', field, value: newValue });
    };

    const InputComponent = isTimeField ? TimeInput : TextField;

    return (
      <InputComponent
        fullWidth
        label={label}
        value={value}
        placeholder={placeholder}
        onChange={handleChange as any}
        disabled={mode === 'auto' && locked}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {mode === 'auto' ? (
                <IconButton
                  onClick={() => dispatch({ type: 'TOGGLE_LOCK', field })}
                  size="small"
                  disabled={!canLockField(field)}
                  aria-label={locked ? `Unlock ${field}` : `Lock ${field}`}
                  sx={{
                    color: locked ? 'primary.main' : 'action.active',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {locked ? <Lock /> : <LockOpen />}
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => dispatch({ type: 'CALCULATE', targetField: field })}
                  size="small"
                  disabled={lockedField !== null}
                  aria-label={`Calculate ${field} from ${
                    field === 'distance' ? 'time and pace' :
                    field === 'time' ? 'distance and pace' :
                    'distance and time'
                  }`}
                  sx={{
                    color: 'action.active',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Calculate />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
    );
  };

  return (
    <Card elevation={3}>
      <CardContent sx={presets.cardContent}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ ...presets.title, mb: 1.5 }}
            >
              {t('calculator.title')}
            </Typography>
            <CalculatorModeToggle
              mode={mode}
              onChange={(newMode) => dispatch({ type: 'SET_MODE', mode: newMode })}
              manualLabel={t('calculator.modeManual')}
              autoLabel={t('calculator.modeAuto')}
              manualTooltip={t('calculator.modeManualTooltip')}
              autoTooltip={t('calculator.modeAutoTooltip')}
            />
          </Box>

          <PerformanceGauge
            performanceIndex={performanceIndex}
            tooltip={performanceIndex !== null ? t('calculator.performanceIndexTooltip') : t('calculator.performanceIndex')}
            ariaLabel={t('calculator.performanceIndex')}
          />
        </Box>

        <Divider sx={{ mb: 3, borderColor: tokens.dividerColor }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch({ type: 'CLEAR_ERROR' })}>
            {t(error)}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Distance Field */}
          <Grid item xs={12}>
            {renderFieldWithAction('distance', t('calculator.distance', { unit: unitSystem.distance }), inputs.distance, systemType === 'metric' ? '10.5' : '6.5')}
            <ChipsBar
              chips={getDistanceChips()}
              onChipClick={(value) => dispatch({ type: 'SET_PRESET', field: 'distance', value: value.toString() })}
              disabled={isFieldLocked('distance')}
            />
          </Grid>

          {/* Time Field */}
          <Grid item xs={12}>
            {renderFieldWithAction('time', t('calculator.time'), inputs.time, '1:25:30', true)}
            <ChipsBar
              chips={getTimeChips()}
              onChipClick={(value) => dispatch({ type: 'ADJUST', field: 'time', delta: value as number })}
              disabled={isFieldLocked('time') || !inputs.time || inputs.time.trim() === ''}
            />
          </Grid>

          {/* Pace Field */}
          <Grid item xs={12}>
            {renderFieldWithAction('pace', t('calculator.pace', { unit: unitSystem.pace }), inputs.pace, '5:30', true)}
            <ChipsBar
              chips={getPaceChips()}
              onChipClick={(value) => dispatch({ type: 'ADJUST', field: 'pace', delta: value as number })}
              disabled={isFieldLocked('pace') || !inputs.pace || inputs.pace.trim() === ''}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RunningCalculator;
