import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#C8102E",
        "accent-dark": "#A00D24",
        cream: "#FAF7F2",
        card: "#F2EDE6",
        ink: "#1A1A1A",
        "mid-gray": "#888888",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-space-grotesk)", "sans-serif"],
      },
      animation: {
        "grain": "grain 0.5s steps(1) infinite",
        "slow-drift": "slow-drift 20s ease-in-out infinite alternate",
        "pulse-slow": "pulse 6s ease-in-out infinite",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "20%": { transform: "translate(2%, 3%)" },
          "30%": { transform: "translate(-1%, 2%)" },
          "40%": { transform: "translate(3%, -1%)" },
          "50%": { transform: "translate(-2%, 2%)" },
          "60%": { transform: "translate(1%, -3%)" },
          "70%": { transform: "translate(2%, 1%)" },
          "80%": { transform: "translate(-1%, -2%)" },
          "90%": { transform: "translate(3%, 2%)" },
        },
        "slow-drift": {
          "0%": { transform: "translateX(0%) translateY(0%)" },
          "50%": { transform: "translateX(2%) translateY(-1%)" },
          "100%": { transform: "translateX(-1%) translateY(2%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
