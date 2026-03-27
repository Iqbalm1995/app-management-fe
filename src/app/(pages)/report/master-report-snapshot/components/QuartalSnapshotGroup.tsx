import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  Button,
  useDisclosure,
  HStack,
  Icon,
  Text,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useSnapshotServices from "@/app/services/useSnapshotServices";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { QuartalAlertBanner } from "./QuartalAlertBanner";
import { QuartalProgressModal } from "./QuartalProgressModal";
import { FiDatabase, FiPlay } from "react-icons/fi";

interface ExecutionState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  progress: {
    current: number;
    total: number;
    elapsedSeconds: number;
  };
}

const QUARTAL_ENDPOINTS = [
  { key: "project-summary", label: "Project Summary" },
  { key: "project-quartal", label: "Project Quartal" },
  { key: "project-division-owner-quartal", label: "Division Owner Quartal" },
  { key: "project-characteristics", label: "Project Characteristics" },
  { key: "project-types", label: "Project Types" },
  { key: "project-procurement-workprogram-flag", label: "Procurement Workprogram Flag" },
  { key: "project-acquisitions", label: "Project Acquisitions" },
  { key: "project-by-group-manage", label: "Project by Group Manage" },
  { key: "project-active-portfolio", label: "Active Portfolio" },
  { key: "project-close-portfolio", label: "Close Portfolio" },
  { key: "user-project-closed-quartal", label: "User Closed Quartal" },
  { key: "user-project-active-quartal", label: "User Active Quartal" },
  { key: "requirement-type", label: "Requirement Type" },
  { key: "requirement-summary", label: "Requirement Summary" },
  { key: "requirement-memo-summary", label: "Requirement Memo Summary" },
];

export function QuartalSnapshotGroup() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const token = typeof window !== "undefined" ? localStorage.getItem("tokenData") : "";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    projectSummary,
    projectQuartal,
    projectDivisionOwnerQuartal,
    projectCharacteristic,
    projectType,
    projectProcurementFlag,
    projectAcquisition,
    projectByGroupManage,
    projectActivePortofolio,
    projectClosePortofolio,
    userProjectClosedQuartal,
    userProjectActiveQuartal,
    requirementType,
    requirementSummary,
    requirementMemoSummary,
  } = useSnapshotServices();

  const [state, setState] = useState<ExecutionState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    progress: { current: 0, total: QUARTAL_ENDPOINTS.length, elapsedSeconds: 0 },
  });

  const [elapsedTimer, setElapsedTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.isLoading) {
      const timer = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            elapsedSeconds: prev.progress.elapsedSeconds + 1,
          },
        }));
      }, 1000);
      setElapsedTimer(timer);
    } else {
      if (elapsedTimer) clearInterval(elapsedTimer);
    }

    return () => {
      if (elapsedTimer) clearInterval(elapsedTimer);
    };
  }, [state.isLoading]);

  const methodMap: { [key: string]: () => Promise<any> } = {
    "project-summary": () => projectSummary(token || ""),
    "project-quartal": () => projectQuartal(token || ""),
    "project-division-owner-quartal": () =>
      projectDivisionOwnerQuartal(token || ""),
    "project-characteristics": () =>
      projectCharacteristic(token || ""),
    "project-types": () => projectType(token || ""),
    "project-procurement-workprogram-flag": () =>
      projectProcurementFlag(token || ""),
    "project-acquisitions": () => projectAcquisition(token || ""),
    "project-by-group-manage": () =>
      projectByGroupManage(token || ""),
    "project-active-portfolio": () =>
      projectActivePortofolio(token || ""),
    "project-close-portfolio": () =>
      projectClosePortofolio(token || ""),
    "user-project-closed-quartal": () =>
      userProjectClosedQuartal(token || ""),
    "user-project-active-quartal": () =>
      userProjectActiveQuartal(token || ""),
    "requirement-type": () => requirementType(token || ""),
    "requirement-summary": () => requirementSummary(token || ""),
    "requirement-memo-summary": () =>
      requirementMemoSummary(token || ""),
  };

  const handleConfirm = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: { current: 0, total: QUARTAL_ENDPOINTS.length, elapsedSeconds: 0 },
    }));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < QUARTAL_ENDPOINTS.length; i++) {
      const endpoint = QUARTAL_ENDPOINTS[i];
      try {
        const result = await methodMap[endpoint.key]();
        if (result?.statusCode === RES_CODE_OK) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }

      setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          current: i + 1,
        },
      }));
    }

    if (errorCount === 0) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));
      showToast({
        description: `All ${successCount} snapshots created successfully`,
        statusToast: "success",
      });
      setTimeout(() => {
        onClose();
        setState({
          isLoading: false,
          isSuccess: false,
          error: null,
          progress: { current: 0, total: QUARTAL_ENDPOINTS.length, elapsedSeconds: 0 },
        });
      }, 2000);
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: `${errorCount} snapshot(s) failed`,
      }));
      showToast({
        description: `${successCount} succeeded, ${errorCount} failed`,
        statusToast: "warning",
      });
    }
  };

  const getButtonColor = () => {
    if (state.error) return "red";
    if (state.isSuccess) return "green";
    return "blue";
  };

  const getButtonText = () => {
    if (state.isLoading) return "Executing...";
    if (state.isSuccess) return "✓ Success";
    if (state.error) return "✗ Error";
    return "Execute All Snapshots";
  };

  return (
    <>
      <Card
        borderRadius="lg"
        boxShadow={colorMode === "light" ? "sm" : "dark-lg"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderTop="4px"
        borderTopColor="blue.500"
      >
        <CardHeader pb={4}>
          <HStack spacing={3}>
            <Icon as={FiDatabase} boxSize={6} color="blue.500" />
            <VStack align="start" spacing={0}>
              <Heading size="md">Report Dashboard Snapshot</Heading>
              <Text fontSize="sm" color="gray.500">
                Execute all 15 report snapshots in one action
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <QuartalAlertBanner />
            <Button
              colorScheme={getButtonColor()}
              isLoading={state.isLoading}
              isDisabled={state.isLoading}
              onClick={onOpen}
              width="100%"
              size="lg"
              leftIcon={<FiPlay />}
              borderRadius="md"
              fontWeight="semibold"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
            >
              {getButtonText()}
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <QuartalProgressModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isExecuting={state.isLoading}
        progress={state.progress}
        error={state.error}
        endpointCount={QUARTAL_ENDPOINTS.length}
      />
    </>
  );
}
