/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'song': ['SimSun', 'STSong', 'serif'], // 宋体字体族
        'system': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // 系统字体族
      },
      letterSpacing: {
        'song': '0.1em'
      },
      lineHeight: {
        'song': '1.8'
      }
    },
  },
  plugins: [],
}