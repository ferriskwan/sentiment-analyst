import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress cross-origin "Script error." which occurs when third-party iframes (like Disqus)
// throw errors inside sandboxed environments.
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
