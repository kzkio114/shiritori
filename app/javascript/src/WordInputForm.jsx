// components/WordInputForm.js
import React, { useState } from 'react';

const WordInputForm = ({ handleSubmit }) => {
  const [newWord, setNewWord] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (newWord.trim() !== '') {
      handleSubmit(newWord);  // 親コンポーネントに単語を渡す
      setNewWord('');  // フォームをクリア
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={newWord}
        onChange={(e) => setNewWord(e.target.value)}
        placeholder="単語を入力"
      />
      <button type="submit">送信</button>
    </form>
  );
};

export default WordInputForm;
