import React from 'react';
import { render } from '@testing-library/react';
import RunningCalculator from '../RunningCalculator';
import SpeedPaceConverter from '../SpeedPaceConverter';

// Mock the react-i18next library
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: { [key: string]: string } = {
        'calculator.distance': `Distance (${options?.unit || 'km'})`,
        'calculator.time': 'Time',
        'calculator.pace': `Pace (${options?.unit || 'min/km'})`,
        'calculator.title': 'Running Calculator',
        'calculator.preciseTime': 'Precise time (tenths of seconds)',
        'converter.speed': `Speed (${options?.unit || 'km/h'})`,
        'converter.pace': `Pace (${options?.unit || 'min/km'})`,
        'converter.title': 'Speed ↔ Pace Converter',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

describe('Placeholder Tests - RunningCalculator', () => {
  it('should show metric placeholders', () => {
    const { getByLabelText } = render(<RunningCalculator unitSystem="metric" />);
    expect(getByLabelText('Distance (km)')).toHaveAttribute('placeholder', '10.5');
    expect(getByLabelText('Time')).toHaveAttribute('placeholder', '1:25:30');
    expect(getByLabelText('Pace (min/km)')).toHaveAttribute('placeholder', '5:30');
  });
});

describe('Placeholder Tests - SpeedPaceConverter', () => {
  it('should show metric speed placeholder and pace placeholder', () => {
    const { getByLabelText } = render(<SpeedPaceConverter unitSystem="metric" />);
    expect(getByLabelText('Speed (km/h)')).toHaveAttribute('placeholder', '12.0');
    expect(getByLabelText('Pace (min/km)')).toHaveAttribute('placeholder', '5:00');
  });
});
