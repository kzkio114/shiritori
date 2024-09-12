class GamesController < ApplicationController
  def new
    @game = ShiritoriGame.new
  end

  def create
    @user = User.find_or_create_by(name: params[:user_name])
    session[:user_id] = @user.id
    @game = @user.shiritori_games.create

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "game_new_message",
          partial: "games/game_new_message",
          locals: { game: @game}
        )
      end
      format.html { redirect_to shiritori_game_path(@game.id) }
    end
  end

  def start
    @game = ShiritoriGame.find(params[:id])
    @current_user = User.find(session[:user_id]) if session[:user_id]

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "game_play_start",
          partial: "games/game_play_start",
          locals: { game: @game , current_user: @current_user }
        )
      end
      format.html { redirect_to shiritori_game_path(@game.id) }
    end
  end
end
