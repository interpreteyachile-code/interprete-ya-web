/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 10px rgba(0,255,255,.45), 0 0 25px rgba(0,255,255,.25)",
        neonStrong: "0 0 12px rgba(0,255,255,.75), 0 0 40px rgba(0,255,255,.35)",
      },
    },
  },
  plugins: [],
};
