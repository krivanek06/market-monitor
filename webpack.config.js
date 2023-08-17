const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  mode: 'none',

  // sentry config
  devtool: 'source-map', // Source map generation must be turned on
  plugins: [
    sentryWebpackPlugin({
      org: 'eduard-krivanek',
      project: 'javascript-angular',

      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and need the `project:releases` and `org:read` scopes
      authToken: '509b66934fa78174a333cffdc71128f0cb7c2e4f2e0929ddde86d5e302094812',
    }),
  ],
};
