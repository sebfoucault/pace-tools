import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeedPaceConverter from '../SpeedPaceConverter';

// Simple i18n mock: return keys so we can query by labels
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SpeedPaceConverter', () => {
  const getSpeedInput = () => screen.getByLabelText('converter.speed');
  const getPaceInput = () => screen.getByLabelText('converter.pace');

  it('converts speed to pace in metric', () => {
    render(<SpeedPaceConverter unitSystem="metric" />);

    const speed = getSpeedInput();
    fireEvent.change(speed, { target: { value: '12' } });

    const pace = getPaceInput() as HTMLInputElement;
    expect(pace.value).toBe('5:00'); // 60 / 12 = 5:00 per km
  });

  it('converts pace to speed in metric', () => {
    render(<SpeedPaceConverter unitSystem="metric" />);

    const pace = getPaceInput();
    fireEvent.change(pace, { target: { value: '5:00' } });

    const speed = getSpeedInput() as HTMLInputElement;
    expect(speed.value).toBe('12.00');
  });

  it('converts speed to pace in imperial', () => {
    render(<SpeedPaceConverter unitSystem="imperial" />);

    const speed = getSpeedInput();
    fireEvent.change(speed, { target: { value: '7.5' } });

    const pace = getPaceInput() as HTMLInputElement;
    expect(pace.value).toBe('8:00'); // 60 / 7.5 = 8:00 per mile
  });

  it('converts pace to speed in imperial', () => {
    render(<SpeedPaceConverter unitSystem="imperial" />);

    const pace = getPaceInput();
    fireEvent.change(pace, { target: { value: '8:00' } });

    const speed = getSpeedInput() as HTMLInputElement;
    expect(speed.value).toBe('7.50');
  });

  it('updates values when switching unit system (metric -> imperial)', () => {
    const { rerender } = render(<SpeedPaceConverter unitSystem="metric" />);

    const speed = getSpeedInput();
    const pace = getPaceInput() as HTMLInputElement;

    fireEvent.change(speed, { target: { value: '12' } });
    expect(pace.value).toBe('5:00');

    // Switch to imperial
    rerender(<SpeedPaceConverter unitSystem="imperial" />);

    // Speed converted km/h -> mph: 12 * 0.621371 = 7.46
    expect((getSpeedInput() as HTMLInputElement).value).toBe('7.46');
    // Pace recalculated from new speed: ~8:03
    expect((getPaceInput() as HTMLInputElement).value).toBe('8:03');
  });

  it('updates values when switching unit system (imperial -> metric)', () => {
    const { rerender } = render(<SpeedPaceConverter unitSystem="imperial" />);

    const speed = getSpeedInput();
    const pace = getPaceInput() as HTMLInputElement;

    fireEvent.change(speed, { target: { value: '7.5' } });
    expect(pace.value).toBe('8:00');

    // Switch to metric
    rerender(<SpeedPaceConverter unitSystem="metric" />);

    // Speed converted mph -> km/h: 7.5 * 1.60934 = 12.07
    expect((getSpeedInput() as HTMLInputElement).value).toBe('12.07');
    // Pace recalculated from new speed: ~4:58
    expect((getPaceInput() as HTMLInputElement).value).toBe('4:58');
  });

  it('clears counterpart when input is cleared', () => {
    render(<SpeedPaceConverter unitSystem="metric" />);

    const speed = getSpeedInput();
    const pace = getPaceInput() as HTMLInputElement;

    fireEvent.change(speed, { target: { value: '12' } });
    expect(pace.value).toBe('5:00');

    // Clear speed -> pace should clear too
    fireEvent.change(speed, { target: { value: '' } });
    expect((getPaceInput() as HTMLInputElement).value).toBe('');
  });
});
