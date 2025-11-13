/**
 * Type Definitions for Pace Tools Application
 *
 * This module contains shared type definitions used across the application.
 */

/**
 * Unit system for displaying distances and paces
 * - metric: kilometers and min/km
 * - imperial: miles and min/mile
 */
export type UnitSystem = 'metric' | 'imperial';

/**
 * Race distance definition with both metric and imperial display values
 */
export interface RaceDistance {
  /** Display name of the race (e.g., "5K", "Marathon") */
  name: string;
  /** Distance in meters (canonical unit) */
  meters: number;
  /** Display value in kilometers */
  displayKm?: number;
  /** Display value in miles */
  displayMiles?: number;
}

/**
 * Input values for the running calculator
 * All values are stored as strings for form input handling
 */
export interface CalculationInputs {
  /** Distance value as string (converted based on unit system) */
  distance: string;
  /** Time value as string in HH:MM:SS or MM:SS format */
  time: string;
  /** Pace value as string in MM:SS format */
  pace: string;
}

/**
 * Detailed unit system configuration for distance and pace
 * Used internally by RunningCalculator
 */
export interface UnitSystemConfig {
  /** Distance unit: 'km' or 'miles' */
  distance: 'km' | 'miles';
  /** Pace unit: 'min/km' or 'min/mile' */
  pace: 'min/km' | 'min/mile';
}

/**
 * Type for fields that can be locked in the calculator
 * - distance: Lock distance field
 * - time: Lock time field
 * - pace: Lock pace field
 * - null: No field locked
 */
export type LockableField = 'distance' | 'time' | 'pace' | null;
