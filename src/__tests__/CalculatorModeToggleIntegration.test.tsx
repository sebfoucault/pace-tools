import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

describe('RunningCalculator - Calculator Mode Toggle', () => {
  describe('mode toggle rendering', () => {
    it('should render mode toggle with manual mode selected by default', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const manualButton = screen.getByRole('button', { name: /manual mode/i });
      const autoButton = screen.getByRole('button', { name: /auto mode/i });

      expect(manualButton).toBeInTheDocument();
      expect(autoButton).toBeInTheDocument();
      expect(manualButton).toHaveClass('Mui-selected');
      expect(autoButton).not.toHaveClass('Mui-selected');
    });

    it('should display localized labels for mode buttons', () => {
      render(<RunningCalculator unitSystem="metric" />);

      expect(screen.getByText('calculator.modeManual')).toBeInTheDocument();
      expect(screen.getByText('calculator.modeAuto')).toBeInTheDocument();
    });

    it('should render Calculate icon in manual mode button', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const manualButton = screen.getByRole('button', { name: /manual mode/i });
      const calculateIcon = within(manualButton).getByTestId('CalculateIcon');

      expect(calculateIcon).toBeInTheDocument();
    });

    it('should render Lock icon in auto mode button', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      const lockIcon = within(autoButton).getByTestId('LockIcon');

      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe('mode toggle behavior', () => {
    it('should switch to auto mode when auto button is clicked', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      expect(autoButton).toHaveClass('Mui-selected');
    });

    it('should switch back to manual mode when manual button is clicked', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      const manualButton = screen.getByRole('button', { name: /manual mode/i });

      fireEvent.click(autoButton);
      expect(autoButton).toHaveClass('Mui-selected');

      fireEvent.click(manualButton);
      expect(manualButton).toHaveClass('Mui-selected');
      expect(autoButton).not.toHaveClass('Mui-selected');
    });
  });

  describe('icon visibility based on mode', () => {
    it('should show only calculate icons in manual mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // In manual mode, calculate buttons should be visible
      expect(screen.getByLabelText('Calculate distance from time and pace')).toBeInTheDocument();
      expect(screen.getByLabelText('Calculate time from distance and pace')).toBeInTheDocument();
      expect(screen.getByLabelText('Calculate pace from distance and time')).toBeInTheDocument();

      // Lock buttons should not be present
      expect(screen.queryByLabelText(/lock distance/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/lock time/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/lock pace/i)).not.toBeInTheDocument();
    });

    it('should show only lock icons in auto mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Switch to auto mode
      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      // Fill in distance to enable lock
      const distanceInput = screen.getByLabelText(/calculator.distance/i);
      fireEvent.change(distanceInput, { target: { value: '10' } });

      // Lock buttons should be visible
      const lockButtons = screen.getAllByLabelText(/lock|unlock/i);
      expect(lockButtons.length).toBeGreaterThan(0);

      // Calculate buttons should not be present
      expect(screen.queryByLabelText('Calculate distance from time and pace')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Calculate time from distance and pace')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Calculate pace from distance and time')).not.toBeInTheDocument();
    });

    it('should use generic Calculate icon for all fields in manual mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // All calculate buttons should use the same Calculate icon
      const distanceCalculateButton = screen.getByLabelText('Calculate distance from time and pace');
      const timeCalculateButton = screen.getByLabelText('Calculate time from distance and pace');
      const paceCalculateButton = screen.getByLabelText('Calculate pace from distance and time');

      const distanceIcon = within(distanceCalculateButton).getByTestId('CalculateIcon');
      const timeIcon = within(timeCalculateButton).getByTestId('CalculateIcon');
      const paceIcon = within(paceCalculateButton).getByTestId('CalculateIcon');

      expect(distanceIcon).toBeInTheDocument();
      expect(timeIcon).toBeInTheDocument();
      expect(paceIcon).toBeInTheDocument();
    });
  });

  describe('manual mode functionality', () => {
    it('should allow manual calculation in manual mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Fill in distance and time
      const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
      const timeInput = screen.getByLabelText(/calculator.time/i);

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(timeInput, { target: { value: '50:00' } });
      fireEvent.blur(timeInput);

      // Click calculate pace button
      const calculatePaceButton = screen.getByLabelText('Calculate pace from distance and time');
      fireEvent.click(calculatePaceButton);

      // Pace should be calculated (10 km in 50:00 = 5:00/km)
      const paceInput = screen.getAllByLabelText(/pace/i)[0] as HTMLInputElement;
      expect(paceInput.value).toBe('5:00');
    });

    it('should not auto-calculate when fields change in manual mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Fill in distance and pace
      const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
      const paceInput = screen.getAllByLabelText(/pace/i)[0] as HTMLInputElement;

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(paceInput, { target: { value: '5:00' } });
      fireEvent.blur(paceInput);

      // Time should NOT be auto-calculated in manual mode
      const timeInput = screen.getByLabelText(/calculator.time/i) as HTMLInputElement;
      expect(timeInput.value).toBe('');
    });
  });

  describe('auto mode functionality', () => {
    it('should auto-calculate when field is locked in auto mode', async () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Switch to auto mode
      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      // Fill in distance and pace
      const distanceInput = screen.getByLabelText(/calculator.distance/i);
      const paceInput = screen.getAllByLabelText(/pace/i)[0];

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(paceInput, { target: { value: '5:00' } });
      fireEvent.blur(paceInput);

      // Lock distance
      const lockButtons = screen.getAllByLabelText(/lock/i);
      fireEvent.click(lockButtons[0]);

      // Wait a bit for auto-calculation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Time should be auto-calculated (10 km * 5:00/km = 50:00)
      const timeInput = screen.getByLabelText(/calculator.time/i) as HTMLInputElement;
      expect(timeInput.value).toBe('50:00');
    });

    it('should not allow manual calculation buttons in auto mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Switch to auto mode
      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      // Calculate buttons should not be present
      expect(screen.queryByLabelText('Calculate distance from time and pace')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Calculate time from distance and pace')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Calculate pace from distance and time')).not.toBeInTheDocument();
    });
  });

  describe('mode persistence during calculations', () => {
    it('should maintain manual mode selection after calculations', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const manualButton = screen.getByRole('button', { name: /manual mode/i });

      // Perform a calculation
      const distanceInput = screen.getByLabelText(/calculator.distance/i);
      const timeInput = screen.getByLabelText(/calculator.time/i);

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(timeInput, { target: { value: '50:00' } });
      fireEvent.blur(timeInput);

      const calculatePaceButton = screen.getByLabelText('Calculate pace from distance and time');
      fireEvent.click(calculatePaceButton);

      // Mode should still be manual
      expect(manualButton).toHaveClass('Mui-selected');
    });

    it('should maintain auto mode selection after auto-calculations', async () => {
      render(<RunningCalculator unitSystem="metric" />);

      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      // Fill fields and lock one
      const distanceInput = screen.getByLabelText(/calculator.distance/i);
      const paceInput = screen.getAllByLabelText(/pace/i)[0];

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(paceInput, { target: { value: '5:00' } });
      fireEvent.blur(paceInput);

      const lockButtons = screen.getAllByLabelText(/lock/i);
      fireEvent.click(lockButtons[0]);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Mode should still be auto
      expect(autoButton).toHaveClass('Mui-selected');
    });
  });

  describe('mode switching with active calculations', () => {
    it('should preserve field values when switching from manual to auto mode', () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Fill in values in manual mode
      const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
      const timeInput = screen.getByLabelText(/calculator.time/i) as HTMLInputElement;

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(timeInput, { target: { value: '50:00' } });
      fireEvent.blur(timeInput);

      // Switch to auto mode
      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      // Values should be preserved
      expect(distanceInput.value).toBe('10');
      expect(timeInput.value).toBe('50:00');
    });

    it('should preserve field values when switching from auto to manual mode', async () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Switch to auto mode
      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      // Fill and lock fields
      const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
      const paceInput = screen.getAllByLabelText(/pace/i)[0] as HTMLInputElement;

      fireEvent.change(distanceInput, { target: { value: '10' } });
      fireEvent.change(paceInput, { target: { value: '5:00' } });
      fireEvent.blur(paceInput);

      const lockButtons = screen.getAllByLabelText(/lock/i);
      fireEvent.click(lockButtons[0]);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Switch to manual mode
      const manualButton = screen.getByRole('button', { name: /manual mode/i });
      fireEvent.click(manualButton);

      // Values should be preserved
      expect(distanceInput.value).toBe('10');
      expect(paceInput.value).toBe('5:00');
    });

    it('should maintain lock state when switching modes', async () => {
      render(<RunningCalculator unitSystem="metric" />);

      // Switch to auto mode and lock distance
      const autoButton = screen.getByRole('button', { name: /auto mode/i });
      fireEvent.click(autoButton);

      const distanceInput = screen.getByLabelText(/calculator.distance/i) as HTMLInputElement;
      fireEvent.change(distanceInput, { target: { value: '10' } });

      const lockButtons = screen.getAllByLabelText(/lock/i);
      fireEvent.click(lockButtons[0]);

      // Switch to manual mode
      const manualButton = screen.getByRole('button', { name: /manual mode/i });
      fireEvent.click(manualButton);

      // Distance field should still be disabled (locked)
      expect(distanceInput).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for mode toggle group', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const modeToggleGroup = screen.getByRole('group', { name: /calculator mode/i });
      expect(modeToggleGroup).toBeInTheDocument();
    });

    it('should have proper aria-labels for mode buttons', () => {
      render(<RunningCalculator unitSystem="metric" />);

      expect(screen.getByRole('button', { name: /manual mode/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /auto mode/i })).toBeInTheDocument();
    });

    it('should indicate selected state with aria-pressed', () => {
      render(<RunningCalculator unitSystem="metric" />);

      const manualButton = screen.getByRole('button', { name: /manual mode/i });
      const autoButton = screen.getByRole('button', { name: /auto mode/i });

      expect(manualButton).toHaveAttribute('aria-pressed', 'true');
      expect(autoButton).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(autoButton);

      expect(manualButton).toHaveAttribute('aria-pressed', 'false');
      expect(autoButton).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
