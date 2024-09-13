class CreateShiritoriWordDictionaries < ActiveRecord::Migration[7.2]
  def change
    create_table :shiritori_word_dictionaries do |t|
      t.string :word, null: false

      t.timestamps
    end
    add_index :shiritori_word_dictionaries, :word, unique: true
  end
end