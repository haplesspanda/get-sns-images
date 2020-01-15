const path = require('path');

module.exports = {
  entry: {
    oldtwitter: './tsout/oldtwitter.js',
    newtwitter: './tsout/newtwitter.js',
    instagram: './tsout/instagram.js',
    tistory: './tsout/tistory.js',
    tweetdeck: './tsout/tweetdeck.js',
    autodetect: './tsout/autodetect.js',
    popup: './tsout/popup.js',
    background: './tsout/background.js',
    naverpost: './tsout/naverpost.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'none',
};
