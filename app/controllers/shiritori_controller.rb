class ShiritoriController < ApplicationController
  def index
    @game = ShiritoriGame.find_by(id: params[:game_id])
    @current_user = User.find_by(id: cookies.signed[:user_id])  # ログ出力して確認
    logger.debug "Current User: #{@current_user&.name}"  # ログ出力で確認
  end
end
