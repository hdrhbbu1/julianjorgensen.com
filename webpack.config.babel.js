import webpack from 'webpack';
import path from 'path';
import Merge from 'webpack-merge';
import StatsPlugin from 'stats-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import PostCSS from './postcss.config';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import SpriteLoaderPlugin from 'svg-sprite-loader/plugin';

// define environment constants
const NODE_ENV = (process.env.NODE_ENV || 'development');
const IS_PRODUCTION = (NODE_ENV === 'production');

console.log('Running webpack optimized for', NODE_ENV);

// Static vendor assets for which one can expect
//  minimal and a slow rate of change:
const VENDOR_LIBS = [
  'jquery',
  'react',
  'react-dom',
  'react-router-dom',
  'react-redux',
  'react-document-meta'
];


// Webpack config for both production and development environments
// ====================
const BASE_CONFIG = {
  entry: {
    bundle: path.resolve(__dirname, 'app/app'),
    vendor: VENDOR_LIBS
  },
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: {loader: 'style-loader'},
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: false,
                minimize: true,
                importLoaders: 1,
                localIdentName: "[name]--[local]--[hash:base64:8]"
              }
            },
            {
              loader: 'postcss-loader'
            }
          ]
        })
      },
      {
        test: /\.json$/i,
        use: 'json'
      },
      {
        test: /\.pdf$/i,
        use: 'file-loader?name=/docs/[name].[ext]'
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        include: path.resolve(__dirname, 'app/assets/images'),
        loaders: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            query: {
              progressive: true,
              optimizationLevel: 7,
              interlaced: false,
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      },
      {
        test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
      {
        test: /\.svg$/,
        include: path.resolve(__dirname, 'app/assets/icons'),
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
              spriteFilename: 'icons/sprite.svg'
            }
          },
          'svg-fill-loader',
          'svgo-loader'
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        context: 'app',
        from: 'assets/images',
        to: 'images'
      }
    ]),
    new webpack.DefinePlugin({
      // Dynamically access local environment variables based on the environment
      'ENV_CONFIG': JSON.stringify(require('./config/' + NODE_ENV + '.config'))
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new HTMLWebpackPlugin({
      template: 'app/index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // reduce moment package size
    new SpriteLoaderPlugin()
  ],
  devtool: `${IS_PRODUCTION ? 'inline' : 'cheap-eval'}-source-map`,
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'app/assets/'),
      app: path.resolve(__dirname, 'app/'),
      components: path.resolve(__dirname, 'app/components/'),
      layout: path.resolve(__dirname, 'app/layout/'),
      routes: path.resolve(__dirname, 'app/routes/'),
      store: path.resolve(__dirname, 'app/store/'),
      reducers: path.resolve(__dirname, 'app/store/reducers'),
      actions: path.resolve(__dirname, 'app/store/actions'),
      styles: path.resolve(__dirname, 'app/styles/'),
      utils: path.resolve(__dirname, 'app/utils/')
    },
    extensions: ['.js', '.jsx', '.css']
  }
};


// Webpack plugins unique to the production build:
const PROD_PLUGINS = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new ExtractTextPlugin('[name].min.[contenthash].css'),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,
      warnings: false
    },
    output: {
      comments: false
    }
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
  new CompressionPlugin({
    asset: "[path].gz[query]",
    algorithm: "gzip",
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8
  }),
  new StatsPlugin('stats.json', {
    chunkModules: true
  })
];

// Webpack field-value pairs re: webpack-dev-server:
const PROD_CONFIG = {
  output: {
    filename: '[name].min.[hash].js'
  }
};



// Webpack plugins unique to the development build:
const DEV_PLUGINS = [
  new ExtractTextPlugin('[name].[contenthash].css'),
  new webpack.HotModuleReplacementPlugin(),
  new StatsPlugin('stats.json', {
    chunkModules: true
  })
];

// Webpack field-value pairs re: webpack-dev-server:
const DEV_CONFIG = {
  output: {
    filename: '[name].[hash].js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    open: true,
    host: 'localhost',
    hot: true,
    inline: true,
    noInfo: false,
    port: 3000,
    historyApiFallback: true
  }
};

// Final Webpack configuration object constructed
//  conditionally according to the NODE_ENV value:
const AGGREGATE_CONFIG = IS_PRODUCTION
  ? Merge(BASE_CONFIG, PROD_CONFIG, { plugins: PROD_PLUGINS })
  : Merge(BASE_CONFIG, DEV_CONFIG, { plugins: DEV_PLUGINS });

export default AGGREGATE_CONFIG;
