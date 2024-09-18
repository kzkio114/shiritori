import React from 'react';
import ShiritoriGame from './components/ShiritoriGame';  // ShiritoriGameコンポーネントをインポート

const App = ({ gameId, currentUser }) => {
  console.log('Current User:', currentUser); // ここでcurrentUserが正しく渡されているか確認
  return (
    <div>
      <ShiritoriGame gameId={gameId} currentUser={currentUser} />
    </div>
  );
};

export default App;
