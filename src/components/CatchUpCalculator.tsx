import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TimeInput from './TimeInput';
import { ChipsBar, type ChipOption } from './ChipsBar';
import { calculateCatchUp, isValidCatchUp } from '../utils/catchUpCalculator';
import { formatTimeFromMinutes } from '../utils/formatters';
import type { UnitSystem } from '../types';
import { tokens } from '../styles/tokens';
import presets from '../styles/presets';
import { PI_CONSTANTS } from '../utils/performanceIndex';

interface CatchUpCalculatorProps {
  unitSystem: UnitSystem;
}

const CatchUpCalculator: React.FC<CatchUpCalculatorProps> = ({ unitSystem }) => {
  const { t } = useTranslation();

  const [partnerPace, setPartnerPace] = useState('');
  const [intervalPace, setIntervalPace] = useState('');
  const [distance, setDistance] = useState('');
  const [result, setResult] = useState<{
    timeOut: number;
    timeBack: number;
    distanceOut: number;
    distanceBack: number;
  } | null>(null);
  const [showError, setShowError] = useState(false);

  const isMetric = unitSystem === 'metric';
  const distanceUnit = isMetric ? 'km' : 'mi';
  const paceUnit = isMetric ? 'min/km' : 'min/mi';

  // Distance chips
  const distanceChips: ChipOption[] = isMetric
    ? [
        { label: '1 km', value: 1 },
        { label: '2 km', value: 2 },
        { label: '5 km', value: 5 },
      ]
    : [
        { label: '1 mi', value: 1 },
        { label: '2 mi', value: 2 },
        { label: '3 mi', value: 3 },
      ];

  // Calculate results when inputs change
  useEffect(() => {
    const partnerPaceMinutes = parseTime(partnerPace);
    const intervalPaceMinutes = parseTime(intervalPace);
    const distanceValue = parseFloat(distance);

    if (!partnerPaceMinutes || !intervalPaceMinutes || !distanceValue) {
      setResult(null);
      setShowError(false);
      return;
    }

    // Convert pace to speed for validation
    const distanceUnit = isMetric ? 1000 : PI_CONSTANTS.METERS_PER_MILE;
    const partnerSpeed = distanceUnit / partnerPaceMinutes;
    const intervalSpeed = distanceUnit / intervalPaceMinutes;

    // Validate: interval speed must be faster (higher value)
    if (!isValidCatchUp(partnerSpeed, intervalSpeed)) {
      setResult(null);
      setShowError(true);
      return;
    }

    setShowError(false);

    // Convert distance to meters
    const distanceMeters = isMetric
      ? distanceValue * 1000
      : distanceValue * PI_CONSTANTS.METERS_PER_MILE;

    // Calculate catch-up result
    const calcResult = calculateCatchUp(
      partnerSpeed,
      intervalSpeed,
      distanceMeters
    );

    if (calcResult) {
      setResult({
        timeOut: calcResult.timeOut,
        timeBack: calcResult.timeBack,
        distanceOut: calcResult.distanceOut,
        distanceBack: calcResult.distanceBack,
      });
    }
  }, [partnerPace, intervalPace, distance, unitSystem]);

  // Parse time string to minutes
  const parseTime = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return minutes + seconds / 60;
      }
    }
    return null;
  };

  // Handle distance chip click
  const handleDistanceChipClick = (value: number | string) => {
    setDistance(value.toString());
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    const distanceInUnit = isMetric
      ? meters / 1000
      : meters / PI_CONSTANTS.METERS_PER_MILE;
    return distanceInUnit.toFixed(2);
  };

  return (
    <Card elevation={3}>
      <CardContent sx={presets.cardContent}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={presets.title}>
            {t('catchUpCalculator.title') || 'Catch-Up Calculator'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Help text */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          {t('catchUpCalculator.helpText') ||
            'Plan intervals when running with a slower partner. Run in the opposite direction, then turn around and catch up, covering your target distance at your interval pace.'}
        </Alert>

        {/* Inputs */}
        <Box sx={{ mb: 3 }}>
          <TimeInput
            label={t('catchUpCalculator.partnerPace', { unit: paceUnit }) || `Partner Pace (${paceUnit})`}
            value={partnerPace}
            onChange={setPartnerPace}
            placeholder="6:30"
            maxSegments={2}
            fullWidth
            margin="normal"
          />

          <TimeInput
            label={t('catchUpCalculator.yourPace', { unit: paceUnit }) || `Your Pace (${paceUnit})`}
            value={intervalPace}
            onChange={setIntervalPace}
            placeholder="4:45"
            maxSegments={2}
            fullWidth
            margin="normal"
          />

          <TextField
            label={t('catchUpCalculator.targetDistance', { unit: distanceUnit }) || `Target Distance (${distanceUnit})`}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="4"
            type="number"
            inputProps={{ step: '0.1', min: '0' }}
            fullWidth
            margin="normal"
          />

          {/* Distance chips */}
          <Box sx={{ mt: 2 }}>
            <ChipsBar
              chips={distanceChips}
              onChipClick={handleDistanceChipClick}
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Validation error */}
        {showError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {t('catchUpCalculator.errorPaceTooSlow') ||
              'Your interval pace must be faster than your partner\'s pace.'}
          </Alert>
        )}

        {/* Results table */}
        {result && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: tokens.headerColor }}>
              {t('catchUpCalculator.results') || 'Results'}
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={presets.tableHeaderRow}>
                      <TableCell sx={{ fontWeight: 600, color: tokens.headerColor }}>
                        {t('catchUpCalculator.split') || 'Split'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: tokens.headerColor }}>
                        {t('catchUpCalculator.time') || 'Time'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: tokens.headerColor }}>
                        {t('catchUpCalculator.distance') || 'Distance'}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500, color: '#ff6b6b' }}>
                        {t('catchUpCalculator.outSplit') || 'Out (opposite direction)'}
                      </TableCell>
                      <TableCell align="right">{formatTimeFromMinutes(result.timeOut)}</TableCell>
                      <TableCell align="right">
                        {formatDistance(result.distanceOut)} {distanceUnit}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500, color: '#51cf66' }}>
                        {t('catchUpCalculator.backSplit') || 'Back (catch up)'}
                      </TableCell>
                      <TableCell align="right">{formatTimeFromMinutes(result.timeBack)}</TableCell>
                      <TableCell align="right">
                        {formatDistance(result.distanceBack)} {distanceUnit}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t('catchUpCalculator.total') || 'Total'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatTimeFromMinutes(result.timeOut + result.timeBack)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {distance} {distanceUnit}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
      </CardContent>
    </Card>
  );
};

export default CatchUpCalculator;
