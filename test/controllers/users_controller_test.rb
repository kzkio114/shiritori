require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "should set user" do
    post set_user_url, params: { user_id: 1 }
    assert_response :success
  end
end
