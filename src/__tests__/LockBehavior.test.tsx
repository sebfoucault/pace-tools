import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

describe('RunningCalculator - Lock Behavior', () => {
  test('calculate buttons are disabled when any field is locked', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Get lock buttons
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0]; // First lock button is for distance

    // Lock the distance field
    fireEvent.click(distanceLockButton);

    // Find calculate buttons by their aria-labels
    const calculateDistanceButton = screen.getByLabelText('Calculate distance from time and pace');
    const calculateTimeButton = screen.getByLabelText('Calculate time from distance and pace');
    const calculatePaceButton = screen.getByLabelText('Calculate pace from distance and time');

    // All calculate buttons should be disabled when any lock is set
    expect(calculateDistanceButton).toBeDisabled();
    expect(calculateTimeButton).toBeDisabled();
    expect(calculatePaceButton).toBeDisabled();
  });

  test('adjustment chips remain enabled when field is locked', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in time and pace first
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '30:00' } });
    fireEvent.blur(timeInput);

    const paceInput = screen.getAllByLabelText(/pace/i)[0];
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.blur(paceInput);

    // Get lock buttons
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0];

    // Lock the distance field
    fireEvent.click(distanceLockButton);

    // Find adjustment chips - they should NOT be disabled
    const distanceChip = screen.getByText('5 km').closest('div[role="button"]');
    const plusOneMin = screen.getByText('+1min').closest('div[role="button"]');
    const plusFive = screen.getByText('+5s').closest('div[role="button"]');

    // Distance chips should be enabled
    expect(distanceChip).not.toHaveClass('Mui-disabled');
    // Time and pace adjustment chips should be enabled (they only depend on field having value)
    expect(plusOneMin).not.toHaveClass('Mui-disabled');
    expect(plusFive).not.toHaveClass('Mui-disabled');
  });

  test('calculate buttons are re-enabled when lock is released', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Get lock buttons
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0];

    // Lock the distance field
    fireEvent.click(distanceLockButton);

    // Calculate buttons should be disabled
    const calculateDistanceButton = screen.getByLabelText('Calculate distance from time and pace');
    expect(calculateDistanceButton).toBeDisabled();

    // Unlock the field
    fireEvent.click(distanceLockButton);

    // Calculate buttons should be enabled again
    expect(calculateDistanceButton).not.toBeDisabled();
  });

  test('calculate buttons remain disabled when switching between different locked fields', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Get lock buttons
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0];
    const timeLockButton = lockButtons[1];

    // Lock distance
    fireEvent.click(distanceLockButton);

    const calculateDistanceButton = screen.getByLabelText('Calculate distance from time and pace');
    const calculateTimeButton = screen.getByLabelText('Calculate time from distance and pace');

    expect(calculateDistanceButton).toBeDisabled();
    expect(calculateTimeButton).toBeDisabled();

    // Switch to time lock
    fireEvent.click(timeLockButton);

    // Calculate buttons should still be disabled
    expect(calculateDistanceButton).toBeDisabled();
    expect(calculateTimeButton).toBeDisabled();
  });

  test('distance chips always work regardless of lock state', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Lock a field
    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[0]);

    // Distance chips should still be clickable
    const fiveKmChip = screen.getByText('5 km');
    fireEvent.click(fiveKmChip);

    // Distance field should be updated
    const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
    expect(distanceInput.value).toBe('5');
  });

  test('time and pace adjustment chips work when field has value, regardless of lock', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in time and pace
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '30:00' } });
    fireEvent.blur(timeInput);

    const paceInput = screen.getAllByLabelText(/pace/i)[0];
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.blur(paceInput);

    // Lock a field
    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[0]);

    // Time adjustment chips should still work
    const plusOneMin = screen.getByText('+1min');
    fireEvent.click(plusOneMin);

    // Time should be adjusted (30:00 + 1min = 31:00)
    expect(timeInput).toHaveValue('31:00');

    // Pace adjustment chips should still work
    const plusFive = screen.getByText('+5s');
    fireEvent.click(plusFive);

    // Pace should be adjusted (5:00 + 5s = 5:05)
    expect(paceInput).toHaveValue('5:05');
  });
});
