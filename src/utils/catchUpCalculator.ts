/**
 * Catch-Up Calculator Utilities
 *
 * Calculates split times and distances for an out-and-back interval where:
 * - Runner leaves partner in opposite direction
 * - Turns around and catches up to partner
 * - Total distance at target pace equals specified distance
 */

export interface CatchUpResult {
  timeOut: number;        // Time running opposite direction (minutes)
  timeBack: number;       // Time running same direction (minutes)
  distanceOut: number;    // Distance in opposite direction (meters)
  distanceBack: number;   // Distance in same direction (meters)
  totalTime: number;      // Total time for interval (minutes)
}

/**
 * Calculates out-and-back split times and distances
 *
 * @param partnerSpeed - Partner's speed in meters per minute
 * @param intervalSpeed - Your interval speed in meters per minute
 * @param distance - Target distance in meters
 * @returns CatchUpResult with split times and distances, or null if invalid
 *
 * Formulas:
 * t1 = D * (v_m - v_f) / (2 * v_m^2)  (time out)
 * t2 = D * (v_m + v_f) / (2 * v_m^2)  (time back)
 * d1 = v_m * t1  (distance out)
 * d2 = v_m * t2  (distance back)
 */
export function calculateCatchUp(
  partnerSpeed: number,
  intervalSpeed: number,
  distance: number
): CatchUpResult | null {
  // Validation
  if (partnerSpeed <= 0 || intervalSpeed <= 0 || distance <= 0) {
    return null;
  }

  // Interval speed must be faster (higher value = faster)
  if (intervalSpeed <= partnerSpeed) {
    return null;
  }

  // Calculate split times (in minutes)
  const intervalSpeedSquared = intervalSpeed * intervalSpeed;
  const timeOut = (distance * (intervalSpeed - partnerSpeed)) / (2 * intervalSpeedSquared);
  const timeBack = (distance * (intervalSpeed + partnerSpeed)) / (2 * intervalSpeedSquared);

  // Calculate split distances (in meters)
  const distanceOut = intervalSpeed * timeOut;
  const distanceBack = intervalSpeed * timeBack;

  return {
    timeOut,
    timeBack,
    distanceOut,
    distanceBack,
    totalTime: timeOut + timeBack,
  };
}

/**
 * Validates if the catch-up calculation is possible
 *
 * @param partnerSpeed - Partner's speed in meters per minute
 * @param intervalSpeed - Your interval speed in meters per minute
 * @returns true if calculation is valid
 */
export function isValidCatchUp(
  partnerSpeed: number,
  intervalSpeed: number
): boolean {
  return partnerSpeed > 0 && intervalSpeed > 0 && intervalSpeed > partnerSpeed;
}
