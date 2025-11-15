import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpDialog from '../HelpDialog';

// react-i18next is globally mocked in setupTests to return keys

describe('HelpDialog', () => {
  const onClose = jest.fn();

  const renderDialog = () =>
    render(<HelpDialog open={true} onClose={onClose} />);

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders title and sections when open', () => {
    renderDialog();

    expect(screen.getByText('help.title')).toBeInTheDocument();

    // Main sections headings (render keys due to mock)
    expect(screen.getByText('help.manualCalculation')).toBeInTheDocument();
    expect(screen.getByText('help.autoCalculation')).toBeInTheDocument();
    expect(screen.getByText('help.timeFormats')).toBeInTheDocument();
    expect(screen.getByText('help.racePredictor')).toBeInTheDocument();
    expect(screen.getByText('help.tips')).toBeInTheDocument();
  });

  it('invokes onClose when close icon is clicked', () => {
    renderDialog();

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the action button and calls onClose when clicked', () => {
    renderDialog();

    const actionButton = screen.getByRole('button', { name: 'common.close' });
    fireEvent.click(actionButton);
    expect(onClose).toHaveBeenCalled();
  });
});
