import { calculateCatchUp, isValidCatchUp } from '../catchUpCalculator';

describe('catchUpCalculator utilities', () => {
  describe('calculateCatchUp', () => {
    it('should calculate catch-up splits correctly with example values', () => {
      // Friend's pace: 6:30 min/km = 6.5 min/km → speed: 1000/6.5 = 153.85 m/min
      // Interval pace: 4:45 min/km = 4.75 min/km → speed: 1000/4.75 = 210.53 m/min
      // Distance: 4 km = 4000 m
      const partnerSpeed = 1000 / 6.5; // m/min
      const intervalSpeed = 1000 / 4.75; // m/min
      const distance = 4000; // m

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).not.toBeNull();
      expect(result!.timeOut).toBeCloseTo(2.56, 1); // ~2:34
      expect(result!.timeBack).toBeCloseTo(16.44, 1); // ~16:26
      expect(result!.distanceOut).toBeCloseTo(538.5, 1); // ~0.54 km
      expect(result!.distanceBack).toBeCloseTo(3461.5, 1); // ~3.46 km
      expect(result!.totalTime).toBeCloseTo(19.0, 1); // ~19:00
    });

    it('should calculate splits for different pace scenarios', () => {
      // Partner: 7:00 min/km, You: 5:00 min/km, Distance: 2 km
      const partnerSpeed = 1000 / 7;
      const intervalSpeed = 1000 / 5;
      const distance = 2000;

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).not.toBeNull();
      expect(result!.timeOut).toBeGreaterThan(0);
      expect(result!.timeBack).toBeGreaterThan(0);
      expect(result!.distanceOut).toBeGreaterThan(0);
      expect(result!.distanceBack).toBeGreaterThan(0);
      // Distance out + distance back should equal total distance
      expect(result!.distanceOut + result!.distanceBack).toBeCloseTo(distance, 1);
    });

    it('should return null for invalid speeds (interval speed <= partner speed)', () => {
      const partnerSpeed = 200;
      const intervalSpeed = 166; // Slower than partner
      const distance = 4000;

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).toBeNull();
    });

    it('should return null for equal speeds', () => {
      const speed = 200;
      const distance = 4000;

      const result = calculateCatchUp(speed, speed, distance);

      expect(result).toBeNull();
    });

    it('should return null for negative or zero values', () => {
      expect(calculateCatchUp(0, 200, 4000)).toBeNull();
      expect(calculateCatchUp(150, 0, 4000)).toBeNull();
      expect(calculateCatchUp(150, 200, 0)).toBeNull();
      expect(calculateCatchUp(-150, 200, 4000)).toBeNull();
      expect(calculateCatchUp(150, -200, 4000)).toBeNull();
      expect(calculateCatchUp(150, 200, -4000)).toBeNull();
    });

    it('should handle very small distances', () => {
      const partnerSpeed = 1000 / 6.5;
      const intervalSpeed = 1000 / 4.75;
      const distance = 100; // 100 meters

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).not.toBeNull();
      expect(result!.distanceOut + result!.distanceBack).toBeCloseTo(distance, 1);
    });

    it('should handle large distances', () => {
      const partnerSpeed = 1000 / 6.5;
      const intervalSpeed = 1000 / 4.75;
      const distance = 20000; // 20 km

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).not.toBeNull();
      expect(result!.distanceOut + result!.distanceBack).toBeCloseTo(distance, 1);
    });

    it('should have timeOut always less than timeBack', () => {
      // When you run opposite direction, you cover less distance and take less time
      const partnerSpeed = 1000 / 6;
      const intervalSpeed = 1000 / 5;
      const distance = 5000;

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).not.toBeNull();
      expect(result!.timeOut).toBeLessThan(result!.timeBack);
      expect(result!.distanceOut).toBeLessThan(result!.distanceBack);
    });

    it('should calculate total time correctly', () => {
      const partnerSpeed = 1000 / 6.5;
      const intervalSpeed = 1000 / 4.75;
      const distance = 4000;

      const result = calculateCatchUp(partnerSpeed, intervalSpeed, distance);

      expect(result).not.toBeNull();
      expect(result!.totalTime).toBeCloseTo(result!.timeOut + result!.timeBack, 10);
    });
  });

  describe('isValidCatchUp', () => {
    it('should return true for valid speeds', () => {
      expect(isValidCatchUp(150, 200)).toBe(true); // Interval faster
      expect(isValidCatchUp(140, 200)).toBe(true);
      expect(isValidCatchUp(100, 250)).toBe(true);
    });

    it('should return false when interval speed <= partner speed', () => {
      expect(isValidCatchUp(200, 150)).toBe(false); // Interval slower
      expect(isValidCatchUp(200, 200)).toBe(false); // Equal speeds
      expect(isValidCatchUp(250, 200)).toBe(false);
    });

    it('should return false for zero or negative speeds', () => {
      expect(isValidCatchUp(0, 200)).toBe(false);
      expect(isValidCatchUp(150, 0)).toBe(false);
      expect(isValidCatchUp(-150, 200)).toBe(false);
      expect(isValidCatchUp(150, -200)).toBe(false);
    });
  });
});
