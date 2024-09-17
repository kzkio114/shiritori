import React, { useState, useEffect } from 'react';
import consumer from '../../channels/consumer';
import axios from 'axios';

const getCSRFToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta && meta.getAttribute('content');
};

const ShiritoriGame = ({ gameId, initialCurrentUser }) => {
  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [name, setName] = useState(initialCurrentUser || '');
  const [isNameSet, setIsNameSet] = useState(!!initialCurrentUser);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLost, setIsLost] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameDeleted, setGameDeleted] = useState(false);
  const [loser, setLoser] = useState('');
  const [showModal, setShowModal] = useState(!isNameSet); // 新たにshowModalステートを定義

  const csrfToken = getCSRFToken();

  useEffect(() => {
    axios.get(`/games/${gameId}/words`, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    .then(response => {
      setWords(response.data.words);
    })
    .catch(error => {
      console.error("単語の取得に失敗しました:", error);
    });

    const subscription = consumer.subscriptions.create(
      { channel: "ShiritoriChannel", game_id: gameId },
      { received }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, csrfToken]);

  const received = (data) => {
    if (data.action === 'create') {
      setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
    } else if (data.action === 'joined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.user} さんが参加しました。`, className: 'message-joined text-green-500' }
      ]);
    } else if (data.action === 'left') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.user} さんが退出しました。`, className: 'message-left text-gray-500' }
      ]);
    } else if (data.action === 'error') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.message, className: 'message-error text-yellow-500' }
      ]);
      setErrorMessages(Array.isArray(data.messages) ? data.messages : [data.message]);
    } else if (data.action === 'lose') {
      setLoser(data.user);
      if (data.user === name) {
        setIsLost(true);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `${data.user} さんが負けました。`, className: 'message-lose text-green-500' }
        ]);
      }
    } else if (data.action === 'game_end') {
      setGameEnded(true);
    } else if (data.action === 'game_deleted') {
      setGameDeleted(true);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const username = name.trim();
    if (username === '') {
      setErrorMessages(['名前を入力してください']);
      return;
    }

    setIsNameSet(true);
    setErrorMessages([]);

    const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
    if (currentSubscription) {
      currentSubscription.perform("join", { user: username });
    } else {
      consumer.subscriptions.create(
        { channel: "ShiritoriChannel", game_id: gameId },
        { received }
      );
    }
    setShowModal(false);  // モーダルを閉じる
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    if (newWord.trim() !== '') {
      setErrorMessages([]);
      const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
      if (currentSubscription) {
        currentSubscription.perform("speak", { word: newWord });
      }
      setNewWord('');
    }
  };

  const handleGameRestart = () => {
    setMessages([]);
    setWords([]);
    setGameEnded(false);
    setIsLost(false); // 負けた状態をリセット
    setLoser('');     // 負けたユーザー名もリセット
  };

  const handleGameEnd = () => {
    axios.delete(`/games/${gameId}`, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    .then(() => {
      window.location.href = '/';
    })
    .catch(error => {
      console.error("ゲームの削除に失敗しました:", error);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {!isNameSet && showModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <form onSubmit={handleNameSubmit} className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">名前を入力してください</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前"
              className="border border-gray-300 p-2 rounded w-full mb-4"
            />
            {errorMessages.length > 0 && (
              <div className="error-messages text-red-500 mb-4">
                {errorMessages.map((message, index) => (
                  <p key={index}>{message}</p>
                ))}
              </div>
            )}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              参加する
            </button>
          </form>
        </div>
      ) : (
        <>
          <h2 className="bg-teal-500 text-white p-6 rounded-lg shadow-md text-xl font-bold text-center">しりとり (ゲームID: {gameId})</h2>
          <p className="text-lg text-green-500 text-center">ユーザー名: {name}</p>

          {errorMessages.length > 0 && (
            <div className="error-messages">
              {errorMessages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}

          <ul className="text-center">
            {messages.map((message, index) => (
              <li key={index} className={message.className}>{message.text}</li>
            ))}
          </ul>

          <ul className="text-center">
            {words.map((entry, index) => (
              <li key={index}>{entry.user}: {entry.word}</li>
            ))}
          </ul>

          <form onSubmit={handleWordSubmit} className="text-center">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="単語を入力"
              className="border border-gray-300 p-2 rounded w-full mb-4"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              送信
            </button>
          </form>

          {gameEnded && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg text-center">
                {isLost ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-red-500">ゲームが終了しました！負けたのは {loser} さんです。</h2>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-green-500">残念！負けてしまいました、頑張りましょう！</h2>
                  </>
                )}
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={handleGameRestart}
                >
                  もう一度やる
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
                  onClick={handleGameEnd}
                >
                  終了してホームに戻る
                </button>
              </div>
            </div>
          )}

          {gameDeleted && (
            <div className="bg-red-500 text-white p-4 mt-4">
              <p>ゲームが削除されました。ホームに戻ります。</p>
              <button
                className="bg-blue-500 px-4 py-2 mt-4 rounded"
                onClick={() => window.location.href = '/'}
              >
                ホームに戻る
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShiritoriGame;
