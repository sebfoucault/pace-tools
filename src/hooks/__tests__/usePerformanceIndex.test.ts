import { renderHook } from '@testing-library/react';
import { usePerformanceIndex } from '../usePerformanceIndex';
import type { CalculationInputs } from '../../types';

describe('usePerformanceIndex', () => {
  describe('initialization', () => {
    it('should return null for empty inputs', () => {
      const inputs: CalculationInputs = {
        distance: '',
        time: '',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when only distance is provided', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: '',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when only time is provided', () => {
      const inputs: CalculationInputs = {
        distance: '',
        time: '1:00:00',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });
  });

  describe('metric calculations', () => {
    it('should calculate PI for 5k in 20:00 (fast)', () => {
      const inputs: CalculationInputs = {
        distance: '5',
        time: '20:00',
        pace: '4:00',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(45); // Fast pace
      expect(result.current).toBeLessThan(55);
    });

    it('should calculate PI for 10k in 50:00 (moderate)', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: '50:00',
        pace: '5:00',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(35);
      expect(result.current).toBeLessThan(45);
    });

    it('should calculate PI for marathon (42.195 km) in 3:30:00', () => {
      const inputs: CalculationInputs = {
        distance: '42.195',
        time: '3:30:00',
        pace: '4:58',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(40);
      expect(result.current).toBeLessThan(50);
    });

    it('should calculate PI for half marathon (21.0975 km) in 1:45:00', () => {
      const inputs: CalculationInputs = {
        distance: '21.0975',
        time: '1:45:00',
        pace: '4:58',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(38);
      expect(result.current).toBeLessThan(48);
    });
  });

  describe('imperial calculations', () => {
    it('should calculate PI for 5 miles in 40:00', () => {
      const inputs: CalculationInputs = {
        distance: '5',
        time: '40:00',
        pace: '8:00',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'imperial',
        })
      );

      expect(result.current).toBeGreaterThan(35);
      expect(result.current).toBeLessThan(45);
    });

    it('should calculate PI for 10 miles in 1:20:00', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: '1:20:00',
        pace: '8:00',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'imperial',
        })
      );

      expect(result.current).toBeGreaterThan(38);
      expect(result.current).toBeLessThan(46);
    });

    it('should calculate PI for marathon (26.2188 miles) in 3:30:00', () => {
      const inputs: CalculationInputs = {
        distance: '26.2188',
        time: '3:30:00',
        pace: '8:00',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'imperial',
        })
      );

      expect(result.current).toBeGreaterThan(40);
      expect(result.current).toBeLessThan(50);
    });
  });

  describe('edge cases', () => {
    it('should return null for zero distance', () => {
      const inputs: CalculationInputs = {
        distance: '0',
        time: '1:00:00',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null for negative distance', () => {
      const inputs: CalculationInputs = {
        distance: '-5',
        time: '1:00:00',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null for zero time', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: '0:00:00',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null for invalid time format', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: 'invalid',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null for invalid distance format', () => {
      const inputs: CalculationInputs = {
        distance: 'invalid',
        time: '1:00:00',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeNull();
    });

    it('should handle whitespace in inputs', () => {
      const inputs: CalculationInputs = {
        distance: '  10  ',
        time: '  1:00:00  ',
        pace: '',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).not.toBeNull();
    });
  });

  describe('callback notifications', () => {
    it('should call onPerformanceIndexChange when PI is calculated', () => {
      const mockCallback = jest.fn();
      const inputs: CalculationInputs = {
        distance: '10',
        time: '1:00:00',
        pace: '6:00',
      };

      renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
          onPerformanceIndexChange: mockCallback,
        })
      );

      expect(mockCallback).toHaveBeenCalledWith(expect.any(Number));
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call onPerformanceIndexChange with null for invalid inputs', () => {
      const mockCallback = jest.fn();
      const inputs: CalculationInputs = {
        distance: '',
        time: '',
        pace: '',
      };

      renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
          onPerformanceIndexChange: mockCallback,
        })
      );

      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call callback again when inputs change', () => {
      const mockCallback = jest.fn();
      let inputs: CalculationInputs = {
        distance: '10',
        time: '1:00:00',
        pace: '6:00',
      };

      const { rerender } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
          onPerformanceIndexChange: mockCallback,
        })
      );

      expect(mockCallback).toHaveBeenCalledTimes(1);

      inputs = {
        distance: '5',
        time: '30:00',
        pace: '6:00',
      };

      rerender();

      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('should not call callback when callback is undefined', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: '1:00:00',
        pace: '6:00',
      };

      // Should not throw error
      expect(() => {
        renderHook(() =>
          usePerformanceIndex({
            inputs,
            unitSystem: 'metric',
          })
        );
      }).not.toThrow();
    });
  });

  describe('memoization', () => {
    it('should not recalculate if inputs have not changed', () => {
      const mockCallback = jest.fn();
      const inputs: CalculationInputs = {
        distance: '10',
        time: '1:00:00',
        pace: '6:00',
      };

      const { rerender } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
          onPerformanceIndexChange: mockCallback,
        })
      );

      const callCount = mockCallback.mock.calls.length;

      // Rerender with same inputs
      rerender();

      // Should not call callback again
      expect(mockCallback).toHaveBeenCalledTimes(callCount);
    });

    it('should recalculate when unit system changes', () => {
      const inputs: CalculationInputs = {
        distance: '10',
        time: '1:00:00',
        pace: '6:00',
      };

      const { result, rerender } = renderHook(
        ({ unitSystem }) =>
          usePerformanceIndex({
            inputs,
            unitSystem,
          }),
        { initialProps: { unitSystem: 'metric' as const } }
      );

      const metricPI = result.current;

      rerender({ unitSystem: 'imperial' as const });

      const imperialPI = result.current;

      // PI should be different because distance interpretation changes
      expect(metricPI).not.toBe(imperialPI);
    });
  });

  describe('realistic race scenarios', () => {
    it('should calculate PI for world-class 5k (13:00)', () => {
      const inputs: CalculationInputs = {
        distance: '5',
        time: '13:00',
        pace: '2:36',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(75); // Elite performance
    });

    it('should calculate PI for beginner 5k (35:00)', () => {
      const inputs: CalculationInputs = {
        distance: '5',
        time: '35:00',
        pace: '7:00',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(20);
      expect(result.current).toBeLessThan(30);
    });

    it('should calculate PI for world record marathon (2:01:09)', () => {
      const inputs: CalculationInputs = {
        distance: '42.195',
        time: '2:01:09',
        pace: '2:52',
      };

      const { result } = renderHook(() =>
        usePerformanceIndex({
          inputs,
          unitSystem: 'metric',
        })
      );

      expect(result.current).toBeGreaterThan(80); // World-class performance
    });
  });
});
