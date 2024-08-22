/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        main: "300px 1fr",
      },
      fontFamily: {
        sans: ["General Sans"],
        title: ["Gambetta"],
        mono: ["Server Mono"],
      },
      colors: {
        muted: {
          ...colors.zinc,
          DEFAULT: colors.zinc["500"],
        },
      },
    },
  },
  safelist: [
    "transition-transform",
    "duration-500",
    "origin-center",
    "group-hover:rotate-180",
  ],
  plugins: [],
};
