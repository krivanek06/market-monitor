const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const sharedConfig = require('../../styles/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true, // to overwride angular material
  presets: [sharedConfig],
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {
      fontSize: {
        // sm: 'clamp(0.9rem, 0.09vw + 0.78rem, 0.89rem)',
        // base: 'clamp(1rem, 0.19vw + 0.85rem, 1.19rem)',
        // lg: 'clamp(1rem, 0.19vw + 1rem, 1.25rem)',
        // xl: 'clamp(1.56rem, 0.55vw + 1.2rem, 2rem)',
        '2xl': 'clamp(1.85rem, 0.87vw + 1.15rem, 2.5rem)',
        '3xl': 'clamp(2.44rem, 1vw + 2.55rem, 3rem)',
        //'4xl': 'clamp(3.05rem, 1.97vw + 2.56rem, 5rem)',
        '5xl': 'clamp(3.81rem, 2.88vw + 3rem, 6.25rem)',
        '6xl': 'clamp(4.27rem, 4.16vw + 3.23rem, 8.88rem)',
      },
    },
  },
};
