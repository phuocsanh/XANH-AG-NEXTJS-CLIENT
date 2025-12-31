import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)", ...fontFamily.sans] },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Agricultural green palette
        agri: {
          50: '#f0f9f4',
          100: '#dcf3e4',
          200: '#bae6ca',
          300: '#8dd4a8',
          400: '#5cb97f',
          500: '#4a7c59', // Primary green
          600: '#3d6548',
          700: '#2d5016', // Dark green for gradients
          800: '#234013',
          900: '#1a3310',
        },
        accent: {
          purple: '#4a1942', // Button color
          gold: '#c9a961',   // Heading color
          green: '#6b9e4d',  // Light green accent
        },
        soft_green: {
          DEFAULT: "hsl(var(--soft-green))",
        },
        strong_green: {
          DEFAULT: "hsl(var(--strong-green))",
        },
        dark_green: {
          DEFAULT: "hsl(var(--dark-green))",
        },
        very_dark_green: {
          DEFAULT: "hsl(var(--very-dark-green))",
        },
        bg_green: {
          DEFAULT: "hsl(var(--bg-green))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shine: {
          "0%": { backgroundPosition: "-10%" },
          "100%": { backgroundPosition: "200%" },
        },
        blink: {
          "0%, 100%": { color: "hsl(var(--primary))" },
          "50%": { color: "hsl(var(--soft-green))" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        spin: "spin 1s linear infinite",
        shine: "shine 4s linear infinite",
        blink: "blink 1s infinite",
      },
      backgroundImage: {
        'gradient-agri': 'linear-gradient(135deg, #4a7c59 0%, #2d5016 100%)',
        'gradient-agri-light': 'linear-gradient(to bottom, #6b9e4d, #4a7c59)',
        'gradient-agri-radial': 'radial-gradient(circle at top right, #6b9e4d, #4a7c59)',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
export default config;
