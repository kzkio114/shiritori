import React from 'react';
import ShiritoriApp from './ShiritoriApp';  // ShiritoriAppコンポーネントをインポート

const App = ({ gameId, currentUser }) => {
  return (
    <div>
      <ShiritoriApp gameId={gameId} currentUser={currentUser} />
    </div>
  );
};

export default App;
