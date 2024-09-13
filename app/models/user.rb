class User < ApplicationRecord
    has_many :shiritori_games  # ユーザーは複数のしりとりゲームを持つ
end
