require "test_helper"

class GamesControllerTest < ActionDispatch::IntegrationTest
  test "should create game" do
    post games_url, params: { game: { user_id: 1 } }
    assert_response :redirect
  end

  test "should start game" do
    game = games(:one)
    post start_game_url(game)
    assert_response :redirect
  end

  test "should restart game" do
    game = games(:one)
    post restart_game_url(game)
    assert_response :redirect
  end

  test "should get words" do
    game = games(:one)
    get words_game_url(game)
    assert_response :success
  end
end
