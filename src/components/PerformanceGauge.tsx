import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../styles/tokens';

interface PerformanceGaugeProps {
  /** Performance Index value to display. Null shows N/A */
  performanceIndex: number | null;
  /** Size of the gauge in pixels (default: 80) */
  size?: number;
  /** Optional tooltip text */
  tooltip?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * PerformanceGauge Component
 *
 * Displays a circular gauge showing the performance index value.
 * The gauge uses a 300° arc from 7 o'clock to 5 o'clock position,
 * with color coding based on performance level:
 * - Green (≥70): Excellent
 * - Blue (≥55): Good
 * - Orange (≥40): Moderate
 * - Red (<40): Low
 *
 * The gauge is calibrated for marathon performance:
 * - Min PI: 29 (5h00 marathon)
 * - Max PI: 90 (1h55 marathon)
 */
const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({
  performanceIndex,
  size = 80,
  tooltip,
  ariaLabel,
}) => {
  // Display N/A when PI is not available
  if (performanceIndex === null || performanceIndex <= 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={tooltip}
        aria-label={ariaLabel || 'Performance Index not available'}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `6px solid ${tokens.gaugeBackgroundArcStroke}`,
          }}
        />
        <Typography
          sx={{
            position: 'relative',
            fontSize: `${size * 0.015}rem`,
            fontWeight: 600,
            color: tokens.gaugeNeutralText,
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
  const radius = size * 0.425;
  const centerX = size / 2;
  const centerY = size / 2;
  const startAngleDeg = 210;
  const totalArcDegrees = 300;

  // Helper: convert angle to cartesian coordinates
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
    const largeArcFlag = arcDegrees > 180 ? '1' : '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const filledArcDegrees = (totalArcDegrees * gaugePercentage) / 100;

  // Color based on performance level
  const gaugeColor = displayPI >= 70
    ? tokens.gaugeExcellent  // Green for excellent
    : displayPI >= 55
    ? tokens.gaugeGood  // Blue for good
    : displayPI >= 40
    ? tokens.gaugeModerate  // Orange for moderate
    : tokens.gaugeLow; // Red for low

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={tooltip}
      aria-label={ariaLabel || `Performance Index: ${displayPI.toFixed(1)}`}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute' }}
      >
        {/* Thin inner circle for decoration */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 8}
          fill="none"
          stroke={tokens.gaugeInnerCircleStroke}
          strokeWidth="1"
        />

        {/* Gray background arc - full 300° */}
        <path
          d={createArcPath(totalArcDegrees)}
          fill="none"
          stroke={tokens.gaugeBackgroundArcStroke}
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

      {/* Performance index value */}
      <Typography
        sx={{
          position: 'relative',
          fontSize: `${size * 0.015}rem`,
          fontWeight: 700,
          color: tokens.headerColor,
          zIndex: 1,
        }}
      >
        {displayPI.toFixed(1)}
      </Typography>
    </Box>
  );
};

export default PerformanceGauge;
