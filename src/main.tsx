import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress cross-origin "Script error." which occurs when third-party iframes (like Disqus)
// throw errors inside sandboxed environments.
const originalOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (message === 'Script error.') {
    return true; // True prevents default error handling and overlay
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
};

window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true); // Use capture phase to intercept before React/Vite error boundaries

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
