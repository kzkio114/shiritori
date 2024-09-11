import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';  // ShiritoriAppを含んだコンポーネント

// Turbo (Turbo Drive) がページを読み込んだときに実行されるイベントリスナー
document.addEventListener('turbo:load', () => {
  const container = document.getElementById('root');  // Reactコンポーネントをマウントするための<div id="root">
  
  if (container && !container.hasChildNodes()) {
    const gameId = container.getAttribute('data-game-id');  // データ属性からgameIdを取得
    const currentUser = container.getAttribute('data-current-user');  // データ属性からcurrentUserを取得
    
    const root = createRoot(container);
    root.render(<App gameId={gameId} currentUser={currentUser} />);  // Appにpropsとして渡す
  }
});
