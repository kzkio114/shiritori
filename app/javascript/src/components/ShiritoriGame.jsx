import React, { useState, useEffect } from 'react';
import consumer from '../../channels/consumer';
import axios from 'axios';

const ShiritoriGame = ({ gameId, currentUser }) => {
  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [name, setName] = useState(currentUser ? currentUser.name : '');
  const [isNameSet, setIsNameSet] = useState(!!currentUser);
  const [errorMessages, setErrorMessages] = useState([]); // エラーメッセージ用の配列

  // WebSocketで受信する処理を定義
  const received = (data) => {
    console.log('Received data:', data); // 受け取ったデータを確認
    if (data.action === 'create') {
      setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
    } else if (data.action === 'joined') {
      setMessages((prevMessages) => [
        ...prevMessages, 
        { text: `${data.user} さんが参加しました.`, className: 'message-joined' }
      ]);
    } else if (data.action === 'left') {
      setMessages((prevMessages) => [
        ...prevMessages, 
        { text: `${data.user} さんが退出しました.`, className: 'message-left' }
      ]);
    } else if (data.action === 'error') {
      console.error('エラーメッセージが届きました:', data.messages || data.message);
      setMessages((prevMessages) => [
        ...prevMessages, 
        { text: data.message, className: 'message-error' }
      ]);
      
      if (Array.isArray(data.messages)) {
        setErrorMessages(data.messages);
      } else {
        setErrorMessages([data.message]);
      }
    }
  };

  useEffect(() => {
    // ページロード時に過去の単語を取得
    axios.get(`/games/${gameId}/words`)
      .then(response => {
        setWords(response.data.words);
      })
      .catch(error => {
        console.error("単語の取得に失敗しました:", error);
      });

    // WebSocketの購読を作成
    const subscription = consumer.subscriptions.create(
      { channel: "ShiritoriChannel", game_id: gameId },
      { received }
    );

    // コンポーネントがアンマウントされる際にWebSocketを解除
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== '') {
      setIsNameSet(true);
    }
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    
    if (newWord.trim() !== '') {
      setErrorMessages([]);  // エラーメッセージをリセット
      
      // 現在の購読からperformメソッドを呼び出す（適切なインデックスを使用）
      const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
      if (currentSubscription) {
        currentSubscription.perform("speak", { word: newWord });
      }
      setNewWord('');
    }
  };

  return (
    <div>
      {!isNameSet ? (
        <div className="modal">
          <form onSubmit={handleNameSubmit}>
            <h2>名前を入力してください</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前"
            />
            <button type="submit">参加する</button>
          </form>
        </div>
      ) : (
        <>
          <h2>しりとり (ゲームID: {gameId})</h2>

          {/* エラーメッセージがある場合は表示 */}
          {errorMessages.length > 0 && (
            <div className="error-messages">
              {errorMessages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}

          <ul>
            {messages.map((message, index) => (
              <li key={index} className={message.className}>{message.text}</li>
            ))}
          </ul>

          <ul>
            {words.map((entry, index) => (
              <li key={index}>{entry.user}: {entry.word}</li>
            ))}
          </ul>

          <form onSubmit={handleWordSubmit}>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="単語を入力"
            />
            <button type="submit">送信</button>
          </form>
        </>
      )}
    </div>
  );
};

export default ShiritoriGame;
