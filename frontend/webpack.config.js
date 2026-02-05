const path = require('path');

module.exports = {
  entry: './src/index.js', // Update with your entry point
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Ensure Webpack resolves TypeScript and JSX
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,  // Add rule for handling TypeScript files
        use: 'ts-loader', // You can use 'babel-loader' if you're using Babel
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,  // This handles JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',  // If you're using Babel
        }
      }
    ],
  }
};
