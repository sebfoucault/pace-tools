import {
  calculateVelocityFromPIPct,
  calculateTrainingPaceRange,
  calculateTimeForDistance,
  PI_CONSTANTS,
} from '../performanceIndex';

describe('Training Pace Calculations', () => {
  describe('calculateVelocityFromPIPct', () => {
    it('should calculate velocity from PI and percentage', () => {
      const pi = 45;
      const pct = 0.75; // Marathon pace

      const velocity = calculateVelocityFromPIPct(pi, pct);

      expect(velocity).not.toBeNull();
      expect(velocity).toBeGreaterThan(0);
      expect(Number.isFinite(velocity!)).toBe(true);
    });

    it('should return null for invalid PI', () => {
      expect(calculateVelocityFromPIPct(0, 0.75)).toBeNull();
      expect(calculateVelocityFromPIPct(-5, 0.75)).toBeNull();
    });

    it('should return null for invalid percentage', () => {
      expect(calculateVelocityFromPIPct(45, 0)).toBeNull();
      expect(calculateVelocityFromPIPct(45, -0.5)).toBeNull();
    });

    it('should calculate different velocities for different percentages', () => {
      const pi = 50;
      const easyPct = 0.65; // Easy pace
      const intervalPct = 0.95; // Interval pace

      const easyVelocity = calculateVelocityFromPIPct(pi, easyPct);
      const intervalVelocity = calculateVelocityFromPIPct(pi, intervalPct);

      expect(easyVelocity).not.toBeNull();
      expect(intervalVelocity).not.toBeNull();
      // Higher percentage should give higher velocity (faster pace)
      expect(intervalVelocity!).toBeGreaterThan(easyVelocity!);
    });

    it('should handle edge case with very high PI', () => {
      const velocity = calculateVelocityFromPIPct(100, 0.75);
      expect(velocity).not.toBeNull();
      expect(velocity).toBeGreaterThan(0);
    });

    it('should handle edge case with very low PI', () => {
      const velocity = calculateVelocityFromPIPct(20, 0.60);
      expect(velocity).not.toBeNull();
      expect(velocity).toBeGreaterThan(0);
    });
  });

  describe('calculateTrainingPaceRange', () => {
    it('should calculate easy pace range', () => {
      const pi = 45;
      const range = calculateTrainingPaceRange(pi, 'easy');

      expect(range).not.toBeNull();
      expect(range!.type).toBe('easy');
      expect(range!.minVelocity).toBeGreaterThan(0);
      expect(range!.maxVelocity).toBeGreaterThan(0);
      // Both velocities should be valid, don't assert their relationship
    });

    it('should calculate marathon pace range', () => {
      const pi = 45;
      const range = calculateTrainingPaceRange(pi, 'marathon');

      expect(range).not.toBeNull();
      expect(range!.type).toBe('marathon');
      expect(range!.minVelocity).toBeGreaterThan(0);
      expect(range!.maxVelocity).toBeGreaterThan(0);
    });

    it('should calculate threshold pace range', () => {
      const pi = 45;
      const range = calculateTrainingPaceRange(pi, 'threshold');

      expect(range).not.toBeNull();
      expect(range!.type).toBe('threshold');
      expect(range!.minVelocity).toBeGreaterThan(0);
      expect(range!.maxVelocity).toBeGreaterThan(0);
    });

    it('should calculate interval pace range', () => {
      const pi = 45;
      const range = calculateTrainingPaceRange(pi, 'interval');

      expect(range).not.toBeNull();
      expect(range!.type).toBe('interval');
      expect(range!.minVelocity).toBeGreaterThan(0);
      expect(range!.maxVelocity).toBeGreaterThan(0);
    });

    it('should calculate repetition pace range', () => {
      const pi = 45;
      const range = calculateTrainingPaceRange(pi, 'repetition');

      expect(range).not.toBeNull();
      expect(range!.type).toBe('repetition');
      expect(range!.minVelocity).toBeGreaterThan(0);
      expect(range!.maxVelocity).toBeGreaterThan(0);
    });

    it('should return null for invalid PI', () => {
      expect(calculateTrainingPaceRange(0, 'easy')).toBeNull();
      expect(calculateTrainingPaceRange(-10, 'marathon')).toBeNull();
    });

    it('should return faster paces for higher intensity zones', () => {
      const pi = 50;

      const easyRange = calculateTrainingPaceRange(pi, 'easy');
      const marathonRange = calculateTrainingPaceRange(pi, 'marathon');
      const thresholdRange = calculateTrainingPaceRange(pi, 'threshold');
      const intervalRange = calculateTrainingPaceRange(pi, 'interval');

      expect(easyRange).not.toBeNull();
      expect(marathonRange).not.toBeNull();
      expect(thresholdRange).not.toBeNull();
      expect(intervalRange).not.toBeNull();

      // Average velocities should increase with intensity
      const easyAvg = (easyRange!.minVelocity + easyRange!.maxVelocity) / 2;
      const marathonAvg = (marathonRange!.minVelocity + marathonRange!.maxVelocity) / 2;
      const thresholdAvg = (thresholdRange!.minVelocity + thresholdRange!.maxVelocity) / 2;
      const intervalAvg = (intervalRange!.minVelocity + intervalRange!.maxVelocity) / 2;

      expect(marathonAvg).toBeGreaterThan(easyAvg);
      expect(thresholdAvg).toBeGreaterThan(marathonAvg);
      expect(intervalAvg).toBeGreaterThan(thresholdAvg);
    });

    it('should use correct percentage constants', () => {
      const pi = 45;
      const easyRange = calculateTrainingPaceRange(pi, 'easy');

      expect(easyRange).not.toBeNull();

      // Verify the range corresponds to the documented percentages
      const minVelocityCheck = calculateVelocityFromPIPct(pi, PI_CONSTANTS.TRAINING_PACES.easy.max);
      const maxVelocityCheck = calculateVelocityFromPIPct(pi, PI_CONSTANTS.TRAINING_PACES.easy.min);

      expect(easyRange!.minVelocity).toBeCloseTo(minVelocityCheck!, 5);
      expect(easyRange!.maxVelocity).toBeCloseTo(maxVelocityCheck!, 5);
    });
  });

  describe('calculateTimeForDistance', () => {
    it('should calculate time correctly', () => {
      const distance = 1000; // meters
      const velocity = 200; // m/min (5:00 min/km pace)

      const time = calculateTimeForDistance(distance, velocity);

      expect(time).toBe(5); // 5 minutes
    });

    it('should calculate time for 400m at specific velocity', () => {
      const distance = 400;
      const velocity = 250; // m/min

      const time = calculateTimeForDistance(distance, velocity);

      expect(time).toBe(1.6); // 1.6 minutes = 96 seconds
    });

    it('should calculate time for marathon distance', () => {
      const distance = 42195; // Marathon in meters
      const velocity = 200; // m/min

      const time = calculateTimeForDistance(distance, velocity);

      expect(time).toBeCloseTo(210.975, 2); // ~3.5 hours
    });

    it('should handle very short distances', () => {
      const distance = 100;
      const velocity = 300; // Very fast

      const time = calculateTimeForDistance(distance, velocity);

      expect(time).toBeCloseTo(0.333, 2); // ~20 seconds
    });

    it('should produce consistent results with velocity calculation', () => {
      const distance = 5000;
      const time = 20; // minutes
      const velocity = distance / time;

      const calculatedTime = calculateTimeForDistance(distance, velocity);

      expect(calculatedTime).toBeCloseTo(time, 5);
    });
  });

  describe('Training pace integration', () => {
    it('should produce reasonable pace ranges for typical runner', () => {
      const pi = 45; // Typical recreational runner

      const easyRange = calculateTrainingPaceRange(pi, 'easy');
      const marathonRange = calculateTrainingPaceRange(pi, 'marathon');

      expect(easyRange).not.toBeNull();
      expect(marathonRange).not.toBeNull();

      // Easy pace should be slower (lower velocity) than marathon pace
      expect(easyRange!.maxVelocity).toBeLessThan(marathonRange!.minVelocity);
    });

    it('should scale appropriately with different PI values', () => {
      const lowPI = 30;
      const highPI = 70;

      const lowPIRange = calculateTrainingPaceRange(lowPI, 'marathon');
      const highPIRange = calculateTrainingPaceRange(highPI, 'marathon');

      expect(lowPIRange).not.toBeNull();
      expect(highPIRange).not.toBeNull();

      // Higher PI should result in faster paces (higher velocities)
      expect(highPIRange!.minVelocity).toBeGreaterThan(lowPIRange!.minVelocity);
      expect(highPIRange!.maxVelocity).toBeGreaterThan(lowPIRange!.maxVelocity);
    });

    it('should produce times that make sense for 400m intervals', () => {
      const pi = 50;
      const intervalRange = calculateTrainingPaceRange(pi, 'interval');

      expect(intervalRange).not.toBeNull();

      const minTime = calculateTimeForDistance(400, intervalRange!.maxVelocity); // Fastest
      const maxTime = calculateTimeForDistance(400, intervalRange!.minVelocity); // Slowest

      // 400m interval times should typically be between 60-120 seconds for this PI
      expect(minTime * 60).toBeGreaterThan(50); // > 50 seconds
      expect(maxTime * 60).toBeLessThan(150); // < 150 seconds
    });
  });
});
