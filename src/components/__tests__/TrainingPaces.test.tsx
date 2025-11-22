import { render, screen, fireEvent } from '@testing-library/react';
import TrainingPaces from '../TrainingPaces';
import { UnitSystem } from '../../types';

// Mock the PerformanceGauge component
jest.mock('../PerformanceGauge', () => ({
  __esModule: true,
  default: ({ performanceIndex }: { performanceIndex: number | null }) => (
    <div data-testid="performance-gauge">
      {performanceIndex !== null ? `PI: ${performanceIndex}` : 'No PI'}
    </div>
  ),
}));

describe('TrainingPaces', () => {
  const defaultProps = {
    unitSystem: 'metric' as UnitSystem,
    performanceIndex: 45,
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<TrainingPaces {...defaultProps} />);
      expect(screen.getByTestId('performance-gauge')).toBeInTheDocument();
    });

    it('should render PerformanceGauge with correct PI', () => {
      render(<TrainingPaces {...defaultProps} />);
      expect(screen.getByTestId('performance-gauge')).toHaveTextContent('PI: 45');
    });

    it('should render first training zone by default', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Should show Easy Run first (translated key)
      expect(screen.getByText('trainingPaces.easy')).toBeInTheDocument();
      expect(screen.getByText('1 / 5')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<TrainingPaces {...defaultProps} />);

      const prevButton = screen.getByLabelText('trainingPaces.previous');
      const nextButton = screen.getByLabelText('trainingPaces.next');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();

      // Previous should be disabled on first zone
      expect(prevButton).toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should render pace range labels', () => {
      render(<TrainingPaces {...defaultProps} />);

      const paceLabels = screen.getAllByText(/trainingPaces.pace:/);
      expect(paceLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should navigate to next zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      const nextButton = screen.getByLabelText('trainingPaces.next');

      // Start at zone 1
      expect(screen.getByText('1 / 5')).toBeInTheDocument();

      // Click next
      fireEvent.click(nextButton);

      // Should be at zone 2
      expect(screen.getByText('2 / 5')).toBeInTheDocument();
      expect(screen.getByText('trainingPaces.marathon')).toBeInTheDocument();
    });

    it('should navigate to previous zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      const nextButton = screen.getByLabelText('trainingPaces.next');
      const prevButton = screen.getByLabelText('trainingPaces.previous');

      // Navigate to zone 2
      fireEvent.click(nextButton);
      expect(screen.getByText('2 / 5')).toBeInTheDocument();

      // Navigate back to zone 1
      fireEvent.click(prevButton);
      expect(screen.getByText('1 / 5')).toBeInTheDocument();
    });

    it('should disable next button on last zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      const nextButton = screen.getByLabelText('trainingPaces.next');

      // Navigate to last zone
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('5 / 5')).toBeInTheDocument();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Performance Index Display', () => {
    it('should display PerformanceGauge when PI is available', () => {
      render(<TrainingPaces performanceIndex={50} unitSystem="metric" />);
      expect(screen.getByTestId('performance-gauge')).toHaveTextContent('PI: 50');
    });

    it('should handle null performance index', () => {
      render(<TrainingPaces performanceIndex={null} unitSystem="metric" />);
      expect(screen.getByTestId('performance-gauge')).toHaveTextContent('No PI');
    });

    it('should handle very high PI values', () => {
      render(<TrainingPaces performanceIndex={80} unitSystem="metric" />);
      expect(screen.getByTestId('performance-gauge')).toHaveTextContent('PI: 80');
    });

    it('should handle very low PI values', () => {
      render(<TrainingPaces performanceIndex={20} unitSystem="metric" />);
      expect(screen.getByTestId('performance-gauge')).toHaveTextContent('PI: 20');
    });
  });

  describe('Pace Display', () => {
    it('should display paces in metric format', () => {
      render(<TrainingPaces {...defaultProps} unitSystem="metric" />);

      // Should see min/km format
      const paceElements = screen.getAllByText(/min\/km/);
      expect(paceElements.length).toBeGreaterThan(0);
    });

    it('should display paces in imperial format', () => {
      render(<TrainingPaces {...defaultProps} unitSystem="imperial" />);

      // Should see min/mi format
      const paceElements = screen.getAllByText(/min\/mi/);
      expect(paceElements.length).toBeGreaterThan(0);
    });

    it('should show info message when PI is null', () => {
      render(<TrainingPaces performanceIndex={null} unitSystem="metric" />);

      // Should display info alert instead of pace data
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display different paces for different zones', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Get pace for first zone
      const firstZonePace = screen.getByText(/min\/km/).textContent;

      // Navigate to next zone
      const nextButton = screen.getByLabelText('trainingPaces.next');
      fireEvent.click(nextButton);

      // Get pace for second zone
      const secondZonePace = screen.getByText(/min\/km/).textContent;

      // Paces should be different
      expect(firstZonePace).not.toBe(secondZonePace);
    });
  });

  describe('Distance Time Tables', () => {
    it('should display time ranges for distances when zone has them', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Navigate to marathon zone (has distances)
      const nextButton = screen.getByLabelText('trainingPaces.next');
      fireEvent.click(nextButton);

      // Should have time displays in format like "0:45 - 0:52"
      const timeRanges = screen.getAllByText(/\d+:\d+\s*-\s*\d+:\d+/);
      expect(timeRanges.length).toBeGreaterThan(0);
    });

    it('should show table for all zones with consistent height', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Easy zone (first zone) now has table
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should show alert message when PI is null', () => {
      render(<TrainingPaces performanceIndex={null} unitSystem="metric" />);

      // Should display alert instead of distance tables
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should display all standard distances for interval zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Navigate to interval zone (zone 4)
      const nextButton = screen.getByLabelText('trainingPaces.next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Interval zone should have all 5 distances
      expect(screen.getByText('trainingPaces.interval')).toBeInTheDocument();
      expect(screen.getAllByText('100m').length).toBeGreaterThan(0);
    });

    it('should format times correctly', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Navigate to a zone with distances
      const nextButton = screen.getByLabelText('trainingPaces.next');
      fireEvent.click(nextButton);

      const { container } = render(<TrainingPaces {...defaultProps} />);
      const allText = container.textContent || '';

      // Check for time patterns like "0:30", "1:45", "3:00", etc.
      const timePattern = /\d+:\d{2}/g;
      const timeMatches = allText.match(timePattern);
      expect(timeMatches).not.toBeNull();
      expect(timeMatches!.length).toBeGreaterThan(0);
    });
  });

  describe('Zone-Specific Distances', () => {
    it('should show 1.0km and 1.5km for threshold zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Navigate to threshold zone (zone 3)
      const nextButton = screen.getByLabelText('trainingPaces.next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('trainingPaces.threshold')).toBeInTheDocument();
      expect(screen.getAllByText(/1\.0km/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1\.5km/).length).toBeGreaterThan(0);
    });

    it('should show 100m, 200m, 400m for interval zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Navigate to interval zone (zone 4)
      const nextButton = screen.getByLabelText('trainingPaces.next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('trainingPaces.interval')).toBeInTheDocument();
      expect(screen.getAllByText('100m').length).toBeGreaterThan(0);
      expect(screen.getAllByText('200m').length).toBeGreaterThan(0);
      expect(screen.getAllByText('400m').length).toBeGreaterThan(0);
    });

    it('should show distance tables for easy zone', () => {
      render(<TrainingPaces {...defaultProps} />);

      // Easy zone is the first zone (default)
      expect(screen.getByText('trainingPaces.easy')).toBeInTheDocument();

      // Easy zone should now have distance tables with 1.0km and 1.5km
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByText(/1\.0km/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1\.5km/).length).toBeGreaterThan(0);
    });
  });

  describe('Unit System Handling', () => {
    it('should adapt pace display to metric units', () => {
      render(<TrainingPaces performanceIndex={45} unitSystem="metric" />);

      expect(screen.getAllByText(/min\/km/).length).toBeGreaterThan(0);
    });

    it('should adapt pace display to imperial units', () => {
      render(<TrainingPaces performanceIndex={45} unitSystem="imperial" />);

      expect(screen.getAllByText(/min\/mi/).length).toBeGreaterThan(0);
    });

    it('should recalculate paces when unit system changes', () => {
      const { rerender } = render(
        <TrainingPaces performanceIndex={45} unitSystem="metric" />
      );

      const metricPaces = screen.getAllByText(/min\/km/);
      expect(metricPaces.length).toBeGreaterThan(0);

      rerender(<TrainingPaces performanceIndex={45} unitSystem="imperial" />);

      const imperialPaces = screen.getAllByText(/min\/mi/);
      expect(imperialPaces.length).toBeGreaterThan(0);
      expect(screen.queryByText(/min\/km/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle PI of 0 gracefully', () => {
      render(<TrainingPaces performanceIndex={0} unitSystem="metric" />);

      // Should show alert for invalid PI
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should handle negative PI gracefully', () => {
      render(<TrainingPaces performanceIndex={-10} unitSystem="metric" />);

      // Should show alert for invalid PI
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should handle extremely high PI values', () => {
      render(<TrainingPaces performanceIndex={150} unitSystem="metric" />);

      // Should still render without crashing
      expect(screen.getByTestId('performance-gauge')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(<TrainingPaces {...defaultProps} />);

      // Check that we have proper semantic structure
      const boxes = container.querySelectorAll('[class*="MuiBox"]');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('should display zone names clearly as you navigate', () => {
      render(<TrainingPaces {...defaultProps} />);

      const nextButton = screen.getByLabelText('trainingPaces.next');

      // Check first zone
      expect(screen.getByText('trainingPaces.easy')).toBeVisible();

      // Navigate to second zone
      fireEvent.click(nextButton);
      expect(screen.getByText('trainingPaces.marathon')).toBeVisible();

      // Navigate to third zone
      fireEvent.click(nextButton);
      expect(screen.getByText('trainingPaces.threshold')).toBeVisible();
    });

    it('should have proper aria-labels for navigation buttons', () => {
      render(<TrainingPaces {...defaultProps} />);

      const prevButton = screen.getByLabelText('trainingPaces.previous');
      const nextButton = screen.getByLabelText('trainingPaces.next');

      expect(prevButton).toHaveAttribute('aria-label', 'trainingPaces.previous');
      expect(nextButton).toHaveAttribute('aria-label', 'trainingPaces.next');
    });
  });
});
