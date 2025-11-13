import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { formatDigitsAsTime } from '../utils/formatters';

interface TimeInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  maxSegments?: number; // 2 for MM:SS, 3 for HH:MM:SS
}

/**
 * TimeInput component that automatically formats time input with colons.
 * Users type only numbers, and colons are inserted automatically.
 *
 * Examples:
 * - User types "530" → displays "5:30"
 * - User types "13000" → displays "1:30:00"
 */
const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  maxSegments = 3,
  ...textFieldProps
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Update display when value prop changes
  useEffect(() => {
    const formatted = formatDigitsAsTime(value, maxSegments);
    setDisplayValue(formatted);
  }, [value, maxSegments]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Allow empty value
    if (inputValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    // Remove all non-digit characters (including colons from user input)
    const digits = inputValue.replace(/\D/g, '');

    // Limit based on maxSegments
    let maxLength = 6; // Default for HH:MM:SS
    if (maxSegments === 2) {
      maxLength = 4; // MM:SS
    }

    const limitedDigits = digits.substring(0, maxLength);

    // Format for display (adds colons automatically)
    const formatted = formatDigitsAsTime(limitedDigits, maxSegments);
    setDisplayValue(formatted);

    // Pass the formatted value (with colons) to parent
    onChange(formatted);
  };

  return (
    <TextField
      {...textFieldProps}
      value={displayValue}
      onChange={handleChange}
      inputProps={{
        ...textFieldProps.inputProps,
        inputMode: 'numeric',
        pattern: '[0-9:]*',
      }}
    />
  );
};

export default TimeInput;
