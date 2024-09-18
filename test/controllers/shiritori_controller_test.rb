require "test_helper"

class ShiritoriControllerTest < ActionDispatch::IntegrationTest
  test "should get index for a game" do
    game = games(:one)
    get shiritori_game_url(game_id: game.id)
    assert_response :success
  end

  test "should get index without a game" do
    get shiritori_index_url
    assert_response :success
  end
end
