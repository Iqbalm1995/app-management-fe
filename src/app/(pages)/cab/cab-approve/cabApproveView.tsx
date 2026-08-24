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
  IconButton,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  FiEye,
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
        cell: (info) => (
          <Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="xs">
            {info.getValue() as string}
          </Badge>
        ),
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
      {/* Header Banner — Blue Scheme */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 5, md: 6 }}
        mx={{ base: 4, md: 6 }}
        mt={4}
        mb={5}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
        shadow="lg"
      >
        {/* BJB Pattern Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage="url('/img/currency-bg.png')"
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          opacity={0.4}
          pointerEvents="none"
          zIndex={1}
        />

        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <VStack align="start" spacing={1}>
              <Heading size="lg" fontWeight="bold" letterSpacing="-0.5px">
                CAB Approval
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.800">
                Tinjau dan setujui CAB Request yang memerlukan persetujuan Anda
              </Text>
            </VStack>

            <HStack spacing={3}>
              {/* Jira / SaaS style modern premium badge */}
              <HStack
                bg="whiteAlpha.200"
                backdropFilter="blur(12px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                px={3.5}
                py={2}
                rounded="full"
                spacing={2.5}
                shadow="sm"
              >
                <Box
                  w="8px"
                  h="8px"
                  rounded="full"
                  bg={DataList.length > 0 ? "orange.300" : "green.300"}
                  boxShadow={
                    DataList.length > 0
                      ? "0 0 8px rgba(251, 146, 60, 0.9)"
                      : "0 0 8px rgba(74, 222, 128, 0.9)"
                  }
                />
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="white"
                  letterSpacing="0.2px"
                >
                  Menunggu Persetujuan
                </Text>
                <Badge
                  bg="white"
                  color="secondary.700"
                  fontSize="xs"
                  fontWeight="extrabold"
                  px={2}
                  py={0.5}
                  rounded="full"
                  minW="22px"
                  textAlign="center"
                  boxShadow="xs"
                >
                  {DataList.length}
                </Badge>
              </HStack>

              <Tooltip label="Refresh data" placement="bottom" hasArrow>
                <IconButton
                  aria-label="Refresh data"
                  icon={<FiRefreshCcw />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  rounded="full"
                  onClick={() => setRefreshData((p) => p + 1)}
                  isLoading={IsLoadingProcess}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* Table Card */}
      <Box px={{ base: 4, md: 6 }} pb={6}>
        <Card
          rounded={radiusStyle}
          shadow="sm"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
          w="full"
          minH="300px"
        >
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={4} w="full">
              <Flex justify="space-between" align="center" w="full">
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                    Daftar Permohonan Menunggu Persetujuan
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    Total {DataList.length} request dalam antrean persetujuan CAB
                  </Text>
                </VStack>
              </Flex>

              <Divider />

              {IsLoadingProcess ? (
                <Flex justify="center" py={16}>
                  <LoadingMiniSignature />
                </Flex>
              ) : DataList.length === 0 ? (
                <VStack spacing={4} py={16}>
                  <Box
                    w={16}
                    h={16}
                    bg={colorMode === "light" ? "gray.100" : "gray.700"}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiFolder} boxSize={8} color="gray.400" />
                  </Box>
                  <VStack spacing={1}>
                    <Heading size="sm" color="gray.500">
                      Tidak Ada Permohonan Menunggu
                    </Heading>
                    <Text color="gray.400" fontSize="xs">
                      Seluruh permohonan CAB telah ditinjau dan diproses.
                    </Text>
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
