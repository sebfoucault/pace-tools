import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PerformanceGauge from '../PerformanceGauge';

describe('PerformanceGauge Component', () => {
  describe('Display Tests', () => {
    it('should render N/A when performance index is null', () => {
      render(<PerformanceGauge performanceIndex={null} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render N/A when performance index is zero', () => {
      render(<PerformanceGauge performanceIndex={0} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render N/A when performance index is negative', () => {
      render(<PerformanceGauge performanceIndex={-5} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display performance index value with one decimal place', () => {
      render(<PerformanceGauge performanceIndex={45.7} />);
      expect(screen.getByText('45.7')).toBeInTheDocument();
    });

    it('should round performance index to one decimal place', () => {
      render(<PerformanceGauge performanceIndex={45.678} />);
      expect(screen.getByText('45.7')).toBeInTheDocument();
    });

    it('should display low performance index correctly', () => {
      render(<PerformanceGauge performanceIndex={30} />);
      expect(screen.getByText('30.0')).toBeInTheDocument();
    });

    it('should display moderate performance index correctly', () => {
      render(<PerformanceGauge performanceIndex={50} />);
      expect(screen.getByText('50.0')).toBeInTheDocument();
    });

    it('should display good performance index correctly', () => {
      render(<PerformanceGauge performanceIndex={60} />);
      expect(screen.getByText('60.0')).toBeInTheDocument();
    });

    it('should display excellent performance index correctly', () => {
      render(<PerformanceGauge performanceIndex={75} />);
      expect(screen.getByText('75.0')).toBeInTheDocument();
    });

    it('should cap display at 100 for very high values', () => {
      render(<PerformanceGauge performanceIndex={150} />);
      expect(screen.getByText('100.0')).toBeInTheDocument();
    });
  });

  describe('SVG Rendering', () => {
    it('should render SVG gauge for valid performance index', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render SVG gauge when performance index is null', () => {
      const { container } = render(<PerformanceGauge performanceIndex={null} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should render background arc', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThanOrEqual(1);
    });

    it('should render filled arc for non-zero performance', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThanOrEqual(2);
    });

    it('should render inner circle decoration', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} />);
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have default aria-label for N/A state', () => {
      const { container } = render(<PerformanceGauge performanceIndex={null} />);
      const gauge = container.firstChild as HTMLElement;
      expect(gauge).toHaveAttribute('aria-label', 'Performance Index not available');
    });

    it('should have default aria-label with PI value', () => {
      const { container } = render(<PerformanceGauge performanceIndex={45.7} />);
      const gauge = container.firstChild as HTMLElement;
      expect(gauge).toHaveAttribute('aria-label', 'Performance Index: 45.7');
    });

    it('should use custom aria-label when provided', () => {
      const { container } = render(
        <PerformanceGauge performanceIndex={50} ariaLabel="Custom label" />
      );
      const gauge = container.firstChild as HTMLElement;
      expect(gauge).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should display tooltip when provided', () => {
      const { container } = render(
        <PerformanceGauge performanceIndex={50} tooltip="Test tooltip" />
      );
      const gauge = container.firstChild as HTMLElement;
      expect(gauge).toHaveAttribute('title', 'Test tooltip');
    });
  });

  describe('Size Prop', () => {
    it('should use default size of 80 when not specified', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} />);
      const svg = container.querySelector('svg')!;
      expect(svg).toHaveAttribute('width', '80');
      expect(svg).toHaveAttribute('height', '80');
    });

    it('should accept custom size', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} size={100} />);
      const svg = container.querySelector('svg')!;
      expect(svg).toHaveAttribute('width', '100');
      expect(svg).toHaveAttribute('height', '100');
    });

    it('should scale properly with custom size', () => {
      const { container } = render(<PerformanceGauge performanceIndex={50} size={120} />);
      const box = container.querySelector('[aria-label*="Performance Index"]') as HTMLElement;
      expect(box).toHaveStyle({ width: '120px', height: '120px' });
    });
  });

  describe('Color Coding', () => {
    it('should use red color for low performance (< 40)', () => {
      const { container } = render(<PerformanceGauge performanceIndex={35} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#f44336'
      );
      expect(filledPath).toBeInTheDocument();
    });

    it('should use orange color for moderate performance (40-54)', () => {
      const { container } = render(<PerformanceGauge performanceIndex={45} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#ff9800'
      );
      expect(filledPath).toBeInTheDocument();
    });

    it('should use blue color for good performance (55-69)', () => {
      const { container } = render(<PerformanceGauge performanceIndex={60} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#42a5f5'
      );
      expect(filledPath).toBeInTheDocument();
    });

    it('should use green color for excellent performance (>= 70)', () => {
      const { container } = render(<PerformanceGauge performanceIndex={75} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#4caf50'
      );
      expect(filledPath).toBeInTheDocument();
    });

    it('should use green for boundary value 70', () => {
      const { container } = render(<PerformanceGauge performanceIndex={70} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#4caf50'
      );
      expect(filledPath).toBeInTheDocument();
    });

    it('should use blue for boundary value 55', () => {
      const { container } = render(<PerformanceGauge performanceIndex={55} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#42a5f5'
      );
      expect(filledPath).toBeInTheDocument();
    });

    it('should use orange for boundary value 40', () => {
      const { container } = render(<PerformanceGauge performanceIndex={40} />);
      const paths = container.querySelectorAll('path');
      const filledPath = Array.from(paths).find(path =>
        path.getAttribute('stroke') === '#ff9800'
      );
      expect(filledPath).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum calibrated PI value (29)', () => {
      render(<PerformanceGauge performanceIndex={29} />);
      expect(screen.getByText('29.0')).toBeInTheDocument();
    });

    it('should handle maximum calibrated PI value (90)', () => {
      render(<PerformanceGauge performanceIndex={90} />);
      expect(screen.getByText('90.0')).toBeInTheDocument();
    });

    it('should handle PI below minimum calibration', () => {
      render(<PerformanceGauge performanceIndex={20} />);
      expect(screen.getByText('20.0')).toBeInTheDocument();
    });

    it('should handle PI above maximum calibration', () => {
      render(<PerformanceGauge performanceIndex={95} />);
      expect(screen.getByText('95.0')).toBeInTheDocument();
    });

    it('should handle very small positive values', () => {
      render(<PerformanceGauge performanceIndex={0.1} />);
      expect(screen.getByText('0.1')).toBeInTheDocument();
    });

    it('should handle decimal values near boundaries', () => {
      render(<PerformanceGauge performanceIndex={39.9} />);
      expect(screen.getByText('39.9')).toBeInTheDocument();
    });
  });

  describe('Real-world Performance Values', () => {
    it('should display beginner runner PI (~35)', () => {
      render(<PerformanceGauge performanceIndex={35} />);
      expect(screen.getByText('35.0')).toBeInTheDocument();
    });

    it('should display intermediate runner PI (~45)', () => {
      render(<PerformanceGauge performanceIndex={45} />);
      expect(screen.getByText('45.0')).toBeInTheDocument();
    });

    it('should display advanced runner PI (~60)', () => {
      render(<PerformanceGauge performanceIndex={60} />);
      expect(screen.getByText('60.0')).toBeInTheDocument();
    });

    it('should display elite runner PI (~75)', () => {
      render(<PerformanceGauge performanceIndex={75} />);
      expect(screen.getByText('75.0')).toBeInTheDocument();
    });

    it('should display world-class runner PI (~85)', () => {
      render(<PerformanceGauge performanceIndex={85} />);
      expect(screen.getByText('85.0')).toBeInTheDocument();
    });
  });
});
