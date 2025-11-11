import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeedPaceConverter from '../components/SpeedPaceConverter';

describe('SpeedPaceConverter', () => {
  test('renders without crashing', () => {
    render(<SpeedPaceConverter unitSystem="metric" />);
  });
});
