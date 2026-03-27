import { Alert, AlertIcon, Box, Text, VStack } from "@chakra-ui/react";
import { useQuartalDates } from "../hooks/useQuartalDates";

export function QuartalAlertBanner() {
  const { quartalEndDate, nextQuartalStartDate } = useQuartalDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Alert status="warning" borderRadius="md" mb={6}>
      <AlertIcon />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold">Quartal Reporting Window</Text>
        <Text fontSize="sm">
          Current Quartal Ends: {formatDate(quartalEndDate)}
        </Text>
        <Text fontSize="sm">
          Next Quartal Starts: {formatDate(nextQuartalStartDate)}
        </Text>
        <Text fontSize="sm" mt={2}>
          Recommended execution: Near end of current quartal for accurate data
        </Text>
      </VStack>
    </Alert>
  );
}
