"use client";

import { Suspense } from "react";
import CoverLockedFeature from "@/app/components/coverLockedFeature";
import {
  CustomPanelAlert,
  InputGroupPanel,
} from "@/app/components/customPanels";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import { WeekdayView } from "@/app/components/inputProps/WeekDaySelector";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  InputLayout,
  InputLayoutFull,
  InputLayoutFullHalf,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  TableComponentWithFilterCTX,
  TableComponentWithFilterCTXNoBorder,
} from "@/app/components/tableComponentV2";
import {
  ENDPOINT_PORT_BASIC_OBJECT,
  ENDPOINT_API_BASEURL_OBJECT,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import {
  REQ_STATUS_APPROVED,
  REQ_STATUS_CANCELED,
  REQ_STATUS_NEED_REVIEW,
  REQ_STATUS_ON_HOLD,
  REQ_STATUS_TEMPORARY_APPROVED,
  REQ_WAITING_APPROVAL,
  STATUS_COLORS,
} from "@/app/constants/masterStatusConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  buildUrlPort,
  formatDateInputCustom,
  formatDateTimeBE,
  formatToRupiah,
  getQuarterText,
  ImagePreviewSM,
  joinFieldValues,
  NoMemoAlertText,
  renderFileIconSTR,
  SummaryStatusReq,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { MediaObjectResponse } from "@/app/services/useMediaObject";
import useRequirements, {
  BacklogDataResponse,
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
  RequirementApprovalPayload,
} from "@/app/services/useRequirements";
import { SysModuleStatusFlowResponse } from "@/app/services/useSysModuleGroup";
import {
  ColumnMetaCustom,
  ListSearchByParam,
  ListSearchByParamProps,
  PaggingListPayload,
  PaggingListPayloadCustom,
  StepsProps,
} from "@/app/types/masterTypes";

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Wrap,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  StepNumber,
  HStack,
  Divider,
  FormControl,
  FormLabel,
  OrderedList,
  ListItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  RadioGroup,
  Radio,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  VStack,
  IconButton,
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
import { u } from "framer-motion/client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertOctagon,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiCpu,
  FiDownload,
  FiEye,
  FiFileText,
  FiInfo,
  FiRefreshCcw,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Detail",
  breadCrumb: ["Home", "Requirements", "Detail"],
};

// Crucial data alert component for detail view
interface CrucialDataAlertDetailProps {
  requirementData: any;
  setActiveStep: (step: number) => void;
  requirementType: string;
  pageMode: string;
}

const CrucialDataAlertDetail: React.FC<CrucialDataAlertDetailProps> = ({ requirementData, setActiveStep, requirementType, pageMode }) => {
  const hasAppData = requirementData.appInitialCode && requirementData.appInitialCode.trim() !== "";
  const hasBacklogData = requirementData.backlogCount && requirementData.backlogCount > 0;

  // Only show if missing critical data
  if (hasAppData && hasBacklogData) {
    return null;
  }

  const missingItems = [];
  if (!hasAppData) missingItems.push("Aplikasi");
  if (!hasBacklogData) missingItems.push("Backlog Features");

  return (
    <Alert status="warning" variant="left-accent" mb={4}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="md" mb={1}>
          Data Penting Belum Lengkap!
        </AlertTitle>
        <AlertDescription fontSize="sm">
          Requirement ini masih memerlukan data berikut untuk dapat digunakan dalam proyek:
          <VStack align="start" mt={2} spacing={1}>
            {missingItems.map((item, index) => (
              <HStack key={index} spacing={2}>
                <Text>•</Text>
                <Text fontWeight="semibold">{item}</Text>
              </HStack>
            ))}
          </VStack>
        </AlertDescription>
      </Box>
      {pageMode === "VIEW_DETAIL" ? (
        <Link href={`/requirements/${requirementType.toLowerCase()}/register?id=${requirementData.id}`}>
          <Button
            colorScheme="orange"
            size="sm"
            leftIcon={<FiArrowRight />}
          >
            Lihat Data
          </Button>
        </Link>
      ) : (
        <Button
          colorScheme="orange"
          size="sm"
          leftIcon={<FiArrowRight />}
          onClick={() => setActiveStep(0)}
        >
          Lihat Data
        </Button>
      )}
    </Alert>
  );
};

// Projects relation component for detail view
interface ProjectsRelationSectionDetailProps {
  requirementId: string;
}

