class ShiritoriChannel < ApplicationCable::Channel
  def subscribed
    @game = ShiritoriGame.find(params[:game_id])
    stream_for @game

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
        ShiritoriChannel.broadcast_to(@game, {
          action: 'error',
          message: word.errors.full_messages.join(', ')
        })
      end
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
    require 'natto'
    nm = Natto::MeCab.new
    noun_count = 0
    is_valid = true
    errors = []  # エラーメッセージを保持する配列
    
    # 「しりとりのルールが守られていません！」を最初に追加
    errors << 'しりとりのルールが守られていません！'
  
    nm.parse(new_word.word) do |n|
      next if n.feature.include?("BOS/EOS")
      
      reading = n.feature.split(',')[7]
    
      # 「ん」で終わる場合のエラー
      if reading && (reading[-1] == 'ン' || reading[-1] == 'ん') && !errors.include?('単語が「ん」で終わっています。')
        errors << '単語が「ん」で終わっています。'
        is_valid = false
      end

      puts "Word: #{n.surface}, Feature: #{n.feature}"
  
      # 名詞,一般でない場合のエラー
      if n.feature.include?('名詞,一般')
        noun_count += 1
      elsif n.feature.include?('名詞') || n.feature.include?('動詞') || n.feature.include?('助詞') || n.feature.include?('接尾辞')
        unless errors.include?('名詞・一般以外の名詞が含まれています。')
          errors << '名詞・一般以外の名詞が含まれています。'
        end
        is_valid = false
      end
    end
  
    if noun_count > 1 && !errors.include?('単語に複数の名詞が含まれています。')
      errors << '単語に複数の名詞が含まれています。'
      is_valid = false
    end
  
    # エラーメッセージが存在する場合は配列としてブロードキャスト
    unless errors.empty?
      ShiritoriChannel.broadcast_to(@game, {
        action: 'error',
        messages: errors
      })
    end
  
    is_valid
  end
end


