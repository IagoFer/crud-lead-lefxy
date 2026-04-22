import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        primary: {
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1d4ed8",
        },
        surface: {
          DEFAULT: "#18181b",
          light: "#27272a",
          border: "#3f3f46",
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      }
    },
  },
  plugins: [],
};

export default config;
