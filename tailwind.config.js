const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './tailwindInput/**/*.{html,js,css}',
    './www/**/*.{html,js,css}'
  ],
  darkMode: 'class',
  safelist: [
    'after:content-["Required"]',
    '@container'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'black': colors.black,
      'white': colors.white,
      'slate': colors.slate,
      'gray': colors.gray,
      'grey': {
         50: "#C6C6C6",
        100: "#B8B8B8",
        200: "#AAAAAA",
        300: "#9B9B9B",
        400: "#8D8D8D",
        500: "#7F7F7F",
        600: "#717171",
        700: "#626262",
        800: "#545454",
        900: "#454545",
        950: "#363636"
      },
      'zinc': colors.zinc,
      'neutral': colors.neutral,
      'stone': colors.stone,
      'red': colors.red,
      'orange': colors.orange,
      'amber': colors.amber,
      'yellow': colors.yellow,
      'lime': colors.lime,
      'green': colors.green,
      'emerald': colors.emerald,
      'teal': colors.teal,
      'cyan': colors.cyan,
      'sky': colors.sky,
      'blue': colors.blue,
      'indigo': colors.indigo,
      'violet': colors.violet,
      'purple': colors.purple,
      'fuchia': colors.fuchsia,
      'pink': colors.pink,
      'rose': colors.rose,
      'success': '#28a745',
      'fail': '#dc3545',
      'cancel': '#ffd21c',
      'gold': '#ffd530',
      'tan': '#bfb8ab',
      'olive': '#333c33',
    },
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      kfi: ['kfi']
    },
    extend: {
      zIndex: {
        '100': '100',
        '9000': '9000',
        '9100': '9100',
        '9200': '9200',
        '9300': '9300',
        '9999': '9999',
      },
    },
    container: {
      center: true,
      padding: '2rem'
    },
    plugins: [
      require('@tailwindcss/container-queries')
    ]
  }
}