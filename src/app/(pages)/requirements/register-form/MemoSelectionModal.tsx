"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  HStack,
  VStack,
  Stack,
  Text,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  PopoverHeader,
  PopoverFooter,
  Wrap,
} from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { FiFilter, FiX, FiRefreshCcw, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  MAX_SIZE_TABLE,
  GROUP_CONST_BRD_STATUS,
} from "@/app/constants/applicationConstants";
import {
  REQUIREMENT_STATUS_OPTIONS,
} from "@/app/constants/masterStatusConstants";
import {
  addParamFilterUpdate,
  removeParamFilter,
  ColumnMetaCustom,
  ListSearchByParam,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import { RequirementsResponse } from "@/app/services/useRequirements";
import useRequirements from "@/app/services/useRequirements";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import LabelMaster from "@/app/components/labelMasterProps";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { ControlTable } from "@/app/components/tableComponents";

interface MemoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (memo: RequirementsResponse) => void;
  tokenData: string;
}

const ORG_CATEGORY_KEY_DIVISION = "DIVISION";

export default function MemoSelectionModal({
  isOpen,
  onClose,
  onSelect,
  tokenData,
}: MemoSelectionModalProps) {
  const { List } = useRequirements();
  const { List: ListOrganization } = useOrganization();
  const showToast = useToastHelper();

  // State
  const [DataMemo, setDataMemo] = useState<RequirementsResponse[]>([]);
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Load division options
  const GetDataDivision = async (
    searchValue: string = "",
    limit: number = MAX_SIZE_TABLE
  ): Promise<OrganizationResponse[]> => {
    setIsLoadingDivisionSelect(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [
        {
          field: "orgType",
          operator: "=",
          value: ORG_CATEGORY_KEY_DIVISION,
        },
      ],
      fieldOrder: ["orgName"],
      orderDir: "asc",
    };
    const requestData = await ListOrganization(PayloadList, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingDivisionSelect(false);
      return [];
    }

    if (requestData.data == null) {
      showToast({
        description: "Data return error",
        statusToast: "error",
      });
      setIsLoadingDivisionSelect(false);
      return [];
    }

    const itemsData: OrganizationResponse[] =
      requestData.data as OrganizationResponse[];
    const mapOptionData: OptionListProps[] = itemsData.map((d) => ({
      label: `${d.orgName}`,
      value: d.id,
    }));
    setOptionDivision(mapOptionData);
    setIsLoadingDivisionSelect(false);

    return itemsData;
  };

  // Load division data on mount
  useEffect(() => {
    if (isOpen && OptionDivision.length === 0) {
      GetDataDivision("", MAX_SIZE_TABLE);
    }
  }, [isOpen]);

  // Fetch memos with filters
  useEffect(() => {
    if (!isOpen) return;

    // Build filter: only approved memos with memo status = "Y"
    const filterWithType: ListSearchByParamProps[] = [
      {
        field: "reqStatus",
        operator: "=",
        value: "APPROVED",
        filterLabel: "Status",
      },
      {
        field: "isHaveMemo",
        operator: "=",
        value: "Y",
        filterLabel: "Memo Status",
      },
      ...ParamFilter,
    ];

    const PayloadList: PaggingListPayload = {
      search: globalFilter,
      limit: pageSize,
      page: pageIndex,
      filterWhere: filterWithType,
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    setIsLoadingProcess(true);
    const GetDataList = async () => {
      const requestData = await List(PayloadList, tokenData);
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      const itemsData: RequirementsResponse[] =
        requestData.data as RequirementsResponse[];
      const totalData: number = requestData.countTotal as number;
      const totalPages: number =
        totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
      setDataMemo(itemsData);
      setTotalPageData(totalPages);
      setIsLoadingProcess(false);
    };
    GetDataList();
  }, [isOpen, pageIndex, pageSize, globalFilter, ParamFilter, tokenData]);

  // Filter handlers
  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );
    setParamFilter(updatedFilters);
  };

  const addFilterData = (data: ListSearchByParamProps) => {
    const filterWhereData: ListSearchByParamProps[] = addParamFilterUpdate(
      ParamFilter,
      data
    );
    setParamFilter(filterWhereData);
  };

  const removeFilterData = (data: ListSearchByParamProps) => {
    const filterWhereData: ListSearchByParamProps[] = removeParamFilter(
      ParamFilter,
      data
    );
    setParamFilter(filterWhereData);
  };

  const RefreshAction = () => {
    setParamFilter([]);
    setGlobalFilter("");
    setPagination({ pageIndex: 0, pageSize: 5 });
  };

  // Table columns
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
          <Flex w={"full"} justifyContent={"center"} alignItems={"start"}>
            <Text fontWeight={600}>{info.row.original.reqNumber}</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Nomor Memo</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqNumber",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nomor Memo",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqNarative,
        id: "reqNarative",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"} alignItems={"start"}>
            <Text>{info.row.original.reqNarative}</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Perihal</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqNarative",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Perihal",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.senderDivisionName,
        id: "senderDivisionName",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"} alignItems={"start"}>
            <Text>{info.row.original.senderDivisionName}</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Divisi Pengirim</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "senderDivisionId",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Divisi Pengirim",
              sourceListData: OptionDivision,
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqStatus,
        id: "reqStatus",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"} alignItems={"start"}>
            {info.row.original.reqStatus ? (
              <LabelMaster
                groupLabel={GROUP_CONST_BRD_STATUS}
                labelName={info.row.original.reqStatus}
              />
            ) : (
              "-"
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Status</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqStatus",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Status",
              sourceListData: REQUIREMENT_STATUS_OPTIONS,
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "actions",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"}>
            <Button
              size="xs"
              colorScheme="blue"
              onClick={() => onSelect(info.row.original)}
            >
              Pilih
            </Button>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Aksi</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [pageIndex, pageSize, OptionDivision]
  );

  // Table setup
  const table = useReactTable({
    data: DataMemo,
    columns: columnsData,
    pageCount: totalPages ?? 1,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader pb={2}>
          <Text fontWeight={600}>Pilih Memo Pengantar</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <Flex as={Stack} w={"full"} spacing={3}>
            {/* Filter Controls */}
            <Flex as={Wrap} justifyContent={"end"} alignItems={"center"} gap={2} w={"full"}>
              <Popover
                isOpen={isFilterPopoverOpen}
                onOpen={() => setIsFilterPopoverOpen(true)}
                onClose={() => setIsFilterPopoverOpen(false)}
                closeOnBlur={true}
                placement={"bottom"}
              >
                <PopoverTrigger>
                  <Button size={"md"} leftIcon={<FiFilter />}>
                    Filter{" "}
                    <Flex
                      as={"span"}
                      pl={1}
                      display={ParamFilter.length > 0 ? "flex" : "none"}
                      color={"secondary.500"}
                      fontWeight={600}
                    >
                      ({ParamFilter.length})
                    </Flex>
                  </Button>
                </PopoverTrigger>
                <PopoverContent width="auto" minW="xs">
                  <PopoverBody>
                    <Flex as={Stack} w={"full"}>
                      <Text fontWeight={600}>Filter Data</Text>
                      <Divider />

                      <Stack spacing={2}>
                        {ParamFilter.map((dt, idx) => (
                          <Flex
                            key={idx}
                            w={"full"}
                            alignItems="center"
                            as={HStack}
                            spacing={2}
                          >
                            <Text>
                              {dt.filterLabel} :{" "}
                              <Text as={"span"} fontWeight={600}>
                                {dt.field === "senderDivisionId"
                                  ? OptionDivision.find(
                                      (opt) => opt.value === dt.value
                                    )?.label || dt.value
                                  : dt.value}
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
                        ))}
                      </Stack>
                      {ParamFilter.length > 0 && (
                        <>
                          <Divider />
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => {
                              setParamFilter([]);
                              setIsFilterPopoverOpen(false);
                            }}
                            w="full"
                          >
                            Clear All
                          </Button>
                        </>
                      )}
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              <Button
                size={"md"}
                leftIcon={<FiRefreshCcw />}
                onClick={() => RefreshAction()}
              >
                Refresh
              </Button>
            </Flex>

            {/* Table */}
            {IsLoadingProcess ? (
              <LoadingMiniSignature />
            ) : (
              <Box overflowX="auto" w="full">
                <Box minW="1200px">
                  <TableComponentWithFilterCTX
                    table={table}
                    handleFilterChange={handleFilterChange}
                  />
                </Box>
              </Box>
            )}

            {/* Pagination */}
            <Flex as={HStack} justifyContent={"space-between"} w={"full"}>
              <Text fontSize={"sm"} color={"gray.600"}>
                Page {pageIndex + 1} of {totalPages > 0 ? totalPages : 1}
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FiChevronLeft />}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.max(0, prev.pageIndex - 1),
                    }))
                  }
                  isDisabled={pageIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  rightIcon={<FiChevronRight />}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.min(
                        totalPages - 1,
                        prev.pageIndex + 1
                      ),
                    }))
                  }
                  isDisabled={pageIndex >= totalPages - 1}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter pt={4}>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
