const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  important: true, // to overwride angular material
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    fontFamily: {
      sans: ['sans-serif', 'Poppins'],
      serif: ['sans-serif', 'Poppins'],
    },
    extend: {
      colors: {
        'wt-background-dark': 'var(--background-dark)',
        'wt-background-medium': 'var(--background-medium)',
        'wt-background-light': 'var(--background-light)',
        'wt-background-light-super': 'var(--background-light-super)',

        /* primary */
        'wt-primary': 'var(--primary)',

        /* success */
        'wt-success': 'var(--success)',

        /* danger */
        'wt-danger': 'var(--danger)',

        /* gray */
        'wt-gray-dark': 'var(--gray-dark)',
        'wt-gray-medium': 'var(--gray-medium)',
        'wt-gray-light': 'var(--gray-light)',
      },
      flex: {
        2: '2 2 0%',
      },
    },
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
  },
  plugins: [],
};
