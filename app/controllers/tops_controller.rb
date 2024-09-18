class TopsController < ApplicationController
  def index
    # クッキーに保存されているuser_idを使用してユーザーを取得
    if cookies.signed[:user_id] && !User.exists?(cookies.signed[:user_id])
      reset_session # セッション全体を消去
      redirect_to root_path, notice: 'セッションが無効です。ログインしてください'
    else
      @current_user = User.find(cookies.signed[:user_id]) if cookies.signed[:user_id]
    end
  end

  def show
  end
end
