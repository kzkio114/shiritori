import React, { useState, useEffect } from 'react';
import consumer from '../channels/consumer';

const ShiritoriApp = ({ gameId, currentUser }) => {
  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');

  useEffect(() => {
    const subscription = consumer.subscriptions.create(
      { channel: "ShiritoriChannel", game_id: gameId },
      {
        received(data) {
          if (data.action === 'create') {
            setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
          } else if (data.action === 'joined') {
            setMessages((prevMessages) => [...prevMessages, `${data.user} has joined the game.`]);
          } else if (data.action === 'left') {
            setMessages((prevMessages) => [...prevMessages, `${data.user} has left the game.`]);
          }
        }
      }
    );
  
   
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
   
    if (newWord.trim() !== "") {
      consumer.subscriptions.subscriptions[0].perform("speak", { word: newWord });
    }
    setNewWord('');
  };

  return (
    <div>
      <h2>しりとり (ゲームID: {gameId})</h2>

      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>

      <ul>
        {words.map((entry, index) => (
          <li key={index}>{entry.user}: {entry.word}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="単語を入力"
        />
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default ShiritoriApp;
