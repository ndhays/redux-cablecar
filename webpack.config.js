const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.ts",
  output: {
    path: path.resolve(__dirname, "build"),
    library: "cablecar",
    libraryTarget: "commonjs2",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
};