const ProjectsRelationSectionDetail: React.FC<ProjectsRelationSectionDetailProps> = ({ requirementId }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { GetProjectsByRequirementId } = useRequirements();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!requirementId) return;

      setIsLoading(true);
      try {
        const authData = localStorage.getItem("authData");
        const token = localStorage.getItem("tokenData");
        if (authData && token) {
          const response = await GetProjectsByRequirementId(requirementId, token);

          if (response && response.statusCode === RES_CODE_OK && response.data) {
            setProjects(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [requirementId]);

  if (isLoading) {
    return (
      <InputGroupPanel headerTitle="Informasi Proyek Terkait">
        <Flex justify="center" align="center" minH="100px">
          <LoadingMiniSignature />
        </Flex>
      </InputGroupPanel>
    );
  }

  if (projects.length === 0) {
    return (
      <InputGroupPanel headerTitle="Informasi Proyek Terkait">
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            Requirement ini belum terdaftar ke dalam proyek apapun.
          </AlertDescription>
        </Alert>
      </InputGroupPanel>
    );
  }

  return (
    <InputGroupPanel headerTitle={`Informasi Proyek Terkait (${projects.length} Proyek)`}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="sm" color="gray.600">
          Requirement ini telah terdaftar ke dalam {projects.length} proyek berikut:
        </Text>

        {projects.map((project, index) => (
          <Box
            key={project.id}
            p={4}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            bg="gray.50"
          >
            <Flex justify="space-between" align="start">
              <VStack align="start" spacing={2} flex={1}>
                <HStack>
                  <Badge colorScheme="blue" variant="solid">
                    {project.projectNo}
                  </Badge>
                  <Badge colorScheme={project.projectStatus === "RUNNING" ? "green" : "orange"}>
                    {project.projectStatus}
                  </Badge>
                </HStack>
                <Text fontWeight="semibold" fontSize="md">
                  {project.projectName}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {project.projectDesc}
                </Text>
                <HStack spacing={4} fontSize="xs" color="gray.500">
                  <Text>Tipe: {project.projectType}</Text>
                  <Text>Kategori: {project.projectCategory}</Text>
                </HStack>
              </VStack>
            </Flex>
          </Box>
        ))}
      </VStack>
    </InputGroupPanel>
  );
};

const PAGE_MODE: string = "VIEW_DETAIL";
// const PAGE_MODE: string = "REVIEWER";

function RequirementDetailView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const reqId = searchParams.get("reqId");
  const reqType = searchParams.get("type") || "BRD"; // Dynamic type from URL
  const approvalMode = searchParams.get("approvalMode") === "true"; // Check if in approval mode
  const [PageMode, setPageMode] = useState<string>(PAGE_MODE);

  // Dynamic header based on type
  const getHeaderTitle = () => {
    switch (reqType) {
      case "RFC":
        return "Detail Requirement RFC";
      case "BRD":
      default:
        return "Detail Requirement BRD";
    }
  };

  const getHeaderBreadcrumb = () => {
    switch (reqType) {
      case "RFC":
        return [
          { name: "Requirements", href: "/requirements" },
          { name: "RFC List", href: "/requirements?type=RFC" },
          { name: "Detail RFC", href: "#" },
        ];
      case "BRD":
      default:
        return [
          { name: "Requirements", href: "/requirements" },
          { name: "BRD List", href: "/requirements?type=BRD" },
          { name: "Detail BRD", href: "#" },
        ];
    }
  };

  const getTypeSpecificLabel = (baseLabel: string) => {
    switch (reqType) {
      case "RFC":
        return baseLabel.replace("BRD", "RFC").replace("Business", "Change");
      case "BRD":
      default:
        return baseLabel;
    }
  };

  const { GetDetailById, ListBacklog, ListReqMedia, ApproveRequirement, GetApprovalStatusChoices } = useRequirements();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [canApprove, setCanApprove] = useState<boolean>(false);

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

    // Load approval permission from accessData
    const accessDataStr = localStorage.getItem("accessData");
    if (accessDataStr) {
      try {
        const accessData = JSON.parse(accessDataStr);
        setCanApprove(accessData.aggregatedPermissions?.canApprove || false);
      } catch (error) {
        console.error("Failed to parse accessData:", error);
      }
    }
  }, []);

  // Validate approval mode access
  useEffect(() => {
    if (approvalMode && canApprove === false) {
      // If in approval mode but user doesn't have approve permission, redirect to forbidden
      const accessDataStr = localStorage.getItem("accessData");
      if (accessDataStr) {
        try {
          const accessData = JSON.parse(accessDataStr);
          const hasApprovePermission = accessData.aggregatedPermissions?.canApprove || false;

          if (!hasApprovePermission) {
            router.push("/forbidden");
          }
        } catch (error) {
          router.push("/forbidden");
        }
      } else {
        router.push("/forbidden");
      }
    }
  }, [approvalMode, canApprove, router]);
  // End SetUp auth data on current page

  const [ReqId, setReqId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const id = searchParams.get("reqId");
    if (id) {
      setReqId(id); // Set it to the state
    }
  }, [searchParams]);

  const [DataRequirement, setDataRequirement] =
    useState<RequirementsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(true);

  // Add a client-side only flag to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // GetServiceListBacklog
  const [IsloadingBacklogs, setIsloadingBacklogs] = useState(false);
  const [DataBacklogsRequirement, setDataBacklogsRequirement] = useState<
    BacklogDataResponse[]
  >([]);

  const [DataFileReq, setDataFileReq] = useState<MediaObjectResponse[]>([]);

  const columnsDataBacklogs = useMemo<ColumnDef<BacklogDataResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
            <Text>{info.row.index + 1}.</Text>
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
        accessorFn: (row) => row.backlogCode,
        id: "backlogCode",
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
                <Text fontWeight={600}>{info.row.original.backlogName}</Text>
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Nama Scope</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.backlogDesc,
        id: "backlogDesc",
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
              <Text as={"p"}>{info.row.original.backlogDesc}</Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Deskripsi Scope</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [colorMode]
  );

  const GetListBacklogServices = async (req_id: string) => {
    if (DataAuth && DataAuth.team && DataRequirement && tokenData) {
      const PayloadList: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "reqId",
            operator: "=",
            value: req_id,
          },
        ],
        fieldOrder: ["backlogName"],
        orderDir: "asc",
      };

      setIsloadingBacklogs(true);
      const requestData = await ListBacklog(PayloadList, tokenData);
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsloadingBacklogs(false);
        return;
      } else {
        // console.log(requestData);
        if (requestData.data == null) {
          showToast({
            description: "Data return error",
            statusToast: "error",
          });
          setIsloadingBacklogs(false);
          return;
        }

        const itemsData: BacklogDataResponse[] =
          requestData.data as BacklogDataResponse[];
        setDataBacklogsRequirement(itemsData);
        setIsloadingBacklogs(false);
      }
    }
  };

  const ModalBacklog = useDisclosure();

  const OpenBacklogModal = () => {
    ModalBacklog.onOpen();
  };

  // END GetServiceListBacklog

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // onload data
  useEffect(() => {
    if (tokenData && ReqId) {
      const GetDataList = async () => {
        const requestData = await GetDetailById(ReqId, tokenData);
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

          const itemsData: RequirementsResponse =
            requestData.data as RequirementsResponse;

          setDataRequirement(itemsData);

          setHeaderContentState({
            titleName: `${reqType} Detail #${itemsData.isHaveMemo === "Y" ? itemsData.reqNumber : (itemsData.reqNarative && itemsData.reqNarative.length > 15 ? itemsData.reqNarative.substring(0, 15) + "..." : itemsData.reqNarative)}`,
            breadCrumb: [
              "Home",
              "Requirements",
              reqType === "RFC" ? "RFC List" : "BRD List",
              "Detail",
            ],
            titleTooltip: itemsData.isHaveMemo === "N" && itemsData.reqNarative && itemsData.reqNarative.length > 15 ? itemsData.reqNarative : undefined,
          });

          // backlogs load
          const PayloadList: PaggingListPayload = {
            search: "",
            limit: MAX_SIZE_TABLE,
            page: 0,
            filterWhere: [
              {
                field: "reqId",
                operator: "=",
                value: itemsData.id,
              },
            ],
            fieldOrder: ["backlogName"],
            orderDir: "asc",
          };
          const requestDataBacklogs = await ListBacklog(PayloadList, tokenData);
          if (requestDataBacklogs) {
            if (requestDataBacklogs.data == null) {
              showToast({
                description: "Data return error",
                statusToast: "error",
              });
              return;
            }

            const itemsDatabacklogs: BacklogDataResponse[] =
              requestDataBacklogs.data as BacklogDataResponse[];
            setDataBacklogsRequirement(itemsDatabacklogs);
          }

          // fileAttachment Load

          const PayloadAttachmentList: PaggingListPayloadCustom = {
            search: "",
            reqId: itemsData.id,
            limit: MAX_SIZE_TABLE,
            page: 0,
            filterWhere: [],
            fieldOrder: ["createdAt"],
            orderDir: "desc",
          };

          const requestDataAttachments = await ListReqMedia(
            PayloadAttachmentList,
            tokenData
          );
          const isErrorResponseAttch =
            requestDataAttachments?.statusCode !== RES_CODE_OK;

          if (isErrorResponseAttch || !requestDataAttachments) {
            showToast({
              description:
                requestDataAttachments?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          } else {
            console.log(requestDataAttachments);
            if (requestDataAttachments.data == null) {
              showToast({
                description: "Data return error",
                statusToast: "error",
              });
              setIsLoadingProcess(false);
              return;
            }

            const itemsDataAttch: MediaObjectResponse[] =
              requestDataAttachments.data as MediaObjectResponse[];

            setDataFileReq(itemsDataAttch);
          }

          setIsLoadingProcess(false);
        }

        // await GetListBacklogServices(ReqId);
      };
      GetDataList();
    }
  }, [tokenData, RefreshData, ReqId]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    console.log("handleFilterChange");
    console.log(newFilters);
    // not implemented
  };

  // auto page backlog
  const tableBacklogs = useReactTable({
    data: DataBacklogsRequirement,
    columns: columnsDataBacklogs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    manualFiltering: false,
    manualPagination: false,
  });

  // step setup
  const steps: StepsProps[] = [
    { title: "Step 1", description: "Informasi Umum" },
    { title: "Step 2", description: "Penugasan Personil & User" },
    { title: "Step 3", description: "Program Kerja" },
    { title: "Step 4", description: "Ringkasan Ruanglingkup" },
    ...(reqType === "RFC"
      ? [{ title: "Step 5", description: "Perubahan Sistem" }]
      : []),
    {
      title: reqType === "RFC" ? "Step 6" : "Step 5",
      description: "Lampiran & Approval",
    },
    ...(!approvalMode
      ? [
        {
          title: reqType === "RFC" ? "Step 7" : "Step 6",
          description: `${reqType} Acceptance`,
        },
      ]
      : []),
  ];

  // Only initialize steps on client-side to prevent hydration mismatch
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const goToNext = async () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const goToPrev = async () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // end step setup

  // Update status Reuirements
  const [StatusRequirement, setStatusRequirement] = useState<string | null>(
    null
  );
  const [ApprovalNote, setApprovalNote] = useState<string | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<SysModuleStatusFlowResponse[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const { isOpen: isApprovalModalOpen, onOpen: onApprovalModalOpen, onClose: onApprovalModalClose } = useDisclosure();

  // Load available statuses for approval
  useEffect(() => {
    const loadAvailableStatuses = async () => {
      if (!tokenData) return;

      setIsLoadingStatuses(true);
      try {
        const result = await GetApprovalStatusChoices(tokenData);
        if (result?.statusCode === RES_CODE_OK && result.data) {
          setAvailableStatuses(result.data);
        }
      } catch (error) {
        console.error("Error loading statuses:", error);
      } finally {
        setIsLoadingStatuses(false);
      }
    };

    loadAvailableStatuses();
  }, [tokenData]);

  const handleApprovalSubmit = async () => {
    if (!StatusRequirement) {
      showToast({
        description: "Please select a status",
        statusToast: "warning",
      });
      return;
    }

    if (!DataRequirement?.id) {
      showToast({
        description: "Requirement data not loaded",
        statusToast: "error",
      });
      return;
    }

    setIsSubmittingApproval(true);
    try {
      const payload: RequirementApprovalPayload = {
        id: DataRequirement.id,
        statusApprove: StatusRequirement,
        noteApproval: ApprovalNote,
      };

      const result = await ApproveRequirement(payload, tokenData);
      if (result?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Requirement approved successfully",
          statusToast: "success",
        });
        onApprovalModalClose();
        // Route back to BRD/RFC view
        router.push("/requirements/brd-rfc");
      } else {
        showToast({
          description: result?.message || "Failed to approve requirement",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while approving",
        statusToast: "error",
      });
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const ActionApprovalChangeStatus = () => {
    if (!StatusRequirement) {
      showToast({
        description: "Please select a status",
        statusToast: "warning",
      });
      return;
    }
    onApprovalModalOpen();
  };

  // End - Update status Reuirements

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"} pb={2}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
          <Link href="/requirements/brd-rfc">
            <Button leftIcon={<FiArrowLeft />} size={"md"}>
              Back
            </Button>
          </Link>
        </GridItem>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
          <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
            <Button
              size={"md"}
              leftIcon={<FiRefreshCcw />}
              onClick={() => RefreshAction()}
              colorScheme={"secondary"}
            >
              Muat Ulang
            </Button>
          </Flex>
        </GridItem>
      </Grid>

      <Modal
        size={"5xl"}
        isOpen={ModalBacklog.isOpen}
        isCentered
        onClose={ModalBacklog.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{`Data Scope of Work`}</ModalHeader>
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"} spacing={5}>
              {IsLoadingProcess ? (
                <LoadingMiniSignature />
              ) : DataRequirement?.requirementType === "RFC" ? (
                <RfcBacklogChangesView
                  DataBacklogs={DataBacklogsRequirement}
                  colorMode={colorMode}
                />
              ) : (
                <TableComponentWithFilterCTX
                  table={tableBacklogs}
                  handleFilterChange={handleFilterChange}
                />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Main content area - only render when not loading or when client-side mounted */}
      {!IsLoadingProcess ? (
        <Flex
          bg={colorMode == "light" ? "white" : "gray.700"}
          px={5}
          py={6}
          rounded={radiusStyle}
          w={"full"}
          justify={"space-between"}
          boxShadow={"md"}
        >
          <Flex w={"full"}>
            {ReqId && DataRequirement ? (
              <Flex w={"full"} as={Stack}>
                {/* Only render steppers when client-side mounted */}
                {isMounted && (
                  <>
                    <Stepper
                      index={steps.length}
                      orientation={"horizontal"}
                      height={"full"}
                      pb={4}
                      overflowX={"auto"}
                      display={{
                        base: "flex",
                        sm: "flex",
                        md: "flex",
                        lg: "none",
                      }}
                    >
                      <Step>
                        <StepIndicator>
                          <StepStatus />
                        </StepIndicator>

                        <Box flexShrink="0">
                          <StepTitle fontWeight={600}>
                            {steps[activeStep].title} / {steps.length}
                          </StepTitle>
                          <StepDescription>
                            {steps[activeStep].description}
                          </StepDescription>
                        </Box>

                        <StepSeparator />
                      </Step>
                    </Stepper>
                    <Stepper
                      index={activeStep}
                      orientation={"horizontal"}
                      height={"full"}
                      pb={4}
                      overflowX={"auto"}
                      display={{
                        base: "none",
                        sm: "none",
                        md: "none",
                        lg: "flex",
                      }}
                    >
                      {steps.map((step, index) => (
                        <Step key={index} onClick={() => setActiveStep(index)} style={{ cursor: 'pointer' }}>
                          <StepIndicator>
                            <StepStatus
                              complete={<StepNumber />}
                              incomplete={<StepNumber />}
                              active={<StepNumber />}
                            />
                          </StepIndicator>

                          <Box flexShrink="0">
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription>
                              {step.description}
                            </StepDescription>
                          </Box>

                          <StepSeparator />
                        </Step>
                      ))}
                    </Stepper>

                    <Divider mb={3} />

                    <Box w={"full"}>
                      {DataRequirement.isHaveMemo == "N" && (
                        <Alert
                          status="warning"
                          variant="subtle"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          textAlign="center"
                          height="200px"
                          rounded={radiusStyle}
                          mb={3}
                        >
                          <AlertIcon boxSize="40px" mr={0} />
                          <AlertTitle mt={4} mb={1} fontSize="lg">
                            Memo Belum Ada!
                          </AlertTitle>
                          <AlertDescription maxWidth="sm">
                            Informasi umum tidak ada karena memo pengantar belum
                            ada. Tapi dapat diisi kembali pada saat project
                            berjalan.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Crucial Alert for Non-Approved Requirements Missing Apps/Backlog Data */}

                      <CrucialDataAlertDetail
                        requirementData={DataRequirement}
                        setActiveStep={setActiveStep}
                        requirementType={reqType}
                        pageMode={PageMode}
                      />
                    </Box>

                    {/* Only render step content when client-side mounted */}
                    {activeStep === 0 && (
                      <Box position="relative">
                        <Flex as={Stack} w={"full"} spacing={5}>
                          <ReqInfoGeneralSectionView
                            DataRequirement={DataRequirement}
                            steps={steps}
                            activeStep={activeStep}
                          />

                          {/* Projects Section - Only show when requirement is approved */}
                          {DataRequirement.reqStatus === "APPROVED" && (
                            <ProjectsRelationSectionDetail requirementId={DataRequirement.id} />
                          )}

                          {/* Lock overlay */}
                          {/* {DataRequirement.isHaveMemo == "N" && (
                            <CoverLockedFeature
                              title={"Inputan Terkunci"}
                              desc={
                                "Informasi umum tidak ada karena memo pengantar belum ada. Tapi dapat diisi kembali pada saat project berjalan."
                              }
                            />
                          )} */}
                        </Flex>
                      </Box>
                    )}

                    {activeStep === 1 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <ReqInfoPersonelSectionView
                          DataRequirement={DataRequirement}
                          steps={steps}
                          activeStep={activeStep}
                        />
                      </Flex>
                    )}

                    {activeStep === 2 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <ReqInfoWorkProgramsView
                          DataRequirement={DataRequirement}
                          steps={steps}
                          activeStep={activeStep}
                        />
                      </Flex>
                    )}

                    {activeStep === 3 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={`Ringkasan Ruanglingkup ${DataRequirement.requirementType} | Aspek Bisnis`}
                        >
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Inisial Aplikasi
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appInitialCode || "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nama Aplikasi
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appInitialName || "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Target Pengguna
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appTargetUsers == "INTERNAL"
                                    ? "INTERNAL (BANK)"
                                    : DataRequirement.appTargetUsers ==
                                      "EXTERNAL"
                                      ? "EXTERNAL (NASABAH)"
                                      : "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Media Akses Aplikasi
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                {DataRequirement.appAccessFrontsiteDns ||
                                  DataRequirement.appAccessBacksiteIp ? (
                                  <>
                                    {DataRequirement.appAccessFrontsiteDns && (
                                      <Text>
                                        Internet (Publik) :{" "}
                                        <Text
                                          pl={2}
                                          as={"span"}
                                          fontWeight={600}
                                        >
                                          {
                                            DataRequirement.appAccessFrontsiteDns
                                          }
                                        </Text>
                                      </Text>
                                    )}
                                    {DataRequirement.appAccessBacksiteIp && (
                                      <Text>
                                        Intranet (Untuk BackOffice Bank) :{" "}
                                        <Text
                                          pl={2}
                                          as={"span"}
                                          fontWeight={600}
                                        >
                                          {DataRequirement.appAccessBacksiteIp}
                                        </Text>
                                      </Text>
                                    )}
                                  </>
                                ) : (
                                  <Text>N/A</Text>
                                )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Jenis Aplikasi
                              </FormLabel>
                              <Stack spacing={2} h={"full"}>
                                <Text>{DataRequirement.appTypes || "N/A"}</Text>
                                {DataRequirement.appTypeCustom && (
                                  <Text>
                                    Lainnya :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appTypeCustom}
                                    </Text>
                                  </Text>
                                )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Keterkaitan Aplikasi
                              </FormLabel>
                              <Stack spacing={2} h={"full"}>
                                <Text>
                                  {DataRequirement.appRelatedness || "N/A"}
                                </Text>
                                {DataRequirement.appRelatednessDesc && (
                                  <Text>
                                    Lainnya :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appRelatednessDesc}
                                    </Text>
                                  </Text>
                                )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Kategori Aplikasi
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appTransactionals || "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Waktu Operasional Aplikasi
                              </FormLabel>
                              <Stack spacing={2} h={"full"}>
                                <Text>
                                  24 Jam :{" "}
                                  <Text pl={2} as={"span"} fontWeight={600}>
                                    {DataRequirement.appOperational24hrs == null
                                      ? "N/A"
                                      : DataRequirement.appOperational24hrs ==
                                        "NO"
                                        ? "TIDAK"
                                        : "YA"}
                                  </Text>
                                </Text>

                                {DataRequirement.appOperationalDays != null ? (
                                  <>
                                    <Flex as={HStack}>
                                      <Text>Hari : </Text>
                                      <WeekdayView
                                        valueData={
                                          DataRequirement.appOperationalDays
                                        }
                                      />
                                    </Flex>
                                  </>
                                ) : (
                                  <Text>Hari : N/A</Text>
                                )}

                                {DataRequirement.appOperational24hrs !=
                                  "24-HOUR" && (
                                    <Text>
                                      Jam Buka :{" "}
                                      <Text pl={2} as={"span"} fontWeight={600}>
                                        {DataRequirement.appOperationalHourOpen ||
                                          "N/A"}
                                      </Text>
                                    </Text>
                                  )}
                                {DataRequirement.appOperational24hrs !=
                                  "24-HOUR" && (
                                    <Text>
                                      Jam Tutup :{" "}
                                      <Text pl={2} as={"span"} fontWeight={600}>
                                        {DataRequirement.appOperationalHourClosed ||
                                          "N/A"}
                                      </Text>
                                    </Text>
                                  )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Target Live
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appLiveTargetDate != null
                                    ? formatDateInputCustom(
                                      DataRequirement.appLiveTargetDate,
                                      "/"
                                    )
                                    : "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Terbilang Target Live
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {" "}
                                  {DataRequirement.appLiveTargetDate != null
                                    ? getQuarterText(
                                      DataRequirement.appLiveTargetDate
                                    )
                                    : "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Catatan
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>{DataRequirement.note || "N/A"}</Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Scope Aplikasi
                              </FormLabel>
                              <Box mt={-3}>
                                <Button
                                  onClick={() => {
                                    OpenBacklogModal();
                                  }}
                                  colorScheme="secondary"
                                  size="sm"
                                  leftIcon={<FiInfo />}
                                >
                                  Detail Scope of Work ({DataBacklogsRequirement.length}
                                  )
                                </Button>
                              </Box>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>

                        <InputGroupPanel
                          headerTitle={`Ringkasan Ruanglingkup ${DataRequirement.requirementType} | Aspek Teknis`}
                        >
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Target Lokasi Server
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appEnvLocations || "N/A"}
                                </Text>
                                {DataRequirement.appEnvLocationsOthers && (
                                  <Text>
                                    Lainnya :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appEnvLocationsOthers}
                                    </Text>
                                  </Text>
                                )}
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Otentikasi UIM Bank bjb
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appPrivateAuth != null
                                    ? DataRequirement.appPrivateAuth == "Y"
                                      ? "YA"
                                      : "TIDAK"
                                    : "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Keperluan High Availability
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appHightAvailability != null
                                    ? DataRequirement.appHightAvailability ==
                                      "Y"
                                      ? "YA"
                                      : "TIDAK"
                                    : "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Integrasi dengan aplikasi lain
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.appIntegrationOthersApps ||
                                    "N/A"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 4 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={steps[activeStep].description}
                        >
                          {/* <ReqAttachmentView
                            RefreshData={RefreshData}
                            ReqData={DataRequirement}
                            RefreshAction={RefreshAction}
                          /> */}
                          <ReqInfoSummaryFileAttachmentsView
                            DataRequirement={DataRequirement}
                            DataAttachment={DataFileReq}
                            steps={steps}
                            activeStep={activeStep}
                          />
                        </InputGroupPanel>

                        {canApprove && approvalMode && DataRequirement?.reqStatus === REQ_WAITING_APPROVAL && (
                          <InputGroupPanel headerTitle={"Update Status"}>
                            {DataRequirement?.isStatusFinal ? (
                              <Alert status="success" rounded="md">
                                <AlertIcon />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">
                                    Status Already Final
                                  </Text>
                                  <Text fontSize="sm">
                                    Current Status: <Badge colorScheme="green">{DataRequirement.reqStatus}</Badge>
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    This requirement has reached a final status and cannot be changed.
                                  </Text>
                                </VStack>
                              </Alert>
                            ) : (
                              <Flex as={Stack} spacing={4}>
                                <FormControl>
                                  <HStack spacing={4} align="center">
                                    <FormLabel mb={0} minW="120px">Status Approval</FormLabel>
                                    <RadioGroup
                                      value={StatusRequirement || ""}
                                      onChange={setStatusRequirement}
                                    >
                                      <HStack spacing={3}>
                                        {isLoadingStatuses ? (
                                          <Text fontSize="sm" color="gray.500">
                                            Loading statuses...
                                          </Text>
                                        ) : availableStatuses.length === 0 ? (
                                          <Text fontSize="sm" color="gray.500">
                                            No approval statuses available
                                          </Text>
                                        ) : (
                                          availableStatuses.map((status) => {
                                            const colorScheme = STATUS_COLORS[status.codeStatus as keyof typeof STATUS_COLORS] || "gray";
                                            const isSelected = StatusRequirement === status.codeStatus;
                                            return (
                                              <Box
                                                key={status.id}
                                                as="label"
                                                cursor="pointer"
                                                borderRadius="md"
                                                bg={`${colorScheme}.100`}
                                                px={3}
                                                py={2}
                                                onDoubleClick={() => {
                                                  if (isSelected) {
                                                    setStatusRequirement("");
                                                  }
                                                }}
                                              >
                                                <Radio 
                                                  value={status.codeStatus} 
                                                  colorScheme="blackAlpha"
                                                  sx={{
                                                    '[data-checked]': {
                                                      bg: 'black',
                                                      borderColor: 'black',
                                                    }
                                                  }}
                                                >
                                                  <Text fontSize="sm" fontWeight="bold" color={`${colorScheme}.700`}>
                                                    {status.nameStatus}
                                                  </Text>
                                                </Radio>
                                              </Box>
                                            );
                                          })
                                        )}
                                      </HStack>
                                    </RadioGroup>
                                  </HStack>
                                </FormControl>

                                <FormControl>
                                  <HStack spacing={4} align="start">
                                    <FormLabel mb={0} minW="120px">Note Approval</FormLabel>
                                    <Textarea
                                      value={ApprovalNote || ""}
                                      onChange={(e) => setApprovalNote(e.target.value)}
                                      placeholder="Enter approval note (optional)"
                                      rows={4}
                                      flex="1"
                                    />
                                  </HStack>
                                </FormControl>

                                <Flex justifyContent="flex-end">
                                  <Button
                                    colorScheme="blue"
                                    onClick={ActionApprovalChangeStatus}
                                    isDisabled={!StatusRequirement || isSubmittingApproval}
                                  >
                                    Submit Approval
                                  </Button>
                                </Flex>
                              </Flex>
                            )}
                          </InputGroupPanel>
                        )}
                      </Flex>
                    )}

                    {reqType === "RFC" && activeStep === 5 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={steps[activeStep].description}
                        >
                          <RfcBacklogChangesView
                            DataBacklogs={DataBacklogsRequirement}
                            colorMode={colorMode}
                          />
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === (reqType === "RFC" ? 6 : 5) && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <ReqInfoGeneralSectionView
                          DataRequirement={DataRequirement}
                          steps={steps}
                          activeStep={activeStep}
                        />
                        <ReqInfoPersonelSectionView
                          DataRequirement={DataRequirement}
                          steps={steps}
                          activeStep={activeStep}
                        />
                        <ReqInfoWorkProgramsView
                          DataRequirement={DataRequirement}
                          steps={steps}
                          activeStep={activeStep}
                        />
                        <ReqInfoSummaryBacklogsView
                          DataRequirement={DataRequirement}
                          DataBacklogs={DataBacklogsRequirement}
                          steps={steps}
                          activeStep={activeStep}
                          OpenBacklogModal={OpenBacklogModal}
                        />

                        {/* Projects Section - Only show when requirement is approved */}
                        {DataRequirement.reqStatus === "APPROVED" && (
                          <ProjectsRelationSectionDetail requirementId={DataRequirement.id} />
                        )}

                        <InputGroupPanel headerTitle={`Lampiran`}>
                          <ReqInfoSummaryFileAttachmentsViewSimple
                            DataRequirement={DataRequirement}
                            DataAttachment={DataFileReq}
                            steps={steps}
                            activeStep={activeStep}
                          />
                        </InputGroupPanel>
                        <ReqInfoAcceptanceView
                          DataRequirement={DataRequirement}
                          steps={steps}
                          activeStep={activeStep}
                        />
                      </Flex>
                    )}

                    <Flex mt={10} w={"full"} justifyContent={"space-between"}>
                      <Button
                        onClick={goToPrev}
                        isDisabled={activeStep === 0}
                        variant="outline"
                        leftIcon={<FiArrowLeft />}
                      >
                        Sebelumnya
                      </Button>
                      <Flex w={"full"} justifyContent={"end"} as={HStack}>
                        <Button
                          onClick={goToNext}
                          isDisabled={activeStep === steps.length - 1}
                          colorScheme="blue"
                          rightIcon={<FiArrowRight />}
                          display={
                            activeStep === steps.length - 1 ? "none" : "flex"
                          }
                        >
                          Selanjutnya
                        </Button>
                        {activeStep === steps.length - 1 && !approvalMode && (
                          <Button
                            onClick={() => router.push("/requirements/brd-rfc")}
                            colorScheme="blue"
                          >
                            Finish
                          </Button>
                        )}
                      </Flex>
                    </Flex>

                    <Box
                      w={"full"}
                      overflowY={"auto"}
                      overflowX={"auto"}
                      maxH={"350px"}
                      p={4}
                      bgColor={"gray.200"}
                      rounded={radiusStyle}
                      display={"none"}
                    >
                      <Text fontWeight={600}>Data Requirement</Text>
                      <pre>{JSON.stringify(DataRequirement, null, 2)}</pre>
                    </Box>
                  </>
                )}
              </Flex>
            ) : (
              <CustomPanelAlert type={"error"}>
                <FiAlertOctagon size={70} />
                <Text>Requirement ID tidak ditemukan.</Text>
              </CustomPanelAlert>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex
          bg={colorMode == "light" ? "white" : "gray.700"}
          px={5}
          py={6}
          rounded={radiusStyle}
          w={"full"}
          justify={"center"}
          boxShadow={"md"}
          minH="300px"
          alignItems="center"
        >
          <LoadingMiniSignature />
        </Flex>
      )}

      {/* Approval Confirmation Modal */}
      <Modal isOpen={isApprovalModalOpen} onClose={onApprovalModalClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent mx={4}>
          <ModalHeader fontSize="lg" fontWeight="bold">
            <HStack spacing={2}>
              <FiCheckCircle />
              <Text>Confirm Approval</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Box bg="gray.50" p={4} rounded="md" borderWidth="1px">
                <Stack spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Requirement
                    </Text>
                    <Text fontWeight="semibold">
                      {DataRequirement?.isHaveMemo === "Y"
                        ? DataRequirement?.reqNumber || "-"
                        : DataRequirement?.reqNarative || "-"}
                    </Text>
                  </Box>
                  
                  {approvalMode && (
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>
                        Submitted by
                      </Text>
                      <Text fontWeight="semibold">{DataRequirement?.assignedFromName || "-"}</Text>
                    </Box>
                  )}
                  
                  <Divider />
                  
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Approve Status
                    </Text>
                    <Badge 
                      colorScheme={STATUS_COLORS[StatusRequirement as keyof typeof STATUS_COLORS] || "blue"} 
                      fontSize="sm" 
                      px={2} 
                      py={1}
                    >
                      {availableStatuses.find((s) => s.codeStatus === StatusRequirement)?.nameStatus || StatusRequirement}
                    </Badge>
                  </Box>
                  
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Approve By
                    </Text>
                    <Text fontWeight="semibold">{DataAuth?.nama || "-"}</Text>
                  </Box>
                  
                  {ApprovalNote && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Note
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {ApprovalNote}
                        </Text>
                      </Box>
                    </>
                  )}
                </Stack>
              </Box>

              <Alert status="info" rounded="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Are you sure you want to approve this requirement with the selected status?
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" colorScheme="red" onClick={onApprovalModalClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiCheckCircle />}
              onClick={handleApprovalSubmit}
              isLoading={isSubmittingApproval}
            >
              Confirm Approval
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAdmin>
  );
}

interface ReqSectionProps {
  DataRequirement: RequirementsResponse;
  DataBacklogs?: BacklogDataResponse[];
  DataAttachment?: MediaObjectResponse[];
  steps: StepsProps[];
  activeStep: number;
  OpenBacklogModal?: () => void;
}

const ReqInfoGeneralSectionView = ({
  DataRequirement,
  steps,
  activeStep,
}: ReqSectionProps) => {
  return (
    <InputGroupPanel headerTitle={steps[activeStep].description}>
      <>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Diraktorat Pengirim
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement.isHaveMemo == "Y" ? (
                <Text>{DataRequirement.senderDirectorateName || "N/A"}</Text>
              ) : (
                <NoMemoAlertText />
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Divisi Pengirim
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement.isHaveMemo == "Y" ? (
                <Text>{DataRequirement.senderDivisionName || "N/A"}</Text>
              ) : (
                <NoMemoAlertText />
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Nomor Memo
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement.isHaveMemo == "Y" ? (
                <Text>{DataRequirement.reqNumber || "N/A"}</Text>
              ) : (
                <NoMemoAlertText />
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              {DataRequirement.isHaveMemo == "Y" ? "Perihal" : "Perihal Sementara"}
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement.isHaveMemo == "Y" ? (
                <Text>{DataRequirement.reqNarative || "N/A"}</Text>
              ) : (
                <Stack spacing={2}>
                  <Text>{DataRequirement.reqNarative || "N/A"}</Text>
                </Stack>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <Box my={5} />

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Tanggal Memo
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.reqInititateDate != null
                  ? formatDateInputCustom(DataRequirement.reqInititateDate, "/")
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Tanggal Memo Diterima
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.reqAcceptedDate != null
                  ? formatDateInputCustom(DataRequirement.reqAcceptedDate, "/")
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Durasi Memo
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.reqDurationDay != null
                  ? `${DataRequirement.reqDurationDay} Hari kalender`
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} as={"i"} mt={2}>
              CarryOver
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.isCarryOver == "Y"
                  ? "YA"
                  : DataRequirement.isCarryOver == "N"
                    ? "TIDAK"
                    : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </>
    </InputGroupPanel>
  );
};

const ReqInfoPersonelSectionView = ({
  DataRequirement,
  steps,
  activeStep,
}: ReqSectionProps) => {
  return (
    <>
      <InputGroupPanel
        headerTitle={`Penugasa Personil ${DataRequirement.requirementType}`}
      >
        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Tanggal Ditugaskan
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.assignedToDate != null
                  ? formatDateInputCustom(DataRequirement.assignedToDate, "/")
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Ditugaskan Oleh
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {`${DataRequirement.assignedFromName || "N/A"} (${DataRequirement.assignedFromId || "N/A"
                  })`}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Ditugaskan Ke
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement?.approvalDatas?.length ? (
                (() => {
                  const grouped = DataRequirement.approvalDatas.reduce(
                    (acc, member) => {
                      const groupCode = member.groupCode || "UNREGISTERED";
                      const groupName = member.groupName || "UNREGISTERED MEMBER GROUP";

                      if (!acc[groupCode]) {
                        acc[groupCode] = {
                          groupName,
                          members: [],
                        };
                      }
                      acc[groupCode].members.push(member);
                      return acc;
                    },
                    {} as Record<string, { groupName: string; members: typeof DataRequirement.approvalDatas }>
                  );

                  let memberIndex = 0;
                  return Object.entries(grouped).map(([groupCode, { groupName, members }]) => (
                    <Box key={groupCode} mb={3}>
                      <Text fontWeight={600} fontSize="md" mb={2}>
                        {groupName} ({members.length})
                      </Text>
                      <OrderedList start={memberIndex + 1}>
                        {members.map((ua, idx) => {
                          memberIndex++;
                          return (
                            <ListItem key={idx}>
                              {`${ua.approverUserFirstName ?? "N/A"} (${ua.approverUserCode ?? "N/A"})`}
                            </ListItem>
                          );
                        })}
                      </OrderedList>
                    </Box>
                  ));
                })()
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  Tidak ada data approval
                </Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>

      <InputGroupPanel headerTitle={`Division Requirement Managed By`}>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Divisi Yang Mengatur Requirement
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                Direktorat :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.reqManageByDirectorateName || "N/A"}
                </Text>
              </Text>
              <Text>
                Divisi :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.reqManageByDivisionName || "N/A"}
                </Text>
              </Text>
              <Text>
                Group :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.reqManageByGroupName || "N/A"}
                </Text>
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>

      <InputGroupPanel headerTitle={`Informasi Person In Charge (PIC)`}>
        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              User ID
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicId || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              NIK
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicIdentityNumber || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Nama Lengkap
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicName || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              No Handphne / Whatsapp
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicContanct || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Alamat E-Mail internal Bank bjb
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicEmail || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Lokasi Kerja
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                Direktorat :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.userPicDirectorateName || "N/A"}
                </Text>
              </Text>
              <Text>
                Divisi :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.userPicDivisionName || "N/A"}
                </Text>
              </Text>
              <Text>
                Group :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.userPicGroupName || "N/A"}
                </Text>
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>
    </>
  );
};

const ReqInfoWorkProgramsView = ({
  DataRequirement,
  steps,
  activeStep,
}: ReqSectionProps) => {
  const [WorkProgramExternal, setWorkProgramExternal] = useState<
    RequirementWorkProgramDataResponse[]
  >([]);
  const [WorkProgramInternal, setWorkProgramInternal] = useState<
    RequirementWorkProgramDataResponse[]
  >([]);

  useEffect(() => {
    if (
      DataRequirement.workPrograms != null &&
      DataRequirement.workPrograms.length > 0
    ) {
      const internalWorkPrograms = DataRequirement.workPrograms
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter((x) => x.workProgramSource === "INTERNAL");

      const externalWorkPrograms = DataRequirement.workPrograms
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter((x) => x.workProgramSource === "EXTERNAL");

      setWorkProgramInternal(internalWorkPrograms);
      setWorkProgramExternal(externalWorkPrograms);
    }
  }, [DataRequirement]);

  return (
    <>
      <InputGroupPanel headerTitle={`Program Kerja External`}>
        {WorkProgramExternal.length > 0 ? (
          <>
            {WorkProgramExternal.map((wp, idx) => (
              <Flex w={"full"} key={idx} as={Stack} spacing={5}>
                <Heading as="h4" size="md" pb={5}>
                  Program Kerja - {idx + 1}
                </Heading>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Divisi Proker Uer
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        Direktorat :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.directorateName || "N/A"}
                        </Text>
                      </Text>
                      <Text>
                        Divisi :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.divisionName || "N/A"}
                        </Text>
                      </Text>
                      <Text>
                        Group :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.groupName || "N/A"}
                        </Text>
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Kode Program Kerja
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramCode || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Program Kerja
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramName || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Akun Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccName || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nomor Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccNumber || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Kode Cost Center
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccCc || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        {wp.workProgramBudget != null
                          ? formatToRupiah(wp.workProgramBudget)
                          : "N/A"}
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Realisasi (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        {wp.workProgramReal != null
                          ? formatToRupiah(wp.workProgramReal)
                          : "N/A"}
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Sisa Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        {wp.workProgramLeftovers != null
                          ? formatToRupiah(wp.workProgramLeftovers)
                          : "N/A"}
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            ))}
          </>
        ) : (
          <Heading as="h5" size="sm">
            Program kerja tidak ada.
          </Heading>
        )}
      </InputGroupPanel>

      <InputGroupPanel headerTitle={`Program Kerja IT`}>
        {WorkProgramInternal.length > 0 ? (
          <>
            {WorkProgramInternal.map((wp, idx) => (
              <Flex w={"full"} key={idx} as={Stack} spacing={5}>
                <Heading as="h4" size="md" pb={5}>
                  Program Kerja - {idx + 1}
                </Heading>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Divisi Proker IT
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        Direktorat :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.directorateName || "N/A"}
                        </Text>
                      </Text>
                      <Text>
                        Divisi :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.divisionName || "N/A"}
                        </Text>
                      </Text>
                      <Text>
                        Group :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.groupName || "N/A"}
                        </Text>
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Kode Program Kerja
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramCode || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Program Kerja
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramName || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Akun Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccName || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nomor Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccNumber || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Kode Cost Center
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccCc || "N/A"}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        {wp.workProgramBudget != null
                          ? formatToRupiah(wp.workProgramBudget)
                          : "N/A"}
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Realisasi (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        {wp.workProgramReal != null
                          ? formatToRupiah(wp.workProgramReal)
                          : "N/A"}
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Sisa Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>
                        {wp.workProgramLeftovers != null
                          ? formatToRupiah(wp.workProgramLeftovers)
                          : "N/A"}
                      </Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            ))}
          </>
        ) : (
          <Heading as="h5" size="sm">
            Program kerja tidak ada.
          </Heading>
        )}
      </InputGroupPanel>
    </>
  );
};

