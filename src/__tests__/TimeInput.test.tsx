import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeInput from '../components/TimeInput';

describe('TimeInput Component Tests', () => {
  test('renders without crashing', () => {
    const mockOnChange = jest.fn();
    expect(() =>
      render(<TimeInput value="" onChange={mockOnChange} label="Test" />)
    ).not.toThrow();
  });

  test('displays initial value', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="5:30" onChange={mockOnChange} label="Pace" />);

    const input = screen.getByLabelText(/pace/i);
    expect(input).toHaveValue('5:30');
  });

  test('formats digits automatically (pace format)', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Pace" maxSegments={2} />);

    const input = screen.getByLabelText(/pace/i);

    // Type "530"
    fireEvent.change(input, { target: { value: '530' } });

    // Should be formatted as "5:30"
    expect(mockOnChange).toHaveBeenCalledWith('5:30');
  });

  test('formats digits automatically (time format)', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Time" maxSegments={3} />);

    const input = screen.getByLabelText(/time/i);

    // Type "12530"
    fireEvent.change(input, { target: { value: '12530' } });

    // Should be formatted as "1:25:30"
    expect(mockOnChange).toHaveBeenCalledWith('1:25:30');
  });

  test('strips non-numeric characters', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Pace" maxSegments={2} />);

    const input = screen.getByLabelText(/pace/i);

    // Type "5abc30"
    fireEvent.change(input, { target: { value: '5abc30' } });

    // Should only keep digits and format as "5:30"
    expect(mockOnChange).toHaveBeenCalledWith('5:30');
  });

  test('handles empty input', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="5:30" onChange={mockOnChange} label="Pace" maxSegments={2} />);

    const input = screen.getByLabelText(/pace/i);

    // Clear the input
    fireEvent.change(input, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  test('preserves programmatically set values with colons', () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(
      <TimeInput value="" onChange={mockOnChange} label="Time" maxSegments={3} />
    );

    // Simulate a calculated value being set
    rerender(<TimeInput value="50:00" onChange={mockOnChange} label="Time" maxSegments={3} />);

    const input = screen.getByLabelText(/time/i);
    expect(input).toHaveValue('50:00');
  });

  test('respects maxSegments prop for pace (2 segments)', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Pace" maxSegments={2} />);

    const input = screen.getByLabelText(/pace/i);

    // Try to type more than 4 digits
    fireEvent.change(input, { target: { value: '123456' } });

    // Should limit to 4 digits: "12:34"
    expect(mockOnChange).toHaveBeenCalledWith('12:34');
  });

  test('respects maxSegments prop for time (3 segments)', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Time" maxSegments={3} />);

    const input = screen.getByLabelText(/time/i);

    // Type 6 digits
    fireEvent.change(input, { target: { value: '123456' } });

    // Should format as HH:MM:SS: "12:34:56"
    expect(mockOnChange).toHaveBeenCalledWith('12:34:56');
  });

  test('respects maxSegments prop for precise time (4 segments)', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Time" maxSegments={4} />);

    const input = screen.getByLabelText(/time/i);

    // Type 7 digits
    fireEvent.change(input, { target: { value: '1234567' } });

    // Should format as HH:MM:SS:d: "12:34:56:7"
    expect(mockOnChange).toHaveBeenCalledWith('12:34:56:7');
  });

  test('has numeric input mode for mobile keyboards', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Pace" />);

    const input = screen.getByLabelText(/pace/i);
    expect(input).toHaveAttribute('inputmode', 'numeric');
  });

  test('updates display when value prop changes', () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(
      <TimeInput value="5:00" onChange={mockOnChange} label="Pace" maxSegments={2} />
    );

    const input = screen.getByLabelText(/pace/i);
    expect(input).toHaveValue('5:00');

    // Update the value prop
    rerender(<TimeInput value="6:30" onChange={mockOnChange} label="Pace" maxSegments={2} />);

    expect(input).toHaveValue('6:30');
  });

  test('handles partial input gracefully', () => {
    const mockOnChange = jest.fn();
    render(<TimeInput value="" onChange={mockOnChange} label="Pace" maxSegments={2} />);

    const input = screen.getByLabelText(/pace/i);

    // Type single digit
    fireEvent.change(input, { target: { value: '5' } });
    expect(mockOnChange).toHaveBeenCalledWith('5');

    // Type two digits
    fireEvent.change(input, { target: { value: '53' } });
    expect(mockOnChange).toHaveBeenCalledWith('5:3');
  });

  test('component does not cause infinite re-render loop', () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(
      <TimeInput value="" onChange={mockOnChange} label="Pace" maxSegments={2} />
    );

    // Update with same value multiple times
    for (let i = 0; i < 5; i++) {
      rerender(<TimeInput value="5:30" onChange={mockOnChange} label="Pace" maxSegments={2} />);
    }

    // Should not cause any errors or excessive re-renders
    const input = screen.getByLabelText(/pace/i);
    expect(input).toHaveValue('5:30');
  });
});
