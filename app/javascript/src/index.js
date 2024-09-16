import React from 'react';
import { createRoot } from 'react-dom/client';
import ShiritoriGame from './components/ShiritoriGame';

let root;

const mountReactApp = () => {
  const container = document.getElementById('root');
  
  if (container) {
    const gameId = container.getAttribute('data-game-id');
    const currentUser = container.getAttribute('data-current-user');

    console.log("Game ID:", gameId); // ログを追加して確認
    console.log("Current User:", currentUser); // currentUserが正しく取得されているか確認

    if (!root) {
      root = createRoot(container);
    }
    
    root.render(<ShiritoriGame gameId={gameId} currentUser={currentUser} />);
  }
};

document.addEventListener('turbo:load', mountReactApp);
document.addEventListener('DOMContentLoaded', mountReactApp);