const ReqInfoSummaryBacklogsView = ({
  DataRequirement,
  DataBacklogs,
  steps,
  activeStep,
  OpenBacklogModal,
}: ReqSectionProps) => {
  return (
    <>
      <InputGroupPanel
        headerTitle={`Ringkasan Ruanglingkup ${DataRequirement.requirementType} | Aspek Bisnis`}
      >
        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Inisial Aplikasi
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.appInitialCode || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Target Pengguna
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.appTargetUsers == "INTERNAL"
                  ? "INTERNAL (BANK)"
                  : DataRequirement.appTargetUsers == "EXTERNAL"
                    ? "EXTERNAL (NASABAH)"
                    : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Media Akses Aplikasi
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement.appAccessFrontsiteDns ||
                DataRequirement.appAccessBacksiteIp ? (
                <>
                  {DataRequirement.appAccessFrontsiteDns && (
                    <Text>
                      Internet (Publik) :{" "}
                      <Text pl={2} as={"span"} fontWeight={600}>
                        {DataRequirement.appAccessFrontsiteDns}
                      </Text>
                    </Text>
                  )}
                  {DataRequirement.appAccessBacksiteIp && (
                    <Text>
                      Intranet (Untuk BackOffice Bank) :{" "}
                      <Text pl={2} as={"span"} fontWeight={600}>
                        {DataRequirement.appAccessBacksiteIp}
                      </Text>
                    </Text>
                  )}
                </>
              ) : (
                <Text>N/A</Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Jenis Aplikasi
            </FormLabel>
            <Stack spacing={2} h={"full"}>
              <Text>{DataRequirement.appTypes || "N/A"}</Text>
              {DataRequirement.appTypeCustom && (
                <Text>
                  Lainnya :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appTypeCustom}
                  </Text>
                </Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Keterkaitan Aplikasi
            </FormLabel>
            <Stack spacing={2} h={"full"}>
              <Text>{DataRequirement.appRelatedness || "N/A"}</Text>
              {DataRequirement.appRelatednessDesc && (
                <Text>
                  Lainnya :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appRelatednessDesc}
                  </Text>
                </Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Kategori Aplikasi
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.appTransactionals || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Waktu Operasional Aplikasi
            </FormLabel>
            <Stack spacing={2} h={"full"}>
              <Text>
                24 Jam :{" "}
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.appOperational24hrs == null
                    ? "N/A"
                    : DataRequirement.appOperational24hrs == "NO"
                      ? "TIDAK"
                      : "YA"}
                </Text>
              </Text>

              {DataRequirement.appOperationalDays != null ? (
                <>
                  <Flex as={HStack}>
                    <Text>Hari : </Text>
                    <WeekdayView
                      valueData={DataRequirement.appOperationalDays}
                    />
                  </Flex>
                </>
              ) : (
                <Text>Hari : N/A</Text>
              )}

              {DataRequirement.appOperational24hrs != "24-HOUR" && (
                <Text>
                  Jam Buka :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appOperationalHourOpen || "N/A"}
                  </Text>
                </Text>
              )}
              {DataRequirement.appOperational24hrs != "24-HOUR" && (
                <Text>
                  Jam Tutup :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appOperationalHourClosed || "N/A"}
                  </Text>
                </Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Target Live
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.appLiveTargetDate != null
                  ? formatDateInputCustom(
                    DataRequirement.appLiveTargetDate,
                    "/"
                  )
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Terbilang Target Live
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {" "}
                {DataRequirement.appLiveTargetDate != null
                  ? getQuarterText(DataRequirement.appLiveTargetDate)
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Catatan
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.note || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Scope Aplikasi
            </FormLabel>
            <Box mt={-3}>
              <Button
                onClick={() => {
                  OpenBacklogModal?.();
                }}
                colorScheme="secondary"
                size="sm"
                leftIcon={<FiInfo />}
              >
                Detail Scope of Work ({DataBacklogs?.length || 0})
              </Button>
            </Box>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>

      <InputGroupPanel
        headerTitle={`Ringkasan Ruanglingkup ${DataRequirement.requirementType} | Aspek Teknis`}
      >
        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Target Lokasi Server
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.appEnvLocations || "N/A"}</Text>
              {DataRequirement.appEnvLocationsOthers && (
                <Text>
                  Lainnya :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appEnvLocationsOthers}
                  </Text>
                </Text>
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Otentikasi UIM Bank bjb
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.appPrivateAuth != null
                  ? DataRequirement.appPrivateAuth == "Y"
                    ? "YA"
                    : "TIDAK"
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Keperluan High Availability
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>
                {DataRequirement.appHightAvailability != null
                  ? DataRequirement.appHightAvailability == "Y"
                    ? "YA"
                    : "TIDAK"
                  : "N/A"}
              </Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Integrasi dengan aplikasi lain
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.appIntegrationOthersApps || "N/A"}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>
      </InputGroupPanel>
    </>
  );
};

const ReqInfoSummaryFileAttachmentsView = ({
  DataRequirement,
  DataAttachment,
  steps,
  activeStep,
}: ReqSectionProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const handleDownloadFile = (url: string) => {
    if (!url || url.trim() === "") {
      showToast({
        description: "URL file tidak tersedia",
        statusToast: "error",
      });
      return;
    }
    window.open(url, '_blank');
  };

  const columnsData = useMemo<ColumnDef<MediaObjectResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"}>{info.row.index + 1}.</Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectData,
        id: "objectData",
        cell: (info) => (
          <Flex justifyContent={"center"}>
            {[".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].some(
              (ext) =>
                info.row.original.objectExtension
                  .trim()
                  .toLowerCase()
                  .endsWith(ext)
            ) ? (
              <ImagePreviewSM
                data={{
                  id: info.row.original.id,
                  alt: info.row.original.objectRawName,
                  name: info.row.original.objectRawName,
                  src: info.row.original.objectFullPath,
                  extension: info.row.original.objectExtension.trim(),
                  // size:info.row.original.objectSize
                }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                boxSize="50px"
              >
                {renderFileIconSTR(info.row.original.objectExtension.trim())}
              </Box>
            )}
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}></Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectCode,
        id: "objectCode",
        cell: (info) => (
          <Stack spacing={0}>
            <Text fontWeight={600}>{info.row.original.objectRawName}</Text>
            {/* <Link href={info.row.original.objectFullPath}> */}
            {/* <Text>{info.row.original.objectData}</Text> */}
            {/* </Link> */}
          </Stack>
        ),
        header: () => <span>Nama File</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectSize,
        id: "objectSize",
        cell: (info) => (
          <Text fontWeight={500}>{info.row.original.objectSize} KB</Text>
        ),
        header: () => <span>Ukuran</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.objectExtension,
        id: "objectExtension",
        cell: (info) => (
          <Text fontWeight={500}>
            {info.row.original.objectExtension.replace(".", "")}
          </Text>
        ),
        header: () => <span>Tipe</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} as={Wrap} justifyContent={"start"}>
            <Button
              size={"sm"}
              colorScheme={"blue"}
              leftIcon={<FiDownload />}
              onClick={() =>
                handleDownloadFile(info.row.original.objectFullPath || "")
              }
            >
              Unduh
            </Button>
            {info.row.original.objectExtension.replace(".", "").trim() ==
              "pdf" && (
                <Button
                  size={"sm"}
                  colorScheme={"blue"}
                  onClick={() => {
                    handleOpenPreview(info.row.original.objectFullPath || "");
                  }}
                  leftIcon={<FiEye />}
                >
                  Pratinjau
                </Button>
              )}

            {/* <Button
                size={"sm"}
                colorScheme={"red"}
                onClick={() => handleConfirmDeleteData(info.row.original)}
                isLoading={ActionLoading}
              >
                <FiTrash2 />
              </Button> */}
          </Flex>
        ),
        header: () => (
          <Flex w={"full"} justifyContent={"center"}>
            Aksi
          </Flex>
        ),
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const table = useReactTable({
    data: DataAttachment || [],
    columns: columnsData,

    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
    manualFiltering: false,
    manualPagination: false,
  });

  // FORM
  const ModalForm = useDisclosure();

  // MODAL PREVIEW
  const ModalPreview = useDisclosure();
  const [UrlFilePDF, setUrlFilePDF] = useState<string>("");

  const handleOpenPreview = (urlData: string) => {
    if (!urlData || urlData.trim() === "") {
      showToast({
        description: "URL file tidak tersedia untuk pratinjau",
        statusToast: "error",
      });
      return;
    }

    setUrlFilePDF(urlData);
    ModalPreview.onOpen();
  };

  return (
    <>
      <Flex w={"full"} as={Stack} spacing={4}>
        {/* PREVIEW */}
        <Modal
          size={"6xl"}
          isOpen={ModalPreview.isOpen}
          isCentered
          onClose={ModalPreview.onClose}
          closeOnOverlayClick={true}
          scrollBehavior={"inside"}
        >
          <ModalOverlay bg="blackAlpha.300" />
          <ModalContent
            rounded={radiusStyle}
            m={2}
            bg={colorMode == "light" ? "white" : "gray.900"}
          >
            <ModalHeader>{`Pratinjau File`}</ModalHeader>
            <ModalCloseButton />
            <ModalBody w={"full"}>
              <Flex as={Stack} w={"full"}>
                {UrlFilePDF && UrlFilePDF.trim() !== "" ? (
                  <object
                    data={UrlFilePDF}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                    style={{ border: "none" }}
                  >
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(UrlFilePDF)}&embedded=true`}
                      width="100%"
                      height="600px"
                      style={{ border: "none" }}
                    />
                  </object>
                ) : (
                  <Flex
                    w="100%"
                    h="600px"
                    alignItems="center"
                    justifyContent="center"
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    rounded="md"
                  >
                    <Text color="gray.500">
                      File tidak dapat ditampilkan. URL tidak tersedia.
                    </Text>
                  </Flex>
                )}
                {/* <ExcelViewer
                        fileUrl={`/api/proxy-pdf?url=${encodeURIComponent(UrlFilePDF)}`}
                      /> */}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>

        <TableComponentWithFilterCTX table={table} />
      </Flex>
    </>
  );
};

const ReqInfoSummaryFileAttachmentsViewSimple = ({
  DataRequirement,
  DataAttachment,
  steps,
  activeStep,
}: ReqSectionProps) => {
  const { colorMode } = useColorMode();

  const columnsData = useMemo<ColumnDef<MediaObjectResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.objectData,
        id: "objectData",
        cell: (info) => (
          <Flex
            justifyContent={"left"}
            alignItems={"center"}
            as={HStack}
            spacing={3}
          >
            {[".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].some(
              (ext) =>
                info.row.original.objectExtension
                  .trim()
                  .toLowerCase()
                  .endsWith(ext)
            ) ? (
              <ImagePreviewSM
                data={{
                  id: info.row.original.id,
                  alt: info.row.original.objectRawName,
                  name: info.row.original.objectRawName,
                  src: info.row.original.objectFullPath,
                  extension: info.row.original.objectExtension.trim(),
                  // size:info.row.original.objectSize
                }}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                boxSize="50px"
              >
                {renderFileIconSTR(info.row.original.objectExtension.trim())}
              </Box>
            )}
            <Text fontWeight={600}>{info.row.original.objectRawName}</Text>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}></Flex>,
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const table = useReactTable({
    data: DataAttachment || [],
    columns: columnsData,

    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
    manualFiltering: false,
    manualPagination: true,
  });

  return (
    <>
      <Flex w={"full"} as={Stack} spacing={4}>
        <TableComponentWithFilterCTXNoBorder table={table} />
      </Flex>
    </>
  );
};

const ReqInfoAcceptanceView = ({
  DataRequirement,
  steps,
  activeStep,
}: ReqSectionProps) => {
  // Get latest history for review dates
  const latestHistory = DataRequirement?.requirementHistories && DataRequirement.requirementHistories.length > 0
    ? DataRequirement.requirementHistories[DataRequirement.requirementHistories.length - 1]
    : null;

  const reviewStartDate = DataRequirement.reqReviewStartDate || latestHistory?.reqReviewStartDate;
  const reviewEndDate = DataRequirement.reqReviewEndDate || latestHistory?.reqReviewEndDate;

  return (
    <>
      {DataRequirement?.requirementHistories && DataRequirement.requirementHistories.length > 0 ? (
        DataRequirement.requirementHistories.map((history, idx) => (
          <InputGroupPanel key={idx} headerTitle={`Former BRD Acceptance #${idx + 1}`}>
            <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
                <Flex as={Stack} w={"full"} spacing={5}>
                  <FormControl>
                    <InputLayoutFullHalf>
                      <FormLabel h={"full"} mt={2}>
                        Tanggal Mulai Review
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <Text>
                          {history.reqReviewStartDate != null
                            ? formatDateTimeBE(history.reqReviewStartDate)
                            : "N/A"}
                        </Text>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl>
                    <InputLayoutFullHalf>
                      <FormLabel h={"full"} mt={2}>
                        Tanggal Selesai Review
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <Text>
                          {history.reqReviewEndDate != null
                            ? formatDateTimeBE(history.reqReviewEndDate)
                            : "N/A"}
                        </Text>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>

                  <FormControl>
                    <InputLayoutFullHalf>
                      <FormLabel h={"full"} mt={2}>
                        Duration
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <Text>
                          {history.reqReviewStartDate && history.reqReviewEndDate
                            ? `${Math.ceil(
                              (new Date(history.reqReviewEndDate).getTime() -
                                new Date(history.reqReviewStartDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                            )} Hari`
                            : "N/A"}
                        </Text>
                      </Stack>
                    </InputLayoutFullHalf>
                  </FormControl>
                </Flex>
              </GridItem>
              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
                <Flex as={Stack} w={"full"} spacing={5}>
                  <FormControl>
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Diapprove Oleh
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <Text>{history.approvalNama || "N/A"}</Text>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  <FormControl>
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Catatan
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <Text>{history.approvalNote || "N/A"}</Text>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  <FormControl>
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Status
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <SummaryStatusReq status={history.reqStatus || "N/A"} />
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>
                </Flex>
              </GridItem>
            </Grid>
          </InputGroupPanel>
        ))
      ) : (
        <InputGroupPanel headerTitle={"Former BRD Acceptance"}>
          <Text color="gray.500" fontStyle="italic">Tidak ada data approval history</Text>
        </InputGroupPanel>
      )}
    </>
  );
};

