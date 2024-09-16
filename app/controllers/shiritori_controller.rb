class ShiritoriController < ApplicationController
  def index
    @game = ShiritoriGame.find_by(id: params[:game_id])
    @current_user = User.find(cookies.signed[:user_id]) if cookies.signed[:user_id]
  end
end
