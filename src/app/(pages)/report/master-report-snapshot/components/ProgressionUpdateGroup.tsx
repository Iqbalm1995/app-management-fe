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
  useColorMode,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useProjects from "@/app/services/useProjects";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ProgressionAlertBanner } from "./ProgressionAlertBanner";
import { ProgressionModal } from "./ProgressionModal";
import { FiTrendingUp, FiPlay } from "react-icons/fi";

interface ProgressionState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  progress: {
    current: number;
    total: number;
    elapsedSeconds: number;
  };
}

export function ProgressionUpdateGroup() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const token = typeof window !== "undefined" ? localStorage.getItem("tokenData") : "";
  const { UpdateAllProjectsProgressionSnapshot } = useProjects();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [state, setState] = useState<ProgressionState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    progress: { current: 0, total: 0, elapsedSeconds: 0 },
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

  const handleConfirm = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: { current: 0, total: 0, elapsedSeconds: 0 },
    }));

    try {
      const result = await UpdateAllProjectsProgressionSnapshot(token || "");
      if (result?.statusCode === RES_CODE_OK && result?.data) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
          progress: {
            current: result?.data?.totalProcessed || 0,
            total: result?.data?.totalProcessed || 0,
            elapsedSeconds: Math.round(result?.data?.processingTimeSeconds || 0),
          },
        }));
        showToast({
          description: `Updated ${result?.data?.totalUpdated || 0} projects`,
          statusToast: "success",
        });
        setTimeout(() => {
          onClose();
          setState({
            isLoading: false,
            isSuccess: false,
            error: null,
            progress: { current: 0, total: 0, elapsedSeconds: 0 },
          });
        }, 2000);
      } else {
        throw new Error(result?.message || "Failed to update progression");
      }
    } catch (error: any) {
      const errorMsg = error?.message || "An error occurred";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      showToast({
        description: errorMsg,
        statusToast: "error",
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
    return "Execute Progression Update";
  };

  return (
    <>
      <Card
        borderRadius="lg"
        boxShadow={colorMode === "light" ? "sm" : "dark-lg"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderTop="4px"
        borderTopColor="orange.500"
      >
        <CardHeader pb={4}>
          <HStack spacing={3}>
            <Icon as={FiTrendingUp} boxSize={6} color="orange.500" />
            <VStack align="start" spacing={0}>
              <Heading size="md">Report Project Progression Update</Heading>
              <Text fontSize="sm" color="gray.500">
                Update all active projects progression status
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <ProgressionAlertBanner />
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

      <ProgressionModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isExecuting={state.isLoading}
        progress={state.progress}
        error={state.error}
      />
    </>
  );
}
