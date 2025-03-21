const {heroui} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    
  ],
  plugins: [heroui(), require("tailwindcss-animate")],
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Cores principais
        primary: {
          DEFAULT: "#004f4f",
          light: "#006d6d",
          dark: "#003535",
        },
        accent: {
          DEFAULT: "#ff7d50",
          light: "#ff9b78",
          dark: "#dd5c30",
        },
        // Cores de feedback
        success: "#00b894",
        warning: "#fdcb6e",
        error: "#d63031",
        info: "#0984e3",
        // Categorias
        category: {
          health: "#00b894",
          sleep: "#9b59b6",
          personal: "#e84393",
          work: "#3498db",
          finance: "#f39c12",
        },
        // Tons para o modo escuro
        dark: {
          background: "#121212",
          card: "#1e1e1e",
          border: "#333333",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
}
