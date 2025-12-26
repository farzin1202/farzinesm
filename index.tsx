import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We use a specific ID to avoid conflicts in WordPress Admin
const rootId = 'fxanalytics-root';
const rootElement = document.getElementById(rootId);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error(`FxAnalytics: Could not find element with id '${rootId}'`);
}