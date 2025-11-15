import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChipsBar, type ChipOption } from '../ChipsBar';

describe('ChipsBar', () => {
  const mockOnChipClick = jest.fn();

  beforeEach(() => {
    mockOnChipClick.mockClear();
  });

  describe('rendering', () => {
    it('should render all chips with correct labels', () => {
      const chips: ChipOption[] = [
        { label: '5k', value: 5 },
        { label: '10k', value: 10 },
        { label: '21k', value: 21.0975 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      expect(screen.getByText('5k')).toBeInTheDocument();
      expect(screen.getByText('10k')).toBeInTheDocument();
      expect(screen.getByText('21k')).toBeInTheDocument();
    });

    it('should render chips with string values', () => {
      const chips: ChipOption[] = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('should render empty chips bar when no chips provided', () => {
      const { container } = render(<ChipsBar chips={[]} onChipClick={mockOnChipClick} />);

      const chipsContainer = container.querySelector('.MuiStack-root');
      expect(chipsContainer).toBeInTheDocument();
      expect(chipsContainer?.children.length).toBe(0);
    });

    it('should render with outlined variant by default', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-outlined');
    });

    it('should render with medium size', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeMedium');
    });
  });

  describe('click behavior', () => {
    it('should call onChipClick with correct value when chip is clicked', () => {
      const chips: ChipOption[] = [
        { label: '5k', value: 5 },
        { label: '10k', value: 10 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('5k'));
      expect(mockOnChipClick).toHaveBeenCalledWith(5);

      fireEvent.click(screen.getByText('10k'));
      expect(mockOnChipClick).toHaveBeenCalledWith(10);
    });

    it('should call onChipClick with string value', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 'test-value' }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('Test'));
      expect(mockOnChipClick).toHaveBeenCalledWith('test-value');
    });

    it('should call onChipClick with decimal value', () => {
      const chips: ChipOption[] = [{ label: 'Half Marathon', value: 21.0975 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('Half Marathon'));
      expect(mockOnChipClick).toHaveBeenCalledWith(21.0975);
    });

    it('should handle multiple clicks on same chip', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      const chip = screen.getByText('Test');
      fireEvent.click(chip);
      fireEvent.click(chip);
      fireEvent.click(chip);

      expect(mockOnChipClick).toHaveBeenCalledTimes(3);
    });

    it('should handle clicks on different chips', () => {
      const chips: ChipOption[] = [
        { label: 'A', value: 1 },
        { label: 'B', value: 2 },
        { label: 'C', value: 3 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('A'));
      fireEvent.click(screen.getByText('C'));
      fireEvent.click(screen.getByText('B'));

      expect(mockOnChipClick).toHaveBeenCalledTimes(3);
      expect(mockOnChipClick).toHaveBeenNthCalledWith(1, 1);
      expect(mockOnChipClick).toHaveBeenNthCalledWith(2, 3);
      expect(mockOnChipClick).toHaveBeenNthCalledWith(3, 2);
    });
  });

  describe('disabled state', () => {
    it('should disable all chips when disabled prop is true', () => {
      const chips: ChipOption[] = [
        { label: '5k', value: 5 },
        { label: '10k', value: 10 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} disabled={true} />);

      const chip1 = screen.getByText('5k').closest('.MuiChip-root');
      const chip2 = screen.getByText('10k').closest('.MuiChip-root');

      expect(chip1).toHaveClass('Mui-disabled');
      expect(chip2).toHaveClass('Mui-disabled');
    });

    it('should not call onChipClick when disabled chip is clicked', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} disabled={true} />);

      fireEvent.click(screen.getByText('Test'));
      expect(mockOnChipClick).not.toHaveBeenCalled();
    });

    it('should apply disabled styling when disabled', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} disabled={true} />);

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      // Chip should have disabled class/styling
      expect(chip).toBeInTheDocument();
    });

    it('should apply normal styling when not disabled', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} disabled={false} />);

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('selected state', () => {
    it('should highlight selected chip with numeric value', () => {
      const chips: ChipOption[] = [
        { label: '5k', value: 5 },
        { label: '10k', value: 10 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue={5} />);

      const selectedChip = screen.getByText('5k').closest('.MuiChip-root');
      const unselectedChip = screen.getByText('10k').closest('.MuiChip-root');

      expect(selectedChip).toHaveClass('MuiChip-filled');
      expect(selectedChip).toHaveClass('MuiChip-colorPrimary');
      expect(unselectedChip).toHaveClass('MuiChip-outlined');
    });

    it('should highlight selected chip with string value', () => {
      const chips: ChipOption[] = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue="a" />);

      const selectedChip = screen.getByText('Option A').closest('.MuiChip-root');
      expect(selectedChip).toHaveClass('MuiChip-filled');
    });

    it('should match selected value with string comparison', () => {
      const chips: ChipOption[] = [{ label: '10k', value: 10 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue="10" />);

      const chip = screen.getByText('10k').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-filled');
    });

    it('should not highlight any chip when selectedValue does not match', () => {
      const chips: ChipOption[] = [
        { label: '5k', value: 5 },
        { label: '10k', value: 10 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue={15} />);

      const chip1 = screen.getByText('5k').closest('.MuiChip-root');
      const chip2 = screen.getByText('10k').closest('.MuiChip-root');

      expect(chip1).toHaveClass('MuiChip-outlined');
      expect(chip2).toHaveClass('MuiChip-outlined');
    });

    it('should not highlight when selectedValue is undefined', () => {
      const chips: ChipOption[] = [{ label: '5k', value: 5 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue={undefined} />);

      const chip = screen.getByText('5k').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-outlined');
    });

    it('should apply gradient background to selected chip', () => {
      const chips: ChipOption[] = [{ label: '5k', value: 5 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue={5} />);

      const chip = screen.getByText('5k').closest('.MuiChip-root');
      expect(chip).toHaveStyle({
        background: 'linear-gradient(90deg, #1b2a41 0%, #324a5f 100%)',
      });
    });
  });

  describe('variant prop', () => {
    it('should use filled variant for non-selected chips when specified', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} variant="filled" />);

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-filled');
    });

    it('should use outlined variant for non-selected chips when specified', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} variant="outlined" />);

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-outlined');
    });

    it('should override variant for selected chip', () => {
      const chips: ChipOption[] = [{ label: 'Test', value: 1 }];

      render(
        <ChipsBar
          chips={chips}
          onChipClick={mockOnChipClick}
          variant="outlined"
          selectedValue={1}
        />
      );

      const chip = screen.getByText('Test').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-filled');
    });
  });

  describe('layout', () => {
    it('should render chips in a horizontal stack', () => {
      const chips: ChipOption[] = [
        { label: 'A', value: 1 },
        { label: 'B', value: 2 },
      ];

      const { container } = render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toHaveStyle({ flexDirection: 'row' });
    });

    it('should allow wrapping for many chips', () => {
      const chips: ChipOption[] = Array.from({ length: 10 }, (_, i) => ({
        label: `Chip ${i}`,
        value: i,
      }));

      const { container } = render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      const stack = container.querySelector('.MuiStack-root');
      expect(stack).toHaveStyle({ flexWrap: 'wrap' });
    });
  });

  describe('edge cases', () => {
    it('should handle negative values', () => {
      const chips: ChipOption[] = [
        { label: '-60s', value: -60 },
        { label: '-30s', value: -30 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('-60s'));
      expect(mockOnChipClick).toHaveBeenCalledWith(-60);
    });

    it('should handle zero value', () => {
      const chips: ChipOption[] = [{ label: 'Zero', value: 0 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} selectedValue={0} />);

      const chip = screen.getByText('Zero').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-filled');
    });

    it('should handle very large numbers', () => {
      const chips: ChipOption[] = [{ label: 'Large', value: 999999 }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('Large'));
      expect(mockOnChipClick).toHaveBeenCalledWith(999999);
    });

    it('should handle duplicate labels with different values', () => {
      const chips: ChipOption[] = [
        { label: 'Same', value: 1 },
        { label: 'Same', value: 2 },
      ];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      const sameChips = screen.getAllByText('Same');
      expect(sameChips).toHaveLength(2);

      fireEvent.click(sameChips[0]);
      expect(mockOnChipClick).toHaveBeenCalledWith(1);

      fireEvent.click(sameChips[1]);
      expect(mockOnChipClick).toHaveBeenCalledWith(2);
    });

    it('should handle empty string values', () => {
      const chips: ChipOption[] = [{ label: 'Empty', value: '' }];

      render(<ChipsBar chips={chips} onChipClick={mockOnChipClick} />);

      fireEvent.click(screen.getByText('Empty'));
      expect(mockOnChipClick).toHaveBeenCalledWith('');
    });
  });
});
