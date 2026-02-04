"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Text,
  HStack,
  VStack,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import { FiCheckCircle, FiUser } from "react-icons/fi";

interface StatusHistorySectionProps {
  statusHistory: any[];
}

export const StatusHistorySection = ({ statusHistory }: StatusHistorySectionProps) => {
  const { colorMode } = useColorMode();

  if (!statusHistory || statusHistory.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "purple.50" : "purple.900"} roundedTop="xl" py={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, purple.400, purple.600)"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiCheckCircle size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "purple.700" : "purple.200"}>
            Project Status History
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={0} align="stretch">
          {statusHistory.map((history, index) => (
            <Box key={history.id}>
              <HStack spacing={4} align="start" py={4}>
                {/* Timeline Dot */}
                <VStack spacing={0}>
                  <Box
                    w={4}
                    h={4}
                    bg={history.isApprovalPhase ? "green.500" : "blue.400"}
                    rounded="full"
                    border="3px solid"
                    borderColor={colorMode === "light" ? "white" : "gray.800"}
                    shadow="md"
                  />
                  {index < statusHistory.length - 1 && (
                    <Box
                      w="2px"
                      h="full"
                      minH="60px"
                      bg={colorMode === "light" ? "gray.200" : "gray.600"}
                    />
                  )}
                </VStack>

                {/* Content */}
                <VStack align="start" spacing={2} flex={1}>
                  <HStack spacing={3} wrap="wrap">
                    <Badge
                      colorScheme={history.isApprovalPhase ? "green" : "blue"}
                      fontSize="sm"
                      px={3}
                      py={1}
                      rounded="full"
                    >
                      {history.projectStatus}
                    </Badge>
                    {history.isApprovalPhase && (
                      <Badge colorScheme="purple" fontSize="xs" px={2} py={1} rounded="full">
                        Approval Phase
                      </Badge>
                    )}
                  </HStack>

                  <Text fontSize="sm" color="gray.600">
                    {formatDate(history.createdAt)}
                  </Text>

                  {/* Approval Details */}
                  {history.isApprovalPhase && history.approvalNama && (
                    <Box
                      mt={2}
                      p={3}
                      bg={colorMode === "light" ? "green.50" : "green.900"}
                      rounded="lg"
                      border="1px"
                      borderColor="green.200"
                      w="full"
                    >
                      <VStack align="start" spacing={2}>
                        <HStack spacing={2}>
                          <FiUser size={16} color="green" />
                          <Text fontSize="sm" fontWeight="semibold" color="green.700">
                            Approved by: {history.approvalNama}
                          </Text>
                        </HStack>
                        
                        {history.approvalJabatan && (
                          <Text fontSize="xs" color="gray.600">
                            Position: {history.approvalJabatan}
                          </Text>
                        )}
                        
                        {history.approvalOrgDivisionName && (
                          <Text fontSize="xs" color="gray.600">
                            Division: {history.approvalOrgDivisionName}
                          </Text>
                        )}
                        
                        {history.approvalNote && (
                          <Box mt={2} pt={2} borderTop="1px" borderColor="green.200" w="full">
                            <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                              Note:
                            </Text>
                            <Text fontSize="sm" color="gray.700" mt={1}>
                              {history.approvalNote}
                            </Text>
                          </Box>
                        )}
                        
                        {history.approvalAt && (
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Approved at: {formatDate(history.approvalAt)}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};
