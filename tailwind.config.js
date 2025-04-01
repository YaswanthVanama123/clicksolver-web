/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar-hide') // 👈 this line enables scrollbar-hide class
  ],
};
