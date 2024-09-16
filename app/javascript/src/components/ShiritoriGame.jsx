import React, { useState, useEffect } from 'react';
import consumer from '../../channels/consumer';
import axios from 'axios';

const getCSRFToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta && meta.getAttribute('content');
};

const ShiritoriGame = ({ gameId }) => {
  const [words, setWords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLost, setIsLost] = useState(false);  // プレイヤーが負けた状態
  const [isWon, setIsWon] = useState(false);    // プレイヤーが勝った状態
  const [gameEnded, setGameEnded] = useState(false);        // ゲーム終了状態
  const [gameDeleted, setGameDeleted] = useState(false);    // ゲームが削除されたかの状態

  const csrfToken = getCSRFToken(); // CSRFトークンを取得

  // WebSocketで受信する処理
  const received = (data) => {
    console.log('Received data:', data);

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
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.message, className: 'message-error' }
      ]);
      setErrorMessages(Array.isArray(data.messages) ? data.messages : [data.message]);
    } else if (data.action === 'lose') {
      // 自分が負けた場合
      if (data.user === name) {
        console.log("負けのモーダルを表示します。");
        setIsLost(true);
      } else {
        // 他の人が負けた場合の処理
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `${data.user} さんが負けました。`, className: 'message-lose' }
        ]);
      }
    } else if (data.action === 'win') {
      // 自分が勝った場合
      if (data.user === name) {
        console.log("勝ちのモーダルを表示します。");
        setIsWon(true);
      }
    } else if (data.action === 'game_end') {
      if (!isLost && !isWon) {
        console.log("ゲーム終了のモーダルを表示します。");
        setGameEnded(true);  // ゲーム終了状態に設定
      }

      // ゲーム終了時は全員に通知
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${data.message}`, className: 'message-lose' }
      ]);
    } else if (data.action === 'game_deleted') {
      setGameDeleted(true); // ゲームが削除された状態
    }
  };

  useEffect(() => {
    console.log('isLost:', isLost);
    console.log('isWon:', isWon);
    console.log('gameEnded:', gameEnded);
    axios.get(`/games/${gameId}/words`, {
      headers: {
        'X-CSRF-Token': csrfToken  // CSRFトークンをヘッダーに追加
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
    setIsNameSet(true);
    setErrorMessages([]);
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

  const handleGameEnd = () => {
    axios.delete(`/games/${gameId}`, {
      headers: {
        'X-CSRF-Token': csrfToken  // CSRFトークンをヘッダーに追加
      }
    })
    .then(() => {
      window.location.href = '/';  // ルートページにリダイレクト
    })
    .catch(error => {
      console.error("ゲームの削除に失敗しました:", error);
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
          <h2>しりとり (ゲームID: {gameId})</h2>

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

          {/* 負けたプレイヤーのモーダル */}
          {isLost && !gameEnded && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">負けです！</h2>
                <p className="mb-4">あなたは「ん」で負けました！</p>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => setIsLost(false)}  // モーダルを閉じる
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* 勝ったプレイヤーのモーダル */}
          {isWon && !gameEnded && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-2xl font-bold mb-4">勝ちました！</h2>
                <p className="mb-4">おめでとうございます！</p>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => setIsWon(false)}  // モーダルを閉じる
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* ゲーム終了時のモーダル */}
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

          {/* 削除された場合のボタン切り替え */}
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
