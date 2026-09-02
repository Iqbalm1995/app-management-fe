"use client";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { formatIDR } from "@/app/components/CardContract";
import { MstRbbResponse } from "@/app/services/useMstRbb";
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
  Progress,
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
  FiPlusSquare,
  FiBarChart2,
  FiHelpCircle,
  FiShield,
  FiFileText,
  FiCheckCircle,
  FiPieChart,
} from "react-icons/fi";

interface RbbSidebarProps {
  dataMstRbb: MstRbbResponse[];
  totalCount: number;
  totalWorkProgramsCount: number;
  totalBudgetValueSum: number;
  selectedDirectorateId?: string;
  onSelectDirectorate?: (dirId: string) => void;
}

export const RbbSidebar = ({
  dataMstRbb,
  totalCount,
  totalWorkProgramsCount,
  totalBudgetValueSum,
  selectedDirectorateId = "",
  onSelectDirectorate,
}: RbbSidebarProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Calculate total CAPEX and OPEX values
  const { totalCapex, totalOpex, capexCount, opexCount } = dataMstRbb.reduce(
    (acc, curr) => {
      (curr.workPrograms || []).forEach((wp) => {
        const val = wp.budgetValue || 0;
        if (wp.budgetType?.toUpperCase() === "CAPEX") {
          acc.totalCapex += val;
          acc.capexCount += 1;
        } else if (wp.budgetType?.toUpperCase() === "OPEX") {
          acc.totalOpex += val;
          acc.opexCount += 1;
        }
      });
      return acc;
    },
    { totalCapex: 0, totalOpex: 0, capexCount: 0, opexCount: 0 }
  );

  const totalCalculatedBudget = totalCapex + totalOpex || 1;
  const capexPercentage = Math.round((totalCapex / totalCalculatedBudget) * 100);
  const opexPercentage = Math.round((totalOpex / totalCalculatedBudget) * 100);

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* ── Widget 1: RBB & Budget Quick Overview ── */}
      <Card
        rounded={radiusStyle}
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
              <Icon as={FiTarget} boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm" fontWeight="bold">
                RBB Hub Overview
              </Heading>
              <Text fontSize="xs" opacity={0.9}>
                Target & Work Program Budget Statistics
              </Text>
            </VStack>
          </HStack>
        </Box>

        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* Top Metric Strip */}
            <SimpleGrid columns={2} spacing={3}>
              <Box
                p={3.5}
                rounded="xl"
                bg={isDark ? "gray.750" : "gray.50"}
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                  Total Targets
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color={isDark ? "white" : "gray.800"}>
                  {totalCount}
                </Text>
                <Text fontSize="3xs" color="gray.400">
                  Corporate Targets
                </Text>
              </Box>

              <Box
                p={3.5}
                rounded="xl"
                bg={isDark ? "gray.750" : "gray.50"}
                border="1px"
                borderColor={isDark ? "gray.700" : "gray.200"}
              >
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                  Work Programs
                </Text>
                <Text fontSize="2xl" fontWeight="extrabold" color="teal.500">
                  {totalWorkProgramsCount}
                </Text>
                <Text fontSize="3xs" color="gray.400">
                  Attached ITSP
                </Text>
              </Box>
            </SimpleGrid>

            {/* Total Budget Box */}
            <Box
              p={4}
              rounded="xl"
              bg={isDark ? "purple.950" : "purple.50"}
              border="1px"
              borderColor={isDark ? "purple.800" : "purple.200"}
            >
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="purple.600" fontWeight="bold" textTransform="uppercase">
                  Total Budget Allocation
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight="extrabold"
                  color={isDark ? "purple.200" : "purple.700"}
                  letterSpacing="tight"
                >
                  {formatIDR(totalBudgetValueSum)}
                </Text>
              </VStack>
            </Box>

            <Divider borderColor={isDark ? "gray.700" : "gray.200"} />

            {/* CAPEX vs OPEX Progress Allocation */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" color={isDark ? "white" : "gray.800"}>
                  Budget Allocation Distribution
                </Text>
                <Badge colorScheme="purple" fontSize="3xs" px={2} py={0.5} rounded="md">
                  {capexCount + opexCount} Packages
                </Badge>
              </HStack>

              {/* Multi-step progress bar */}
              <Box>
                <Progress
                  value={capexPercentage}
                  colorScheme="blue"
                  rounded="full"
                  size="sm"
                  bg={isDark ? "purple.800" : "purple.100"}
                />
              </Box>

              <SimpleGrid columns={2} spacing={2} pt={1}>
                <Box
                  p={2.5}
                  rounded="lg"
                  bg={isDark ? "blue.950" : "blue.50"}
                  border="1px"
                  borderColor={isDark ? "blue.800" : "blue.200"}
                >
                  <HStack justify="space-between">
                    <HStack spacing={1.5}>
                      <Box w={2} h={2} rounded="full" bg="blue.500" />
                      <Text fontSize="xs" fontWeight="bold" color="blue.600">
                        CAPEX
                      </Text>
                    </HStack>
                    <Text fontSize="3xs" color="gray.500">
                      {capexPercentage}%
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="extrabold" color={isDark ? "blue.200" : "blue.700"} mt={1} noOfLines={1}>
                    {formatIDR(totalCapex)}
                  </Text>
                </Box>

                <Box
                  p={2.5}
                  rounded="lg"
                  bg={isDark ? "purple.950" : "purple.50"}
                  border="1px"
                  borderColor={isDark ? "purple.800" : "purple.200"}
                >
                  <HStack justify="space-between">
                    <HStack spacing={1.5}>
                      <Box w={2} h={2} rounded="full" bg="purple.500" />
                      <Text fontSize="xs" fontWeight="bold" color="purple.600">
                        OPEX
                      </Text>
                    </HStack>
                    <Text fontSize="3xs" color="gray.500">
                      {opexPercentage}%
                    </Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="extrabold" color={isDark ? "purple.200" : "purple.700"} mt={1} noOfLines={1}>
                    {formatIDR(totalOpex)}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* ── Widget 2: Recommended Navigation ── */}
      <Card
        rounded={radiusStyle}
        shadow="lg"
        border="1px"
        borderColor={isDark ? "gray.700" : "gray.200"}
        bg={isDark ? "gray.800" : "white"}
      >
        <CardBody p={5}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2} color="secondary.500">
              <Icon as={FiLayers} boxSize={4} />
              <Heading size="xs" textTransform="uppercase" letterSpacing="wider">
                Navigation & Quick Shortcuts
              </Heading>
            </HStack>

            <VStack spacing={2} align="stretch" pt={1}>
              <Link href="/master-data/rbb/register" style={{ textDecoration: "none" }}>
                <Button
                  w="full"
                  justifyContent="space-between"
                  variant="outline"
                  size="md"
                  rounded="xl"
                  colorScheme="purple"
                  borderColor={isDark ? "secondary.700" : "secondary.300"}
                  _hover={{ bg: isDark ? "secondary.900" : "secondary.50" }}
                  rightIcon={<Icon as={FiArrowRight} />}
                >
                  <HStack spacing={2}>
                    <Icon as={FiPlusSquare} color="secondary.500" />
                    <Text fontSize="sm" fontWeight="bold">
                      Register RBB Target
                    </Text>
                  </HStack>
                </Button>
              </Link>

              <Link href="/vendor-management/contracts" style={{ textDecoration: "none" }}>
                <Button
                  w="full"
                  justifyContent="space-between"
                  variant="outline"
                  size="md"
                  rounded="xl"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  _hover={{ bg: isDark ? "gray.700" : "gray.50" }}
                  rightIcon={<Icon as={FiArrowRight} />}
                >
                  <HStack spacing={2}>
                    <Icon as={FiFileText} color="blue.500" />
                    <Text fontSize="sm" fontWeight="medium">
                      Vendor Procurement Contracts
                    </Text>
                  </HStack>
                </Button>
              </Link>

              <Link href="/reports/project-portfolio" style={{ textDecoration: "none" }}>
                <Button
                  w="full"
                  justifyContent="space-between"
                  variant="outline"
                  size="md"
                  rounded="xl"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  _hover={{ bg: isDark ? "gray.700" : "gray.50" }}
                  rightIcon={<Icon as={FiArrowRight} />}
                >
                  <HStack spacing={2}>
                    <Icon as={FiBarChart2} color="teal.500" />
                    <Text fontSize="sm" fontWeight="medium">
                      Project Portfolio Reports
                    </Text>
                  </HStack>
                </Button>
              </Link>

              <Link href="/vendor-management" style={{ textDecoration: "none" }}>
                <Button
                  w="full"
                  justifyContent="space-between"
                  variant="outline"
                  size="md"
                  rounded="xl"
                  borderColor={isDark ? "gray.700" : "gray.200"}
                  _hover={{ bg: isDark ? "gray.700" : "gray.50" }}
                  rightIcon={<Icon as={FiArrowRight} />}
                >
                  <HStack spacing={2}>
                    <Icon as={FiBriefcase} color="orange.500" />
                    <Text fontSize="sm" fontWeight="medium">
                      Vendor Partners Directory
                    </Text>
                  </HStack>
                </Button>
              </Link>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* ── Widget 3: Governance & Budget Guide ── */}
      <Card
        rounded={radiusStyle}
        shadow="lg"
        border="1px"
        borderColor={isDark ? "blue.800" : "blue.100"}
        bg={isDark ? "blue.950" : "blue.50"}
      >
        <CardBody p={5}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2.5}>
              <Icon as={FiHelpCircle} color="blue.500" boxSize={5} />
              <Heading size="xs" color={isDark ? "blue.200" : "blue.800"}>
                Master RBB Governance Guide
              </Heading>
            </HStack>

            <VStack spacing={2} align="start" fontSize="xs" color={isDark ? "blue.300" : "blue.700"}>
              <Text>
                • RBB targets serve as the strategic foundation for technology initiatives and annual budget alignment.
              </Text>
              <Text>
                • Every work program must have a valid GL (*General Ledger*) account number.
              </Text>
              <Text>
                • CAPEX allocation is designated for capital/asset expenditures, while OPEX is for operational costs.
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};
