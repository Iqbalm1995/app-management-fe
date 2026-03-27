import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  Button,
  HStack,
  Icon,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useReports from "@/app/services/useReports";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { QuartalAlertBanner } from "./QuartalAlertBanner";
import { FiCheckSquare, FiPlay } from "react-icons/fi";

interface EvaluationState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function EvaluationSnapshotGroup() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const token = typeof window !== "undefined" ? localStorage.getItem("tokenData") : "";
  const { CreateUserEvaluationSnapshot } = useReports();

  const [state, setState] = useState<EvaluationState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const handleExecute = async () => {
    setState({ isLoading: true, isSuccess: false, error: null });

    try {
      const result = await CreateUserEvaluationSnapshot(token || "");
      if (result?.statusCode === RES_CODE_OK) {
        setState({ isLoading: false, isSuccess: true, error: null });
        showToast({
          description: "Evaluation snapshot created successfully",
          statusToast: "success",
        });
        setTimeout(() => {
          setState({ isLoading: false, isSuccess: false, error: null });
        }, 3000);
      } else {
        throw new Error(result?.message || "Failed to create snapshot");
      }
    } catch (error: any) {
      const errorMsg = error?.message || "An error occurred";
      setState({ isLoading: false, isSuccess: false, error: errorMsg });
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
    return "Create Evaluation Snapshot";
  };

  return (
    <Card
      borderRadius="lg"
      boxShadow={colorMode === "light" ? "sm" : "dark-lg"}
      bg={colorMode === "light" ? "white" : "gray.800"}
      borderTop="4px"
      borderTopColor="purple.500"
    >
      <CardHeader pb={4}>
        <HStack spacing={3}>
          <Icon as={FiCheckSquare} boxSize={6} color="purple.500" />
          <VStack align="start" spacing={0}>
            <Heading size="md">Report Evaluation Data Snapshot</Heading>
            <Text fontSize="sm" color="gray.500">
              Capture user evaluation report data
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
            onClick={handleExecute}
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
  );
}
