import React, { useState } from 'react';

function App() {
  const [text, setText] = useState('これはReactで生成されたテキストです!!');

  const handleClick = () => {
    setText('DaisyUIのボタンスタイルを使用しています!!');
  };

  return (
    <div className="p-4 bg-cream text-soft-black">
      <h1 className="text-3xl font-bold mb-4">{text}</h1>

      {/* DaisyUIのボタンスタイルを使用しています */}
      <button onClick={handleClick} className="btn btn-primary">
        ここをクリックしてください
      </button>
    </div>
  );
}

export default App;