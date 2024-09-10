module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {}, // Tailwind CSSのネスティングサポート
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {})
  }
}