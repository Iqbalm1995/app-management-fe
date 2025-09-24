"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { ControlTable } from "@/app/components/tableComponents";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import {
  ListSearchByParamProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Select,
  Stack,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlusSquare, FiRefreshCcw } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Master Data Aplikasi`,
  breadCrumb: ["Home", "Master Data", "Aplikasi"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

function MasterDataAplikasiPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Services
  const { List: ListApps, isLoading } = useApps();

  // Data state
  const [DataAplikasi, setDataAplikasi] = useState<ApplicationMasterResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Memoized values
  const delay = useCallback(
    (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Auth setup effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, []);

  // Function Data Load Services Aplikasi
  const GetDataAplikasi = async (
    searchValue: string = "",
    pageIdx: number = 0,
    limit: number = 9
  ): Promise<ApplicationMasterResponse[]> => {
    setIsLoadingProcess(true);
    
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: pageIdx,
      filterWhere: [],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    // Add status filter if not "all"
    if (selectedStatus !== "all") {
      PayloadList.filterWhere?.push({
        field: "appsStatus",
        operator: "=",
        value: selectedStatus,
      });
    }

    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListApps(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      return [];
    } else {
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return [];
      }

      const itemsData: ApplicationMasterResponse[] =
        requestData.data as ApplicationMasterResponse[];

      setDataAplikasi(itemsData);
      setIsLoadingProcess(false);

      return itemsData;
    }
  };

  // Data fetching effect
  useEffect(() => {
    if (DataAuth && tokenData) {
      GetDataAplikasi(globalFilter, pageIndex, pageSize);
    }
  }, [DataAuth, tokenData, RefreshData, pageIndex, pageSize, selectedStatus, globalFilter]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  // Clear filters
  const clearFilters = useCallback(() => {
    setGlobalFilter("");
    setSelectedStatus("all");
    setPagination({ pageIndex: 0, pageSize });
  }, [pageSize]);

  // Table setup for pagination
  const table = useReactTable({
    data: DataAplikasi,
    columns: [], // We're using grid view, so no columns needed
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
    pageCount: Math.ceil(totalPages / pageSize),
  });

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <VStack spacing={5} alignItems={"start"} w={"full"} pt={5}>
        {/* Action Bar */}
        <Grid templateColumns="repeat(12, 1fr)" gap={2} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <Flex justifyContent={"start"} px={0} w={"full"}>
              <Stack
                direction={["column", "row"]}
                spacing={2}
                w={"full"}
                justifyContent={"start"}
              >
                <Select
                  value={selectedStatus}
                  size={"md"}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPagination({ pageIndex: 0, pageSize });
                  }}
                  minW={"200px"}
                  maxW={"250px"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                >
                  <option value="all">Semua Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </Stack>
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <Flex justifyContent={"end"} px={0} w={"full"}>
              <Stack
                direction={["column", "row"]}
                spacing={2}
                w={"full"}
                justifyContent={"end"}
              >
                <Button
                  colorScheme={"secondary"}
                  leftIcon={<FiPlusSquare />}
                  size={"md"}
                  isLoading={ActionLoading}
                  onClick={() => {
                    // Add new aplikasi functionality here
                  }}
                >
                  Tambah Aplikasi
                </Button>
                <Button
                  size={"sm"}
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => {
                    RefreshAction();
                  }}
                >
                  Muat Ulang
                </Button>
              </Stack>
            </Flex>
          </GridItem>
        </Grid>
        
        {/* DATA RENDER */}
        {IsLoadingProcess ? <LoadingMiniSignature /> : <></>}
        
        {/* Grid View */}
        <Grid templateColumns="repeat(3, 1fr)" gap={5} w={"full"}>
          {DataAplikasi.map((dt, idx) => (
            <GridItem
              colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
              w={"full"}
              key={dt.id}
            >
              <MotionCardBody
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <Card
                  w="full"
                  shadow="lg"
                  rounded="2xl"
                  overflow="hidden"
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "gray.200" : "gray.600"
                  }
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translateY(-8px)",
                    shadow: "2xl",
                    borderColor: "secondary.400",
                  }}
                >
                  <CardHeader
                    bg="secondary.500"
                    color="white"
                    p={6}
                    h={"140px"}
                  >
                    <VStack spacing={3} align="start">
                      <HStack justify="space-between" w="full">
                        <Badge
                          colorScheme={dt.appsStatus === "ACTIVE" ? "green" : "red"}
                          variant="solid"
                          fontSize="xs"
                        >
                          {dt.appsStatus}
                        </Badge>
                        <Text
                          fontSize="xs"
                          bg="whiteAlpha.200"
                          px={2}
                          py={1}
                          rounded="full"
                          fontFamily="mono"
                        >
                          #{dt.appCode}
                        </Text>
                      </HStack>
                      <Heading size="md" fontWeight="700" noOfLines={2}>
                        {dt.appName}
                      </Heading>
                    </VStack>
                  </CardHeader>

                  <CardBody p={6}>
                    <Stack spacing={4} h={"140px"}>
                      {dt.iconApps && (
                        <Image
                          src={dt.iconApps}
                          alt={dt.appName}
                          w="50px"
                          h="50px"
                          rounded="lg"
                          objectFit="cover"
                        />
                      )}
                      
                      <Text
                        fontSize="sm"
                        color={
                          colorMode === "light" ? "gray.600" : "gray.400"
                        }
                        noOfLines={3}
                      >
                        {dt.appsDesc || "No description available"}
                      </Text>

                      <HStack justify="space-between" mt="auto">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.500">
                            Projects: {dt.countProjectAll || 0}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Completed: {dt.countProjectCompleted || 0}
                          </Text>
                        </VStack>

                        <Button
                          size="sm"
                          colorScheme="secondary"
                          variant="outline"
                          onClick={() => {
                            // Detail functionality here
                          }}
                        >
                          Detail
                        </Button>
                      </HStack>
                    </Stack>
                  </CardBody>
                </Card>
              </MotionCardBody>
            </GridItem>
          ))}
        </Grid>

        {/* Pagination Controls */}
        {DataAplikasi.length > 0 && (
          <Flex w="full" px={0} mt={6}>
            <ControlTable table={table} />
          </Flex>
        )}

        {/* Empty State */}
        {!IsLoadingProcess && DataAplikasi.length === 0 && (
          <Flex
            w="full"
            h="200px"
            justify="center"
            align="center"
            direction="column"
            color="gray.500"
          >
            <Text fontSize="lg" fontWeight="medium">
              No applications found
            </Text>
            <Text fontSize="sm">
              Try adjusting your filters or add a new application
            </Text>
          </Flex>
        )}
      </VStack>
    </LayoutAdmin>
  );
}

export default MasterDataAplikasiPage;
