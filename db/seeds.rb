# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
# db/seeds.rb
words = ["あさ", "いえ", "うみ", "えき", "おか", "かさ", "きり", "くも", "けむり", "こめ", "さくら", "しお", "すいか", "せみ", "そら"]

new_words_count = 0

words.each do |word|
  shiritori_word = ShiritoriWordDictionary.find_or_initialize_by(word: word)
  if shiritori_word.new_record?
    shiritori_word.save
    new_words_count += 1
  end
end

puts "#{new_words_count} 単語が新しく辞書に保存されました！"
puts "現在の辞書には合計 #{ShiritoriWordDictionary.count} 単語が保存されています！"

