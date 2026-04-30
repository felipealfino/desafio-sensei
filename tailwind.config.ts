// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        main: ["var(--font-rajdhani)", "Rajdhani", "sans-serif"],
      },
      colors: {
        red:    "#e8001e",
        gold:   "#c9a84c",
        surface:"#111111",
      },
    },
  },
  plugins: [],
};

export default config;
