import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#064E3B",
          primary: "#064E3B",
          dark: "#043327",
          subtle: "rgba(6, 78, 59, 0.12)",
          highlight: "rgba(6, 78, 59, 0.08)",
          grid: "rgba(6, 78, 59, 0.09)",
        },
        surface: {
          white: "#FFFFFF",
          card: "#F9FBF9",
          border: "rgba(6, 78, 59, 0.12)",
          hover: "rgba(6, 78, 59, 0.04)",
        },
        dark: {
          bg: "#081511",
          surface: "#0B1D17",
          card: "#0F241E",
          cardHover: "#132D26",
          border: "rgba(255, 255, 255, 0.08)",
          borderSubtle: "rgba(16, 185, 129, 0.15)",
          text: "#ECFDF5",
          textMuted: "#6EE7B7",
          textSubtle: "rgba(236, 253, 245, 0.6)",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(6, 78, 59, 0.04)",
        card: "0 2px 8px -2px rgba(6, 78, 59, 0.06), 0 1px 3px rgba(6, 78, 59, 0.03)",
        elevated: "0 10px 25px -5px rgba(6, 78, 59, 0.08), 0 4px 6px -2px rgba(6, 78, 59, 0.03)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
