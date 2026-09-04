"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select as ChakraSelect,
  SimpleGrid,
  Spinner,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { FiBriefcase, FiCheck, FiMapPin, FiUserCheck } from "react-icons/fi";
import useVendor, { VendorResponse } from "@/app/services/useVendor";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { ListSearchByParam } from "@/app/types/masterTypes";

interface ModalVendorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVendor: (vendor: VendorResponse) => void;
  tokenData: string;
  allowAllSelection?: boolean;
}

const ModalVendorSelector = ({
  isOpen,
  onClose,
  onSelectVendor,
  tokenData,
  allowAllSelection = false,
}: ModalVendorSelectorProps) => {
  const { colorMode } = useColorMode();
  const { List: ListVendors } = useVendor();

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchVendors = useCallback(async () => {
    if (!tokenData || !isOpen) return;
    setIsLoading(true);

    const filterWhere: ListSearchByParam[] = [];
    if (statusFilter) {
      filterWhere.push({ field: "status", operator: "=", value: statusFilter });
    }

    const res = await ListVendors(
      {
        page: 0,
        limit: 5,
        search: debouncedSearch,
        filterWhere,
        fieldOrder: ["vendorName"],
        orderDir: "asc",
      },
      tokenData
    );

    if (res?.statusCode === RES_CODE_OK && res.data) {
      setVendors(res.data);
    }
    setIsLoading(false);
  }, [tokenData, isOpen, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent rounded="2xl" shadow="2xl">
        <ModalHeader borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <HStack spacing={3}>
            <Box w={9} h={9} bg="blue.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiUserCheck} boxSize={5} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold">Select Vendor Corporate</Text>
              <Text fontSize="xs" color="gray.500">Choose a registered vendor to attach this contract</Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={5}>
          <VStack spacing={4} align="stretch">
            {/* Search & Status Filter Bar */}
            <Flex gap={3} wrap="wrap">
              <InputGroup size="sm" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search vendor by code, name, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  rounded="lg"
                  focusBorderColor="secondary.500"
                />
              </InputGroup>

              <ChakraSelect
                size="sm"
                w="160px"
                rounded="lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </ChakraSelect>
            </Flex>

            {/* Vendor Cards List */}
            {isLoading ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner color="secondary.500" />
              </Flex>
            ) : vendors.length > 0 ? (
              <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto" pr={1}>
                {vendors.map((v) => {
                  const activeTdr = v.tdrList?.find((t) => {
                    if (t.tdrType === "PERMANENT") return true;
                    if (!t.expiredAt) return false;
                    return new Date(t.expiredAt) >= new Date();
                  });
                  const hasActiveTdr = !!activeTdr;
                  const isSelectable = allowAllSelection || hasActiveTdr;

                  return (
                    <Box
                      key={v.id}
                      p={4}
                      rounded="xl"
                      border="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                      bg={colorMode === "light" ? "white" : "gray.800"}
                      _hover={{ borderColor: isSelectable ? "secondary.500" : "red.300", shadow: "md" }}
                      transition="all 0.2s ease"
                    >
                      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2} wrap="wrap">
                            <Badge colorScheme="blue" fontSize="2xs" rounded="md">
                              {v.vendorCode}
                            </Badge>
                            <Badge colorScheme="purple" fontSize="2xs" rounded="md">
                              {v.vendorType}
                            </Badge>
                            <Badge colorScheme={v.status === "ACTIVE" ? "green" : "red"} fontSize="2xs" rounded="md">
                              {v.status}
                            </Badge>
                            {hasActiveTdr ? (
                              <Badge colorScheme="teal" fontSize="2xs" rounded="md">
                                ✓ TDR Active: {activeTdr.trdNumber}
                              </Badge>
                            ) : (
                              <Badge colorScheme="red" fontSize="2xs" rounded="md">
                                ⚠️ No Active TDR
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                            {v.vendorName}
                          </Text>
                          <HStack spacing={3} fontSize="xs" color="gray.500">
                            <HStack spacing={1}>
                              <Icon as={FiMapPin} boxSize={3} color="gray.400" />
                              <Text>{v.city}, {v.country}</Text>
                            </HStack>
                            <Text>• PIC: {v.picBusinessName}</Text>
                          </HStack>
                        </VStack>

                        <Button
                          size="xs"
                          colorScheme={isSelectable ? "secondary" : "gray"}
                          leftIcon={<FiCheck />}
                          rounded="lg"
                          isDisabled={!isSelectable}
                          onClick={() => {
                            if (isSelectable) {
                              onSelectVendor(v);
                              onClose();
                            }
                          }}
                        >
                          {isSelectable ? "Select Vendor" : "TDR Inactive"}
                        </Button>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Flex justify="center" align="center" py={10} direction="column" gap={2}>
                <Icon as={FiBriefcase} boxSize={8} color="gray.400" />
                <Text fontSize="sm" color="gray.500">No matching vendor found</Text>
              </Flex>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalVendorSelector;
