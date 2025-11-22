import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service worker registration is handled by `vite-plugin-pwa` and
// by `virtual:pwa-register/react` (used in `UpdateSnackbar`).

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
