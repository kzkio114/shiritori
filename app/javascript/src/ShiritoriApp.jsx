import React, { useState, useEffect } from 'react';
import consumer from '../channels/consumer';  // consumer.jsをインポート

const ShiritoriApp = ({ gameId, currentUser }) => {
  const [words, setWords] = useState([]);  // 単語のリスト
  const [messages, setMessages] = useState([]);  // ユーザー参加/離脱メッセージ
  const [newWord, setNewWord] = useState('');  // 新しい単語の入力フィールド

  useEffect(() => {
    // ActionCableでShiritoriChannelに接続
    const subscription = consumer.subscriptions.create(
      { channel: "ShiritoriChannel", game_id: gameId },
      {
        received(data) {
          // ActionCableでサーバーから受信したデータに基づき処理
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

    // コンポーネントがアンマウントされるときに接続を解除
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // WebSocket経由でサーバーに新しい単語を送信
    consumer.subscriptions.create({ channel: "ShiritoriChannel", game_id: gameId }).perform("speak", { word: newWord });
    setNewWord('');  // 入力フィールドをクリア
  };

  return (
    <div>
      <h2>しりとり (ゲームID: {gameId})</h2>
      
      {/* ユーザー参加/離脱メッセージを表示 */}
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>

      {/* しりとりの単語を表示 */}
      <ul>
        {words.map((entry, index) => (
          <li key={index}>{entry.user}: {entry.word}</li>
        ))}
      </ul>

      {/* 新しい単語の入力フィールド */}
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
