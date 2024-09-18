class GamesController < ApplicationController
  def new
    @game = ShiritoriGame.new
  end

  def create
    @user = User.find_or_create_by(name: params[:user_name])
    
    cookies.signed[:user_id] = { value: @user.id, expires: 1.hour.from_now, http_only: true, secure: Rails.env.production? }

    @game = @user.shiritori_games.create
    @current_user = @user

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "game_new_message",
          partial: "games/game_new_message",
          locals: { game: @game, current_user: @current_user }
        )
      end
      format.html { redirect_to shiritori_game_path(@game.id) }
    end
  end

  def words
    game = ShiritoriGame.find(params[:id])
    words = game.shiritori_words.includes(:user).order(:created_at)
    render json: { words: words.map { |word| { word: word.word, user: word.user.name } } }
  end

  def restart
    
    @game = ShiritoriGame.find_by(id: params[:id])
    if @game.nil?
      render json: { error: 'ゲームが見つかりませんでした' }, status: :not_found
      return
    end

    @game.shiritori_words.destroy_all

    ShiritoriChannel.broadcast_to(@game, {
      action: 'restart',
      message: 'ゲームが再開されました。'
    })

    render json: { message: 'ゲームが再開され、すべての単語が削除されました' }, status: :ok
  end

  def destroy
    @game = ShiritoriGame.find_by(id: params[:id])
    
    if @game.nil?
      render json: { error: 'ゲームが見つかりませんでした' }, status: :not_found
    else
      @game.shiritori_words.destroy_all
      @game.destroy

      ShiritoriChannel.broadcast_to(@game, {
        action: 'game_deleted',
        message: 'ゲームが削除されました。'
      })

      render json: { message: 'ゲームが正常に削除されました' }, status: :ok
    end
  end
end
