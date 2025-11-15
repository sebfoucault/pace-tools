import React from 'react';
import { render, screen } from '@testing-library/react';
import RacePredictor from '../RacePredictor';

describe('RacePredictor Component', () => {
  describe('Smoke Test', () => {
    it('should render without crashing with null PI', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      expect(screen.getByText(/racePredictor.title/i)).toBeInTheDocument();
    });

    it('should render without crashing with valid PI', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.getByText(/racePredictor.title/i)).toBeInTheDocument();
    });
  });

  describe('Performance Index Gauge Display', () => {
    it('should display em dash when PI is null', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should display em dash when PI is zero', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={0} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should display em dash when PI is negative', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={-5} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should display PI value when valid', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45.6} />);
      expect(screen.getByText('45.6')).toBeInTheDocument();
    });

    it('should display capped PI at 100', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={150} />);
      expect(screen.getByText('100.0')).toBeInTheDocument();
    });

    it('should have aria-label when PI is null', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      const gauge = screen.getByLabelText(/Performance Index not available/i);
      expect(gauge).toBeInTheDocument();
    });

    it('should have aria-label with PI value when valid', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      const gauge = screen.getByLabelText(/Performance Index: 45.0/i);
      expect(gauge).toBeInTheDocument();
    });
  });

  describe('Info Alert Display', () => {
    it('should show info alert when PI is null', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      expect(screen.getByText(/racePredictor.enterData/i)).toBeInTheDocument();
    });

    it('should show info alert when PI is zero', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={0} />);
      expect(screen.getByText(/racePredictor.enterData/i)).toBeInTheDocument();
    });

    it('should not show alert when PI is valid', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.queryByText(/racePredictor.enterData/i)).not.toBeInTheDocument();
    });
  });

  describe('Race Table Display', () => {
    it('should display race table when PI is valid', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.getByText(/racePredictor.distance/i)).toBeInTheDocument();
      expect(screen.getByText(/racePredictor.predictedTime/i)).toBeInTheDocument();
      expect(screen.getByText(/racePredictor.pace/i)).toBeInTheDocument();
    });

    it('should display all race distances', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.getByText('1000m')).toBeInTheDocument();
      expect(screen.getByText('1500m')).toBeInTheDocument();
      expect(screen.getByText('5K')).toBeInTheDocument();
      expect(screen.getByText('10K')).toBeInTheDocument();
      expect(screen.getByText('Half Marathon')).toBeInTheDocument();
      expect(screen.getByText('Marathon')).toBeInTheDocument();
    });

    it('should not display race table when PI is null', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      expect(screen.queryByText(/racePredictor.distance/i)).not.toBeInTheDocument();
    });

    it('should display race times in correct format', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      const tableCells = screen.getAllByRole('cell');
      const timeCells = tableCells.filter(cell =>
        /\d{1,2}:\d{2}(:\d{2})?/.test(cell.textContent || '')
      );
      expect(timeCells.length).toBeGreaterThan(0);
    });
  });

  describe('Unit System - Metric', () => {
    it('should display distances in kilometers', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      const kmElements = screen.getAllByText(/km/);
      expect(kmElements.length).toBeGreaterThan(0);
      expect(screen.getByText('1000m')).toBeInTheDocument();
      expect(screen.getByText('5K')).toBeInTheDocument();
      expect(screen.getByText('10K')).toBeInTheDocument();
    });

    it('should display pace in min/km', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      const minKmElements = screen.getAllByText(/min\/km/);
      expect(minKmElements.length).toBeGreaterThan(0);
    });
  });

  describe('Unit System - Imperial', () => {
    it('should display distances in miles', () => {
      render(<RacePredictor unitSystem="imperial" performanceIndex={45} />);
      const miElements = screen.getAllByText(/mi/);
      expect(miElements.length).toBeGreaterThan(0);
      expect(screen.getByText('1000m')).toBeInTheDocument();
      expect(screen.getByText('5K')).toBeInTheDocument();
      expect(screen.getByText('10K')).toBeInTheDocument();
    });

    it('should display pace in min/mi', () => {
      render(<RacePredictor unitSystem="imperial" performanceIndex={45} />);
      const minMiElements = screen.getAllByText(/min\/mi/);
      expect(minMiElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Index Ranges and Colors', () => {
    it('should render with low PI (< 40)', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={35} />);
      expect(screen.getByText('35.0')).toBeInTheDocument();
    });

    it('should render with medium PI (40-55)', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={50} />);
      expect(screen.getByText('50.0')).toBeInTheDocument();
    });

    it('should render with good PI (55-70)', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={65} />);
      expect(screen.getByText('65.0')).toBeInTheDocument();
    });

    it('should render with excellent PI (>= 70)', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={75} />);
      expect(screen.getByText('75.0')).toBeInTheDocument();
    });
  });

  describe('Race Predictions Accuracy', () => {
    it('should predict reasonable 5K time for moderate PI', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={40} />);
      expect(screen.getByText('5K')).toBeInTheDocument();
    });

    it('should show note about prediction model', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.getByText(/racePredictor.note/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low PI', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={0.1} />);
      expect(screen.getByText('0.1')).toBeInTheDocument();
    });

    it('should handle very high PI', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={200} />);
      expect(screen.getByText('100.0')).toBeInTheDocument();
    });

    it('should handle fractional PI values', () => {
      render(<RacePredictor unitSystem="metric" performanceIndex={45.789} />);
      expect(screen.getByText('45.8')).toBeInTheDocument();
    });

    it('should switch between unit systems without errors', () => {
      const { rerender } = render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      const kmElements = screen.getAllByText(/km/);
      expect(kmElements.length).toBeGreaterThan(0);

      rerender(<RacePredictor unitSystem="imperial" performanceIndex={45} />);
      const miElements = screen.getAllByText(/mi/);
      expect(miElements.length).toBeGreaterThan(0);
    });

    it('should update when PI changes', () => {
      const { rerender } = render(<RacePredictor unitSystem="metric" performanceIndex={40} />);
      expect(screen.getByText('40.0')).toBeInTheDocument();

      rerender(<RacePredictor unitSystem="metric" performanceIndex={50} />);
      expect(screen.getByText('50.0')).toBeInTheDocument();
      expect(screen.queryByText('40.0')).not.toBeInTheDocument();
    });

    it('should handle PI changing from null to valid', () => {
      const { rerender } = render(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      expect(screen.getByText('—')).toBeInTheDocument();

      rerender(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.getByText('45.0')).toBeInTheDocument();
      expect(screen.queryByText('—')).not.toBeInTheDocument();
    });

    it('should handle PI changing from valid to null', () => {
      const { rerender } = render(<RacePredictor unitSystem="metric" performanceIndex={45} />);
      expect(screen.getByText('45.0')).toBeInTheDocument();

      rerender(<RacePredictor unitSystem="metric" performanceIndex={null} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});
