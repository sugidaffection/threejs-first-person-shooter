const path = require('path');

module.exports = {
  content: [
    path.join(__dirname, 'dist/**/*.{html,js}'),
    path.join(__dirname, './public/**/*.{html,js}')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
