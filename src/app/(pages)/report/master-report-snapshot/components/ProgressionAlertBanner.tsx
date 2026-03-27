import { Alert, AlertIcon, Box, Text, VStack } from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";

export function ProgressionAlertBanner() {
  return (
    <Alert status="info" borderRadius="md" mb={6}>
      <AlertIcon />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold">Progression Report Execution</Text>
        <Text fontSize="sm">
          This operation may take several minutes to complete.
        </Text>
        <Text fontSize="sm" mt={2}>
          Recommended: Execute at 5 PM or during night hours to avoid impact on
          system performance
        </Text>
      </VStack>
    </Alert>
  );
}
