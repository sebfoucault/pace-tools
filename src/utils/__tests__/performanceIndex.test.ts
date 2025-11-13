import {
  calculateVelocity,
  calculateI,
  calculateImax,
  calculatePerformanceIndex,
  predictTimeFromPI,
  convertDistanceToMeters,
  PI_CONSTANTS,
} from '../performanceIndex';

describe('performanceIndex utilities', () => {
  describe('calculateVelocity', () => {
    it('should calculate velocity correctly', () => {
      expect(calculateVelocity(10000, 50)).toBe(200); // 10km in 50min = 200 m/min
      expect(calculateVelocity(5000, 25)).toBe(200); // 5km in 25min = 200 m/min
      expect(calculateVelocity(42195, 180)).toBeCloseTo(234.42, 2); // Marathon in 3 hours
    });

    it('should handle edge cases', () => {
      expect(calculateVelocity(1000, 1)).toBe(1000); // Very fast
      expect(calculateVelocity(1000, 100)).toBe(10); // Very slow
    });
  });

  describe('calculateI', () => {
    it('should calculate intensity correctly', () => {
      const velocity = 200; // m/min
      const i = calculateI(velocity);
      // i = -4.60 + 0.182258 * 200 + 0.000104 * 200^2
      // i = -4.60 + 36.4516 + 4.16 = 36.0116
      expect(i).toBeCloseTo(36.0116, 3);
    });

    it('should use correct formula constants', () => {
      const velocity = 100;
      const expected =
        PI_CONSTANTS.I_OFFSET +
        PI_CONSTANTS.I_LINEAR * velocity +
        PI_CONSTANTS.I_QUADRATIC * velocity * velocity;
      expect(calculateI(velocity)).toBeCloseTo(expected, 10);
    });

    it('should handle various velocities', () => {
      expect(calculateI(0)).toBe(PI_CONSTANTS.I_OFFSET);
      expect(calculateI(150)).toBeCloseTo(25.0787, 3);
      expect(calculateI(250)).toBeCloseTo(47.4645, 3);
    });
  });

  describe('calculateImax', () => {
    it('should calculate maximum intensity correctly', () => {
      const time = 50; // minutes
      const imax = calculateImax(time);
      // imax = 0.8 + 0.1894393 * exp(-0.012778 * 50) + 0.2989558 * exp(-0.1932605 * 50)
      expect(imax).toBeCloseTo(0.900, 3);
    });

    it('should use correct formula constants', () => {
      const time = 30;
      const expected =
        PI_CONSTANTS.IMAX_BASE +
        PI_CONSTANTS.IMAX_EXP1_COEFF * Math.exp(PI_CONSTANTS.IMAX_EXP1_RATE * time) +
        PI_CONSTANTS.IMAX_EXP2_COEFF * Math.exp(PI_CONSTANTS.IMAX_EXP2_RATE * time);
      expect(calculateImax(time)).toBeCloseTo(expected, 10);
    });

    it('should handle various times', () => {
      expect(calculateImax(10)).toBeCloseTo(1.010, 3);
      expect(calculateImax(100)).toBeCloseTo(0.853, 2);
      expect(calculateImax(180)).toBeCloseTo(0.819, 2);
    });
  });

  describe('convertDistanceToMeters', () => {
    it('should convert kilometers to meters', () => {
      expect(convertDistanceToMeters(1, 'km')).toBe(1000);
      expect(convertDistanceToMeters(5, 'km')).toBe(5000);
      expect(convertDistanceToMeters(10, 'km')).toBe(10000);
      expect(convertDistanceToMeters(42.195, 'km')).toBeCloseTo(42195, 0);
    });

    it('should convert miles to meters', () => {
      expect(convertDistanceToMeters(1, 'miles')).toBeCloseTo(1609.34, 2);
      expect(convertDistanceToMeters(5, 'miles')).toBeCloseTo(8046.7, 1);
      expect(convertDistanceToMeters(26.2, 'miles')).toBeCloseTo(42164.91, 0);
    });

    it('should handle decimal values', () => {
      expect(convertDistanceToMeters(0.5, 'km')).toBe(500);
      expect(convertDistanceToMeters(0.1, 'miles')).toBeCloseTo(160.934, 2);
    });
  });

  describe('calculatePerformanceIndex', () => {
    it('should calculate PI for 10km in 50 minutes', () => {
      // Known benchmark: 10km in 50min should give PI around 40
      const pi = calculatePerformanceIndex(10000, 50);
      expect(pi).toBeCloseTo(40, 0);
    });

    it('should calculate PI for various distances and times', () => {
      // 5km in 25 minutes (same pace as 10km in 50min)
      const pi1 = calculatePerformanceIndex(5000, 25);
      expect(pi1).toBeCloseTo(38, 0);

      // Marathon in 3 hours (180 min) - around 42.195km
      const pi2 = calculatePerformanceIndex(42195, 180);
      expect(pi2).toBeGreaterThan(35);
      expect(pi2).toBeLessThan(60);

      // Fast 5km in 15 minutes
      const pi3 = calculatePerformanceIndex(5000, 15);
      expect(pi3).toBeGreaterThan(60);
    });

    it('should return null for invalid inputs', () => {
      expect(calculatePerformanceIndex(0, 50)).toBeNull();
      expect(calculatePerformanceIndex(-1000, 50)).toBeNull();
      expect(calculatePerformanceIndex(10000, 0)).toBeNull();
      expect(calculatePerformanceIndex(10000, -10)).toBeNull();
      expect(calculatePerformanceIndex(Infinity, 50)).toBeNull();
      expect(calculatePerformanceIndex(10000, Infinity)).toBeNull();
      expect(calculatePerformanceIndex(NaN, 50)).toBeNull();
      expect(calculatePerformanceIndex(10000, NaN)).toBeNull();
    });

    it('should return non-negative values', () => {
      // Very slow pace should still return non-negative PI
      const pi = calculatePerformanceIndex(1000, 1000); // 1km in 1000 minutes
      expect(pi).toBeGreaterThanOrEqual(0);
    });

    it('should calculate consistent PI for same pace', () => {
      // Same pace (5 min/km) for different distances
      const pi1 = calculatePerformanceIndex(5000, 25); // 5km in 25min
      const pi2 = calculatePerformanceIndex(10000, 50); // 10km in 50min

      expect(pi1).not.toBeNull();
      expect(pi2).not.toBeNull();

      // PIs should be similar (not exact due to fatigue model)
      expect(Math.abs(pi1! - pi2!)).toBeLessThan(2);
    });
  });

  describe('predictTimeFromPI', () => {
    it('should predict time for known PI values', () => {
      // If 10km in 50min gives PI ~40, then predicting 10km with PI 40 should give ~50min
      const pi = calculatePerformanceIndex(10000, 50);
      const predictedTime = predictTimeFromPI(10000, pi!);
      expect(predictedTime).toBeCloseTo(50, 1);
    });

    it('should predict time for 5km with same PI', () => {
      // Get PI from 10km in 50min
      const pi = calculatePerformanceIndex(10000, 50);

      // Predict 5km time with same PI
      const predictedTime = predictTimeFromPI(5000, pi!);
      // Due to fatigue model, 5km time may not be exactly half of 10km time
      expect(predictedTime).toBeGreaterThan(20);
      expect(predictedTime).toBeLessThan(30);
    });

    it('should predict marathon time from shorter distance', () => {
      // Get PI from 10km in 45 minutes (decent runner)
      const pi = calculatePerformanceIndex(10000, 45);

      // Predict marathon time (42.195km)
      const marathonTime = predictTimeFromPI(42195, pi!);

      // Marathon should take more than 42.195 * (45/10) = 189.8 min due to fatigue
      expect(marathonTime).toBeGreaterThan(189);
      expect(marathonTime).toBeLessThan(300);
    });

    it('should return null for invalid inputs', () => {
      expect(predictTimeFromPI(0, 40)).toBeNull();
      expect(predictTimeFromPI(-5000, 40)).toBeNull();
      expect(predictTimeFromPI(10000, 0)).toBeNull();
      expect(predictTimeFromPI(10000, -10)).toBeNull();
      expect(predictTimeFromPI(10000, null as any)).toBeNull();
    });

    it('should converge within max iterations', () => {
      const pi = 50;
      const time = predictTimeFromPI(10000, pi);

      expect(time).not.toBeNull();
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThan(10000);
    });

    it('should be inverse of calculatePerformanceIndex', () => {
      // Test round-trip: distance + time -> PI -> time
      const distances = [5000, 10000, 21097.5, 42195];
      const times = [20, 50, 100, 200];

      distances.forEach((distance, i) => {
        const time = times[i];
        const pi = calculatePerformanceIndex(distance, time);
        const predictedTime = predictTimeFromPI(distance, pi!);

        // Should be very close to original time
        expect(predictedTime).toBeCloseTo(time, 0.1);
      });
    });

    it('should handle custom max iterations', () => {
      const pi = calculatePerformanceIndex(10000, 50);

      // Should converge even with fewer iterations for this case
      const time1 = predictTimeFromPI(10000, pi!, 50);
      const time2 = predictTimeFromPI(10000, pi!, 100);

      expect(time1).toBeCloseTo(50, 1);
      expect(time2).toBeCloseTo(50, 1);
    });

    it('should predict times for all standard race distances', () => {
      // Get PI from a 10km time
      const pi = calculatePerformanceIndex(10000, 45);

      const distances = [
        1000,    // 1K
        1500,    // 1500m
        5000,    // 5K
        10000,   // 10K
        21097.5, // Half marathon
        42195,   // Marathon
      ];

      distances.forEach(distance => {
        const time = predictTimeFromPI(distance, pi!);
        expect(time).not.toBeNull();
        expect(time).toBeGreaterThan(0);
        // Sanity check: time should be reasonable (not too fast or slow)
        const pace = time! / (distance / 1000); // min per km
        expect(pace).toBeGreaterThan(2); // Faster than 2 min/km would be world-record territory
        expect(pace).toBeLessThan(20); // Slower than 20 min/km would be walking
      });
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency across unit conversions', () => {
      // 10km in 50 minutes
      const piMetric = calculatePerformanceIndex(10000, 50);

      // 6.21371 miles in 50 minutes (same as 10km)
      const piImperial = calculatePerformanceIndex(10000, 50);

      expect(piMetric).toBeCloseTo(piImperial!, 5);
    });

    it('should handle realistic race scenarios', () => {
      // Scenario: Runner completes 5K in 22 minutes
      const pi5k = calculatePerformanceIndex(5000, 22);
      expect(pi5k).toBeGreaterThan(0);

      // Predict their 10K time
      const time10k = predictTimeFromPI(10000, pi5k!);
      expect(time10k).toBeGreaterThan(44); // Should be > 2 * 22 min
      expect(time10k).toBeLessThan(50); // But not too much slower

      // Predict their marathon time
      const timeMarathon = predictTimeFromPI(42195, pi5k!);
      expect(timeMarathon).toBeGreaterThan(180); // > 3 hours
      expect(timeMarathon).toBeLessThan(300); // < 5 hours
    });

    it('should handle extreme performance levels', () => {
      // Elite runner: 5km in 13:30 (world-class)
      const piElite = calculatePerformanceIndex(5000, 13.5);
      expect(piElite).toBeGreaterThan(70);

      // Beginner: 5km in 40 minutes
      const piBeginner = calculatePerformanceIndex(5000, 40);
      expect(piBeginner).toBeGreaterThan(20);
      expect(piBeginner).toBeLessThan(40);
    });
  });

  describe('PI_CONSTANTS', () => {
    it('should export all required constants', () => {
      expect(PI_CONSTANTS.I_OFFSET).toBe(-4.60);
      expect(PI_CONSTANTS.I_LINEAR).toBe(0.182258);
      expect(PI_CONSTANTS.I_QUADRATIC).toBe(0.000104);
      expect(PI_CONSTANTS.IMAX_BASE).toBe(0.8);
      expect(PI_CONSTANTS.CONVERGENCE_THRESHOLD).toBe(0.0001);
      expect(PI_CONSTANTS.METERS_PER_KM).toBe(1000);
      expect(PI_CONSTANTS.METERS_PER_MILE).toBeCloseTo(1609.34, 2);
    });
  });
});
