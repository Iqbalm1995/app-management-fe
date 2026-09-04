"use client";

import {
  Badge,
  Box,
  Button,
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
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiSlash,
  FiShield,
  FiFileText,
  FiPlusSquare,
  FiBarChart2,
  FiArrowRight,
  FiClock,
  FiLayers,
  FiHelpCircle,
  FiActivity,
} from "react-icons/fi";
import { VendorResponse } from "@/app/services/useVendor";

interface VendorSidebarProps {
  DataVendors: VendorResponse[];
  totalVendorsCount: number;
  totalActiveVendorsCount: number;
  totalBlacklistVendorsCount: number;
  totalInactiveVendorsCount: number;
  selectedStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
}

export const VendorSidebar = ({
  DataVendors,
  totalVendorsCount,
  totalActiveVendorsCount,
  totalBlacklistVendorsCount,
  totalInactiveVendorsCount,
  selectedStatusFilter = "",
  onSelectStatus,
}: VendorSidebarProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Calculate high risk stats
  const highDependencyCount = DataVendors.filter(
    (v) => v.depedencyLevel?.toUpperCase() === "HIGH"
  ).length;
  const highImpactCount = DataVendors.filter(
    (v) => v.businessImpact?.toUpperCase() === "HIGH"
  ).length;

  const STATUS_ITEMS = [
    { key: "ACTIVE", label: "Active", count: totalActiveVendorsCount, color: "green", icon: FiCheckCircle },
    { key: "INACTIVE", label: "Inactive / Review", count: totalInactiveVendorsCount, color: "orange", icon: FiAlertCircle },
    { key: "BLACKLIST", label: "Blacklist", count: totalBlacklistVendorsCount, color: "red", icon: FiSlash },
  ];

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* ── Widget 1: Vendor Quick Stats & Health ── */}
      <Card
        rounded="2xl"
        shadow="xl"
        border="1px"
        borderColor={isDark ? "secondary.700" : "secondary.300"}
        bg={isDark ? "gray.800" : "white"}
        overflow="hidden"
      >
        <Box bgGradient="linear(to-br, secondary.700, secondary.500)" p={4} color="white">
          <HStack spacing={3}>
            <Box
              w={12}
              h={12}
              bg="whiteAlpha.200"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
            >
              <Icon as={FiBriefcase} boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm" fontWeight="bold">
                Vendor Hub Overview
              </Heading>
              <Text fontSize="xs" opacity={0.9}>
                Vendor Stats & Status Distribution
              </Text>
            </VStack>
          </HStack>
        </Box>

        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* 2-Col KPI Counters */}
            <SimpleGrid columns={2} spacing={3}>
              <Box
                textAlign="center"
                p={3.5}
                bg={isDark ? "gray.750" : "blue.50"}
                rounded="xl"
                border="1px"
                borderColor={isDark ? "gray.700" : "blue.100"}
              >
                <Text fontSize="2xl" fontWeight="800" color="blue.500" lineHeight="none">
                  {totalVendorsCount}
                </Text>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"} fontWeight="bold" mt={1.5}>
                  Total Vendors
                </Text>
              </Box>

              <Box
                textAlign="center"
                p={3.5}
                bg={isDark ? "gray.750" : "green.50"}
                rounded="xl"
                border="1px"
                borderColor={isDark ? "gray.700" : "green.100"}
              >
                <Text fontSize="2xl" fontWeight="800" color="green.500" lineHeight="none">
                  {totalActiveVendorsCount}
                </Text>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"} fontWeight="bold" mt={1.5}>
                  Active Vendors
                </Text>
              </Box>
            </SimpleGrid>

            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />

            {/* Status Breakdown with filter click */}
            <VStack spacing={2} align="stretch">
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Vendor Status Breakdown
              </Text>
              {STATUS_ITEMS.map((item) => {
                const isSelected = selectedStatusFilter === item.key;
                return (
                  <Button
                    key={item.key}
                    size="md"
                    variant={isSelected ? "solid" : "ghost"}
                    colorScheme={item.color}
                    justifyContent="space-between"
                    leftIcon={<Icon as={item.icon} boxSize={4} />}
                    onClick={() => onSelectStatus?.(item.key)}
                    rounded="xl"
                    px={3.5}
                    py={2.5}
                    h="auto"
                    _hover={{
                      transform: "translateY(-1px)",
                      bg: isSelected
                        ? undefined
                        : isDark
                        ? "whiteAlpha.100"
                        : `${item.color}.50`,
                    }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" fontWeight={isSelected ? "bold" : "semibold"}>
                        {item.label}
                      </Text>
                      <Badge
                        colorScheme={item.color}
                        variant={isSelected ? "solid" : "subtle"}
                        rounded="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {item.count}
                      </Badge>
                    </HStack>
                  </Button>
                );
              })}
            </VStack>

            {/* Risk Profile Highlights */}
            <Box
              p={3.5}
              bg={isDark ? "gray.750" : "gray.50"}
              rounded="xl"
              border="1px"
              borderColor={isDark ? "gray.700" : "gray.150"}
            >
              <VStack align="stretch" spacing={2.5}>
                <HStack spacing={2}>
                  <Icon as={FiActivity} color="secondary.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" color={isDark ? "gray.200" : "gray.700"}>
                    Identified Risk Metrics
                  </Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.500" fontSize="sm">High Dependency:</Text>
                  <Badge colorScheme="red" variant="subtle" rounded="md" px={2} py={0.5} fontSize="xs" fontWeight="bold">
                    {highDependencyCount} vendors
                  </Badge>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.500" fontSize="sm">High Business Impact:</Text>
                  <Badge colorScheme="orange" variant="subtle" rounded="md" px={2} py={0.5} fontSize="xs" fontWeight="bold">
                    {highImpactCount} vendors
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* ── Widget 2: Recommended Navigation & Shortcuts ── */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
      >
        <CardBody p={5}>
          <VStack spacing={3.5} align="stretch">
            <HStack spacing={2.5}>
              <Box
                w={8}
                h={8}
                bg={isDark ? "purple.900" : "purple.50"}
                color="secondary.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiLayers} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                  Navigation & Quick Shortcuts
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Procurement & partner management modules
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={2.5} align="stretch" pt={1}>
              {/* Shortcut: Contracts Hub */}
              <Link href="/vendor-management/contracts" style={{ textDecoration: "none" }}>
                <Box
                  p={3}
                  rounded="xl"
                  border="1px"
                  borderColor={isDark ? "gray.700" : "gray.100"}
                  bg={isDark ? "gray.750" : "gray.50"}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: "secondary.500",
                    bg: isDark ? "gray.700" : "purple.50",
                    transform: "translateX(3px)",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon as={FiFileText} color="secondary.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                          Vendor Contracts
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Manage POs, terms & SLA
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="gray.400" boxSize={4} />
                  </Flex>
                </Box>
              </Link>

              {/* Shortcut: Register New Vendor */}
              <Link href="/vendor-management/register" style={{ textDecoration: "none" }}>
                <Box
                  p={3}
                  rounded="xl"
                  border="1px"
                  borderColor={isDark ? "gray.700" : "gray.100"}
                  bg={isDark ? "gray.750" : "gray.50"}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: "blue.500",
                    bg: isDark ? "gray.700" : "blue.50",
                    transform: "translateX(3px)",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon as={FiPlusSquare} color="blue.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                          Register New Vendor
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Add new master vendor partner
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="gray.400" boxSize={4} />
                  </Flex>
                </Box>
              </Link>

              {/* Shortcut: Project Portfolio Report */}
              <Link href="/reports/project-portfolio" style={{ textDecoration: "none" }}>
                <Box
                  p={3}
                  rounded="xl"
                  border="1px"
                  borderColor={isDark ? "gray.700" : "gray.100"}
                  bg={isDark ? "gray.750" : "gray.50"}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: "green.500",
                    bg: isDark ? "gray.700" : "green.50",
                    transform: "translateX(3px)",
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon as={FiBarChart2} color="green.500" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                          Portfolio Reports
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Project performance monitoring
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="gray.400" boxSize={4} />
                  </Flex>
                </Box>
              </Link>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* ── Widget 3: Vendor Governance & Guide ── */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
      >
        <CardBody p={5}>
          <VStack spacing={3.5} align="stretch">
            <HStack spacing={2.5}>
              <Box
                w={8}
                h={8}
                bg={isDark ? "blue.900" : "blue.50"}
                color="blue.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiShield} boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="xs" color={isDark ? "white" : "gray.800"}>
                  Compliance & Governance
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  TDR legality & due diligence guidance
                </Text>
              </VStack>
            </HStack>

            <Box
              p={3.5}
              bg={isDark ? "blue.900" : "blue.50"}
              rounded="xl"
              border="1px"
              borderColor={isDark ? "blue.800" : "blue.100"}
            >
              <Text fontSize="sm" color={isDark ? "blue.200" : "blue.800"} lineHeight="tall">
                The validity period for <strong>Vendor Registration Certificate (TDR)</strong> is 2 years.
                Ensure document renewals are submitted prior to expiration for seamless contract operations.
              </Text>
            </Box>

            <HStack spacing={2} fontSize="xs" color="gray.500" pt={1}>
              <Icon as={FiHelpCircle} boxSize={4} color="secondary.500" />
              <Text>Procurement Helpdesk: Ext. 2341 / 2342</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default VendorSidebar;
