const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  mode: 'none',

  // sentry config
  devtool: 'source-map', // Source map generation must be turned on
  plugins: [],
};
