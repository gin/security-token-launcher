const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'node',
  //  "browser": {
  //    "fs": false,
  //    "child_process":false
  //  },
  node: {
    fs: 'empty',
    child_process: 'empty'
  },
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      { test: /\.(js)$/, use: 'babel-loader' },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ]},
    ]
  },
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html'
    })
  ]
}
