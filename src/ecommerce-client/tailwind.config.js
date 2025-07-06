/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a3d62',     // ✅ xanh đậm chủ đạo
          dark: '#14532d',        // xanh đậm hơn nếu cần
        },
        secondary: '#facc15',      // vàng chanh
        neutral: '#1f2937',        // xám đậm
        light: '#f3f4f6',          // xám sáng
        danger: '#ef4444',         // đỏ cảnh báo
      },
    },
  },
  plugins: [],
}
