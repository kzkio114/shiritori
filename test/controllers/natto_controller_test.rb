require "test_helper"

class NattoControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get natto_index_url
    assert_response :success
  end

  test "should get parse" do
    get natto_parse_url
    assert_response :success
  end
end
