import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { predictTimeFromPI } from '../utils/performanceIndex';
import { formatTimeFromMinutes, formatPaceFromMinutes } from '../utils/formatters';
import type { UnitSystem, RaceDistance } from '../types';

interface RacePredictorProps {
  unitSystem: UnitSystem;
  performanceIndex: number | null;
}

const RACE_DISTANCES: RaceDistance[] = [
  { name: '1000m', meters: 1000, displayKm: 1, displayMiles: 0.62 },
  { name: '1500m', meters: 1500, displayKm: 1.5, displayMiles: 0.93 },
  { name: '5K', meters: 5000, displayKm: 5, displayMiles: 3.11 },
  { name: '10K', meters: 10000, displayKm: 10, displayMiles: 6.21 },
  { name: '15K', meters: 15000, displayKm: 15, displayMiles: 9.32 },
  { name: '20K', meters: 20000, displayKm: 20, displayMiles: 12.43 },
  { name: 'Half Marathon', meters: 21097.5, displayKm: 21.1, displayMiles: 13.11 },
  { name: '30K', meters: 30000, displayKm: 30, displayMiles: 18.64 },
  { name: 'Marathon', meters: 42195, displayKm: 42.2, displayMiles: 26.22 },
  { name: '50K', meters: 50000, displayKm: 50, displayMiles: 31.07 },
];

const RacePredictor: React.FC<RacePredictorProps> = ({ unitSystem, performanceIndex }) => {
  const { t } = useTranslation();

  // Calculate pace for a predicted time and distance
  const calculatePace = (timeMinutes: number, distanceKm: number): number => {
    return timeMinutes / distanceKm;
  };

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: '#1b2a41',
            }}
          >
            {t('racePredictor.title') || 'Race Predictor'}
          </Typography>

          {/* Performance Index Gauge */}
          {(() => {
            if (performanceIndex === null || performanceIndex <= 0) {
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
                  aria-label="Performance Index not available"
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

            // Gauge range based on marathon benchmarks
            const minPI = 29;
            const maxPI = 90;

            // Cap the displayed performance index at 100
            const displayPI = Math.min(100, performanceIndex);
            const gaugePercentage = Math.max(0, Math.min(100, ((displayPI - minPI) / (maxPI - minPI)) * 100));

            // Gauge: Arc from 7 o'clock to 5 o'clock (300° arc)
            const radius = 34;
            const centerX = 40;
            const centerY = 40;
            const startAngleDeg = 210;
            const totalArcDegrees = 300;

            const polarToCartesian = (angleInDegrees: number) => {
              const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
              return {
                x: centerX + radius * Math.cos(angleInRadians),
                y: centerY + radius * Math.sin(angleInRadians),
              };
            };

            const createArcPath = (arcDegrees: number) => {
              const start = polarToCartesian(startAngleDeg);
              const end = polarToCartesian(startAngleDeg + arcDegrees);
              const largeArcFlag = arcDegrees > 180 ? '1' : '0';
              return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
            };

            const filledArcDegrees = (totalArcDegrees * gaugePercentage) / 100;

            const gaugeColor = displayPI >= 70
              ? '#4caf50'
              : displayPI >= 55
              ? '#42a5f5'
              : displayPI >= 40
              ? '#ff9800'
              : '#f44336';

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
                aria-label={`Performance Index: ${displayPI.toFixed(1)}`}
              >
                <svg
                  width="80"
                  height="80"
                  style={{ position: 'absolute' }}
                >
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius - 8}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.12)"
                    strokeWidth="1"
                  />
                  <path
                    d={createArcPath(totalArcDegrees)}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
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

        {performanceIndex === null || performanceIndex <= 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {t('racePredictor.enterData') ||
              'Enter distance and time in the Calculator tab to get race predictions.'}
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('racePredictor.description') ||
                'Based on your performance index, here are predicted times for various race distances:'}
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1b2a41' }}>
                      {t('racePredictor.distance') || 'Distance'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1b2a41' }}>
                      {t('racePredictor.predictedTime') || 'Predicted Time'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1b2a41' }}>
                      {t('racePredictor.pace') || 'Pace'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RACE_DISTANCES.map((race, index) => {
                    const predictedTimeMinutes = predictTimeFromPI(race.meters, performanceIndex!);
                    const distanceKm = unitSystem === 'metric' ? race.displayKm! : race.displayMiles!;
                    const distanceUnit = unitSystem === 'metric' ? 'km' : 'mi';
                    const paceUnit = unitSystem === 'metric' ? 'min/km' : 'min/mi';

                    if (predictedTimeMinutes === null) {
                      return (
                        <TableRow key={race.name} hover>
                          <TableCell>{race.name}</TableCell>
                          <TableCell align="right" colSpan={3}>
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    const pace = calculatePace(predictedTimeMinutes, distanceKm);
                    const formattedTime = formatTimeFromMinutes(predictedTimeMinutes);
                    const formattedPace = formatPaceFromMinutes(pace);

                    return (
                      <TableRow
                        key={race.name}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {race.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {distanceKm} {distanceUnit}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                            {formattedTime}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {formattedPace} {paceUnit}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                {t('racePredictor.note') ||
                  'Note: Predictions are based on the Riegel/Cameron performance model. Actual race times may vary based on training, conditions, and course difficulty.'}
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RacePredictor;
