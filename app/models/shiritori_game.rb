class ShiritoriGame < ApplicationRecord
  has_many :shiritori_words, dependent: :destroy
  has_many :users

  # 最後の単語の最後の文字を返す
  def last_word_ends_with
    last_word = shiritori_words.order(created_at: :desc).first
    last_word ? last_word.word[-1] : nil
  end

  # 新しい単語がしりとりのルールに従っているかを確認
  def valid_shiritori?(new_word)
    return true if shiritori_words.empty?
    last_char = last_word_ends_with
    new_word.starts_with?(last_char)
  end

  # 「ん」で終わった場合、負けたプレイヤーと勝者を判定
  def process_game_end(loser)
    # ミス回数をインクリメント
    loser.increment!(:mistakes_count)
  
    if loser.mistakes_count >= 5
      # 5回目のミスでアウト
      remaining_users = users.where.not(id: loser.id)
  
      if remaining_users.count == 1
        # 勝者がいる場合
        winner = remaining_users.first
        return { winner: winner, game_over: true }
      else
        # まだ複数のプレイヤーが残っている場合
        return { winner: nil, game_over: false }
      end
    else
      # まだゲーム続行
      return { winner: nil, game_over: false }
    end
  end  
end
