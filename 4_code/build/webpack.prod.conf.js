var webpack = require('webpack')
var config = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

// naming output files with hashes for better caching.
// dist/index.html will be auto-generated with correct URLs.
config.output.filename = '[name].[chunkhash].js'
config.output.chunkFilename = '[id].[chunkhash].js'

var SOURCE_MAP = true

config.devtool = SOURCE_MAP ? 'source-map' : false

// generate loader string to be used with extract text plugin
function generateExtractLoaders (loaders) {
  return loaders.map(function (loader) {
    return loader + '-loader' + (SOURCE_MAP ? '?sourceMap' : '')
  }).join('!')
}

config.plugins = (config.plugins || []).concat([
  new webpack.optimize.OccurenceOrderPlugin(),
  new ExtractTextPlugin('[name].[contenthash].css'),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  // new ExtractTextPlugin('[name].[contenthash].css' ),
  // generate dist index.html with correct asset hash for caching.
  new HtmlWebpackPlugin({
    title: 'Address Modal',
    template: 'src/index.pug',
    filename: 'index.html'
  }),
  // new webpack.optimize.UglifyJsPlugin({
  //   compress: {
  //     warnings: false
  //   }
  // }),
])

module.exports = config
