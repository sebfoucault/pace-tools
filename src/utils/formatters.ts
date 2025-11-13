/**
 * Time and Pace Formatting Utilities
 *
 * This module provides functions for formatting time and pace values
 * for display in running calculators and race predictors.
 */

/**
 * Format time from minutes to HH:MM:SS or MM:SS format
 * @param minutes - Time in minutes
 * @returns Formatted time string
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const totalSeconds = (minutes % 1) * 60;
  const secs = Math.round(totalSeconds);

  if (secs >= 60) {
    return formatTime(minutes + 1/60);
  }

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Format pace from minutes per km/mile to MM:SS format
 * @param paceInMinutes - Pace in minutes per distance unit
 * @returns Formatted pace string (MM:SS)
 */
export function formatPace(paceInMinutes: number): string {
  const mins = Math.floor(paceInMinutes);
  const totalSeconds = (paceInMinutes % 1) * 60;
  const secs = Math.round(totalSeconds);

  if (secs >= 60) {
    return formatPace(paceInMinutes + 1/60);
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Alternative time formatter that converts minutes to seconds first
 * This is useful for race predictor displays
 * @param minutes - Time in minutes
 * @returns Formatted time string (HH:MM:SS or MM:SS)
 */
export function formatTimeFromMinutes(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Alternative pace formatter that converts minutes to seconds first
 * This is useful for race predictor displays
 * @param paceInMinutes - Pace in minutes per distance unit
 * @returns Formatted pace string (MM:SS)
 */
export function formatPaceFromMinutes(paceInMinutes: number): string {
  const totalSeconds = Math.round(paceInMinutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse time string (HH:MM:SS or MM:SS) to minutes
 * Supports formats:
 * - HH:MM:SS (e.g., "1:30:45")
 * - MM:SS (e.g., "45:30")
 *
 * @param timeString - Time string to parse
 * @returns Time in minutes, or NaN if invalid
 */
export function parseTimeToMinutes(timeString: string): number {
  if (!timeString || typeof timeString !== 'string') {
    return NaN;
  }

  const trimmed = timeString.trim();
  if (trimmed === '') {
    return NaN;
  }

  const parts = trimmed.split(':');

  if (parts.length < 2 || parts.length > 3) {
    return NaN;
  }

  const numbers = parts.map(part => {
    const num = parseFloat(part);
    return isNaN(num) || num < 0 ? NaN : num;
  });

  if (numbers.some(n => isNaN(n))) {
    return NaN;
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    // HH:MM:SS format
    [hours, minutes, seconds] = numbers;
    if (minutes >= 60 || seconds >= 60) {
      return NaN;
    }
  } else if (parts.length === 2) {
    // MM:SS format
    [minutes, seconds] = numbers;
    if (seconds >= 60) {
      return NaN;
    }
  }

  const totalMinutes = hours * 60 + minutes + seconds / 60;
  return totalMinutes;
}

/**
 * Parse pace string (MM:SS) to minutes per distance unit
 * Supports format: MM:SS (e.g., "5:30" for 5:30 min/km)
 *
 * @param paceString - Pace string to parse
 * @returns Pace in minutes per distance unit, or NaN if invalid
 */
export function parsePaceToMinutes(paceString: string): number {
  if (!paceString || typeof paceString !== 'string') {
    return NaN;
  }

  const trimmed = paceString.trim();
  if (trimmed === '') {
    return NaN;
  }

  const parts = trimmed.split(':');

  if (parts.length !== 2) {
    return NaN;
  }

  const minutes = parseFloat(parts[0]);
  const seconds = parseFloat(parts[1]);

  if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
    return NaN;
  }

  return minutes + seconds / 60;
}

/**
 * Format a sequence of digits as time with colons for user input
 * Automatically places colons as the user types digits.
 *
 * For 3-segment format (time):
 * - 1-2 digits: SS (e.g., "5" or "53")
 * - 3 digits: M:SS (e.g., "1:30")
 * - 4 digits: MM:SS (e.g., "13:00")
 * - 5 digits: H:MM:SS (e.g., "1:30:00")
 * - 6 digits: HH:MM:SS (e.g., "13:00:00")
 *
 * For 2-segment format (pace):
 * - 1 digit: M (e.g., "5")
 * - 2 digits: M:S (e.g., "5:3")
 * - 3 digits: M:SS (e.g., "5:30")
 * - 4 digits: MM:SS (e.g., "12:30")
 *
 * @param input - String containing digits (may include colons from previous format)
 * @param maxSegments - Maximum number of segments (2 for pace, 3 for time)
 * @returns Formatted string with colons, or empty string if no valid input
 */
export function formatDigitsAsTime(input: string, maxSegments: number = 3): string {
  if (!input) return '';

  // If the value already has colons in the right format, keep it as is
  // This preserves programmatically set values (e.g., from calculations)
  if (input.includes(':')) {
    return input;
  }

  // Remove any non-digit characters for user input
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';

  // Determine segment sizes based on maxSegments and input length
  let segments: number[] = [];
  if (maxSegments === 3) {
    // Format: prioritize filling seconds (right) then minutes (middle) then hours (left)
    // 1-2 digits: SS (5 or 53)
    // 3 digits: M:SS (1:30)
    // 4 digits: MM:SS (13:00)
    // 5 digits: H:MM:SS (1:30:00)
    // 6 digits: HH:MM:SS (13:00:00)
    if (digits.length <= 2) {
      // Just seconds
      segments = [digits.length];
    } else if (digits.length === 3) {
      // M:SS
      segments = [1, 2];
    } else if (digits.length === 4) {
      // MM:SS
      segments = [2, 2];
    } else if (digits.length === 5) {
      // H:MM:SS
      segments = [1, 2, 2];
    } else {
      // HH:MM:SS (6 digits)
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
}
