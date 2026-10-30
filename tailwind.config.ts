import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe5fe",
          200: "#bfd3fe",
          300: "#93b9fd",
          400: "#6095fa",
          500: "#3b73f6",
          600: "#2554eb",
          700: "#1d40d8",
          800: "#1e37ae",
          900: "#1e328a",
          950: "#0f1c4d",
        },
        slate: {
          850: "#151e2e",
          950: "#0b1120",
        }
      },
    },
  },
  plugins: [],
};
export default config;

