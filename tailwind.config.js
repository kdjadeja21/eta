// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6", // Blue-500
          dark: "#60A5FA",    // Blue-400
        },
        secondary: {
          DEFAULT: "#10B981", // Emerald-500
          dark: "#34D399",    // Emerald-400
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber-500
          dark: "#FBBF24",    // Amber-400
        },
        background: {
          light: "#F9FAFB", // Gray-50
          dark: "#111827",  // Gray-900
        },
        surface: {
          light: "#FFFFFF", // White
          dark: "#1F2937",  // Gray-800
        },
        text: {
          primary: {
            light: "#111827", // Gray-900
            dark: "#F9FAFB",  // Gray-50
          },
          secondary: {
            light: "#6B7280", // Gray-500
            dark: "#9CA3AF",  // Gray-400
          },
        },
        border: {
          light: "#E5E7EB", // Gray-200
          dark: "#374151",  // Gray-700
        },
        danger: {
          DEFAULT: "#EF4444",
          dark: "#F87171",
        },
        warning: {
          DEFAULT: "#F97316",
          dark: "#FB923C",
        },
        success: {
          DEFAULT: "#22C55E",
          dark: "#4ADE80",
        },
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
