/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'ab-dark-blue': '#333333',
        'ab-blue': '#00659a',
        'ab-light-blue': '#1a8bc0',
        'ab-gray': '#666666',
        'ab-light-gray': '#f7fafc',
        'ab-dark-gray': '#444444',
        'ab-error-red': '#e53e3e',
        'ab-success-green': '#38a169',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
