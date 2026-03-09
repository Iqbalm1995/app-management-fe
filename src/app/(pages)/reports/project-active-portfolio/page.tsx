"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { getStatusColor } from "@/app/utils/statusUtils";
import { StatusBadge } from "@/app/components/StatusBadge";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  getCurrentQuarter,
  getQuarterDateRange,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useReports, {
  ProjectActivePortofolioListResponse,
} from "@/app/services/useReports";
import useSnapshotServices from "@/app/services/useSnapshotServices";
import {
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParamProps,
  PaggingListPayloadCustom,
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
  Input,
  Select,
  Stack,
  Text,
  useColorMode,
  Wrap,
  WrapItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
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
import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCcw, FiCamera } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import { TbListDetails } from "react-icons/tb";
import { useRouter } from "next/navigation";
import SdlcReportModal from "./components/SdlcReportModal";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Active Portfolio Report",
  breadCrumb: ["Home", "Reports", "Project Active Portfolio"],
};

function ProjectActivePortfolioReportPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const { ListProjectActivePortofolio, ExportProjectActivePortofolioExcel, isLoading: reportLoading } = useReports();
  const { projectActivePortofolio, isLoading: snapshotLoading } = useSnapshotServices();
  const router = useRouter();
  const { isOpen: isSdlcModalOpen, onOpen: onSdlcModalOpen, onClose: onSdlcModalClose } = useDisclosure();
  const { isOpen: isCautionModalOpen, onOpen: onCautionModalOpen, onClose: onCautionModalClose } = useDisclosure();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

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
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [DataReport, setDataReport] = useState<ProjectActivePortofolioListResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

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

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Quarterly filter - Set defaults to current quarter and year
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [FilterProjectType, setFilterProjectType] = useState<string>("");
  const [FilterProjectStatus, setFilterProjectStatus] = useState<string>("");
  const [FilterYear, setFilterYear] = useState<string>(currentYear.toString());
  const [FilterQuarter, setFilterQuarter] = useState<string>(currentQuarter.toString());

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    setParamFilter(newFilters);
    setPagination({ pageIndex: 0, pageSize });
  };

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataReport([]);
    setRefreshData(RefreshData + 1);
    setPagination({ pageIndex: 0, pageSize });
  };

  const CreateSnapshot = async () => {
    if (!DataAuth || !tokenData) {
      showToast({
        description: "Authentication required",
        statusToast: "error",
      });
      return;
    }

    try {
      const result = await projectActivePortofolio(tokenData);
      
      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: `Snapshot created successfully. ${result.data?.projectCount} projects captured.`,
          statusToast: "success",
        });
        RefreshAction(); // Refresh the list after snapshot creation
      } else {
        showToast({
          description: result?.message || "Failed to create snapshot",
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Snapshot creation error:", error);
      showToast({
        description: "Failed to create snapshot",
        statusToast: "error",
      });
    }
  };

  // Handle SDLC Report Modal
  const handleOpenSdlcReport = (projectId: string, projectName: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    onSdlcModalOpen();
  };

  // Handle Excel Export
  const handleExportToExcel = () => {
    onCautionModalOpen();
  };

  const confirmExportToExcel = async () => {
    onCautionModalClose();
    setIsExporting(true);

    if (!DataAuth || !tokenData) {
      showToast({
        description: "Authentication required",
        statusToast: "error",
      });
      setIsExporting(false);
      return;
    }

    const exportPayload: PaggingListPayloadCustom = {
      search: globalFilter,
      limit: -1, // Get all records
      page: 0,
      filterWhere: ParamFilter,
      fieldOrder: ["projectRegisterDate"],
      orderDir: "desc",
    };

    try {
      const blob = await ExportProjectActivePortofolioExcel(exportPayload, tokenData);
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Project_Active_Portfolio_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast({
          description: "Excel file exported successfully",
          statusToast: "success",
        });
      } else {
        showToast({
          description: "No data to export",
          statusToast: "warning",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        description: "Failed to export Excel file",
        statusToast: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Column definitions
  const columnsData = useMemo<ColumnDef<ProjectActivePortofolioListResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text fontSize="sm">
              {pageIndex * pageSize + info.row.index + 1}.
            </Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        size: 50,
        meta: {
          isNumeric: true,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqNumber,
        id: "requirementInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="200px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Req Number:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.reqNumber || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Narrative:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={2}>
                {info.row.original.reqNarative || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Memo Date:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.reqDate
                  ? formatDateToDDMMYYYY(new Date(info.row.original.reqDate))
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Receive Date:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.reqAcceptedDate
                  ? formatDateToDDMMYYYY(
                      new Date(info.row.original.reqAcceptedDate),
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Requirement Type:
              </Text>
              <Text
                fontSize="2xs"
                lineHeight="1.2"
                color={
                  info.row.original.projectType === "RFC"
                    ? "purple.500"
                    : info.row.original.projectType === "PROCUREMENT" &&
                        !info.row.original.reqNumber
                      ? "orange.500"
                      : "blue.500"
                }
              >
                {info.row.original.projectType === "RFC"
                  ? "RFC"
                  : info.row.original.reqNumber
                    ? "BRD"
                    : info.row.original.projectType === "PROCUREMENT"
                      ? "PROCUREMENT IT(WITHOUT REQUIREMENT)"
                      : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Requirements</span>,
        size: 200,
      },
      {
        accessorFn: (row) => row.projectName,
        id: "projectInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="250px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Project Number:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectNo}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Project Name:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={2}>
                {info.row.original.projectName}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Register Date:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {formatDateToDDMMYYYY(
                  new Date(info.row.original.projectRegisterDate),
                )}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Approved Date:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectApprovedDate
                  ? formatDateToDDMMYYYY(
                      new Date(info.row.original.projectApprovedDate),
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Project Type:
              </Text>
              <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
                {info.row.original.projectType}
              </Badge>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Characteristic:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectCategory || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Sub Characteristic:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectSubCategory || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Project Information</span>,
        size: 250,
      },
      {
        accessorFn: (row) => row.projectOwnerDivisionName,
        id: "organization",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="200px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Owner Directorate:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectOwnerDirectorateName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Owner Division:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectOwnerDivisionName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Owner Group:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectOwnerGroupName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Manage Directorate:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectManageByDirectorateName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Manage Division:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectManageByDivisionName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Manage Group:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.projectManageByGroupName || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Owner & Management</span>,
        size: 200,
      },
      {
        accessorFn: (row) => row.reqUserPicName,
        id: "picInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="150px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                PIC Name:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.reqUserPicName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                PIC Phone:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.reqUserPicContanct || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                PIC Email:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={1}>
                {info.row.original.reqUserPicEmail || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>PIC Owner</span>,
        size: 150,
      },
      {
        accessorFn: (row) => row.workProgramExternalCode,
        id: "externalPrograms",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="180px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Program Code:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={2}>
                {info.row.original.workProgramExternalCode || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Program Name:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={2}>
                {info.row.original.workProgramExternalName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Budget:
              </Text>
              <Text
                fontSize="2xs"
                lineHeight="1.2"
                color="green.600"
                noOfLines={2}
              >
                {info.row.original.workProgramExternalBudget || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Proker User (External)</span>,
        size: 180,
      },
      {
        accessorFn: (row) => row.workProgramInternalCode,
        id: "internalPrograms",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="180px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Program Code:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={2}>
                {info.row.original.workProgramInternalCode || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Program Name:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={2}>
                {info.row.original.workProgramInternalName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Budget:
              </Text>
              <Text
                fontSize="2xs"
                lineHeight="1.2"
                color="blue.600"
                noOfLines={2}
              >
                {info.row.original.workProgramInternalBudget || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Proker IT (Internal)</span>,
        size: 180,
      },
      {
        accessorFn: (row) => row.projectStatus,
        id: "projectStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="120px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Status:
              </Text>
              <StatusBadge status={info.row.original.projectStatus} />
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Progress:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" color="purple.600">
                {info.row.original.projectStatusPercentage}%
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Project Status</span>,
        size: 120,
      },
      {
        accessorFn: (row) => row.proSdlcStageNameActive,
        id: "sdlcStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="150px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                SDLC Stage:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.proSdlcStageNameActive || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                App Short Name (Initial):
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.appShortName || "-"}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                App Name:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.appName || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>SDLC & Application</span>,
        size: 150,
      },
      {
        accessorFn: (row) => row.proAssigns,
        id: "teamAssign",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="150px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Team Members:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2" noOfLines={3}>
                {info.row.original.proAssigns || "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Team Assignment</span>,
        size: 150,
      },
      {
        accessorFn: (row) => row.timeCapture,
        id: "snapshotInfo",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"start"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
            minW="100px"
          >
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Date:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {formatDateToDDMMYYYY(new Date(info.row.original.timeCapture))}
              </Text>
            </Flex>
            <Flex fontSize={"2xs"} as={Stack} spacing={0}>
              <Text fontWeight={600} fontSize="2xs" lineHeight="1.2">
                Period:
              </Text>
              <Text fontSize="2xs" lineHeight="1.2">
                {info.row.original.yearPeriod}-Q
                {info.row.original.quartalPeriod}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Snapshot Info</span>,
        size: 100,
      },
      {
        accessorKey: "projectId",
        cell: (info) => (
          <HStack spacing={2} justify="center">
            <Button
              size="xs"
              colorScheme="blue"
              variant="outline"
              onClick={() => router.push(`/projects/manage?projectId=${info.row.original.projectId}`)}
            >
              Manage
            </Button>
            <Button
              size="xs"
              colorScheme="green"
              variant="outline"
              onClick={() => router.push(`/projects/preview?projectId=${info.row.original.projectId}`)}
            >
              Preview
            </Button>
            <Button
              size="xs"
              colorScheme="purple"
              variant="outline"
              onClick={() => handleOpenSdlcReport(info.row.original.projectId, info.row.original.projectName)}
            >
              SDLC Report
            </Button>
          </HStack>
        ),
        header: () => <span>Actions</span>,
        size: 200,
      },
    ],
    [pageIndex, pageSize],
  );

  // Table setup
  const table = useReactTable({
    data: DataReport,
    columns: columnsData,
    pageCount: totalPages ?? -1,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualFiltering: true,
  });

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!DataAuth || !tokenData) return;

      // Build initial filters with default year and quarter
      const initialFilters: any[] = [];
      
      if (FilterYear) {
        initialFilters.push({ Field: "yearPeriod", Value: FilterYear, Operator: "=" });
      }
      
      if (FilterQuarter) {
        initialFilters.push({ Field: "quartalPeriod", Value: FilterQuarter, Operator: "=" });
      }

      // Convert ParamFilter to backend format
      const backendFilters = ParamFilter.map(filter => ({
        Field: filter.field,
        Value: filter.value,
        Operator: filter.operator
      }));

      const payload: PaggingListPayloadCustom = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex, // Send 0-based page number, backend will calculate offset
        filterWhere: [...backendFilters, ...initialFilters],
        fieldOrder: ["projectRegisterDate"],
        orderDir: "desc",
      };

      // Convert to backend format for API call
      const backendPayload = {
        search: payload.search,
        limit: payload.limit,
        page: payload.page,
        FilterWhere: payload.filterWhere, // Convert to capital F
        FieldOrder: payload.fieldOrder, // Convert to capital F
        OrderDir: payload.orderDir, // Convert to capital O
      };

      setIsLoadingProcess(true);
      try {
        const response = await ListProjectActivePortofolio(backendPayload as any, tokenData);
        const isErrorResponse = response?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !response) {
          showToast({
            description: response?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }

        if (response.data == null) {
          showToast({
            description: "Data return error",
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        }

        const itemsData: ProjectActivePortofolioListResponse[] = response.data as ProjectActivePortofolioListResponse[];
        const totalData: number = response.countTotal as number;
        const totalPages: number = totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
        
        setDataReport(itemsData);
        setTotalPageData(totalPages);
        setIsLoadingProcess(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast({
          description: "Failed to fetch data",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
      }
    };

    fetchData();
  }, [DataAuth, tokenData, pageIndex, pageSize, globalFilter, ParamFilter, RefreshData, FilterYear, FilterQuarter]);

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Card borderRadius={radiusStyle} mb={4}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Project Active Portfolio</Heading>
            <HStack spacing={3}>
              <Button
                leftIcon={<FaFileExcel />}
                colorScheme="green"
                variant="outline"
                size="sm"
                onClick={handleExportToExcel}
                isDisabled={DataReport.length === 0 || isExporting}
                isLoading={isExporting}
                loadingText="Exporting..."
              >
                Export Excel
              </Button>
              <Button
                leftIcon={<FiCamera />}
                colorScheme="green"
                size="sm"
                onClick={CreateSnapshot}
                isLoading={snapshotLoading}
                loadingText="Creating..."
              >
                Create Snapshot
              </Button>
              <Button
                leftIcon={<FiRefreshCcw />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={RefreshAction}
                isLoading={IsLoadingProcess}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <Grid templateColumns="repeat(5, 1fr)" gap={4} mb={4}>
            <GridItem>
              <Text fontSize="md" mb={2}>
                Search
              </Text>
              <Input
                placeholder="Search projects..."
                size="md"
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setPagination({ pageIndex: 0, pageSize });
                }}
                rounded={radiusStyle}
              />
            </GridItem>

            <GridItem>
              <Text fontSize="md" mb={2}>
                Project Type
              </Text>
              <Select
                placeholder="All Types"
                size="md"
                value={FilterProjectType}
                onChange={(e) => {
                  setFilterProjectType(e.target.value);
                  const newFilters = addParamFilterUpdate(ParamFilter, {
                    field: "projectType",
                    value: e.target.value,
                    operator: "=",
                    filterLabel: "Project Type",
                  });
                  handleFilterChange(newFilters);
                }}
                rounded={radiusStyle}
              >
                <option value={PROJECT_TYPE_INTERNAL_DEVELOPMENT}>
                  Internal Development
                </option>
                <option value={PROJECT_TYPE_PROCUREMENT}>Procurement</option>
                <option value="RFC">RFC</option>
              </Select>
            </GridItem>

            <GridItem>
              <Text fontSize="md" mb={2}>
                Project Status
              </Text>
              <Select
                placeholder="All Status"
                size="md"
                value={FilterProjectStatus}
                onChange={(e) => {
                  setFilterProjectStatus(e.target.value);
                  const newFilters = addParamFilterUpdate(ParamFilter, {
                    field: "projectStatus",
                    value: e.target.value,
                    operator: "=",
                    filterLabel: "Project Status",
                  });
                  handleFilterChange(newFilters);
                }}
                rounded={radiusStyle}
              >
                <option value="INITIATING">Initiating</option>
                <option value="RUNNING">Running</option>
                <option value="TEMPORARY CLOSED">Temporary Closed</option>
                <option value="CLOSED">Closed</option>
                <option value="ON HOLD">On Hold</option>
              </Select>
            </GridItem>

            <GridItem>
              <Text fontSize="md" mb={2}>
                Year
              </Text>
              <Select
                placeholder="All Years"
                size="md"
                value={FilterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  const newFilters = addParamFilterUpdate(ParamFilter, {
                    field: "yearPeriod",
                    value: e.target.value,
                    operator: "=",
                    filterLabel: "Year",
                  });
                  handleFilterChange(newFilters);
                }}
                rounded={radiusStyle}
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - 2 + i,
                ).map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Select>
            </GridItem>

            <GridItem>
              <Text fontSize="md" mb={2}>
                Quarter
              </Text>
              <Select
                placeholder="All Quarters"
                size="md"
                value={FilterQuarter}
                onChange={(e) => {
                  setFilterQuarter(e.target.value);
                  const newFilters = addParamFilterUpdate(ParamFilter, {
                    field: "quartalPeriod",
                    value: e.target.value,
                    operator: "=",
                    filterLabel: "Quarter",
                  });
                  handleFilterChange(newFilters);
                }}
                rounded={radiusStyle}
              >
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </Select>
            </GridItem>
          </Grid>

          {IsLoadingProcess ? (
            <LoadingMiniSignature />
          ) : (
            <TableComponentWithFilterCTX
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              isLoading={IsLoadingProcess}
              searchPlaceholder="Search projects..."
            />
          )}
        </CardBody>
      </Card>

      {/* SDLC Report Modal */}
      <SdlcReportModal
        isOpen={isSdlcModalOpen}
        onClose={onSdlcModalClose}
        projectId={selectedProjectId}
        projectName={selectedProjectName}
      />

      {/* Export Caution Modal */}
      <Modal isOpen={isCautionModalOpen} onClose={onCautionModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              This export may take some time to process due to the large amount of data.
            </Alert>
            <Text>
              Are you sure you want to export all project active portfolio data to Excel? 
              This will include all current filters and may generate a large file.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCautionModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={confirmExportToExcel}
              isLoading={isExporting}
              loadingText="Exporting..."
            >
              Export Excel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

export default ProjectActivePortfolioReportPage;
