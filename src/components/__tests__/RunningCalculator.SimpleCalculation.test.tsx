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

describe('RunningCalculator - Simple Calculation', () => {
  test('basic calculation works', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(timeCalcButton);

    expect((timeInput as HTMLInputElement).value).toBe('50:00');
  });
});
