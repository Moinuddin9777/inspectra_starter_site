import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#3b82f6", // Blue
          secondary: "#7c3aed", // Violet
          accent: "#ec4899", // Pink
        },
        aquamarine: "#3b82f6",
        "rich-black": "#011618",
        "brunswick-green": "#154F47",
        background: "#020617", // Deep slate/black
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(30, 41, 59, 0.5)",
          border: "rgba(255, 255, 255, 0.1)",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "futuristic-glow": "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "reveal": "reveal 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
