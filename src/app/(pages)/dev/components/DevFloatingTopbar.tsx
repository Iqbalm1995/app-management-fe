"use client";

import React from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  useColorMode,
  Spacer,
} from "@chakra-ui/react";
import { FiArrowLeft, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DevFloatingTopbarProps {
  projectName?: string;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
}

export const DevFloatingTopbar: React.FC<DevFloatingTopbarProps> = ({
  projectName,
  showBack = false,
  backHref = "/dev",
  backLabel = "Back",
}) => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleExitDevMode = () => {
    localStorage.removeItem("dev_mode");
    localStorage.removeItem("dev_selected_project");
    router.push("/home");
  };

  return (
    <Box
      position="fixed"
      top="12px"
      left="50%"
      transform="translateX(-50%)"
      zIndex={100}
      w={{ base: "calc(100% - 24px)", md: "calc(100% - 48px)" }}
      maxW="1400px"
    >
      <Flex
        bg={colorMode === "light" ? "whiteAlpha.950" : "gray.900"}
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        borderRadius="xl"
        px={4}
        py={2.5}
        align="center"
        boxShadow="sm"
      >
        <HStack spacing={3}>
          {showBack && (
            <Link href={backHref}>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiArrowLeft />}
                borderRadius="md"
              >
                {backLabel}
              </Button>
            </Link>
          )}

          <HStack spacing={2}>
            <Badge
              colorScheme="purple"
              variant="subtle"
              fontFamily="mono"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="xs"
            >
              DEV
            </Badge>
            <Text fontWeight={600} fontSize="sm" letterSpacing="-0.01em">
              Developer Mode
            </Text>
          </HStack>

          {projectName && (
            <>
              <Text color={colorMode === "light" ? "gray.300" : "gray.600"}>
                /
              </Text>
              <Text
                fontSize="sm"
                fontWeight={500}
                color={colorMode === "light" ? "gray.700" : "gray.300"}
                noOfLines={1}
                maxW={{ base: "140px", sm: "240px", md: "400px" }}
              >
                {projectName}
              </Text>
            </>
          )}
        </HStack>

        <Spacer />

        <HStack spacing={2}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            size="sm"
            variant="ghost"
            onClick={toggleColorMode}
          />

          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={<FiLogOut />}
            onClick={handleExitDevMode}
            fontSize="xs"
            borderRadius="md"
          >
            Exit Dev
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default DevFloatingTopbar;
