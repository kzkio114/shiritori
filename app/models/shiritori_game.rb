class ShiritoriGame < ApplicationRecord
  has_many :shiritori_words

  def last_word_ends_with
    last_word = shiritori_words.order(created_at: :desc).first
    last_word ? last_word.word[-1] : nil
  end

  def valid_shiritori?(new_word)
    return true if shiritori_words.empty? 
    last_char = last_word_ends_with
    new_word.starts_with?(last_char)
  end
end
