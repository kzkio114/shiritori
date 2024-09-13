class ShiritoriController < ApplicationController
  def index
    @game = ShiritoriGame.find_by(id: params[:game_id])
    @current_user = User.find(session[:user_id]) if session[:user_id]
  end
end