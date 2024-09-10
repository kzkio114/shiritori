/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/views/**/*.{html,erb,haml}",
    "./app/javascript/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {}, //フォントの追加
      colors: {} //カラーの追加
    },
  },
  plugins: [
    require('daisyui'), // DaisyUIプラグインを追加
  ],
}