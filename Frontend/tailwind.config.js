/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#FFC107",
          hover: "#E0A800",
          50: "#FFFDF5",
          100: "#FFF8DB",
          200: "#FFF0B8",
          300: "#FFE48C",
          400: "#FFD55C",
          500: "#FFC107", // Amarillo moderno
          600: "#E0A800", // Amarillo oscuro
          700: "#C29100",
          800: "#A37A00",
          900: "#856400",
        },
        primaryHover: "#E0A800",
        dark: {
          DEFAULT: "#1F1F1F",
          elegant: "#212121",
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

