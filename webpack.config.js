const path = require('path');

module.exports = {
  entry: {
    twitter: './src/twitter.ts',
    instagram: './src/instagram.ts',
    tistory: './src/tistory.ts',
    tweetdeck: './src/tweetdeck.ts',
    autodetect: './src/autodetect.ts',
    popup: './src/popup.ts',
    background: './src/background.ts',
    naverpost: './src/naverpost.ts',
    settings: './src/settings.ts',
    weibo: './src/weibo.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production'
};
