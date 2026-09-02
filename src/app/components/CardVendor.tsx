"use client";

import { VendorResponse } from "@/app/services/useVendor";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Badge,
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiSlash,
  FiMapPin,
  FiUser,
  FiMail,
  FiArrowRight,
  FiFileText,
  FiShield,
  FiCalendar,
  FiActivity,
  FiBriefcase,
} from "react-icons/fi";

interface CardVendorProps {
  data: VendorResponse;
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "green";
    case "INACTIVE":
      return "orange";
    case "BLACKLIST":
      return "red";
    default:
      return "gray";
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return FiCheckCircle;
    case "INACTIVE":
      return FiAlertCircle;
    case "BLACKLIST":
      return FiSlash;
    default:
      return FiBriefcase;
  }
};

const getRiskScheme = (val?: string | null) => {
  switch (val?.toUpperCase()) {
    case "HIGH":
      return "red";
    case "MEDIUM":
      return "orange";
    case "LOW":
      return "teal";
    default:
      return "gray";
  }
};

export const CardVendor = ({ data }: CardVendorProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const StatusIcon = getStatusIcon(data.status);
  const statusColor = getStatusColor(data.status);

  // TDR evaluation
  const activeTdr = data.tdrList && data.tdrList.length > 0 ? data.tdrList[0] : null;
  const isTdrExpired = activeTdr
    ? new Date(activeTdr.expiredAt).getTime() < new Date().getTime()
    : false;

  // Extract initials for hero logo
  const initials = data.vendorName
    ? data.vendorName
        .replace(/^(PT|CV|UD|Firma|Koperasi)\.?\s*/i, "")
        .trim()
        .substring(0, 2)
        .toUpperCase()
    : "VN";

  // Formatted date
  const registeredDateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/vendor-management/detail?id=${data.id}`}
      style={{ width: "100%", textDecoration: "none", display: "flex" }}
    >
      <Card
        w="full"
        h="full"
        role="group"
        rounded={radiusStyle}
        shadow="md"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
        overflow="hidden"
        transition="all 0.25s ease-in-out"
        _hover={{
          transform: "translateY(-6px)",
          shadow: "2xl",
          borderColor: "secondary.500",
          cursor: "pointer",
        }}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        {/* ── Small Hero Banner (Secondary Gradient & Floating Badges) ── */}
        <Box
          position="relative"
          bgGradient={
            isDark
              ? "linear(to-br, secondary.900, secondary.600)"
              : "linear(to-br, secondary.800, secondary.500)"
          }
          color="white"
          px={5}
          py={3.5}
          overflow="hidden"
        >
          {/* Abstract decorative accents */}
          <Box
            position="absolute"
            top="-15px"
            right="-15px"
            w="70px"
            h="70px"
            bg="whiteAlpha.200"
            rounded="full"
          />
          <Box
            position="absolute"
            bottom="-10px"
            left="45%"
            w="40px"
            h="40px"
            bg="whiteAlpha.150"
            rounded="md"
            transform="rotate(30deg)"
          />

          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            {/* Left: Avatar Initials & Code / Type Badges */}
            <HStack spacing={3}>
              <Box
                w="44px"
                h="44px"
                bg="whiteAlpha.250"
                backdropFilter="blur(10px)"
                rounded="xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="md"
                fontWeight="extrabold"
                color="white"
                shadow="md"
                flexShrink={0}
              >
                {initials}
              </Box>
              <VStack align="start" spacing={1}>
                <HStack spacing={1.5}>
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    variant="solid"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                    fontWeight="bold"
                  >
                    {data.vendorCode || "N/A"}
                  </Badge>
                  <Badge
                    bg="blackAlpha.400"
                    color="white"
                    variant="solid"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                    fontWeight="semibold"
                  >
                    {data.vendorType || "PT"}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.900" fontWeight="medium">
                  Master Vendor
                </Text>
              </VStack>
            </HStack>

            {/* Right: Status Badge */}
            <Badge
              colorScheme={statusColor}
              variant="solid"
              rounded="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="bold"
              shadow="md"
              display="flex"
              alignItems="center"
              gap={1.5}
            >
              <Icon as={StatusIcon} boxSize={3.5} />
              {data.status || "UNKNOWN"}
            </Badge>
          </Flex>
        </Box>

        {/* ── Body Content (Clean, Sleek & Unboxed Layout) ── */}
        <CardBody p={5} flex={1} display="flex" flexDirection="column" justifyContent="space-between">
          <VStack align="stretch" spacing={3.5}>
            {/* Vendor Name & Location */}
            <Box>
              <Heading
                size="md"
                fontWeight="700"
                color={isDark ? "white" : "gray.800"}
                noOfLines={2}
                title={data.vendorName}
                lineHeight="1.3"
                _groupHover={{ color: "secondary.500" }}
                transition="color 0.2s"
              >
                {data.vendorName}
              </Heading>

              {/* Location */}
              <HStack spacing={2} mt={1.5} color={isDark ? "gray.300" : "gray.600"}>
                <Icon as={FiMapPin} color="red.400" boxSize={4} flexShrink={0} />
                <Text fontSize="md" fontWeight="medium" noOfLines={1}>
                  {data.city ? `${data.city}, ${data.country || "Indonesia"}` : "Location not set"}
                </Text>
              </HStack>
            </Box>

            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />

            {/* ── Metadata Row 1: PIC Bisnis & Kontak ── */}
            <HStack spacing={3} align="flex-start">
              <Icon as={FiUser} color="secondary.500" boxSize={4} mt={1} flexShrink={0} />
              <VStack align="start" spacing={0} overflow="hidden">
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={isDark ? "white" : "gray.800"}
                  noOfLines={1}
                >
                  {data.picBusinessName || "No Business PIC Registered"}
                </Text>
                <HStack spacing={1.5} color={isDark ? "gray.400" : "gray.600"}>
                  <Icon as={FiMail} boxSize={3.5} flexShrink={0} />
                  <Text fontSize="sm" noOfLines={1}>
                    {data.picBusinessEmail || data.picBusinessNumberHotline || "—"}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* ── Metadata Row 2: Profil Risiko (Inline Badges) ── */}
            <HStack spacing={3} align="center">
              <Icon as={FiActivity} color="orange.400" boxSize={4} flexShrink={0} />
              <HStack spacing={2} wrap="wrap">
                <HStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    Dependency:
                  </Text>
                  <Badge
                    colorScheme={getRiskScheme(data.depedencyLevel)}
                    variant="subtle"
                    fontSize="xs"
                    rounded="md"
                    px={2}
                    py={0.5}
                    fontWeight="bold"
                  >
                    {data.depedencyLevel || "LOW"}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.400">
                  •
                </Text>
                <HStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    Impact:
                  </Text>
                  <Badge
                    colorScheme={getRiskScheme(data.businessImpact)}
                    variant="subtle"
                    fontSize="xs"
                    rounded="md"
                    px={2}
                    py={0.5}
                    fontWeight="bold"
                  >
                    {data.businessImpact || "LOW"}
                  </Badge>
                </HStack>
              </HStack>
            </HStack>

            {/* ── Metadata Row 3: Legalitas & TDR ── */}
            <HStack spacing={3} align="center" justify="space-between">
              <HStack spacing={2.5}>
                <Icon
                  as={activeTdr ? (isTdrExpired ? FiAlertCircle : FiShield) : FiFileText}
                  color={activeTdr ? (isTdrExpired ? "red.400" : "teal.400") : "gray.400"}
                  boxSize={4}
                  flexShrink={0}
                  />
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={isDark ? "gray.200" : "gray.700"}
                  noOfLines={1}
                >
                  {activeTdr ? `TDR: ${activeTdr.trdNumber}` : "No Registered TDR"}
                </Text>
              </HStack>
              <Badge
                colorScheme={activeTdr ? (isTdrExpired ? "red" : "teal") : "gray"}
                variant="subtle"
                fontSize="xs"
                rounded="full"
                px={2.5}
                py={0.5}
                fontWeight="bold"
                flexShrink={0}
              >
                {activeTdr ? (isTdrExpired ? "Expired" : "Valid") : "No TDR"}
              </Badge>
            </HStack>
          </VStack>

          {/* ── Sleek Footer Information Bar (Replaces the large button) ── */}
          <Box mt={4} pt={3} borderTop="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
            <Flex justify="space-between" align="center">
              <HStack spacing={1.5} color={isDark ? "gray.400" : "gray.500"} fontSize="xs">
                <Icon as={FiCalendar} boxSize={3.5} />
                <Text>Registered: {registeredDateStr}</Text>
              </HStack>

              <HStack
                spacing={1}
                color="secondary.500"
                fontWeight="bold"
                fontSize="xs"
                _groupHover={{ color: "secondary.400", transform: "translateX(2px)" }}
                transition="all 0.2s"
              >
                <Text>Details</Text>
                <Icon as={FiArrowRight} boxSize={3.5} />
              </HStack>
            </Flex>
          </Box>
        </CardBody>
      </Card>
    </Link>
  );
};

export default CardVendor;
