const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const sharedConfig = require('../../styles/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true, // to overwride angular material
  presets: [sharedConfig],
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
};
