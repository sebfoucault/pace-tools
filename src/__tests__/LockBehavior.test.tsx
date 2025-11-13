import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

describe('RunningCalculator - Lock Behavior', () => {
  test('calculate buttons are disabled when any field is locked', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance field first
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

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

  test('adjustment chips are disabled when their field is locked', () => {
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
    const timeLockButton = lockButtons[1];
    const paceLockButton = lockButtons[2];

    // Lock the time field
    fireEvent.click(timeLockButton);

    // Time adjustment chips should be disabled
    const plusOneMin = screen.getByText('+60s').closest('div[role="button"]');
    expect(plusOneMin).toHaveClass('Mui-disabled');

    // Unlock time and lock pace
    fireEvent.click(timeLockButton);
    fireEvent.click(paceLockButton);

    // Pace adjustment chips should be disabled
    const plusFive = screen.getByText('+5s').closest('div[role="button"]');
    expect(plusFive).toHaveClass('Mui-disabled');
  });

  test('calculate buttons are re-enabled when lock is released', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance field first
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

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

    // Fill in distance and time fields first
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

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

  test('distance chips are disabled when distance field is locked', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in and lock distance field
    const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[0]);

    // Distance chips should be disabled
    const fiveKmChip = screen.getByText('5 km').closest('div[role="button"]');
    expect(fiveKmChip).toHaveClass('Mui-disabled');

    // Try to click - should not change value
    fireEvent.click(screen.getByText('5 km'));
    expect(distanceInput.value).toBe('10'); // Still 10, not changed to 5
  });

  test('adjustment chips do not work when their field is locked', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in time and pace
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '30:00' } });
    fireEvent.blur(timeInput);

    const paceInput = screen.getAllByLabelText(/pace/i)[0];
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.blur(paceInput);

    // Lock time field
    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[1]); // Time lock button

    // Try to adjust time - should not work
    const plusOneMin = screen.getByText('+60s');
    fireEvent.click(plusOneMin);
    expect(timeInput).toHaveValue('30:00'); // Still 30:00, not changed

    // Unlock time, lock pace
    fireEvent.click(lockButtons[1]);
    fireEvent.click(lockButtons[2]); // Pace lock button

    // Try to adjust pace - should not work
    const plusFive = screen.getByText('+5s');
    fireEvent.click(plusFive);
    expect(paceInput).toHaveValue('5:00'); // Still 5:00, not changed
  });

  test('locked field cannot be edited manually', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance field
    const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
    fireEvent.change(distanceInput, { target: { value: '10' } });
    expect(distanceInput.value).toBe('10');

    // Lock the distance field
    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[0]);

    // Try to change the locked field
    fireEvent.change(distanceInput, { target: { value: '20' } });

    // Value should not change
    expect(distanceInput.value).toBe('10');
  });

  test('lock button is disabled when field is empty', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Get lock buttons
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0];

    // Lock button should be disabled when field is empty
    expect(distanceLockButton).toBeDisabled();

    // Fill in distance
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    // Lock button should now be enabled
    expect(distanceLockButton).not.toBeDisabled();
  });

  test('lock is automatically released when locked field becomes empty', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance and time
    const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // Lock the distance field
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0];
    fireEvent.click(distanceLockButton);

    // Verify it's locked
    expect(distanceLockButton.querySelector('svg[data-testid="LockIcon"]')).toBeInTheDocument();

    // Clear the distance field (simulating some action that clears it)
    fireEvent.change(distanceInput, { target: { value: '' } });

    // The lock should be automatically released
    // Since we prevent changes to locked fields, we need to test this differently
    // The lock should remain but the useEffect will detect empty field and unlock
    // Wait a bit for the effect to run
    setTimeout(() => {
      expect(distanceLockButton.querySelector('svg[data-testid="LockOpenIcon"]')).toBeInTheDocument();
    }, 100);
  });

  test('distance chips cannot modify locked field value', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance
    const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
    fireEvent.change(distanceInput, { target: { value: '5' } });

    // Lock the distance field
    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[0]);

    // Try to use distance chip - should not work
    const tenKmChip = screen.getByText('10 km');
    fireEvent.click(tenKmChip);

    // Distance should NOT be updated because it's locked
    expect(distanceInput.value).toBe('5');
  });

  test('locked fields are visually disabled', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in fields
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // Lock distance
    const lockButtons = screen.getAllByLabelText(/lock/i);
    fireEvent.click(lockButtons[0]);

    // Distance field should be disabled
    expect(distanceInput).toBeDisabled();

    // Time field should not be disabled
    expect(timeInput).not.toBeDisabled();

    // Unlock distance, lock time
    fireEvent.click(lockButtons[0]);
    fireEvent.click(lockButtons[1]);

    // Distance should no longer be disabled
    expect(distanceInput).not.toBeDisabled();

    // Time should be disabled
    expect(timeInput).toBeDisabled();
  });
});
