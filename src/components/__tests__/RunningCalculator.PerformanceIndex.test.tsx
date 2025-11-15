import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../RunningCalculator';

describe('RunningCalculator - Performance Index', () => {
  test('performance index badge shows N/A when fields are empty', () => {
    render(<RunningCalculator unitSystem="metric" />);
    const gauge = screen.getByTitle(/performanceIndex/i);
    expect(gauge).toBeInTheDocument();
    expect(gauge).toHaveTextContent('—');
  });

  test('performance index badge appears when distance and time are filled', () => {
    render(<RunningCalculator unitSystem="metric" />);
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);
    const chip = screen.getByTitle(/performanceIndexTooltip/i);
    expect(chip).toBeInTheDocument();
    const text = chip.textContent || '';
    const match = text.match(/(\d+\.?\d*)/);
    expect(match).not.toBeNull();
  });

  test('performance index is calculated correctly for 10km in 50 minutes (around 40)', () => {
    render(<RunningCalculator unitSystem="metric" />);
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);
    const chip = screen.getByTitle(/performanceIndexTooltip/i);
    const text = chip.textContent || '';
    const match = text.match(/(\d+\.?\d*)/);
    if (match) {
      const piValue = parseFloat(match[1]);
      expect(piValue).toBeGreaterThan(0);
      expect(piValue).toBeCloseTo(40, 0);
    }
  });
});
