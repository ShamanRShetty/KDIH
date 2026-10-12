import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Restore persisted font size preference
try {
  const savedFontSize = localStorage.getItem('nammasahaaya_fontsize');
  if (savedFontSize) {
    document.documentElement.style.fontSize = savedFontSize;
  }
} catch {
  // localStorage may be unavailable
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
