import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../RunningCalculator';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RunningCalculator - Error Handling', () => {
  test('handles invalid inputs gracefully', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    // TimeInput component filters out non-numeric characters automatically
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: 'invalid' } });

    // The pace field should be empty after typing "invalid" (all non-digits filtered)
    expect(paceInput).toHaveValue('');

    // Trying to calculate with empty pace should show error
    fireEvent.click(timeCalcButton);
    expect(screen.getByText(/calculator.errorNeedDistancePace/i)).toBeInTheDocument();
  });

  test('clears error when successful calculation is performed', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    // First cause an error by trying to calculate with empty pace
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '' } });
    fireEvent.click(timeCalcButton);
    expect(screen.getByText(/calculator.errorNeedDistancePace/i)).toBeInTheDocument();

    // Then fix the input and calculate again; "500" becomes "5:00"
    fireEvent.change(paceInput, { target: { value: '500' } });
    fireEvent.click(timeCalcButton);

    // Error should be cleared and calculation should work
    expect(screen.queryByText(/calculator.errorNeedDistancePace/i)).not.toBeInTheDocument();
    expect(timeInput).toHaveValue('50:00');
  });
});
