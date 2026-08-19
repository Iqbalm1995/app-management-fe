"use client";

import { Box, Flex, HStack, Icon, Text, useColorMode } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";

interface StepperBarProps {
  steps: string[];
  currentStep: number;
}

const StepperBar = ({ steps, currentStep }: StepperBarProps) => {
  const { colorMode } = useColorMode();

  return (
    <HStack spacing={0} w="full" overflowX="auto" py={4}>
      {steps.map((label, idx) => {
        const isDone = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <Flex key={idx} align="center" flex={idx < steps.length - 1 ? 1 : "none"}>
            {/* Circle */}
            <Flex direction="column" align="center" minW="40px">
              <Flex
                w="32px"
                h="32px"
                rounded="full"
                align="center"
                justify="center"
                fontSize="sm"
                fontWeight="bold"
                transition="all 0.2s"
                bg={isDone ? "green.500" : isActive ? "blue.500" : "transparent"}
                color={isDone || isActive ? "white" : colorMode === "light" ? "gray.400" : "gray.500"}
                border={!isDone && !isActive ? "2px solid" : "none"}
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                boxShadow={isActive ? "0 0 0 4px rgba(66, 153, 225, 0.3)" : "none"}
              >
                {isDone ? <Icon as={FiCheck} boxSize={4} /> : idx + 1}
              </Flex>
              {/* Label — hide on mobile */}
              <Text
                fontSize="2xs"
                mt={1}
                textAlign="center"
                maxW="70px"
                noOfLines={2}
                color={isDone ? "green.600" : isActive ? "blue.600" : "gray.500"}
                fontWeight={isActive ? "semibold" : "normal"}
                display={{ base: "none", md: "block" }}
              >
                {label}
              </Text>
            </Flex>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <Box
                flex={1}
                h="2px"
                mx={1}
                bg={idx < currentStep ? "green.500" : colorMode === "light" ? "gray.200" : "gray.600"}
                transition="all 0.2s"
              />
            )}
          </Flex>
        );
      })}
    </HStack>
  );
};

export default StepperBar;
