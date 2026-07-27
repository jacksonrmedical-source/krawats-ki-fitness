import type { Config } from "tailwindcss";

// Design tokens — grounded in the subject: dawn practice, breath, movement.
// Not the generic cream+terracotta AI default: this palette leans into
// early-morning studio light (deep dusk ink -> warm sunrise gold) since
// most of the source content is morning/evening practice.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A4A",       // deep dusk blue — headings, dark sections
        sunrise: "#E8A33D",   // primary accent — CTAs, progress
        clay: "#C97362",      // secondary accent — highlights, tags
        sage: "#7C8B6F",      // tertiary — success/completion states
        paper: "#FAF6EF",     // background
        mist: "#EDE7DA",      // card/section background, one step off paper
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Work Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
