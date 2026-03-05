"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
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
import { FiFilter, FiRefreshCcw, FiX, FiInfo, FiEye, FiEdit, FiCheck, FiAlertTriangle, FiSearch } from "react-icons/fi";
import { Search2Icon } from "@chakra-ui/icons";
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
  const [viewMode, setViewMode] = useState<"BRD" | "RFC">("BRD");

  // Filter State
  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);

  // Search State
  const [globalFilter, setGlobalFilter] = useState<string>("");
  // Scroll State
  const [isTableHovered, setIsTableHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (!isTableHovered) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      if (hasHorizontalScroll) {
        container.scrollLeft += e.deltaY > 0 ? 100 : -100;
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [isTableHovered]);
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

    const typeFilter: ListSearchByParamProps = {
      field: "requirementType",
      operator: "=",
      value: viewMode,
      filterLabel: "Type",
    };

    const orgGroupFilter: ListSearchByParamProps = {
      field: "reqManageByGroupCode",
      operator: "=",
      value: DataAuth.team.orgGroupCode,
      filterLabel: "Group",
    };

    const filterWithStatusAndType = [...ParamFilter, statusFilter, typeFilter, orgGroupFilter];

    const PayloadList: PaggingListPayload = {
      search: globalFilter,
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

  const handleSearch = () => {
    if (globalFilter.length > 0 && globalFilter.length < 3) {
      showToast({
        description: "Please enter at least 3 characters to search",
        statusToast: "warning",
      });
      return;
    }
    setPagination({ pageIndex: 0, pageSize });
    setRefreshData(RefreshData + 1);
  };

  const handleClearSearch = () => {
    setGlobalFilter("");
    setPagination({ pageIndex: 0, pageSize });
    setTimeout(() => setRefreshData(RefreshData + 1), 100);
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
        cell: (info) => {
          const req = info.row.original;
          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              <Text fontWeight="600">{req.reqNumber}</Text>
              <Text>{req.reqNarative}</Text>
              <Text>Sender: {req.senderDivisionName}</Text>
              <Text>Type: {req.requirementType}</Text>
              {req.isCarryOver === "Y" && <Text>Status: CARRYOVER</Text>}
              {req.isHaveMemo === "N" && (
                <Text color="red.300">⚠ No Memo Attached</Text>
              )}
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <VStack align="start" spacing={0} w="full">
                <HStack spacing={1}>
                  {req.isHaveMemo === "N" && (
                    <Box as={FiAlertTriangle} color="red.500" w={3} h={3} />
                  )}
                  <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                    {req.reqNumber}
                  </Text>
                  {req.isCarryOver === "Y" && (
                    <Badge fontSize="1em" px={2} py={1} rounded="md" colorScheme="purple">
                      CO
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                  {req.reqNarative}
                </Text>
              </VStack>
            </Tooltip>
          );
        },
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
        cell: (info) => {
          const req = info.row.original;
          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              <Text>Memo Created: {req.reqInititateDate ? stringToDateFormatedReverse(req.reqInititateDate) : "-"}</Text>
              <Text>Memo Received: {req.reqAcceptedDate ? stringToDateFormatedReverse(req.reqAcceptedDate) : "-"}</Text>
              <Text>Assigned: {req.assignedToDate ? stringToDateFormatedReverse(req.assignedToDate) : "-"}</Text>
              <Text>Duration: {req.reqDurationDay} days</Text>
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <VStack align="start" spacing={0} w="full">
                {req.assignedToDate && (
                  <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                    {stringToDateFormatedReverse(req.assignedToDate)}
                  </Text>
                )}
                {req.reqInititateDate && (
                  <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                    Created: {stringToDateFormatedReverse(req.reqInititateDate)}
                  </Text>
                )}
              </VStack>
            </Tooltip>
          );
        },
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
        cell: (info) => {
          const req = info.row.original;
          const approvers = req.approvalDatas || [];
          const firstApprover = approvers[0];
          const moreCount = approvers.length - 1;

          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              <Text fontWeight="600">Assigned From:</Text>
              <Text>{req.assignedFromName || "-"}</Text>
              <Text fontWeight="600" pt={1}>Assigned To:</Text>
              {approvers.length > 0 ? (
                approvers.map((x, idx) => (
                  <Text key={idx}>
                    {idx + 1}. {x.approverUserFirstName} {x.approverUserLastnameName}
                  </Text>
                ))
              ) : (
                <Text>-</Text>
              )}
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <VStack align="start" spacing={0} w="full">
                <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                  {req.assignedFromName || "-"}
                </Text>
                {firstApprover && (
                  <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                    To: {firstApprover.approverUserFirstName}
                    {moreCount > 0 && ` +${moreCount}`}
                  </Text>
                )}
              </VStack>
            </Tooltip>
          );
        },
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
        cell: (info) => {
          const req = info.row.original;
          const hasApp = req.appInitialCode && req.appInitialCode.trim() !== "";

          if (!hasApp) {
            return (
              <Text fontSize="xs" color="gray.400">-</Text>
            );
          }

          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              <Text fontWeight="600">{req.appInitialCode}</Text>
              <Text>{req.appInitialName}</Text>
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <Text fontSize="xs" fontWeight="600" noOfLines={1}>
                {req.appInitialCode}
              </Text>
            </Tooltip>
          );
        },
        header: () => <span>Product</span>,
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
              filterLabel: "Inisial Product",
            },
            {
              field: "appInitialName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Product",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqStatus,
        id: "reqStatus",
        cell: (info) => {
          const req = info.row.original;
          const tooltipContent = (
            <VStack align="start" spacing={1} fontSize="xs">
              <Text>Status: {req.reqStatus}</Text>
              <Text>Next Step: {req.nextStep}</Text>
            </VStack>
          );

          return (
            <Tooltip label={tooltipContent} hasArrow placement="top">
              <VStack align="start" spacing={1} w="full">
                {req.reqStatus && (
                  <LabelMaster
                    groupLabel={GROUP_CONST_BRD_STATUS}
                    labelName={req.reqStatus}
                  />
                )}
                {req.nextStep && (
                  <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                    Next: {req.nextStep}
                  </Text>
                )}
              </VStack>
            </Tooltip>
          );
        },
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
                    size="xs"
                    py={4}
                    fontSize="sm"
                    w="full"
                    bg="purple.50"
                    color="purple.700"
                    _hover={{
                      bg: "purple.300",
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                    colorScheme="purple"
                    leftIcon={<FiEye />}
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
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* FILTER AND SEARCH */}
                <VStack spacing={4} align="stretch">
                  {/* Row 1: View Mode Toggle & Action Buttons */}
                  <Flex gap={4} wrap="wrap" align="center">
                    <HStack spacing={2}>
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

                    <Spacer />

                    {/* Action Buttons */}
                    <HStack spacing={2}>
                      <Popover closeOnBlur={false} placement={"bottom"}>
                        <PopoverTrigger>
                          <Button size={"sm"} leftIcon={<FiFilter />}>
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
                        size={"sm"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Refresh
                      </Button>
                    </HStack>
                  </Flex>

                  {/* Row 2: Search Input */}
                  <Flex gap={4} wrap="wrap" align="center">
                    <InputGroup maxW="400px" size="sm">
                      <InputLeftElement>
                        <Search2Icon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search requirements (min 3 characters)..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        isDisabled={IsLoadingProcess}
                        size="sm"
                      />
                    </InputGroup>

                    <Button
                      colorScheme="blue"
                      onClick={handleSearch}
                      leftIcon={<FiSearch />}
                      size="sm"
                      isLoading={IsLoadingProcess}
                    >
                      Search
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleClearSearch}
                      leftIcon={<FiX />}
                      size="sm"
                      isDisabled={IsLoadingProcess || !globalFilter}
                    >
                      Clear Search
                    </Button>
                  </Flex>
                </VStack>
                {IsLoadingProcess ? (
                  <LoadingMiniSignature />
                ) : (
                  <Box overflowX="auto" w="full" ref={scrollContainerRef}>
                    <Box 
                      minW="1400px"
                      onMouseEnter={() => setIsTableHovered(true)}
                      onMouseLeave={() => setIsTableHovered(false)}
                    >
                      <TableComponentWithFilterCTX
                    table={table}
                    handleFilterChange={handleFilterChange}
                  />
                    </Box>
                  </Box>                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}
