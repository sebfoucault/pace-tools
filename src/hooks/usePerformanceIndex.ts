import { useEffect, useMemo } from 'react';
import { calculatePerformanceIndex, convertDistanceToMeters } from '../utils/performanceIndex';
import { parseTimeToMinutes } from '../utils/formatters';
import type { CalculationInputs, UnitSystem } from '../types';

interface UsePerformanceIndexOptions {
  inputs: CalculationInputs;
  unitSystem: UnitSystem;
  onPerformanceIndexChange?: (pi: number | null) => void;
}

/**
 * Custom hook for calculating and notifying about performance index changes
 */
export function usePerformanceIndex({
  inputs,
  unitSystem,
  onPerformanceIndexChange,
}: UsePerformanceIndexOptions): number | null {
  const performanceIndex = useMemo(() => {
    const { distance, time } = inputs;

    if (!distance || !time || distance.trim() === '' || time.trim() === '') {
      return null;
    }

    try {
      const dist = parseFloat(distance);
      const timeInMinutes = parseTimeToMinutes(time);

      if (dist <= 0 || timeInMinutes <= 0 || isNaN(dist) || isNaN(timeInMinutes)) {
        return null;
      }

      // Convert distance to meters using utility
      const distanceInMeters = convertDistanceToMeters(dist, unitSystem === 'metric' ? 'km' : 'miles');

      // Calculate performance index using utility function
      return calculatePerformanceIndex(distanceInMeters, timeInMinutes);
    } catch (error) {
      return null;
    }
  }, [inputs, unitSystem]);

  // Notify parent of performance index changes
  useEffect(() => {
    if (onPerformanceIndexChange) {
      onPerformanceIndexChange(performanceIndex);
    }
  }, [performanceIndex, onPerformanceIndexChange]);

  return performanceIndex;
}
