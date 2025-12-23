/** @type {import("tailwindcss").Config} */
const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      opacity: {
        14: "0.14",
      },
      borderRadius: {
        xs: "10px",
        sm: "14px",
        md: "18px",
        lg: "22px",
        xl: "28px",
      },
      boxShadow: {
        glass1:
          "0 1px 1px rgba(15,26,45,0.06), 0 8px 24px rgba(15,26,45,0.08)",
        glass2:
          "0 2px 8px rgba(15,26,45,0.08), 0 16px 40px rgba(15,26,45,0.10)",
        glass3:
          "0 8px 24px rgba(15,26,45,0.10), 0 24px 80px rgba(15,26,45,0.14)",
      },
      backdropBlur: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "24px",
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-strong": "rgb(var(--text-strong) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-2": "rgb(var(--primary-2) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        highlight: "rgb(var(--highlight) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
