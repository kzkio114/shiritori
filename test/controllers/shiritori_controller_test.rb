require "test_helper"

class ShiritoriControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get shiritori_index_url
    assert_response :success
  end
end
