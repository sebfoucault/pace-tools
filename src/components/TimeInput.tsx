import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface TimeInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  maxSegments?: number; // 2 for MM:SS, 3 for HH:MM:SS, 4 for HH:MM:SS:d
}

/**
 * TimeInput component that automatically formats time input with colons.
 * Users type only numbers, and colons are inserted automatically.
 *
 * Examples:
 * - User types "530" → displays "5:30"
 * - User types "12530" → displays "1:25:30"
 * - User types "125305" → displays "1:25:30:5"
 */
const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  maxSegments = 3,
  ...textFieldProps
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format the value for display (add colons)
  const formatTime = React.useCallback((rawValue: string): string => {
    if (!rawValue) return '';

    // If the value already has colons in the right format, keep it as is
    // This preserves programmatically set values (e.g., from calculations)
    if (rawValue.includes(':')) {
      return rawValue;
    }

    // Remove any non-digit characters for user input
    const digits = rawValue.replace(/\D/g, '');
    if (!digits) return '';

    // Determine segment sizes based on maxSegments and input length
    let segments: number[] = [];
    if (maxSegments === 4) {
      // HH:MM:SS:d format
      if (digits.length <= 3) {
        // MM:S or M:SS
        segments = [digits.length <= 1 ? 1 : digits.length - 2, 2];
      } else if (digits.length <= 5) {
        // MM:SS:d
        segments = [2, 2, 1];
      } else {
        // HH:MM:SS:d
        segments = [2, 2, 2, 1];
      }
    } else if (maxSegments === 3) {
      // Variable format based on length
      if (digits.length <= 3) {
        // M:SS or MM:S - use all but last 2 for minutes, last 2 for seconds
        segments = [digits.length <= 1 ? 1 : digits.length - 2, 2];
      } else if (digits.length <= 4) {
        // MM:SS
        segments = [2, 2];
      } else if (digits.length <= 5) {
        // MM:SS:d or M:SS:SS
        segments = [1, 2, 2];
      } else {
        // HH:MM:SS
        segments = [2, 2, 2];
      }
    } else if (maxSegments === 2) {
      // MM:SS format - always 2 segments
      if (digits.length <= 1) {
        segments = [1];
      } else if (digits.length <= 2) {
        segments = [1, 1];
      } else if (digits.length <= 3) {
        segments = [1, 2];
      } else {
        segments = [2, 2];
      }
    }

    // Build the formatted string
    const parts: string[] = [];
    let position = 0;

    for (let i = 0; i < segments.length && position < digits.length; i++) {
      const segmentLength = segments[i];
      const segment = digits.substring(position, position + segmentLength);
      if (segment) {
        parts.push(segment);
        position += segmentLength;
      }
    }

    return parts.join(':');
  }, [maxSegments]);

  // Update display when value prop changes
  useEffect(() => {
    const formatted = formatTime(value);
    setDisplayValue(formatted);
  }, [value, formatTime]);

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
    if (maxSegments === 4) {
      maxLength = 7; // HH:MM:SS:d
    } else if (maxSegments === 2) {
      maxLength = 4; // MM:SS
    }

    const limitedDigits = digits.substring(0, maxLength);

    // Format for display (adds colons automatically)
    const formatted = formatTime(limitedDigits);
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
