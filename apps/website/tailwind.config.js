const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')],
  theme: {
    extend: {
      fontSize: {
        sm: 'clamp(0.8rem, 0.09vw + 0.78rem, 0.89rem)',
        base: 'clamp(1rem, 0.19vw + 0.95rem, 1.19rem)',
        lg: 'clamp(1.25rem, 0.34vw + 1.17rem, 1.58rem)',
        xl: 'clamp(1.56rem, 0.55vw + 1.42rem, 2.11rem)',
        '2xl': 'clamp(1.95rem, 0.87vw + 1.74rem, 2.81rem)',
        '3xl': 'clamp(2.44rem, 1.32vw + 2.11rem, 3.75rem)',
        '4xl': 'clamp(3.05rem, 1.97vw + 2.56rem, 5rem)',
        '5xl': 'clamp(3.81rem, 2.88vw + 3.09rem, 6.66rem)',
        '6xl': 'clamp(4.77rem, 4.16vw + 3.73rem, 8.88rem)',
      },
    },
  },
  plugins: [],
};
