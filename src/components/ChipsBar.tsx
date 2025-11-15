import React from 'react';
import { Stack, Chip } from '@mui/material';
import { tokens } from '../styles/tokens';

export interface ChipOption {
  label: string;
  value: number | string;
}

interface ChipsBarProps {
  chips: ChipOption[];
  onChipClick: (value: number | string) => void;
  disabled?: boolean;
  selectedValue?: string | number;
  variant?: 'filled' | 'outlined';
}

/**
 * Reusable chips bar component for displaying clickable chip options
 * Used for distance presets and time/pace adjustments
 */
export const ChipsBar: React.FC<ChipsBarProps> = ({
  chips,
  onChipClick,
  disabled = false,
  selectedValue,
  variant = 'outlined',
}) => {
  const handleChipClick = (value: number | string) => {
    if (!disabled) {
      onChipClick(value);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, flexWrap: 'wrap', gap: 1 }}>
      {chips.map((chip) => {
        const isSelected = selectedValue !== undefined &&
                          selectedValue.toString() === chip.value.toString();

        return (
          <Chip
            key={`${chip.label}-${chip.value}`}
            label={chip.label}
            onClick={() => handleChipClick(chip.value)}
            disabled={disabled}
            size="medium"
            variant={isSelected ? 'filled' : variant}
            color={isSelected ? 'primary' : 'default'}
            sx={{
              mb: 0.5,
              fontWeight: 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              ...(isSelected && {
                background: tokens.chipSelectedGradient,
              }),
            }}
          />
        );
      })}
    </Stack>
  );
};
