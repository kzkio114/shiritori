class ShiritoriController < ApplicationController
  def index
    @user = User.find_or_create_by(name: params[:user_name])
    cookies.signed[:user_id] = { value: @user.id, expires: 1.hour.from_now, http_only: true, secure: Rails.env.production? }
    @current_user = @user
    @game = ShiritoriGame.find_by(id: params[:game_id])
    if cookies.signed[:user_id].present?
      @current_user = User.find_by(id: cookies.signed[:user_id])
    else
      @current_user = nil
    end

    if @game.nil?
      redirect_to root_path, notice: 'ゲームが見つかりませんでした'
    end
  end
end
