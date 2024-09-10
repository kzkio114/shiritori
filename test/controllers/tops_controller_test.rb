require "test_helper"

class TopsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get root_url # root に設定されているので root_url を使用
    assert_response :success
  end

  test "should get show" do
    get tops_show_url # tops/show ルートに対してテスト
    assert_response :success
  end
end
