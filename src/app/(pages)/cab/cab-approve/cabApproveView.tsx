"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiFolder,
  FiRefreshCcw,
} from "react-icons/fi";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import { StatusBadge } from "@/app/components/StatusBadge";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useCabRequest from "@/app/services/useCabRequest";
import { CabRequestItem } from "@/app/types/cabTypes";

const CabApproveView = () => {
  useDocumentTitle("CAB Approval Inbox");
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { GetPendingApprovals, loading } = useCabRequest();

  // Auth
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data
  const [DataList, setDataList] = useState<CabRequestItem[]>([]);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [RefreshData, setRefreshData] = useState<number>(0);

  // Pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

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

  useEffect(() => {
    if (!DataAuth || !tokenData) return;
    loadData();
  }, [DataAuth, tokenData, RefreshData]);

  const loadData = async () => {
    setIsLoadingProcess(true);
    const res = await GetPendingApprovals(tokenData);
    if (res) setDataList(res.data);
    setIsLoadingProcess(false);
  };

  // Stats
  const scheduledCount = DataList.filter((r) => r.scheduledDate !== null).length;

  // Table columns
  const columns = useMemo<ColumnDef<CabRequestItem>[]>(
    () => [
      {
        id: "rowNumber",
        header: "No.",
        cell: (info) => <Text fontSize="sm" textAlign="center">{info.row.index + 1}.</Text>,
      },
      {
        accessorKey: "requestNo",
        header: "Request No",
        cell: (info) => <Text fontSize="sm" fontWeight="semibold" color="secondary.600">{info.getValue() as string}</Text>,
      },
      {
        accessorKey: "requestTitle",
        header: "Title",
        cell: (info) => (
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{info.getValue() as string}</Text>
            <Text fontSize="xs" color="gray.500">{info.row.original.projectName}</Text>
          </VStack>
        ),
      },
      {
        accessorKey: "requestType",
        header: "Type",
        cell: (info) => <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="xs">{info.getValue() as string}</Badge>,
      },
      {
        accessorKey: "scheduledDate",
        header: "Scheduled",
        cell: (info) => {
          const val = info.getValue() as string | null;
          return val ? <Text fontSize="sm">{new Date(val).toLocaleString("id-ID")}</Text> : <Text fontSize="xs" color="gray.400">—</Text>;
        },
      },
      {
        accessorKey: "requesterName",
        header: "Requester",
        cell: (info) => <Text fontSize="sm">{info.getValue() as string}</Text>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue() as string} rounded="full" px={3} py={1} fontSize="xs" />,
      },
      {
        id: "actions",
        header: "Action",
        cell: (info) => (
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiEye />}
            onClick={() => router.push(`/cab/cab-request/detail?id=${info.row.original.id}`)}
          >
            Detail
          </Button>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: DataList,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <LayoutAdmin>
      <Box p={{ base: 4, md: 6 }}>
        <HeaderContent
          titleName="Persetujuan CAB"
          subtitle="Tinjau dan setujui CAB Request yang memerlukan persetujuan Anda"
          breadCrumb={["CAB", "Persetujuan CAB"]}
        />

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={5}>
          <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} p={4}>
            <HStack spacing={3}>
              <Box w={10} h={10} bg="orange.100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiClock} color="orange.600" boxSize={5} />
              </Box>
              <VStack spacing={0} align="start">
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">{DataList.length}</Text>
                <Text fontSize="xs" color="gray.500">Pending Approval</Text>
              </VStack>
            </HStack>
          </Card>
          <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} p={4}>
            <HStack spacing={3}>
              <Box w={10} h={10} bg="purple.100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiCalendar} color="purple.600" boxSize={5} />
              </Box>
              <VStack spacing={0} align="start">
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">{scheduledCount}</Text>
                <Text fontSize="xs" color="gray.500">Scheduled</Text>
              </VStack>
            </HStack>
          </Card>
          <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} p={4}>
            <HStack spacing={3}>
              <Box w={10} h={10} bg="blue.100" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FiFileText} color="blue.600" boxSize={5} />
              </Box>
              <VStack spacing={0} align="start">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">{DataList.length > 0 ? DataList[DataList.length - 1].requestNo : "—"}</Text>
                <Text fontSize="xs" color="gray.500">Oldest Pending</Text>
              </VStack>
            </HStack>
          </Card>
        </SimpleGrid>

        {/* Table Card */}
        <Card rounded={radiusStyle} shadow="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} bg={colorMode === "light" ? "white" : "gray.800"} w="full" minH="300px">
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={5} w="full">
              <Flex justify="space-between" align="center" w="full">
                <HStack spacing={3}>
                  <Box w={10} h={10} bg="orange.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                    <Icon as={FiCheckCircle} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>Approval Queue</Heading>
                    <Text fontSize="sm" color="gray.500">{DataList.length} requests awaiting your approval</Text>
                  </VStack>
                </HStack>
                <Button size="sm" leftIcon={<FiRefreshCcw />} onClick={() => setRefreshData((p) => p + 1)} isLoading={IsLoadingProcess}>
                  Refresh
                </Button>
              </Flex>

              <Divider />

              {IsLoadingProcess ? (
                <Flex justify="center" py={16}><LoadingMiniSignature /></Flex>
              ) : DataList.length === 0 ? (
                <VStack spacing={6} py={20}>
                  <Box w={20} h={20} bg={colorMode === "light" ? "gray.100" : "gray.700"} rounded="full" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiFolder} boxSize={10} color="gray.400" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color="gray.500">No Pending Approvals</Heading>
                    <Text color="gray.400" fontSize="sm">All clear! No requests waiting for approval.</Text>
                  </VStack>
                </VStack>
              ) : (
                <Box w="full" overflowX="auto">
                  <Box minW="1000px">
                    <TableComponentFull table={table} />
                  </Box>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
};

export default CabApproveView;
