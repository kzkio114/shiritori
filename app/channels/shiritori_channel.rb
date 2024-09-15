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
    else
      ShiritoriChannel.broadcast_to(@game, {
        action: 'error',
        message: message
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
    require 'natto'
    nm = Natto::MeCab.new
    noun_count = 0
    is_valid = true
    
    nm.parse(new_word.word) do |n|
      # BOS/EOSは無視する
      next if n.feature.include?("BOS/EOS")
      
      reading = n.feature.split(',')[7] # 解析結果から読み仮名を取得
    
      puts "Word: #{n.surface}, Feature: #{n.feature}"
  
      # 読み仮名が「ん」または「ン」で終わる場合
      if reading && (reading[-1] == 'ン' || reading[-1] == 'ん')
        ShiritoriChannel.broadcast_to(@game, {
          action: 'error',
          message: '単語が「ん」で終わっています。'
        })
        return false
      end
  
      # 名詞,一般のみ許可する
      if n.feature.include?('名詞,一般')
        noun_count += 1
      elsif n.feature.include?('名詞') || n.feature.include?('動詞') || n.feature.include?('助詞') || n.feature.include?('接尾辞') || n.feature.include?('フィラー') || n.feature.include?('形容詞')
        # 名詞,一般以外の場合、無効にする
        is_valid = false
        break
      end
    end
    
    unless is_valid
      ShiritoriChannel.broadcast_to(@game, {
        action: 'error',
        message: '名詞・一般以外の名詞が含まれています。'
      })
      return false
    end
    
    if noun_count > 1
      ShiritoriChannel.broadcast_to(@game, {
        action: 'error',
        message: '単語に複数の名詞が含まれています。'
      })
      return false
    end
    
    true
  end
end