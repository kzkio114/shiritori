import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Turbo (Turbo Drive) がページを読み込んだときに実行されるイベントリスナー
document.addEventListener('turbo:load', () => {
    const container = document.getElementById('root');
    if (container && !container.hasChildNodes()) {
      const root = createRoot(container);
      root.render(<App />);
    }
  });