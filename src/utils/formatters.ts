/**
 * Time and Pace Formatting Utilities
 *
 * This module provides functions for formatting time and pace values
 * for display in running calculators and race predictors.
 */

/**
 * Format time from minutes to HH:MM:SS or MM:SS format
 * @param minutes - Time in minutes
 * @param includeDeciseconds - Whether to include deciseconds (tenths of a second)
 * @returns Formatted time string
 */
export function formatTime(minutes: number, includeDeciseconds: boolean = false): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const totalSeconds = (minutes % 1) * 60;

  if (includeDeciseconds) {
    const secs = Math.floor(totalSeconds);
    const deciseconds = Math.round((totalSeconds % 1) * 10);

    if (deciseconds >= 10) {
      return formatTime(minutes + 1/60, false);
    }

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${deciseconds}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}:${deciseconds}`;
    }
  } else {
    const secs = Math.round(totalSeconds);

    if (secs >= 60) {
      return formatTime(minutes + 1/60, false);
    }

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
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
