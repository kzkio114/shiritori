# app/controllers/shiritori_controller.rb
class ShiritoriController < ApplicationController
  def index
    @game = ShiritoriGame.find_by(id: params[:game_id])  # game_idを使ってゲームを取得
  end
end
