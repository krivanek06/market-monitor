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
        /* primary */
        'wt-primary': 'var(--primary)',

        /* success */
        'wt-success': 'var(--success)',

        /* danger */
        'wt-danger': 'var(--danger)',

        /* accent */
        'wt-accent-1': 'var(--accent-1)',
        'wt-accent-2': 'var(--accent-2)',
        'wt-accent-3': 'var(--accent-3)',

        /* gray */
        'wt-gray-dark-strong': 'var(--gray-dark-strong)',
        'wt-gray-dark': 'var(--gray-dark)',
        'wt-gray-medium': 'var(--gray-medium)',
        'wt-gray-light-strong': 'var(--gray-light-strong)',
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
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting')(require('postcss-nesting')),
    require('autoprefixer'),
    require('tailwindcss'),
  ],
};
