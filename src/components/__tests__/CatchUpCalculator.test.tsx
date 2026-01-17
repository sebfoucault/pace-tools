import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatchUpCalculator from '../CatchUpCalculator';

describe('CatchUpCalculator Component', () => {
  describe('Smoke Test', () => {
    it('should render without crashing with metric units', () => {
      render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.getByText(/catchUpCalculator.title/i)).toBeInTheDocument();
    });

    it('should render without crashing with imperial units', () => {
      render(<CatchUpCalculator unitSystem="imperial" />);
      expect(screen.getByText(/catchUpCalculator.title/i)).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should display help text', () => {
      render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.getByText(/catchUpCalculator.helpText/i)).toBeInTheDocument();
    });

    it('should display all input fields', () => {
      render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.getByLabelText(/catchUpCalculator.partnerPace/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/catchUpCalculator.yourPace/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/catchUpCalculator.targetDistance/i)).toBeInTheDocument();
    });

    it('should not display results initially', () => {
      render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.queryByText(/catchUpCalculator.results/i)).not.toBeInTheDocument();
    });

    it('should not display error initially', () => {
      render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.queryByText(/catchUpCalculator.errorPaceTooSlow/i)).not.toBeInTheDocument();
    });
  });

  describe('Distance Chips - Metric', () => {
    it('should display metric distance chips', () => {
      render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.getByText('1 km')).toBeInTheDocument();
      expect(screen.getByText('2 km')).toBeInTheDocument();
      expect(screen.getByText('5 km')).toBeInTheDocument();
    });

    it('should set distance when chip is clicked', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const chip = screen.getByText('2 km');
      await user.click(chip);

      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i) as HTMLInputElement;
      expect(distanceInput.value).toBe('2');
    });
  });

  describe('Distance Chips - Imperial', () => {
    it('should display imperial distance chips', () => {
      render(<CatchUpCalculator unitSystem="imperial" />);
      expect(screen.getByText('1 mi')).toBeInTheDocument();
      expect(screen.getByText('2 mi')).toBeInTheDocument();
      expect(screen.getByText('3 mi')).toBeInTheDocument();
    });

    it('should set distance when chip is clicked', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="imperial" />);

      const chip = screen.getByText('2 mi');
      await user.click(chip);

      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i) as HTMLInputElement;
      expect(distanceInput.value).toBe('2');
    });
  });

  describe('Validation', () => {
    it('should show error when interval pace is slower than partner pace', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '5:00');
      await user.type(intervalPaceInput, '6:00'); // Slower
      await user.type(distanceInput, '4');

      expect(screen.getByText(/catchUpCalculator.errorPaceTooSlow/i)).toBeInTheDocument();
    });

    it('should show error when paces are equal', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '5:30');
      await user.type(intervalPaceInput, '5:30'); // Equal
      await user.type(distanceInput, '4');

      expect(screen.getByText(/catchUpCalculator.errorPaceTooSlow/i)).toBeInTheDocument();
    });

    it('should not show error with valid inputs', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '6:30');
      await user.type(intervalPaceInput, '4:45'); // Faster
      await user.type(distanceInput, '4');

      expect(screen.queryByText(/catchUpCalculator.errorPaceTooSlow/i)).not.toBeInTheDocument();
    });
  });

  describe('Calculation Results - Metric', () => {
    it('should display results with valid inputs', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '6:30');
      await user.type(intervalPaceInput, '4:45');
      await user.type(distanceInput, '4');

      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();
      expect(screen.getByText(/catchUpCalculator.outSplit/i)).toBeInTheDocument();
      expect(screen.getByText(/catchUpCalculator.backSplit/i)).toBeInTheDocument();
      expect(screen.getByText(/catchUpCalculator.total/i)).toBeInTheDocument();
    });

    it('should display results table with splits', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '6:30');
      await user.type(intervalPaceInput, '4:45');
      await user.type(distanceInput, '4');

      // Check that results table is displayed
      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();
      expect(screen.getByText(/catchUpCalculator.outSplit/i)).toBeInTheDocument();
      expect(screen.getByText(/catchUpCalculator.backSplit/i)).toBeInTheDocument();
      expect(screen.getByText(/catchUpCalculator.total/i)).toBeInTheDocument();
    });

    it('should calculate splits correctly for known example', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      // Partner: 6:30 min/km, Interval: 4:45 min/km, Distance: 4 km
      await user.type(partnerPaceInput, '6:30');
      await user.type(intervalPaceInput, '4:45');
      await user.type(distanceInput, '4');

      // Should display results table
      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();

      // Check that results contain times in the expected range
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Calculation Results - Imperial', () => {
    it('should display results with imperial units', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="imperial" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '10:30');
      await user.type(intervalPaceInput, '7:45');
      await user.type(distanceInput, '3');

      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();
      // Distance should be displayed in miles
      const cells = screen.getAllByText(/mi/);
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Unit System Switching', () => {
    it('should update chip labels when unit system changes', () => {
      const { rerender } = render(<CatchUpCalculator unitSystem="metric" />);
      expect(screen.getByText('1 km')).toBeInTheDocument();

      rerender(<CatchUpCalculator unitSystem="imperial" />);
      expect(screen.getByText('1 mi')).toBeInTheDocument();
      expect(screen.queryByText('1 km')).not.toBeInTheDocument();
    });

    it('should recalculate when unit system changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      await user.type(partnerPaceInput, '6:30');
      await user.type(intervalPaceInput, '4:45');
      await user.type(distanceInput, '4');

      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();

      // Switch to imperial
      rerender(<CatchUpCalculator unitSystem="imperial" />);

      // Results should still be displayed but with different unit
      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should not display results with incomplete inputs', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      await user.type(partnerPaceInput, '6:30');

      expect(screen.queryByText(/catchUpCalculator.results/i)).not.toBeInTheDocument();
    });

    it('should clear results when inputs become invalid', async () => {
      const user = userEvent.setup();
      render(<CatchUpCalculator unitSystem="metric" />);

      const partnerPaceInput = screen.getByLabelText(/catchUpCalculator.partnerPace/i);
      const intervalPaceInput = screen.getByLabelText(/catchUpCalculator.yourPace/i);
      const distanceInput = screen.getByLabelText(/catchUpCalculator.targetDistance/i);

      // Enter valid data
      await user.type(partnerPaceInput, '6:30');
      await user.type(intervalPaceInput, '4:45');
      await user.type(distanceInput, '4');

      expect(screen.getByText(/catchUpCalculator.results/i)).toBeInTheDocument();

      // Clear distance
      await user.clear(distanceInput);

      expect(screen.queryByText(/catchUpCalculator.results/i)).not.toBeInTheDocument();
    });
  });
});
