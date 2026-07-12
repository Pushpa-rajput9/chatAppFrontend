/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe6fe",
          200: "#bccffd",
          300: "#8fabfa",
          400: "#5c7ff5",
          500: "#3757ee",
          600: "#2438e0",
          700: "#1e2bc2",
          800: "#1e299d",
          900: "#1e277c",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px 0 rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};
