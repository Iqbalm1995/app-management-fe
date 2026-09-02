"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiLayers,
  FiShield,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { RiBuildingLine, RiTeamLine } from "react-icons/ri";

import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import useApps from "@/app/services/useApps";
import useAppsCriticalReport, {
  AppsCriticalReportAssessmentViewModel,
} from "@/app/services/useAppsCriticalReport";
import { TabButtonCustomStyle, TabButtonCustomStyleHighLight } from "@/app/components/TabsCustom";

import ManagedAppsTab from "./components/ManagedAppsTab";
import IncomingAssessmentsTab from "./components/IncomingAssessmentsTab";

const HeaderDataContent: HeaderContentProps = {
  titleName: "My Applications",
  breadCrumb: ["Home", "Workspace", "My Applications"],
};

function WorkspaceApplicationsContent() {
  useDocumentTitle("My Applications & Assessments — Workspace");
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();

  const { List: ListApps } = useApps();
  const { List: ListBatches, GetBatchDetail } = useAppsCriticalReport();

  // Auth & Token State
  const [dataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Tab State (0: Managed Applications, 1: Incoming Assessments)
  const [tabIndex, setTabIndex] = useState<number>(0);

  // Quick Badge Counts
  const [managedAppsCount, setManagedAppsCount] = useState<number | null>(null);
  const [incomingAssessmentsCount, setIncomingAssessmentsCount] = useState<number | null>(null);

  // Sync tab with URL searchParams
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "assessments") {
      setTabIndex(1);
    } else {
      setTabIndex(0);
    }
  }, [searchParams]);

  // Load Auth from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      try {
        const storageAuth: AuthDataModelInterface = JSON.parse(storedData);
        setDataAuth(storageAuth.dataLogin as AuthDataResponse);
      } catch (e) {
        console.error("Failed to parse authData:", e);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, []);

  // Derived User Organization Information
  const rawOrgGroupId = dataAuth?.team?.orgGroupId || null;
  const userOrgGroupId = rawOrgGroupId && rawOrgGroupId !== "-" ? rawOrgGroupId : null;
  const userGroupName = dataAuth?.team?.teamName || dataAuth?.team?.orgGroupCode || null;
  const userDivisionName = dataAuth?.namaUnitKerja || "Information Technology Division";
  const userFullName = dataAuth?.nama || `${dataAuth?.firstName || ""} ${dataAuth?.lastName || ""}`.trim() || "User";
  const userRole = dataAuth?.role?.roleName || "Staff";

  // Fetch quick count badges for tabs
  const fetchTabCounts = useCallback(async () => {
    if (!tokenData) return;
    try {
      // 1. Fetch managed applications count
      const appsFilter: any[] = [];
      if (userOrgGroupId) {
        appsFilter.push({
          field: "appManageByGroupId",
          operator: "=",
          value: userOrgGroupId,
        });
      }
      const appsRes = await ListApps(
        {
          search: "",
          limit: 1,
          page: 0,
          filterWhere: appsFilter,
        } as any,
        tokenData
      );
      if (appsRes?.statusCode === RES_CODE_OK) {
        setManagedAppsCount(appsRes.countTotal ?? 0);
      }

      // 2. Fetch incoming ongoing assessment count
      const batchRes = await ListBatches(
        {
          search: "",
          limit: 5,
          page: 0,
          filterWhere: [
            {
              field: "statusReport",
              operator: "in",
              value: "DRAFT,WAITING APPROVAL 1,WAITING APPROVAL 2",
            } as any,
          ],
          fieldOrder: ["timeReport"],
          orderDir: "desc",
        },
        tokenData
      );

      if (batchRes?.statusCode === RES_CODE_OK && batchRes.data && batchRes.data.length > 0) {
        let totalActionRequired = 0;
        for (const batch of batchRes.data) {
          const detail = await GetBatchDetail(batch.batchCode, tokenData);
          if (detail?.statusCode === RES_CODE_OK && detail.data?.assessments) {
            const allAssessments = (detail.data.assessments || []) as AppsCriticalReportAssessmentViewModel[];
            const groupAssessments = userOrgGroupId
              ? allAssessments.filter((a: AppsCriticalReportAssessmentViewModel) => a.appManageByGroupId === userOrgGroupId)
              : allAssessments;

            // Incoming action required: DRAFT or DECLINE or incomplete criteria
            const pending = groupAssessments.filter(
              (a: AppsCriticalReportAssessmentViewModel) => a.statusReport === "DRAFT" || a.statusReport === "DECLINE" || !a.isFullyReviewed
            ).length;
            totalActionRequired += pending;
          }
        }
        setIncomingAssessmentsCount(totalActionRequired);
      } else {
        setIncomingAssessmentsCount(0);
      }
    } catch (err) {
      console.error("Error fetching tab counts:", err);
    }
  }, [tokenData, userOrgGroupId]);

  useEffect(() => {
    fetchTabCounts();
  }, [fetchTabCounts]);

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    const newTab = index === 1 ? "assessments" : "managed";
    router.replace(`/workspace/applications?tab=${newTab}`, { scroll: false });
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Box pb={10}>
        {/* Workspace Hero Section matching Project Detail Header Pattern */}
        <Box
          bgGradient="linear(to-br, secondary.800, secondary.600)"
          color="white"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 7 }}
          mt={{ base: 2, md: 3 }}
          mb={6}
          borderRadius={radiusStyle}
          position="relative"
          overflow="hidden"
          boxShadow="xl"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgGradient: "linear(45deg, whiteAlpha.100 0%, transparent 50%, whiteAlpha.150 100%)",
            zIndex: 0,
          }}
        >
          {/* BJB Logo in Bottom Right Corner */}
          <Box
            position="absolute"
            bottom={{ base: 2, md: 4 }}
            right={{ base: 4, md: 6 }}
            zIndex={3}
            opacity={0.65}
            _hover={{ opacity: 0.95 }}
            transition="opacity 0.2s ease"
          >
            <Box
              as="img"
              src="/img/logo-bjb-black-wing.svg"
              alt="BJB Logo"
              w={{ base: "45px", md: "65px" }}
              h="auto"
              filter="brightness(0) invert(1)"
            />
          </Box>

          {/* Main Hero Header Content */}
          <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
            {/* Division & Group Context Badges */}
            <HStack spacing={2} wrap="wrap">
              <Badge
                bg="whiteAlpha.200"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                backdropFilter="blur(8px)"
              >
                <Icon as={RiBuildingLine} />
                {userDivisionName}
              </Badge>

              <Badge
                bg="whiteAlpha.250"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                backdropFilter="blur(8px)"
              >
                <Icon as={RiTeamLine} />
                {userGroupName ? `Group: ${userGroupName}` : "System IT Workspace"}
              </Badge>

              {userOrgGroupId && (
                <Badge
                  bg="whiteAlpha.150"
                  color="whiteAlpha.900"
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  fontSize="2xs"
                >
                  ID: {userOrgGroupId}
                </Badge>
              )}
            </HStack>

            {/* Title & Subtitle with Crisp High-Contrast Pure White */}
            <VStack align="start" spacing={1.5} maxW="850px">
              <Heading
                size="lg"
                color="white"
                fontWeight="extrabold"
                letterSpacing="tight"
                lineHeight="short"
              >
                My Applications & Criticality Assessments
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.900" lineHeight="tall">
                Manage and monitor application portfolios assigned to{" "}
                <Text as="span" fontWeight="bold" color="white">
                  {userGroupName || "your IT group"}
                </Text>
                , review system health and criticality levels, and complete active assessment questionnaires for ongoing quarterly review batches.
              </Text>
            </VStack>

            {/* Quick Summary Pill Row */}
            <HStack spacing={4} pt={1} wrap="wrap">
              <HStack spacing={2} bg="blackAlpha.300" px={3} py={1.5} borderRadius={radiusStyle}>
                <Icon as={HiOutlineDesktopComputer} color="blue.200" />
                <Text fontSize="xs" color="whiteAlpha.900">
                  Managed Apps:
                </Text>
                <Text fontSize="xs" fontWeight="bold" color="white">
                  {managedAppsCount ?? "—"}
                </Text>
              </HStack>

              <HStack spacing={2} bg="blackAlpha.300" px={3} py={1.5} borderRadius={radiusStyle}>
                <Icon as={FiShield} color="orange.200" />
                <Text fontSize="xs" color="whiteAlpha.900">
                  Pending Assessments:
                </Text>
                <Text fontSize="xs" fontWeight="bold" color="white">
                  {incomingAssessmentsCount ?? "—"}
                </Text>
              </HStack>

              <HStack spacing={2} bg="blackAlpha.300" px={3} py={1.5} borderRadius={radiusStyle}>
                <Icon as={FiUser} color="teal.200" />
                <Text fontSize="xs" color="whiteAlpha.900">
                  Logged in as:
                </Text>
                <Text fontSize="xs" fontWeight="bold" color="white">
                  {userFullName} ({userRole})
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Main Tabs matching Project Manage Pattern */}
        <Tabs
          index={tabIndex}
          onChange={handleTabChange}
          variant="unstyled"
          size="lg"
          isLazy
        >
          {/* Tab Button List */}
          <Box mb={6}>
            <TabList
              gap={3}
              p={1.5}
              overflowX="auto"
              justifyContent="start"
              sx={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              <TabButtonCustomStyle>
                <HStack spacing={2.5}>
                  <HiOutlineDesktopComputer size={18} />
                  <Text>Managed Applications</Text>
                  {managedAppsCount !== null && (
                    <Badge
                      colorScheme={tabIndex === 0 ? "whiteAlpha" : "blue"}
                      variant={tabIndex === 0 ? "solid" : "subtle"}
                      borderRadius="full"
                      fontSize="2xs"
                      px={2}
                    >
                      {managedAppsCount}
                    </Badge>
                  )}
                </HStack>
              </TabButtonCustomStyle>

              <TabButtonCustomStyleHighLight>
                <HStack spacing={2.5}>
                  <FiShield size={18} />
                  <Text>Incoming Assessments</Text>
                  {incomingAssessmentsCount !== null && incomingAssessmentsCount > 0 ? (
                    <Badge
                      colorScheme="red"
                      variant="solid"
                      borderRadius="full"
                      fontSize="2xs"
                      px={2}
                    >
                      {incomingAssessmentsCount} Pending
                    </Badge>
                  ) : incomingAssessmentsCount === 0 ? (
                    <Badge
                      colorScheme="green"
                      variant="subtle"
                      borderRadius="full"
                      fontSize="2xs"
                      px={2}
                    >
                      Up to date
                    </Badge>
                  ) : null}
                </HStack>
              </TabButtonCustomStyleHighLight>
            </TabList>
          </Box>

          <TabPanels>
            {/* Tab 1: Managed Applications */}
            <TabPanel p={0}>
              <ManagedAppsTab
                userOrgGroupId={userOrgGroupId}
                userGroupName={userGroupName}
                userDivisionName={userDivisionName}
                tokenData={tokenData}
                onDataLoaded={(count) => setManagedAppsCount(count)}
              />
            </TabPanel>

            {/* Tab 2: Incoming Assessments */}
            <TabPanel p={0}>
              <IncomingAssessmentsTab
                userOrgGroupId={userOrgGroupId}
                userGroupName={userGroupName}
                userDivisionName={userDivisionName}
                tokenData={tokenData}
                onActionRequiredCountChange={(count) => setIncomingAssessmentsCount(count)}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}

export default function WorkspaceApplicationsPage() {
  return (
    <Suspense
      fallback={
        <LayoutAdmin>
          <HeaderContent {...HeaderDataContent} />
          <Box p={8} textAlign="center">
            <Text>Loading workspace applications...</Text>
          </Box>
        </LayoutAdmin>
      }
    >
      <WorkspaceApplicationsContent />
    </Suspense>
  );
}
