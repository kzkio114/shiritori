// components/NameInputModal.js
import React, { useState } from 'react';

const NameInputModal = ({ setName, setIsNameSet }) => {
  const [name, setNameLocal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== '') {
      setName(name);  // 親コンポーネントに名前を渡す
      setIsNameSet(true);  // 名前が設定されたことを親コンポーネントに伝える
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>名前を入力してください</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setNameLocal(e.target.value)}
          placeholder="名前"
        />
        <button type="submit">参加する</button>
      </form>
    </div>
  );
};

export default NameInputModal;
