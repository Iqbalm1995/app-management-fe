"use client";

import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiCode,
  FiBriefcase,
  FiFileText,
  FiGitPullRequest,
  FiCheck,
} from "react-icons/fi";
import { ActivityType } from "../types";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_META } from "../constants/stageTemplates";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface ActivityTypeSelectorProps {
  value: ActivityType;
  onChange: (type: ActivityType) => void;
}

const STREAM_DETAILS: Record<
  ActivityType,
  { icon: typeof FiCode; desc: string }
> = {
  "INTERNAL DEVELOPMENT": {
    icon: FiCode,
    desc: "SDLC & Sprint Roadmap",
  },
  PROCUREMENT: {
    icon: FiBriefcase,
    desc: "Vendor & PO Sourcing",
  },
  RFC: {
    icon: FiGitPullRequest,
    desc: "Change Advisory & CAB",
  },
};

/**
 * Modern workflow selector list for the simulation stream.
 * Displays interactive selectable tiles with icons, descriptions, and active status indicators.
 */
const ActivityTypeSelector = ({
  value,
  onChange,
}: ActivityTypeSelectorProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <VStack align="stretch" spacing={2.5}>
      {ACTIVITY_TYPES.map((type) => {
        const meta = ACTIVITY_TYPE_META[type];
        const details = STREAM_DETAILS[type];
        const isActive = value === type;

        return (
          <Box
            key={type}
            as="button"
            type="button"
            textAlign="left"
            w="full"
            p={2.5}
            rounded={radiusStyle}
            border="1.5px solid"
            borderColor={
              isActive
                ? "secondary.500"
                : isDark
                ? "gray.700"
                : "gray.200"
            }
            bg={
              isActive
                ? isDark
                  ? "whiteAlpha.150"
                  : "secondary.50"
                : isDark
                ? "whiteAlpha.50"
                : "white"
            }
            shadow={isActive ? "sm" : "none"}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            cursor="pointer"
            onClick={() => onChange(type)}
            _hover={{
              borderColor: isActive
                ? "secondary.600"
                : isDark
                ? "gray.600"
                : "secondary.300",
              transform: "translateX(2px)",
              bg: isActive
                ? isDark
                  ? "whiteAlpha.150"
                  : "secondary.50"
                : isDark
                ? "gray.700"
                : "gray.50",
            }}
            _active={{
              transform: "scale(0.99)",
            }}
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={2.5}>
                <Box
                  w={8}
                  h={8}
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={
                    isActive
                      ? "secondary.500"
                      : isDark
                      ? "gray.700"
                      : "gray.100"
                  }
                  color={isActive ? "white" : `${meta.colorScheme}.500`}
                  flexShrink={0}
                  transition="all 0.2s ease"
                >
                  <Icon as={details.icon} boxSize={4} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize="xs"
                    fontWeight={isActive ? "700" : "600"}
                    color={
                      isActive
                        ? isDark
                          ? "white"
                          : "secondary.700"
                        : isDark
                        ? "gray.200"
                        : "gray.800"
                    }
                    lineHeight="shorter"
                  >
                    {meta.label}
                  </Text>
                  <Text
                    fontSize="2xs"
                    color={isDark ? "gray.400" : "gray.500"}
                    lineHeight="none"
                    mt={0.5}
                  >
                    {details.desc}
                  </Text>
                </VStack>
              </HStack>

              {isActive ? (
                <Box
                  w={5}
                  h={5}
                  rounded="full"
                  bg="secondary.500"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow="xs"
                >
                  <Icon as={FiCheck} boxSize={3} strokeWidth={3} />
                </Box>
              ) : (
                <Box
                  w={2}
                  h={2}
                  rounded="full"
                  bg={`${meta.colorScheme}.400`}
                  opacity={0.6}
                  mr={1.5}
                />
              )}
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
};

export default ActivityTypeSelector;