// RFC Backlog Changes View Component
interface RfcBacklogChangesViewProps {
  DataBacklogs: BacklogDataResponse[];
  colorMode: string;
}

const RfcBacklogChangesView = ({
  DataBacklogs,
  colorMode,
}: RfcBacklogChangesViewProps) => {
  // Sort by posOrder descending
  const sortedBacklogs = [...DataBacklogs].sort(
    (a, b) => (b.posOrder || 0) - (a.posOrder || 0)
  );

  return (
    <Flex as={Stack} w={"full"} spacing={5}>
      {sortedBacklogs.length > 0 ? (
        sortedBacklogs.map((backlog, index) => (
          <Grid
            key={backlog.id}
            templateColumns="repeat(2, 1fr)"
            gap={4}
            w={"full"}
          >
            <GridItem colSpan={2} w={"full"}>
              <Flex as={HStack} w={"full"} justifyContent={"space-between"}>
                <Heading as="h5" size="sm">
                  Perubahan Sistem - {index + 1}
                </Heading>
                <Badge colorScheme="blue" size="sm">
                  {backlog.posOrder || index + 1}
                </Badge>
              </Flex>
            </GridItem>

            {/* BEFORE - Left Column */}
            <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
              <Flex
                as={Stack}
                w={"full"}
                p={5}
                rounded={radiusStyle}
                border={"2px"}
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                spacing={2}
                boxShadow={"md"}
                minH={"280px"}
              >
                <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                  <Heading as="h5" size="sm">
                    Kondisi Eksisting
                  </Heading>
                  <Badge
                    colorScheme={"gray"}
                    fontSize={"medium"}
                    px={2}
                    rounded={"md"}
                  >
                    Lama
                  </Badge>
                </Flex>
                <Divider borderColor={"gray.300"} />

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Scope
                    </FormLabel>
                    <Text>{backlog.reffData?.backlogName || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Deskripsi
                    </FormLabel>
                    <Text>{backlog.reffData?.backlogDesc || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Catatan
                    </FormLabel>
                    <Text>{backlog.reffData?.note || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Priority
                    </FormLabel>
                    <Badge colorScheme="gray">
                      {backlog.reffData?.posOrder || 0}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            </GridItem>

            {/* AFTER - Right Column */}
            <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
              <Flex
                as={Stack}
                w={"full"}
                p={5}
                rounded={radiusStyle}
                border={"2px"}
                borderColor={"secondary.300"}
                spacing={2}
                boxShadow={"md"}
                minH={"280px"}
              >
                <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                  <Heading as="h5" size="sm">
                    Kondisi Perubahan
                  </Heading>
                  <Badge
                    colorScheme={"secondary"}
                    fontSize={"medium"}
                    px={2}
                    rounded={"md"}
                  >
                    Baru
                  </Badge>
                </Flex>
                <Divider borderColor={"gray.300"} />

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Scope
                    </FormLabel>
                    <Text>{backlog.backlogName || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Deskripsi
                    </FormLabel>
                    <Text>{backlog.backlogDesc || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Catatan
                    </FormLabel>
                    <Text>{backlog.note || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Priority
                    </FormLabel>
                    <Badge colorScheme="secondary">
                      {backlog.posOrder || 0}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            </GridItem>
          </Grid>
        ))
      ) : (
        <Text color="gray.500" textAlign="center" py={8}>
          Tidak ada data perubahan sistem
        </Text>
      )}
    </Flex>
  );
};

function RequirementDetailViewWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RequirementDetailView />
    </Suspense>
  );
}

export default RequirementDetailViewWithSuspense;
