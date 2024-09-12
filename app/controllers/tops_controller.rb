class TopsController < ApplicationController
  def index
    @current_user = User.find(session[:user_id]) if session[:user_id]
  end

  def show
  end
end
