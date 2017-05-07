module.exports = {
  entry: './index.js',
  output: {
    path: './build',
    library: 'cablecar',
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }],
  },
};
