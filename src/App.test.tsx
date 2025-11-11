import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('app renders without crashing', () => {
  render(<App />);
});
