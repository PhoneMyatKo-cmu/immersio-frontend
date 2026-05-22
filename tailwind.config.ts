import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        greygreen: "#2F4F4F",
        darkgrey: "#1F2937",
        button: "#0F766E",
        teal: "#14B8A6",
      },
    },
  },
  plugins: [],
} satisfies Config;
