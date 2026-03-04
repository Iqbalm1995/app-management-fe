"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  HStack,
  VStack,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Badge,
  Flex,
  IconButton,
  useColorMode,
  Spinner,
  Center,
  StackDivider,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { PaggingListPayload } from "@/app/types/masterTypes";

interface AppPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ApplicationMasterResponse | null;
  onAppSelect: (app: ApplicationMasterResponse | null) => void;
  tokenData: string;
}

export default function AppPickerModalForm({
  isOpen,
  onClose,
  selectedApp,
  onAppSelect,
  tokenData,
}: AppPickerModalProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { List: ListApps } = useApps();

  const [apps, setApps] = useState<ApplicationMasterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });
  const [totalData, setTotalData] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (isOpen && tokenData) {
      loadApps();
    }
  }, [
    isOpen,
    tokenData,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  ]);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const payload: PaggingListPayload = {
        search: debouncedSearch,
        limit: pagination.pageSize,
        page: pagination.pageIndex,
        filterWhere: [],
        fieldOrder: ["appName"],
        orderDir: "asc",
      };
      const response = await ListApps(payload, tokenData);
      if (response?.statusCode === RES_CODE_OK) {
        setApps(response.data || []);
        setTotalData(response.countTotal || 0);
      } else {
        showToast({
          description: "Failed to load applications",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "Error loading applications",
        statusToast: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalData / pagination.pageSize);
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < totalPages - 1;

  const handlePreviousPage = () => {
    if (canPreviousPage) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
    }
  };

  const handleNextPage = () => {
    if (canNextPage) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
    }
  };

  const handleAppSelect = (app: ApplicationMasterResponse) => {
    // Prevent selection of "OTHER" applications
    if (app.appCode?.toUpperCase().includes('OTHER') ||
      app.appShortName?.toUpperCase().includes('OTHER')) {
      showToast({
        description: "Aplikasi dengan kategori 'OTHER' tidak dapat dipilih untuk requirement ini.",
        statusToast: "warning",
      });
      return;
    }

    onAppSelect(app);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <ModalHeader>Pilih Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Cari product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Box minH="400px">
              {isLoading ? (
                <Center h="400px">
                  <Spinner size="lg" />
                </Center>
              ) : (
                <>
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                    {apps.map((app) => {
                      const isOtherApp = app.appCode?.toUpperCase().includes('OTHER') ||
                        app.appShortName?.toUpperCase().includes('OTHER');

                      return (
                        <Card
                          key={app.id}
                          cursor={isOtherApp ? "not-allowed" : "pointer"}
                          onClick={() => handleAppSelect(app)}
                          rounded={radiusStyle}
                          opacity={isOtherApp ? 0.5 : 1}
                          bg={
                            selectedApp?.id === app.id
                              ? colorMode === "light"
                                ? "blue.50"
                                : "blue.900"
                              : colorMode === "light"
                                ? "white"
                                : "gray.700"
                          }
                          borderColor={
                            isOtherApp
                              ? "red.300"
                              : selectedApp?.id === app.id
                                ? "blue.500"
                                : colorMode === "light"
                                  ? "gray.200"
                                  : "gray.600"
                          }
                          borderWidth="2px"
                          _hover={
                            isOtherApp
                              ? {}
                              : {
                                borderColor: "blue.400",
                                transform: "translateY(-2px)",
                                shadow: "lg",
                              }
                          }
                          transition="all 0.2s"
                        >
                          <CardBody p={4}>
                            <VStack spacing={3}>
                              <Box position="relative">
                                <Avatar
                                  name={app.appName}
                                  size="lg"
                                  bg="blue.500"
                                  color="white"
                                />
                                {selectedApp?.id === app.id && (
                                  <Box
                                    position="absolute"
                                    top="-2px"
                                    right="-2px"
                                    bg="green.500"
                                    rounded="full"
                                    p={1}
                                  >
                                    <FiCheckCircle color="white" size={16} />
                                  </Box>
                                )}
                              </Box>
                              <VStack spacing={1} textAlign="center">
                                <Text
                                  fontWeight="bold"
                                  fontSize="sm"
                                  noOfLines={2}
                                  color={
                                    colorMode === "light" ? "gray.800" : "white"
                                  }
                                >
                                  {app.appName}
                                </Text>
                                <Badge
                                  colorScheme={
                                    app.appsStatus === "ACTIVE" ? "green" : "gray"
                                  }
                                  size="sm"
                                >
                                  {app.appsStatus}
                                </Badge>
                                {isOtherApp && (
                                  <Badge colorScheme="red" size="sm">
                                    Tidak dapat dipilih
                                  </Badge>
                                )}
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </SimpleGrid>

                  {apps.length === 0 && !isLoading && (
                    <Center h="200px">
                      <Text
                        color={colorMode === "light" ? "gray.500" : "gray.400"}
                      >
                        Tidak ada aplikasi ditemukan
                      </Text>
                    </Center>
                  )}
                </>
              )}
            </Box>

            {/* Pagination */}
            <Flex justify="space-between" align="center" mt={4} gap={4}>
              <HStack spacing={2} divider={<StackDivider borderColor="gray.300" />}>
                <Text fontSize="sm" fontWeight={600}>Halaman</Text>
                <Text fontSize="sm">{pagination.pageIndex + 1}</Text>
                <Text fontSize="sm">/</Text>
                <Text fontSize="sm">{totalPages}</Text>
              </HStack>
              <HStack spacing={1}>
                <IconButton
                  aria-label="Previous page"
                  icon={<FiChevronLeft />}
                  onClick={handlePreviousPage}
                  isDisabled={!canPreviousPage}
                  size="sm"
                  variant="outline"
                />
                <IconButton
                  aria-label="Next page"
                  icon={<FiChevronRight />}
                  onClick={handleNextPage}
                  isDisabled={!canNextPage}
                  size="sm"
                  variant="outline"
                />
              </HStack>
            </Flex>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Batal
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => selectedApp && onAppSelect(selectedApp)}
            isDisabled={!selectedApp}
          >
            Pilih Product
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
