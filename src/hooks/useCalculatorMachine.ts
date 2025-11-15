import { useReducer, useEffect, useRef, useCallback } from 'react';
import { parseTimeToMinutes, parsePaceToMinutes, formatTime, formatPace } from '../utils/formatters';
import type { CalculationInputs, LockableField } from '../types';

export type CalculatorMode = 'manual' | 'auto';
export type FieldName = 'distance' | 'time' | 'pace';

// Actions that can be performed
type CalculatorAction =
  | { type: 'SET_MODE'; mode: CalculatorMode }
  | { type: 'UPDATE_FIELD'; field: FieldName; value: string }
  | { type: 'TOGGLE_LOCK'; field: LockableField }
  | { type: 'CALCULATE'; targetField: FieldName }
  | { type: 'ADJUST'; field: FieldName; delta: number }
  | { type: 'SET_PRESET'; field: FieldName; value: string }
  | { type: 'CLEAR_ERROR' };

interface MachineState {
  inputs: CalculationInputs;
  lockedField: LockableField;
  error: string;
  mode: CalculatorMode;
}

interface UseCalculatorMachineReturn {
  // State
  inputs: CalculationInputs;
  lockedField: LockableField;
  error: string;
  mode: CalculatorMode;

  // Actions
  dispatch: (action: CalculatorAction) => void;

  // Computed properties
  canLockField: (field: FieldName) => boolean;
  isFieldLocked: (field: FieldName) => boolean;
  canCalculate: (field: FieldName) => boolean;
}

// Helper function to calculate a field
function calculateField(targetField: FieldName, inputs: CalculationInputs): string | null {
  try {
    if (targetField === 'distance') {
      const timeInMinutes = parseTimeToMinutes(inputs.time);
      const paceInMinutes = parsePaceToMinutes(inputs.pace);
      if (isNaN(timeInMinutes) || isNaN(paceInMinutes) || paceInMinutes === 0) return null;
      return (timeInMinutes / paceInMinutes).toFixed(2);
    } else if (targetField === 'time') {
      const dist = parseFloat(inputs.distance);
      const paceInMinutes = parsePaceToMinutes(inputs.pace);
      if (isNaN(dist) || isNaN(paceInMinutes)) return null;
      return formatTime(dist * paceInMinutes);
    } else {
      const dist = parseFloat(inputs.distance);
      const timeInMinutes = parseTimeToMinutes(inputs.time);
      if (isNaN(dist) || isNaN(timeInMinutes) || dist === 0) return null;
      return formatPace(timeInMinutes / dist);
    }
  } catch {
    return null;
  }
}

// Reducer function
function calculatorReducer(state: MachineState, action: CalculatorAction): MachineState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode, error: '' };

    case 'UPDATE_FIELD':
      // Can't edit locked field in auto mode
      if (state.mode === 'auto' && state.lockedField === action.field) {
        return state;
      }
      return {
        ...state,
        inputs: { ...state.inputs, [action.field]: action.value },
        error: '',
      };

    case 'TOGGLE_LOCK': {
      if (state.lockedField === action.field) {
        return { ...state, lockedField: null, error: '' };
      } else if (action.field) {
        // Check if field has a valid value
        const value = state.inputs[action.field];
        let isValid = false;

        if (value && value.trim() !== '') {
          if (action.field === 'distance') {
            const num = parseFloat(value);
            isValid = !isNaN(num) && num > 0;
          } else if (action.field === 'time') {
            const minutes = parseTimeToMinutes(value);
            isValid = !isNaN(minutes) && minutes > 0;
          } else if (action.field === 'pace') {
            const minutes = parsePaceToMinutes(value);
            isValid = !isNaN(minutes) && minutes > 0;
          }
        }

        if (isValid) {
          return { ...state, lockedField: action.field, error: '' };
        }
      }
      return { ...state, error: '' };
    }

    case 'CALCULATE': {
      if (state.mode !== 'manual') {
        return state;
      }

      const otherFields = (['distance', 'time', 'pace'] as FieldName[]).filter(f => f !== action.targetField);

      // Check if we have the required inputs
      const missingFields = otherFields.filter(f => !state.inputs[f] || state.inputs[f].trim() === '');
      if (missingFields.length > 0) {
        // Return error message that matches translation keys
        if (action.targetField === 'distance') {
          return { ...state, error: 'calculator.errorNeedTimePace' };
        } else if (action.targetField === 'time') {
          return { ...state, error: 'calculator.errorNeedDistancePace' };
        } else {
          return { ...state, error: 'calculator.errorNeedDistanceTime' };
        }
      }

      const calculated = calculateField(action.targetField, state.inputs);
      if (calculated === null) {
        return { ...state, error: 'calculator.errorInvalidInput' };
      }

      return {
        ...state,
        inputs: { ...state.inputs, [action.targetField]: calculated },
        error: '',
      };
    }

    case 'ADJUST': {
      // Can't adjust locked field in auto mode
      if (state.mode === 'auto' && state.lockedField === action.field) {
        return state;
      }

      const currentValue = state.inputs[action.field];
      if (!currentValue || currentValue.trim() === '') return state;

      try {
        let newInputs = { ...state.inputs };

        if (action.field === 'distance') {
          const current = parseFloat(currentValue);
          if (isNaN(current)) return state;
          const newValue = Math.max(0, current + action.delta);
          newInputs.distance = newValue.toFixed(2);
        } else if (action.field === 'time') {
          const currentMinutes = parseTimeToMinutes(currentValue);
          if (isNaN(currentMinutes)) return state;
          const newMinutes = Math.max(0, currentMinutes + action.delta / 60);
          newInputs.time = formatTime(newMinutes);
        } else if (action.field === 'pace') {
          const currentMinutes = parsePaceToMinutes(currentValue);
          if (isNaN(currentMinutes)) return state;
          const newMinutes = Math.max(0, currentMinutes + action.delta / 60);
          newInputs.pace = formatPace(newMinutes);
        }

        return { ...state, inputs: newInputs, error: '' };
      } catch {
        return state;
      }
    }

    case 'SET_PRESET':
      // Can't set preset for locked field
      if (state.lockedField === action.field) {
        return state;
      }
      return {
        ...state,
        inputs: { ...state.inputs, [action.field]: action.value },
        error: '',
      };

    case 'CLEAR_ERROR':
      return { ...state, error: '' };

    default:
      return state;
  }
}

