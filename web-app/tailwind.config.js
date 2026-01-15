/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          dark: '#1E40AF', // blue-800
          light: '#3B82F6', // blue-500
        },
        secondary: {
          DEFAULT: '#475569', // slate-600
          dark: '#1E293B', // slate-800
          light: '#64748B', // slate-500
        },
      },
    },
  },
  plugins: [],
}
