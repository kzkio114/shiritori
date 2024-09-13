import React, { useState, useEffect } from 'react';
import consumer from '../../channels/consumer';
import axios from 'axios';

const ShiritoriGame = ({ gameId, currentUser }) => {
  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [name, setName] = useState(currentUser ? currentUser.name : '');  // currentUserがいる場合は名前を設定
  const [isNameSet, setIsNameSet] = useState(!!currentUser);  // 名前が設定されているかどうかをチェック
  const [errorMessage, setErrorMessage] = useState('');  // エラーメッセージ用の状態

  useEffect(() => {
    // ページロード時に過去の単語を取得
    axios.get(`/games/${gameId}/words`)
      .then(response => {
        setWords(response.data.words);
      })
      .catch(error => {
        console.error("単語の取得に失敗しました:", error);
      });

    if (isNameSet) {
      const subscription = consumer.subscriptions.create(
        { channel: "ShiritoriChannel", game_id: gameId },
        {
          received(data) {
            console.log('Received data:', data);  // デバッグ用
            if (data.action === 'create') {
              setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
            } else if (data.action === 'joined') {
              setMessages((prevMessages) => [...prevMessages, `${data.user} has joined the game.`]);
            } else if (data.action === 'left') {
              setMessages((prevMessages) => [...prevMessages, `${data.user} has left the game.`]);
            } else if (data.action === 'error') {
              console.error('エラーメッセージが届きました:', data.message);  // ここでエラーメッセージのログを出力
              // エラーメッセージを表示
              setErrorMessage(data.message || 'エラーが発生しました！');
            }
          }
        }
      );
  
      // コンポーネントがアンマウントされる際にWebSocketを解除
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [gameId, isNameSet]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== '') {
      setIsNameSet(true);  // 名前が設定されたことを記録
    }
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    
    if (newWord.trim() !== '') {
      setErrorMessage('');  // エラーメッセージをリセット
      
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
          {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}

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
