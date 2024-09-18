class ShiritoriGame < ApplicationRecord
  has_many :shiritori_words, dependent: :destroy

  # 最後の単語の最後の文字を返す
  def last_word_ends_with
    last_word = shiritori_words.order(created_at: :desc).first
    last_word ? last_word.word[-1] : nil
  end

  # 新しい単語がしりとりのルールに従っているかを確認
  def valid_shiritori?(new_word)
    return false if new_word.blank?  # 新しい単語が空の場合は無効
    return true if shiritori_words.empty?  # 最初の単語なら無条件に許可
    last_char = last_word_ends_with
    new_word.start_with?(last_char)  # しりとりのルールに従っているか確認
  end

  # 「ん」で終わった場合、負けたプレイヤーと勝者を判定
  def process_game_end(user)
    last_word = user.shiritori_words.order(created_at: :desc).first
    if last_word&.word&.ends_with?("ん")
      { loser: user, game_over: true }
    else
      { loser: nil, game_over: false }
    end
  end
end
