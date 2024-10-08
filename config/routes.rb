Rails.application.routes.draw do
  # config/routes.rb
  post "/set_user", to: "users#set_user"
  get "users/set_user"
  get "natto", to: "natto#index"
  post "natto/parse", to: "natto#parse", as: "parse_natto"
  # Topsコントローラのルート
  root "tops#index"
  # しりとりゲームのルート
  resources :games, only: [ :new, :create, :destroy ] do
    member do
      post "start", to: "games#start", as: "start"
      post "restart"  # これが必要です
      get :words  # ゲームIDに紐づいた単語を取得するエンドポイント
    end
  end

  get "shiritori/:game_id", to: "shiritori#index", as: "shiritori_game"  # しりとりゲームのページ用ルート
  get "shiritori/index", to: "shiritori#index", as: "shiritori"  # しりとりのインデックスページ

  # その他のルート
  get "tops/show", to: "tops#show", as: "tops_show"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
end
