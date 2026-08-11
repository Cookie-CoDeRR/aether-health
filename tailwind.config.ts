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
        ink: {
          0: "var(--ink-0)",
          1: "var(--ink-1)",
          2: "var(--ink-2)",
        },
        panel: "var(--panel)",
        paper: {
          DEFAULT: "var(--paper)",
          dim: "var(--paper-dim)",
        },
        coral: {
          DEFAULT: "var(--coral)",
          dim: "var(--coral-dim)",
        },
        teal: "var(--teal)",
        textCustom: {
          hi: "var(--text-hi)",
          mid: "var(--text-mid)",
          lo: "var(--text-lo)",
        },
        borderCustom: "var(--line)",
        borderStrong: "var(--line-strong)",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
