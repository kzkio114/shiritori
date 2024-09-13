import React from 'react';
import { createRoot } from 'react-dom/client';
import ShiritoriGame from './components/ShiritoriGame';

const mountReactApp = () => {
  const container = document.getElementById('root');
  if (container && !container.hasChildNodes()) {
    const gameId = container.getAttribute('data-game-id');
    const currentUser = container.getAttribute('data-current-user');
    const root = createRoot(container);
    root.render(<ShiritoriGame gameId={gameId} currentUser={currentUser} />);
  }
};

document.addEventListener('turbo:load', mountReactApp);
document.addEventListener('DOMContentLoaded', mountReactApp);
