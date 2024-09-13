import React from 'react';
import ShiritoriGame from './components/ShiritoriGame';  // ShiritoriGameコンポーネントをインポート

const App = ({ gameId, currentUser }) => {
  return (
    <div>
      <ShiritoriGame gameId={gameId} currentUser={currentUser} />
    </div>
  );
};

export default App;
