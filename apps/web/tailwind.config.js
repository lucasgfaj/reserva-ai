import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#00201c",
        "on-primary-fixed": "#001e31",
        "on-secondary-container": "#255f80",
        "on-primary-container": "#bfe0ff",
        "error": "#ba1a1a",
        "secondary-container": "#a3d8fe",
        "surface-bright": "#f7f9fe",
        "inverse-on-surface": "#eff1f5",
        "surface-dim": "#d8dadf",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-fixed-variant": "#005048",
        "on-secondary": "#ffffff",
        "on-background": "#191c1f",
        "on-surface": "#191c1f",
        "tertiary-fixed": "#8cf5e4",
        "surface-container-low": "#f2f3f8",
        "primary-container": "#006699",
        "on-secondary-fixed": "#001e2e",
        "tertiary-container": "#006d62",
        "on-surface-variant": "#40484f",
        "outline-variant": "#c0c7d0",
        "inverse-surface": "#2d3134",
        "inverse-primary": "#90cdff",
        "surface-variant": "#e0e2e7",
        "surface-container-highest": "#e0e2e7",
        "error-container": "#ffdad6",
        "primary-fixed-dim": "#90cdff",
        "surface-container": "#eceef3",
        "surface": "#f7f9fe",
        "secondary-fixed-dim": "#98cdf2",
        "on-secondary-fixed-variant": "#064c6b",
        "tertiary": "#00534a",
        "surface-container-high": "#e6e8ed",
        "outline": "#707880",
        "secondary": "#2b6485",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "surface-tint": "#006496",
        "on-tertiary": "#ffffff",
        "secondary-fixed": "#c7e7ff",
        "tertiary-fixed-dim": "#6fd8c8",
        "on-tertiary-container": "#85eede",
        "background": "#f7f9fe",
        "on-primary-fixed-variant": "#004b72",
        "primary-fixed": "#cce5ff",
        "primary": "#004d75"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}
