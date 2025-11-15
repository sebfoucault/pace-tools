import React from 'react';
import { Box } from '@mui/material';
import { Watch } from '@mui/icons-material';

interface WatchWithHandsProps {
  sx?: any;
  fontSize?: string;
}

/**
 * Enhanced Watch icon with clock hands - simplified and cleaner
 */
export const WatchWithHands: React.FC<WatchWithHandsProps> = ({ sx, fontSize }) => (
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
