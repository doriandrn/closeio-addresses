var path        = require('path'),
    ap          = require('autoprefixer'),
    short       = require('postcss-short'),
    magic       = require('postcss-magic-animations'),
    magician    = require('postcss-font-magician'),
    pxtorem     = require('postcss-pxtorem'),
    postcssFontGrabber = require('postcss-font-grabber'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app:  ['./src/js/main.js']
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: path.resolve(__dirname, '../dist'),
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
        loader: 'babel',
        query: {
          presets: ['es2015']
        },
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract( 'style', 'css!postcss!sass' )
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        loader: 'file-loader'
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
        postcssFontGrabber,
        ap //autoprefixer
      ]
    }
  }
}
