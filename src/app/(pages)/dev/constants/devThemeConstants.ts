/**
 * Developer Mode SaaS Theme Constants
 * Modern SaaS palette inspired by Linear, Raycast, and Supabase
 * Primary: Electric Purple | Accent: Rose Pink
 */

export const DEV_THEME = {
  colors: {
    purple: {
      50: "#f9f5ff",
      100: "#e6d9ff",
      200: "#d3bcff",
      300: "#b891ff",
      400: "#a473ff",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    pink: {
      50: "#fff5fa",
      100: "#ffd6ea",
      200: "#ffb3d8",
      300: "#ff7fbd",
      400: "#f43f5e",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
    },
  },
  gradients: {
    brand: "linear(to-r, purple.500, pink.500)",
    brandHover: "linear(to-r, purple.600, pink.600)",
    panel: "linear(to-br, #4c1d95, #7c3aed, #db2777)",
    subtleLight: "linear(to-r, purple.50, pink.50)",
    subtleDark: "linear(to-r, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.12))",
  },
  surfaces: {
    light: {
      bg: "gray.50",
      card: "white",
      cardHover: "#faf8ff",
      border: "gray.200",
      borderHover: "purple.400",
      textPrimary: "gray.900",
      textMuted: "gray.500",
    },
    dark: {
      bg: "gray.950",
      card: "gray.900",
      cardHover: "#151126",
      border: "whiteAlpha.100",
      borderHover: "purple.500",
      textPrimary: "gray.100",
      textMuted: "gray.400",
    },
  },
  glows: {
    purple: "inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 1px 3px 0 rgba(0, 0, 0, 0.25)",
    pink: "inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 1px 3px 0 rgba(0, 0, 0, 0.25)",
    cardHover: "0 4px 12px -2px rgba(0, 0, 0, 0.25)",
  },
  buttons: {
    primary: {
      bg: "purple.600",
      color: "white",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      shadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.25)",
      hoverBg: "purple.500",
      hoverShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 3px 8px 0 rgba(0, 0, 0, 0.3)",
    },
  },
} as const;

export default DEV_THEME;
