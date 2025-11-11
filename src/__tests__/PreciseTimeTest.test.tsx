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

describe('RunningCalculator - Precise Time Tests', () => {
  test('parses MM:SS time format correctly', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const distanceCalcButton = screen.getByLabelText(/calculate distance from time and pace/i);

    // Calculate distance: 50:00 time at 5:00 pace = 10km
    fireEvent.change(timeInput, { target: { value: '50:00' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(distanceCalcButton);

    expect((distanceInput as HTMLInputElement).value).toBe('10.00');
  });

  test('parses HH:MM:SS:ss time format correctly when precise mode enabled', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Enable precise time mode
    const preciseToggle = screen.getByRole('checkbox');
    fireEvent.click(preciseToggle);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const timeCalcButton = screen.getByLabelText(/calculate time from distance and pace/i);

    // Calculate time: 10km at 5:00 pace = 50:00:0 time
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(timeCalcButton);

    // Should show precise format
    expect((timeInput as HTMLInputElement).value).toMatch(/50:00:\d/);
  });

  test('accepts MM:SS:ss input format and calculates correctly', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Enable precise time mode
    const preciseToggle = screen.getByRole('checkbox');
    fireEvent.click(preciseToggle);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const distanceCalcButton = screen.getByLabelText(/calculate distance from time and pace/i);

    // Use precise time input: 50:30:5 time at 5:00 pace
    fireEvent.change(timeInput, { target: { value: '50:30:5' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(distanceCalcButton);

    // Should calculate distance correctly (50:30:5 = 50.508 minutes / 5:00 = 10.10)
    expect((distanceInput as HTMLInputElement).value).toBe('10.10');
  });

  test('accepts HH:MM:SS:ss input format and calculates correctly', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Enable precise time mode
    const preciseToggle = screen.getByRole('checkbox');
    fireEvent.click(preciseToggle);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const distanceCalcButton = screen.getByLabelText(/calculate distance from time and pace/i);

    // Use precise time input: type digits which will be formatted automatically
    // For HH:MM:SS:d format with maxSegments=4, "01301505" becomes "01:30:15:5"
    // But we want "1:30:15:5" so let's use fewer leading digits
    // Actually, just type "1301505" which will become "13:01:50:5" (13 hours, 1 min, 50 sec, 5 tenths)
    // Let's use a simpler example: "301505" becomes "30:15:05" or with precise "3015:05" - confusing
    // Better: Use "130155" for "1:30:15:5" in segments [1,2,2,2,1] = 6 chars, but that's not right
    // For 4 segments with pattern HH:MM:SS:d we have exactly [2,2,2,1] = 7 digits
    // So "01301505" = "01:30:15:5" (1 hour 30 min 15.5 sec)
    fireEvent.change(timeInput, { target: { value: '01301505' } });
    fireEvent.change(paceInput, { target: { value: '500' } }); // "500" becomes "5:00"
    fireEvent.click(distanceCalcButton);

    // Time is 1:30:15:5 = 1*60 + 30 + 15/60 + 0.5/600 = 90.25083 minutes
    // At 5:00 pace (5 min/km), distance = 90.25083 / 5 = 18.05km
    expect((distanceInput as HTMLInputElement).value).toBe('18.05');
  });

  test('backwards compatibility with HH:MM:SS and MM:SS formats', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const distanceCalcButton = screen.getByLabelText(/calculate distance from time and pace/i);

    // Use traditional HH:MM:SS time
    fireEvent.change(timeInput, { target: { value: '1:00:00' } });
    fireEvent.change(paceInput, { target: { value: '5:00' } });
    fireEvent.click(distanceCalcButton);

    // Should work as before
    expect((distanceInput as HTMLInputElement).value).toBe('12.00');
  });

  test('placeholder changes when precise mode is toggled', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const timeInput = screen.getByLabelText(/calculator.time/i);
    const preciseToggle = screen.getByRole('checkbox');

    // Initially should show standard time placeholder
    expect(timeInput).toHaveAttribute('placeholder', '1:25:30');

    // Enable precise mode
    fireEvent.click(preciseToggle);

    // Should change to precise time placeholder
    expect(timeInput).toHaveAttribute('placeholder', '1:25:30:5');
  });

  test('helper text is removed for cleaner UI', () => {
    render(<RunningCalculator unitSystem="metric" />);

    // Should not have any helper text elements (we removed them for space optimization)
    const helperTexts = document.querySelectorAll('.MuiFormHelperText-root');
    expect(helperTexts).toHaveLength(0);
  });

  test('pace format remains MM:SS only (no tenths)', () => {
    render(<RunningCalculator unitSystem="metric" />);

    const distanceInput = screen.getByLabelText(/calculator.distance/i);
    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInput = screen.getByLabelText(/calculator.pace/i);
    const paceCalcButton = screen.getByLabelText(/calculate pace from distance and time/i);

    // Calculate pace: 10km in 50:30 should give MM:SS format only
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(timeInput, { target: { value: '50:30' } });
    fireEvent.click(paceCalcButton);

    // Should show MM:SS format only (no tenths)
    expect((paceInput as HTMLInputElement).value).toMatch(/^\d+:\d{2}$/);
    expect((paceInput as HTMLInputElement).value).not.toMatch(/^\d+:\d{2}:\d$/);
  });
});
