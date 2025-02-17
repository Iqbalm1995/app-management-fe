// app/providers.tsx
"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import "@fontsource/poppins/400.css"; // Regular weight
import "@fontsource/poppins/500.css"; // Medium weight
import "@fontsource/poppins/600.css"; // Semi-bold weight
import "@fontsource/poppins/700.css"; // Bold weight

import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/700.css";

const colors = {
  black: "#0c1015",
  gray: {
    "50": "#f9fafa",
    "100": "#f1f1f2",
    "200": "#e6e7e9",
    "300": "#d2d4d7",
    "400": "#a9adb2",
    "500": "#797f88",
    "600": "#4d5560",
    "700": "#2e3744",
    "800": "#19202b",
    "900": "#141a23",
  },
  teal: {
    "50": "#f0fcfc",
    "100": "#bdf2f4",
    "200": "#7ee5e8",
    "300": "#26d2d8",
    "400": "#20b2b7",
    "500": "#1b989c",
    "600": "#167b7f",
    "700": "#116062",
    "800": "#0e5052",
    "900": "#0c4244",
  },
  cyan: {
    "50": "#f4fbfd",
    "100": "#cfeff7",
    "200": "#b9e7f3",
    "300": "#9fdeee",
    "400": "#4ec3e0",
    "500": "#26b4d8",
    "600": "#22a2c2",
    "700": "#1c86a1",
    "800": "#176e84",
    "900": "#125566",
  },
  blue: {
    "50": "#f1f7fd",
    "100": "#cce0f6",
    "200": "#a7c9f0",
    "300": "#7dafe8",
    "400": "#5597e1",
    "500": "#2f80db",
    "600": "#216abd",
    "700": "#195191",
    "800": "#154376",
    "900": "#113661",
  },
  purple: {
    "50": "#f8f6fd",
    "100": "#e5daf8",
    "200": "#d2bef4",
    "300": "#b696ed",
    "400": "#a279e8",
    "500": "#8753e1",
    "600": "#7335dc",
    "700": "#5e22c4",
    "800": "#4d1ca1",
    "900": "#3a1578",
  },
  pink: {
    "50": "#fdf5f9",
    "100": "#f8d8e7",
    "200": "#f3b9d4",
    "300": "#eb8db9",
    "400": "#e56ba4",
    "500": "#dc3784",
    "600": "#c4226e",
    "700": "#a01c5a",
    "800": "#7e1647",
    "900": "#5d1034",
  },
  red: {
    "50": "#fdf6f5",
    "100": "#f8d9d8",
    "200": "#f2b7b5",
    "300": "#ea8c88",
    "400": "#e5716d",
    "500": "#de4742",
    "600": "#ca2923",
    "700": "#a3211d",
    "800": "#8a1c18",
    "900": "#651512",
  },
  orange: {
    "50": "#fdfaf6",
    "100": "#f9ebdb",
    "200": "#f2d4b2",
    "300": "#e7b276",
    "400": "#dd923d",
    "500": "#c67a23",
    "600": "#a7671d",
    "700": "#855217",
    "800": "#694012",
    "900": "#56350f",
  },
  yellow: {
    "50": "#fefefc",
    "100": "#fbf9eb",
    "200": "#f5eec4",
    "300": "#ece195",
    "400": "#e0cd50",
    "500": "#bda821",
    "600": "#97861a",
    "700": "#766915",
    "800": "#584f0f",
    "900": "#49410d",
  },
  green: {
    "50": "#f5fdf9",
    "100": "#c6f5df",
    "200": "#83e9b9",
    "300": "#26d985",
    "400": "#21be74",
    "500": "#1da364",
    "600": "#188753",
    "700": "#126940",
    "800": "#0f5635",
    "900": "#0c472b",
  },
  primary: {
    "50": "#e9fbf9",
    "100": "#a0eee5",
    "200": "#37dcc8",
    "300": "#20b9a7",
    "400": "#1da696",
    "500": "#198c7e",
    "600": "#15766b",
    "700": "#115f56",
    "800": "#0e5048",
    "900": "#0a3a34",
  },
};

const config: ThemeConfig = {
  initialColorMode: "light", // Default color mode
  useSystemColorMode: true, // Disable system preference color mode
};

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: "Source Sans Pro, Poppins, Merriweather, serif",
    body: "Source Sans Pro, Poppins, Merriweather, serif",
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
