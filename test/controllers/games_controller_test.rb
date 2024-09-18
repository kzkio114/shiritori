require "test_helper"

class GamesControllerTest < ActionDispatch::IntegrationTest
  test "should create game" do
    user = users(:one) # fixturesまたはfactoryで作成されたユーザー
    post games_path, params: { game: { user_id: user.id, other_params: "value" } }
    assert_response :success
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
