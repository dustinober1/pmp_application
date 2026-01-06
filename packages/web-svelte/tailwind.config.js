/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Nunito", "Quicksand", "sans-serif"],
      },
      colors: {
        background: "#FDFCF8", // Rice Paper
        foreground: "#2C2C24", // Deep Loam
        primary: {
          DEFAULT: "#5D7052", // Moss Green
          foreground: "#F3F4F1", // Pale Mist
        },
        secondary: {
          DEFAULT: "#C18C5D", // Terracotta
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#E6DCCD", // Sand
          foreground: "#4A4A40", // Bark
        },
        muted: {
          DEFAULT: "#F0EBE5", // Stone
          foreground: "#78786C", // Dried Grass
        },
        border: "#DED8CF", // Raw Timber
        destructive: "#A85448", // Burnt Sienna
      },
      borderRadius: {
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        "3xl": "48px",
        blob: "60% 40% 30% 70% / 60% 30% 70% 40%",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(93, 112, 82, 0.15)", // Moss tinted
        float: "0 10px 40px -10px rgba(193, 140, 93, 0.2)", // Clay tinted
        hover: "0 20px 40px -10px rgba(93, 112, 82, 0.15)", // Deep lift
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
