const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/build'),
    publicPath: '/dist/build'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: false,
  optimization: {
    minimize: true
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  watchOptions: {
    ignored: /node_modules/
  },
  plugins: [
    // new CleanWebpackPlugin()
  ]
}