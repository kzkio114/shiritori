# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_09_13_061432) do
  create_table "shiritori_games", charset: "utf8mb3", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_shiritori_games_on_user_id"
  end

  create_table "shiritori_word_dictionaries", charset: "utf8mb3", force: :cascade do |t|
    t.string "word", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["word"], name: "index_shiritori_word_dictionaries_on_word", unique: true
  end

  create_table "shiritori_words", charset: "utf8mb3", force: :cascade do |t|
    t.string "word"
    t.bigint "shiritori_game_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["shiritori_game_id"], name: "index_shiritori_words_on_shiritori_game_id"
    t.index ["user_id"], name: "index_shiritori_words_on_user_id"
  end

  create_table "users", charset: "utf8mb3", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "shiritori_games", "users"
  add_foreign_key "shiritori_words", "shiritori_games"
  add_foreign_key "shiritori_words", "users"
end
