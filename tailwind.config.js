/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- This is the magic line that makes the toggle work
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};