/**
 * Calculator state machine hook
 * Manages all calculator state transitions, validations, and calculations
 * Abstracts the complexity of lock management and auto-calculation logic
 */
export function useCalculatorMachine(): UseCalculatorMachineReturn {
  const [state, dispatch] = useReducer(calculatorReducer, {
    inputs: { distance: '', time: '', pace: '' },
    lockedField: null,
    error: '',
    mode: 'manual',
  });

  const lastAutoCalculatedRef = useRef<CalculationInputs>({ distance: '', time: '', pace: '' });

  // Field validation helpers
  const hasValue = useCallback((field: FieldName): boolean => {
    const value = state.inputs[field];
    return value !== undefined && value.trim() !== '';
  }, [state.inputs]);

  const isValidNumber = useCallback((field: FieldName): boolean => {
    if (field === 'distance') {
      const num = parseFloat(state.inputs.distance);
      return !isNaN(num) && num > 0;
    } else if (field === 'time') {
      const minutes = parseTimeToMinutes(state.inputs.time);
      return !isNaN(minutes) && minutes > 0;
    } else {
      const minutes = parsePaceToMinutes(state.inputs.pace);
      return !isNaN(minutes) && minutes > 0;
    }
  }, [state.inputs]);

  const canLockField = useCallback((field: FieldName): boolean => {
    return hasValue(field) && isValidNumber(field);
  }, [hasValue, isValidNumber]);

  const isFieldLocked = useCallback((field: FieldName): boolean => {
    return state.lockedField === field;
  }, [state.lockedField]);

  const canCalculate = useCallback((field: FieldName): boolean => {
    const otherFields = (['distance', 'time', 'pace'] as FieldName[]).filter(f => f !== field);
    return otherFields.every(f => hasValue(f) && isValidNumber(f));
  }, [hasValue, isValidNumber]);

  // Auto-calculation effect (only in auto mode)
  useEffect(() => {
    if (state.mode === 'manual' || !state.lockedField) return;

    // If locked field is empty, unlock it
    if (!hasValue(state.lockedField)) {
      dispatch({ type: 'TOGGLE_LOCK', field: state.lockedField });
      return;
    }

    const { distance, time, pace } = state.inputs;
    const hasChanged =
      distance !== lastAutoCalculatedRef.current.distance ||
      time !== lastAutoCalculatedRef.current.time ||
      pace !== lastAutoCalculatedRef.current.pace;

    if (!hasChanged) return;

    // When a field is locked, calculate one of the unlocked fields
    // based on the locked field and the other unlocked field
    const allFields: FieldName[] = ['distance', 'time', 'pace'];
    const unlockedFields = allFields.filter(f => f !== state.lockedField);

    // Try to find which unlocked field to calculate
    // Calculate the field that doesn't have a user-provided value yet,
    // or the one that needs updating based on the other inputs
    for (const targetField of unlockedFields) {
      const otherUnlockedField = unlockedFields.find(f => f !== targetField);

      if (otherUnlockedField && hasValue(otherUnlockedField) && hasValue(state.lockedField)) {
        // Check if this is a new change to the other unlocked field
        if (state.inputs[otherUnlockedField] !== lastAutoCalculatedRef.current[otherUnlockedField] ||
            state.inputs[state.lockedField] !== lastAutoCalculatedRef.current[state.lockedField]) {
          const calculated = calculateField(targetField, state.inputs);
          if (calculated !== null) {
            lastAutoCalculatedRef.current = { ...state.inputs, [targetField]: calculated };
            dispatch({ type: 'UPDATE_FIELD', field: targetField, value: calculated });
            return;
          }
        }
      }
    }

    // Update ref even if no calculation was done
    lastAutoCalculatedRef.current = state.inputs;
  }, [state.inputs, state.lockedField, state.mode, hasValue]);

  return {
    inputs: state.inputs,
    lockedField: state.lockedField,
    error: state.error,
    mode: state.mode,
    dispatch,
    canLockField,
    isFieldLocked,
    canCalculate,
  };
}
