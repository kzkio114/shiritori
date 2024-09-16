import React, { useState, useEffect } from 'react';
import consumer from '../../channels/consumer';
import axios from 'axios';

const getCSRFToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta && meta.getAttribute('content');
};

const ShiritoriGame = ({ gameId, initialCurrentUser }) => {
  console.log('Initial Current User:', initialCurrentUser); // ユーザー名の初期状態を確認

  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [name, setName] = useState(initialCurrentUser || ''); // サーバーから渡されたユーザー名を初期値に
  const [isNameSet, setIsNameSet] = useState(!!initialCurrentUser); // 名前が渡されていればtrueに
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLost, setIsLost] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameDeleted, setGameDeleted] = useState(false);

  console.log('Game ID:', gameId); // ゲームIDをログ
  console.log('Is Name Set:', isNameSet); // 名前が設定されたかどうかをログ

  const csrfToken = getCSRFToken(); // CSRFトークンを取得

  useEffect(() => {
    console.log('useEffect triggered'); // useEffectが発火したことを確認

    axios.get(`/games/${gameId}/words`, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    .then(response => {
      console.log('Words fetched:', response.data.words); // 取得した単語リストをログ
      setWords(response.data.words);
    })
    .catch(error => {
      console.error("単語の取得に失敗しました:", error); // エラー時のログ
    });

    const subscription = consumer.subscriptions.create(
      { channel: "ShiritoriChannel", game_id: gameId },
      { received }
    );

    return () => {
      subscription.unsubscribe();
      console.log('WebSocket unsubscribed'); // WebSocketの購読解除をログ
    };
  }, [gameId, csrfToken]);

  const received = (data) => {
    console.log('Received data:', data); // WebSocketから受信したデータをログ

    if (data.action === 'create') {
      setWords((prevWords) => [...prevWords, { word: data.word, user: data.user }]);
    } else if (data.action === 'joined') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.user} さんが参加しました。`, className: 'message-joined' }
      ]);
    } else if (data.action === 'left') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.user} さんが退出しました。`, className: 'message-left' }
      ]);
    } else if (data.action === 'error') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.message, className: 'message-error' }
      ]);
      setErrorMessages(Array.isArray(data.messages) ? data.messages : [data.message]);
    } else if (data.action === 'lose') {
      if (data.user === name) {
        setIsLost(true);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `${data.user} さんが負けました。`, className: 'message-lose' }
        ]);
      }
    } else if (data.action === 'win') {
      if (data.user === name) {
        setIsWon(true);
      }
    } else if (data.action === 'game_end') {
      if (!isLost && !isWon) {
        setGameEnded(true);
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.message}`, className: 'message-lose' }
      ]);
    } else if (data.action === 'game_deleted') {
      setGameDeleted(true);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    console.log('Name submitted:', name); // 入力された名前をログ
    const username = name.trim();
    if (username === '') {
      setErrorMessages(['名前を入力してください']);
      console.log('Error: 名前が空です'); // エラーメッセージをログ
      return;
    }

    const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
    if (currentSubscription) {
      currentSubscription.perform("join", { user: username });
    }
    setIsNameSet(true);
    setErrorMessages([]);
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    console.log('Word submitted:', newWord); // 入力された単語をログ
    if (newWord.trim() !== '') {
      setErrorMessages([]);
      const currentSubscription = consumer.subscriptions.subscriptions.find(sub => sub.identifier.includes(gameId));
      if (currentSubscription) {
        currentSubscription.perform("speak", { word: newWord });
      }
      setNewWord('');
    }
  };

  const handleGameEnd = () => {
    console.log('Ending game:', gameId); // ゲーム終了操作をログ
    axios.delete(`/games/${gameId}`, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
    .then(() => {
      console.log('Game deleted successfully'); // ゲーム削除成功をログ
      window.location.href = '/';
    })
    .catch(error => {
      console.error("ゲームの削除に失敗しました:", error); // エラー時のログ
    });
  };

  return (
    <div>
      {!isNameSet ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <form onSubmit={handleNameSubmit} className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">名前を入力してください</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                console.log('Name input changed:', e.target.value); // 入力中の名前をログ
              }}
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
          <h2>しりとり (ゲームID: {gameId})</h2>
          <p>ユーザー名: {name}</p>

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
              onChange={(e) => {
                setNewWord(e.target.value);
                console.log('Word input changed:', e.target.value); // 入力中の単語をログ
              }}
              placeholder="単語を入力"
            />
            <button type="submit">送信</button>
          </form>

          {isLost && !gameEnded && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">負けです！</h2>
                <p className="mb-4">あなたは「ん」で負けました！</p>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => setIsLost(false)}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {isWon && !gameEnded && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">勝ちました！</h2>
                <p className="mb-4">おめでとうございます！</p>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => setIsWon(false)}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {gameEnded && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">ゲーム終了！</h2>
                <p className="mb-4">ゲームが終了しました！</p>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={handleGameEnd}
                >
                  終了する
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
