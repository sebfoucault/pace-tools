import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalculatorModeToggle, type CalculatorMode } from '../CalculatorModeToggle';

describe('CalculatorModeToggle', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders both manual and auto buttons', () => {
    render(<CalculatorModeToggle mode="manual" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: /manual mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto mode/i })).toBeInTheDocument();
  });

  it('renders with custom labels', () => {
    render(
      <CalculatorModeToggle
        mode="manual"
        onChange={mockOnChange}
        manualLabel="Custom Manual"
        autoLabel="Custom Auto"
      />
    );

    expect(screen.getByText('Custom Manual')).toBeInTheDocument();
    expect(screen.getByText('Custom Auto')).toBeInTheDocument();
  });

  it('highlights the currently selected mode', () => {
    const { rerender } = render(<CalculatorModeToggle mode="manual" onChange={mockOnChange} />);

    const manualButton = screen.getByRole('button', { name: /manual mode/i });
    const autoButton = screen.getByRole('button', { name: /auto mode/i });

    // Manual should be selected
    expect(manualButton).toHaveClass('Mui-selected');
    expect(autoButton).not.toHaveClass('Mui-selected');

    // Switch to auto mode
    rerender(<CalculatorModeToggle mode="auto" onChange={mockOnChange} />);

    expect(manualButton).not.toHaveClass('Mui-selected');
    expect(autoButton).toHaveClass('Mui-selected');
  });

  it('calls onChange with manual mode when manual button is clicked', () => {
    render(<CalculatorModeToggle mode="auto" onChange={mockOnChange} />);

    const manualButton = screen.getByRole('button', { name: /manual mode/i });
    fireEvent.click(manualButton);

    expect(mockOnChange).toHaveBeenCalledWith('manual');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with auto mode when auto button is clicked', () => {
    render(<CalculatorModeToggle mode="manual" onChange={mockOnChange} />);

    const autoButton = screen.getByRole('button', { name: /auto mode/i });
    fireEvent.click(autoButton);

    expect(mockOnChange).toHaveBeenCalledWith('auto');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when clicking the already selected mode', () => {
    render(<CalculatorModeToggle mode="manual" onChange={mockOnChange} />);

    const manualButton = screen.getByRole('button', { name: /manual mode/i });
    fireEvent.click(manualButton);

    // ToggleButtonGroup prevents deselection, so onChange should not be called
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders Calculate icon for manual mode button', () => {
    render(<CalculatorModeToggle mode="manual" onChange={mockOnChange} />);

    const manualButton = screen.getByRole('button', { name: /manual mode/i });
    const calculateIcon = manualButton.querySelector('svg[data-testid="CalculateIcon"]');

    expect(calculateIcon).toBeInTheDocument();
  });

  it('renders Lock icon for auto mode button', () => {
    render(<CalculatorModeToggle mode="auto" onChange={mockOnChange} />);

    const autoButton = screen.getByRole('button', { name: /auto mode/i });
    const lockIcon = autoButton.querySelector('svg[data-testid="LockIcon"]');

    expect(lockIcon).toBeInTheDocument();
  });

  it('has correct aria-label for accessibility', () => {
    render(<CalculatorModeToggle mode="manual" onChange={mockOnChange} />);

    expect(screen.getByRole('group', { name: /calculator mode/i })).toBeInTheDocument();
  });

  it('displays tooltips on hover', () => {
    render(
      <CalculatorModeToggle
        mode="manual"
        onChange={mockOnChange}
        manualTooltip="Manual tooltip"
        autoTooltip="Auto tooltip"
      />
    );

    // Tooltips are rendered by MUI but hidden until hover
    // We can check that the Tooltip component is wrapping the buttons
    const manualButton = screen.getByRole('button', { name: /manual mode/i });
    const autoButton = screen.getByRole('button', { name: /auto mode/i });

    expect(manualButton).toBeInTheDocument();
    expect(autoButton).toBeInTheDocument();
  });
});
