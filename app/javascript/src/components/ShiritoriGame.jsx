import React, { useState, useEffect } from 'react';
import consumer from '../../channels/consumer';
import axios from 'axios';

const ShiritoriGame = ({ gameId }) => {
  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]); // エラーメッセージ用の配列

  // WebSocketで受信する処理を定義
  const received = (data) => {
    console.log('Received data:', data); // 受け取ったデータを確認
    if (data.action === 'create') {
      setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
    } else if (data.action === 'joined') {
      if (data.user && data.user.trim() !== '') {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `${data.user} さんが参加しました。`, className: 'message-joined' }
        ]);
      }
    } else if (data.action === 'left') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.user} さんが退出しました。`, className: 'message-left' }
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
    const username = name.trim();

    if (username === '') {
      setErrorMessages(['名前を入力してください']);
      return;
    }

    const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
    if (currentSubscription) {
      currentSubscription.perform("join", { user: username });
    }
    setIsNameSet(true);  // 名前がセットされた状態にする
    setErrorMessages([]); // エラーメッセージをクリア
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();

    if (newWord.trim() !== '') {
      setErrorMessages([]);  // エラーメッセージをリセット

      const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
      if (currentSubscription) {
        currentSubscription.perform("speak", { word: newWord });
      }
      setNewWord('');  // 入力フィールドをクリア
    }
  };

  return (
    <div>
      {!isNameSet ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <form onSubmit={handleNameSubmit} className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">名前をしてください</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前"
              className="border border-gray-300 p-2 rounded w-full mb-4"
            />
            {errorMessages.length > 0 ? (
              <div className="error-messages text-red-500 mb-4">
                {errorMessages.map((message, index) => (
                  <p key={index}>{message}</p>
                ))}
              </div>
            ) : (
              <div className="error-messages mb-4" style={{ minHeight: '20px'}}>
              </div>
            )}
            <button type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              参加する
            </button>
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