import { Box, VStack } from "@chakra-ui/react";

// Horizontal Divider with Fade Effect
export const HorizontalFadeDivider = () => {
  return (
    <Box
      h="2px"
      w="full"
      bgGradient="linear(to-r, transparent, gray.200, gray.200, transparent)"
    />
  );
};

// Vertical Divider with Fade Effect
export const VerticalFadeDivider = () => {
  return (
    <Box
      w="2px"
      h="full"
      bgGradient="linear(to-b, transparent, gray.200, gray.200, transparent)"
    />
  );
};
