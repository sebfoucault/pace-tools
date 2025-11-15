import { useState, useEffect, useRef } from 'react';
import { parseTimeToMinutes, parsePaceToMinutes, formatTime, formatPace } from '../utils/formatters';
import type { CalculationInputs, LockableField } from '../types';

export type CalculatorMode = 'manual' | 'auto';

interface UseCalculatorStateOptions {
  mode?: CalculatorMode;
}

interface UseCalculatorStateReturn {
  inputs: CalculationInputs;
  lockedField: LockableField;
  setInputs: React.Dispatch<React.SetStateAction<CalculationInputs>>;
  setLockedField: React.Dispatch<React.SetStateAction<LockableField>>;
  updateField: (field: keyof CalculationInputs, value: string) => void;
  toggleLock: (field: LockableField) => void;
  canLockField: (field: keyof CalculationInputs) => boolean;
}

/**
 * Custom hook for managing calculator state and auto-calculation logic
 * Handles inputs, locked field state, and automatic field recalculation
 */
export function useCalculatorState(options: UseCalculatorStateOptions = {}): UseCalculatorStateReturn {
  const { mode = 'auto' } = options;
  const [inputs, setInputs] = useState<CalculationInputs>({
    distance: '',
    time: '',
    pace: '',
  });
  const [lockedField, setLockedField] = useState<LockableField>(null);
  const lastAutoCalculatedRef = useRef<CalculationInputs>({ distance: '', time: '', pace: '' });

  // Auto-calculate whenever inputs change and a field is locked (only in auto mode)
  useEffect(() => {
    if (!lockedField || mode === 'manual') return;

    // If the locked field is now empty, unlock it
    const lockedFieldValue = inputs[lockedField];
    if (!lockedFieldValue || lockedFieldValue.trim() === '') {
      setLockedField(null);
      return;
    }

    try {
      const { distance, time, pace } = inputs;
      let newInputs = { ...inputs };
      let shouldUpdate = false;

      // When a field is locked, treat it as CONSTANT and calculate the unlocked field
      const hasDistance = distance && parseFloat(distance) > 0;
      const hasTime = time && time.trim() !== '';
      const hasPace = pace && pace.trim() !== '';

      if (lockedField === 'distance' && hasDistance) {
        // Distance is LOCKED (constant) - calculate time or pace based on other inputs
        if (hasPace && (pace !== lastAutoCalculatedRef.current.pace || distance !== lastAutoCalculatedRef.current.distance)) {
          // Calculate time from locked distance + pace
          const dist = parseFloat(distance);
          const paceInMinutes = parsePaceToMinutes(pace);
          if (dist > 0 && paceInMinutes > 0 && !isNaN(paceInMinutes)) {
            const calculatedTime = dist * paceInMinutes;
            const formattedTime = formatTime(calculatedTime);
            newInputs.time = formattedTime;
            shouldUpdate = true;
          }
        } else if (hasTime && (time !== lastAutoCalculatedRef.current.time || distance !== lastAutoCalculatedRef.current.distance)) {
          // Calculate pace from locked distance + time
          const dist = parseFloat(distance);
          const timeInMinutes = parseTimeToMinutes(time);
          if (dist > 0 && timeInMinutes > 0 && !isNaN(timeInMinutes)) {
            const calculatedPace = timeInMinutes / dist;
            newInputs.pace = formatPace(calculatedPace);
            shouldUpdate = true;
          }
        }
      } else if (lockedField === 'time' && hasTime) {
        // Time is LOCKED (constant) - calculate distance or pace based on other inputs
        if (hasPace && (pace !== lastAutoCalculatedRef.current.pace || time !== lastAutoCalculatedRef.current.time)) {
          // Calculate distance from locked time + pace
          const timeInMinutes = parseTimeToMinutes(time);
          const paceInMinutes = parsePaceToMinutes(pace);
          if (timeInMinutes > 0 && paceInMinutes > 0 && !isNaN(timeInMinutes) && !isNaN(paceInMinutes)) {
            const calculatedDistance = timeInMinutes / paceInMinutes;
            newInputs.distance = calculatedDistance.toFixed(2);
            shouldUpdate = true;
          }
        } else if (hasDistance && (distance !== lastAutoCalculatedRef.current.distance || time !== lastAutoCalculatedRef.current.time)) {
          // Calculate pace from locked time + distance
          const dist = parseFloat(distance);
          const timeInMinutes = parseTimeToMinutes(time);
          if (dist > 0 && timeInMinutes > 0 && !isNaN(timeInMinutes)) {
            const calculatedPace = timeInMinutes / dist;
            newInputs.pace = formatPace(calculatedPace);
            shouldUpdate = true;
          }
        }
      } else if (lockedField === 'pace' && hasPace) {
        // Pace is LOCKED (constant) - calculate distance or time based on other inputs
        if (hasDistance && (distance !== lastAutoCalculatedRef.current.distance || pace !== lastAutoCalculatedRef.current.pace)) {
          // Calculate time from locked pace + distance
          const dist = parseFloat(distance);
          const paceInMinutes = parsePaceToMinutes(pace);
          if (dist > 0 && paceInMinutes > 0 && !isNaN(paceInMinutes)) {
            const calculatedTime = dist * paceInMinutes;
            const formattedTime = formatTime(calculatedTime);
            newInputs.time = formattedTime;
            shouldUpdate = true;
          }
        } else if (hasTime && (time !== lastAutoCalculatedRef.current.time || pace !== lastAutoCalculatedRef.current.pace)) {
          // Calculate distance from locked pace + time
          const timeInMinutes = parseTimeToMinutes(time);
          const paceInMinutes = parsePaceToMinutes(pace);
          if (timeInMinutes > 0 && paceInMinutes > 0 && !isNaN(timeInMinutes) && !isNaN(paceInMinutes)) {
            const calculatedDistance = timeInMinutes / paceInMinutes;
            newInputs.distance = calculatedDistance.toFixed(2);
            shouldUpdate = true;
          }
        }
      }

      if (shouldUpdate) {
        lastAutoCalculatedRef.current = newInputs;
        setInputs(newInputs);
      }
    } catch (error) {
      // Silently ignore auto-calculation errors
    }
  }, [inputs, lockedField, mode]);

  const updateField = (field: keyof CalculationInputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleLock = (field: LockableField) => {
    if (lockedField === field) {
      // Unlocking the current field
      setLockedField(null);
    } else {
      // Locking a new field (this automatically unlocks any other locked field)
      // Only allow locking if the field has a value
      const fieldValue = inputs[field as keyof CalculationInputs];
      if (fieldValue && fieldValue.trim() !== '') {
        setLockedField(field);
      }
    }
  };

  const canLockField = (field: keyof CalculationInputs): boolean => {
    const fieldValue = inputs[field];
    return fieldValue !== '' && fieldValue.trim() !== '';
  };

  return {
    inputs,
    lockedField,
    setInputs,
    setLockedField,
    updateField,
    toggleLock,
    canLockField,
  };
}
