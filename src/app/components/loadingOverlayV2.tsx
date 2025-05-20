// components/SpinnerLauncher.tsx
"use client";

import { Center, Spinner, Text } from "@chakra-ui/react";

const SpinnerLauncher = () => (
  <Center minH="60vh" flexDir="column" gap={4}>
    <Spinner size="xl" color="blue.400" />
    <Text>Loading...</Text>
  </Center>
);

export default SpinnerLauncher;
