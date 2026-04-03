import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  // @ts-ignore
  globalThis.Buffer = Buffer;
  // @ts-ignore
  window.process = {
    env: { NODE_ENV: import.meta.env.MODE },
    version: '',
    nextTick: (cb: any) => setTimeout(cb, 0),
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
