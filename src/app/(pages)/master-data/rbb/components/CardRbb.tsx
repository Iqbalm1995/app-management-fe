"use client";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";
import { MstRbbResponse } from "@/app/services/useMstRbb";
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
  SimpleGrid,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FiTarget,
  FiBriefcase,
  FiLayers,
  FiDollarSign,
  FiArrowRight,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiPieChart,
} from "react-icons/fi";

interface CardRbbProps {
  data: MstRbbResponse;
}

export const CardRbb = ({ data }: CardRbbProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Calculate total budget from all attached work programs
  const totalBudget = (data.workPrograms || []).reduce(
    (acc, wp) => acc + (wp.budgetValue || 0),
    0
  );

  const workProgramsCount = data.workPrograms?.length || 0;

  // Extract initials for hero avatar box
  const initials = data.targetName
    ? data.targetName
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : data.targetCode?.substring(0, 2) || "RB";

  // CAPEX vs OPEX counts
  const capexCount = (data.workPrograms || []).filter(
    (wp) => wp.budgetType?.toUpperCase() === "CAPEX"
  ).length;
  const opexCount = (data.workPrograms || []).filter(
    (wp) => wp.budgetType?.toUpperCase() === "OPEX"
  ).length;

  return (
    <Link
      href={`/master-data/rbb/detail?id=${data.id}`}
      style={{ textDecoration: "none", width: "100%", display: "block" }}
    >
      <Card
        rounded={radiusStyle}
        shadow="lg"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
        overflow="hidden"
        h="full"
        cursor="pointer"
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-5px)",
          shadow: "2xl",
          borderColor: "secondary.500",
        }}
      >
        {/* ── Small Hero Banner ── */}
        <Box
          bgGradient="linear(to-br, secondary.800, secondary.500)"
          color="white"
          p={{ base: 4, md: 4.5 }}
          position="relative"
          overflow="hidden"
        >
          {/* Abstract background decorative shapes */}
          <Box
            position="absolute"
            top="-15px"
            right="-15px"
            w="65px"
            h="65px"
            bg="whiteAlpha.150"
            rounded="full"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="-10px"
            right="55px"
            w="40px"
            h="40px"
            bg="whiteAlpha.100"
            transform="rotate(45deg)"
            pointerEvents="none"
          />

          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            <HStack spacing={3.5} align="center">
              {/* Frosted Avatar Icon */}
              <Box
                w="46px"
                h="46px"
                bg="whiteAlpha.250"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="md"
                fontWeight="extrabold"
                letterSpacing="wider"
                shadow="md"
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                flexShrink={0}
              >
                {initials}
              </Box>

              <VStack align="start" spacing={0.5} overflow="hidden">
                <HStack spacing={1.5} wrap="wrap">
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    rounded="md"
                    fontWeight="bold"
                    letterSpacing="wider"
                  >
                    {data.targetCode}
                  </Badge>
                  {data.policyCode && (
                    <Badge
                      bg="blackAlpha.350"
                      color="white"
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      rounded="md"
                      fontWeight="semibold"
                    >
                      {data.policyCode}
                    </Badge>
                  )}
                </HStack>
                <Text
                  fontSize="xs"
                  color="whiteAlpha.800"
                  fontWeight="medium"
                  noOfLines={1}
                >
                  {data.orgDirectorateName || data.orgDirectorateCode || "IT Directorate"}
                </Text>
              </VStack>
            </HStack>

            {/* Work Program Count Badge */}
            <Badge
              bg="white"
              color="secondary.700"
              fontSize="xs"
              px={2.5}
              py={1}
              rounded="full"
              fontWeight="extrabold"
              shadow="sm"
            >
              {workProgramsCount} Prog
            </Badge>
          </Flex>
        </Box>

        {/* ── Card Body ── */}
        <CardBody p={{ base: 4, md: 5 }}>
          <VStack align="stretch" spacing={4}>
            {/* Target Name & Policy */}
            <Box>
              <Heading
                size="sm"
                fontSize="md"
                fontWeight="800"
                color={isDark ? "white" : "gray.800"}
                noOfLines={2}
                lineHeight="tall"
                mb={1}
              >
                {data.targetName}
              </Heading>
              <HStack spacing={2} align="center" color="gray.500" fontSize="sm">
                <Icon as={FiFileText} color="secondary.500" boxSize={4} flexShrink={0} />
                <Text fontSize="sm" noOfLines={1} fontWeight="medium">
                  {data.policyName || "Corporate Strategic Policy"}
                </Text>
              </HStack>
            </Box>

            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

            {/* Division & Group Metadata */}
            <HStack spacing={2.5} align="center">
              <Icon as={FiLayers} color="purple.500" boxSize={4} flexShrink={0} />
              <VStack align="start" spacing={0} overflow="hidden">
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontWeight="semibold"
                  textTransform="uppercase"
                >
                  Executing Division
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={isDark ? "gray.200" : "gray.700"}
                  noOfLines={1}
                >
                  {data.orgDivisionName || data.orgDivisionCode || "IT Operations Division"}
                  {data.orgGroupName && ` • Group ${data.orgGroupName}`}
                </Text>
              </VStack>
            </HStack>

            {/* Total Budget Allocation Box */}
            <Box
              bg={isDark ? "gray.750" : "gray.50"}
              p={3.5}
              rounded="xl"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.200"}
            >
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                    Total Budget Allocation
                  </Text>
                  <Text
                    fontSize="md"
                    fontWeight="extrabold"
                    color="purple.500"
                    letterSpacing="tight"
                  >
                    {formatIDR(totalBudget)}
                  </Text>
                </VStack>

                <HStack spacing={1.5}>
                  {capexCount > 0 && (
                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                      {capexCount} CAPEX
                    </Badge>
                  )}
                  {opexCount > 0 && (
                    <Badge colorScheme="purple" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                      {opexCount} OPEX
                    </Badge>
                  )}
                  {workProgramsCount === 0 && (
                    <Badge colorScheme="gray" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                      No Programs
                    </Badge>
                  )}
                </HStack>
              </Flex>
            </Box>

            {/* Top 2 Work Programs Snippet Preview */}
            {data.workPrograms && data.workPrograms.length > 0 && (
              <VStack align="stretch" spacing={2}>
                <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                  Related Work Programs ({data.workPrograms.length})
                </Text>
                {data.workPrograms.slice(0, 2).map((wp, idx) => (
                  <HStack
                    key={wp.id || idx}
                    justify="space-between"
                    p={2}
                    bg={isDark ? "gray.750" : "gray.50"}
                    rounded="lg"
                    fontSize="xs"
                    borderLeft="3px solid"
                    borderColor="secondary.500"
                  >
                    <VStack align="start" spacing={0} maxW="65%">
                      <Text
                        fontWeight="bold"
                        color={isDark ? "white" : "gray.800"}
                        noOfLines={1}
                      >
                        {wp.workProgramCode}
                      </Text>
                      <Text fontSize="3xs" color="gray.500" noOfLines={1}>
                        {wp.workProgramDesc || wp.itspName}
                      </Text>
                    </VStack>

                    <Text
                      fontWeight="bold"
                      color="purple.600"
                      fontSize="2xs"
                      flexShrink={0}
                    >
                      {formatIDR(wp.budgetValue)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}

            {/* ── Footer Information Row ── */}
            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

            <Flex justify="space-between" align="center" fontSize="xs" color="gray.500" pt={0.5}>
              <HStack spacing={1.5}>
                <Icon as={FiCalendar} boxSize={3.5} />
                <Text fontSize="xs">
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "RBB Target"}
                </Text>
              </HStack>

              <HStack spacing={1} color="secondary.500" fontWeight="bold" fontSize="xs">
                <Text>Target Detail</Text>
                <Icon as={FiArrowRight} boxSize={3.5} />
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </Link>
  );
};
