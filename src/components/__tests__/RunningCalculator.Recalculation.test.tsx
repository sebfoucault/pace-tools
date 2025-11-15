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

describe('RunningCalculator - Recalculation', () => {
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
});
