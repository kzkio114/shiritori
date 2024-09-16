class GamesController < ApplicationController
  def new
    @game = ShiritoriGame.new
  end

  def create
    @user = User.find_or_create_by(name: params[:user_name])
    session[:user_id] = @user.id
    @game = @user.shiritori_games.create
    @current_user = @user

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "game_new_message",
          partial: "games/game_new_message",
          locals: { game: @game , current_user: @current_user}
        )
      end
      format.html { redirect_to shiritori_game_path(@game.id) }
    end
  end

  def words
    game = ShiritoriGame.find(params[:id])
    words = game.shiritori_words.includes(:user).order(:created_at)  # 単語とユーザー情報を取得
    render json: { words: words.map { |word| { word: word.word, user: word.user.name } } }
  end

  def start
    @game = ShiritoriGame.find_by(id: params[:id])
    if @game.nil?
      redirect_to root_path, alert: 'ゲームが見つかりませんでした。'
      return
    end
  
    @current_user = User.find_by(id: session[:user_id])
    if @current_user.nil?
      redirect_to root_path, alert: 'セッションが無効です。もう一度ログインしてください。'
      return
    end
  
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "game_play_start",
          partial: "games/game_play_start",
          locals: { game: @game, current_user: @current_user }
        )
      end
      format.html { redirect_to shiritori_game_path(@game.id) }
    end
  end

  def destroy
    @game = ShiritoriGame.find_by(id: params[:id])
    
    if @game.nil?
      render json: { error: 'ゲームが見つかりませんでした' }, status: :not_found
    else
      # ゲーム削除を通知
      ShiritoriChannel.broadcast_to(@game, {
        action: 'game_end',
        message: 'ゲームが削除されました。'
      })

      if @game.destroy
        render json: { message: 'ゲームが正常に削除されました' }, status: :ok
      else
        render json: { error: 'ゲームの削除に失敗しました' }, status: :unprocessable_entity
      end
    end
  end
end
