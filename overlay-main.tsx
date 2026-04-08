import React from 'react';
import ReactDOM from 'react-dom/client';
import { OverlayWidget } from './views/OverlayWidget';

const rootElement = document.getElementById('overlay-root');

if (!rootElement) {
  throw new Error('Overlay root not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <OverlayWidget />
  </React.StrictMode>
);
