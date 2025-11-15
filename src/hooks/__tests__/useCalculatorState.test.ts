import { renderHook, act } from '@testing-library/react';
import { useCalculatorState } from '../useCalculatorState';

describe('useCalculatorState', () => {
  describe('initialization', () => {
    it('should initialize with empty inputs', () => {
      const { result } = renderHook(() => useCalculatorState());

      expect(result.current.inputs.distance).toBe('');
      expect(result.current.inputs.time).toBe('');
      expect(result.current.inputs.pace).toBe('');
    });

    it('should initialize with no locked field', () => {
      const { result } = renderHook(() => useCalculatorState());

      expect(result.current.lockedField).toBeNull();
    });
  });

  describe('updateField', () => {
    it('should update distance field', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '10');
      });

      expect(result.current.inputs.distance).toBe('10');
      expect(result.current.inputs.time).toBe('');
      expect(result.current.inputs.pace).toBe('');
    });

    it('should update time field', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('time', '1:30:00');
      });

      expect(result.current.inputs.time).toBe('1:30:00');
      expect(result.current.inputs.distance).toBe('');
      expect(result.current.inputs.pace).toBe('');
    });

    it('should update pace field', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('pace', '5:30');
      });

      expect(result.current.inputs.pace).toBe('5:30');
      expect(result.current.inputs.distance).toBe('');
      expect(result.current.inputs.time).toBe('');
    });

    it('should update multiple fields independently', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '10');
        result.current.updateField('time', '1:00:00');
        result.current.updateField('pace', '6:00');
      });

      expect(result.current.inputs.distance).toBe('10');
      expect(result.current.inputs.time).toBe('1:00:00');
      expect(result.current.inputs.pace).toBe('6:00');
    });
  });

  describe('canLockField', () => {
    it('should return false for empty fields', () => {
      const { result } = renderHook(() => useCalculatorState());

      expect(result.current.canLockField('distance')).toBe(false);
      expect(result.current.canLockField('time')).toBe(false);
      expect(result.current.canLockField('pace')).toBe(false);
    });

    it('should return true for non-empty fields', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '10');
        result.current.updateField('time', '1:00:00');
        result.current.updateField('pace', '6:00');
      });

      expect(result.current.canLockField('distance')).toBe(true);
      expect(result.current.canLockField('time')).toBe(true);
      expect(result.current.canLockField('pace')).toBe(true);
    });

    it('should return false for whitespace-only fields', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '   ');
        result.current.updateField('time', '  ');
      });

      expect(result.current.canLockField('distance')).toBe(false);
      expect(result.current.canLockField('time')).toBe(false);
    });
  });

  describe('toggleLock', () => {
    it('should lock a field with a value', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '10');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      expect(result.current.lockedField).toBe('distance');
    });

    it('should not lock a field without a value', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.toggleLock('distance');
      });

      expect(result.current.lockedField).toBeNull();
    });

    it('should unlock a locked field', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '10');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      expect(result.current.lockedField).toBe('distance');

      act(() => {
        result.current.toggleLock('distance');
      });

      expect(result.current.lockedField).toBeNull();
    });

    it('should switch lock from one field to another', () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '10');
        result.current.updateField('time', '1:00:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      expect(result.current.lockedField).toBe('distance');

      act(() => {
        result.current.toggleLock('time');
      });

      expect(result.current.lockedField).toBe('time');
    });
  });

  describe('auto-calculation', () => {
    describe('when distance is locked', () => {
      it('should calculate time when pace is entered', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
        });

        act(() => {
          result.current.toggleLock('distance');
        });

        act(() => {
          result.current.updateField('pace', '6:00');
        });

        // Wait for auto-calculation effect
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.time).toBe('1:00:00');
      });

      it('should calculate pace when time is entered', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
        });

        act(() => {
          result.current.toggleLock('distance');
        });

        act(() => {
          result.current.updateField('time', '1:00:00');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.pace).toBe('6:00');
      });
    });

    describe('when time is locked', () => {
      it('should calculate distance when pace is entered', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('time', '1:00:00');
          });

      act(() => {
        result.current.toggleLock('time');
        });

        act(() => {
          result.current.updateField('pace', '6:00');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.distance).toBe('10.00');
      });

      it('should calculate pace when distance is entered', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('time', '1:00:00');
          });

      act(() => {
        result.current.toggleLock('time');
        });

        act(() => {
          result.current.updateField('distance', '10');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.pace).toBe('6:00');
      });
    });

    describe('when pace is locked', () => {
      it('should calculate time when distance is entered', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('pace', '6:00');
          });

      act(() => {
        result.current.toggleLock('pace');
        });

        act(() => {
          result.current.updateField('distance', '10');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.time).toBe('1:00:00');
      });

      it('should calculate distance when time is entered', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('pace', '6:00');
          });

      act(() => {
        result.current.toggleLock('pace');
        });

        act(() => {
          result.current.updateField('time', '1:00:00');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.distance).toBe('10.00');
      });
    });

    describe('edge cases', () => {
      it('should unlock field when it becomes empty', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
          });

      act(() => {
        result.current.toggleLock('distance');
        });

        expect(result.current.lockedField).toBe('distance');

        act(() => {
          result.current.updateField('distance', '');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.lockedField).toBeNull();
      });

      it('should handle invalid pace input gracefully', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
          });

      act(() => {
        result.current.toggleLock('distance');
        });

        act(() => {
          result.current.updateField('pace', 'invalid');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Should not crash or update time with invalid value
        expect(result.current.inputs.time).toBe('');
      });

      it('should handle invalid time input gracefully', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
          });

      act(() => {
        result.current.toggleLock('distance');
        });

        act(() => {
          result.current.updateField('time', 'invalid');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Should not crash or update pace with invalid value
        expect(result.current.inputs.pace).toBe('');
      });

      it('should not calculate when no field is locked', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
          result.current.updateField('pace', '6:00');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Time should remain empty since no auto-calculation happens
        expect(result.current.inputs.time).toBe('');
      });
    });

    describe('recalculation on change', () => {
      it('should recalculate when locked field changes', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
          result.current.updateField('pace', '6:00');
        });

        act(() => {
          result.current.toggleLock('distance');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.time).toBe('1:00:00');

        // Change the locked distance
        act(() => {
          result.current.updateField('distance', '5');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.time).toBe('30:00');
      });

      it('should recalculate when unlocked field changes', async () => {
        const { result } = renderHook(() => useCalculatorState());

        act(() => {
          result.current.updateField('distance', '10');
          result.current.updateField('pace', '6:00');
        });

        act(() => {
          result.current.toggleLock('distance');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.time).toBe('1:00:00');

        // Change the pace (unlocked)
        act(() => {
          result.current.updateField('pace', '5:00');
        });

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.inputs.time).toBe('50:00');
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle marathon calculation (42.195 km at 5:00/km pace)', async () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '42.195');
        result.current.updateField('pace', '5:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.inputs.time).toBe('3:30:58');
    });

    it('should handle 5k calculation (5 km in 25:00)', async () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '5');
        result.current.updateField('time', '25:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.inputs.pace).toBe('5:00');
    });

    it('should handle switching between locked fields', async () => {
      const { result } = renderHook(() => useCalculatorState());

      // Lock distance, calculate time
      act(() => {
        result.current.updateField('distance', '10');
        result.current.updateField('pace', '6:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.inputs.time).toBe('1:00:00');

      // Switch to lock time, modify distance
      act(() => {
        result.current.toggleLock('time');
      });

      act(() => {
        result.current.updateField('distance', '5');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Pace should recalculate (60 minutes / 5 km = 12:00/km)
      expect(result.current.inputs.pace).toBe('12:00');
    });
  });

  describe('calculator mode', () => {
    it('should disable auto-calculation in manual mode when distance is locked', async () => {
      const { result } = renderHook(() => useCalculatorState({ mode: 'manual' }));

      act(() => {
        result.current.updateField('distance', '10');
      });

      act(() => {
        result.current.updateField('pace', '5:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // In manual mode, time should NOT be auto-calculated
      expect(result.current.inputs.time).toBe('');
    });

    it('should disable auto-calculation in manual mode when time is locked', async () => {
      const { result } = renderHook(() => useCalculatorState({ mode: 'manual' }));

      act(() => {
        result.current.updateField('time', '50:00');
      });

      act(() => {
        result.current.updateField('pace', '5:00');
      });

      act(() => {
        result.current.toggleLock('time');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // In manual mode, distance should NOT be auto-calculated
      expect(result.current.inputs.distance).toBe('');
    });

    it('should disable auto-calculation in manual mode when pace is locked', async () => {
      const { result } = renderHook(() => useCalculatorState({ mode: 'manual' }));

      act(() => {
        result.current.updateField('distance', '10');
      });

      act(() => {
        result.current.updateField('time', '50:00');
      });

      act(() => {
        result.current.updateField('pace', '5:00');
      });

      act(() => {
        result.current.toggleLock('pace');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // In manual mode, locking should work but auto-calculation should not trigger
      expect(result.current.lockedField).toBe('pace');
      // The pace value should remain as we set it
      expect(result.current.inputs.pace).toBe('5:00');
    });

    it('should enable auto-calculation in auto mode (default behavior)', async () => {
      const { result } = renderHook(() => useCalculatorState({ mode: 'auto' }));

      act(() => {
        result.current.updateField('distance', '10');
      });

      act(() => {
        result.current.updateField('pace', '5:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // In auto mode, time SHOULD be auto-calculated (10 km * 5:00/km = 50:00)
      expect(result.current.inputs.time).toBe('50:00');
    });

    it('should use auto mode as default when no mode is specified', async () => {
      const { result } = renderHook(() => useCalculatorState());

      act(() => {
        result.current.updateField('distance', '5');
      });

      act(() => {
        result.current.updateField('pace', '6:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Default should be auto mode, so time should be calculated (5 km * 6:00/km = 30:00)
      expect(result.current.inputs.time).toBe('30:00');
    });

    it('should allow switching from manual to auto mode', async () => {
      type TestMode = 'manual' | 'auto';
      const { result, rerender } = renderHook(
        ({ mode }: { mode: TestMode }) => useCalculatorState({ mode }),
        { initialProps: { mode: 'manual' as TestMode } }
      );

      act(() => {
        result.current.updateField('distance', '10');
      });

      act(() => {
        result.current.updateField('pace', '5:00');
      });

      act(() => {
        result.current.toggleLock('distance');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // In manual mode, no calculation
      expect(result.current.inputs.time).toBe('');

      // Switch to auto mode
      rerender({ mode: 'auto' as TestMode });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Now auto-calculation should kick in
      expect(result.current.inputs.time).toBe('50:00');
    });
  });
});
