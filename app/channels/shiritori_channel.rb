# app/channels/shiritori_channel.rb
class ShiritoriChannel < ApplicationCable::Channel
  def subscribed
    @game = ShiritoriGame.find(params[:game_id])
    stream_for @game  # ゲームに接続している全クライアントにブロードキャスト

    # 接続されたことをブロードキャストで通知
    ShiritoriChannel.broadcast_to(@game, {
      action: 'joined',
      user: current_user.name
    })
  end

  def speak(data)
    # 新しい単語を保存
    word = @game.shiritori_words.build(user: current_user, word: data['word'])

    if word.save
      # ゲームに参加している全ユーザーに対してブロードキャスト
      ShiritoriChannel.broadcast_to(@game, {
        action: 'create',
        word: word.word,
        user: word.user.name
      })
    else
      ShiritoriChannel.broadcast_to(current_user, {
        action: 'error',
        errors: word.errors.full_messages
      })
    end
  end

  def unsubscribed
    # クライアントが接続を切断したときに他のクライアントに通知
    ShiritoriChannel.broadcast_to(@game, {
      action: 'left',
      user: current_user.name
    })
  end
end
