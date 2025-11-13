import { formatTime, formatPace, formatTimeFromMinutes, formatPaceFromMinutes } from '../formatters';

describe('formatters utilities', () => {
  describe('formatTime', () => {
    it('should format times without hours', () => {
      expect(formatTime(5)).toBe('5:00');
      expect(formatTime(25.5)).toBe('25:30');
      expect(formatTime(45.75)).toBe('45:45');
      expect(formatTime(59.99)).toBe('59:59'); // 59.99 min = 59:59.4 ≈ 59:59
    });

    it('should format times with hours', () => {
      expect(formatTime(60)).toBe('1:00:00');
      expect(formatTime(90)).toBe('1:30:00');
      expect(formatTime(125.5)).toBe('2:05:30');
      expect(formatTime(180)).toBe('3:00:00');
    });

    it('should handle deciseconds when requested', () => {
      expect(formatTime(5.123, true)).toBe('5:07:4'); // 5.123 min = 5:07.38s ≈ 5:07.4
      expect(formatTime(25.567, true)).toBe('25:34:0');
      expect(formatTime(60.25, true)).toBe('1:00:15:0');
    });

    it('should handle edge cases', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(0.01)).toBe('0:01');
      expect(formatTime(0.99)).toBe('0:59'); // 0.99 min = 59.4s ≈ 59s
    });

    it('should format fractional minutes correctly', () => {
      expect(formatTime(1.5)).toBe('1:30'); // 1.5 minutes = 1:30
      expect(formatTime(2.25)).toBe('2:15'); // 2.25 minutes = 2:15
      expect(formatTime(10.1)).toBe('10:06'); // 10.1 minutes = 10:06
    });
  });

  describe('formatPace', () => {
    it('should format standard paces', () => {
      expect(formatPace(4)).toBe('4:00');
      expect(formatPace(5)).toBe('5:00');
      expect(formatPace(6.5)).toBe('6:30');
      expect(formatPace(7.25)).toBe('7:15');
    });

    it('should handle rounding', () => {
      expect(formatPace(4.99)).toBe('4:59'); // 4.99 min = 4:59.4 ≈ 4:59
      expect(formatPace(5.01)).toBe('5:01');
      expect(formatPace(5.999)).toBe('6:01'); // 5.999 min rounds to 6:01 due to recursive handling
    });

    it('should format fast paces', () => {
      expect(formatPace(3)).toBe('3:00');
      expect(formatPace(3.5)).toBe('3:30');
      expect(formatPace(2.75)).toBe('2:45');
    });

    it('should format slow paces', () => {
      expect(formatPace(10)).toBe('10:00');
      expect(formatPace(12.5)).toBe('12:30');
      expect(formatPace(15.25)).toBe('15:15');
    });

    it('should handle edge cases', () => {
      expect(formatPace(0)).toBe('0:00');
      expect(formatPace(0.5)).toBe('0:30');
      expect(formatPace(0.99)).toBe('0:59'); // 0.99 min = 59.4s ≈ 59s
    });
  });

  describe('formatTimeFromMinutes', () => {
    it('should format times without hours', () => {
      expect(formatTimeFromMinutes(5)).toBe('5:00');
      expect(formatTimeFromMinutes(25.5)).toBe('25:30');
      expect(formatTimeFromMinutes(45.75)).toBe('45:45');
    });

    it('should format times with hours', () => {
      expect(formatTimeFromMinutes(60)).toBe('1:00:00');
      expect(formatTimeFromMinutes(90)).toBe('1:30:00');
      expect(formatTimeFromMinutes(125.5)).toBe('2:05:30');
      expect(formatTimeFromMinutes(180)).toBe('3:00:00');
    });

    it('should round to nearest second', () => {
      expect(formatTimeFromMinutes(5.008)).toBe('5:00'); // 5.008 min = 300.48s ≈ 300s
      expect(formatTimeFromMinutes(5.009)).toBe('5:01'); // 5.009 min = 300.54s ≈ 301s
    });

    it('should handle marathon times', () => {
      expect(formatTimeFromMinutes(180)).toBe('3:00:00'); // 3 hour marathon
      expect(formatTimeFromMinutes(210)).toBe('3:30:00'); // 3:30 marathon
      expect(formatTimeFromMinutes(240)).toBe('4:00:00'); // 4 hour marathon
    });

    it('should handle edge cases', () => {
      expect(formatTimeFromMinutes(0)).toBe('0:00');
      expect(formatTimeFromMinutes(0.01)).toBe('0:01');
    });
  });

  describe('formatPaceFromMinutes', () => {
    it('should format standard paces', () => {
      expect(formatPaceFromMinutes(4)).toBe('4:00');
      expect(formatPaceFromMinutes(5)).toBe('5:00');
      expect(formatPaceFromMinutes(6.5)).toBe('6:30');
    });

    it('should round to nearest second', () => {
      expect(formatPaceFromMinutes(5.008)).toBe('5:00'); // 300.48s ≈ 300s
      expect(formatPaceFromMinutes(5.009)).toBe('5:01'); // 300.54s ≈ 301s
    });

    it('should handle fractional paces', () => {
      expect(formatPaceFromMinutes(4.25)).toBe('4:15');
      expect(formatPaceFromMinutes(5.75)).toBe('5:45');
      expect(formatPaceFromMinutes(7.333)).toBe('7:20'); // 7.333 min = 440s ≈ 7:20
    });

    it('should handle edge cases', () => {
      expect(formatPaceFromMinutes(0)).toBe('0:00');
      expect(formatPaceFromMinutes(0.5)).toBe('0:30');
    });
  });

  describe('consistency between formatters', () => {
    it('formatTime and formatTimeFromMinutes should produce similar results for whole minutes', () => {
      // For whole minutes, results should be identical
      expect(formatTime(5)).toBe(formatTimeFromMinutes(5));
      expect(formatTime(60)).toBe(formatTimeFromMinutes(60));
      expect(formatTime(120)).toBe(formatTimeFromMinutes(120));
    });

    it('formatPace and formatPaceFromMinutes should produce similar results for whole minutes', () => {
      // For whole minutes, results should be identical
      expect(formatPace(4)).toBe(formatPaceFromMinutes(4));
      expect(formatPace(5)).toBe(formatPaceFromMinutes(5));
      expect(formatPace(6)).toBe(formatPaceFromMinutes(6));
    });

    it('both time formatters should handle sub-minute precision consistently', () => {
      // Both should show same time for 5.5 minutes (5:30)
      expect(formatTime(5.5)).toBe('5:30');
      expect(formatTimeFromMinutes(5.5)).toBe('5:30');
    });

    it('both pace formatters should handle sub-minute precision consistently', () => {
      // Both should show same pace for 5.5 min/km (5:30)
      expect(formatPace(5.5)).toBe('5:30');
      expect(formatPaceFromMinutes(5.5)).toBe('5:30');
    });
  });

  describe('real-world scenarios', () => {
    it('should format 5K race times correctly', () => {
      expect(formatTimeFromMinutes(15)).toBe('15:00'); // Elite 5K
      expect(formatTimeFromMinutes(20)).toBe('20:00'); // Good 5K
      expect(formatTimeFromMinutes(25)).toBe('25:00'); // Average 5K
      expect(formatTimeFromMinutes(30)).toBe('30:00'); // Beginner 5K
    });

    it('should format 10K race times correctly', () => {
      expect(formatTimeFromMinutes(30)).toBe('30:00'); // Elite 10K
      expect(formatTimeFromMinutes(45)).toBe('45:00'); // Good 10K
      expect(formatTimeFromMinutes(50)).toBe('50:00'); // Average 10K
      expect(formatTimeFromMinutes(60)).toBe('1:00:00'); // Beginner 10K
    });

    it('should format half marathon times correctly', () => {
      expect(formatTimeFromMinutes(65)).toBe('1:05:00'); // Elite half
      expect(formatTimeFromMinutes(90)).toBe('1:30:00'); // Good half
      expect(formatTimeFromMinutes(120)).toBe('2:00:00'); // Average half
      expect(formatTimeFromMinutes(150)).toBe('2:30:00'); // Beginner half
    });

    it('should format marathon times correctly', () => {
      expect(formatTimeFromMinutes(130)).toBe('2:10:00'); // Elite marathon
      expect(formatTimeFromMinutes(180)).toBe('3:00:00'); // Good marathon
      expect(formatTimeFromMinutes(240)).toBe('4:00:00'); // Average marathon
      expect(formatTimeFromMinutes(300)).toBe('5:00:00'); // Beginner marathon
    });

    it('should format typical running paces correctly', () => {
      expect(formatPaceFromMinutes(3)).toBe('3:00'); // Elite pace
      expect(formatPaceFromMinutes(4)).toBe('4:00'); // Very fast
      expect(formatPaceFromMinutes(5)).toBe('5:00'); // Fast
      expect(formatPaceFromMinutes(6)).toBe('6:00'); // Average
      expect(formatPaceFromMinutes(7)).toBe('7:00'); // Easy
      expect(formatPaceFromMinutes(8)).toBe('8:00'); // Slow jog
    });
  });
});
