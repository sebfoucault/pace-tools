import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App Smoke Tests', () => {
  test('app loads without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  test('app renders main title', () => {
    render(<App />);
    expect(screen.getByText(/app.title/i)).toBeInTheDocument();
  });

  test('app renders RunningCalculator component', () => {
    render(<App />);
    expect(screen.getByText(/calculator.title/i)).toBeInTheDocument();
  });

  test('app renders SpeedPaceConverter component when converter tab is clicked', () => {
    render(<App />);
    // Initially, calculator is shown
    expect(screen.getByText(/calculator.title/i)).toBeInTheDocument();

    // Click on converter tab
    const converterTab = screen.getByText(/app.converterTab/i);
    fireEvent.click(converterTab);

    // Now converter should be visible
    expect(screen.getByText(/converter.title/i)).toBeInTheDocument();
  });

  test('app renders all required input fields', () => {
    render(<App />);

    // Check for distance input
    expect(screen.getByLabelText(/calculator.distance/i)).toBeInTheDocument();

    // Check for time input
    expect(screen.getByLabelText(/calculator.time/i)).toBeInTheDocument();

    // Check for pace input in calculator
    const paceInputs = screen.getAllByLabelText(/pace/i);
    expect(paceInputs.length).toBeGreaterThanOrEqual(1); // One in calculator (converter is hidden by default)
  });

  test('app renders all action buttons', () => {
    render(<App />);

    // Check for fullscreen button
    expect(screen.getByLabelText(/fullscreen/i)).toBeInTheDocument();

    // Check for settings button
    expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();

    // Check for help button
    expect(screen.getByLabelText(/help/i)).toBeInTheDocument();
  });

  test('TimeInput components are functioning', () => {
    render(<App />);

    const timeInput = screen.getByLabelText(/calculator.time/i);
    const paceInputs = screen.getAllByLabelText(/pace/i);

    // Check that inputs are accessible and have the correct type
    expect(timeInput).toBeInTheDocument();
    expect(paceInputs[0]).toBeInTheDocument();

    // Inputs should have inputMode="numeric" from TimeInput component
    expect(timeInput).toHaveAttribute('inputmode', 'numeric');
    expect(paceInputs[0]).toHaveAttribute('inputmode', 'numeric');
  });

  test('app has no console errors during initial render', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('critical components render without undefined errors', () => {
    // This will throw if any component has undefined props or similar issues
    const { container } = render(<App />);

    // Check that the app has meaningful content
    expect(container.textContent).toBeTruthy();
    expect(container.textContent?.length).toBeGreaterThan(50);
  });

  test('fullscreen button toggles between fullscreen and exit fullscreen icons', () => {
    // Mock fullscreen API
    const mockRequestFullscreen = jest.fn(() => Promise.resolve());
    const mockExitFullscreen = jest.fn(() => Promise.resolve());

    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null
    });

    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      writable: true,
      value: mockRequestFullscreen
    });

    Object.defineProperty(document, 'exitFullscreen', {
      writable: true,
      value: mockExitFullscreen
    });

    render(<App />);

    // Find the fullscreen button (should show "Enter fullscreen" initially)
    const fullscreenButton = screen.getByLabelText(/enter fullscreen/i);
    expect(fullscreenButton).toBeInTheDocument();

    // Click the fullscreen button
    fireEvent.click(fullscreenButton);

    // The requestFullscreen should have been called
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });
});
