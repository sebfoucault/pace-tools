import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../RunningCalculator';

describe('RunningCalculator - Lock Behavior', () => {
  const switchToAutoMode = () => {
    const autoModeButton = screen.getByRole('button', { name: /auto mode/i });
    fireEvent.click(autoModeButton);
  };

  test('calculate buttons are disabled when any field is locked in manual mode', () => {
    render(<RunningCalculator unitSystem="metric" />);
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });
    switchToAutoMode();
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const distanceLockButton = lockButtons[0];
    fireEvent.click(distanceLockButton);
    const manualModeButton = screen.getByRole('button', { name: /manual mode/i });
    fireEvent.click(manualModeButton);
    expect(screen.getByLabelText('Calculate distance from time and pace')).toBeDisabled();
    expect(screen.getByLabelText('Calculate time from distance and pace')).toBeDisabled();
    expect(screen.getByLabelText('Calculate pace from distance and time')).toBeDisabled();
  });

  test('adjustment chips are disabled when their field is locked', () => {
    render(<RunningCalculator unitSystem="metric" />);
    switchToAutoMode();
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '30:00' } });
    fireEvent.blur(timeInput);
    const paceInput = screen.getAllByLabelText(/pace/i)[0];
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.blur(paceInput);
    const lockButtons = screen.getAllByLabelText(/lock/i);
    const timeLockButton = lockButtons[1];
    const paceLockButton = lockButtons[2];
    fireEvent.click(timeLockButton);
    const plusOneMin = screen.getByText('+60s').closest('div[role="button"]');
    expect(plusOneMin).toHaveClass('Mui-disabled');
    fireEvent.click(timeLockButton);
    fireEvent.click(paceLockButton);
    const plusFive = screen.getByText('+5s').closest('div[role="button"]');
    expect(plusFive).toHaveClass('Mui-disabled');
  });
});
