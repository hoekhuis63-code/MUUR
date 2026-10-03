import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import { App } from './App';
import { initAnalytics, rememberSource } from './lib/claim';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import './index.css';

rememberSource();
initAnalytics();
inject(); // Vercel Web Analytics: cookieloos, alleen actief op Vercel

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
