"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  ButtonGroup,
  Flex,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  Divider,
  Badge,
  useColorMode,
} from "@chakra-ui/react";
import {
  ColumnDef,
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from "@tanstack/react-table";
import { FiFilter, FiRefreshCcw, FiX, FiInfo } from "react-icons/fi";
import Link from "next/link";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { ColumnMetaCustom, PaggingListPayload } from "@/app/types/masterTypes";

const HeaderDataContent = {
  titleName: "Pending Approve",
  breadCrumb: ["Home", "Requirements", "Approval Center"],
};

export default function ApprovalHubView() {
  const { colorMode } = useColorMode();

  const showToast = useToastHelper();
  const { List } = useRequirements();
  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [RefreshData, setRefreshData] = useState<number>(0);

  // Data State
  const [DataApprovals, setDataApprovals] = useState<RequirementsResponse[]>([]);
  const [totalPages, setTotalPageData] = useState<number>(0);

  // Pagination
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

  // View Mode State
  const [viewMode, setViewMode] = useState<"PENDING" | "APPROVED">("PENDING");

  // Filter State
  const [ParamFilter, setParamFilter] = useState<RequirementsResponse[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const RefreshAction = () => {
    setParamFilter([]);
    setRefreshData(RefreshData + 1);
  };

  const removeFilterData = (filter: any) => {
    setParamFilter(ParamFilter.filter(f => f !== filter));
  };

  const handleFilterChange = (newFilters: any[]) => {
    setParamFilter(newFilters);
  };

  // Table Columns
  const columnsData = useMemo<ColumnDef<RequirementsResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text>{pageIndex * pageSize + info.row.index + 1}.</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqNumber,
        id: "reqNumber",
        cell: (info) => (
          <Flex w={"full"} as={Stack} spacing={1}>
            <Text fontWeight={600}>{info.row.original.reqNumber || "-"}</Text>
            <Text fontSize="sm">{info.row.original.reqNarative || "-"}</Text>
          </Flex>
        ),
        header: () => <span>Requirement</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqNumber",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Req Number",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        cell: (info) => (
          <Flex justifyContent={"center"}>
            <Badge
              colorScheme={
                info.row.original.status === "APPROVED"
                  ? "green"
                  : info.row.original.status === "PENDING"
                    ? "orange"
                    : "gray"
              }
              rounded="full"
              px={3}
              py={1}
            >
              {info.row.original.status || "N/A"}
            </Badge>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Status</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "actions",
        cell: (info) => (
          <Flex justifyContent={"center"}>
            <Link href={`/requirements/detail?reqId=${info.row.original.id}`}>
              <Button leftIcon={<FiInfo />} colorScheme="blue" size="xs">
                Detail
              </Button>
            </Link>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Actions</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [pageIndex, pageSize, colorMode]
  );

  // Table Instance
  const table = useReactTable({
    data: DataApprovals,
    columns: columnsData,
    pageCount: totalPages ?? 1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Box px={4}>
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
            <Card
              w={"full"}
              rounded={radiusStyle}
              bgColor={colorMode === "light" ? "white" : "gray.800"}
            >
              <CardHeader pb={2}>
                <Heading as="h5" size="md" w={"full"}>
                  Approval Data
                </Heading>
              </CardHeader>
              <CardBody pt={2}>
                <Flex w={"full"} as={Stack} spacing={2}>
                  {/* FILTER DATA */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                    <GridItem
                      colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                      w={"full"}
                    >
                      <HStack spacing={2}>
                        <HStack
                          spacing={1}
                          bg={colorMode === "light" ? "gray.100" : "gray.700"}
                          rounded="lg"
                          p={1}
                          w="fit-content"
                        >
                          <Popover closeOnBlur={false} placement={"bottom"}>
                            <PopoverTrigger>
                              <Button size={"md"} leftIcon={<FiFilter />}>
                                Filter{" "}
                                <Flex
                                  as={"span"}
                                  pl={1}
                                  display={
                                    ParamFilter.length > 0 ? "flex" : "none"
                                  }
                                  color={"secondary.500"}
                                  fontWeight={600}
                                >
                                  ({ParamFilter.length})
                                </Flex>
                              </Button>
                            </PopoverTrigger>
                            <Portal>
                              <PopoverContent width="auto" minW="xs">
                                <PopoverBody>
                                  <Flex as={Stack} w={"full"}>
                                    <Text fontWeight={600}>Filter Data</Text>
                                    <Divider />
                                    <Stack spacing={2}>
                                      {ParamFilter.length === 0 ? (
                                        <Text fontSize="sm" color="gray.500">
                                          No active filters
                                        </Text>
                                      ) : (
                                        ParamFilter.map((dt, idx) => (
                                          <Flex
                                            key={idx}
                                            w={"full"}
                                            alignItems="center"
                                            as={HStack}
                                            spacing={2}
                                          >
                                            <Text>
                                              {dt.filterLabel}:{" "}
                                              <Text as={"span"} fontWeight={600}>
                                                {dt.value}
                                              </Text>
                                            </Text>
                                            <Button
                                              size={"xs"}
                                              colorScheme={"red"}
                                              justifyContent={"center"}
                                              variant={"ghost"}
                                              onClick={() => removeFilterData(dt)}
                                            >
                                              <FiX />
                                            </Button>
                                          </Flex>
                                        ))
                                      )}
                                    </Stack>
                                  </Flex>
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          </Popover>
                        </HStack>
                        {/* <ButtonGroup size="sm" isAttached variant="outline">
                          <Button
                            colorScheme={viewMode === "PENDING" ? "blue" : "gray"}
                            variant={viewMode === "PENDING" ? "solid" : "outline"}
                            onClick={() => setViewMode("PENDING")}
                          >
                            Pending
                          </Button>
                          <Button
                            colorScheme={viewMode === "APPROVED" ? "blue" : "gray"}
                            variant={viewMode === "APPROVED" ? "solid" : "outline"}
                            onClick={() => setViewMode("APPROVED")}
                          >
                            Approved
                          </Button>
                        </ButtonGroup> */}
                      </HStack>
                    </GridItem>
                    <GridItem
                      colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                      w={"full"}
                    >
                      <Flex justifyContent={"end"} w={"full"}>
                        <Button
                          leftIcon={<FiRefreshCcw />}
                          colorScheme="gray"
                          size="md"
                          onClick={RefreshAction}
                        >
                          Refresh
                        </Button>
                      </Flex>
                    </GridItem>
                  </Grid>

                  {/* TABLE SECTION */}
                  <Box w={"full"} overflowX="auto">
                    {IsLoadingProcess ? (
                      <Box
                        w={"full"}
                        minH={"400px"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <LoadingMiniSignature />
                      </Box>
                    ) : (
                      <TableComponentWithFilterCTX
                        table={table}
                        handleFilterChange={handleFilterChange}
                      />
                    )}
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}
