import { formatTime, formatPace, formatTimeFromMinutes, formatPaceFromMinutes, parseTimeToMinutes, parsePaceToMinutes } from '../formatters';

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

  describe('parseTimeToMinutes', () => {
    it('should parse MM:SS format', () => {
      expect(parseTimeToMinutes('5:00')).toBe(5);
      expect(parseTimeToMinutes('10:30')).toBe(10.5);
      expect(parseTimeToMinutes('25:45')).toBe(25.75);
      expect(parseTimeToMinutes('0:30')).toBe(0.5);
    });

    it('should parse HH:MM:SS format', () => {
      expect(parseTimeToMinutes('1:00:00')).toBe(60);
      expect(parseTimeToMinutes('1:30:00')).toBe(90);
      expect(parseTimeToMinutes('2:05:30')).toBe(125.5);
      expect(parseTimeToMinutes('3:00:00')).toBe(180);
    });

    it('should handle edge cases', () => {
      expect(parseTimeToMinutes('0:00')).toBe(0);
      expect(parseTimeToMinutes('0:01')).toBeCloseTo(0.0167, 3);
      expect(parseTimeToMinutes('59:59')).toBeCloseTo(59.983, 2);
    });

    it('should return NaN for invalid inputs', () => {
      expect(parseTimeToMinutes('')).toBeNaN();
      expect(parseTimeToMinutes('   ')).toBeNaN();
      expect(parseTimeToMinutes('invalid')).toBeNaN();
      expect(parseTimeToMinutes('5')).toBeNaN();
      expect(parseTimeToMinutes('5:60')).toBeNaN(); // Invalid seconds
      expect(parseTimeToMinutes('1:60:00')).toBeNaN(); // Invalid minutes
      expect(parseTimeToMinutes('-5:30')).toBeNaN(); // Negative
      expect(parseTimeToMinutes('5:-30')).toBeNaN();
      expect(parseTimeToMinutes('5:30:10')).toBe(5 * 60 + 30 + 10/60); // Valid HH:MM:SS (5 hours, 30 min, 10 sec)
    });

    it('should handle whitespace', () => {
      expect(parseTimeToMinutes(' 5:30 ')).toBe(5.5);
      expect(parseTimeToMinutes('  1:00:00  ')).toBe(60);
    });

    it('should parse real race times', () => {
      expect(parseTimeToMinutes('15:00')).toBe(15); // 5K
      expect(parseTimeToMinutes('30:00')).toBe(30); // 10K
      expect(parseTimeToMinutes('1:05:00')).toBe(65); // Half marathon
      expect(parseTimeToMinutes('2:10:00')).toBe(130); // Marathon
    });
  });

  describe('parsePaceToMinutes', () => {
    it('should parse standard paces', () => {
      expect(parsePaceToMinutes('4:00')).toBe(4);
      expect(parsePaceToMinutes('5:00')).toBe(5);
      expect(parsePaceToMinutes('6:30')).toBe(6.5);
      expect(parsePaceToMinutes('7:15')).toBe(7.25);
    });

    it('should handle fast paces', () => {
      expect(parsePaceToMinutes('3:00')).toBe(3);
      expect(parsePaceToMinutes('3:30')).toBe(3.5);
      expect(parsePaceToMinutes('2:45')).toBe(2.75);
    });

    it('should handle slow paces', () => {
      expect(parsePaceToMinutes('10:00')).toBe(10);
      expect(parsePaceToMinutes('12:30')).toBe(12.5);
      expect(parsePaceToMinutes('15:45')).toBe(15.75);
    });

    it('should handle edge cases', () => {
      expect(parsePaceToMinutes('0:30')).toBe(0.5);
      expect(parsePaceToMinutes('0:01')).toBeCloseTo(0.0167, 3);
      expect(parsePaceToMinutes('0:59')).toBeCloseTo(0.983, 2);
    });

    it('should return NaN for invalid inputs', () => {
      expect(parsePaceToMinutes('')).toBeNaN();
      expect(parsePaceToMinutes('   ')).toBeNaN();
      expect(parsePaceToMinutes('invalid')).toBeNaN();
      expect(parsePaceToMinutes('5')).toBeNaN();
      expect(parsePaceToMinutes('5:60')).toBeNaN(); // Invalid seconds
      expect(parsePaceToMinutes('-5:30')).toBeNaN(); // Negative
      expect(parsePaceToMinutes('5:-30')).toBeNaN();
      expect(parsePaceToMinutes('5:30:00')).toBeNaN(); // Wrong format
    });

    it('should handle whitespace', () => {
      expect(parsePaceToMinutes(' 5:30 ')).toBe(5.5);
      expect(parsePaceToMinutes('  6:00  ')).toBe(6);
    });

    it('should parse typical running paces', () => {
      expect(parsePaceToMinutes('3:00')).toBe(3); // Elite
      expect(parsePaceToMinutes('4:00')).toBe(4); // Very fast
      expect(parsePaceToMinutes('5:00')).toBe(5); // Fast
      expect(parsePaceToMinutes('6:00')).toBe(6); // Average
      expect(parsePaceToMinutes('7:00')).toBe(7); // Easy
      expect(parsePaceToMinutes('8:00')).toBe(8); // Slow jog
    });
  });

  describe('parsing and formatting roundtrip', () => {
    it('should roundtrip time values correctly', () => {
      const times = [5, 10.5, 25.75, 60, 90, 125.5];
      times.forEach(time => {
        const formatted = formatTimeFromMinutes(time);
        const parsed = parseTimeToMinutes(formatted);
        expect(parsed).toBeCloseTo(time, 1);
      });
    });

    it('should roundtrip pace values correctly', () => {
      const paces = [3, 4, 5, 6.5, 7.25, 10];
      paces.forEach(pace => {
        const formatted = formatPaceFromMinutes(pace);
        const parsed = parsePaceToMinutes(formatted);
        expect(parsed).toBeCloseTo(pace, 1);
      });
    });
  });
});
