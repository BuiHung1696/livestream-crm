import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Categorical badge colors for Talent Types
        talent: {
          host: {
            bg: "rgb(245 243 255)", // violet-50
            text: "rgb(109 40 217)", // violet-700
            border: "rgb(221 214 254)", // violet-200
            darkBg: "rgb(46 16 101)", // violet-950
            darkText: "rgb(196 181 253)", // violet-300
          },
          koc: {
            bg: "rgb(254 243 199)", // amber-100
            text: "rgb(180 83 9)", // amber-700
            border: "rgb(253 230 138)", // amber-200
            darkBg: "rgb(69 26 3)", // amber-950
            darkText: "rgb(252 211 77)", // amber-300
          },
          kol: {
            bg: "rgb(209 250 229)", // emerald-100
            text: "rgb(4 120 87)", // emerald-700
            border: "rgb(167 243 208)", // emerald-200
            darkBg: "rgb(6 78 59)", // emerald-900
            darkText: "rgb(110 231 183)", // emerald-300
          },
          hybrid: {
            bg: "rgb(224 242 254)", // sky-100
            text: "rgb(3 105 161)", // sky-700
            border: "rgb(186 230 253)", // sky-200
            darkBg: "rgb(12 74 110)", // sky-900
            darkText: "rgb(125 211 252)", // sky-300
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
