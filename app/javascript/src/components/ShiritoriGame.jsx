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

  useEffect(() => {
    // サーバーから過去の単語を取得
    axios.get(`/games/${gameId}/words`)
      .then((response) => {
        setWords(response.data.words);
      })
      .catch((error) => {
        console.error("単語の取得に失敗しました:", error);
      });

    // 名前が設定されている場合にActionCableを使って接続
    if (isNameSet) {
      const subscription = consumer.subscriptions.create(
        { channel: "ShiritoriChannel", game_id: gameId },
        {
          received(data) {
            console.log("Received data:", data);
            console.error("エラーメッセージが届きました:", data.messages);
            if (data.action === "create") {
              setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
            } else if (data.action === "joined") {
              setMessages((prevMessages) => [...prevMessages, `${data.user} has joined the game.`]);
            } else if (data.action === "left") {
              setMessages((prevMessages) => [...prevMessages, `${data.user} has left the game.`]);
            } else if (data.action === "error") {
              console.log(errorMessages);
              console.error("エラーメッセージが届きました:", data.messages)

              // data.messagesが存在する場合はそれを使う
              if (Array.isArray(data.messages) && data.messages.length > 0) {
                setErrorMessages(data.messages);
              } else {
                setErrorMessages([]);  // エラーメッセージがない場合はリセット
              }
            }
          }
        }
      );

      return () => {
        subscription.unsubscribe(); // コンポーネントのアンマウント時にWebSocketを解除
      };
    }
  }, [gameId, isNameSet]);

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
            <div className="text-purple-700 font-bold">
              {errorMessages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}

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
