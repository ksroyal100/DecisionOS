import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cabinet Grotesk'", "'Clash Display'", "Georgia", "serif"],
        body: ["'Satoshi'", "'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void: "#050508",
        surface: "#0d0d12",
        "surface-2": "#141419",
        "surface-3": "#1c1c24",
        border: "rgba(255,255,255,0.07)",
        "border-strong": "rgba(255,255,255,0.14)",
        text: {
          primary: "#f0f0f5",
          secondary: "#9494a8",
          muted: "#5a5a6e",
        },
        brand: {
          DEFAULT: "#7c6dfa",
          soft: "#9d91fb",
          dim: "#5c4ef5",
          glow: "rgba(124,109,250,0.2)",
        },
        emerald: { 400: "#34d399", 500: "#10b981" },
        amber: { 400: "#fbbf24" },
        rose: { 400: "#fb7185" },
        sky: { 400: "#38bdf8" },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        shimmer: "shimmer 1.8s linear infinite",
        "spin-slow": "spin 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.8)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
