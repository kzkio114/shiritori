class TopsController < ApplicationController
  def index
    # セッションが存在し、該当するユーザーがいない場合、セッションを消去
    if session[:user_id] && !User.exists?(session[:user_id])
      reset_session # セッション全体を消去
      redirect_to root_path, notice: 'セッションが無効です。ログインしてください'
    else
      @current_user = User.find(session[:user_id]) if session[:user_id]
    end
  end

  def show
  end
end
