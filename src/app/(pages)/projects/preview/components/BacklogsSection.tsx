"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Text,
  Badge,
  HStack,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { FiLayers, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import { useState } from "react";

interface BacklogsSectionProps {
  backlogList: BacklogDataResponse[];
  backlogStats?: any;
}

export const BacklogsSection = ({ backlogList }: BacklogsSectionProps) => {
  const { colorMode } = useColorMode();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  if (!backlogList || backlogList.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(backlogList.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = backlogList.slice(startIndex, endIndex);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL": return "red";
      case "HIGH": return "orange";
      case "MEDIUM": return "yellow";
      case "LOW": return "green";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE": return "green";
      case "IN_PROGRESS": return "blue";
      case "TODO": return "gray";
      default: return "gray";
    }
  };

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "cyan.50" : "cyan.900"} roundedTop="xl" py={4}>
        <HStack spacing={3} justify="space-between">
          <HStack spacing={3}>
            <Box
              w={10}
              h={10}
              bgGradient="linear(135deg, cyan.400, cyan.600)"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiLayers size={20} color="white" />
            </Box>
            <Heading size="md" color={colorMode === "light" ? "cyan.700" : "cyan.200"}>
              Data Scope Projects
            </Heading>
          </HStack>
          <Badge colorScheme="cyan" fontSize="sm" px={3} py={1} rounded="full">
            {backlogList.length} Total
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody p={0}>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={colorMode === "light" ? "gray.50" : "gray.700"}>
              <Tr>
                {/* <Th>Code</Th> */}
                <Th>Name</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentData.map((backlog) => (
                <Tr key={backlog.id} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}>
                  {/* <Td>
                    <Text fontSize="sm" fontWeight="medium">
                      {backlog.backlogCode}
                    </Text>
                  </Td> */}
                  <Td>
                    <Text fontSize="sm">{backlog.backlogName}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getPriorityColor(backlog.priority)} fontSize="xs">
                      {backlog.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(backlog.developmentStatus)} fontSize="xs">
                      {backlog.developmentStatus}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {totalPages > 1 && (
          <Box p={4} borderTop="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Showing {startIndex + 1} to {Math.min(endIndex, backlogList.length)} of {backlogList.length} entries
              </Text>
              <ButtonGroup size="sm" variant="outline">
                <Button
                  leftIcon={<FiChevronLeft />}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  isDisabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button isDisabled>
                  Page {currentPage + 1} of {totalPages}
                </Button>
                <Button
                  rightIcon={<FiChevronRight />}
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  isDisabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </ButtonGroup>
            </HStack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};
