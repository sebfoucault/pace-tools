import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../RunningCalculator';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RunningCalculator', () => {
  test('recalculates time when pace changes after initial calculation', async () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(timeCalcButton);

    await waitFor(() => {
      expect(timeInput).toHaveValue('50:00');
    });

    fireEvent.change(paceInput, { target: { value: '4:00' } });
    fireEvent.click(timeCalcButton);

    await waitFor(() => {
      expect(timeInput).toHaveValue('40:00');
    });
  });
});
