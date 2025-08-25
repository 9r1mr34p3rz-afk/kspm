import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "sm": "672px",
        "md": "1056px",
        "lg": "1312px",
        "xl": "1584px",
        "2xl": "1856px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier', 'monospace'],
      },
      colors: {
        // Carbon Design System color tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Carbon UI tokens
        'ui-background': "hsl(var(--ui-background))",
        'ui-01': "hsl(var(--ui-01))",
        'ui-02': "hsl(var(--ui-02))",
        'ui-03': "hsl(var(--ui-03))",
        'ui-04': "hsl(var(--ui-04))",
        'ui-05': "hsl(var(--ui-05))",

        // Carbon interactive tokens
        'interactive-01': "hsl(var(--interactive-01))",
        'interactive-02': "hsl(var(--interactive-02))",
        'interactive-03': "hsl(var(--interactive-03))",
        'interactive-04': "hsl(var(--interactive-04))",

        // Carbon text tokens
        'text-01': "hsl(var(--text-01))",
        'text-02': "hsl(var(--text-02))",
        'text-03': "hsl(var(--text-03))",
        'text-04': "hsl(var(--text-04))",
        'text-05': "hsl(var(--text-05))",

        // Carbon support tokens
        'support-01': "hsl(var(--support-01))", // Error
        'support-02': "hsl(var(--support-02))", // Success
        'support-03': "hsl(var(--support-03))", // Warning
        'support-04': "hsl(var(--support-04))", // Info

        // Carbon field tokens
        'field-01': "hsl(var(--field-01))",
        'field-02': "hsl(var(--field-02))",

        // Carbon layer tokens
        'layer-01': "hsl(var(--layer-01))",
        'layer-02': "hsl(var(--layer-02))",
        'layer-03': "hsl(var(--layer-03))",

        primary: {
          DEFAULT: "hsl(var(--interactive-01))",
          foreground: "hsl(var(--text-04))",
        },
        secondary: {
          DEFAULT: "hsl(var(--interactive-02))",
          foreground: "hsl(var(--text-01))",
        },
        destructive: {
          DEFAULT: "hsl(var(--support-01))",
          foreground: "hsl(var(--text-04))",
        },
        success: {
          DEFAULT: "hsl(var(--support-02))",
          foreground: "hsl(var(--text-04))",
        },
        warning: {
          DEFAULT: "hsl(var(--support-03))",
          foreground: "hsl(var(--text-01))",
        },
        info: {
          DEFAULT: "hsl(var(--support-04))",
          foreground: "hsl(var(--text-04))",
        },
        muted: {
          DEFAULT: "hsl(var(--ui-03))",
          foreground: "hsl(var(--text-03))",
        },
        accent: {
          DEFAULT: "hsl(var(--ui-03))",
          foreground: "hsl(var(--text-01))",
        },
        popover: {
          DEFAULT: "hsl(var(--ui-01))",
          foreground: "hsl(var(--text-01))",
        },
        card: {
          DEFAULT: "hsl(var(--ui-01))",
          foreground: "hsl(var(--text-01))",
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      spacing: {
        '0.5': '0.125rem', // 2px
        '1': '0.25rem',    // 4px
        '2': '0.5rem',     // 8px
        '3': '0.75rem',    // 12px
        '4': '1rem',       // 16px
        '5': '1.25rem',    // 20px
        '6': '1.5rem',     // 24px
        '8': '2rem',       // 32px
        '10': '2.5rem',    // 40px
        '12': '3rem',      // 48px
        '16': '4rem',      // 64px
        '20': '5rem',      // 80px
        '24': '6rem',      // 96px
        '32': '8rem',      // 128px
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
