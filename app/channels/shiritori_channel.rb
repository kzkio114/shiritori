class ShiritoriChannel < ApplicationCable::Channel
  def subscribed
    @game = ShiritoriGame.find(params[:game_id])
    stream_for @game  # ゲームに接続している全クライアントにブロードキャスト

    ShiritoriChannel.broadcast_to(@game, {
      action: 'joined',
      user: current_user.name
    })
  end

  def speak(data)
    word = @game.shiritori_words.build(user: current_user, word: data['word'])

    if valid_shiritori_rule?(word)
      if word.save
        ShiritoriChannel.broadcast_to(@game, {
          action: 'create',
          word: word.word,
          user: word.user.name
        })
      else
        # エラーメッセージの送信
        ShiritoriChannel.broadcast_to(current_user, {
          action: 'error',
          message: word.errors.full_messages.join(', ')
        })
      end
    else
      # しりとりルール違反のエラーメッセージ
      ShiritoriChannel.broadcast_to(current_user, {
        action: 'error',
        message: 'しりとりのルールが守られていません！'
      })
    end
  end

  def unsubscribed
    ShiritoriChannel.broadcast_to(@game, {
      action: 'left',
      user: current_user.name
    })
  end

  private

  def valid_shiritori_rule?(new_word)
    last_word = @game.shiritori_words.order(created_at: :desc).first
    return true unless last_word

    last_char = last_word.word[-1]
    return false if new_word.word[-1] == 'ん'

    new_word.word.starts_with?(last_char)
  end
end
