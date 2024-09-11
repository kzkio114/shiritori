class CreateShiritoriGames < ActiveRecord::Migration[7.2]
  def change
    create_table :shiritori_games do |t|
      t.timestamps
    end
  end
end
