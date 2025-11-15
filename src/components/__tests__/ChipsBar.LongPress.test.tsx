import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChipsBar, ChipOption } from '../ChipsBar';

jest.useFakeTimers();

describe('ChipsBar long press acceleration', () => {
  it('repeats slowly then accelerates after 3s', () => {
    const onChipClick = jest.fn();
    const chips: ChipOption[] = [
      { label: '+5s', value: 5 },
    ];
    render(<ChipsBar chips={chips} onChipClick={(v) => onChipClick(v)} />);

    const chip = screen.getByText('+5s');

    // Start hold (pointer down). First invocation scheduled after initialDelay (600ms)
    fireEvent.pointerDown(chip);
    expect(onChipClick).toHaveBeenCalledTimes(0);

    // After initial delay -> first call
    act(() => { jest.advanceTimersByTime(600); });
    expect(onChipClick).toHaveBeenCalledTimes(1);

    // Advance 2 seconds (slow interval 500ms) -> should add 4 more calls (at 1100,1600,2100,2600 ms)
    act(() => { jest.advanceTimersByTime(2000); });
    expect(onChipClick).toHaveBeenCalledTimes(5);

    // Cross acceleration threshold (3000ms). We are at 2600+600(start) = 2600ms elapsed since pointerDown; need 400ms more to reach 3000ms.
    act(() => { jest.advanceTimersByTime(400); }); // no new call yet (next slow tick at 3100ms)
    // Next tick occurs at 3100ms -> +1 call
    act(() => { jest.advanceTimersByTime(100); });
    expect(onChipClick).toHaveBeenCalledTimes(6);

    // Now fast interval (120ms). Simulate 600ms -> 5 more calls
    act(() => { jest.advanceTimersByTime(600); });
    expect(onChipClick).toHaveBeenCalledTimes(11);

    // Release
    fireEvent.pointerUp(chip);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(onChipClick).toHaveBeenCalledTimes(11); // no further calls
  });
});
