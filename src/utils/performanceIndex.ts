/**
 * Performance Index Calculation Utilities
 *
 * This module implements the Riegel/Cameron performance model for predicting
 * running race times based on performance from another distance.
 *
 * The model is based on:
 * - Performance Index (PI) = i / imax
 * - i (intensity) = -4.60 + 0.182258 * v + 0.000104 * v²
 * - imax (max intensity) = 0.8 + 0.1894393 * exp(-0.012778 * t) + 0.2989558 * exp(-0.1932605 * t)
 * - v (velocity) = distance / time in meters/minute
 *
 * Reference: performance-index.md
 */

/**
 * Constants used in the performance index calculations
 */
export const PI_CONSTANTS = {
  // Intensity (i) formula coefficients: i = I_OFFSET + I_LINEAR * v + I_QUADRATIC * v²
  I_OFFSET: -4.60,
  I_LINEAR: 0.182258,
  I_QUADRATIC: 0.000104,

  // Maximum intensity (imax) formula coefficients:
  // imax = IMAX_BASE + IMAX_EXP1_COEFF * exp(IMAX_EXP1_RATE * t) + IMAX_EXP2_COEFF * exp(IMAX_EXP2_RATE * t)
  IMAX_BASE: 0.8,
  IMAX_EXP1_COEFF: 0.1894393,
  IMAX_EXP1_RATE: -0.012778,
  IMAX_EXP2_COEFF: 0.2989558,
  IMAX_EXP2_RATE: -0.1932605,

  // Binary search parameters for predictTimeFromPI
  CONVERGENCE_THRESHOLD: 0.0001,
  DEFAULT_MAX_ITERATIONS: 100,
  MIN_TIME_MINUTES: 1,
  MIN_VELOCITY_M_PER_MIN: 10, // Very slow pace
  INITIAL_GUESS_VELOCITY_M_PER_MIN: 200, // Average running pace

  // Unit conversions
  METERS_PER_KM: 1000,
  METERS_PER_MILE: 1609.34,
} as const;

/**
 * Calculate velocity in meters per minute
 * @param distanceMeters - Distance in meters
 * @param timeMinutes - Time in minutes
 * @returns Velocity in meters per minute
 */
export function calculateVelocity(distanceMeters: number, timeMinutes: number): number {
  return distanceMeters / timeMinutes;
}

/**
 * Calculate intensity (i) based on velocity
 * Formula: i = -4.60 + 0.182258 * v + 0.000104 * v²
 * @param velocity - Velocity in meters per minute
 * @returns Intensity value
 */
export function calculateI(velocity: number): number {
  const { I_OFFSET, I_LINEAR, I_QUADRATIC } = PI_CONSTANTS;
  return I_OFFSET + I_LINEAR * velocity + I_QUADRATIC * velocity * velocity;
}

/**
 * Calculate maximum intensity (imax) based on time
 * Formula: imax = 0.8 + 0.1894393 * exp(-0.012778 * t) + 0.2989558 * exp(-0.1932605 * t)
 * @param timeMinutes - Time in minutes
 * @returns Maximum intensity value
 */
export function calculateImax(timeMinutes: number): number {
  const { IMAX_BASE, IMAX_EXP1_COEFF, IMAX_EXP1_RATE, IMAX_EXP2_COEFF, IMAX_EXP2_RATE } = PI_CONSTANTS;
  return (
    IMAX_BASE +
    IMAX_EXP1_COEFF * Math.exp(IMAX_EXP1_RATE * timeMinutes) +
    IMAX_EXP2_COEFF * Math.exp(IMAX_EXP2_RATE * timeMinutes)
  );
}

/**
 * Convert distance to meters
 * @param distance - Distance value
 * @param unit - Unit of measurement ('km' or 'miles')
 * @returns Distance in meters
 */
export function convertDistanceToMeters(distance: number, unit: 'km' | 'miles'): number {
  if (unit === 'km') {
    return distance * PI_CONSTANTS.METERS_PER_KM;
  } else {
    return distance * PI_CONSTANTS.METERS_PER_MILE;
  }
}

/**
 * Calculate Performance Index from distance and time
 * @param distanceMeters - Distance in meters
 * @param timeMinutes - Time in minutes
 * @returns Performance Index (0-100+) or null if inputs are invalid
 */
export function calculatePerformanceIndex(distanceMeters: number, timeMinutes: number): number | null {
  // Validate inputs
  if (distanceMeters <= 0 || timeMinutes <= 0 || !isFinite(distanceMeters) || !isFinite(timeMinutes)) {
    return null;
  }

  try {
    // Calculate velocity (v = d / t) in m/min
    const velocity = calculateVelocity(distanceMeters, timeMinutes);

    // Calculate intensity (i)
    const i = calculateI(velocity);

    // Calculate maximum intensity (imax)
    const imax = calculateImax(timeMinutes);

    // Calculate performance index (pi = i / imax)
    const pi = i / imax;

    // Return non-negative value
    return Math.max(0, pi);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error calculating performance index:', error);
    }
    return null;
  }
}

/**
 * Predict race time for a given distance based on a known performance index
 * Uses binary search to find the time that produces the target PI
 *
 * @param distanceMeters - Target distance in meters
 * @param targetPI - Known performance index
 * @param maxIterations - Maximum number of binary search iterations (default: 100)
 * @returns Predicted time in minutes, or null if calculation fails
 */
export function predictTimeFromPI(
  distanceMeters: number,
  targetPI: number,
  maxIterations: number = PI_CONSTANTS.DEFAULT_MAX_ITERATIONS
): number | null {
  // Validate inputs
  if (!targetPI || targetPI <= 0 || distanceMeters <= 0) {
    return null;
  }

  try {
    const { MIN_TIME_MINUTES, MIN_VELOCITY_M_PER_MIN, INITIAL_GUESS_VELOCITY_M_PER_MIN, CONVERGENCE_THRESHOLD } = PI_CONSTANTS;

    // Binary search bounds
    let minTime: number = MIN_TIME_MINUTES;
    let maxTime: number = distanceMeters / MIN_VELOCITY_M_PER_MIN; // Very slow pace
    let timeMinutes: number = distanceMeters / INITIAL_GUESS_VELOCITY_M_PER_MIN; // Initial guess

    // Iterative refinement to converge on the correct time
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Calculate velocity for current time estimate
      const velocity = calculateVelocity(distanceMeters, timeMinutes);

      // Calculate intensity
      const i = calculateI(velocity);

      // Calculate maximum intensity
      const imax = calculateImax(timeMinutes);

      // Calculate current PI
      const currentPI = i / imax;

      // Check if we've converged
      if (Math.abs(currentPI - targetPI) < CONVERGENCE_THRESHOLD) {
        return timeMinutes;
      }

      // Binary search adjustment
      if (currentPI > targetPI) {
        // Current pace is too fast, need more time (slower)
        minTime = timeMinutes;
      } else {
        // Current pace is too slow, need less time (faster)
        maxTime = timeMinutes;
      }

      // Update time estimate (midpoint of range)
      timeMinutes = (minTime + maxTime) / 2;

      // Sanity check
      if (timeMinutes <= 0 || timeMinutes > 100000 || !isFinite(timeMinutes)) {
        return null;
      }
    }

    // If we didn't converge within maxIterations, return the best estimate
    if (process.env.NODE_ENV === 'development') {
      console.warn(`predictTimeFromPI: Did not fully converge after ${maxIterations} iterations`);
    }
    return timeMinutes;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error predicting time from PI:', error);
    }
    return null;
  }
}
