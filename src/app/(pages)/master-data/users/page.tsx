"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  ControlTable,
  TableComponentFull,
} from "@/app/components/tableComponents";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  DEFAULT_PWD_SETTINGS,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { formatDateToDDMMYYYY } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useUsers, { UsersResponse, UserUpdateOrgGroupPayload } from "@/app/services/useUsers";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { Select } from "chakra-react-select";
import {
  ColumnMetaCustom,
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
  Avatar,
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
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
  Alert,
  AlertIcon,
  Code,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { FiEye, FiRefreshCw, FiUser, FiMail, FiPhone, FiUsers, FiEdit, FiKey, FiAlertTriangle } from "react-icons/fi";
import { useEffect, useMemo, useState, useRef } from "react";

export default function MasterDataUsersPage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { List: GetUsersList, UpdateOrgUser, EditUserPassword, isLoading } = useUsers();
  const { List: GetOrganizationList } = useOrganization();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data State
  const [Data, setData] = useState<UsersResponse[] | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [OrganizationData, setOrganizationData] = useState<OrganizationResponse[] | null>(null);

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
  const [SelectedUser, setSelectedUser] = useState<UsersResponse | null>(null);

  // Edit Org Modal
  const { isOpen: isEditOrgOpen, onOpen: onEditOrgOpen, onClose: onEditOrgClose } = useDisclosure();
  const [EditUser, setEditUser] = useState<UsersResponse | null>(null);
  const [SelectedOrgCode, setSelectedOrgCode] = useState<string>("");
  const [IsUpdating, setIsUpdating] = useState(false);

  // Reset Password Modal
  const { isOpen: isResetPwdOpen, onOpen: onResetPwdOpen, onClose: onResetPwdClose } = useDisclosure();
  const [ResetUser, setResetUser] = useState<UsersResponse | null>(null);
  const [ResetCountdown, setResetCountdown] = useState<number>(5);
  const [IsResettingPassword, setIsResettingPassword] = useState(false);
  const resetCountdownRef = useRef<NodeJS.Timeout | null>(null);

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
          const payload: PaggingListPayload = {
            search: globalFilter,
            limit: pageSize,
            page: pageIndex,
            filterWhere: FilterWhere,
            fieldOrder: ["nama"],
            orderDir: "asc",
          };

          const requestData = await GetUsersList(payload, tokenData);

          if (!requestData || requestData.statusCode !== RES_CODE_OK) {
            showToast({
              description: requestData?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            return;
          }

          const data = requestData.data as UsersResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number = totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          
          setData(data);
          setTotalPageData(totalPages);
        } catch (error) {
          console.error("Error fetching users:", error);
          showToast({
            description: "Failed to load users data",
            statusToast: "error",
          });
        } finally {
          setIsLoadingProcess(false);
        }
      }
    };

    fetchData();
  }, [tokenData, RefreshData, pageIndex, pageSize, globalFilter, FilterWhere]);

  // Fetch Organization Data
  useEffect(() => {
    const fetchOrgData = async () => {
      if (tokenData) {
        try {
          const payload: PaggingListPayload = {
            search: "",
            limit: 1000,
            page: 0,
            filterWhere: [{ field: "orgType", operator: "=", value: "GROUP" }],
            fieldOrder: ["orgName"],
            orderDir: "asc",
          };

          const requestData = await GetOrganizationList(payload, tokenData);
          if (requestData && requestData.statusCode === RES_CODE_OK) {
            setOrganizationData(requestData.data as OrganizationResponse[]);
          }
        } catch (error) {
          console.error("Error fetching organization data:", error);
        }
      }
    };

    fetchOrgData();
  }, [tokenData]);

  // Reset Password Countdown Effect
  useEffect(() => {
    if (isResetPwdOpen && ResetCountdown > 0) {
      resetCountdownRef.current = setTimeout(() => {
        setResetCountdown(prev => prev - 1);
      }, 1000);
    } else if (ResetCountdown === 0 && resetCountdownRef.current) {
      clearTimeout(resetCountdownRef.current);
    }

    return () => {
      if (resetCountdownRef.current) {
        clearTimeout(resetCountdownRef.current);
      }
    };
  }, [isResetPwdOpen, ResetCountdown]);

  // Table Columns
  const columns: ColumnDef<UsersResponse>[] = useMemo(
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
        accessorKey: "avatar",
        header: "Avatar",
        size: 80,
        cell: ({ row }) => (
          <Avatar
            size="sm"
            name={row.original.nama}
            src={row.original.profilePict || undefined}
            bg="blue.500"
          />
        ),
      },
      {
        accessorKey: "nama",
        header: "Name & User ID",
        size: 200,
        cell: ({ row }) => (
          <VStack align="start" spacing={0}>
            <Text fontWeight="semibold" fontSize="sm">
              {row.original.nama}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {row.original.userId}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
        cell: ({ row }) => (
          <Text fontSize="sm">{row.original.email}</Text>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        size: 120,
        cell: ({ row }) => (
          <Text fontSize="sm">{row.original.phoneNumber || "-"}</Text>
        ),
      },
      {
        accessorKey: "cabang",
        header: "Branch",
        size: 150,
        cell: ({ row }) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium">
              {row.original.kodeCabang || "-"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {row.original.namaCabang || "-"}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "unitKerja",
        header: "Work Unit",
        size: 150,
        cell: ({ row }) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium">
              {row.original.kodeUnitKerja || "-"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {row.original.namaUnitKerja || "-"}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "jabatan",
        header: "Position",
        size: 150,
        cell: ({ row }) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium">
              {row.original.kodeJabatan || "-"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {row.original.jabatan || "-"}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "groupKerja",
        header: "Work Group",
        size: 150,
        cell: ({ row }) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium">
              {row.original.kodeGroupKerja || "-"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {row.original.namaGroupKerja || "-"}
            </Text>
          </VStack>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => (
          <HStack spacing={1}>
            <IconButton
              aria-label="View Details"
              icon={<FiEye />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => handleViewDetail(row.original)}
            />
            <IconButton
              aria-label="Edit Organization"
              icon={<FiEdit />}
              size="sm"
              variant="ghost"
              colorScheme="orange"
              onClick={() => handleEditOrg(row.original)}
            />
            <IconButton
              aria-label="Reset Password"
              icon={<FiKey />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleResetPassword(row.original)}
            />
          </HStack>
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
  const handleViewDetail = (user: UsersResponse) => {
    setSelectedUser(user);
    onDetailOpen();
  };

  const handleEditOrg = (user: UsersResponse) => {
    setEditUser(user);
    setSelectedOrgCode(user.team?.teamCode || "");
    onEditOrgOpen();
  };

  const handleUpdateOrg = async () => {
    if (!EditUser || !SelectedOrgCode) {
      showToast({
        description: "Please select an organization",
        statusToast: "error",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const payload: UserUpdateOrgGroupPayload = {
        userSysId: EditUser.id,
        orgCode: SelectedOrgCode,
      };

      const requestData = await UpdateOrgUser(payload, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Organization updated successfully",
        statusToast: "success",
      });

      onEditOrgClose();
      setRefreshData(prev => prev + 1);
    } catch (error) {
      console.error("Error updating organization:", error);
      showToast({
        description: "Failed to update organization",
        statusToast: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination({ pageIndex: 0, pageSize });
  };

  const handlePageChange = (page: number) => {
    setPagination({ pageIndex: page, pageSize });
  };

  const handleResetPassword = (user: UsersResponse) => {
    setResetUser(user);
    setResetCountdown(5);
    onResetPwdOpen();
  };

  const handleConfirmResetPassword = async () => {
    if (!ResetUser) return;

    setIsResettingPassword(true);
    try {
      const response = await EditUserPassword(
        ResetUser.userId,
        DEFAULT_PWD_SETTINGS,
        DEFAULT_PWD_SETTINGS
      );

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: response?.message || "Failed to reset password",
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: `Password reset to default for ${ResetUser.nama}`,
        statusToast: "success",
      });

      onResetPwdClose();
      setRefreshData(prev => prev + 1);
    } catch (error) {
      showToast({
        description: "Error resetting password",
        statusToast: "error",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Header Props
  const headerProps: HeaderContentProps = {
    titleName: "Master Data Users",
    breadCrumb: ["Master Data", "Users"],
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
                Users Management
              </Heading>
              <HStack spacing={3}>
                <Box position="relative">
                  <Input
                    placeholder="Search users..."
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
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl">
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
                <FiUser size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  User Profile
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Detailed information and organization data
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            {SelectedUser && (
              <Box>
                {/* Profile Header */}
                <Box
                  bg={colorMode === "light" ? "gray.50" : "gray.700"}
                  px={8}
                  py={6}
                  borderBottom="1px solid"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                >
                  <Flex align="center" gap={6}>
                    <Box position="relative">
                      <Avatar
                        size="2xl"
                        name={SelectedUser.nama}
                        src={SelectedUser.profilePict || undefined}
                        bg="blue.500"
                        shadow="lg"
                        border="4px solid"
                        borderColor={colorMode === "light" ? "white" : "gray.600"}
                      />
                      <Box
                        position="absolute"
                        bottom={2}
                        right={2}
                        w={4}
                        h={4}
                        bg={SelectedUser.userStatus === "ACTIVE" ? "green.400" : "red.400"}
                        rounded="full"
                        border="2px solid white"
                      />
                    </Box>
                    <VStack align="start" spacing={2} flex={1}>
                      <Text fontSize="2xl" fontWeight="bold">
                        {SelectedUser.nama}
                      </Text>
                      <HStack spacing={3}>
                        <Badge
                          colorScheme="blue"
                          rounded="full"
                          px={3}
                          py={1}
                          fontSize="sm"
                        >
                          @{SelectedUser.userId}
                        </Badge>
                        <Badge
                          colorScheme={SelectedUser.userStatus === "ACTIVE" ? "green" : "red"}
                          rounded="full"
                          px={3}
                          py={1}
                          fontSize="sm"
                        >
                          {SelectedUser.userStatus === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </HStack>
                      {SelectedUser.team && (
                        <HStack spacing={2}>
                          <FiUsers size={16} />
                          <Text fontSize="sm" color="gray.500">
                            {SelectedUser.team.teamName}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Flex>
                </Box>

                {/* Information Grid */}
                <Box p={8}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                    {/* Contact Information */}
                    <GridItem>
                      <Card
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        shadow="sm"
                        rounded="xl"
                        border="1px solid"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <CardHeader pb={3}>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              bg="blue.50"
                              color="blue.500"
                              rounded="lg"
                            >
                              <FiMail size={16} />
                            </Box>
                            <Text fontSize="md" fontWeight="semibold">
                              Contact Information
                            </Text>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Email Address
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedUser.email}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Phone Number
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedUser.phoneNumber || "Not specified"}
                              </Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Organization Information */}
                    <GridItem>
                      <Card
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        shadow="sm"
                        rounded="xl"
                        border="1px solid"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <CardHeader pb={3}>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              bg="purple.50"
                              color="purple.500"
                              rounded="lg"
                            >
                              <FiUsers size={16} />
                            </Box>
                            <Text fontSize="md" fontWeight="semibold">
                              Organization
                            </Text>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Team
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedUser.team?.teamName || "Not assigned"}
                              </Text>
                            </Box>
                            {SelectedUser.teamRole && (
                              <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>
                                  Role
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {SelectedUser.teamRole.specName}
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>

                    {/* Work Details */}
                    <GridItem colSpan={2}>
                      <Card
                        bg={colorMode === "light" ? "white" : "gray.700"}
                        shadow="sm"
                        rounded="xl"
                        border="1px solid"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <CardHeader pb={3}>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              bg="green.50"
                              color="green.500"
                              rounded="lg"
                            >
                              <FiUser size={16} />
                            </Box>
                            <Text fontSize="md" fontWeight="semibold">
                              Work Details
                            </Text>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Branch
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedUser.kodeCabang || "-"}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {SelectedUser.namaCabang || "-"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Work Unit
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedUser.kodeUnitKerja || "-"}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {SelectedUser.namaUnitKerja || "-"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500" mb={1}>
                                Position
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {SelectedUser.kodeJabatan || "-"}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {SelectedUser.jabatan || "-"}
                              </Text>
                            </Box>
                          </Grid>
                          
                          {(SelectedUser.nrp || SelectedUser.nip) && (
                            <>
                              <Divider my={4} />
                              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                {SelectedUser.nrp && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                      NRP
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {SelectedUser.nrp}
                                    </Text>
                                  </Box>
                                )}
                                {SelectedUser.nip && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                      NIP
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {SelectedUser.nip}
                                    </Text>
                                  </Box>
                                )}
                              </Grid>
                            </>
                          )}
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Organization Modal */}
      <Modal isOpen={isEditOrgOpen} onClose={onEditOrgClose} size="md">
        <ModalOverlay />
        <ModalContent
          bg={colorMode === "light" ? "white" : "gray.800"}
          color={colorMode === "light" ? "gray.800" : "white"}
        >
          <ModalHeader>
            <HStack spacing={3}>
              <FiEdit />
              <Text>Edit User Organization</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {EditUser && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    User Information
                  </Text>
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={EditUser.nama}
                      src={EditUser.profilePict || undefined}
                      bg="blue.500"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="semibold">
                        {EditUser.nama}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {EditUser.userId}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Current Organization
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {EditUser.team?.teamName || "No organization assigned"}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Select New Organization
                  </Text>
                  <Select
                    placeholder="Select organization..."
                    value={
                      SelectedOrgCode
                        ? {
                            value: SelectedOrgCode,
                            label: OrganizationData?.find(org => org.orgCode === SelectedOrgCode)?.orgName || SelectedOrgCode
                          }
                        : null
                    }
                    onChange={(option: any) => setSelectedOrgCode(option?.value || "")}
                    options={
                      OrganizationData?.map(org => ({
                        value: org.orgCode,
                        label: `${org.orgCode} - ${org.orgName}`
                      })) || []
                    }
                    chakraStyles={{
                      control: (provided) => ({
                        ...provided,
                        bg: colorMode === "light" ? "white" : "gray.700",
                        borderColor: colorMode === "light" ? "gray.200" : "gray.600",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        bg: colorMode === "light" ? "white" : "gray.700",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused
                          ? colorMode === "light" ? "gray.100" : "gray.600"
                          : colorMode === "light" ? "white" : "gray.700",
                        color: colorMode === "light" ? "gray.800" : "white",
                      }),
                    }}
                  />
                </Box>

                <HStack spacing={3} justify="flex-end" pt={4}>
                  <Button
                    variant="ghost"
                    onClick={onEditOrgClose}
                    isDisabled={IsUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleUpdateOrg}
                    isLoading={IsUpdating}
                    loadingText="Updating..."
                  >
                    Update Organization
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetPwdOpen} onClose={onResetPwdClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader pb={2}>
            <HStack spacing={2}>
              <Box p={2} bg="red.50" color="red.500" rounded="lg">
                <FiAlertTriangle />
              </Box>
              <Text fontWeight={600}>Reset Password to Default</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              {/* Warning Alert */}
              <Alert status="warning" rounded="lg" bg="orange.50" border="1px solid" borderColor="orange.200">
                <AlertIcon color="orange.500" />
                <Box>
                  <Text fontWeight={600} fontSize="sm" color="orange.800" mb={1}>
                    ⚠️ Warning: Irreversible Action
                  </Text>
                  <Text fontSize="xs" color="orange.700">
                    This will reset the password to the default value. The user will need to change it after login.
                  </Text>
                </Box>
              </Alert>

              {/* User Information */}
              <Box p={4} bg="gray.50" rounded="lg" border="1px solid" borderColor="gray.200">
                <Text fontSize="xs" color="gray.600" mb={1}>User to Reset</Text>
                <Text fontWeight={600} fontSize="sm">{ResetUser?.nama}</Text>
                <Text fontSize="xs" color="gray.500">{ResetUser?.userId}</Text>
              </Box>

              {/* Countdown */}
              <Box textAlign="center" p={4} bg="red.50" rounded="lg" border="2px solid" borderColor="red.200">
                <Text fontSize="xs" color="gray.600" mb={2}>Action will be enabled in:</Text>
                <Text fontSize="3xl" fontWeight={700} color="red.500">
                  {ResetCountdown}
                </Text>
                <Text fontSize="xs" color="gray.600">seconds</Text>
              </Box>

              {/* Info Message */}
              <Box p={3} bg="blue.50" rounded="lg" border="1px solid" borderColor="blue.200">
                <Text fontSize="xs" color="blue.700">
                  ℹ️ Default password: <Code>{DEFAULT_PWD_SETTINGS}</Code>
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter pt={4}>
            <HStack spacing={3} w="full">
              <Button 
                variant="ghost" 
                onClick={onResetPwdClose}
                w="full"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmResetPassword}
                isLoading={IsResettingPassword}
                isDisabled={ResetCountdown > 0}
                w="full"
              >
                {ResetCountdown > 0 
                  ? `Wait ${ResetCountdown}s` 
                  : "Reset Password"}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}
