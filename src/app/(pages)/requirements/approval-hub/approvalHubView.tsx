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
  Wrap,
  Tooltip,
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
import { FiFilter, FiRefreshCcw, FiX, FiInfo, FiEye, FiEdit, FiCheck, FiAlertTriangle } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  GROUP_CONST_BRD_STATUS,
} from "@/app/constants/applicationConstants";
import {
  REQ_WAITING_APPROVAL,
  REQ_STATUS_DRAFT,
  REQ_STATUS_NEED_REVIEW,
  REQ_STATUS_IN_PROGRESS_REVIEW,
  REQ_STATUS_APPROVED,
  REQ_STATUS_TEMPORARY_APPROVED,
  REQ_STATUS_ON_HOLD,
  REQ_STATUS_CANCELED,
  REQUIREMENT_STATUS_OPTIONS,
} from "@/app/constants/masterStatusConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useRequirements, {
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useConstants from "@/app/services/useConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import {
  stringToDateFormatedReverse,
  getQuarterDateRange,
  getCurrentQuarter,
} from "@/app/helper/MasterHelper";
import LabelMaster from "@/app/components/labelMasterProps";
import {
  ColumnMetaCustom,
  PaggingListPayload,
  FilterParamProps,
  OptionListProps,
  ListSearchByParamProps,
  addParamFilterUpdate,
  removeParamFilter,
} from "@/app/types/masterTypes";

const HeaderDataContent = {
  titleName: "Pending Approve",
  breadCrumb: ["Home", "Requirements", "Approval Center"],
};

