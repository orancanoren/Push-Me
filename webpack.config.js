const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/public'
  },
  module: {
    rules: [
      {
        test: /\.sass$/,
        use: [
          'style-loader', // configure css in js
          'css-loader', // import css to js
          'sass-loader' // convert sass to css
        ]
      }
    ]
  }
}
