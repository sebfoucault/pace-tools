import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../RunningCalculator';

describe('RunningCalculator - Calculator Mode Toggle', () => {
  it('should render mode toggle with manual mode selected by default', () => {
    render(<RunningCalculator unitSystem="metric" />);
    const manualButton = screen.getByRole('button', { name: /manual mode/i });
    const autoButton = screen.getByRole('button', { name: /auto mode/i });
    expect(manualButton).toBeInTheDocument();
    expect(autoButton).toBeInTheDocument();
    expect(manualButton).toHaveClass('Mui-selected');
    expect(autoButton).not.toHaveClass('Mui-selected');
  });

  it('should switch to auto mode and back to manual', () => {
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
