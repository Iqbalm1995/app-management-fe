"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select as ChakraSelect,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
  Heading,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  FiSearch,
  FiFilter,
  FiBriefcase,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiZap,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { VendorContractResponse, VendorResponse } from "@/app/services/useVendor";
import { formatIDR } from "@/app/components/CardContract";
import ModalVendorSelector from "../register/components/ModalVendorSelector";

interface ContractSidebarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  selectedVendorId: string;
  setSelectedVendorId: (value: string) => void;
  DataContracts: VendorContractResponse[];
  VendorOptions: VendorResponse[];
  totalContractsCount: number;
  totalActiveContractsCount: number;
  totalWorkValue: number;
  colorMode: "light" | "dark";
  showWorkValue?: boolean;
  tokenData: string;
}

const ContractSidebar = ({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  selectedVendorId,
  setSelectedVendorId,
  DataContracts,
  VendorOptions,
  totalContractsCount,
  totalActiveContractsCount,
  totalWorkValue,
  colorMode,
  showWorkValue = false,
  tokenData,
}: ContractSidebarProps) => {
  const vendorModal = useDisclosure();
  const selectedVendor = VendorOptions.find((v) => v.id === selectedVendorId);
  const handleStatusToggle = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "green";
      case "COMPLETED": return "blue";
      case "EXPIRED": return "orange";
      case "TERMINATED": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE": return FiZap;
      case "COMPLETED": return FiCheckCircle;
      case "EXPIRED": return FiClock;
      case "TERMINATED": return FiAlertCircle;
      default: return FiBriefcase;
    }
  };

  const CONTRACT_STATUSES = ["ACTIVE", "COMPLETED", "EXPIRED", "TERMINATED"];

  return (
    <VStack spacing={6} align="stretch">
      {/* Contract Dashboard Summary Card */}
      <Card
        rounded="2xl"
        shadow="xl"
        border="1px"
        borderColor={colorMode === "light" ? "secondary.500" : "secondary.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
        overflow="hidden"
      >
        <Box
          bgGradient="linear(to-br, secondary.700, secondary.500)"
          p={4}
          color="white"
        >
          <HStack spacing={3} align="center">
            <Box
              w={12}
              h={12}
              bg="whiteAlpha.200"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
            >
              <Icon as={FiBriefcase} boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" fontWeight="bold">
                Contracts Hub
              </Heading>
              <Text fontSize="xs" opacity={0.9}>
                Procurement & Timeline Overview
              </Text>
            </VStack>
          </HStack>
        </Box>

        <CardBody p={5}>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={2} spacing={3}>
              <Box textAlign="center" p={2} bg={colorMode === "light" ? "blue.50" : "gray.700"} rounded="lg">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {totalContractsCount}
                </Text>
                <Text fontSize="2xs" color="gray.600" fontWeight="semibold">
                  Total Contracts
                </Text>
              </Box>
              <Box textAlign="center" p={2} bg={colorMode === "light" ? "green.50" : "gray.700"} rounded="lg">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {totalActiveContractsCount}
                </Text>
                <Text fontSize="2xs" color="gray.600" fontWeight="semibold">
                  Active Now
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            <VStack align="start" spacing={1}>
              <Text fontSize="2xs" color="gray.500" fontWeight="600">
                Total Portfolio Work Value
              </Text>
              <Text fontSize="md" fontWeight="800" color="secondary.700">
                {formatIDR(totalWorkValue, showWorkValue)}
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Global Search Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2.5} align="center">
              <Box
                w={8}
                h={8}
                bg="blue.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiSearch} boxSize={4} />
              </Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">
                Contract Search
              </Text>
            </HStack>

            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none" h="full">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search SPK #, title, notes..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                focusBorderColor="secondary.500"
                rounded="lg"
              />
            </InputGroup>
          </VStack>
        </CardBody>
      </Card>

      {/* Vendor Filter Card (Autocomplete Dropdown) */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2.5} align="center">
              <Box
                w={8}
                h={8}
                bg="teal.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiUserCheck} boxSize={4} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.800">
                  Vendor Filter
                </Text>
                <Text fontSize="2xs" color="gray.500">Filter by corporate vendor</Text>
              </VStack>
            </HStack>

            {selectedVendor ? (
              <Box p={3} rounded="xl" border="1px" borderColor={colorMode === "light" ? "teal.200" : "teal.700"} bg={colorMode === "light" ? "teal.50" : "gray.700"}>
                <VStack align="start" spacing={1.5}>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue" fontSize="2xs" rounded="md">{selectedVendor.vendorCode}</Badge>
                    <Badge colorScheme="purple" fontSize="2xs" rounded="md">{selectedVendor.vendorType}</Badge>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"} noOfLines={1}>
                    {selectedVendor.vendorName}
                  </Text>
                  <Flex gap={2} w="full" pt={1}>
                    <Button size="xs" variant="outline" colorScheme="blue" flex={1} onClick={vendorModal.onOpen}>
                      Change
                    </Button>
                    <Button size="xs" variant="ghost" colorScheme="red" flex={1} onClick={() => setSelectedVendorId("")} leftIcon={<FiX />}>
                      Clear
                    </Button>
                  </Flex>
                </VStack>
              </Box>
            ) : (
              <Button
                size="sm"
                w="full"
                variant="outline"
                borderColor="teal.400"
                color="teal.600"
                leftIcon={<FiUserCheck size={16} />}
                onClick={vendorModal.onOpen}
                _hover={{ bg: "teal.50" }}
              >
                Search & Select Vendor...
              </Button>
            )}

            <ModalVendorSelector
              isOpen={vendorModal.isOpen}
              onClose={vendorModal.onClose}
              onSelectVendor={(v) => setSelectedVendorId(v.id)}
              tokenData={tokenData}
              allowAllSelection={true}
            />
          </VStack>
        </CardBody>
      </Card>

      {/* Status Filter Card */}
      <Card
        rounded="2xl"
        shadow="lg"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardBody p={5}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2.5} align="center">
              <Box
                w={8}
                h={8}
                bg="purple.500"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                <Icon as={FiFilter} boxSize={4} />
              </Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">
                Status Filter
              </Text>
            </HStack>

            <VStack spacing={2} align="stretch">
              {CONTRACT_STATUSES.map((status) => {
                const isSelected = statusFilter.includes(status);
                const count = DataContracts.filter((c) => c.status?.toUpperCase() === status).length;
                const colorScheme = getStatusColor(status);
                const StatusIcon = getStatusIcon(status);

                return (
                  <Button
                    key={status}
                    variant={isSelected ? "solid" : "ghost"}
                    colorScheme={colorScheme}
                    size="sm"
                    justifyContent="space-between"
                    onClick={() => handleStatusToggle(status)}
                    leftIcon={<Icon as={StatusIcon} />}
                    rounded="xl"
                  >
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" fontWeight="medium">{status}</Text>
                      <Badge
                        colorScheme={colorScheme}
                        variant={isSelected ? "solid" : "subtle"}
                        rounded="full"
                        px={2}
                        fontSize="2xs"
                      >
                        {count}
                      </Badge>
                    </HStack>
                  </Button>
                );
              })}
            </VStack>

            {(statusFilter.length > 0 || globalFilter || selectedVendorId) && (
              <Button
                size="xs"
                variant="outline"
                colorScheme="gray"
                onClick={() => {
                  setGlobalFilter("");
                  setStatusFilter([]);
                  setSelectedVendorId("");
                }}
                rounded="md"
                mt={2}
              >
                Clear All Filters
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ContractSidebar;