export default function ApprovalHubView() {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const showToast = useToastHelper();
  const { List, StartReview } = useRequirements();
  const { List: ListOrganization } = useOrganization();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [canMake, setCanMake] = useState<boolean>(false);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [canApprove, setCanApprove] = useState<boolean>(false);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [RefreshData, setRefreshData] = useState<number>(0);

  // Data State
  const [DataApprovals, setDataApprovals] = useState<RequirementsResponse[]>(
    []
  );
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

  // View Mode State (BRD/RFC filter)
  const [viewMode, setViewMode] = useState<"All" | "BRD" | "RFC">("All");

  // Filter State
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);

  const GetDataDivision = async (
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
  };

  const LoadDataDivision = async () => {
    if (OptionDivision.length <= 0) {
      await GetDataDivision("", 1000);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }

    // Load permissions from accessData
    const accessDataStr = localStorage.getItem("accessData");
    if (accessDataStr) {
      try {
        const accessData = JSON.parse(accessDataStr);
        setCanMake(accessData.aggregatedPermissions?.canMake || false);
        setCanReview(accessData.aggregatedPermissions?.canReview || false);
        setCanApprove(accessData.aggregatedPermissions?.canApprove || false);
      } catch (error) {
        console.error("Failed to parse accessData:", error);
      }
    }
  }, [DataAuth]);

  // Load data with WAITING APPROVAL filter and viewMode (BRD/RFC)
  useEffect(() => {
    if (!DataAuth || !tokenData) return;


    // If user has no orgGroupCode, show no results
    if (!DataAuth.team?.orgGroupCode) {
      setDataApprovals([]);
      setTotalPageData(0);
      setIsLoadingProcess(false);
      return;
    }
    const statusFilter: ListSearchByParamProps = {
      field: "reqStatus",
      operator: "=",
      value: REQ_WAITING_APPROVAL,
      filterLabel: "Status",
    };

    let filterWithType = [...ParamFilter];
    
    // Only add type filter if not "All"
    if (viewMode !== "All") {
      const typeFilter: ListSearchByParamProps = {
        field: "requirementType",
        operator: "=",
        value: viewMode,
        filterLabel: "Type",
      };
      filterWithType = [...filterWithType, typeFilter];
    }

    const orgGroupFilter: ListSearchByParamProps = {
      field: "reqManageByGroupCode",
      operator: "=",
      value: DataAuth.team.orgGroupCode,
      filterLabel: "Group",
    };

    const filterWithStatusAndType = [...filterWithType, statusFilter, orgGroupFilter];

    const PayloadList: PaggingListPayload = {
      search: "",
      limit: pageSize,
      page: pageIndex,
      filterWhere: filterWithStatusAndType,
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
      setDataApprovals(itemsData);
      setTotalPageData(totalPages);
      setIsLoadingProcess(false);
    };

    GetDataList();
  }, [DataAuth, tokenData, RefreshData, pageIndex, pageSize, ParamFilter, viewMode]);

  useEffect(() => {
    LoadDataDivision();
  }, []);

  const RefreshAction = () => {
    setParamFilter([]);
    setRefreshData(RefreshData + 1);
  };

  const handleFilterChange = (newFilters: any[]) => {
    setParamFilter(newFilters);
  };


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
        // Custom variable
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
            <Flex
              as={Stack}
              w="full"
              spacing={2}
              display={info.row.original.isHaveMemo === "N" ? "flex" : "none"}
            >
              <Flex
                as={HStack}
                spacing={2}
                color="red.500"
                alignItems="center"
                fontSize={"small"}
              >
                <FiAlertTriangle />
                <Text>
                  {info.row.original.requirementType} Belum ada Memo Pengantar
                </Text>
              </Flex>
              <Flex as={Stack} spacing={0}>
                <Text>{info.row.original.reqNarative}</Text>
              </Flex>
            </Flex>
            <Flex
              as={Stack}
              spacing={2}
              display={info.row.original.isHaveMemo == "Y" ? "flex" : "none"}
            >
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
                  <Badge
                    variant="solid"
                    colorScheme="purple"
                    fontSize={"small"}
                    rounded={radiusStyle}
                    px={4}
                  >
                    CARRYOVER
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Perihal</span>,
        footer: (props) => props.column.id,
        // Custom variable
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
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Pada :</Text>
              <Text fontWeight={600}>
                {info.row.original.assignedToDate
                  ? stringToDateFormatedReverse(
                    info.row.original.assignedToDate
                  )
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Tanggal</span>,
        footer: (props) => props.column.id,
        // Custom variable
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
            {
              field: "assignedToDate",
              operator: "=",
              value: "",
              filterType: "date",
              filterLabel: "Tgl. Ditugaskan",
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
                {info.row.original.assignedFromName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Ke :</Text>
              {info.row.original.approvalDatas?.length ? (
                <>
                  {info.row.original.approvalDatas.slice(0, 3).map((x, idx) => (
                    <Text fontWeight={600} key={idx} fontSize="smaller">
                      {idx + 1}. {x.approverUserFirstName} {x.approverUserLastnameName}
                    </Text>
                  ))}
                  {info.row.original.approvalDatas.length > 3 && (
                    <Tooltip
                      label={
                        <VStack align="start" spacing={1}>
                          {info.row.original.approvalDatas.slice(3).map((x, idx) => (
                            <Text key={idx} fontSize="xs">
                              {idx + 4}. {x.approverUserFirstName} {x.approverUserLastnameName}
                            </Text>
                          ))}
                        </VStack>
                      }
                      placement="top"
                    >
                      <Text fontWeight={600} fontSize="smaller" color="gray.600" cursor="pointer">
                        ... +{info.row.original.approvalDatas.length - 3} more
                      </Text>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Text fontWeight={600} fontSize="smaller" color="gray.500">
                  -
                </Text>
              )}
            </Flex>
          </Flex>
        ),
        header: () => <span>Penugasan</span>,
        footer: (props) => props.column.id,
        // Custom variable
        // Custom variable
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
                {info?.row?.original?.appInitialCode &&
                  info.row.original.appInitialCode.trim() !== "" ? (
                  <>
                    <Text fontWeight={600}>
                      ({info.row.original.appInitialCode})
                    </Text>
                    <Text fontWeight={600}>
                      {info.row.original.appInitialName}
                    </Text>
                  </>
                ) : (
                  <Text
                    color="gray.500"
                    fontStyle="italic"
                    fontSize={"x-small"}
                  >
                    Aplikasi Belum Disematkan
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Aplikasi</span>,
        footer: (props) => props.column.id,
        // Custom variable
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
        // Custom variable
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
        cell: (info) => {
          const status = info.row.original.reqStatus;
          const isHaveMemo = info.row.original.isHaveMemo;

          return (
            <Flex w={"full"} justifyContent={"center"}>
              <VStack spacing={1} w="full">
                {/* Preview - All access for all statuses */}
                <Link
                  href={`/requirements/detail?reqId=${info.row.original.id}&type=${info.row.original.requirementType}`}
                  style={{ width: "100%" }}
                >
                  <Button
                    leftIcon={<FiEye />}
                    colorScheme="purple"
                    size="xs"
                    w="full"
                  >
                    Preview
                  </Button>
                </Link>

                {/* DRAFT: Edit (Maker) */}
                {status === REQ_STATUS_DRAFT && canMake && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}`
                      )
                    }
                  >
                    Edit
                  </Button>
                )}

                {/* NEEDS REVIEW: Start Review (Reviewer) */}
                {status === REQ_STATUS_NEED_REVIEW && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={async () => {
                      const result = await StartReview(info.row.original.id, tokenData);
                      if (result?.statusCode === RES_CODE_OK) {
                        showToast({
                          description: "Review started successfully",
                          statusToast: "success",
                        });
                        router.push(
                          `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}&mode=review`
                        );
                      } else {
                        showToast({
                          description: result?.message || "Failed to start review",
                          statusToast: "error",
                        });
                      }
                    }}
                  >
                    Start Review
                  </Button>
                )}

                {/* IN PROGRESS REVIEW: Resume Review (Reviewer) */}
                {status === REQ_STATUS_IN_PROGRESS_REVIEW && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}&mode=review`
                      )
                    }
                  >
                    Resume Review
                  </Button>
                )}

                {/* WAITING APPROVAL: Approve (Approver) */}
                {status === REQ_WAITING_APPROVAL && canApprove && (
                  <Button
                    leftIcon={<FiCheck />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={() => {
                      router.push(
                        `/requirements/detail?reqId=${info.row.original.id}&type=${info.row.original.requirementType}&approvalMode=true`
                      );
                    }}
                  >
                    Approve
                  </Button>
                )}

                {/* APPROVED: Edit (Maker, only if isHaveMemo = 'N') */}
                {status === REQ_STATUS_APPROVED && canMake && isHaveMemo === "N" && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}`
                      )
                    }
                  >
                    Edit
                  </Button>
                )}

                {/* TEMPORARY APPROVED: Edit (Maker), Start Review (Reviewer) */}
                {status === REQ_STATUS_TEMPORARY_APPROVED && canMake && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}`
                      )
                    }
                  >
                    Edit
                  </Button>
                )}
                {status === REQ_STATUS_TEMPORARY_APPROVED && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={async () => {
                      const result = await StartReview(info.row.original.id, tokenData);
                      if (result?.statusCode === RES_CODE_OK) {
                        showToast({
                          description: "Review started successfully",
                          statusToast: "success",
                        });
                        router.push(
                          `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}&mode=review`
                        );
                      } else {
                        showToast({
                          description: result?.message || "Failed to start review",
                          statusToast: "error",
                        });
                      }
                    }}
                  >
                    Start Review
                  </Button>
                )}

                {/* ON HOLD: Edit (Maker), Start Review (Reviewer) */}
                {status === REQ_STATUS_ON_HOLD && canMake && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}`
                      )
                    }
                  >
                    Edit
                  </Button>
                )}
                {status === REQ_STATUS_ON_HOLD && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s" py={4} fontSize="sm"
                    size="xs"
                    w="full"
                    onClick={async () => {
                      const result = await StartReview(info.row.original.id, tokenData);
                      if (result?.statusCode === RES_CODE_OK) {
                        showToast({
                          description: "Review started successfully",
                          statusToast: "success",
                        });
                        router.push(
                          `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id}&mode=review`
                        );
                      } else {
                        showToast({
                          description: result?.message || "Failed to start review",
                          statusToast: "error",
                        });
                      }
                    }}
                  >
                    Start Review
                  </Button>
                )}

                {/* CANCEL: Only Preview (already shown above) */}
              </VStack>
            </Flex>
          );
        },
        header: () => "",
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        },
      },
    ],
    [pageIndex, pageSize, colorMode, OptionDivision, ParamFilter, canMake, canReview, canApprove, tokenData, router, showToast]
  );

  // Set Onload Filter For Constant Filter
  useEffect(() => {
    LoadDataDivision();
  }, []);

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
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode === "light" ? "white" : "gray.800"}
          >
            <CardHeader pb={2}>
              <Heading as="h5" size="md" w={"full"}>
                Pending Approval Requirements
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
                      <HStack spacing={2} flexWrap="wrap">
                        <Button
                          size="sm"
                          variant={viewMode === "All" ? "solid" : "ghost"}
                          colorScheme="blue"
                          onClick={() => setViewMode("All")}
                          borderRadius="lg"
                        >
                          All
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === "BRD" ? "solid" : "ghost"}
                          colorScheme="blue"
                          onClick={() => setViewMode("BRD")}
                          borderRadius="lg"
                        >
                          BRD
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === "RFC" ? "solid" : "ghost"}
                          colorScheme="blue"
                          onClick={() => setViewMode("RFC")}
                          borderRadius="lg"
                        >
                          RFC
                        </Button>
                      </HStack>
                    </HStack>
                  </GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
                    <Flex as={Wrap} justifyContent={"end"} alignItems={"center"} gap={2} px={0} w={"full"}>
                      <Popover closeOnBlur={true} placement={"bottom"}>
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
                      <Button
                        size={"md"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Muat Ulang
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>
                {IsLoadingProcess ? (
                  <LoadingMiniSignature />
                ) : (
                  <TableComponentWithFilterCTX
                    table={table}
                    handleFilterChange={handleFilterChange}
                  />
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}
