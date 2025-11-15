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
  const maskId = React.useId();
  const isNA = performanceIndex === null || performanceIndex <= 0;

  // Gauge range based on marathon benchmarks
  const minPI = 29;
  const maxPI = 90;

  // Cap the displayed performance index at 100
  const displayPI = Math.min(100, performanceIndex ?? 0);
  const gaugePercentage = Math.max(0, Math.min(100, ((displayPI - minPI) / (maxPI - minPI)) * 100));

  // Gauge: Arc from 7 o'clock to 5 o'clock (300° arc)
  const radius = size * 0.425;
  const centerX = size / 2;
  const centerY = size / 2;
  const startAngleDeg = 210;
  const totalArcDegrees = 300;
  const strokeW = 6;

  // Helper: convert angle to cartesian coordinates
  const polarToCartesian = (angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Create arc path from a given start angle spanning given degrees clockwise
  const createArcPathFrom = (startDeg: number, arcDegrees: number) => {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(startDeg + arcDegrees);
    const largeArcFlag = arcDegrees > 180 ? '1' : '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Convenience wrapper for full-arc from the component's start angle
  const createArcPath = (arcDegrees: number) => createArcPathFrom(startAngleDeg, arcDegrees);

  const filledArcDegrees = (totalArcDegrees * gaugePercentage) / 100;

  // Mono color scheme: black foreground over grey background
  const gaugeColor = 'black';

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
      aria-label={ariaLabel || (isNA ? 'Performance Index not available' : `Performance Index: ${displayPI.toFixed(1)}`)}
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

        {/*
          Draw with a small gap between the black (filled) arc and the grey arc.
          - When percentage == 0: draw a single full grey arc.
          - Otherwise:
            * Draw black arc shortened by half the gap.
            * Draw grey arc starting after the gap so a thin space remains visible.
        */}
        {isNA || gaugePercentage <= 0 ? (
          <path
            d={createArcPath(totalArcDegrees)}
            fill="none"
            stroke={tokens.gaugeBackgroundArcStroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        ) : (
          <>
            {(() => {
              // Dynamic gap: ensure visible separation accounting for round caps
              const arcLenPerDeg = (Math.PI * 2 * radius) / 360; // px per degree
              const desiredGapPx = Math.max(1.5, strokeW * 0.25); // subtle gap that scales mildly
              const minGapDeg = 1.5;
              const maxGapDeg = 3.0;
              const computedDeg = desiredGapPx / arcLenPerDeg;
              const gapDeg = Math.min(totalArcDegrees, Math.max(minGapDeg, Math.min(maxGapDeg, computedDeg)));

              // For very small fills, show the black arc without forcing a gap
              if (filledArcDegrees <= gapDeg) {
                const greyArcDegSmall = Math.max(0, totalArcDegrees - filledArcDegrees);
                return (
                  <>
                    <path
                      d={createArcPath(filledArcDegrees)}
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth={strokeW}
                      strokeLinecap="round"
                    />
                    {greyArcDegSmall > 0 && (
                      <path
                        d={createArcPathFrom(startAngleDeg + filledArcDegrees, greyArcDegSmall)}
                        fill="none"
                        stroke={tokens.gaugeBackgroundArcStroke}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                      />
                    )}
                  </>
                );
              }

              // Normal case: shorten black and start grey after the gap
              const blackArcDeg = Math.max(0, Math.min(totalArcDegrees, filledArcDegrees - gapDeg / 2));
              const greyStartDeg = startAngleDeg + Math.min(totalArcDegrees, filledArcDegrees + gapDeg / 2);
              const greyArcDeg = Math.max(0, totalArcDegrees - (filledArcDegrees + gapDeg / 2));

              return (
                <>
                  {/* Mask to notch the grey arc start to create a concave (female) edge */}
                  {greyArcDeg > 0 && (
                    <mask id={maskId}>
                      <rect x="0" y="0" width={size} height={size} fill="white" />
                      {(() => {
                        const notchCenter = polarToCartesian(greyStartDeg);
                        const notchRadius = strokeW / 2 + 0.5;
                        return (
                          <circle
                            cx={notchCenter.x}
                            cy={notchCenter.y}
                            r={notchRadius}
                            fill="black"
                          />
                        );
                      })()}
                    </mask>
                  )}

                  {blackArcDeg > 0 && (
                    <path
                      d={createArcPath(blackArcDeg)}
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth={strokeW}
                      strokeLinecap="round"
                    />
                  )}
                  {greyArcDeg > 0 && (
                    <path
                      d={createArcPathFrom(greyStartDeg, greyArcDeg)}
                      fill="none"
                      stroke={tokens.gaugeBackgroundArcStroke}
                      strokeWidth={strokeW}
                      strokeLinecap="round"
                      mask={`url(#${maskId})`}
                    />
                  )}
                </>
              );
            })()}
          </>
        )}
      </svg>

      {/* Performance index value */}
      <Typography
        sx={{
          position: 'relative',
          fontSize: `${size * 0.015}rem`,
          fontWeight: 700,
          color: isNA ? tokens.gaugeNeutralText : tokens.headerColor,
          zIndex: 1,
        }}
      >
        {isNA ? '—' : displayPI.toFixed(1)}
      </Typography>
    </Box>
  );
};

export default PerformanceGauge;
