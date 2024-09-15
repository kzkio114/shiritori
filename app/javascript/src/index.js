import React from 'react';
import { createRoot } from 'react-dom/client';
import ShiritoriGame from './components/ShiritoriGame';

let root; // root を一度だけ初期化する変数

const mountReactApp = () => {
  const container = document.getElementById('root');
  
  if (container) {
    const gameId = container.getAttribute('data-game-id');
    const currentUser = container.getAttribute('data-current-user');

    // すでに root が存在している場合は再度 createRoot しない
    if (!root) {
      root = createRoot(container);
    }
    
    // すでに root が作成されているので render だけ行う
    root.render(<ShiritoriGame gameId={gameId} currentUser={currentUser} />);
  }
};

document.addEventListener('turbo:load', mountReactApp);
document.addEventListener('DOMContentLoaded', mountReactApp);
