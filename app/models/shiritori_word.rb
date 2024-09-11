class ShiritoriWord < ApplicationRecord
  belongs_to :shiritori_game
  belongs_to :user
end
