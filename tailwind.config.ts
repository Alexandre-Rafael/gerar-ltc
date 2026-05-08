import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ltcblue: "#08a7cf",
        ltclime: "#c7f465",
        ltcdark: "#0b1220",
      },
      fontFamily: {
        cubano: ["var(--font-cubano)", "Impact", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
