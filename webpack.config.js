const path = require('path');

module.exports = {
  entry: {
    oldtwitter: './src/oldtwitter.js',
    newtwitter: './src/newtwitter.js',
    instagram: './src/instagram.js',
    tistory: './src/tistory.js',
    tweetdeck: './src/tweetdeck.js',
    autodetect: './src/autodetect.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'none',
};
