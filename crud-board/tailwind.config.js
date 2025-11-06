/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/dist/**/*.{js,jsx,ts,tsx}"  // Flowbite 추가
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')  // Flowbite 플러그인
  ],
}
