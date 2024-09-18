# app/controllers/users_controller.rb
class UsersController < ApplicationController
  def set_user
    user = User.find_or_create_by(id: cookies.signed[:user_id])
    if user.update(name: params[:name])
      # クッキーにユーザーIDを保存
      cookies.signed[:user_id] = { value: user.id, expires: 1.year.from_now }
      render json: { success: true, user_id: user.id }
    else
      render json: { success: false, errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
