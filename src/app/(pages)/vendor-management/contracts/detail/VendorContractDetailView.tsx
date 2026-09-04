"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Divider,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  useColorMode,
  Avatar,
  Progress,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiRotateCcw,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiSliders,
  FiBriefcase,
  FiShield,
  FiCheck,
  FiExternalLink,
  FiInfo,
  FiCreditCard,
  FiPieChart,
  FiLayers,
  FiTarget,
  FiGlobe,
  FiMapPin,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiActivity,
  FiFolder,
  FiClock,
  FiCheckSquare,
  FiUser,
  FiPaperclip,
} from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import { radiusStyle } from "@/app/constants/applicationConstants";
import useVendor, { VendorContractResponse } from "@/app/services/useVendor";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import ContractPaymentTabPanel from "./components/ContractPaymentTabPanel";
import ContractDocumentsTabPanel from "./components/ContractDocumentsTabPanel";
import ContractCostGovernanceTabPanel from "./components/ContractCostGovernanceTabPanel";
import ContractEditTabPanel from "./components/ContractEditTabPanel";
import ContractHistoryTabPanel from "./components/ContractHistoryTabPanel";
import { IoReceiptOutline } from "react-icons/io5";

export default function VendorContractDetailView() {
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const contractId = searchParams.get("id");
  const toast = useToast();

  const [contract, setContract] = useState<VendorContractResponse | null>(null);
  const [projectData, setProjectData] = useState<ProjectDataResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [showWorkValue, setShowWorkValue] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tokenData, setTokenData] = useState<string>("");

  const { GetContractDetail } = useVendor();
  const getContractDetailRef = React.useRef(GetContractDetail);
  useEffect(() => {
    getContractDetailRef.current = GetContractDetail;
  }, [GetContractDetail]);

  const { GetDetailById: getProjectDetailById } = useProjects();
  const getProjectDetailByIdRef = React.useRef(getProjectDetailById);
  useEffect(() => {
    getProjectDetailByIdRef.current = getProjectDetailById;
  }, [getProjectDetailById]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = (localStorage.getItem("tokenData") ||
        localStorage.getItem("authData")) as string;
      if (token) {
        setTokenData(token);
      }
    }
  }, []);

  const fetchDetail = useCallback(async () => {
    const currentToken =
      tokenData ||
      (typeof window !== "undefined"
        ? ((localStorage.getItem("tokenData") ||
            localStorage.getItem("authData")) as string)
        : "");

    if (!contractId || !currentToken) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await getContractDetailRef.current(contractId, currentToken);
      if (res && res.statusCode === 200 && res.data) {
        setContract(res.data);
      } else {
        toast({
          title: "Failed to Fetch Data",
          description: res?.message || "Contract data not found",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Terjadi Kesalahan",
        description:
          err instanceof Error
            ? err.message
            : "Failed to load vendor contract details",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contractId, tokenData, toast]);

  useEffect(() => {
    if (contractId && tokenData) {
      fetchDetail();
    }
  }, [contractId, tokenData, fetchDetail]);

  useEffect(() => {
    if (contract?.projectId && tokenData) {
      let isCancelled = false;
      const fetchProject = async () => {
        setIsLoadingProject(true);
        try {
          const res = await getProjectDetailByIdRef.current(
            contract.projectId!,
            tokenData,
          );
          if (!isCancelled && res && res.data) {
            setProjectData(res.data);
          }
        } catch (err) {
          console.error("Error fetching linked project detail:", err);
        } finally {
          if (!isCancelled) setIsLoadingProject(false);
        }
      };
      fetchProject();
      return () => {
        isCancelled = true;
      };
    } else {
      setProjectData(null);
    }
  }, [contract?.projectId, tokenData]);

  const formatIDR = (val?: number | null, isVisible = true) => {
    if (!isVisible) return "Rp ••••••••";
    if (val === undefined || val === null || isNaN(val)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: val % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const deadline = useMemo(() => {
    if (!contract?.contractEndDate)
      return { isExpiring: false, isExpired: false, daysRemaining: 0 };
    const end = new Date(contract.contractEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      isExpired: diffDays < 0,
      isExpiring: diffDays >= 0 && diffDays <= 30,
      daysRemaining: diffDays,
    };
  }, [contract?.contractEndDate]);

  // Payment Realization & TOP Calculations
  const topTotalSum = useMemo(() => {
    return (contract?.topList || []).reduce(
      (acc, curr) => acc + (curr.topValues || 0),
      0,
    );
  }, [contract?.topList]);

  const itemsTotalSum = useMemo(() => {
    return (contract?.items || []).reduce(
      (acc, curr) => acc + (curr.itemValues || 0),
      0,
    );
  }, [contract?.items]);

  const paidTopItems = useMemo(() => {
    return (contract?.topList || []).filter(
      (t) => t.topStatus?.toUpperCase() === "PAID",
    );
  }, [contract?.topList]);

  const paidTotalSum = useMemo(() => {
    return paidTopItems.reduce((acc, curr) => {
      const attachmentRealization = (curr.topAttachments || []).reduce(
        (attAcc, att) => attAcc + (att.topRealizationAmount ?? 0),
        0,
      );
      return (
        acc +
        (attachmentRealization > 0
          ? attachmentRealization
          : curr.topValues || 0)
      );
    }, 0);
  }, [paidTopItems]);

  const paymentProgressPercentage = useMemo(() => {
    if (!contract?.workValue || contract.workValue <= 0) return 0;
    return Math.min(100, Math.round((paidTotalSum / contract.workValue) * 100));
  }, [contract?.workValue, paidTotalSum]);

  const totalTopSteps = contract?.topList?.length || 0;
  const paidTopStepsCount = paidTopItems.length;
  const remainingPaymentValue = Math.max(
    0,
    (contract?.workValue || 0) - paidTotalSum,
  );

  const getStatusColorScheme = (st?: string) => {
    switch (st?.toUpperCase()) {
      case "ACTIVE":
        return "green";
      case "COMPLETED":
        return "blue";
      case "EXPIRED":
        return "orange";
      case "TERMINATED":
        return "red";
      default:
        return "gray";
    }
  };

  const getTopStatusBadgeColor = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "green";
      case "APPROVED":
        return "teal";
      case "VERIFIED":
        return "blue";
      case "SUBMITTED":
        return "purple";
      case "REJECTED":
        return "red";
      case "SCHEDULED":
      case "PENDING":
      default:
        return "gray";
    }
  };

  // Tab Definitions with structured metadata for section headers
  const tabs = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview & Scope",
        icon: FiFileText,
        count: contract?.items?.length || 0,
        countLabel: "Items",
        title: "Contract Summary & Scope",
        description:
          "Core contract agreement terms, deliverable items, CAPEX/OPEX allocation, PIC contacts, and contract clauses.",
      },
      {
        id: "top-schedule",
        label: "Milestone Schedule (TOP)",
        icon: FiCreditCard,
        count: contract?.topList?.length || 0,
        countLabel: "Milestones",
        title: "Schedule & Milestone Composition (TOP)",
        description:
          "Disbursement milestone stages, percentage weight proportions, due dates, and deliverable details.",
      },
      {
        id: "payment-tracking",
        label: "Payment Tracking",
        icon: IoReceiptOutline,
        countBadge: `${paidTopStepsCount}/${totalTopSteps}`,
        title: "Payment Realization & Proof Monitoring",
        description:
          "Payment milestone tracking, BAST verification documents, Invoices, Tax Invoices, and document repositories.",
      },
      {
        id: "timelines",
        label: "Timeline & Bank Guarantee",
        icon: FiCalendar,
        title: "Project Timeline & Financial Bank Guarantees",
        description:
          "Contract legal validity, physical work duration, SLA warranty period, and bank guarantee status (Performance Bond & Warranty).",
      },
      {
        id: "documents",
        label: "Contract Documents",
        icon: FiPaperclip,
        count: contract?.mediaList?.length || 0,
        countLabel: "Files",
        title: "Contract Documents & Legal Files",
        description:
          "Primary PKS agreements, SPK, addenda, and bank guarantee certificates stored securely in MinIO.",
      },
      {
        id: "cost-governance",
        label: "Cost Governance (3-Pillars)",
        icon: FiTrendingUp,
        title: "Cost Governance & Multi-HPS Analytics",
        description:
          "3-pillar financial comparison: RBB Work Program budget ceiling, multi-tier HPS (IT, General, Committee), and Vendor Contract Value.",
      },
      {
        id: "settings",
        label: "Settings & Edit",
        icon: FiSliders,
        title: "Contract Settings & Data Modification",
        description:
          "Update billing parameters, SPK reference numbers, validity period extensions, and addendum notes.",
      },
      {
        id: "history",
        label: "Revision History",
        icon: FiRotateCcw,
        count: contract?.historyList?.length || 0,
        countLabel: "Rev",
        title: "Audit Trail Log & Revision History",
        description:
          "Audit log history of contract value changes, milestone adjustments, and legal addendum modifications.",
      },
    ],
    [
      contract?.items?.length,
      contract?.topList?.length,
      paidTopStepsCount,
      totalTopSteps,
      contract?.mediaList?.length,
      contract?.historyList?.length,
    ],
  );

  const tabQueryParam = searchParams.get("tab");

  // Synchronize active tab from URL search parameter on initial mount or back/forward navigation
  useEffect(() => {
    if (tabQueryParam) {
      const targetIdx = tabs.findIndex(
        (t) => t.id.toLowerCase() === tabQueryParam.toLowerCase(),
      );
      if (targetIdx !== -1) {
        setActiveTabIndex(targetIdx);
      }
    }
  }, [tabQueryParam, tabs]);

  // Handle Tab Switch with instant state update and seamless URL parameter persistence
  const handleTabChange = useCallback(
    (idx: number) => {
      setActiveTabIndex(idx);
      if (typeof window !== "undefined" && tabs[idx]) {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabs[idx].id);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [tabs],
  );

  const fromParam = searchParams.get("from");
  const returnUrlParam = searchParams.get("returnUrl");

  // Dynamic Back Target & Label based on query context
  const dynamicBackConfig = useMemo(() => {
    if (returnUrlParam) {
      return {
        url: returnUrlParam,
        label: "Back to Previous Page",
      };
    }
    if (fromParam === "project-manage" && (contract?.projectId || projectData?.id)) {
      const pId = contract?.projectId || projectData?.id;
      const pCode = projectData?.projectCode || projectData?.projectName || "Project";
      return {
        url: `/projects/manage?id=${pId}`,
        label: `Back to Project (${pCode})`,
      };
    }
    if (fromParam === "vendor-detail" && contract?.vendorId) {
      const vName = contract?.vendorName || contract?.vendor?.vendorName || "Vendor";
      return {
        url: `/vendor-management/detail?id=${contract.vendorId}`,
        label: `Back to Vendor Profile (${vName})`,
      };
    }
    if (fromParam === "projects-procurements") {
      return {
        url: "/projects-procurements",
        label: "Back to Procurement Projects",
      };
    }
    if (fromParam === "rbb") {
      return {
        url: "/master-data/rbb",
        label: "Back to RBB Management",
      };
    }
    return {
      url: "/vendor-management/contracts",
      label: "Back to Contracts Directory",
    };
  }, [
    fromParam,
    returnUrlParam,
    contract?.projectId,
    contract?.vendorId,
    contract?.vendorName,
    contract?.vendor?.vendorName,
    projectData?.id,
    projectData?.projectName,
    projectData?.projectCode,
  ]);

  if (isLoading) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Vendor Contract Details"
          breadCrumb={["Home", "Contracts", "Loading..."]}
        />
        <Flex
          justify="center"
          align="center"
          minH="500px"
          direction="column"
          gap={4}
        >
          <Spinner
            size="xl"
            thickness="4px"
            speed="0.65s"
            color="secondary.500"
          />
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            Loading Vendor Contract Data...
          </Text>
        </Flex>
      </LayoutAdmin>
    );
  }

  if (!contract) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Vendor Contract Details"
          breadCrumb={["Home", "Contracts", "Not Found"]}
        />
        <Box p={8}>
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            minH="260px"
            rounded="2xl"
            border="1px"
            borderColor="orange.200"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Contract Not Found
            </AlertTitle>
            <AlertDescription maxWidth="sm" color="gray.600" mb={4}>
              The contract with the specified ID was not found in the system
              database.
            </AlertDescription>
            <Link href="/vendor-management/contracts">
              <Button
                leftIcon={<FiArrowLeft />}
                colorScheme="secondary"
                size="sm"
                rounded="xl"
              >
                Back to Contracts Directory
              </Button>
            </Link>
          </Alert>
        </Box>
      </LayoutAdmin>
    );
  }

  const activeTabInfo = tabs[activeTabIndex] || tabs[0];

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Vendor Contract Details"
        breadCrumb={["Home", "Contracts", contract.contractNumber || "Detail"]}
      />

      <Box
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 3, md: 5 }}
        w="full"
        maxW="1650px"
        mx="auto"
      >
        <VStack spacing={{ base: 6, md: 7 }} align="stretch" w="full">
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* DEADLINE & EXPIRATION ALERTS                                       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {deadline.isExpired && (
            <Alert
              status="error"
              rounded="2xl"
              shadow="sm"
              border="1px"
              borderColor="red.300"
            >
              <AlertIcon boxSize={5} />
              <Box flex={1}>
                <AlertTitle fontSize="sm" fontWeight="bold">
                  CRITICAL ALERT: Contract Validity Period Has Expired (
                  {Math.abs(deadline.daysRemaining)} days ago)
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  Promptly initiate an addendum extension or execute contract
                  closure procedures (BAST / Final Settlement).
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {deadline.isExpiring && !deadline.isExpired && (
            <Alert
              status="warning"
              rounded="2xl"
              shadow="sm"
              border="1px"
              borderColor="orange.300"
            >
              <AlertIcon boxSize={5} />
              <Box flex={1}>
                <AlertTitle fontSize="sm" fontWeight="bold">
                  WARNING: Contract Expires in {deadline.daysRemaining} Days
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  Promptly review vendor performance evaluation and initiate
                  contract extension if required.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* HERO BANNER & PROGRESSION CARD (Inspirasi /projects/manage)        */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <Box
            position="relative"
            overflow="hidden"
            rounded={radiusStyle}
            shadow="xl"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            {/* Gradient Background */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient={
                colorMode === "light"
                  ? "linear(135deg, secondary.600 0%, secondary.700 50%, secondary.900 100%)"
                  : "linear(135deg, secondary.700 0%, secondary.800 50%, secondary.950 100%)"
              }
            />

            {/* Subtle Watermark Logo */}
            <Box
              position="absolute"
              top={-4}
              right={-4}
              opacity={0.06}
              pointerEvents="none"
              zIndex={0}
            >
              <Box
                as="img"
                src="/img/logo-bjb-black-wing.svg"
                alt="BJB Logo"
                w={{ base: "140px", md: "240px" }}
                h="auto"
                filter="brightness(0) invert(1)"
              />
            </Box>

            {/* Inner Content */}
            <Box
              position="relative"
              zIndex={1}
              color="white"
              p={{ base: 5, md: 7, lg: 8 }}
            >
              <VStack spacing={{ base: 5, md: 6 }} align="stretch">
                {/* Row 1: Top Navigation Bar with Direct Back and Quick Links */}
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <HStack spacing={2} wrap="wrap">
                    <Link href="/vendor-management/contracts">
                      <Button
                        leftIcon={<FiArrowLeft />}
                        size="sm"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        color={colorMode === "light" ? "gray.800" : "white"}
                        _hover={{
                          bg: colorMode === "light" ? "gray.100" : "gray.700",
                          transform: "translateY(-1px)",
                        }}
                        shadow="md"
                        rounded="full"
                        px={4}
                        fontWeight="700"
                        fontSize="xs"
                        border="1px"
                        borderColor={
                          colorMode === "light"
                            ? "blackAlpha.100"
                            : "whiteAlpha.200"
                        }
                        transition="all 0.2s ease"
                      >
                        Back to Contracts Directory
                      </Button>
                    </Link>

                    {/* Related Quick Jump Menu */}
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<FiChevronDown />}
                        size="sm"
                        variant="solid"
                        bg="whiteAlpha.200"
                        color="white"
                        _hover={{
                          bg: "whiteAlpha.300",
                          transform: "translateY(-1px)",
                        }}
                        _active={{ bg: "whiteAlpha.400" }}
                        backdropFilter="blur(10px)"
                        border="1px"
                        borderColor="whiteAlpha.300"
                        rounded="full"
                        px={3.5}
                        fontSize="xs"
                        fontWeight="600"
                        transition="all 0.2s ease"
                      >
                        Related Entities
                      </MenuButton>
                      <MenuList
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        color={colorMode === "light" ? "gray.800" : "white"}
                        borderColor={
                          colorMode === "light" ? "gray.200" : "gray.700"
                        }
                        shadow="xl"
                        rounded="xl"
                        py={2}
                        zIndex={10}
                      >
                        <MenuItem
                          as={Link}
                          href="/vendor-management/contracts"
                          icon={<FiFolder />}
                          fontSize="xs"
                          fontWeight="600"
                        >
                          Contracts Directory Hub
                        </MenuItem>

                        {contract.vendorId && (
                          <MenuItem
                            as="a"
                            href={`/vendor-management/detail?id=${contract.vendorId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            icon={<FiBriefcase />}
                            fontSize="xs"
                            fontWeight="600"
                          >
                            Vendor Profile:{" "}
                            {contract.vendorName ||
                              contract.vendor?.vendorName ||
                              "Vendor Details"}{" "}
                            ↗
                          </MenuItem>
                        )}

                        {(contract.projectId || projectData?.id) && (
                          <MenuItem
                            as="a"
                            href={`/projects/manage?id=${contract.projectId || projectData?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            icon={<FiLayers />}
                            fontSize="xs"
                            fontWeight="600"
                          >
                            Procurement Project:{" "}
                            {projectData?.projectCode ||
                              projectData?.projectName ||
                              contract.projectName ||
                              "Project Manage"}{" "}
                            ↗
                          </MenuItem>
                        )}

                        <MenuDivider
                          borderColor={
                            colorMode === "light" ? "gray.100" : "gray.700"
                          }
                        />

                        <MenuItem
                          as="a"
                          href="/projects-procurements"
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<FiFileText />}
                          fontSize="xs"
                        >
                          Procurement Projects Directory ↗
                        </MenuItem>

                        <MenuItem
                          as="a"
                          href="/vendor-management"
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<FiUser />}
                          fontSize="xs"
                        >
                          Vendor Management Master ↗
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>

                  <HStack spacing={2.5}>
                    <Button
                      leftIcon={showWorkValue ? <FiEyeOff /> : <FiEye />}
                      size="sm"
                      variant="solid"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{
                        bg: "whiteAlpha.300",
                        transform: "translateY(-1px)",
                      }}
                      backdropFilter="blur(10px)"
                      border="1px"
                      borderColor="whiteAlpha.300"
                      rounded="full"
                      onClick={() => setShowWorkValue(!showWorkValue)}
                      fontSize="xs"
                      fontWeight="600"
                      transition="all 0.2s ease"
                    >
                      {showWorkValue ? "Sembunyikan Nilai" : "Tampilkan Nilai"}
                    </Button>

                    <Button
                      leftIcon={<FiRotateCcw />}
                      size="sm"
                      variant="solid"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{
                        bg: "whiteAlpha.300",
                        transform: "translateY(-1px)",
                      }}
                      backdropFilter="blur(10px)"
                      border="1px"
                      borderColor="whiteAlpha.300"
                      rounded="full"
                      onClick={fetchDetail}
                      isLoading={isLoading}
                      fontSize="xs"
                      fontWeight="600"
                      transition="all 0.2s ease"
                    >
                      Refresh
                    </Button>
                  </HStack>
                </Flex>

                {/* Row 2: Contract Heading & Payment Progression Widget */}
                <Grid
                  templateColumns={{ base: "1fr", lg: "1.35fr 1fr" }}
                  gap={{ base: 6, lg: 8 }}
                  alignItems="center"
                >
                  {/* Left: Contract Icon/Avatar, Title, Vendor, and Metadata */}
                  <HStack spacing={4} align="start" flex={1}>
                    <Box
                      w={{ base: "60px", md: "72px" }}
                      h={{ base: "60px", md: "72px" }}
                      bg="whiteAlpha.200"
                      backdropFilter="blur(12px)"
                      border="2px solid"
                      borderColor="whiteAlpha.300"
                      rounded="2xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="lg"
                      flexShrink={0}
                    >
                      <Icon
                        as={FiFileText}
                        boxSize={{ base: 7, md: 8 }}
                        color="white"
                      />
                    </Box>

                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={2} align="center" wrap="wrap">
                        <Badge
                          colorScheme={getStatusColorScheme(contract.status)}
                          variant="solid"
                          px={3}
                          py={0.5}
                          rounded="full"
                          fontSize="xs"
                          fontWeight="800"
                          letterSpacing="wider"
                        >
                          {contract.status || "ACTIVE"}
                        </Badge>

                        {contract.contractBillingType && (
                          <Badge
                            bg="whiteAlpha.300"
                            color="white"
                            px={2.5}
                            py={0.5}
                            rounded="md"
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {contract.contractBillingType}
                          </Badge>
                        )}

                        {contract.contractBillingType &&
                          contract.contractBillingType !== "MILESTONE" && (
                            <Badge
                              bg={
                                Boolean(contract.subscriptionAutoRenew)
                                  ? "green.500"
                                  : "whiteAlpha.300"
                              }
                              color="white"
                              px={2.5}
                              py={0.5}
                              rounded="md"
                              fontSize="xs"
                              fontWeight="700"
                            >
                              {Boolean(contract.subscriptionAutoRenew)
                                ? "Auto-Renew"
                                : "Non Auto-Renew"}
                            </Badge>
                          )}
                      </HStack>

                      <Heading
                        size={{ base: "md", md: "lg" }}
                        fontWeight="800"
                        color="white"
                        lineHeight="1.25"
                      >
                        {contract.corpName ||
                          contract.projectName ||
                          "Vendor Commercial Contract"}
                      </Heading>

                      {/* Clean Structured Metadata with Dot Separators & Interactive Links */}
                      <HStack
                        spacing={2.5}
                        fontSize="sm"
                        color="whiteAlpha.900"
                        wrap="wrap"
                        align="center"
                      >
                        <Text fontWeight="700">
                          SPK: {contract.corpNumber || "-"}
                        </Text>
                        <Text opacity={0.6}>•</Text>
                        <Text fontWeight="700">
                          Contract No: {contract.contractNumber || "-"}
                        </Text>
                        <Text opacity={0.6}>•</Text>

                        {contract.vendorId ? (
                          <Link
                            href={`/vendor-management/detail?id=${contract.vendorId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <HStack
                              spacing={1.5}
                              bg="whiteAlpha.200"
                              _hover={{
                                bg: "whiteAlpha.300",
                                transform: "translateY(-1px)",
                              }}
                              px={2.5}
                              py={0.5}
                              rounded="md"
                              cursor="pointer"
                              transition="all 0.2s"
                            >
                              <Icon as={FiBriefcase} boxSize={3.5} />
                              <Text fontWeight="700">
                                Vendor:{" "}
                                {contract.vendorName ||
                                  contract.vendor?.vendorName ||
                                  "-"}{" "}
                                ({contract.vendor?.vendorType || "PT"})
                              </Text>
                              <Icon as={FiExternalLink} boxSize={3} opacity={0.8} />
                            </HStack>
                          </Link>
                        ) : (
                          <Text fontWeight="600">
                            Vendor:{" "}
                            {contract.vendorName ||
                              contract.vendor?.vendorName ||
                              "-"}{" "}
                            ({contract.vendor?.vendorType || "PT"})
                          </Text>
                        )}

                        {(contract.projectId || projectData?.id) && (
                          <>
                            <Text opacity={0.6}>•</Text>
                            <Link
                              href={`/projects/manage?id=${contract.projectId || projectData?.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <HStack
                                spacing={1.5}
                                bg="purple.500/80"
                                color="white"
                                _hover={{
                                  bg: "purple.600",
                                  transform: "translateY(-1px)",
                                }}
                                px={2.5}
                                py={0.5}
                                rounded="md"
                                cursor="pointer"
                                transition="all 0.2s"
                              >
                                <Icon as={FiLayers} boxSize={3.5} />
                                <Text fontWeight="700">
                                  Project:{" "}
                                  {projectData?.projectCode ||
                                    projectData?.projectName ||
                                    contract.projectName ||
                                    "Linked Project"}
                                </Text>
                                <Icon as={FiExternalLink} boxSize={3} opacity={0.8} />
                              </HStack>
                            </Link>
                          </>
                        )}

                        <Text opacity={0.6}>•</Text>
                        <Text opacity={0.9}>
                          {new Date(
                            contract.contractStartDate,
                          ).toLocaleDateString("en-US")}{" "}
                          –{" "}
                          {new Date(
                            contract.contractEndDate,
                          ).toLocaleDateString("en-US")}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Right: Payment Progression KPI Card */}
                  <Box
                    p={{ base: 4, md: 5 }}
                    bg="whiteAlpha.200"
                    backdropFilter="blur(16px)"
                    border="1px"
                    borderColor="whiteAlpha.300"
                    rounded="2xl"
                    shadow="inner"
                  >
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                          <Icon
                            as={FiCreditCard}
                            color="green.300"
                            boxSize={4.5}
                          />
                          <Text
                            fontSize="xs"
                            fontWeight="800"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            opacity={0.95}
                          >
                            Payment Realization (TOP)
                          </Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="900" color="green.300">
                          {paymentProgressPercentage}%
                        </Text>
                      </Flex>

                      {/* Progress Bar */}
                      <Progress
                        value={paymentProgressPercentage}
                        size="sm"
                        colorScheme="green"
                        rounded="full"
                        bg="whiteAlpha.300"
                      />

                      {/* Financial Figures Comparison */}
                      <SimpleGrid columns={2} spacing={3} pt={1}>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="2xs"
                            textTransform="uppercase"
                            opacity={0.8}
                            fontWeight="700"
                          >
                            Total Contract Value
                          </Text>
                          <Text fontSize="md" fontWeight="800" color="white">
                            {formatIDR(contract.workValue, showWorkValue)}
                          </Text>
                        </VStack>

                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="2xs"
                            textTransform="uppercase"
                            opacity={0.8}
                            fontWeight="700"
                          >
                            Realized Paid Amount
                          </Text>
                          <Text
                            fontSize="md"
                            fontWeight="800"
                            color="green.300"
                          >
                            {formatIDR(paidTotalSum, showWorkValue)}
                          </Text>
                        </VStack>
                      </SimpleGrid>

                      <Divider borderColor="whiteAlpha.200" my={0.5} />

                      <Flex
                        justify="space-between"
                        align="center"
                        fontSize="xs"
                        opacity={0.95}
                      >
                        <Text>
                          Sisa:{" "}
                          <strong>
                            {formatIDR(remainingPaymentValue, showWorkValue)}
                          </strong>
                        </Text>
                        <Badge
                          bg="whiteAlpha.300"
                          color="white"
                          fontSize="2xs"
                          px={2.5}
                          py={0.5}
                          rounded="md"
                        >
                          {paidTopStepsCount} of {totalTopSteps} Milestones
                          Completed
                        </Badge>
                      </Flex>
                    </VStack>
                  </Box>
                </Grid>
              </VStack>
            </Box>
          </Box>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 2-SECTION MASTER-DETAIL LAYOUT (Sidebar ~25% : Canvas ~75%)       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={{ base: 6, lg: 7 }}
            w="full"
            align="flex-start"
          >
            {/* ─────────────────────────────────────────────────────────────── */}
            {/* LEFT SIDEBAR (~25% / 320px–340px on Desktop)                    */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <Box
              w={{ base: "full", lg: "320px", xl: "340px" }}
              flexShrink={0}
              position={{ lg: "sticky" }}
              top="24px"
            >
              <VStack spacing={5} align="stretch" w="full">
                {/* 1. Profile & Quick Info Card (Secondary Color Scheme - Vendor Short Info Only) */}
                <Box
                  p={5}
                  rounded="2xl"
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "secondary.200" : "secondary.700"
                  }
                  bg={colorMode === "light" ? "secondary.50" : "secondary.900"}
                  shadow="sm"
                  position="relative"
                  overflow="hidden"
                >
                  {/* Top Accent Line */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="3px"
                    bgGradient="linear(to-r, secondary.400, secondary.600)"
                  />

                  <VStack align="stretch" spacing={4}>
                    {/* Header Title */}
                    <Flex justify="space-between" align="center">
                      <HStack
                        spacing={2.5}
                        color={
                          colorMode === "light"
                            ? "secondary.800"
                            : "secondary.200"
                        }
                      >
                        <Box
                          p={1.5}
                          rounded="lg"
                          bg={
                            colorMode === "light"
                              ? "secondary.100"
                              : "secondary.800"
                          }
                          color={
                            colorMode === "light"
                              ? "secondary.700"
                              : "secondary.200"
                          }
                        >
                          <Icon as={FiBriefcase} boxSize={4} />
                        </Box>
                        <Heading
                          size="xs"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          fontWeight="800"
                        >
                          Vendor Information
                        </Heading>
                      </HStack>
                      <Badge
                        colorScheme={getStatusColorScheme(contract.status)}
                        variant="solid"
                        fontSize="3xs"
                        px={2}
                        py={0.5}
                        rounded="full"
                        fontWeight="bold"
                      >
                        {contract.status || "ACTIVE"}
                      </Badge>
                    </Flex>

                    <Divider
                      borderColor={
                        colorMode === "light"
                          ? "secondary.200"
                          : "secondary.700"
                      }
                    />

                    {/* Vendor Avatar & Core Identity */}
                    <VStack align="stretch" spacing={2.5}>
                      <HStack spacing={3} align="center">
                        <Avatar
                          size="md"
                          name={
                            contract.vendor?.vendorName ||
                            contract.vendorName ||
                            "Vendor"
                          }
                          bg="secondary.500"
                          color="white"
                          fontWeight="bold"
                          rounded="xl"
                        />
                        <VStack align="start" spacing={0.5} flex={1}>
                          <Text
                            fontSize="sm"
                            fontWeight="800"
                            color={colorMode === "light" ? "gray.800" : "white"}
                            lineHeight="1.2"
                          >
                            {contract.vendor?.vendorName ||
                              contract.vendorName ||
                              "-"}
                          </Text>
                          <HStack spacing={1.5} wrap="wrap">
                            <Badge
                              colorScheme="blue"
                              fontSize="3xs"
                              rounded="md"
                            >
                              {contract.vendor?.vendorCode ||
                                contract.vendorCode ||
                                "VENDOR"}
                            </Badge>
                            <Badge
                              colorScheme="gray"
                              fontSize="3xs"
                              rounded="md"
                            >
                              {contract.vendor?.vendorType || "PT"}
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>

                      {(contract.vendor?.city || contract.vendor?.country) && (
                        <HStack
                          spacing={1.5}
                          fontSize="xs"
                          color="gray.500"
                          pt={0.5}
                        >
                          <Icon
                            as={FiMapPin}
                            boxSize={3.5}
                            color="secondary.500"
                          />
                          <Text noOfLines={1}>
                            {[contract.vendor.city, contract.vendor.country]
                              .filter(Boolean)
                              .join(", ")}
                          </Text>
                        </HStack>
                      )}
                    </VStack>

                    {/* PIC Business Short Contact */}
                    {(contract.vendor?.picBusinessName ||
                      contract.vendor?.picBusinessEmail) && (
                      <Box
                        p={2.5}
                        rounded="xl"
                        bg={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "blackAlpha.400"
                        }
                        border="1px solid"
                        borderColor={
                          colorMode === "light"
                            ? "secondary.200"
                            : "secondary.800"
                        }
                      >
                        <VStack align="start" spacing={1}>
                          <HStack
                            spacing={1.5}
                            color="secondary.600"
                            fontSize="3xs"
                            fontWeight="800"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            <Icon as={FiUser} boxSize={3} />
                            <Text>PIC Contacts</Text>
                          </HStack>
                          <Text
                            fontSize="xs"
                            fontWeight="700"
                            color={
                              colorMode === "light" ? "gray.800" : "gray.200"
                            }
                            noOfLines={1}
                          >
                            {contract.vendor?.picBusinessName || "-"}
                          </Text>
                          {contract.vendor?.picBusinessEmail && (
                            <HStack
                              spacing={1.5}
                              fontSize="xs"
                              color="gray.500"
                            >
                              <Icon as={FiMail} boxSize={3} />
                              <Text noOfLines={1}>
                                {contract.vendor.picBusinessEmail}
                              </Text>
                            </HStack>
                          )}
                          {contract.vendor?.picBusinessNumberHotline && (
                            <HStack
                              spacing={1.5}
                              fontSize="xs"
                              color="gray.500"
                            >
                              <Icon as={FiPhone} boxSize={3} />
                              <Text noOfLines={1}>
                                {contract.vendor.picBusinessNumberHotline}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    )}


                  </VStack>
                </Box>

                {/* 2. Vertical Navigation Menu (Tabs) */}
                <Box
                  p={3}
                  rounded="2xl"
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.850"}
                  shadow="sm"
                >
                  <VStack spacing={2} align="stretch">
                    {/* Navigation Section Header Title */}
                    <Flex
                      justify="space-between"
                      align="center"
                      px={2}
                      pt={1}
                      pb={2}
                      borderBottom="1px solid"
                      borderColor={
                        colorMode === "light" ? "gray.100" : "gray.750"
                      }
                    >
                      <HStack
                        spacing={2}
                        color={
                          colorMode === "light"
                            ? "secondary.700"
                            : "secondary.300"
                        }
                      >
                        <Icon as={FiLayers} boxSize={4} />
                        <Text
                          fontSize="xs"
                          fontWeight="800"
                          textTransform="uppercase"
                          letterSpacing="wider"
                        >
                          Navigations
                        </Text>
                      </HStack>
                    </Flex>

                    {/* Tab Menu List */}
                    <VStack spacing={1.5} align="stretch">
                      {tabs.map((tab, idx) => {
                        const isActive = activeTabIndex === idx;
                        return (
                          <Button
                            key={tab.id}
                            onClick={() => handleTabChange(idx)}
                            variant="ghost"
                            justifyContent="space-between"
                            w="full"
                            h="auto"
                            py={3}
                            px={3.5}
                            rounded="xl"
                            position="relative"
                            bg={
                              isActive
                                ? colorMode === "light"
                                  ? "secondary.500"
                                  : "secondary.600"
                                : "transparent"
                            }
                            color={
                              isActive
                                ? "white"
                                : colorMode === "light"
                                  ? "gray.700"
                                  : "gray.300"
                            }
                            shadow={isActive ? "md" : "none"}
                            _hover={{
                              bg: isActive
                                ? colorMode === "light"
                                  ? "secondary.600"
                                  : "secondary.500"
                                : colorMode === "light"
                                  ? "secondary.50"
                                  : "whiteAlpha.100",
                              color: isActive
                                ? "white"
                                : colorMode === "light"
                                  ? "secondary.700"
                                  : "white",
                              transform: "translateX(3px)",
                            }}
                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                          >
                            <HStack spacing={3}>
                              <Icon
                                as={tab.icon}
                                // boxSize={5}
                                color={
                                  isActive
                                    ? "white"
                                    : colorMode === "light"
                                      ? "secondary.600"
                                      : "secondary.300"
                                }
                              />
                              <Text
                                fontSize="md"
                                fontWeight={isActive ? "800" : "600"}
                              >
                                {tab.label}
                              </Text>
                            </HStack>

                            {tab.countBadge ? (
                              <Badge
                                bg={
                                  isActive ? "whiteAlpha.300" : "secondary.100"
                                }
                                color={isActive ? "white" : "secondary.800"}
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                rounded="full"
                                fontWeight="700"
                              >
                                {tab.countBadge}
                              </Badge>
                            ) : tab.count !== undefined && tab.count > 0 ? (
                              <Badge
                                bg={
                                  isActive
                                    ? "whiteAlpha.300"
                                    : colorMode === "light"
                                      ? "gray.100"
                                      : "gray.700"
                                }
                                color={
                                  isActive
                                    ? "white"
                                    : colorMode === "light"
                                      ? "gray.700"
                                      : "gray.200"
                                }
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                rounded="full"
                                fontWeight="700"
                              >
                                {tab.count}
                              </Badge>
                            ) : null}
                          </Button>
                        );
                      })}
                    </VStack>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* RIGHT MAIN CONTENT CANVAS (~75% / flex: 1)                     */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <Box flex={1} minW={0} w="full">
              <Card
                rounded="2xl"
                shadow="sm"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.900"}
                minH="650px"
              >
                <CardBody p={{ base: 5, md: 7, lg: 8 }}>
                  {/* ─── DYNAMIC SECTION HEADER (Related to Active Menu Section) ─── */}
                  <Box
                    pb={5}
                    mb={6}
                    borderBottom="1px solid"
                    borderColor={
                      colorMode === "light" ? "gray.100" : "gray.700"
                    }
                  >
                    <Flex
                      justify="space-between"
                      align={{ base: "start", md: "center" }}
                      wrap="wrap"
                      gap={4}
                    >
                      <HStack spacing={3.5} align="center">
                        <Box
                          w="46px"
                          h="46px"
                          rounded="xl"
                          bgGradient={
                            colorMode === "light"
                              ? "linear(135deg, secondary.500, secondary.700)"
                              : "linear(135deg, secondary.600, secondary.800)"
                          }
                          color="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          shadow="md"
                          flexShrink={0}
                        >
                          <Icon as={activeTabInfo.icon} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0.5}>
                          <HStack spacing={2.5} align="center">
                            <Heading
                              size="md"
                              color={
                                colorMode === "light" ? "gray.800" : "white"
                              }
                              fontWeight="800"
                            >
                              {activeTabInfo.title}
                            </Heading>
                            {activeTabInfo.countBadge ? (
                              <Badge
                                colorScheme="green"
                                fontSize="2xs"
                                px={2.5}
                                py={0.5}
                                rounded="md"
                                fontWeight="bold"
                              >
                                {activeTabInfo.countBadge}
                              </Badge>
                            ) : activeTabInfo.count !== undefined &&
                              activeTabInfo.count > 0 ? (
                              <Badge
                                colorScheme="blue"
                                fontSize="2xs"
                                px={2.5}
                                py={0.5}
                                rounded="md"
                                fontWeight="bold"
                              >
                                {activeTabInfo.count}{" "}
                                {activeTabInfo.countLabel || "Items"}
                              </Badge>
                            ) : null}
                          </HStack>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="medium"
                          >
                            {activeTabInfo.description}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Section Contextual Quick Chips */}
                      <HStack spacing={2}>
                        <Badge
                          colorScheme="secondary"
                          variant="subtle"
                          fontSize="2xs"
                          px={3}
                          py={1}
                          rounded="full"
                          fontWeight="bold"
                        >
                          SPK: {contract.corpNumber || "-"}
                        </Badge>
                      </HStack>
                    </Flex>
                  </Box>

                  {/* ─── TAB 0: Overview & Summary ─── */}
                  {activeTabIndex === 0 && (
                    <VStack spacing={7} align="stretch">
                      {/* ══════════════════════════════════════════════════════════ */}
                      {/* MODULE 1: DATA REKANAN VENDOR (DETAIL LENGKAP)           */}
                      {/* ══════════════════════════════════════════════════════════ */}
                      <Box
                        p={{ base: 5, md: 6 }}
                        rounded="2xl"
                        border="1px"
                        borderColor={
                          colorMode === "light" ? "gray.200" : "gray.700"
                        }
                        bg={
                          colorMode === "light" ? "gray.50/50" : "gray.800/40"
                        }
                      >
                        <VStack align="stretch" spacing={5}>
                          {/* Section Header */}
                          <Flex
                            justify="space-between"
                            align={{ base: "start", md: "center" }}
                            wrap="wrap"
                            gap={3}
                          >
                            <HStack spacing={3}>
                              <Box
                                p={2}
                                rounded="xl"
                                bg={
                                  colorMode === "light"
                                    ? "secondary.100"
                                    : "secondary.900"
                                }
                                color={
                                  colorMode === "light"
                                    ? "secondary.700"
                                    : "secondary.200"
                                }
                              >
                                <Icon as={FiBriefcase} boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Heading
                                  size="sm"
                                  fontWeight="800"
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                >
                                  Linked Master Vendor Details
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                  Corporate entity information, risk profile,
                                  and official PIC contacts
                                </Text>
                              </VStack>
                            </HStack>

                            {contract.vendorId && (
                              <Link
                                href={`/vendor-management/detail?id=${contract.vendorId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="xs"
                                  variant="outline"
                                  colorScheme="secondary"
                                  rightIcon={<Icon as={FiExternalLink} />}
                                  fontWeight="700"
                                  rounded="lg"
                                >
                                  Full Vendor Details ↗
                                </Button>
                              </Link>
                            )}
                          </Flex>

                          <Divider
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                          />

                          {/* 2-Column Grid: Left (Company Identity) & Right (Contacts & Compliance) */}
                          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            {/* Column Left: Identity & Address */}
                            <VStack align="stretch" spacing={3.5}>
                              <HStack spacing={3.5} align="start">
                                <Avatar
                                  size="lg"
                                  name={
                                    contract.vendor?.vendorName ||
                                    contract.vendorName ||
                                    "Vendor"
                                  }
                                  bg="secondary.500"
                                  color="white"
                                  fontWeight="bold"
                                  rounded="2xl"
                                />
                                <VStack align="start" spacing={1} flex={1}>
                                  <Text
                                    fontSize="md"
                                    fontWeight="800"
                                    color={
                                      colorMode === "light"
                                        ? "gray.800"
                                        : "white"
                                    }
                                  >
                                    {contract.vendor?.vendorName ||
                                      contract.vendorName ||
                                      "-"}
                                  </Text>
                                  <HStack spacing={2} wrap="wrap">
                                    <Badge
                                      colorScheme="blue"
                                      fontSize="2xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                    >
                                      Kode:{" "}
                                      {contract.vendor?.vendorCode ||
                                        contract.vendorCode ||
                                        "-"}
                                    </Badge>
                                    <Badge
                                      colorScheme="gray"
                                      fontSize="2xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                    >
                                      Business Entity:{" "}
                                      {contract.vendor?.vendorType || "PT"}
                                    </Badge>
                                    <Badge
                                      colorScheme={getStatusColorScheme(
                                        contract.vendor?.status ||
                                          contract.status,
                                      )}
                                      fontSize="2xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                    >
                                      {contract.vendor?.status || "ACTIVE"}
                                    </Badge>
                                  </HStack>
                                </VStack>
                              </HStack>

                              {/* Address & Website */}
                              <VStack align="stretch" spacing={2} pt={1}>
                                <HStack align="start" spacing={2} fontSize="xs">
                                  <Icon
                                    as={FiMapPin}
                                    boxSize={4}
                                    color="gray.400"
                                    mt={0.5}
                                    flexShrink={0}
                                  />
                                  <Text
                                    color={
                                      colorMode === "light"
                                        ? "gray.700"
                                        : "gray.300"
                                    }
                                    lineHeight="1.4"
                                  >
                                    {[
                                      contract.vendor?.address1,
                                      contract.vendor?.address2,
                                      contract.vendor?.city,
                                      contract.vendor?.country,
                                      contract.vendor?.postalCode,
                                    ]
                                      .filter(Boolean)
                                      .join(", ") ||
                                      "Office address not recorded"}
                                  </Text>
                                </HStack>

                                {contract.vendor?.website && (
                                  <HStack
                                    align="center"
                                    spacing={2}
                                    fontSize="xs"
                                  >
                                    <Icon
                                      as={FiGlobe}
                                      boxSize={4}
                                      color="blue.400"
                                      flexShrink={0}
                                    />
                                    <Text
                                      as="a"
                                      href={
                                        contract.vendor.website.startsWith(
                                          "http",
                                        )
                                          ? contract.vendor.website
                                          : `https://${contract.vendor.website}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      color="blue.500"
                                      fontWeight="600"
                                      _hover={{ textDecoration: "underline" }}
                                    >
                                      {contract.vendor.website}
                                    </Text>
                                  </HStack>
                                )}
                              </VStack>

                              {/* Dependency & Impact Risk Profile */}
                              <HStack spacing={4} pt={1}>
                                <Box
                                  p={2.5}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                  flex={1}
                                >
                                  <Text
                                    fontSize="3xs"
                                    color="gray.500"
                                    fontWeight="700"
                                    textTransform="uppercase"
                                  >
                                    Ketergantungan
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="800"
                                    color="orange.500"
                                  >
                                    {contract.vendor?.depedencyLevel ||
                                      "NORMAL"}
                                  </Text>
                                </Box>
                                <Box
                                  p={2.5}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                  flex={1}
                                >
                                  <Text
                                    fontSize="3xs"
                                    color="gray.500"
                                    fontWeight="700"
                                    textTransform="uppercase"
                                  >
                                    Dampak Bisnis
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="800"
                                    color="purple.500"
                                  >
                                    {contract.vendor?.businessImpact ||
                                      "MEDIUM"}
                                  </Text>
                                </Box>
                              </HStack>
                            </VStack>

                            {/* Column Right: Dual PIC Contacts & TDR */}
                            <VStack align="stretch" spacing={3}>
                              <SimpleGrid
                                columns={{ base: 1, sm: 2 }}
                                spacing={3}
                              >
                                {/* PIC Business */}
                                <Box
                                  p={3.5}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                >
                                  <VStack align="start" spacing={1.5}>
                                    <HStack
                                      spacing={1.5}
                                      color="blue.500"
                                      fontSize="3xs"
                                      fontWeight="800"
                                      textTransform="uppercase"
                                      letterSpacing="wider"
                                    >
                                      <Icon as={FiUser} boxSize={3.5} />
                                      <Text>Business PIC Contact</Text>
                                    </HStack>
                                    <Text
                                      fontSize="xs"
                                      fontWeight="800"
                                      color={
                                        colorMode === "light"
                                          ? "gray.800"
                                          : "white"
                                      }
                                      noOfLines={1}
                                    >
                                      {contract.vendor?.picBusinessName || "-"}
                                    </Text>
                                    {contract.vendor?.picBusinessEmail && (
                                      <HStack
                                        spacing={1.5}
                                        fontSize="3xs"
                                        color="gray.500"
                                      >
                                        <Icon as={FiMail} boxSize={3} />
                                        <Text noOfLines={1}>
                                          {contract.vendor.picBusinessEmail}
                                        </Text>
                                      </HStack>
                                    )}
                                    {contract.vendor
                                      ?.picBusinessNumberHotline && (
                                      <HStack
                                        spacing={1.5}
                                        fontSize="3xs"
                                        color="gray.500"
                                      >
                                        <Icon as={FiPhone} boxSize={3} />
                                        <Text noOfLines={1}>
                                          {
                                            contract.vendor
                                              .picBusinessNumberHotline
                                          }
                                        </Text>
                                      </HStack>
                                    )}
                                  </VStack>
                                </Box>

                                {/* PIC Technical */}
                                <Box
                                  p={3.5}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                >
                                  <VStack align="start" spacing={1.5}>
                                    <HStack
                                      spacing={1.5}
                                      color="teal.500"
                                      fontSize="3xs"
                                      fontWeight="800"
                                      textTransform="uppercase"
                                      letterSpacing="wider"
                                    >
                                      <Icon as={FiShield} boxSize={3.5} />
                                      <Text>Technical PIC Contact</Text>
                                    </HStack>
                                    <Text
                                      fontSize="xs"
                                      fontWeight="800"
                                      color={
                                        colorMode === "light"
                                          ? "gray.800"
                                          : "white"
                                      }
                                      noOfLines={1}
                                    >
                                      {contract.vendor?.picTechnicalName || "-"}
                                    </Text>
                                    {contract.vendor?.picTechnicalEmail && (
                                      <HStack
                                        spacing={1.5}
                                        fontSize="3xs"
                                        color="gray.500"
                                      >
                                        <Icon as={FiMail} boxSize={3} />
                                        <Text noOfLines={1}>
                                          {contract.vendor.picTechnicalEmail}
                                        </Text>
                                      </HStack>
                                    )}
                                    {contract.vendor
                                      ?.picTechnicalNumberHotline && (
                                      <HStack
                                        spacing={1.5}
                                        fontSize="3xs"
                                        color="gray.500"
                                      >
                                        <Icon as={FiPhone} boxSize={3} />
                                        <Text noOfLines={1}>
                                          {
                                            contract.vendor
                                              .picTechnicalNumberHotline
                                          }
                                        </Text>
                                      </HStack>
                                    )}
                                  </VStack>
                                </Box>
                              </SimpleGrid>

                              {/* TDR (Tanda Daftar Rekanan) Badges */}
                              <Box
                                p={3}
                                rounded="xl"
                                bg={
                                  colorMode === "light" ? "white" : "gray.850"
                                }
                                border="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "gray.200"
                                    : "gray.700"
                                }
                              >
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  wrap="wrap"
                                  gap={2}
                                >
                                  <HStack
                                    spacing={1.5}
                                    color="gray.500"
                                    fontSize="2xs"
                                    fontWeight="700"
                                    textTransform="uppercase"
                                  >
                                    <Icon as={FiCheckSquare} />
                                    <Text>TDR Certification & Status</Text>
                                  </HStack>
                                  {contract.vendor?.tdrList &&
                                  contract.vendor.tdrList.length > 0 ? (
                                    <HStack spacing={1.5} wrap="wrap">
                                      {contract.vendor.tdrList.map(
                                        (tdr, idx) => (
                                          <Badge
                                            key={tdr.id || idx}
                                            colorScheme="green"
                                            fontSize="xs"
                                            rounded="md"
                                            px={2}
                                            py={0.5}
                                          >
                                            TDR: {tdr.trdNumber || "Verified"} (
                                            {tdr.tdrType ||
                                              tdr.businessSectorName ||
                                              "ACTIVE"}
                                            )
                                          </Badge>
                                        ),
                                      )}
                                    </HStack>
                                  ) : (
                                    <Badge
                                      colorScheme="gray"
                                      fontSize="3xs"
                                      rounded="md"
                                      px={2}
                                      py={0.5}
                                    >
                                      TDR Terverifikasi Standar
                                    </Badge>
                                  )}
                                </Flex>
                              </Box>
                            </VStack>
                          </SimpleGrid>
                        </VStack>
                      </Box>

                      {/* ══════════════════════════════════════════════════════════ */}
                      {/* MODULE 2: DETAIL PROYEK KORPORAT TERKAIT                 */}
                      {/* ══════════════════════════════════════════════════════════ */}
                      <Box
                        p={{ base: 5, md: 6 }}
                        rounded="2xl"
                        border="1px"
                        borderColor={
                          colorMode === "light" ? "purple.200" : "purple.800"
                        }
                        bg={
                          colorMode === "light" ? "purple.50/40" : "gray.800/40"
                        }
                      >
                        <VStack align="stretch" spacing={5}>
                          {/* Section Header */}
                          <Flex
                            justify="space-between"
                            align={{ base: "start", md: "center" }}
                            wrap="wrap"
                            gap={3}
                          >
                            <HStack spacing={3}>
                              <Box
                                p={2}
                                rounded="xl"
                                bg={
                                  colorMode === "light"
                                    ? "purple.100"
                                    : "purple.900"
                                }
                                color={
                                  colorMode === "light"
                                    ? "purple.700"
                                    : "purple.200"
                                }
                              >
                                <Icon as={FiTarget} boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Heading
                                  size="sm"
                                  fontWeight="800"
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                >
                                  Linked Corporate Project Details
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                  SDLC governance, proposing/managing business
                                  units, and project progress
                                </Text>
                              </VStack>
                            </HStack>

                            {(contract.projectId || projectData?.id) && (
                              <Link
                                href={`/projects/manage?id=${contract.projectId || projectData?.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="xs"
                                  colorScheme="purple"
                                  variant="outline"
                                  rightIcon={<Icon as={FiExternalLink} />}
                                  fontWeight="700"
                                  rounded="lg"
                                >
                                  Buka Manajemen Proyek ↗
                                </Button>
                              </Link>
                            )}
                          </Flex>

                          <Divider
                            borderColor={
                              colorMode === "light"
                                ? "purple.200"
                                : "purple.800"
                            }
                          />

                          {contract.projectId || contract.projectName ? (
                            <VStack align="stretch" spacing={4}>
                              {/* Project Title Banner */}
                              <Flex
                                justify="space-between"
                                align={{ base: "start", md: "center" }}
                                wrap="wrap"
                                gap={3}
                              >
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={2} wrap="wrap">
                                    {projectData?.projectNo && (
                                      <Badge
                                        colorScheme="gray"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                      >
                                        No: {projectData.projectNo}
                                      </Badge>
                                    )}
                                    <Badge
                                      colorScheme="teal"
                                      fontSize="xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                    >
                                      Status:{" "}
                                      {projectData?.projectStatus ||
                                        "IN PROGRESS"}
                                    </Badge>
                                  </HStack>
                                  <Text
                                    fontSize="md"
                                    fontWeight="800"
                                    color={
                                      colorMode === "light"
                                        ? "gray.800"
                                        : "white"
                                    }
                                  >
                                    {projectData?.projectName ||
                                      contract.projectName ||
                                      "Corporate Project"}
                                  </Text>
                                </VStack>

                                {/* Project Progress Bar */}
                                <VStack
                                  align={{ base: "start", md: "end" }}
                                  spacing={1}
                                  minW="180px"
                                >
                                  <Flex
                                    justify="space-between"
                                    w="full"
                                    fontSize="xs"
                                  >
                                    <Text color="gray.500" fontWeight="600">
                                      Progres Keseluruhan:
                                    </Text>
                                    <Text fontWeight="800" color="purple.600">
                                      {projectData?.projectStatusPercentage ||
                                        0}
                                      %
                                    </Text>
                                  </Flex>
                                  <Progress
                                    value={
                                      projectData?.projectStatusPercentage || 0
                                    }
                                    size="sm"
                                    colorScheme="purple"
                                    rounded="full"
                                    w="full"
                                    bg={
                                      colorMode === "light"
                                        ? "purple.100"
                                        : "gray.700"
                                    }
                                  />
                                  {projectData?.projectDurationDays ? (
                                    <Text fontSize="3xs" color="gray.500">
                                      Durasi: {projectData.projectDurationDays}{" "}
                                      Calendar Days
                                    </Text>
                                  ) : null}
                                </VStack>
                              </Flex>

                              {/* Project Detail Grid */}
                              <SimpleGrid
                                columns={{ base: 1, md: 3 }}
                                spacing={4}
                                pt={1}
                              >
                                {/* Unit Pengusul / Pemilik */}
                                <Box
                                  p={4}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                >
                                  <VStack align="start" spacing={1}>
                                    <Text
                                      fontSize="2xs"
                                      color="gray.500"
                                      fontWeight="700"
                                      textTransform="uppercase"
                                    >
                                      Unit Pemilik (Business Owner)
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      fontWeight="800"
                                      color={
                                        colorMode === "light"
                                          ? "gray.800"
                                          : "gray.200"
                                      }
                                    >
                                      {projectData?.proOwnerDivisionName ||
                                        contract.proOwnerDivisionName ||
                                        "-"}
                                    </Text>
                                    <Text fontSize="2xs" color="gray.500">
                                      {projectData?.proOwnerDirectorateName ||
                                        contract.proOwnerDirectorateName ||
                                        "-"}
                                    </Text>
                                  </VStack>
                                </Box>

                                {/* Unit Pengelola IT */}
                                <Box
                                  p={4}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                >
                                  <VStack align="start" spacing={1}>
                                    <Text
                                      fontSize="2xs"
                                      color="gray.500"
                                      fontWeight="700"
                                      textTransform="uppercase"
                                    >
                                      Managing Unit (IT Delivery)
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      fontWeight="800"
                                      color={
                                        colorMode === "light"
                                          ? "gray.800"
                                          : "gray.200"
                                      }
                                    >
                                      {projectData?.proManageByDivisionName ||
                                        "Information Technology Division"}
                                    </Text>
                                    <Text fontSize="2xs" color="gray.500">
                                      {projectData?.proManageByTeamName ||
                                        projectData?.proManageByGroupName ||
                                        "-"}
                                    </Text>
                                  </VStack>
                                </Box>

                                {/* SDLC Governance */}
                                <Box
                                  p={4}
                                  rounded="xl"
                                  bg={
                                    colorMode === "light" ? "white" : "gray.850"
                                  }
                                  border="1px"
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                >
                                  <VStack align="start" spacing={1}>
                                    <Text
                                      fontSize="2xs"
                                      color="gray.500"
                                      fontWeight="700"
                                      textTransform="uppercase"
                                    >
                                      SDLC Governance
                                    </Text>
                                    <HStack spacing={1.5} wrap="wrap">
                                      <Badge
                                        colorScheme="teal"
                                        fontSize="2xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                      >
                                        Tahap:{" "}
                                        {projectData?.sdlcStageName ||
                                          contract.sdlcStageName ||
                                          "-"}
                                      </Badge>
                                      {projectData?.sdlcName && (
                                        <Badge
                                          colorScheme="gray"
                                          fontSize="2xs"
                                          px={2}
                                          py={0.5}
                                          rounded="md"
                                        >
                                          {projectData.sdlcName}
                                        </Badge>
                                      )}
                                    </HStack>
                                  </VStack>
                                </Box>
                              </SimpleGrid>
                            </VStack>
                          ) : (
                            <Box
                              p={4}
                              rounded="xl"
                              bg={colorMode === "light" ? "white" : "gray.850"}
                              textAlign="center"
                            >
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontStyle="italic"
                              >
                                This contract is not directly linked to a
                                specific Corporate Project.
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </Box>

                      {/* ══════════════════════════════════════════════════════════ */}
                      {/* MODULE 3: DATA KEBUTUHAN & PROGRAM KERJA ANGGARAN (RBB)   */}
                      {/* ══════════════════════════════════════════════════════════ */}
                      <Box
                        p={{ base: 5, md: 6 }}
                        rounded="2xl"
                        border="1px"
                        borderColor={
                          colorMode === "light" ? "blue.200" : "blue.800"
                        }
                        bg={
                          colorMode === "light" ? "blue.50/40" : "gray.800/40"
                        }
                      >
                        <VStack align="stretch" spacing={5}>
                          {/* Section Header */}
                          <Flex
                            justify="space-between"
                            align={{ base: "start", md: "center" }}
                            wrap="wrap"
                            gap={3}
                          >
                            <HStack spacing={3}>
                              <Box
                                p={2}
                                rounded="xl"
                                bg={
                                  colorMode === "light" ? "blue.100" : "blue.900"
                                }
                                color={
                                  colorMode === "light" ? "blue.700" : "blue.200"
                                }
                              >
                                <Icon as={FiBookOpen} boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Heading
                                  size="sm"
                                  fontWeight="800"
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                >
                                  Requirement Data & RBB Budget
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                  Business requirement reference and budget work
                                  program allocation
                                </Text>
                              </VStack>
                            </HStack>

                            {projectData?.requirementData?.id && (
                              <Link
                                href={`/requirements/detail?id=${projectData.requirementData.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  variant="outline"
                                  rightIcon={<Icon as={FiExternalLink} />}
                                  fontWeight="700"
                                  rounded="lg"
                                >
                                  Detail Kebutuhan ↗
                                </Button>
                              </Link>
                            )}
                          </Flex>

                          <Divider
                            borderColor={
                              colorMode === "light" ? "blue.200" : "blue.800"
                            }
                          />

                          {/* Requirement Info Box if Available */}
                          {projectData?.requirementData ? (
                            <Box
                              p={4}
                              rounded="xl"
                              bg={colorMode === "light" ? "white" : "gray.850"}
                              border="1px"
                              borderColor={
                                colorMode === "light" ? "gray.200" : "gray.700"
                              }
                            >
                              <VStack align="stretch" spacing={3}>
                                <Flex
                                  justify="space-between"
                                  align={{ base: "start", md: "center" }}
                                  wrap="wrap"
                                  gap={2}
                                >
                                  <HStack spacing={2}>
                                    <Badge
                                      colorScheme="blue"
                                      fontSize="2xs"
                                      px={2.5}
                                      py={0.5}
                                      rounded="md"
                                      fontWeight="bold"
                                    >
                                      No. Req:{" "}
                                      {projectData.requirementData.reqNumber}
                                    </Badge>
                                    <Badge
                                      colorScheme="purple"
                                      fontSize="2xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                    >
                                      {
                                        projectData.requirementData
                                          .requirementType
                                      }
                                    </Badge>
                                    {projectData.requirementData.reqStatus && (
                                      <Badge
                                        colorScheme="green"
                                        fontSize="2xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                      >
                                        {projectData.requirementData.reqStatus}
                                      </Badge>
                                    )}
                                  </HStack>

                                  {projectData.requirementData
                                    .appLiveTargetDate && (
                                    <HStack
                                      spacing={1.5}
                                      fontSize="xs"
                                      color="gray.500"
                                    >
                                      <Icon as={FiCalendar} />
                                      <Text>
                                        Target Go-Live:{" "}
                                        <strong>
                                          {new Date(
                                            projectData.requirementData
                                              .appLiveTargetDate,
                                          ).toLocaleDateString("en-US")}
                                        </strong>
                                      </Text>
                                    </HStack>
                                  )}
                                </Flex>

                                {(projectData.requirementData.reqNarative ||
                                  projectData.requirementData.note) && (
                                  <Box
                                    p={3}
                                    rounded="lg"
                                    bg={
                                      colorMode === "light"
                                        ? "gray.50"
                                        : "gray.800"
                                    }
                                  >
                                    <Text
                                      fontSize="xs"
                                      color={
                                        colorMode === "light"
                                          ? "gray.700"
                                          : "gray.300"
                                      }
                                    >
                                      <strong>
                                        Business Requirement Narrative:
                                      </strong>{" "}
                                      {projectData.requirementData
                                        .reqNarative ||
                                        projectData.requirementData.note}
                                    </Text>
                                  </Box>
                                )}
                              </VStack>
                            </Box>
                          ) : null}

                          {/* Work Programs Table */}
                          {(contract.workPrograms &&
                            contract.workPrograms.length > 0) ||
                          (projectData?.workPrograms &&
                            projectData.workPrograms.length > 0) ? (
                            <Box
                              border="1px"
                              borderColor={
                                colorMode === "light" ? "gray.200" : "gray.700"
                              }
                              rounded="xl"
                              overflow="hidden"
                            >
                              <Box
                                p={3.5}
                                bg={
                                  colorMode === "light" ? "gray.50" : "gray.800"
                                }
                                borderBottom="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "gray.200"
                                    : "gray.700"
                                }
                              >
                                <Text
                                  fontSize="xs"
                                  fontWeight="700"
                                  textTransform="uppercase"
                                  letterSpacing="wider"
                                  color="gray.500"
                                >
                                  Linked RBB Work Program Allocation
                                </Text>
                              </Box>

                              <Box overflowX="auto">
                                <Table size="sm" variant="simple">
                                  <Thead
                                    bg={
                                      colorMode === "light"
                                        ? "gray.50/50"
                                        : "gray.800/50"
                                    }
                                  >
                                    <Tr>
                                      <Th py={3} px={4} fontSize="xs">
                                        No
                                      </Th>
                                      <Th py={3} px={4} fontSize="xs">
                                        Kode Program
                                      </Th>
                                      <Th py={3} px={4} fontSize="xs">
                                        Work Program Name
                                      </Th>
                                      <Th py={3} px={4} fontSize="xs">
                                        Cost Account (COA)
                                      </Th>
                                      <Th py={3} px={4} fontSize="xs">
                                        Owner Division
                                      </Th>
                                      <Th py={3} px={4} fontSize="xs" isNumeric>
                                        RBB Budget Ceiling
                                      </Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {(
                                      contract.workPrograms ||
                                      projectData?.workPrograms ||
                                      []
                                    ).map((wp, idx) => (
                                      <Tr key={wp.id || idx}>
                                        <Td
                                          py={3}
                                          px={4}
                                          fontSize="sm"
                                          color="gray.500"
                                        >
                                          {idx + 1}
                                        </Td>
                                        <Td py={3} px={4} fontSize="sm">
                                          <Badge
                                            colorScheme="blue"
                                            fontSize="2xs"
                                          >
                                            {wp.workProgramCode || "-"}
                                          </Badge>
                                        </Td>
                                        <Td
                                          py={3}
                                          px={4}
                                          fontSize="sm"
                                          fontWeight="700"
                                        >
                                          {wp.workProgramName || "-"}
                                        </Td>
                                        <Td
                                          py={3}
                                          px={4}
                                          fontSize="sm"
                                          color="gray.500"
                                        >
                                          {wp.workProgramAccNumber
                                            ? `${wp.workProgramAccNumber} - ${wp.workProgramAccName || ""}`
                                            : "-"}
                                        </Td>
                                        <Td py={3} px={4} fontSize="sm">
                                          {wp.divisionName || "-"}
                                        </Td>
                                        <Td
                                          py={3}
                                          px={4}
                                          fontSize="sm"
                                          fontWeight="700"
                                          color="teal.500"
                                          isNumeric
                                        >
                                          {formatIDR(
                                            wp.workProgramBudget,
                                            showWorkValue,
                                          )}
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              p={4}
                              rounded="xl"
                              bg={colorMode === "light" ? "white" : "gray.850"}
                              textAlign="center"
                            >
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontStyle="italic"
                              >
                                No RBB work program allocations mapped to this
                                contract yet.
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </Box>

                      {/* ══════════════════════════════════════════════════════════ */}
                      {/* MODULE 4: LINGKUP DELIVERABLE & DISTRIBUSI FINANSIAL      */}
                      {/* ══════════════════════════════════════════════════════════ */}
                      <VStack align="stretch" spacing={5}>
                        {/* Scope Line Items Table */}
                        {(contract.items || []).length > 0 && (
                          <Box
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            rounded="xl"
                            overflow="hidden"
                          >
                            <Box
                              p={4}
                              bg={
                                colorMode === "light" ? "gray.50" : "gray.800"
                              }
                              borderBottom="1px"
                              borderColor={
                                colorMode === "light" ? "gray.200" : "gray.700"
                              }
                            >
                              <Flex justify="space-between" align="center">
                                <Text
                                  fontSize="xs"
                                  fontWeight="700"
                                  textTransform="uppercase"
                                  letterSpacing="wider"
                                  color="gray.500"
                                >
                                  Procurement Scope & Goods/Services
                                  Deliverables ({contract.items?.length || 0}{" "}
                                  Items)
                                </Text>
                                <Text
                                  fontSize="xs"
                                  fontWeight="800"
                                  color="teal.500"
                                >
                                  Total:{" "}
                                  {formatIDR(itemsTotalSum, showWorkValue)}
                                </Text>
                              </Flex>
                            </Box>

                            <Box overflowX="auto">
                              <Table size="sm" variant="simple">
                                <Thead
                                  bg={
                                    colorMode === "light"
                                      ? "gray.50/50"
                                      : "gray.800/50"
                                  }
                                >
                                  <Tr>
                                    <Th py={3.5} px={4} fontSize="xs">
                                      No
                                    </Th>
                                    <Th py={3.5} px={4} fontSize="xs">
                                      Kode
                                    </Th>
                                    <Th py={3.5} px={4} fontSize="xs">
                                      Nama Item / Deliverable
                                    </Th>
                                    <Th py={3.5} px={4} fontSize="xs">
                                      Tipe
                                    </Th>
                                    <Th py={3.5} px={4} fontSize="xs">
                                      Brand
                                    </Th>
                                    <Th py={3.5} px={4} fontSize="xs" isNumeric>
                                      Nilai Nominal
                                    </Th>
                                    <Th py={3.5} px={4} fontSize="xs">
                                      Keterangan
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {contract.items?.map((item, idx) => (
                                    <Tr key={item.id || idx}>
                                      <Td
                                        py={3.5}
                                        px={4}
                                        fontSize="sm"
                                        color="gray.500"
                                      >
                                        {idx + 1}
                                      </Td>
                                      <Td py={3.5} px={4} fontSize="sm">
                                        <Badge fontSize="2xs">
                                          {item.itemCode || "-"}
                                        </Badge>
                                      </Td>
                                      <Td
                                        py={3.5}
                                        px={4}
                                        fontSize="sm"
                                        fontWeight="700"
                                      >
                                        {item.itemName}
                                      </Td>
                                      <Td py={3.5} px={4} fontSize="sm">
                                        <Badge
                                          colorScheme="blue"
                                          fontSize="2xs"
                                        >
                                          {item.itemType || "-"}
                                        </Badge>
                                      </Td>
                                      <Td py={3.5} px={4} fontSize="sm">
                                        {item.brand || "-"}
                                      </Td>
                                      <Td
                                        py={3.5}
                                        px={4}
                                        fontSize="sm"
                                        fontWeight="700"
                                        color="teal.500"
                                        isNumeric
                                      >
                                        {formatIDR(
                                          item.itemValues,
                                          showWorkValue,
                                        )}
                                      </Td>
                                      <Td
                                        py={3.5}
                                        px={4}
                                        fontSize="xs"
                                        color="gray.500"
                                      >
                                        {item.itemDesc || "-"}
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          </Box>
                        )}

                        {/* CAPEX / OPEX / Guarantees / Subscription Model Cards */}
                        <SimpleGrid
                          columns={{
                            base: 1,
                            sm: 2,
                            lg:
                              contract.contractBillingType &&
                              contract.contractBillingType !== "MILESTONE"
                                ? 2
                                : 3,
                            xl:
                              contract.contractBillingType &&
                              contract.contractBillingType !== "MILESTONE"
                                ? 4
                                : 3,
                          }}
                          spacing={4}
                        >
                          <Box
                            p={5}
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "gray.50" : "gray.800"}
                          >
                            <VStack align="start" spacing={1.5}>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Alokasi CAPEX
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="800"
                                color="blue.500"
                              >
                                {formatIDR(contract.cavexValues, showWorkValue)}
                              </Text>
                              <Badge
                                colorScheme="blue"
                                fontSize="2xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {contract.capexPercentage}% Alokasi
                              </Badge>
                            </VStack>
                          </Box>

                          <Box
                            p={5}
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "gray.50" : "gray.800"}
                          >
                            <VStack align="start" spacing={1.5}>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Alokasi OPEX
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="800"
                                color="purple.500"
                              >
                                {formatIDR(contract.ovexValues, showWorkValue)}
                              </Text>
                              <Badge
                                colorScheme="purple"
                                fontSize="2xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                {contract.ovexPercentage}% Alokasi
                              </Badge>
                            </VStack>
                          </Box>

                          <Box
                            p={5}
                            rounded="xl"
                            border="1px"
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            bg={colorMode === "light" ? "gray.50" : "gray.800"}
                          >
                            <VStack align="start" spacing={1.5}>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Jaminan Finansial Bank
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="800"
                                color="teal.500"
                              >
                                {formatIDR(
                                  (contract.performanceGuaranteeValues || 0) +
                                    (contract.maintenanceWarrantyValues || 0),
                                  showWorkValue,
                                )}
                              </Text>
                              <Badge
                                colorScheme="teal"
                                fontSize="2xs"
                                px={2}
                                py={0.5}
                                rounded="md"
                              >
                                Bank Bonds Aktif
                              </Badge>
                            </VStack>
                          </Box>

                          {contract.contractBillingType &&
                            contract.contractBillingType !== "MILESTONE" && (
                              <Box
                                p={5}
                                rounded="xl"
                                border="1px"
                                borderColor={
                                  colorMode === "light"
                                    ? "purple.200"
                                    : "purple.700"
                                }
                                bg={
                                  colorMode === "light"
                                    ? "purple.50/50"
                                    : "gray.800"
                                }
                                position="relative"
                                overflow="hidden"
                              >
                                <VStack align="stretch" spacing={2}>
                                  <Text
                                    fontSize="xs"
                                    color={
                                      colorMode === "light"
                                        ? "purple.700"
                                        : "purple.300"
                                    }
                                    fontWeight="700"
                                    textTransform="uppercase"
                                    letterSpacing="wider"
                                  >
                                    Subscription Model
                                  </Text>
                                  <VStack align="start" spacing={0}>
                                    <Text
                                      fontSize="lg"
                                      fontWeight="800"
                                      color="purple.600"
                                      lineHeight="1.2"
                                    >
                                      {formatIDR(
                                        contract.subscriptionPeriodValue || 0,
                                        showWorkValue,
                                      )}
                                    </Text>
                                    <Text
                                      fontSize="3xs"
                                      color="gray.500"
                                      fontWeight="medium"
                                    >
                                      per siklus penagihan
                                    </Text>
                                  </VStack>
                                  <Flex
                                    wrap="wrap"
                                    gap={1.5}
                                    pt={0.5}
                                    align="center"
                                  >
                                    <Badge
                                      colorScheme="purple"
                                      variant="subtle"
                                      fontSize="3xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                      fontWeight="bold"
                                    >
                                      {contract.contractBillingType}
                                    </Badge>
                                    <Badge
                                      colorScheme={
                                        Boolean(contract.subscriptionAutoRenew)
                                          ? "green"
                                          : "gray"
                                      }
                                      variant="solid"
                                      fontSize="3xs"
                                      px={2}
                                      py={0.5}
                                      rounded="md"
                                      fontWeight="bold"
                                    >
                                      {Boolean(contract.subscriptionAutoRenew)
                                        ? "Auto-Renew: Aktif"
                                        : "Auto-Renew: Nonaktif"}
                                    </Badge>
                                  </Flex>
                                </VStack>
                              </Box>
                            )}
                        </SimpleGrid>

                        {/* Contract Remarks Note */}
                        <Box
                          p={5}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                        >
                          <VStack align="start" spacing={2}>
                            <HStack spacing={2} color="secondary.600">
                              <Icon as={FiInfo} />
                              <Heading
                                size="xs"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Contract Remarks & Additional Notes
                              </Heading>
                            </HStack>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "light" ? "gray.700" : "gray.300"
                              }
                            >
                              {contract.note ||
                                "No specific notes added for this contract."}
                            </Text>
                          </VStack>
                        </Box>
                      </VStack>
                    </VStack>
                  )}

                  {/* ─── TAB 1: Jadwal Termin TOP ─── */}
                  {activeTabIndex === 1 && (
                    <VStack spacing={6} align="stretch">
                      {/* Top Progression Banner */}
                      <Box
                        p={5}
                        rounded="2xl"
                        border="1px"
                        borderColor={
                          colorMode === "light" ? "teal.200" : "teal.800"
                        }
                        bg={colorMode === "light" ? "teal.50/50" : "gray.800"}
                      >
                        <VStack align="stretch" spacing={3}>
                          <Flex
                            justify="space-between"
                            align="center"
                            wrap="wrap"
                            gap={2}
                          >
                            <HStack spacing={3}>
                              <Icon
                                as={FiCreditCard}
                                color="teal.500"
                                w={5}
                                h={5}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="bold">
                                  Payment Milestone Schedule & Composition
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Total TOP Terjadwal:{" "}
                                  {formatIDR(topTotalSum, showWorkValue)} /{" "}
                                  {formatIDR(contract.workValue, showWorkValue)}
                                </Text>
                              </VStack>
                            </HStack>

                            <Badge
                              colorScheme={
                                topTotalSum === contract.workValue
                                  ? "green"
                                  : "orange"
                              }
                              fontSize="xs"
                              px={3}
                              py={1}
                              rounded="lg"
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <Icon
                                as={
                                  topTotalSum === contract.workValue
                                    ? FiCheckCircle
                                    : FiAlertCircle
                                }
                              />
                              {topTotalSum === contract.workValue
                                ? "Balanced (100%)"
                                : `Selisih: ${formatIDR(Math.abs(contract.workValue - topTotalSum), showWorkValue)}`}
                            </Badge>
                          </Flex>

                          <Progress
                            value={
                              contract.workValue > 0
                                ? (topTotalSum / contract.workValue) * 100
                                : 0
                            }
                            size="sm"
                            colorScheme={
                              topTotalSum === contract.workValue
                                ? "teal"
                                : "orange"
                            }
                            rounded="full"
                          />
                        </VStack>
                      </Box>

                      {/* 70% / 30% Responsive Split Layout */}
                      <Flex
                        direction={{ base: "column", xl: "row" }}
                        gap={6}
                        align="start"
                      >
                        {/* LEFT: TOP Milestones List */}
                        <Box flex={1} minW={0} w="full">
                          {(contract.topList || []).length === 0 ? (
                            <Box
                              p={8}
                              textAlign="center"
                              rounded="2xl"
                              border="1px dashed"
                              borderColor="gray.300"
                              bg={
                                colorMode === "light" ? "gray.50" : "gray.850"
                              }
                            >
                              <Icon
                                as={FiLayers}
                                boxSize={8}
                                color="gray.400"
                                mb={2}
                              />
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="gray.600"
                              >
                                No Payment Milestones Configured (TOP)
                              </Text>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                No payment milestones recorded on this contract.
                              </Text>
                            </Box>
                          ) : (
                            <VStack spacing={4} align="stretch">
                              {(contract.topList || []).map((top, idx) => {
                                const pct =
                                  contract.workValue > 0
                                    ? parseFloat(
                                        (
                                          (top.topValues / contract.workValue) *
                                          100
                                        ).toFixed(1),
                                      )
                                    : 0;
                                const isPaid =
                                  top.topStatus?.toUpperCase() === "PAID";

                                return (
                                  <Box
                                    key={top.id || idx}
                                    p={5}
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
                                      mb={3}
                                    >
                                      <HStack spacing={3.5} align="center">
                                        <Box
                                          w={9}
                                          h={9}
                                          rounded="lg"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          fontWeight="bold"
                                          fontSize="sm"
                                          bg={isPaid ? "green.500" : "teal.500"}
                                          color="white"
                                          flexShrink={0}
                                        >
                                          {isPaid ? (
                                            <Icon as={FiCheck} boxSize={4} />
                                          ) : (
                                            `#${top.stepOrder}`
                                          )}
                                        </Box>

                                        <VStack align="start" spacing={0.5}>
                                          <HStack
                                            spacing={2.5}
                                            wrap="wrap"
                                            align="center"
                                          >
                                            <Text
                                              fontSize="md"
                                              fontWeight="bold"
                                              color={
                                                colorMode === "light"
                                                  ? "gray.800"
                                                  : "white"
                                              }
                                            >
                                              {formatIDR(
                                                top.topValues,
                                                showWorkValue,
                                              )}
                                            </Text>
                                            <Badge
                                              colorScheme="teal"
                                              variant="subtle"
                                              fontSize="xs"
                                              px={2}
                                              py={0.5}
                                              rounded="md"
                                            >
                                              {pct}% of Contract
                                            </Badge>
                                            <Badge
                                              colorScheme={getTopStatusBadgeColor(
                                                top.topStatus,
                                              )}
                                              variant="solid"
                                              fontSize="xs"
                                              px={2.5}
                                              py={0.5}
                                              rounded="full"
                                            >
                                              {top.topStatus || "SCHEDULED"}
                                            </Badge>
                                            {top.billingPeriodStart &&
                                              top.billingPeriodEnd && (
                                                <Badge
                                                  colorScheme="purple"
                                                  fontSize="xs"
                                                  px={2}
                                                  py={0.5}
                                                  rounded="md"
                                                >
                                                  Periode:{" "}
                                                  {new Date(
                                                    top.billingPeriodStart,
                                                  ).toLocaleDateString(
                                                    "en-US",
                                                  )}{" "}
                                                  &rarr;{" "}
                                                  {new Date(
                                                    top.billingPeriodEnd,
                                                  ).toLocaleDateString("en-US")}
                                                </Badge>
                                              )}
                                            {top.isAutoGenerated && (
                                              <Badge
                                                colorScheme="cyan"
                                                variant="outline"
                                                fontSize="xs"
                                                px={2}
                                                py={0.5}
                                                rounded="md"
                                              >
                                                Auto
                                              </Badge>
                                            )}
                                          </HStack>

                                          <HStack
                                            spacing={3}
                                            fontSize="xs"
                                            color="gray.500"
                                            wrap="wrap"
                                          >
                                            <HStack spacing={1.5}>
                                              <Icon
                                                as={FiCalendar}
                                                boxSize={3.5}
                                              />
                                              <Text>
                                                Target:{" "}
                                                {top.topDate
                                                  ? new Date(
                                                      top.topDate,
                                                    ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                      },
                                                    )
                                                  : "Belum ditentukan"}
                                              </Text>
                                            </HStack>
                                          </HStack>
                                        </VStack>
                                      </HStack>
                                    </Flex>

                                    <Box
                                      mt={3}
                                      pt={3}
                                      borderTop="1px dashed"
                                      borderColor={
                                        colorMode === "light"
                                          ? "gray.200"
                                          : "gray.700"
                                      }
                                    >
                                      <HStack
                                        spacing={1.5}
                                        color="gray.500"
                                        mb={1}
                                      >
                                        <Icon as={FiFileText} boxSize={3.5} />
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          textTransform="uppercase"
                                        >
                                          Deskripsi / Scope Milestone
                                        </Text>
                                      </HStack>
                                      <Text
                                        fontSize="sm"
                                        color={
                                          colorMode === "light"
                                            ? "gray.700"
                                            : "gray.300"
                                        }
                                      >
                                        {top.topDescriptions ||
                                          "No detailed description for this milestone."}
                                      </Text>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </VStack>
                          )}
                        </Box>

                        {/* RIGHT: Summary Widgets */}
                        <Box w={{ base: "full", xl: "300px" }} flexShrink={0}>
                          <VStack
                            spacing={4}
                            align="stretch"
                            position={{ xl: "sticky" }}
                            top="24px"
                          >
                            <Box
                              p={5}
                              rounded="xl"
                              border="1px"
                              borderColor={
                                colorMode === "light" ? "teal.200" : "teal.700"
                              }
                              bg={
                                colorMode === "light" ? "gray.50" : "gray.850"
                              }
                            >
                              <HStack spacing={2} mb={4} color="teal.500">
                                <Icon as={FiPieChart} boxSize={4.5} />
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  textTransform="uppercase"
                                  letterSpacing="wider"
                                >
                                  Milestone Statistics (TOP)
                                </Text>
                              </HStack>

                              <VStack spacing={3} align="stretch" fontSize="xs">
                                <Flex justify="space-between" align="center">
                                  <Text color="gray.500">
                                    Total Milestones:
                                  </Text>
                                  <Badge
                                    colorScheme="purple"
                                    fontSize="xs"
                                    rounded="md"
                                    px={2}
                                    py={0.5}
                                  >
                                    {(contract.topList || []).length} Milestones
                                  </Badge>
                                </Flex>

                                <Flex justify="space-between" align="center">
                                  <Text color="gray.500">
                                    Total Nominal TOP:
                                  </Text>
                                  <Text
                                    fontWeight="bold"
                                    color="teal.500"
                                    fontSize="sm"
                                  >
                                    {formatIDR(topTotalSum, showWorkValue)}
                                  </Text>
                                </Flex>

                                <Flex justify="space-between" align="center">
                                  <Text color="gray.500">
                                    Total Contract Value:
                                  </Text>
                                  <Text
                                    fontWeight="bold"
                                    color="blue.500"
                                    fontSize="sm"
                                  >
                                    {formatIDR(
                                      contract.workValue,
                                      showWorkValue,
                                    )}
                                  </Text>
                                </Flex>

                                <Divider
                                  borderColor={
                                    colorMode === "light"
                                      ? "gray.200"
                                      : "gray.700"
                                  }
                                  my={1}
                                />

                                <Flex justify="space-between" align="center">
                                  <Text color="gray.500">Status Alokasi:</Text>
                                  <Badge
                                    colorScheme={
                                      topTotalSum === contract.workValue
                                        ? "green"
                                        : "orange"
                                    }
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    rounded="md"
                                  >
                                    {topTotalSum === contract.workValue
                                      ? "100% Balanced"
                                      : "Selisih Alokasi"}
                                  </Badge>
                                </Flex>
                              </VStack>
                            </Box>
                          </VStack>
                        </Box>
                      </Flex>
                    </VStack>
                  )}

                  {/* ─── TAB 2: Tracking Pembayaran & Bukti MinIO ─── */}
                  {activeTabIndex === 2 && (
                    <ContractPaymentTabPanel
                      contract={contract}
                      tokenData={tokenData}
                      onRefreshContract={fetchDetail}
                    />
                  )}

                  {/* ─── TAB 3: Timeline & Jaminan Bank ─── */}
                  {activeTabIndex === 3 && (
                    <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                        <Box
                          p={5}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          bg={colorMode === "light" ? "gray.50" : "gray.800"}
                        >
                          <VStack align="start" spacing={1.5}>
                            <HStack spacing={2} color="blue.500">
                              <Icon as={FiCalendar} />
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Contract Validity Period
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              Mulai:{" "}
                              {new Date(
                                contract.contractStartDate,
                              ).toLocaleDateString("en-US")}
                            </Text>
                            <Text fontSize="sm">
                              Selesai:{" "}
                              {new Date(
                                contract.contractEndDate,
                              ).toLocaleDateString("en-US")}
                            </Text>
                          </VStack>
                        </Box>

                        <Box
                          p={5}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          bg={colorMode === "light" ? "gray.50" : "gray.800"}
                        >
                          <VStack align="start" spacing={1.5}>
                            <HStack spacing={2} color="green.500">
                              <Icon as={FiCheckCircle} />
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Physical Work Execution Period
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              Mulai:{" "}
                              {contract.worksStartDate
                                ? new Date(
                                    contract.worksStartDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}
                            </Text>
                            <Text fontSize="sm">
                              Selesai:{" "}
                              {contract.worksEndDate
                                ? new Date(
                                    contract.worksEndDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}
                            </Text>
                          </VStack>
                        </Box>

                        <Box
                          p={5}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          bg={colorMode === "light" ? "gray.50" : "gray.800"}
                        >
                          <VStack align="start" spacing={1.5}>
                            <HStack spacing={2} color="purple.500">
                              <Icon as={FiShield} />
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="wider"
                              >
                                Warranty & SLA Period
                              </Text>
                            </HStack>
                            <Text fontSize="sm">
                              Mulai:{" "}
                              {contract.warrantyStartDate
                                ? new Date(
                                    contract.warrantyStartDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}
                            </Text>
                            <Text fontSize="sm">
                              Selesai:{" "}
                              {contract.warrantyEndDate
                                ? new Date(
                                    contract.warrantyEndDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}
                            </Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>

                      {/* Bank Guarantee Bonds */}
                      <Heading
                        size="xs"
                        color="gray.600"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Jaminan Pelaksanaan & Pemeliharaan Bank
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <Box
                          p={5}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          bg={colorMode === "light" ? "gray.50" : "gray.800"}
                        >
                          <VStack align="start" spacing={1.5}>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              fontWeight="bold"
                              textTransform="uppercase"
                              letterSpacing="wider"
                            >
                              Jaminan Pelaksanaan (Performance Bond)
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="teal.600"
                            >
                              {formatIDR(
                                contract.performanceGuaranteeValues,
                                showWorkValue,
                              )}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Validity Period:{" "}
                              {contract.performanceGuaranteeStartDate
                                ? new Date(
                                    contract.performanceGuaranteeStartDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}{" "}
                              –{" "}
                              {contract.performanceGuaranteeEndDate
                                ? new Date(
                                    contract.performanceGuaranteeEndDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}
                            </Text>
                          </VStack>
                        </Box>

                        <Box
                          p={5}
                          rounded="xl"
                          border="1px"
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.700"
                          }
                          bg={colorMode === "light" ? "gray.50" : "gray.800"}
                        >
                          <VStack align="start" spacing={1.5}>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              fontWeight="bold"
                              textTransform="uppercase"
                              letterSpacing="wider"
                            >
                              Jaminan Pemeliharaan (Maintenance Warranty)
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="teal.600"
                            >
                              {formatIDR(
                                contract.maintenanceWarrantyValues,
                                showWorkValue,
                              )}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Validity Period:{" "}
                              {contract.maintenanceWarrantyStartDate
                                ? new Date(
                                    contract.maintenanceWarrantyStartDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}{" "}
                              –{" "}
                              {contract.maintenanceWarrantyEndDate
                                ? new Date(
                                    contract.maintenanceWarrantyEndDate,
                                  ).toLocaleDateString("en-US")
                                : "-"}
                            </Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  )}

                  {/* ─── TAB 4: Dokumen & Berkas Kontrak MinIO ─── */}
                  {activeTabIndex === 4 && (
                    <ContractDocumentsTabPanel
                      contractId={contract.id}
                      mediaList={contract.mediaList || []}
                      tokenData={tokenData}
                      onRefresh={fetchDetail}
                    />
                  )}

                  {/* ─── TAB 5: Tata Kelola Biaya & Multi-HPS ─── */}
                  {activeTabIndex === 5 && (
                    <ContractCostGovernanceTabPanel
                      contract={contract}
                      tokenData={tokenData}
                      onRefreshContract={fetchDetail}
                    />
                  )}

                  {/* ─── TAB 6: Pengaturan & Edit Kontrak ─── */}
                  {activeTabIndex === 6 && (
                    <ContractEditTabPanel
                      contract={contract}
                      tokenData={tokenData}
                      onRefreshData={fetchDetail}
                    />
                  )}

                  {/* ─── TAB 7: Log Riwayat Revisi ─── */}
                  {activeTabIndex === 7 && (
                    <ContractHistoryTabPanel
                      historyList={contract.historyList || []}
                    />
                  )}
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </VStack>
      </Box>
    </LayoutAdmin>
  );
}
