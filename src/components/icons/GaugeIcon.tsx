import React from 'react';
import { Box } from '@mui/material';
import { Speed } from '@mui/icons-material';

interface GaugeIconProps {
  sx?: any;
  fontSize?: string;
}

/**
 * Gauge icon similar to Performance Index gauge
 */
export const GaugeIcon: React.FC<GaugeIconProps> = ({ sx, fontSize }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
    <Speed sx={{ fontSize }} />
  </Box>
);
