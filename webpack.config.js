module.exports = {
  devtool: 'source-map',
  entry: './index.js',
  output: {
    path: './build',
    filename: 'cablecar.js',
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
