import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Lock, Calculate } from '@mui/icons-material';

export type CalculatorMode = 'manual' | 'auto';

interface CalculatorModeToggleProps {
  mode: CalculatorMode;
  onChange: (mode: CalculatorMode) => void;
  manualLabel?: string;
  autoLabel?: string;
  manualTooltip?: string;
  autoTooltip?: string;
}

/**
 * Toggle button for switching between manual and auto calculator modes
 */
export const CalculatorModeToggle: React.FC<CalculatorModeToggleProps> = ({
  mode,
  onChange,
  manualLabel = 'Manual',
  autoLabel = 'Auto',
  manualTooltip = 'Manual mode: Use calculate buttons',
  autoTooltip = 'Auto mode: Lock fields for automatic calculation',
}) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newMode: CalculatorMode | null) => {
    if (newMode !== null) {
      onChange(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={handleChange}
      aria-label="calculator mode"
      size="small"
      sx={{
        '& .MuiToggleButton-root': {
          px: 2,
          py: 0.5,
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      }}
    >
      <Tooltip title={manualTooltip} arrow>
        <ToggleButton value="manual" aria-label="manual mode">
          <Calculate sx={{ fontSize: '1.1rem', mr: 0.75 }} />
          {manualLabel}
        </ToggleButton>
      </Tooltip>
      <Tooltip title={autoTooltip} arrow>
        <ToggleButton value="auto" aria-label="auto mode">
          <Lock sx={{ fontSize: '1.1rem', mr: 0.75 }} />
          {autoLabel}
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};
