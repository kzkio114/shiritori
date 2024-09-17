require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "should get set_user" do
    get users_set_user_url
    assert_response :success
  end
end
