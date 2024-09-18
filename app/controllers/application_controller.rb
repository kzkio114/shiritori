class ApplicationController < ActionController::Base
  helper_method :current_user

  def current_user
    # クッキーからユーザーIDを取得するように変更
    @current_user ||= User.find_by(id: cookies.signed[:user_id]) if cookies.signed[:user_id]
  end
end
