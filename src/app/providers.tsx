// app/providers.tsx
"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import { Provider } from "react-redux";
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
  blue: {
    "50": "#eff7ff",
    "100": "#c4e1ff",
    "200": "#98caff",
    "300": "#66b0ff",
    "400": "#3295ff",
    "500": "#007afd",
    "600": "#0066d4",
    "700": "#004fa3",
    "800": "#004186",
    "900": "#00356e",
  },
  purple: {
    "50": "#f9f5ff",
    "100": "#e6d9ff",
    "200": "#d3bcff",
    "300": "#b891ff",
    "400": "#a473ff",
    "500": "#8746ff",
    "600": "#6c1eff",
    "700": "#5100e7",
    "800": "#4300c0",
    "900": "#330092",
  },
  pink: {
    "50": "#fff5fa",
    "100": "#ffd6ea",
    "200": "#ffb3d8",
    "300": "#ff7fbd",
    "400": "#ff51a5",
    "500": "#ef0073",
    "600": "#ce0063",
    "700": "#a90052",
    "800": "#860041",
    "900": "#650031",
  },
  red: {
    "50": "#fff5f5",
    "100": "#ffd7d6",
    "200": "#ffb2b0",
    "300": "#ff7f7d",
    "400": "#ff5c59",
    "500": "#fa0400",
    "600": "#d50300",
    "700": "#ad0300",
    "800": "#940200",
    "900": "#6e0200",
  },
  orange: {
    "50": "#fffaf4",
    "100": "#ffead3",
    "200": "#ffd09e",
    "300": "#ffa94d",
    "400": "#fa8100",
    "500": "#d77000",
    "600": "#b65e00",
    "700": "#914b00",
    "800": "#723b00",
    "900": "#5e3100",
  },
  yellow: {
    "50": "#fffef9",
    "100": "#fffadb",
    "200": "#ffee8e",
    "300": "#ffde23",
    "400": "#edca00",
    "500": "#c3a600",
    "600": "#9c8500",
    "700": "#7a6800",
    "800": "#5b4e00",
    "900": "#4b4000",
  },
  green: {
    "50": "#effff7",
    "100": "#99ffce",
    "200": "#00f57f",
    "300": "#00da71",
    "400": "#00bf63",
    "500": "#00a455",
    "600": "#008847",
    "700": "#006a37",
    "800": "#00572d",
    "900": "#004825",
  },
  teal: {
    "50": "#e6ffff",
    "100": "#6ffdff",
    "200": "#00ecf0",
    "300": "#00d3d6",
    "400": "#00b3b6",
    "500": "#00989b",
    "600": "#007c7e",
    "700": "#006062",
    "800": "#005052",
    "900": "#004243",
  },
  cyan: {
    "50": "#effcff",
    "100": "#bbf2ff",
    "200": "#99ecff",
    "300": "#6de4ff",
    "400": "#00c4f1",
    "500": "#00b4dd",
    "600": "#00a3c7",
    "700": "#0087a5",
    "800": "#006f88",
    "900": "#005669",
  },
  primary: {
    "50": "#f2f8ff",
    "100": "#c9e3ff",
    "200": "#98caff",
    "300": "#5aaaff",
    "400": "#3496ff",
    "500": "#0079fa",
    "600": "#0066d3",
    "700": "#0052aa",
    "800": "#004690",
    "900": "#003369",
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
