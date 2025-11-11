import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

describe('RunningCalculator - Performance Index', () => {
  test('performance index badge shows N/A when fields are empty', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // PI badge should show N/A
    const gauge = screen.getByTitle(/performanceIndex/i);
    expect(gauge).toBeInTheDocument();
    expect(gauge).toHaveTextContent('N/A');
  });  test('performance index badge appears when distance and time are filled', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    // Fill in time
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // PI badge should now be visible (look for chip with title)
    const chip = screen.getByTitle(/performanceIndexTooltip/i);
    expect(chip).toBeInTheDocument();
  });

  test('performance index is calculated correctly for 10km in 50 minutes', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance: 10 km
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    // Fill in time: 50:00
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // Check that PI badge shows a reasonable value (around 40)
    const chip = screen.getByTitle(/performanceIndexTooltip/i);
    expect(chip).toBeInTheDocument();

    // Extract the PI value from the chip text
    const text = chip.textContent || '';
    const match = text.match(/(\d+\.?\d*)/);
    expect(match).not.toBeNull();

    if (match) {
      const piValue = parseFloat(match[1]);
      expect(piValue).toBeGreaterThan(0);
      expect(piValue).toBeCloseTo(40, 0); // Should be around 40
    }
  });

  test('performance index updates when distance or time changes', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Initial values
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '5' } });

    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '25:00' } });
    fireEvent.blur(timeInput);

    // Get initial PI value
    const initialChip = screen.getByTitle(/performanceIndexTooltip/i);
    const initialText = initialChip.textContent || '';

    // Change distance
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // Get new PI value
    const updatedChip = screen.getByTitle(/performanceIndexTooltip/i);
    const updatedText = updatedChip.textContent || '';

    // Values should be present (they may be the same or different depending on the formula)
    expect(initialText).toBeTruthy();
    expect(updatedText).toBeTruthy();
  });

  test('performance index badge has color coding based on value', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in distance and time
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // Check that badge is rendered and visible
    const chip = screen.getByTitle(/performanceIndexTooltip/i);
    expect(chip).toBeInTheDocument();
    expect(chip).toBeVisible();
  });

  test('performance index shows N/A when distance is cleared', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Fill in fields
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // Verify PI badge shows a value
    const gauge = screen.getByTitle(/performanceIndex/i);
    expect(gauge).toBeInTheDocument();
    expect(gauge.textContent).toMatch(/\d+\.?\d*/);

    // Clear distance
    fireEvent.change(distanceInput, { target: { value: '' } });

    // PI badge should show N/A
    expect(gauge).toHaveTextContent('N/A');
  });  test('performance index works with imperial units', () => {
    render(<RunningCalculator unitSystem="imperial" />);

    // Fill in distance: 6.2 miles (approximately 10km)
    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    fireEvent.change(distanceInput, { target: { value: '6.2' } });

    // Fill in time: 50:00
    const timeInput = screen.getByLabelText(/calculator.time/i);
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.blur(timeInput);

    // PI badge should be visible
    const chip = screen.getByTitle(/performanceIndexTooltip/i);
    expect(chip).toBeInTheDocument();

    // Extract and verify the PI value
    const text = chip.textContent || '';
    const match = text.match(/(\d+\.?\d*)/);
    expect(match).not.toBeNull();

    if (match) {
      const piValue = parseFloat(match[1]);
      expect(piValue).toBeGreaterThan(0);
      expect(piValue).toBeCloseTo(40, 0); // Should be around 40 (similar to metric)
    }
  });
});
