"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  TableComponentFull,
} from "@/app/components/tableComponents";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import {
  ListSearchByParam,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { FiRefreshCw, FiEye, FiChevronRight } from "react-icons/fi";
import { RiOrganizationChart } from "react-icons/ri";
import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function MasterDataOrganizationsPage() {
  useDocumentTitle("Organizations");
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { List: GetOrganizationList, isLoading } = useOrganization();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data State
  const [Data, setData] = useState<OrganizationResponse[] | null>(null);
  const [AllData, setAllData] = useState<OrganizationResponse[] | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Pagination State
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Table State
  const [FilterWhere, setFilterWhere] = useState<ListSearchByParam[]>([]);

  // Detail Modal
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [SelectedOrg, setSelectedOrg] = useState<OrganizationResponse | null>(null);
  const [OrgHierarchy, setOrgHierarchy] = useState<{
    parents: OrganizationResponse[];
    children: OrganizationResponse[];
  }>({ parents: [], children: [] });

  // Auth Effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, []);

  // Fetch Data Effect
  useEffect(() => {
    const fetchData = async () => {
      if (tokenData) {
        setIsLoadingProcess(true);
        try {
          // Load all data first time
          if (!AllData) {
            const allPayload: PaggingListPayload = {
              search: "",
              limit: MAX_SIZE_TABLE,
              page: 0,
              filterWhere: [],
              fieldOrder: ["orgType", "orgName"],
              orderDir: "asc",
            };

            const allResponse = await GetOrganizationList(allPayload, tokenData);
            if (allResponse && allResponse.statusCode === RES_CODE_OK) {
              setAllData(allResponse.data as OrganizationResponse[]);
            }
          }

          // Load paginated data for table
          const payload: PaggingListPayload = {
            search: globalFilter,
            limit: pageSize,
            page: pageIndex,
            filterWhere: FilterWhere,
            fieldOrder: ["orgType", "orgName"],
            orderDir: "asc",
          };

          const requestData = await GetOrganizationList(payload, tokenData);

          if (!requestData || requestData.statusCode !== RES_CODE_OK) {
            showToast({
              description: requestData?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            return;
          }

          const data = requestData.data as OrganizationResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number = totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          
          setData(data);
          setTotalPageData(totalPages);
        } catch (error) {
          console.error("Error fetching organizations:", error);
          showToast({
            description: "Failed to load organizations data",
            statusToast: "error",
          });
        } finally {
          setIsLoadingProcess(false);
        }
      }
    };

    fetchData();
  }, [tokenData, RefreshData, pageIndex, pageSize, globalFilter, FilterWhere, AllData]);

  // Get organizational hierarchy
  const getOrgHierarchy = async (org: OrganizationResponse) => {
    if (!AllData) return;

    // Get parents (trace up the hierarchy)
    const parents: OrganizationResponse[] = [];
    let currentParentCode = org.orgParentCode;
    
    while (currentParentCode) {
      const parent = AllData.find(o => o.orgCode === currentParentCode);
      if (parent) {
        parents.unshift(parent); // Add to beginning to maintain order
        currentParentCode = parent.orgParentCode;
      } else {
        break;
      }
    }

    // Get children (find all orgs that have this org as parent)
    const children = AllData.filter(o => o.orgParentCode === org.orgCode);

    setOrgHierarchy({ parents, children });
  };

  // Handlers
  const handleViewDetail = async (org: OrganizationResponse) => {
    setSelectedOrg(org);
    await getOrgHierarchy(org);
    onDetailOpen();
  };

  // Table Columns
  const columns: ColumnDef<OrganizationResponse>[] = useMemo(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="flex-start" h="full">
            <Text>{pageIndex * pageSize + info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">No.</Flex>,
        size: 60,
      },
      {
        accessorKey: "orgCode",
        header: "Organization Code",
        size: 150,
        cell: ({ row }) => (
          <Text fontSize="sm" fontWeight="semibold">
            {row.original.orgCode}
          </Text>
        ),
      },
      {
        accessorKey: "orgName",
        header: "Organization Name",
        size: 250,
        cell: ({ row }) => (
          <Text fontSize="sm">{row.original.orgName}</Text>
        ),
      },
      {
        accessorKey: "orgType",
        header: "Type",
        size: 120,
        cell: ({ row }) => (
          <Badge
            colorScheme={
              row.original.orgType === "GROUP" ? "blue" :
              row.original.orgType === "DIVISION" ? "green" :
              row.original.orgType === "TEAM" ? "purple" : "gray"
            }
            rounded="full"
            px={3}
            py={1}
            fontSize="xs"
          >
            {row.original.orgType}
          </Badge>
        ),
      },
      {
        accessorKey: "orgParentCode",
        header: "Parent Code",
        size: 150,
        cell: ({ row }) => (
          <Text fontSize="sm">{row.original.orgParentCode || "-"}</Text>
        ),
      },
      {
        accessorKey: "orgDesc",
        header: "Description",
        size: 200,
        cell: ({ row }) => (
          <Text fontSize="sm" noOfLines={2}>
            {row.original.orgDesc || "-"}
          </Text>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => (
          <IconButton
            aria-label="View Details"
            icon={<FiEye />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={() => handleViewDetail(row.original)}
          />
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  // Table Instance
  const table = useReactTable({
    data: Data || [],
    columns,
    pageCount: totalPages ?? 1,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  // Handlers
  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination({ pageIndex: 0, pageSize });
  };

  // Header Props
  const headerProps: HeaderContentProps = {
    titleName: "Master Data Organizations",
    breadCrumb: ["Master Data", "Organizations"],
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...headerProps} />

      <Box p={6}>
        <Card
          shadow="lg"
          rounded="xl"
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                Organizations Management
              </Heading>
              <HStack spacing={3}>
                <Box position="relative">
                  <Input
                    placeholder="Search organizations..."
                    value={globalFilter}
                    onChange={(e) => handleSearch(e.target.value)}
                    pr={10}
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    border="1px solid"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    rounded={radiusStyle}
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px blue.500",
                    }}
                  />
                  <Search2Icon
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                  />
                </Box>
                <Button
                  leftIcon={<FiRefreshCw />}
                  onClick={handleRefresh}
                  isLoading={IsLoadingProcess}
                  loadingText="Refreshing"
                  colorScheme="blue"
                  variant="outline"
                  rounded={radiusStyle}
                >
                  Refresh
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          <Divider />

          <CardBody p={0}>
            <TableComponentFull table={table} />
          </CardBody>
        </Card>
      </Box>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent
          bg={colorMode === "light" ? "white" : "gray.800"}
          color={colorMode === "light" ? "gray.800" : "white"}
          rounded="2xl"
          shadow="2xl"
          border="1px solid"
          borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
        >
          <ModalHeader
            bgGradient="linear(135deg, blue.500, purple.600)"
            color="white"
            roundedTop="2xl"
            py={6}
          >
            <HStack spacing={4}>
              <Box
                p={2}
                bg="whiteAlpha.200"
                rounded="xl"
                backdropFilter="blur(10px)"
              >
                <RiOrganizationChart size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  Organization Details
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Organizational hierarchy and structure
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            {SelectedOrg && (
              <Box>
                {/* Hierarchy Path */}
                {OrgHierarchy.parents.length > 0 && (
                  <Box
                    bg={colorMode === "light" ? "blue.50" : "blue.900"}
                    px={8}
                    py={4}
                    borderBottom="1px solid"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                  >
                    <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.600">
                      Organizational Path
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {OrgHierarchy.parents.map((parent, index) => (
                        <HStack key={parent.orgCode} spacing={2}>
                          <Badge
                            colorScheme={
                              parent.orgType === "DIRECTORATE" ? "red" :
                              parent.orgType === "DIVISION" ? "green" : "blue"
                            }
                            rounded="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                          >
                            {parent.orgCode}
                          </Badge>
                          <FiChevronRight size={12} color="gray.400" />
                        </HStack>
                      ))}
                      <Badge
                        colorScheme="purple"
                        rounded="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        variant="solid"
                      >
                        {SelectedOrg.orgCode} (Current)
                      </Badge>
                    </HStack>
                  </Box>
                )}

                {/* Organization Details */}
                <Box p={8}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                    {/* Basic Information */}
                    <GridItem>
                      <Card
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        shadow="sm"
                        rounded="xl"
                        border="1px solid"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <CardHeader pb={3}>
                          <Text fontSize="md" fontWeight="semibold">
                            Basic Information
                          </Text>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Organization Code
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {SelectedOrg.orgCode}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Organization Name
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedOrg.orgName}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Type
                              </Text>
                              <Badge
                                colorScheme={
                                  SelectedOrg.orgType === "DIRECTORATE" ? "red" :
                                  SelectedOrg.orgType === "DIVISION" ? "green" :
                                  SelectedOrg.orgType === "GROUP" ? "purple" : "gray"
                                }
                                rounded="full"
                                px={3}
                                py={1}
                                fontSize="xs"
                              >
                                {SelectedOrg.orgType}
                              </Badge>
                            </Box>
                            {SelectedOrg.orgDesc && (
                              <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                  Description
                                </Text>
                                <Text fontSize="sm">
                                  {SelectedOrg.orgDesc}
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Hierarchy Information */}
                    <GridItem>
                      <Card
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        shadow="sm"
                        rounded="xl"
                        border="1px solid"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <CardHeader pb={3}>
                          <Text fontSize="md" fontWeight="semibold">
                            Hierarchy Information
                          </Text>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Parent Organization
                              </Text>
                              {SelectedOrg.orgParentCode ? (
                                <Text fontSize="sm" fontWeight="medium">
                                  {SelectedOrg.orgParentCode}
                                </Text>
                              ) : (
                                <Text fontSize="sm" color="gray.400">
                                  Top Level Organization
                                </Text>
                              )}
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Level in Hierarchy
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                Level {OrgHierarchy.parents.length + 1}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Direct Children
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {OrgHierarchy.children.length} organization(s)
                              </Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>

                  {/* Parent Organizations List */}
                  {OrgHierarchy.parents.length > 0 && (
                    <Box mt={8}>
                      <Text fontSize="md" fontWeight="semibold" mb={4}>
                        Parent Organizations (Top Structure)
                      </Text>
                      <VStack spacing={3} align="stretch">
                        {OrgHierarchy.parents.map((parent, index) => (
                          <Card
                            key={parent.orgCode}
                            bg={colorMode === "light" ? "gray.50" : "gray.700"}
                            shadow="sm"
                            rounded="lg"
                            border="1px solid"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                          >
                            <CardBody p={4}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={3}>
                                    <Badge
                                      colorScheme={
                                        parent.orgType === "DIRECTORATE" ? "red" :
                                        parent.orgType === "DIVISION" ? "green" : "blue"
                                      }
                                      rounded="full"
                                      px={3}
                                      py={1}
                                      fontSize="xs"
                                    >
                                      {parent.orgType}
                                    </Badge>
                                    <Text fontSize="sm" fontWeight="semibold">
                                      {parent.orgCode}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600">
                                    {parent.orgName}
                                  </Text>
                                  {parent.orgDesc && (
                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                      {parent.orgDesc}
                                    </Text>
                                  )}
                                </VStack>
                                <Text fontSize="xs" color="gray.400">
                                  Level {index + 1}
                                </Text>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Children Organizations */}
                  {OrgHierarchy.children.length > 0 && (
                    <Box mt={8}>
                      <Text fontSize="md" fontWeight="semibold" mb={4}>
                        Sub-Organizations (Bottom Structure) - {OrgHierarchy.children.length} organization(s)
                      </Text>
                      <VStack spacing={3} align="stretch">
                        {OrgHierarchy.children.map((child) => (
                          <Card
                            key={child.orgCode}
                            bg={colorMode === "light" ? "gray.50" : "gray.700"}
                            shadow="sm"
                            rounded="lg"
                            border="1px solid"
                            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                            cursor="pointer"
                            _hover={{
                              shadow: "md",
                              transform: "translateY(-2px)",
                            }}
                            transition="all 0.2s"
                            onClick={() => handleViewDetail(child)}
                          >
                            <CardBody p={4}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack spacing={3}>
                                    <Badge
                                      colorScheme={
                                        child.orgType === "DIVISION" ? "green" :
                                        child.orgType === "GROUP" ? "purple" : "blue"
                                      }
                                      rounded="full"
                                      px={3}
                                      py={1}
                                      fontSize="xs"
                                    >
                                      {child.orgType}
                                    </Badge>
                                    <Text fontSize="sm" fontWeight="semibold">
                                      {child.orgCode}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600">
                                    {child.orgName}
                                  </Text>
                                  {child.orgDesc && (
                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                      {child.orgDesc}
                                    </Text>
                                  )}
                                </VStack>
                                <HStack spacing={2}>
                                  <Text fontSize="xs" color="gray.400">
                                    Click to view
                                  </Text>
                                  <FiEye size={14} color="gray.400" />
                                </HStack>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
