"use client";

import { useEffect, useState, useMemo, memo, useCallback } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useRequirements, { RequirementsResponse } from "@/app/services/useRequirements";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { stringToDateFormatedReverse } from "@/app/helper/MasterHelper";
import LabelMaster from "@/app/components/labelMasterProps";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import {
  DELAY_MEDIUM,
  GROUP_CONST_BRD_STATUS,
  MAX_SIZE_TABLE,
  REQ_STATUS_LIST_OPTION,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import {
  addParamFilter,
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
  removeParamFilter,
} from "@/app/types/masterTypes";
import { FiArrowRightCircle, FiFilter, FiX } from "react-icons/fi";
import Link from "next/link";

const brdFilter: ListSearchByParamProps = {
  field: "requirementType",
  operator: "=",
  value: "BRD",
  filterLabel: "Tipe",
};

const ModalRegisterProject = memo(() => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { ListUnregistProject: ListReq } = useRequirements();
  const { List: ListOrganization } = useOrganization();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [DataReq, setDataReq] = useState<RequirementsResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Division Option setup
  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const [SelectedTypeReq, setSelectedTypeReq] = useState<string>("BRD");

  const delay = useCallback((ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms)), []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

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
  }, []); // Empty dependency array - run only once

  const GetDataDivision = useCallback(async (
    searchValue: string = "",
    limit: number = 1
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
          value: "DIVISION",
        },
      ],
      fieldOrder: ["orgName"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListOrganization(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingDivisionSelect(false);
      return [];
    } else {
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
    }
  }, []);

  const LoadDataDivision = useCallback(async () => {
    if (OptionDivision.length <= 0) {
      await GetDataDivision("", MAX_SIZE_TABLE);
    }
  }, [OptionDivision.length]);

  const handleFilterChange = useCallback((newFilters: ListSearchByParamProps[]) => {
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );
    setParamFilter(updatedFilters);
  }, [ParamFilter]);

  const addFilterData = useCallback((data: ListSearchByParamProps) => {
    const filterWhereData: ListSearchByParamProps[] = addParamFilterUpdate(
      ParamFilter,
      data
    );
    setParamFilter(filterWhereData);
  }, [ParamFilter]);

  const removeFilterData = useCallback((data: ListSearchByParamProps) => {
    const filterWhereData: ListSearchByParamProps[] = removeParamFilter(
      ParamFilter,
      data
    );
    setParamFilter(filterWhereData);
  }, [ParamFilter]);

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
        accessorFn: (row) => row.reqNarative,
        id: "reqNarative",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={2}>
              <Flex as={Stack} spacing={0}>
                <Text fontWeight={600}>{info.row.original.reqNumber}</Text>
                <Text>{info.row.original.reqNarative}</Text>
              </Flex>
              <Flex as={Stack} spacing={0}>
                <Text>Divisi Pengirim :</Text>
                <Text fontWeight={600}>
                  {info.row.original.senderDivisionName}
                </Text>
              </Flex>
              <Flex pt={2}>
                {info.row.original.isCarryOver == "Y" && (
                  <Text
                    bg="yellow.400"
                    color="black"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    CARRYOVER
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Perihal</span>,
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
        accessorFn: (row) => row.reqInititateDate,
        id: "reqInititateDate",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Memo Dibuat :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqInititateDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqInititateDate
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Memo Diterima :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqAcceptedDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqAcceptedDate
                    )
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Tanggal</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqInititateDate",
              operator: ">=",
              value: "",
              filterType: "date",
              filterLabel: "Tgl. Awal Memo Dibuat",
            },
            {
              field: "reqInititateDate",
              operator: "<=",
              value: "",
              filterType: "date",
              filterLabel: "Tgl. Akhir Memo Dibuat",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.assignedFromName,
        id: "assigned",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"} as={Stack} spacing={1}>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Oleh :</Text>
              <Text fontWeight={600} fontSize={"smaller"}>
                {info.row.original.assignedFromName}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Ke :</Text>
              {info.row.original.approvalDatas.map((x, idx) => (
                <Text fontWeight={600} key={idx} fontSize={"smaller"}>
                  {idx + 1}. {x.approverUserFirstName}{" "}
                  {x.approverUserLastnameName}
                </Text>
              ))}
            </Flex>
          </Flex>
        ),
        header: () => <span>Penugasan</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "assignedFromName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Ditugaskan Oleh",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.appInitialName,
        id: "appInitialName",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={2}>
              <Flex as={Stack} spacing={0}>
                <Text fontWeight={600}>
                  ({info.row.original.appInitialCode})
                </Text>
                <Text fontWeight={600}>{info.row.original.appInitialName}</Text>
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Aplikasi</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "appInitialCode",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Inisial Aplikasi",
            },
            {
              field: "appInitialName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Aplikasi",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqStatus,
        id: "reqStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={1}>
              {info.row.original.reqStatus ? (
                <LabelMaster
                  groupLabel={GROUP_CONST_BRD_STATUS}
                  labelName={info.row.original.reqStatus}
                />
              ) : (
                "-"
              )}
            </Flex>
            <Text>
              Next Step :
              <Text as="span" fontWeight="bold" pl={1}>
                {info.row.original.nextStep}
              </Text>
            </Text>
          </Flex>
        ),
        header: () => <span>Status</span>,
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
              sourceListData: REQ_STATUS_LIST_OPTION,
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"}>
            <Link
              href={`projects-manager/register?reqId=${info.row.original.id}`}
            >
              <Button
                rightIcon={<FiArrowRightCircle />}
                colorScheme="secondary"
                size="sm"
              >
                Register
              </Button>
            </Link>
          </Flex>
        ),
        header: () => "",
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        },
      },
    ],
    [pageIndex, pageSize, colorMode, OptionDivision, ParamFilter]
  );

  // Set Onload Filter For Constant Filter
  useEffect(() => {
    const brdStatusApprove: ListSearchByParamProps = {
      field: "reqStatus",
      operator: "=",
      value: "APPROVED",
      filterLabel: "Tipe",
    };
    
    // Load division data
    if (OptionDivision.length <= 0) {
      GetDataDivision("", MAX_SIZE_TABLE);
    }
    
    // Add filter
    const filterWhereData: ListSearchByParamProps[] = addParamFilterUpdate(
      ParamFilter,
      brdStatusApprove
    );
    setParamFilter(filterWhereData);
  }, []);

  useEffect(() => {
    const brdFilterSelected: ListSearchByParamProps[] = [
      {
        field: "requirementType",
        operator: "=",
        value: SelectedTypeReq,
        filterLabel: "Tipe",
      },
    ];
    
    const updatedFilters = brdFilterSelected.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );
    setParamFilter(updatedFilters);
  }, [SelectedTypeReq]);

  useEffect(() => {
    const brdStatusApproveStatic: ListSearchByParamProps = {
      field: "reqStatus",
      operator: "=",
      value: "APPROVED",
      filterLabel: "Tipe",
    };
    const filterWhereData: ListSearchByParamProps[] = addParamFilter(
      ParamFilter,
      brdStatusApproveStatic
    );
    if (DataAuth && DataAuth.team && tokenData) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: filterWhereData,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListReq(PayloadList, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
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
          setDataReq(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, ParamFilter, tokenData]);

  const table = useReactTable({
    data: DataReq,
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
    <Flex as={Stack} w={"full"} pt={4}>
      <FormControl>
        <Grid templateColumns="repeat(2, 1fr)" gap={1} w={"full"}>
          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormLabel h={"full"}>Sudah memiliki requirement</FormLabel>
          </GridItem>
          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormControl>
              <RadioGroup
                id={"isHaveReq"}
                onChange={(val) => {
                  console.log(val);
                }}
                value={"Y"}
              >
                <Flex w={"full"} as={HStack} justifyContent={"end"}>
                  <Radio value={"Y"}>Ya</Radio>
                  <Radio value={"N"} isDisabled>
                    Tidak
                  </Radio>
                </Flex>
              </RadioGroup>
            </FormControl>
          </GridItem>

          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormLabel h={"full"}>Tipe Requirement</FormLabel>
          </GridItem>

          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormControl>
              <RadioGroup
                id={"FilterReqType"}
                onChange={(val) => {
                  setSelectedTypeReq(val);
                }}
                value={SelectedTypeReq}
              >
                <Flex w={"full"} as={HStack} justifyContent={"end"}>
                  <Radio value={"BRD"}>BRD</Radio>
                  <Radio value={"RFC"}>RFC</Radio>
                </Flex>
              </RadioGroup>
            </FormControl>
          </GridItem>

          <GridItem colSpan={2} w={"full"}>
            <Popover closeOnBlur={false} placement={"bottom"}>
              <PopoverTrigger>
                <Button size={"sm"} leftIcon={<FiFilter />}>
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
              <Portal>
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
                                {" "}
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
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </GridItem>
        </Grid>

        <GridItem colSpan={2} w={"full"}>
          {IsLoadingProcess ? (
            <LoadingMiniSignature />
          ) : (
            <Box w={"full"} pt={2}>
              <TableComponentWithFilterCTX
                table={table}
                handleFilterChange={handleFilterChange}
              />
            </Box>
          )}
        </GridItem>
      </FormControl>
    </Flex>
  );
});

ModalRegisterProject.displayName = "ModalRegisterProject";

export default ModalRegisterProject;
