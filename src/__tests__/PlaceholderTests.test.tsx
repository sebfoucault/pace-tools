import React from 'react';
import { render } from '@testing-library/react';
import RunningCalculator from '../components/RunningCalculator';
import SpeedPaceConverter from '../components/SpeedPaceConverter';

// Mock the react-i18next library
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Mock translations for testing
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
  describe('Distance field placeholders', () => {
    it('should show metric placeholder for metric unit system', () => {
      const { getByLabelText } = render(<RunningCalculator unitSystem="metric" />);
      const distanceField = getByLabelText('Distance (km)');
      expect(distanceField).toHaveAttribute('placeholder', '10.5');
    });

    it('should show imperial placeholder for imperial unit system', () => {
      const { getByLabelText } = render(<RunningCalculator unitSystem="imperial" />);
      const distanceField = getByLabelText('Distance (miles)');
      expect(distanceField).toHaveAttribute('placeholder', '6.5');
    });
  });

  describe('Time field placeholders', () => {
    it('should show standard time placeholder', () => {
      const { getByLabelText } = render(<RunningCalculator unitSystem="metric" />);
      const timeField = getByLabelText('Time');
      expect(timeField).toHaveAttribute('placeholder', '1:25:30');
    });
  });

  describe('Pace field placeholders', () => {
    it('should show pace placeholder', () => {
      const { getByLabelText } = render(<RunningCalculator unitSystem="metric" />);
      const paceField = getByLabelText('Pace (min/km)');
      expect(paceField).toHaveAttribute('placeholder', '5:30');
    });
  });

  describe('Helper text removal', () => {
    it('should not have helper text on distance field', () => {
      const { container } = render(<RunningCalculator unitSystem="metric" />);
      const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');

      // Should not find any helper texts since we removed them
      expect(helperTexts).toHaveLength(0);
    });

    it('should not have helper text on time field', () => {
      const { container } = render(<RunningCalculator unitSystem="metric" />);
      const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');

      expect(helperTexts).toHaveLength(0);
    });

    it('should not have helper text on pace field', () => {
      const { container } = render(<RunningCalculator unitSystem="metric" />);
      const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');

      expect(helperTexts).toHaveLength(0);
    });
  });
});

describe('Placeholder Tests - SpeedPaceConverter', () => {
  describe('Speed field placeholders', () => {
    it('should show metric speed placeholder for metric unit system', () => {
      const { getByLabelText } = render(<SpeedPaceConverter unitSystem="metric" />);
      const speedField = getByLabelText('Speed (km/h)');
      expect(speedField).toHaveAttribute('placeholder', '12.0');
    });

    it('should show imperial speed placeholder for imperial unit system', () => {
      const { getByLabelText } = render(<SpeedPaceConverter unitSystem="imperial" />);
      const speedField = getByLabelText('Speed (mph)');
      expect(speedField).toHaveAttribute('placeholder', '7.5');
    });
  });

  describe('Pace field placeholders', () => {
    it('should show pace placeholder', () => {
      const { getByLabelText } = render(<SpeedPaceConverter unitSystem="metric" />);
      const paceField = getByLabelText('Pace (min/km)');
      expect(paceField).toHaveAttribute('placeholder', '5:00');
    });
  });

  describe('Helper text removal', () => {
    it('should not have helper text on speed field', () => {
      const { container } = render(<SpeedPaceConverter unitSystem="metric" />);
      const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');

      expect(helperTexts).toHaveLength(0);
    });

    it('should not have helper text on pace field', () => {
      const { container } = render(<SpeedPaceConverter unitSystem="metric" />);
      const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');

      expect(helperTexts).toHaveLength(0);
    });

    it('should not have instruction text', () => {
      const { queryByText } = render(<SpeedPaceConverter unitSystem="metric" />);
      const instructionText = queryByText(/enter either speed or pace/i);

      expect(instructionText).not.toBeInTheDocument();
    });
  });
});

describe('Visual Space Optimization', () => {
  it('should have more compact layout without helper texts', () => {
    const { container } = render(<RunningCalculator unitSystem="metric" />);

    // Check that form fields don't have helper text taking up vertical space
    const textFields = container.querySelectorAll('.MuiTextField-root');
    expect(textFields.length).toBeGreaterThan(0);

    // Verify no helper text elements exist
    const helperTexts = container.querySelectorAll('.MuiFormHelperText-root');
    expect(helperTexts).toHaveLength(0);
  });

  it('should maintain functionality while being more compact', () => {
    const { getByLabelText } = render(<RunningCalculator unitSystem="metric" />);

    // Verify all fields are still present and functional
    expect(getByLabelText('Distance (km)')).toBeInTheDocument();
    expect(getByLabelText('Time')).toBeInTheDocument();
    expect(getByLabelText('Pace (min/km)')).toBeInTheDocument();
  });
});

describe('Placeholder Content Validation', () => {
  it('should provide meaningful placeholder examples', () => {
    const { getByLabelText } = render(<RunningCalculator unitSystem="metric" />);

    const distanceField = getByLabelText('Distance (km)');
    const timeField = getByLabelText('Time');
    const paceField = getByLabelText('Pace (min/km)');

    // Verify placeholders provide good examples
    expect(distanceField.getAttribute('placeholder')).toMatch(/\d+\.\d+/); // Should be a decimal number
    expect(timeField.getAttribute('placeholder')).toMatch(/\d+:\d+:\d+/); // Should be time format
    expect(paceField.getAttribute('placeholder')).toMatch(/\d+:\d+/); // Should be pace format
  });

  it('should show appropriate placeholders based on unit system', () => {
    const { getByLabelText: getMetric } = render(<RunningCalculator unitSystem="metric" />);
    const { getByLabelText: getImperial } = render(<RunningCalculator unitSystem="imperial" />);

    const metricDistance = getMetric('Distance (km)');
    const imperialDistance = getImperial('Distance (miles)');

    // Different unit systems should have different placeholder values
    expect(metricDistance.getAttribute('placeholder')).not.toBe(
      imperialDistance.getAttribute('placeholder')
    );
  });
});
