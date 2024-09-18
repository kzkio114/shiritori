require "test_helper"

class NattoControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get natto_url
    assert_response :success
  end

  test "should post parse" do
    post parse_natto_url, params: { text: "テキスト" }
    assert_response :success
  end
end
