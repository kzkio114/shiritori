import React from 'react';
import { createRoot } from 'react-dom/client';
import ShiritoriApp from './ShiritoriApp';

const mountReactApp = () => {
  const container = document.getElementById('root');
  if (container && !container.hasChildNodes()) {
    const gameId = container.getAttribute('data-game-id');
    const currentUser = container.getAttribute('data-current-user');
    const root = createRoot(container);
    root.render(<ShiritoriApp gameId={gameId} currentUser={currentUser} />);
  }
};

document.addEventListener('turbo:load', mountReactApp);
document.addEventListener('DOMContentLoaded', mountReactApp);
