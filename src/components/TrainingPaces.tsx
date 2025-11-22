import React, { useState } from 'react';
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
  IconButton,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PerformanceGauge from './PerformanceGauge';
import {
  calculateTrainingPaceRange,
  calculateTimeForDistance,
  type TrainingPaceType,
} from '../utils/performanceIndex';
import { formatPaceFromMinutes } from '../utils/formatters';
import type { UnitSystem } from '../types';
import { tokens } from '../styles/tokens';
import presets from '../styles/presets';

interface TrainingPacesProps {
  unitSystem: UnitSystem;
  performanceIndex: number | null;
}

interface TrainingZone {
  type: TrainingPaceType;
  translationKey: string;
  distances: number[]; // in meters
}

const TRAINING_ZONES: TrainingZone[] = [
  {
    type: 'easy',
    translationKey: 'trainingPaces.easy',
    distances: [1000, 1500],
  },
  {
    type: 'marathon',
    translationKey: 'trainingPaces.marathon',
    distances: [100, 400, 1000, 1500],
  },
  {
    type: 'threshold',
    translationKey: 'trainingPaces.threshold',
    distances: [100, 400, 1000, 1500],
  },
  {
    type: 'interval',
    translationKey: 'trainingPaces.interval',
    distances: [100, 200, 400, 1000, 1500],
  },
  {
    type: 'repetition',
    translationKey: 'trainingPaces.repetition',
    distances: [100, 200, 400, 1000],
  },
];

// Calculate max distances for consistent table height
const MAX_DISTANCES = Math.max(...TRAINING_ZONES.map(zone => zone.distances.length));

const TrainingPaces: React.FC<TrainingPacesProps> = ({ unitSystem, performanceIndex }) => {
  const { t } = useTranslation();
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);

  const formatTime = (minutes: number): string => {
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Card elevation={3}>
      <CardContent sx={presets.cardContent}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={presets.title}
          >
            {t('trainingPaces.title') || 'Training Paces'}
          </Typography>

          <PerformanceGauge performanceIndex={performanceIndex} />
        </Box>

        {performanceIndex === null || performanceIndex <= 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {t('trainingPaces.enterData')}
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('trainingPaces.description')}
            </Typography>

            {(() => {
              const zone = TRAINING_ZONES[currentZoneIndex];
              const paceRange = calculateTrainingPaceRange(performanceIndex!, zone.type);

              if (!paceRange) {
                return null;
              }

              const paceUnit = unitSystem === 'metric' ? 'min/km' : 'min/mi';
              const conversionFactor = unitSystem === 'metric' ? 1000 : 1609.34;

              // Convert velocity (m/min) to pace (min/km or min/mi)
              const minPace = conversionFactor / paceRange.maxVelocity; // Max velocity = min pace
              const maxPace = conversionFactor / paceRange.minVelocity; // Min velocity = max pace

              const formattedMinPace = formatPaceFromMinutes(minPace);
              const formattedMaxPace = formatPaceFromMinutes(maxPace);

              return (
                <Box>
                  {/* Navigation Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <IconButton
                      onClick={() => setCurrentZoneIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentZoneIndex === 0}
                      aria-label={t('trainingPaces.previous')}
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowBack />
                    </IconButton>

                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t(zone.translationKey)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentZoneIndex + 1} / {TRAINING_ZONES.length}
                      </Typography>
                    </Box>

                    <IconButton
                      onClick={() => setCurrentZoneIndex((prev) => Math.min(TRAINING_ZONES.length - 1, prev + 1))}
                      disabled={currentZoneIndex === TRAINING_ZONES.length - 1}
                      aria-label={t('trainingPaces.next')}
                      sx={{ color: 'primary.main' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>

                  {/* Pace Range */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    <strong>{t('trainingPaces.pace')}:</strong> {formattedMinPace} - {formattedMaxPace} {paceUnit}
                  </Typography>

                  {/* Distance Time Table - Always show with consistent height */}
                  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={presets.tableHeaderRow}>
                          <TableCell sx={{ fontWeight: 600, color: tokens.headerColor }}>
                            {t('trainingPaces.distance')}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: tokens.headerColor }}>
                            {t('trainingPaces.timeRange')}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {zone.distances.map((distance) => {
                          const minTime = calculateTimeForDistance(distance, paceRange.minVelocity);
                          const maxTime = calculateTimeForDistance(distance, paceRange.maxVelocity);

                          return (
                            <TableRow key={distance} hover sx={presets.hoverRow}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatDistance(distance)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {formatTime(minTime)} - {formatTime(maxTime)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Fill empty rows to maintain consistent table height */}
                        {Array.from({ length: MAX_DISTANCES - zone.distances.length }).map((_, index) => (
                          <TableRow key={`empty-${index}`} sx={{ height: '41px' }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ visibility: 'hidden' }}>
                                -
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ visibility: 'hidden' }}>
                                -
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })()}

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                {t('trainingPaces.note')}
              </Typography>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingPaces;
