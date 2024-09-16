class ShiritoriChannel < ApplicationCable::Channel
  def subscribed
    @game = ShiritoriGame.find(params[:game_id])
    stream_for @game

    # デバッグログを追加
    Rails.logger.debug("Current user: #{current_user.inspect}")

    # 加入時のメッセージを全員に送信
    ShiritoriChannel.broadcast_to(@game, {
      action: 'joined',
      user: current_user.name
    })
  end

  def join(data)
    user_name = data['user'].strip  # 名前の前後の空白を削除
    return if user_name.blank?  # 空白名は処理しない

    current_user.update(name: user_name)  # ユーザー名を更新
    ShiritoriChannel.broadcast_to(@game, {
      action: 'joined',
      user: user_name
    })
  end

  def unsubscribed
    # 退室時のメッセージを全員に送信
    ShiritoriChannel.broadcast_to(@game, {
      action: 'left',
      user: current_user.name
    })
  end

  def speak(data)
    word = @game.shiritori_words.build(user: current_user, word: data['word'])

    if valid_shiritori_rule?(word)
      if word.save
        # 新しい単語が追加されたことを全員に通知
        ShiritoriChannel.broadcast_to(@game, {
          action: 'create',
          word: word.word,
          user: word.user.name
        })
      else
        # 単語保存時のエラーを全員に通知
        ShiritoriChannel.broadcast_to(@game, {
          action: 'error',
          message: word.errors.full_messages.join(', ')
        })
      end
    end
  end

  private

  def valid_shiritori_rule?(new_word)
    require 'natto'
    nm = Natto::MeCab.new
    noun_count = 0
    is_valid = true
    errors = []

    nm.parse(new_word.word) do |n|
      next if n.feature.include?("BOS/EOS")
      
      reading = n.feature.split(',')[7]

      # 「ん」で終わる場合のエラーと負け処理
      if reading && (reading[-1] == 'ン' || reading[-1] == 'ん')
        errors << '単語が「ん」で終わっています。'
        is_valid = false

        # 負けたプレイヤーにのみ通知
        transmit({
          action: 'lose',
          user: current_user.name
        })

        # 全員にゲーム終了を通知
        ShiritoriChannel.broadcast_to(@game, {
          action: 'game_end',
          message: 'ゲームが終了しました。'
        })
        return is_valid
      end

      puts "Word: #{n.surface}, Feature: #{n.feature}"

      # 名詞,一般でない場合のエラー
      if n.feature.include?('名詞,一般')
        noun_count += 1
      elsif n.feature.include?('名詞') || n.feature.include?('動詞') || n.feature.include?('助詞') || n.feature.include?('接尾辞') || n.feature.include?('フィラー') || n.feature.include?('形容詞')
        errors << '名詞・一般以外の名詞が含まれています。' unless errors.include?('名詞・一般以外の名詞が含まれています。')
        is_valid = false
      end
    end

    if noun_count > 1
      errors << '単語に複数の名詞が含まれています。'
      is_valid = false
    end

    # 単語の重複チェック
    if @game.shiritori_words.exists?(word: new_word.word)
      errors << 'その単語はすでに使用されています。'
      is_valid = false
    end

    # エラーがある場合は全員に通知
    unless errors.empty?
      ShiritoriChannel.broadcast_to(@game, {
        action: 'error',
        messages: errors
      })
    end

    is_valid
  end
end
