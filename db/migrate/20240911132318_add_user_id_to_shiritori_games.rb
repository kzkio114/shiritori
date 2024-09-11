class AddUserIdToShiritoriGames < ActiveRecord::Migration[7.2]
  def change
    add_reference :shiritori_games, :user, null: false, foreign_key: true
  end
end
