import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsDialog from '../SettingsDialog';

// Override react-i18next to capture language changes in this file
const mockChangeLanguage = jest.fn();
jest.mock('react-i18next', () => {
  const original = jest.requireActual('react-i18next');
  return {
    ...original,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { changeLanguage: mockChangeLanguage },
    }),
  };
});

describe('SettingsDialog', () => {
  const onClose = jest.fn();
  const onUnitSystemChange = jest.fn();

  const renderDialog = (unitSystem: 'metric' | 'imperial' = 'metric') =>
    render(
      <SettingsDialog
        open={true}
        onClose={onClose}
        unitSystem={unitSystem}
        onUnitSystemChange={onUnitSystemChange}
      />
    );

  beforeEach(() => {
    onClose.mockClear();
    onUnitSystemChange.mockClear();
    mockChangeLanguage.mockClear();
  });

  it('renders title and sections when open', () => {
    renderDialog();

    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByText('app.changeLanguage')).toBeInTheDocument();
    expect(screen.getAllByText('settings.unitSystem')[0]).toBeInTheDocument();
  });

  it('invokes onClose when Done button is clicked', () => {
    renderDialog();
    const done = screen.getByRole('button', { name: 'common.done' });
    fireEvent.click(done);
    expect(onClose).toHaveBeenCalled();
  });

  it('changes language when a language item is clicked', () => {
    renderDialog();

    // Language items display human-readable names
    const frenchItem = screen.getByText('Français');
    fireEvent.click(frenchItem);

    expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
  });

  it('changes unit system via Select', () => {
    renderDialog('metric');

    // Open the unit system select (MUI Select renders with role combobox)
    const unitSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(unitSelect);

    // Choose imperial option
    const imperialOption = screen.getByRole('option', { name: 'settings.imperial' });
    fireEvent.click(imperialOption);

    expect(onUnitSystemChange).toHaveBeenCalledWith('imperial');
  });
});
