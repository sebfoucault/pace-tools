import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RunningCalculator - Calculation Bug Tests', () => {
  test('recalculates time when pace changes after initial calculation', async () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Step 1: Fill distance and pace, calculate time
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(timeCalcButton);

    // Should calculate time = 10 * 5 = 50 minutes = 50:00
    await waitFor(() => {
      expect(timeInput).toHaveValue('50:00');
    });

    // Step 2: Change pace and recalculate time
    fireEvent.change(paceInput, { target: { value: '4:00' } });
    fireEvent.click(timeCalcButton);

    // Should recalculate time = 10 * 4 = 40 minutes = 40:00
    await waitFor(() => {
      expect(timeInput).toHaveValue('40:00');
    });
  });

  test('recalculates distance when time changes after initial calculation', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const distanceCalcButton = screen.getByLabelText(/calculate distance from time and pace/i);

    // Step 1: Fill time and pace, calculate distance
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(distanceCalcButton);

    // Should calculate distance = 50 / 5 = 10
    expect(distanceInput).toHaveValue('10.00');

    // Step 2: Change time and recalculate distance
    fireEvent.change(timeInput, { target: { value: '40:00' } });
    fireEvent.click(distanceCalcButton);

    // Should recalculate distance = 40 / 5 = 8
    expect(distanceInput).toHaveValue('8.00');
  });

  test('recalculates pace when distance changes after initial calculation', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceCalcButton = screen.getByLabelText(/calculate pace from distance and time/i);

    // Step 1: Fill distance and time, calculate pace
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.click(paceCalcButton);

    // Should calculate pace = 50 / 10 = 5:00
    expect(paceInput).toHaveValue('5:00');

    // Step 2: Change distance and recalculate pace
    fireEvent.change(distanceInput, { target: { value: '8' } });
    fireEvent.click(paceCalcButton);

    // Should recalculate pace = 50 / 8 = 6.25 = 6:15
    expect(paceInput).toHaveValue('6:15');
  });

  test('handles invalid inputs gracefully', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    // TimeInput component now filters out non-numeric characters automatically
    // So typing "invalid" will result in an empty field
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

    // Then fix the input and calculate again
    // TimeInput accepts digits which are auto-formatted: "500" becomes "5:00"
    fireEvent.change(paceInput, { target: { value: '500' } });
    fireEvent.click(timeCalcButton);

    // Error should be cleared and calculation should work
    expect(screen.queryByText(/calculator.errorNeedDistancePace/i)).not.toBeInTheDocument();
    expect(timeInput).toHaveValue('50:00');
  });
});
