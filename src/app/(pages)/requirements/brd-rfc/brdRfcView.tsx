"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputGroupPanel } from "@/app/components/customPanels";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import DivisionListSelected from "@/app/components/inputProps/divisionListSelected";
import DivisionListSearch from "@/app/components/inputProps/divisionSearch";
import UserSearchSelect from "@/app/components/inputProps/userSearchSelect";
import LabelMaster from "@/app/components/labelMasterProps";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  InputLayout,
  InputLayoutFull,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  ControlTable,
  TableComponentFull,
  TableComponentFullHeadless,
} from "@/app/components/tableComponents";
import {
  DELAY_MEDIUM,
  GROUP_CONST_BRD_STATUS,
  LINK_MENU_ROOT,
  MAX_SIZE_TABLE,
  NEXT_STEP_ACTION_REVIEW,
  radiusStyle,
  REQ_STATUS_ALL,
  REQUIREMENT_STATUS_NEW,
  REQUIREMENT_TYPE_BRD,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import {
  REQ_STATUS_APPROVED,
  REQ_STATUS_CANCELED,
  REQ_STATUS_DRAFT,
  REQ_STATUS_IN_PROGRESS_REVIEW,
  REQ_WAITING_APPROVAL,
  REQ_STATUS_NEED_REVIEW,
  REQ_STATUS_TEMPORARY_APPROVED,
  REQ_STATUS_ON_HOLD,
  REQ_STATUS_CAN_EDIT,
  REQUIREMENT_STATUS_OPTIONS,
} from "@/app/constants/masterStatusConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  getCurrentQuarter,
  getQuarterDateRange,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import useDivision, { DivisionResponse } from "@/app/services/useDivisions";
import useRequirements, {
  RequirementsInsertPayload,
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import {
  addParamFilter,
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParam,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
  removeParamFilter,
} from "@/app/types/masterTypes";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ListItem,
  OrderedList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Spacer,
  Stack,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  useSteps,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
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
import { Formik, FormikState, useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { redirect, useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiFilter,
  FiInfo,
  FiMinusCircle,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiX,
  FiXCircle,
  FiEye,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import * as Yup from "yup";
import { Select } from "chakra-react-select";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import { map } from "framer-motion/client";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";

// Combined BRD/RFC page - no single TYPE_REQ

const HeaderDataContent: HeaderContentProps = {
  titleName: "Requirements BRD / RFC",
  breadCrumb: ["Home", "Requirements", "BRD / RFC"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

interface CounterDataReqStatusProps {
  statusName: string;
  countData: number;
}

const DataCounterReqStatus: CounterDataReqStatusProps[] = [
  {
    statusName: REQ_STATUS_APPROVED,
    countData: 0,
  },
  {
    statusName: REQ_STATUS_IN_PROGRESS_REVIEW,
    countData: 0,
  },
  {
    statusName: REQ_STATUS_NEED_REVIEW,
    countData: 0,
  },
  {
    statusName: REQ_STATUS_DRAFT,
    countData: 0,
  },
  {
    statusName: REQ_STATUS_ON_HOLD,
    countData: 0,
  },
  {
    statusName: REQ_STATUS_CANCELED,
    countData: 0,
  },
];

// No fixed type filter - showing both BRD and RFC

export default function BRDRFCView() {
  // SetUp auth data on current page
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [canMake, setCanMake] = useState<boolean>(false);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [canApprove, setCanApprove] = useState<boolean>(false);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List, GetDetailById, InsertReq, StartReview } = useRequirements();
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListOrganization } = useOrganization();

  // querter filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "all">(
    currentQuarter
  );
  const [filteredMonths, setFilteredMonths] = useState<string[]>([]);
  type ViewMode = "BRD" | "RFC" | "MY";
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("brdRfcViewMode");
      return saved === "RFC" || saved === "MY" ? saved : "BRD";
    }
    return "BRD";
  });

  const [memoFilter, setMemoFilter] = useState<string>("");
  const [creatorFilter, setCreatorFilter] = useState<string>("");

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("brdRfcViewMode", viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
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
  // End SetUp auth data on current page

  const [DataReq, setDataReq] = useState<RequirementsResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [startReviewReqId, setStartReviewReqId] = useState<string | null>(null);
  const {
    isOpen: isStartReviewOpen,
    onOpen: onStartReviewOpen,
    onClose: onStartReviewClose,
  } = useDisclosure();
  const cancelStartReviewRef = useRef<any>(null);

  const {
    isOpen: isRegisterModalOpen,
    onOpen: onRegisterModalOpen,
    onClose: onRegisterModalClose,
  } = useDisclosure();

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Division Option setup

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
      console.log(requestData);
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
      const dataDivision = await GetDataDivision("", MAX_SIZE_TABLE);
    }
  };

  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);

  const RefreshAction = () => {
    setParamFilter([]);
    setTotalPageData(0);
    setDataReq([]);
    setRefreshData(RefreshData + 1);
  };

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    console.log("handleFilterChange");
    console.log(newFilters);

    // Use reduce to merge all new filters at once
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );

    setParamFilter(updatedFilters);
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
                      {idx + 1}. {x.approverUserFirstName}{" "}
                      {x.approverUserLastnameName}
                    </Text>
                  ))}
                  {info.row.original.approvalDatas.length > 3 && (
                    <Tooltip
                      label={
                        <VStack align="start" spacing={1}>
                          {info.row.original.approvalDatas
                            .slice(3)
                            .map((x, idx) => (
                              <Text key={idx} fontSize="xs">
                                {idx + 4}. {x.approverUserFirstName}{" "}
                                {x.approverUserLastnameName}
                              </Text>
                            ))}
                        </VStack>
                      }
                      placement="top"
                    >
                      <Text
                        fontWeight={600}
                        fontSize="smaller"
                        color="gray.600"
                        cursor="pointer"
                      >
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
                    bg="purple.50"
                    color="purple.700"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    _hover={{ bg: "purple.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                  >
                    Preview
                  </Button>
                </Link>

                {/* DRAFT: Edit (Maker) */}
                {status === REQ_STATUS_DRAFT && canMake && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id
                        }`
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
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={() => {
                      setStartReviewReqId(info.row.original.id);
                      onStartReviewOpen();
                    }}
                  >
                    Start Review
                  </Button>
                )}

                {/* IN PROGRESS REVIEW: Resume Review (Reviewer) */}
                {status === REQ_STATUS_IN_PROGRESS_REVIEW && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id
                        }&mode=review`
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
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
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
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
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
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id
                        }`
                      )
                    }
                  >
                    Edit
                  </Button>
                )}
                {status === REQ_STATUS_TEMPORARY_APPROVED && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={async () => {
                      const result = await StartReview(
                        info.row.original.id,
                        tokenData
                      );
                      if (result?.statusCode === RES_CODE_OK) {
                        showToast({
                          description: "Review started successfully",
                          statusToast: "success",
                        });
                        router.push(
                          `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id
                          }&mode=review`
                        );
                      } else {
                        showToast({
                          description:
                            result?.message || "Failed to start review",
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
                    bg="blue.50" color="blue.700" _hover={{ bg: "blue.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={() =>
                      router.push(
                        `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id
                        }`
                      )
                    }
                  >
                    Edit
                  </Button>
                )}
                {status === REQ_STATUS_ON_HOLD && canReview && (
                  <Button
                    leftIcon={<FiEdit />}
                    bg="green.50" color="green.700" _hover={{ bg: "green.300", transform: "translateY(-2px)", boxShadow: "md" }} transition="all 0.2s"
                    size="xs" py={4} fontSize="sm"
                    w="full"
                    onClick={async () => {
                      const result = await StartReview(
                        info.row.original.id,
                        tokenData
                      );
                      if (result?.statusCode === RES_CODE_OK) {
                        showToast({
                          description: "Review started successfully",
                          statusToast: "success",
                        });
                        router.push(
                          `/requirements/${info.row.original.requirementType.toLowerCase()}/register?id=${info.row.original.id
                          }&mode=review`
                        );
                      } else {
                        showToast({
                          description:
                            result?.message || "Failed to start review",
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
    [ActionLoading, pageIndex, pageSize, colorMode, OptionDivision, ParamFilter]
  );

  const [StartDateFilter, setStartDateFilter] = useState<Date>(new Date());
  const [EndDateFilter, setEndDateFilter] = useState<Date>(new Date());

  // Set Onload Filter For Constant Filter
  useEffect(() => {
    LoadDataDivision();
    // No fixed type filter - user can filter by BRD or RFC
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

  useEffect(() => {
    const { startDate, endDate } = getQuarterDateRange(
      selectedYear,
      selectedQuarter
    );
    // console.log("Selected Range (ISO):", {
    //   startDate: startDate.toISOString(),
    //   endDate: endDate.toISOString(),
    // });

    setStartDateFilter(startDate);
    setEndDateFilter(endDate);

    // const brdFilter: ListSearchByParam = {
    //   field: "requirementType",
    //   operator: "=",
    //   value: TYPE_REQ,
    // };

    // if (DataAuth && DataAuth.team && tokenData) {
    if (DataAuth && tokenData) {
      // const filterWhereData: ListSearchByParam[] = addParamFilter(
      //   ParamFilter,
      //   brdFilter
      // );

      // setParamFilter(filterWhereData);

      // Add viewMode filter
      let filterWithType = [...ParamFilter];

      if (viewMode === "MY") {
        // Filter by current user's requirements (both BRD and RFC)
        if (DataAuth?.userId) {
          const myReqFilter: ListSearchByParamProps = {
            field: "assignedFromId",
            operator: "=",
            value: DataAuth.userId,
            filterLabel: "My Requirements",
          };
          filterWithType = [...filterWithType, myReqFilter];
        }
      } else {
        // Filter by requirement type (BRD or RFC)
        const typeFilter: ListSearchByParamProps = {
          field: "requirementType",
          operator: "=",
          value: viewMode,
          filterLabel: "Type",
        };
        filterWithType = [...filterWithType, typeFilter];
      }

      // Add memo filter if selected
      if (memoFilter !== "") {
        const memoFilterParam: ListSearchByParamProps = {
          field: "isHaveMemo",
          operator: "=",
          value: memoFilter,
          filterLabel: "Memo Status",
        };
        filterWithType = [...filterWithType, memoFilterParam];
      }

      // Add creator filter if "MY" is selected
      if (creatorFilter === "MY" && DataAuth?.userId) {
        const creatorFilterParam: ListSearchByParamProps = {
          field: "assignedFromId",
          operator: "=",
          value: DataAuth.userId,
          filterLabel: "Creator",
        };
        filterWithType = [...filterWithType, creatorFilterParam];
      }

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
        } else {
          console.log(requestData);
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
  }, [
    DataAuth,
    RefreshData,
    pageIndex,
    pageSize,
    globalFilter,
    selectedYear,
    selectedQuarter,
    ParamFilter,
    viewMode,
    creatorFilter,
    memoFilter,
  ]);

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

  // FILTER SHOW HIDE
  const [BoxFilter, setBoxFilter] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll
    ? DataCounterReqStatus
    : DataCounterReqStatus.slice(0, 3);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
          <Flex
            w={"full"}
            as={Wrap}
            spacing={2}
            overflowX={"auto"}
            justifyContent={"start"}
            pt={4}
            display={"none"}
          >
            {visibleItems.map((dt, idx) => (
              <BoxStatisticNumber
                labelStd={dt.statusName}
                numberStd={dt.countData}
                key={idx}
              />
            ))}
            {DataCounterReqStatus.length > 3 && (
              <Button
                w={"120px"}
                h={"50px"}
                bgGradient={"linear(to-br, secondary.500, secondary.800)"}
                rounded={radiusStyle}
                boxShadow={"md"}
                colorScheme="purple"
                size="xs"
                leftIcon={showAll ? <FiChevronUp /> : <FiChevronDown />}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Sedikit" : "Semua"}
              </Button>
            )}
          </Flex>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
          {/* <Flex
            as={Wrap}
            w={"full"}
            justifyContent={"end"}
            alignItems={"center"}
            pt={4}
          >
            <WrapItem alignItems={"center"}>
              <Text fontWeight={600} pr={2}>
                Filter {TYPE_REQ}
              </Text>
            </WrapItem>
            <WrapItem>
              <Select
                rounded={radiusStyle}
                value={selectedYear}
                size={"lg"}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                minW={"250px"}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </WrapItem>
            <WrapItem>
              <Select
                rounded={radiusStyle}
                value={selectedQuarter}
                size={"lg"}
                onChange={(e) =>
                  setSelectedQuarter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                // minW={"90px"}
                // w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
              >
                <option value="all">All</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </Select>
            </WrapItem>
          </Flex> */}
        </GridItem>
        {/* <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
          <Flex
            as={HStack}
            h={"full"}
            w={"full"}
            justifyContent={"end"}
            alignItems={"end"}
          >
            <Button colorScheme={"gray"}>Refresh</Button>
            <Button colorScheme={"secondary"}>Create New</Button>
          </Flex>
        </GridItem> */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
          >
            <CardHeader pb={2}>
              <Heading as="h5" size="md" w={"full"}>
                Requirement Data BRD / RFC
              </Heading>
            </CardHeader>
            <CardBody pt={2}>
              <Flex w={"full"} as={Stack} spacing={2}>
                {/* <Box
                  overflowY={"auto"}
                  overflowX={"auto"}
                  maxH={"350px"}
                  p={2}
                  bgColor={"gray.50"}
                >
                  <pre>{JSON.stringify(ParamFilter, null, 2)}</pre>
                </Box> */}
                {/* View Mode Switch */}

                {/* FILTER DATA */}
                <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
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
                      <Button
                        size="sm"
                        variant={viewMode === "MY" ? "solid" : "ghost"}
                        colorScheme="blue"
                        onClick={() => setViewMode("MY")}
                        borderRadius="lg"
                      >
                        My Requirements
                      </Button>
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
                                              (opt) =>
                                                opt.value === dt.value
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
                      <Menu>
                        <MenuButton
                          as={Button}
                          size="md"
                          rightIcon={<ChevronDownIcon />}
                        >
                          {memoFilter === "Y"
                            ? "Memiliki Memo"
                            : memoFilter === "N"
                              ? "Tidak Memiliki Memo"
                              : "Semua"}
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => setMemoFilter("")}>
                            All
                          </MenuItem>
                          <MenuItem onClick={() => setMemoFilter("Y")}>
                            Have Requirement
                          </MenuItem>
                          <MenuItem onClick={() => setMemoFilter("N")}>
                            No Requirement
                          </MenuItem>
                        </MenuList>
                      </Menu>
                      <Button
                        size={"md"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Refresh
                      </Button>
                      {canMake && (
                        <Button
                          size={"md"}
                          colorScheme={"blue"}
                          leftIcon={<FiPlusSquare />}
                          onClick={onRegisterModalOpen}
                        >
                          Register
                        </Button>
                      )}
                    </Flex>
                  </GridItem>
                </Grid>
                {IsLoadingProcess ? (
                  <LoadingMiniSignature />
                ) : (
                  // <TableComponentFull table={table} />
                  // TABLE NEW DESIGN
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

      {/* Start Review Confirmation Modal */}
      <AlertDialog
        isOpen={isStartReviewOpen}
        onClose={onStartReviewClose}
        leastDestructiveRef={cancelStartReviewRef}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" pb={2}>
              <HStack spacing={2}>
                <FiAlertCircle />
                <Text>Start Review?</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody py={4}>
              Are you sure you want to start reviewing this requirement? Once
              started, the review timer will begin counting.
            </AlertDialogBody>
            <AlertDialogFooter pt={4}>
              <Button
                ref={cancelStartReviewRef}
                onClick={onStartReviewClose}
                colorScheme="red"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FiEdit />}
                onClick={async () => {
                  if (startReviewReqId) {
                    const result = await StartReview(
                      startReviewReqId,
                      tokenData
                    );
                    if (result?.statusCode === RES_CODE_OK) {
                      showToast({
                        description: "Review started successfully",
                        statusToast: "success",
                      });
                      onStartReviewClose();
                      router.push(
                        `/requirements/${DataReq.find(
                          (r) => r.id === startReviewReqId
                        )?.requirementType.toLowerCase()}/register?id=${startReviewReqId}&mode=review`
                      );
                    } else {
                      showToast({
                        description:
                          result?.message || "Failed to start review",
                        statusToast: "error",
                      });
                      onStartReviewClose();
                    }
                  }
                }}
                ml={3}
              >
                Start Review
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Register Type Selection Modal */}
      <Modal isOpen={isRegisterModalOpen} onClose={onRegisterModalClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent rounded={radiusStyle} bgColor={colorMode == "light" ? "white" : "gray.800"}>
          <ModalHeader pb={4}>
            <Heading as="h4" size="md">Select Registration Type</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6} px={6}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Link href="/requirements/brd/register" onClick={onRegisterModalClose} style={{ width: "100%" }}>
                <Box
                  p={8}
                  rounded={radiusStyle}
                  bgGradient="linear(to-br, blue.50, blue.100)"
                  border="2px solid"
                  borderColor="blue.200"
                  cursor="pointer"
                  transition="all 0.3s"
                  _hover={{
                    bgGradient: "linear(to-br, blue.100, blue.200)",
                    borderColor: "blue.500",
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 24px rgba(59, 130, 246, 0.3)"
                  }}
                  h="full"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="center"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgGradient: "linear(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0))",
                    pointerEvents: "none"
                  }}
                >
                  <Box fontSize="4xl" mb={4} color="blue.600" fontWeight="bold">
                    BRD
                  </Box>
                  <Text fontSize="sm" color="blue.700" textAlign="center" fontWeight="500">
                    Business Requirements Document
                  </Text>
                </Box>
              </Link>

              <Link href="/requirements/rfc/register" onClick={onRegisterModalClose} style={{ width: "100%" }}>
                <Box
                  p={8}
                  rounded={radiusStyle}
                  bgGradient="linear(to-br, purple.50, purple.100)"
                  border="2px solid"
                  borderColor="purple.200"
                  cursor="pointer"
                  transition="all 0.3s"
                  _hover={{
                    bgGradient: "linear(to-br, purple.100, purple.200)",
                    borderColor: "purple.500",
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 24px rgba(168, 85, 247, 0.3)"
                  }}
                  h="full"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="center"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgGradient: "linear(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0))",
                    pointerEvents: "none"
                  }}
                >
                  <Box fontSize="4xl" mb={4} color="purple.600" fontWeight="bold">
                    RFC
                  </Box>
                  <Text fontSize="sm" color="purple.700" textAlign="center" fontWeight="500">
                    Request for Change
                  </Text>
                </Box>
              </Link>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

interface BoxStatisticNumberProps {
  labelStd: string;
  numberStd: number;
}

const BoxStatisticNumber = ({
  labelStd,
  numberStd,
}: BoxStatisticNumberProps) => {
  // const [isHovered, setIsHovered] = useState(false);
  return (
    <Flex
      w={"180px"}
      h={"50px"}
      bgGradient={"linear(to-br, secondary.500, secondary.800)"}
      rounded={radiusStyle}
      boxShadow={"md"}
      as={HStack}
      justifyContent={"space-between"}
      alignContent={"center"}
      spacing={2}
      px={5}
      py={2}
      cursor={"pointer"}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      // transition="transform 0.3s ease-in-out"
      // transform={isHovered ? "translateY(-10px)" : "translateY(0)"}
      pos={"relative"}
      zIndex={2}
    >
      <Text fontWeight={600} color={"white"} fontSize={"small"}>
        {labelStd}
      </Text>
      <Badge
        size={"xl"}
        fontWeight={600}
        fontSize={"lg"}
        rounded={"md"}
        h={"full"}
        textAlign={"center"}
        alignContent={"center"}
        pb={1}
        px={2}
      >
        {numberStd}
      </Badge>
    </Flex>
  );
};
