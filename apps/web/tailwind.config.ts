import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#0a0e14", light: "#161d27" },
        primary: { DEFAULT: "#7c3aed", light: "#a78bfa" },
      },
    },
  },
  plugins: [],
};

export default config;
