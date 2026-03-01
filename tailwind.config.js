/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'ab-dark-blue': '#1a365d',
        'ab-blue': '#2b6cb0',
        'ab-light-blue': '#4299e1',
        'ab-gray': '#718096',
        'ab-light-gray': '#f7fafc',
        'ab-dark-gray': '#4a5568',
        'ab-error-red': '#e53e3e',
        'ab-success-green': '#38a169',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
