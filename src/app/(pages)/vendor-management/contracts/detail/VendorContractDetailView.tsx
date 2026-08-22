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
                    <Badge colorScheme="blue" bg="whiteAlpha.300" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md">
                      SPK Ref: {contract.corpNumber}
                    </Badge>
                    <Badge colorScheme="purple" bg="whiteAlpha.300" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md">
                      CTR #: {contract.contractNumber}
                    </Badge>
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
                      <Icon as={FiCalendar} />
                      <Text>Timelines & Guarantees</Text>
                    </HStack>
                  </Tab>
                  <Tab rounded="xl" fontSize="xs" fontWeight="bold">
                    <HStack spacing={2}>
                      <Icon as={FiFolder} />
                      <Text>Documents & Attachments ({contract.mediaList?.length || 0})</Text>
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

                      {/* CAPEX / OPEX / Guarantees Cards */}
                      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
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
                    <VStack spacing={5} align="stretch">
                      {/* Summary Banner */}
                      <Box p={5} rounded="2xl" border="1px" borderColor={colorMode === "light" ? "teal.200" : "teal.800"} bg={colorMode === "light" ? "teal.50/50" : "gray.800"}>
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
                              {topTotalSum === contract.workValue ? "Balanced (100%)" : "Difference Detected"}
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

                      {/* Milestone List Cards */}
                      {(contract.topList || []).length === 0 ? (
                        <Box p={8} textAlign="center" rounded="2xl" border="1px dashed" borderColor="gray.300">
                          <Text fontSize="xs" color="gray.500">No payment schedule milestones recorded for this contract.</Text>
                        </Box>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          {(contract.topList || []).map((top, idx) => {
                            const pct = contract.workValue > 0 ? parseFloat(((top.topValues / contract.workValue) * 100).toFixed(1)) : 0;
                            return (
                              <Box
                                key={idx}
                                p={5}
                                rounded="2xl"
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                borderLeft="4px solid"
                                borderLeftColor="teal.500"
                                shadow="sm"
                                _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                                transition="all 0.2s"
                              >
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="teal" px={2.5} py={0.5} rounded="md" fontSize="2xs" fontWeight="bold">
                                        Step #{top.stepOrder}
                                      </Badge>
                                      <Badge colorScheme="blue" px={2.5} py={0.5} rounded="md" fontSize="2xs">
                                        {pct}% of Work Value
                                      </Badge>
                                    </HStack>

                                    <HStack spacing={2} fontSize="xs" color="gray.500">
                                      <Icon as={FiCalendar} color="teal.500" />
                                      <Text fontSize="xs" fontWeight="500">
                                        {top.topDate ? new Date(top.topDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "No due date set"}
                                      </Text>
                                    </HStack>
                                  </Flex>

                                  <Flex justify="space-between" align="flex-end" wrap="wrap" gap={3} pt={1}>
                                    <VStack align="start" spacing={1} maxW="70%">
                                      <HStack spacing={1.5} color="gray.500">
                                        <Icon as={FiFileText} />
                                        <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase">Milestone Description</Text>
                                      </HStack>
                                      <Text fontSize="xs" fontWeight="500" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                                        {top.topDescriptions || "No description provided for this step."}
                                      </Text>
                                    </VStack>

                                    <VStack align={{ base: "start", md: "end" }} spacing={0}>
                                      <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Payment Amount</Text>
                                      <Text fontSize="lg" fontWeight="bold" color="secondary.600">
                                        {formatIDR(top.topValues, showWorkValue)}
                                      </Text>
                                    </VStack>
                                  </Flex>
                                </VStack>
                              </Box>
                            );
                          })}
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* TAB 3: Timelines & Guarantees */}
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

                  {/* TAB 5: Documents & Media */}
                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch">
                      {(contract.mediaList || []).length === 0 ? (
                        <Flex justify="center" align="center" py={12} direction="column" gap={2} border="1px dashed" borderColor={colorMode === "light" ? "gray.300" : "gray.700"} rounded="xl">
                          <Icon as={FiFolder} boxSize={8} color="gray.400" />
                          <Text fontSize="xs" color="gray.500">No media or document attachments linked to this contract yet.</Text>
                        </Flex>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {(contract.mediaList || []).map((media, idx) => (
                            <Box key={idx} p={4} rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                              <Flex justify="space-between" align="center">
                                <HStack spacing={3}>
                                  <Icon as={FiFileText} boxSize={5} color="blue.500" />
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="xs" fontWeight="bold">{media.objectRawName || "Contract Document"}</Text>
                                    <Text fontSize="2xs" color="gray.500">{media.objectName || "SPK Document"}</Text>
                                  </VStack>
                                </HStack>

                                {media.objectData && (
                                  <a href={media.objectData} target="_blank" rel="noreferrer">
                                    <Button size="xs" variant="outline" colorScheme="blue" leftIcon={<FiDownload />}>
                                      Download
                                    </Button>
                                  </a>
                                )}
                              </Flex>
                            </Box>
                          ))}
                        </SimpleGrid>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* TAB 5: Contract Settings & Edit */}
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
