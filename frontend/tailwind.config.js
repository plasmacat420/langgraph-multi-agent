/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "Cascadia Code", "Fira Code", "monospace"],
      },
      colors: {
        slate: { 950: "#020617" },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        eventIn: {
          "0%":   { opacity: "0", transform: "translateY(12px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)",    filter: "blur(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        dotBounce: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.3" },
          "40%":           { transform: "scale(1)",   opacity: "1"   },
        },
      },
      animation: {
        "event-in":   "eventIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":    "shimmer 2s linear infinite",
        "glow":       "glow 2s ease-in-out infinite",
        "dot-bounce": "dotBounce 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
