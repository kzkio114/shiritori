class GamesController < ApplicationController
  def new
    @game = ShiritoriGame.new
  end

  def create
    @user = User.find_or_create_by(name: params[:user_name])  # ユーザーが存在しない場合は作成
    @game = @user.shiritori_games.create  # ユーザーに関連付けてゲームを作成

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "game_new_message",
          partial: "games/game_new_message",
          locals: { geme: @game}
        )
      end
      format.html { redirect_to shiritori_game_path(@game.id) }
    end
  end
end
