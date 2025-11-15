import { renderHook, act } from '@testing-library/react';
import { useCalculatorMachine } from '../useCalculatorMachine';

describe('useCalculatorMachine', () => {
  describe('Initialization', () => {
    it('should initialize with empty inputs and manual mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      expect(result.current.inputs).toEqual({
        distance: '',
        time: '',
        pace: '',
      });
      expect(result.current.mode).toBe('manual');
      expect(result.current.lockedField).toBeNull();
      expect(result.current.error).toBe('');
    });
  });

  describe('Mode Management', () => {
    it('should switch between manual and auto modes', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'auto' });
      });

      expect(result.current.mode).toBe('auto');

      act(() => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'manual' });
      });

      expect(result.current.mode).toBe('manual');
    });

    it('should clear errors when changing mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'CALCULATE', targetField: 'distance' });
      });

      expect(result.current.error).not.toBe('');

      act(() => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'auto' });
      });

      expect(result.current.error).toBe('');
    });
  });

  describe('Field Updates', () => {
    it('should update field values', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
      });

      expect(result.current.inputs.distance).toBe('10');
    });

    it('should not update locked fields in auto mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'auto' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '20' });
      });

      expect(result.current.inputs.distance).toBe('10');
    });

    it('should allow updating locked fields in manual mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '20' });
      });

      expect(result.current.inputs.distance).toBe('20');
    });

    it('should clear errors when updating fields', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'CALCULATE', targetField: 'distance' });
      });

      expect(result.current.error).not.toBe('');

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
      });

      expect(result.current.error).toBe('');
    });
  });

  describe('Lock Management', () => {
    it('should lock a field with valid value', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
      });

      expect(result.current.lockedField).toBe('distance');
    });

    it('should unlock a locked field when toggled again', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
      });

      expect(result.current.lockedField).toBeNull();
    });

    it('should not lock field with empty value', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
      });

      expect(result.current.lockedField).toBeNull();
    });

    it('should switch lock between fields', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'time' });
      });

      expect(result.current.lockedField).toBe('time');
    });

    it('should report canLockField correctly', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      expect(result.current.canLockField('distance')).toBe(false);

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
      });

      expect(result.current.canLockField('distance')).toBe(true);
    });

    it('should report isFieldLocked correctly', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      expect(result.current.isFieldLocked('distance')).toBe(false);

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
      });

      expect(result.current.isFieldLocked('distance')).toBe(true);
      expect(result.current.isFieldLocked('time')).toBe(false);
    });
  });

  describe('Manual Calculations', () => {
    it('should calculate distance from time and pace', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'pace', value: '6:00' });
        result.current.dispatch({ type: 'CALCULATE', targetField: 'distance' });
      });

      expect(result.current.inputs.distance).toBe('5.00');
      expect(result.current.error).toBe('');
    });

    it('should calculate time from distance and pace', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'pace', value: '5:00' });
        result.current.dispatch({ type: 'CALCULATE', targetField: 'time' });
      });

      expect(result.current.inputs.time).toBe('50:00');
      expect(result.current.error).toBe('');
    });

    it('should calculate pace from distance and time', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '10' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '50:00' });
        result.current.dispatch({ type: 'CALCULATE', targetField: 'pace' });
      });

      expect(result.current.inputs.pace).toBe('5:00');
      expect(result.current.error).toBe('');
    });

    it('should show error when calculating without required inputs', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'CALCULATE', targetField: 'distance' });
      });

      expect(result.current.error).toBe('calculator.errorNeedTimePace');
    });

    it('should not calculate in auto mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'auto' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'pace', value: '6:00' });
        result.current.dispatch({ type: 'CALCULATE', targetField: 'distance' });
      });

      expect(result.current.inputs.distance).toBe('');
    });
  });

  describe('Field Adjustments', () => {
    it('should adjust time by positive delta', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'ADJUST', field: 'time', delta: 60 });
      });

      expect(result.current.inputs.time).toBe('31:00');
    });

    it('should adjust time by negative delta', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'ADJUST', field: 'time', delta: -60 });
      });

      expect(result.current.inputs.time).toBe('29:00');
    });

    it('should adjust pace by delta', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'pace', value: '5:00' });
        result.current.dispatch({ type: 'ADJUST', field: 'pace', delta: 15 });
      });

      expect(result.current.inputs.pace).toBe('5:15');
    });

    it('should not adjust locked fields in auto mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'auto' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'time' });
        result.current.dispatch({ type: 'ADJUST', field: 'time', delta: 60 });
      });

      expect(result.current.inputs.time).toBe('30:00');
    });

    it('should allow adjusting locked fields in manual mode', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'time' });
        result.current.dispatch({ type: 'ADJUST', field: 'time', delta: 60 });
      });

      expect(result.current.inputs.time).toBe('31:00');
    });

    it('should not adjust below zero', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '01:00' });
        result.current.dispatch({ type: 'ADJUST', field: 'time', delta: -120 });
      });

      expect(result.current.inputs.time).toBe('0:00');
    });
  });

  describe('Preset Values', () => {
    it('should set preset distance', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'SET_PRESET', field: 'distance', value: '10' });
      });

      expect(result.current.inputs.distance).toBe('10');
    });

    it('should not set preset for locked fields', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: '5' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'distance' });
        result.current.dispatch({ type: 'SET_PRESET', field: 'distance', value: '10' });
      });

      expect(result.current.inputs.distance).toBe('5');
    });
  });

  describe('Auto-calculation (Auto Mode)', () => {
    it('should auto-calculate unlocked field when other two are filled', async () => {
      const { result } = renderHook(() => useCalculatorMachine());

      await act(async () => {
        result.current.dispatch({ type: 'SET_MODE', mode: 'auto' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'time' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'pace', value: '6:00' });
      });

      // Should auto-calculate distance
      expect(result.current.inputs.distance).toBe('5.00');
    });

    it('should not auto-calculate in manual mode', async () => {
      const { result } = renderHook(() => useCalculatorMachine());

      await act(async () => {
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'time', value: '30:00' });
        result.current.dispatch({ type: 'TOGGLE_LOCK', field: 'time' });
        result.current.dispatch({ type: 'UPDATE_FIELD', field: 'pace', value: '6:00' });
      });

      expect(result.current.inputs.distance).toBe('');
    });
  });

  describe('Error Management', () => {
    it('should clear error on CLEAR_ERROR action', () => {
      const { result } = renderHook(() => useCalculatorMachine());

      act(() => {
        result.current.dispatch({ type: 'CALCULATE', targetField: 'distance' });
      });

      expect(result.current.error).not.toBe('');

      act(() => {
        result.current.dispatch({ type: 'CLEAR_ERROR' });
      });

      expect(result.current.error).toBe('');
    });
  });
});
