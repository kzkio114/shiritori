class ShiritoriController < ApplicationController
  def index
    # ゲームIDでゲームを取得
    @game = ShiritoriGame.find_by(id: params[:game_id])
    
    # ユーザーがクッキーにない場合、クッキーを作成し、ユーザーに名前を設定させる
    if cookies.signed[:user_id].present?
      @current_user = User.find_by(id: cookies.signed[:user_id])
    else
      @current_user = nil  # ユーザーが未設定の場合、後でモーダルを使って名前を設定させる
    end

    if @game.nil?
      redirect_to root_path, notice: 'ゲームが見つかりませんでした'
    end
  end
end
