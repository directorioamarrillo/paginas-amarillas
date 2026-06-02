/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#F4B51E",
          dark: "#D89200",
          light: "#FFD56A",
          hover: "#D89200",
          50: "#FFFDF0",
          100: "#FEF5D1",
          200: "#FDEAA3",
          300: "#FFD56A",
          400: "#FBCF45",
          500: "#F4B51E",
          600: "#D89200",
          700: "#A86F00",
          800: "#7C5000",
          900: "#513200",
        },
        "brand-dark": {
          DEFAULT: "#1E1E1E",
          secondary: "#2C2C2C",
        },
        "brand-gray": {
          DEFAULT: "#4A4A4A",
          light: "#D9D9D9",
        },
        background: "#F5F5F5",
        success: "#22C55E",
        danger: "#EF4444",
        secondary: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
      },
    },
  },
  plugins: [],
}

