class ShiritoriWordDictionary < ApplicationRecord
    validates :word, presence: true, uniqueness: true, length: { in: 1..5 }
  end