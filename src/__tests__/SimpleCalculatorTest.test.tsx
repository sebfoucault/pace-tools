import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RunningCalculator - Simple Bug Test', () => {
  test('component renders without crashing', () => {
    render(<RunningCalculator unitSystem="metric" />);
    expect(screen.getByText(/calculator.title/i)).toBeInTheDocument();
  });

  test('basic calculation works', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);

    // Find the calculate button for time
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    // Fill in distance and pace
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });

    // Calculate time
    fireEvent.click(timeCalcButton);

    // Check if time was calculated (10km at 5:00/km = 50:00)
    expect((timeInput as HTMLInputElement).value).toBe('50:00');
  });

  test('recalculation works after input change', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    // Initial calculation: 10km at 5:00/km = 50:00
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(timeCalcButton);
    expect((timeInput as HTMLInputElement).value).toBe('50:00');

    // Change pace and recalculate: 10km at 4:00/km = 40:00
    fireEvent.change(paceInput, { target: { value: '4:00' } });
    fireEvent.click(timeCalcButton);
    expect((timeInput as HTMLInputElement).value).toBe('40:00');
  });
});
