/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "sans-serif"],
      },
      colors: {
        // Material You (MD3) Purple/Violet Seed Palette
        md: {
          // Backgrounds & Surfaces
          background: "#FFFBFE", // Slightly warm off-white
          "on-background": "#1C1B1F", // Near-black with slight warmth

          surface: "#FFFBFE",
          "on-surface": "#1C1B1F",

          "surface-variant": "#E7E0EC", // Neutral variant
          "on-surface-variant": "#49454F",

          "surface-container-lowest": "#FFFFFF",
          "surface-container-low": "#F7F2FA", // Inputs, recessed
          "surface-container": "#F3EDF7", // Default card bg
          "surface-container-high": "#ECE6F0",
          "surface-container-highest": "#E6E0E9",

          // Primary (Seed: #6750A4)
          primary: "#6750A4",
          "on-primary": "#FFFFFF",
          "primary-container": "#EADDFF",
          "on-primary-container": "#21005D",

          // Secondary
          secondary: "#625B71",
          "on-secondary": "#FFFFFF",
          "secondary-container": "#E8DEF8", // Pills, chips
          "on-secondary-container": "#1D192B",

          // Tertiary
          tertiary: "#7D5260", // Complementary mauve/dusty rose
          "on-tertiary": "#FFFFFF",
          "tertiary-container": "#FFD8E4",
          "on-tertiary-container": "#31111D",

          // Error
          error: "#B3261E",
          "on-error": "#FFFFFF",
          "error-container": "#F9DEDC",
          "on-error-container": "#410E0B",

          // Outline/Borders
          outline: "#79747E",
          "outline-variant": "#CAC4D0",
        },
        // Override standard gray scale to ensure accessibility compliance for 400/500 levels
        gray: {
          400: "#757575", // Adjusted from #9ca3af to pass AA (4.5:1)
          500: "#6b7280", // Adjusted from #6b7280 to ensure smooth gradient
        },
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "16px", // Default card
        lg: "24px", // Prominent cards
        xl: "28px", // Dialogs
        "2xl": "32px", // Nested content
        "3xl": "48px", // Hero sections
        "4xl": "100px", // Decorative shapes
      },
      boxShadow: {
        sm: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)", // Elevation 1
        md: "0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 4px 8px 3px rgba(0, 0, 0, 0.05)", // Elevation 2
        lg: "0px 4px 8px 3px rgba(0, 0, 0, 0.05), 0px 6px 10px 4px rgba(0, 0, 0, 0.05)", // Elevation 3
        xl: "0px 8px 12px 6px rgba(0, 0, 0, 0.05), 0px 12px 16px 8px rgba(0, 0, 0, 0.05)", // Elevation 4
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        emphasized: "cubic-bezier(0.2, 0, 0, 1)",
      },
      scale: {
        98: "0.98",
        102: "1.02",
      },
    },
  },
  plugins: [],
  darkMode: "class",
}

