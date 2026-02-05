
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Previne o erro "Warning: You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before."
const globalRef = window as any;
if (!globalRef.reactRoot) {
    globalRef.reactRoot = ReactDOM.createRoot(rootElement);
}

globalRef.reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
