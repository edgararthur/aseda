import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { offlineStorage } from '@/lib/offline-storage';

// Initialize offline storage (IndexedDB) early
offlineStorage.init();

// Register service worker for PWA with auto update
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
