var path        = require('path'),
    ap          = require('autoprefixer'),
    short       = require('postcss-short'),
    magic       = require('postcss-magic-animations'),
    magician    = require('postcss-font-magician'),
    pxtorem     = require('postcss-pxtorem'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app:  './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.pug', '.scss'],
    alias: {
      'src': path.resolve(__dirname, '../src')
    }
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      {
        test: /\.pug$/,
        loader: 'pug-html-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel!eslint',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: '[name].[ext]?[hash:7]'
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract( 'style', 'css!postcss!sass' )
      },
      { 
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "url-loader?limit=10000&minetype=application/font-woff" 
      },
      { 
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "file-loader" 
      }
    ]
  },
  'pug-html-loader': {
    pretty: true
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  sassLoader: {
    includePaths: [ './src' ]
  },
  postcss: function() {
    return {
      defaults: [
        short,
        magic({atRoot: true}),
        pxtorem({replace: false}),
        magician,
        ap
      ]
    }
  }
}
