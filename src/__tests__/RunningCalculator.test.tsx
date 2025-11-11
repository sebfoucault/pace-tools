import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunningCalculator from '../components/RunningCalculator';

describe('RunningCalculator', () => {
  test('renders without crashing', () => {
    render(<RunningCalculator unitSystem="metric" />);
  });
});
