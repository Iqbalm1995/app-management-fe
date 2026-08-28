"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Progress,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiFolder,
  FiLayers,
  FiMapPin,
  FiShield,
  FiUserCheck,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiAlertCircle,
  FiTrendingUp,
  FiInfo,
  FiSliders,
  FiRotateCcw,
  FiRepeat,
  FiPieChart,
  FiCheck,
  FiTag,
} from "react-icons/fi";

// Components
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { formatIDR, getContractDeadlineStatus } from "@/app/components/CardContract";
import useVendor, { VendorContractResponse } from "@/app/services/useVendor";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import ContractEditTabPanel from "./components/ContractEditTabPanel";
import ContractHistoryTabPanel from "./components/ContractHistoryTabPanel";
import ContractPaymentTabPanel from "./components/ContractPaymentTabPanel";
import ContractCostGovernanceTabPanel from "./components/ContractCostGovernanceTabPanel";

export default function VendorContractDetailView() {
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const contractId = searchParams.get("id") || "";
  const showToast = useToastHelper();

  const { GetContractDetail } = useVendor();
  const [tokenData, setTokenData] = useState<string>("");
  const [contract, setContract] = useState<VendorContractResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showWorkValue, setShowWorkValue] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  const fetchDetail = useCallback(async () => {
    if (!tokenData || !contractId) return;
    setIsLoading(true);
    const res = await GetContractDetail(contractId, tokenData);
    if (res?.statusCode === RES_CODE_OK && res.data) {
      setContract(res.data);
    } else {
      showToast({ description: res?.message || "Failed to load contract details", statusToast: "error" });
    }
    setIsLoading(false);
  }, [tokenData, contractId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <LayoutAdmin>
        <HeaderContent titleName="Contract Details" breadCrumb={["Home", "Contracts", "Detail"]} />
        <Flex justify="center" align="center" minH="400px" direction="column" gap={3}>
          <Spinner size="xl" color="secondary.500" thickness="4px" />
          <Text fontSize="sm" color="gray.500" fontWeight="500">Loading vendor contract records...</Text>
        </Flex>
      </LayoutAdmin>
    );
  }

  if (!contract) {
    return (
      <LayoutAdmin>
        <HeaderContent titleName="Contract Details" breadCrumb={["Home", "Contracts", "Detail"]} />
        <Box px={6} py={12} textAlign="center">
          <VStack spacing={4}>
            <Icon as={FiAlertCircle} boxSize={12} color="orange.400" />
            <Heading size="md">Vendor Contract Not Found</Heading>
            <Text fontSize="sm" color="gray.500">The requested contract record could not be loaded or does not exist.</Text>
            <Link href="/vendor-management/contracts">
              <Button leftIcon={<FiArrowLeft />} colorScheme="blue" variant="outline" size="sm" rounded="lg">
                Back to Contracts Directory
              </Button>
            </Link>
          </VStack>
        </Box>
      </LayoutAdmin>
    );
  }

  const topTotalSum = (contract.topList || []).reduce((acc, curr) => acc + (curr.topValues || 0), 0);
  const itemsTotalSum = (contract.items || []).reduce((acc, curr) => acc + (curr.itemValues || 0), 0);
  const deadline = getContractDeadlineStatus(contract.contractEndDate);

  const getStatusColorScheme = (st?: string) => {
    switch (st?.toUpperCase()) {
      case "ACTIVE": return "green";
      case "COMPLETED": return "blue";
      case "EXPIRED": return "orange";
      case "TERMINATED": return "red";
      default: return "gray";
    }
  };

  const getTopStatusBadgeColor = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "PAID": return "green";
      case "APPROVED": return "teal";
      case "VERIFIED": return "blue";
      case "SUBMITTED": return "purple";
      case "REJECTED": return "red";
      case "SCHEDULED":
      case "PENDING":
      default: return "gray";
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Vendor Contract Details" breadCrumb={["Home", "Contracts", contract.contractNumber || "Detail"]} />

      <Box px={{ base: 3, md: 6 }} py={4} w="full">
        <VStack spacing={6} align="stretch" w="full">

          {/* Expiration & Deadline Alert Banners */}
          {deadline.isExpired && (
            <Alert status="error" rounded="2xl" shadow="lg" border="1px" borderColor="red.200">
              <AlertIcon boxSize={5} />
              <Box flex={1}>
                <AlertTitle fontSize="sm" fontWeight="bold">
                  CRITICAL NOTICE: Contract Expired ({Math.abs(deadline.daysRemaining)} days ago)
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {deadline.warningMessage}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {deadline.isExpiringSoon && (
            <Alert status="warning" rounded="2xl" shadow="lg" border="1px" borderColor="orange.200">
              <AlertIcon boxSize={5} />
              <Box flex={1}>
                <AlertTitle fontSize="sm" fontWeight="bold">
                  ⚡ 1-MONTH CONTRACT EXPIRATION NOTICE ({deadline.daysRemaining} days remaining)
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {deadline.warningMessage}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Top Bar Navigation */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Link href="/vendor-management/contracts">
                <Button size="sm" variant="outline" leftIcon={<FiArrowLeft />} rounded="lg">
                  Back to Directory
                </Button>
              </Link>
              <Badge colorScheme={getStatusColorScheme(contract.status)} variant="solid" px={3} py={1} rounded="full" fontSize="xs">
                {contract.status}
              </Badge>
              <Badge colorScheme={deadline.badgeColor} variant="solid" px={3} py={1} rounded="full" fontSize="xs">
                {deadline.badgeLabel}
              </Badge>
            </HStack>

            <Button
              size="sm"
              variant="ghost"
              leftIcon={showWorkValue ? <FiEyeOff /> : <FiEye />}
              onClick={() => setShowWorkValue(!showWorkValue)}
            >
              {showWorkValue ? "Hide Financial Values" : "Show Financial Values"}
            </Button>
          </Flex>

          {/* Hero Header Banner */}
          <Card
            rounded="2xl"
            shadow="xl"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            bgGradient={colorMode === "light" ? "linear(to-r, blue.700, secondary.600)" : "linear(to-r, gray.900, gray.800)"}
            color="white"
            overflow="hidden"
          >
            <CardBody p={{ base: 5, md: 6 }}>
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} alignItems="center">
                <VStack align="start" spacing={3}>
                  <HStack spacing={2} wrap="wrap">
                    {contract.projectId && (
                      <Badge colorScheme="purple" bg="purple.500" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md" display="flex" alignItems="center" gap={1}>
                        <Icon as={FiBriefcase} />
                        Project: {contract.projectCode || contract.projectName || "Linked"}
                      </Badge>
                    )}
                    <Badge colorScheme="blue" bg="whiteAlpha.300" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md">
                      SPK Ref: {contract.corpNumber}
                    </Badge>
                    <Badge colorScheme="purple" bg="whiteAlpha.300" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md">
                      CTR #: {contract.contractNumber}
                    </Badge>
                    {contract.contractBillingType && contract.contractBillingType !== "MILESTONE" && (
                      <Badge colorScheme="teal" bg="teal.400" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md">
                        {contract.contractBillingType}
                      </Badge>
                    )}
                    {contract.subscriptionAutoRenew && (
                      <Badge colorScheme="green" bg="green.500" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md" display="flex" alignItems="center" gap={1}>
                        <Icon as={FiRepeat} />
                        Auto-Renew
                      </Badge>
                    )}
                  </HStack>

                  <Heading size="lg" fontWeight="extrabold" lineHeight="snug">
                    {contract.corpName}
                  </Heading>

                  <HStack spacing={4} fontSize="xs" opacity={0.9} wrap="wrap">
                    <HStack spacing={1}>
                      <Icon as={FiBriefcase} />
                      <Text fontWeight="600">Vendor: {contract.vendorCode || contract.vendorId}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FiCalendar} />
                      <Text>Executed: {new Date(contract.contractDate).toLocaleDateString("id-ID")}</Text>
                    </HStack>
                  </HStack>
                </VStack>

                <Box
                  p={5}
                  bg="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  rounded="2xl"
                  border="1px"
                  borderColor="whiteAlpha.300"
                  textAlign={{ base: "left", lg: "right" }}
                >
                  <Text fontSize="2xs" textTransform="uppercase" fontWeight="700" opacity={0.8}>
                    Total Contract Work Value
                  </Text>
                  <Text fontSize="2xl" fontWeight="900" color="green.300">
                    {formatIDR(contract.workValue, showWorkValue)}
                  </Text>
                  <Text fontSize="2xs" opacity={0.8} mt={1}>
                    Valid: {new Date(contract.contractStartDate).toLocaleDateString("id-ID")} – {new Date(contract.contractEndDate).toLocaleDateString("id-ID")}
                  </Text>
                </Box>
              </Grid>
            </CardBody>
          </Card>

          {/* Tab Navigation Sections */}
          <Card rounded="2xl" shadow="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} minH="500px">
            <CardBody p={{ base: 4, md: 6 }} display="flex" flexDirection="column">
              <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList mb={6} overflowX="auto" pb={2} flexWrap="nowrap">
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiFileText} />
                      <Text>Overview & Summary</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiDollarSign} />
                      <Text>Payment TOP Schedule ({contract.topList?.length || 0})</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiLayers} />
                      <Text>Payments & Realization</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} />
                      <Text>Timelines & Guarantees</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiTrendingUp} />
                      <Text>Cost Governance</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiSliders} />
                      <Text>Contract Settings & Edit</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiRotateCcw} />
                      <Text>Revision History ({contract.historyList?.length || 0})</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>

                  {/* TAB 1: Overview & Summary */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">

                      {/* Linked Corporate Procurement Project Card */}
                      {contract.projectId ? (
                        <Box
                          p={5}
                          rounded="2xl"
                          border="1px"
                          borderColor={colorMode === "light" ? "purple.200" : "purple.700"}
                          bg={colorMode === "light" ? "purple.50/40" : "gray.800"}
                        >
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                              <HStack spacing={3}>
                                <Box
                                  w={10}
                                  h={10}
                                  rounded="xl"
                                  bg="purple.500"
                                  color="white"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Icon as={FiBriefcase} boxSize={5} />
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <HStack spacing={2}>
                                    <Badge colorScheme="purple" fontSize="xs">
                                      {contract.projectCode || contract.projectNo || "PROJ-CODE"}
                                    </Badge>
                                    <Badge colorScheme="blue" fontSize="xs">
                                      PROCUREMENT
                                    </Badge>
                                    {contract.sdlcStageName && (
                                      <Badge colorScheme="teal" variant="outline" fontSize="xs">
                                        {contract.sdlcStageName}
                                      </Badge>
                                    )}
                                  </HStack>
                                  <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                                    {contract.projectName || "Procurement Project"}
                                  </Heading>
                                </VStack>
                              </HStack>

                              <Link href={`/projects/detail?id=${contract.projectId}`}>
                                <Button
                                  size="xs"
                                  colorScheme="purple"
                                  variant="outline"
                                  leftIcon={<FiBriefcase />}
                                  rounded="lg"
                                >
                                  View Corporate Project Details
                                </Button>
                              </Link>
                            </Flex>

                            {(contract.proOwnerDivisionName || contract.proOwnerDirectorateName) && (
                              <HStack spacing={4} fontSize="xs" color="gray.500" pt={1}>
                                {contract.proOwnerDivisionName && (
                                  <HStack spacing={1}>
                                    <Icon as={FiFolder} />
                                    <Text>{contract.proOwnerDivisionName}</Text>
                                  </HStack>
                                )}
                                {contract.proOwnerDirectorateName && (
                                  <HStack spacing={1}>
                                    <Icon as={FiLayers} />
                                    <Text>{contract.proOwnerDirectorateName}</Text>
                                  </HStack>
                                )}
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      ) : (
                        <Box
                          p={4}
                          rounded="xl"
                          border="1px dashed"
                          borderColor={colorMode === "light" ? "purple.200" : "purple.800"}
                          bg={colorMode === "light" ? "purple.50/20" : "gray.800"}
                        >
                          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                            <HStack spacing={2} fontSize="xs" color="gray.500">
                              <Icon as={FiBriefcase} color="purple.400" />
                              <Text>No corporate procurement project is linked to this contract.</Text>
                            </HStack>
                            <Text fontSize="2xs" color="purple.500" fontWeight="600">
                              Tip: You can link a procurement project from the "Contract Settings & Edit" tab
                            </Text>
                          </Flex>
                        </Box>
                      )}

                      {/* Vendor Partner Detail Profile Card */}
                      <Box p={5} rounded="2xl" border="1px" borderColor={colorMode === "light" ? "teal.200" : "teal.700"} bg={colorMode === "light" ? "teal.50/40" : "gray.800"}>
                        <VStack align="stretch" spacing={4}>
                          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                            <HStack spacing={3}>
                              <Box w={10} h={10} rounded="xl" bg="teal.500" color="white" display="flex" alignItems="center" justifyContent="center">
                                <Icon as={FiUserCheck} boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <HStack spacing={2}>
                                  <Badge colorScheme="blue" fontSize="xs">{contract.vendor?.vendorCode || contract.vendorCode || "VENDOR"}</Badge>
                                  <Badge colorScheme="purple" fontSize="xs">{contract.vendor?.vendorType || "PARTNER"}</Badge>
                                </HStack>
                                <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                                  {contract.vendor?.vendorName || contract.vendorName || "Vendor Partner"}
                                </Heading>
                              </VStack>
                            </HStack>

                            <Link href={`/vendor-management/detail?id=${contract.vendorId}`}>
                              <Button size="xs" colorScheme="teal" variant="outline" leftIcon={<FiBriefcase />} rounded="lg">
                                View Full Vendor Profile
                              </Button>
                            </Link>
                          </Flex>

                          <Divider borderColor={colorMode === "light" ? "teal.200" : "teal.700"} />

                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            {/* Company Address */}
                            <VStack align="start" spacing={1}>
                              <HStack spacing={1.5} color="gray.500" fontSize="2xs" fontWeight="700" textTransform="uppercase">
                                <Icon as={FiMapPin} />
                                <Text>Registered Address</Text>
                              </HStack>
                              <Text fontSize="xs" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>
                                {[contract.vendor?.address1, contract.vendor?.address2, contract.vendor?.city, contract.vendor?.country].filter(Boolean).join(", ") || "No address on file"}
                              </Text>
                              {contract.vendor?.website && (
                                <Text fontSize="2xs" color="blue.500" fontWeight="500">
                                  {contract.vendor.website}
                                </Text>
                              )}
                            </VStack>

                            {/* PIC Business Contact */}
                            <VStack align="start" spacing={1}>
                              <HStack spacing={1.5} color="gray.500" fontSize="2xs" fontWeight="700" textTransform="uppercase">
                                <Icon as={FiBriefcase} />
                                <Text>PIC Business Contact</Text>
                              </HStack>
                              <Text fontSize="xs" fontWeight="700">{contract.vendor?.picBusinessName || "-"}</Text>
                              <Text fontSize="2xs" color="gray.500">{contract.vendor?.picBusinessEmail || "-"}</Text>
                              <Text fontSize="2xs" color="gray.500">{contract.vendor?.picBusinessNumberHotline || "-"}</Text>
                            </VStack>

                            {/* PIC Technical Contact */}
                            <VStack align="start" spacing={1}>
                              <HStack spacing={1.5} color="gray.500" fontSize="2xs" fontWeight="700" textTransform="uppercase">
                                <Icon as={FiShield} />
                                <Text>PIC Technical Contact</Text>
                              </HStack>
                              <Text fontSize="xs" fontWeight="700">{contract.vendor?.picTechnicalName || "-"}</Text>
                              <Text fontSize="2xs" color="gray.500">{contract.vendor?.picTechnicalEmail || "-"}</Text>
                              <Text fontSize="2xs" color="gray.500">{contract.vendor?.picTechnicalNumberHotline || "-"}</Text>
                            </VStack>
                          </SimpleGrid>
                        </VStack>
                      </Box>

                      {/* CAPEX / OPEX / Guarantees / Subscription Model Cards */}
                      <Grid templateColumns={{ base: "1fr", md: contract.contractBillingType && contract.contractBillingType !== "MILESTONE" ? "repeat(4, 1fr)" : "repeat(3, 1fr)" }} gap={4}>
                        <GridItem>
                          <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">CAPEX Value</Text>
                              <Text fontSize="lg" fontWeight="800" color="blue.500">{formatIDR(contract.cavexValues, showWorkValue)}</Text>
                              <Badge colorScheme="blue" fontSize="2xs">{contract.capexPercentage}% Allocation</Badge>
                            </VStack>
                          </Box>
                        </GridItem>

                        <GridItem>
                          <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">OPEX Value</Text>
                              <Text fontSize="lg" fontWeight="800" color="purple.500">{formatIDR(contract.ovexValues, showWorkValue)}</Text>
                              <Badge colorScheme="purple" fontSize="2xs">{contract.ovexPercentage}% Allocation</Badge>
                            </VStack>
                          </Box>
                        </GridItem>

                        <GridItem>
                          <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase">Financial Guarantees</Text>
                              <Text fontSize="lg" fontWeight="800" color="teal.500">{formatIDR((contract.performanceGuaranteeValues || 0) + (contract.maintenanceWarrantyValues || 0), showWorkValue)}</Text>
                              <Badge colorScheme="teal" fontSize="2xs">Bank Bonds Active</Badge>
                            </VStack>
                          </Box>
                        </GridItem>

                        {contract.contractBillingType && contract.contractBillingType !== "MILESTONE" && (
                          <GridItem>
                            <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "purple.200" : "purple.700"} bg={colorMode === "light" ? "purple.50/50" : "gray.800"}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="2xs" color="purple.600" fontWeight="700" textTransform="uppercase">Subscription Model</Text>
                                <Text fontSize="lg" fontWeight="800" color="purple.600">{formatIDR(contract.subscriptionPeriodValue || 0, showWorkValue)} <Text as="span" fontSize="2xs" fontWeight="normal">/ cycle</Text></Text>
                                <HStack spacing={1}>
                                  <Badge colorScheme="purple" fontSize="2xs">{contract.contractBillingType}</Badge>
                                  {contract.subscriptionAutoRenew && <Badge colorScheme="green" fontSize="2xs">Auto-Renew</Badge>}
                                </HStack>
                              </VStack>
                            </Box>
                          </GridItem>
                        )}
                      </Grid>

                      {/* Contract Remarks Note */}
                      <Box p={5} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                        <VStack align="start" spacing={2}>
                          <HStack spacing={2} color="secondary.600">
                            <Icon as={FiInfo} />
                            <Heading size="xs">General Contract Remarks / Note</Heading>
                          </HStack>
                          <Text fontSize="xs" color="gray.600">{contract.note || "No additional remarks recorded."}</Text>
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* TAB 2: Payment TOP Schedule */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      {/* Top Progression Banner */}
                      <Box
                        p={5}
                        rounded="2xl"
                        border="1px"
                        borderColor={colorMode === "light" ? "teal.200" : "teal.800"}
                        bg={colorMode === "light" ? "teal.50/50" : "gray.800"}
                      >
                        <VStack align="stretch" spacing={3}>
                          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                            <HStack spacing={2}>
                              <Icon as={FiDollarSign} color="teal.500" w={5} h={5} />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="bold">Payment Schedule Progression</Text>
                                <Text fontSize="2xs" color="gray.500">
                                  Scheduled TOP Sum: {formatIDR(topTotalSum, showWorkValue)} / {formatIDR(contract.workValue, showWorkValue)}
                                </Text>
                              </VStack>
                            </HStack>

                            <Badge
                              colorScheme={topTotalSum === contract.workValue ? "green" : "orange"}
                              fontSize="2xs"
                              px={3}
                              py={1}
                              rounded="lg"
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <Icon as={topTotalSum === contract.workValue ? FiCheckCircle : FiAlertCircle} />
                              {topTotalSum === contract.workValue ? "Balanced (100%)" : `Selisih: ${formatIDR(Math.abs(contract.workValue - topTotalSum), showWorkValue)}`}
                            </Badge>
                          </Flex>

                          <Progress
                            value={contract.workValue > 0 ? (topTotalSum / contract.workValue) * 100 : 0}
                            size="xs"
                            colorScheme={topTotalSum === contract.workValue ? "teal" : "orange"}
                            rounded="full"
                          />
                        </VStack>
                      </Box>

                      {/* 70% / 30% Responsive Split Layout */}
                      <Flex direction={{ base: "column", lg: "row" }} gap={6} align="start">
                        {/* LEFT 70%: TOP Milestones List with Dividers */}
                        <Box flex={{ base: "1", lg: "7" }} w={{ base: "100%", lg: "70%" }}>
                          {(contract.topList || []).length === 0 ? (
                            <Box
                              p={8}
                              textAlign="center"
                              rounded="2xl"
                              border="1px dashed"
                              borderColor="gray.300"
                              bg={colorMode === "light" ? "gray.50" : "gray.850"}
                            >
                              <Icon as={FiLayers} boxSize={8} color="gray.400" mb={2} />
                              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                                Belum Ada Jadwal Termin (TOP)
                              </Text>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                No payment schedule milestones recorded for this contract.
                              </Text>
                            </Box>
                          ) : (
                            <VStack spacing={0} align="stretch">
                              {(contract.topList || []).map((top, idx) => {
                                const pct =
                                  contract.workValue > 0
                                    ? parseFloat(((top.topValues / contract.workValue) * 100).toFixed(1))
                                    : 0;
                                const isLastItem = idx === (contract.topList?.length || 0) - 1;
                                const isPaid = top.topStatus?.toUpperCase() === "PAID";

                                return (
                                  <Box key={top.id || idx}>
                                    {/* Milestone Item */}
                                    <Box
                                      p={4}
                                      rounded="xl"
                                      transition="all 0.2s"
                                      bg={
                                        isPaid
                                          ? colorMode === "light"
                                            ? "green.50/60"
                                            : "rgba(16, 185, 129, 0.05)"
                                          : colorMode === "light"
                                          ? "gray.50/80"
                                          : "gray.850"
                                      }
                                      border="1px"
                                      borderColor={
                                        isPaid
                                          ? colorMode === "light"
                                            ? "green.200"
                                            : "green.800"
                                          : colorMode === "light"
                                          ? "gray.200"
                                          : "gray.700"
                                      }
                                    >
                                      <Flex
                                        justify="space-between"
                                        align={{ base: "start", md: "center" }}
                                        wrap="wrap"
                                        gap={3}
                                        mb={2}
                                      >
                                        <HStack spacing={3} align="center">
                                          <Box
                                            w={8}
                                            h={8}
                                            rounded="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontWeight="bold"
                                            fontSize="xs"
                                            bg={isPaid ? "green.500" : "teal.500"}
                                            color="white"
                                            flexShrink={0}
                                          >
                                            {isPaid ? <Icon as={FiCheck} boxSize={4} /> : `#${top.stepOrder}`}
                                          </Box>

                                          <VStack align="start" spacing={0.5}>
                                            <HStack spacing={2} wrap="wrap" align="center">
                                              <Text fontSize="md" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                                                {formatIDR(top.topValues, showWorkValue)}
                                              </Text>
                                              <Badge colorScheme="teal" variant="subtle" fontSize="2xs" px={2} py={0.5} rounded="md">
                                                {pct}% Kontrak
                                              </Badge>
                                              <Badge
                                                colorScheme={getTopStatusBadgeColor(top.topStatus)}
                                                variant="solid"
                                                fontSize="2xs"
                                                px={2.5}
                                                py={0.5}
                                                rounded="full"
                                              >
                                                {top.topStatus || "SCHEDULED"}
                                              </Badge>
                                              {top.billingPeriodStart && top.billingPeriodEnd && (
                                                <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} rounded="md">
                                                  Periode: {new Date(top.billingPeriodStart).toLocaleDateString("id-ID")} &rarr; {new Date(top.billingPeriodEnd).toLocaleDateString("id-ID")}
                                                </Badge>
                                              )}
                                              {top.isAutoGenerated && (
                                                <Badge colorScheme="cyan" variant="outline" fontSize="2xs" px={1.5} py={0.2} rounded="md">
                                                  Auto
                                                </Badge>
                                              )}
                                            </HStack>

                                            <HStack spacing={3} fontSize="xs" color="gray.500" wrap="wrap">
                                              <HStack spacing={1}>
                                                <Icon as={FiCalendar} boxSize={3.5} />
                                                <Text>
                                                  Target: {top.topDate ? new Date(top.topDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum ditentukan"}
                                                </Text>
                                              </HStack>
                                            </HStack>
                                          </VStack>
                                        </HStack>
                                      </Flex>

                                      {/* Description Section */}
                                      <Box
                                        mt={2}
                                        pt={2}
                                        borderTop="1px dashed"
                                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                      >
                                        <HStack spacing={1.5} color="gray.500" mb={1}>
                                          <Icon as={FiFileText} boxSize={3.5} />
                                          <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase">Deskripsi / Scope Milestone</Text>
                                        </HStack>
                                        <Text fontSize="xs" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                          {top.topDescriptions || "Tidak ada rincian deskripsi untuk termin ini."}
                                        </Text>
                                      </Box>
                                    </Box>

                                    {/* Divider between items */}
                                    {!isLastItem && (
                                      <Divider my={3.5} borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />
                                    )}
                                  </Box>
                                );
                              })}
                            </VStack>
                          )}
                        </Box>

                        {/* RIGHT 30%: Additional Info & Summary Widgets */}
                        <Box flex={{ base: "1", lg: "3" }} w={{ base: "100%", lg: "30%" }}>
                          <VStack spacing={4} align="stretch" position={{ lg: "sticky" }} top="20px">
                            
                            {/* Widget 1: TOP Realization & Summary */}
                            <Box
                              p={4}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "teal.200" : "teal.700"}
                              bg={colorMode === "light" ? "gray.50" : "gray.850"}
                            >
                              <HStack spacing={2} mb={3} color="teal.500">
                                <Icon as={FiPieChart} boxSize={4} />
                                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                  TOP Summary & Health
                                </Text>
                              </HStack>

                              <VStack spacing={2.5} align="stretch" fontSize="xs">
                                <Flex justify="space-between">
                                  <Text color="gray.500">Total Termin:</Text>
                                  <Badge colorScheme="purple" fontSize="2xs" rounded="md">
                                    {(contract.topList || []).length} Milestones
                                  </Badge>
                                </Flex>

                                <Flex justify="space-between">
                                  <Text color="gray.500">Total Nominal TOP:</Text>
                                  <Text fontWeight="bold" color="teal.500">
                                    {formatIDR(topTotalSum, showWorkValue)}
                                  </Text>
                                </Flex>

                                <Flex justify="space-between">
                                  <Text color="gray.500">Nilai Kontrak Total:</Text>
                                  <Text fontWeight="bold" color="blue.500">
                                    {formatIDR(contract.workValue, showWorkValue)}
                                  </Text>
                                </Flex>

                                <Flex justify="space-between">
                                  <Text color="gray.500">Rata-rata / Termin:</Text>
                                  <Text fontWeight="semibold">
                                    {formatIDR(
                                      (contract.topList || []).length > 0
                                        ? topTotalSum / (contract.topList || []).length
                                        : 0,
                                      showWorkValue
                                    )}
                                  </Text>
                                </Flex>

                                <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} my={1} />

                                <Flex justify="space-between" align="center">
                                  <Text color="gray.500">Status Validasi:</Text>
                                  <Badge
                                    colorScheme={topTotalSum === contract.workValue ? "green" : "orange"}
                                    fontSize="3xs"
                                    px={2}
                                    rounded="md"
                                  >
                                    {topTotalSum === contract.workValue ? "100% Balanced" : "Selisih Alokasi"}
                                  </Badge>
                                </Flex>
                              </VStack>
                            </Box>

                            {/* Widget 2: Financial Allocation (CAPEX/OPEX) */}
                            <Box
                              p={4}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                              bg={colorMode === "light" ? "gray.50" : "gray.850"}
                            >
                              <HStack spacing={2} mb={2.5} color="blue.500">
                                <Icon as={FiSliders} boxSize={4} />
                                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                  Alokasi Capex / Opex
                                </Text>
                              </HStack>

                              <VStack spacing={2} align="stretch" fontSize="xs">
                                <Flex justify="space-between">
                                  <Text color="gray.500">CAPEX ({contract.capexPercentage || 0}%):</Text>
                                  <Text fontWeight="semibold" color="blue.500">
                                    {formatIDR(contract.cavexValues || 0, showWorkValue)}
                                  </Text>
                                </Flex>

                                <Flex justify="space-between">
                                  <Text color="gray.500">OPEX ({contract.ovexPercentage || 0}%):</Text>
                                  <Text fontWeight="semibold" color="purple.500">
                                    {formatIDR(contract.ovexValues || 0, showWorkValue)}
                                  </Text>
                                </Flex>

                                <Flex justify="space-between">
                                  <Text color="gray.500">Jaminan Bank:</Text>
                                  <Text fontWeight="semibold" color="teal.500">
                                    {formatIDR(
                                      (contract.performanceGuaranteeValues || 0) +
                                        (contract.maintenanceWarrantyValues || 0),
                                      showWorkValue
                                    )}
                                  </Text>
                                </Flex>
                              </VStack>
                            </Box>

                            {/* Widget 3: Billing Cadence */}
                            {contract.contractBillingType && (
                              <Box
                                p={4}
                                rounded="xl"
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                bg={colorMode === "light" ? "gray.50" : "gray.850"}
                              >
                                <HStack spacing={2} mb={2} color="purple.500">
                                  <Icon as={FiTag} boxSize={4} />
                                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                    Billing Cadence
                                  </Text>
                                </HStack>

                                <VStack spacing={1.5} align="stretch" fontSize="xs">
                                  <Flex justify="space-between" align="center">
                                    <Text color="gray.500">Model Skema:</Text>
                                    <Badge
                                      colorScheme={
                                        contract.contractBillingType !== "MILESTONE" ? "purple" : "blue"
                                      }
                                      fontSize="2xs"
                                    >
                                      {contract.contractBillingType}
                                    </Badge>
                                  </Flex>
                                  {contract.subscriptionPeriodValue && contract.subscriptionPeriodValue > 0 && (
                                    <Flex justify="space-between">
                                      <Text color="gray.500">Rate Siklus:</Text>
                                      <Text fontWeight="bold" color="purple.500">
                                        {formatIDR(contract.subscriptionPeriodValue, showWorkValue)}
                                      </Text>
                                    </Flex>
                                  )}
                                  {contract.subscriptionAutoRenew && (
                                    <Flex justify="space-between">
                                      <Text color="gray.500">Perpanjangan:</Text>
                                      <Badge colorScheme="green" fontSize="3xs">
                                        Auto-Renew
                                      </Badge>
                                    </Flex>
                                  )}
                                </VStack>
                              </Box>
                            )}

                            {/* Widget 4: Timeline Summary */}
                            <Box
                              p={4}
                              rounded="xl"
                              border="1px"
                              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                              bg={colorMode === "light" ? "gray.50" : "gray.850"}
                            >
                              <HStack spacing={2} mb={2} color="gray.500">
                                <Icon as={FiCalendar} boxSize={4} />
                                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                  Masa Kontrak
                                </Text>
                              </HStack>

                              <VStack spacing={1} align="stretch" fontSize="2xs" color="gray.500">
                                <Text>
                                  Mulai: <strong>{new Date(contract.contractStartDate).toLocaleDateString("id-ID")}</strong>
                                </Text>
                                <Text>
                                  Selesai: <strong>{new Date(contract.contractEndDate).toLocaleDateString("id-ID")}</strong>
                                </Text>
                              </VStack>
                            </Box>

                          </VStack>
                        </Box>
                      </Flex>
                    </VStack>
                  </TabPanel>

                  {/* TAB 3: Payment Disbursements & Realization */}
                  <TabPanel p={0}>
                    <ContractPaymentTabPanel
                      contract={contract}
                      tokenData={tokenData}
                      onRefreshContract={fetchDetail}
                    />
                  </TabPanel>

                  {/* TAB 4: Timelines & Guarantees */}
                  <TabPanel p={0}>
                    <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} color="blue.500">
                              <Icon as={FiCalendar} />
                              <Text fontSize="xs" fontWeight="bold">Contract Validity Period</Text>
                            </HStack>
                            <Text fontSize="xs">Start: {new Date(contract.contractStartDate).toLocaleDateString("id-ID")}</Text>
                            <Text fontSize="xs">End: {new Date(contract.contractEndDate).toLocaleDateString("id-ID")}</Text>
                          </VStack>
                        </Box>

                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} color="green.500">
                              <Icon as={FiCheckCircle} />
                              <Text fontSize="xs" fontWeight="bold">Physical Works Period</Text>
                            </HStack>
                            <Text fontSize="xs">Start: {contract.worksStartDate ? new Date(contract.worksStartDate).toLocaleDateString("id-ID") : "-"}</Text>
                            <Text fontSize="xs">End: {contract.worksEndDate ? new Date(contract.worksEndDate).toLocaleDateString("id-ID") : "-"}</Text>
                          </VStack>
                        </Box>

                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} color="purple.500">
                              <Icon as={FiShield} />
                              <Text fontSize="xs" fontWeight="bold">SLA Warranty Period</Text>
                            </HStack>
                            <Text fontSize="xs">Start: {contract.warrantyStartDate ? new Date(contract.warrantyStartDate).toLocaleDateString("id-ID") : "-"}</Text>
                            <Text fontSize="xs">End: {contract.warrantyEndDate ? new Date(contract.warrantyEndDate).toLocaleDateString("id-ID") : "-"}</Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>

                      {/* Bank Guarantee Bonds */}
                      <Heading size="xs" color="gray.600">Financial Performance & Maintenance Guarantees</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Performance Guarantee Bond</Text>
                            <Text fontSize="md" fontWeight="bold" color="teal.600">{formatIDR(contract.performanceGuaranteeValues, showWorkValue)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Validity: {contract.performanceGuaranteeStartDate ? new Date(contract.performanceGuaranteeStartDate).toLocaleDateString("id-ID") : "-"} – {contract.performanceGuaranteeEndDate ? new Date(contract.performanceGuaranteeEndDate).toLocaleDateString("id-ID") : "-"}
                            </Text>
                          </VStack>
                        </Box>

                        <Box p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Maintenance Warranty Bond</Text>
                            <Text fontSize="md" fontWeight="bold" color="teal.600">{formatIDR(contract.maintenanceWarrantyValues, showWorkValue)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Validity: {contract.maintenanceWarrantyStartDate ? new Date(contract.maintenanceWarrantyStartDate).toLocaleDateString("id-ID") : "-"} – {contract.maintenanceWarrantyEndDate ? new Date(contract.maintenanceWarrantyEndDate).toLocaleDateString("id-ID") : "-"}
                            </Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* TAB 5: Cost Governance */}
                  <TabPanel p={0}>
                    <ContractCostGovernanceTabPanel
                      contract={contract}
                      tokenData={tokenData}
                      onRefreshContract={fetchDetail}
                    />
                  </TabPanel>

                  {/* TAB 6: Contract Settings & Edit */}
                  <TabPanel p={0}>
                    <ContractEditTabPanel contract={contract} tokenData={tokenData} onRefreshData={fetchDetail} />
                  </TabPanel>

                  {/* TAB 6: Revision History */}
                  <TabPanel p={0}>
                    <ContractHistoryTabPanel historyList={contract.historyList || []} />
                  </TabPanel>

                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>

        </VStack>
      </Box>
    </LayoutAdmin>
  );
}
