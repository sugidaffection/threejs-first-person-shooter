const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: false,
  optimization: {
    minimize: false
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
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'public'),
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ]
  },
  watch: false,
  watchOptions: {
    ignored: /node_modules/
  },
  plugins: [
    // new CleanWebpackPlugin({

    // }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
    })
  ],
  devServer: {
    hot: true,
    compress: true,
    disableHostCheck: true,
    allowedHosts: [],
    static: [
      {
        directory: path.resolve(__dirname, './public')
      },
      {
        directory: path.resolve(__dirname, './assets'),
        publicPath: '/assets'
      }
    ]
  }
}