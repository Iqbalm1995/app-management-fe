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
  ENDPOINT_API_BASEURL_OBJECT,
  ENDPOINT_PORT_BASIC_OBJECT,
  MAX_SIZE_TABLE,
  radiusStyle,
  REQ_STATUS_APPROVED,
  REQ_STATUS_CANCELED,
  REQ_STATUS_NEED_REVIEW,
  REQ_STATUS_ON_HOLD,
  REQ_STATUS_TEMPORARY_APPROVED,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  buildUrlPort,
  formatDateInputCustom,
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
} from "@/app/services/useRequirements";
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
  Textarea,
  RadioGroup,
  Radio,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
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
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertOctagon,
  FiArrowLeft,
  FiArrowRight,
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

const PAGE_MODE: string = "VIEW_DETAIL";
// const PAGE_MODE: string = "REVIEWER";

function RequirementDetailView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const reqId = searchParams.get("reqId");
  const reqType = searchParams.get("type") || "BRD"; // Dynamic type from URL
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

  const { GetDetailById, ListBacklog, ListReqMedia } = useRequirements();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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
                <Text fontSize={"smaller"} color={"gray.500"}>
                  #{info.row.original.backlogCode}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Nama Fitur</span>,
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
        header: () => <span>Deskripsi Fitur</span>,
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
    if (DataAuth && DataAuth.team && ReqId) {
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
            titleName: `${reqType} Detail #${itemsData.reqNumber}`,
            breadCrumb: [
              "Home",
              "Requirements",
              reqType === "RFC" ? "RFC List" : "BRD List",
              "Detail",
            ],
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
  }, [DataAuth, RefreshData, ReqId]);

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
    {
      title: reqType === "RFC" ? "Step 7" : "Step 6",
      description: `${reqType} Acceptance`,
    },
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

  const ActionApprovalChangeStatus = () => {
    console.log("Action Approval");
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
          <Link href={`/requirements/${reqType.toLowerCase()}`}>
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
          <ModalHeader>{`Data Fitur`}</ModalHeader>
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"} spacing={5}>
              {IsLoadingProcess ? (
                <LoadingMiniSignature />
              ) : (
                // <TableComponentFull table={table} />
                // TABLE NEW DESIGN
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
                        <Step key={index}>
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
                                <Text>{DataRequirement.appInitialCode}</Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nama Aplikasi
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>{DataRequirement.appInitialName}</Text>
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
                                    : "EXTERNAL (NASABAH)"}
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
                                {DataRequirement.appAccessFrontsiteDns !=
                                  null && (
                                  <Text>
                                    Internet (Publik) :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appAccessFrontsiteDns}
                                    </Text>
                                  </Text>
                                )}
                                {DataRequirement.appAccessBacksiteIp !=
                                  null && (
                                  <Text>
                                    Intranet (Untuk BackOffice Bank) :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appAccessBacksiteIp}
                                    </Text>
                                  </Text>
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
                                <Text>{DataRequirement.appTypes}</Text>
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
                                <Text>{DataRequirement.appRelatedness}</Text>
                                {DataRequirement.appTypeCustom && (
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
                                <Text>{DataRequirement.appTransactionals}</Text>
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
                                      ? "-"
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
                                  "-"
                                )}

                                {DataRequirement.appOperational24hrs !=
                                  "24-HOUR" && (
                                  <Text>
                                    Jam Buka :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appOperationalHourOpen}
                                    </Text>
                                  </Text>
                                )}
                                {DataRequirement.appOperational24hrs !=
                                  "24-HOUR" && (
                                  <Text>
                                    Jam Tutup :{" "}
                                    <Text pl={2} as={"span"} fontWeight={600}>
                                      {DataRequirement.appOperationalHourClosed}
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
                                    : "-"}
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
                                    : "-"}
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
                                <Text>{DataRequirement.note}</Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Fitur Aplikasi
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
                                  Detail Fitur ({DataBacklogsRequirement.length}
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
                                <Text>{DataRequirement.appEnvLocations}</Text>
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
                                    : "-"}
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
                                    : "-"}
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
                                  {DataRequirement.appIntegrationOthersApps}
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

                        <InputGroupPanel headerTitle={"Update Status"}>
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Status Action
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <RadioGroup
                                  onChange={setStatusRequirement}
                                  value={StatusRequirement || ""}
                                >
                                  <Wrap spacing={5}>
                                    <Box
                                      bg={"green.200"}
                                      _hover={{
                                        bg: "green.400",
                                      }}
                                      py={2}
                                      px={4}
                                      rounded={"md"}
                                      color={"green.800"}
                                      fontWeight={600}
                                    >
                                      <Radio value={REQ_STATUS_APPROVED}>
                                        {REQ_STATUS_APPROVED}
                                      </Radio>
                                    </Box>
                                    <Box
                                      bg={"teal.200"}
                                      _hover={{
                                        bg: "teal.400",
                                      }}
                                      py={2}
                                      px={4}
                                      rounded={"md"}
                                      color={"teal.800"}
                                      fontWeight={600}
                                    >
                                      <Radio
                                        value={REQ_STATUS_TEMPORARY_APPROVED}
                                      >
                                        {REQ_STATUS_TEMPORARY_APPROVED}
                                      </Radio>
                                    </Box>

                                    <Box
                                      bg={"yellow.200"}
                                      _hover={{
                                        bg: "yellow.400",
                                      }}
                                      py={2}
                                      px={4}
                                      rounded={"md"}
                                      color={"yellow.800"}
                                      fontWeight={600}
                                    >
                                      <Radio value={REQ_STATUS_ON_HOLD}>
                                        {REQ_STATUS_ON_HOLD}
                                      </Radio>
                                    </Box>
                                    <Box
                                      bg={"red.200"}
                                      _hover={{
                                        bg: "red.400",
                                      }}
                                      py={2}
                                      px={4}
                                      rounded={"md"}
                                      color={"red.800"}
                                      fontWeight={600}
                                    >
                                      <Radio value={REQ_STATUS_CANCELED}>
                                        {REQ_STATUS_CANCELED}
                                      </Radio>
                                    </Box>
                                  </Wrap>
                                </RadioGroup>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Catatan
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Textarea
                                  id="reqNote"
                                  name="reqNote"
                                  // onChange={formik.handleChange}
                                  // defaultValue={formik.values.projectDesc ?? ""}
                                  placeholder={`Catatan (Opsional)`}
                                  maxLength={300}
                                  // isDisabled={ActionLoading}
                                />
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>
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
                        />
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
    </LayoutAdmin>
  );
}

interface ReqSectionProps {
  DataRequirement: RequirementsResponse;
  DataBacklogs?: BacklogDataResponse[];
  DataAttachment?: MediaObjectResponse[];
  steps: StepsProps[];
  activeStep: number;
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
                <Text>{DataRequirement.senderDirectorateName}</Text>
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
                <Text>{DataRequirement.senderDivisionName}</Text>
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
                <Text>{DataRequirement.reqNumber}</Text>
              ) : (
                <NoMemoAlertText />
              )}
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Perihal
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              {DataRequirement.isHaveMemo == "Y" ? (
                <Text>{DataRequirement.reqNarative}</Text>
              ) : (
                <NoMemoAlertText />
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
                  : "-"}
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
                  : "-"}
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
              <Text>{DataRequirement.reqDurationDay} Hari kalender</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} as={"i"} mt={2}>
              CarryOver
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.isCarryOver == "Y" ? "YA" : "TIDAK"}</Text>
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
                  : "-"}
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
                {`${DataRequirement.assignedFromName} (${DataRequirement.assignedFromId})`}
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
              <OrderedList>
                {DataRequirement.approvalDatas.map((ua, idx) => (
                  <ListItem key={idx}>
                    {`${ua.approverUserFirstName} (${ua.approverUserCode})`}
                  </ListItem>
                ))}
              </OrderedList>
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
              <Text>{DataRequirement.userPicId}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              NIK
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicIdentityNumber}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Nama Lengkap
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicName}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              No Handphne / Whatsapp
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicContanct}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Alamat E-Mail internal Bank bjb
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text>{DataRequirement.userPicEmail}</Text>
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
                  {DataRequirement.userPicDirectorateName}
                </Text>
              </Text>
              <Text>
                Divisi :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.userPicDivisionName}
                </Text>
              </Text>
              <Text>
                Group :
                <Text pl={2} as={"span"} fontWeight={600}>
                  {DataRequirement.userPicGroupName}
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
                          {wp.directorateName != null
                            ? wp.directorateName
                            : "-"}
                        </Text>
                      </Text>
                      <Text>
                        Divisi :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.divisionName != null ? wp.divisionName : "-"}
                        </Text>
                      </Text>
                      <Text>
                        Group :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.groupName != null ? wp.groupName : "-"}
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
                      <Text>{wp.workProgramCode}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Program Kerja
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramName}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Akun Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccName}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nomor Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccNumber}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Kode Cost Center
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccCc}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{formatToRupiah(wp.workProgramBudget)}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Realisasi (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{formatToRupiah(wp.workProgramReal)}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Sisa Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{formatToRupiah(wp.workProgramLeftovers)}</Text>
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
                          {wp.directorateName != null
                            ? wp.directorateName
                            : "-"}
                        </Text>
                      </Text>
                      <Text>
                        Divisi :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.divisionName != null ? wp.divisionName : "-"}
                        </Text>
                      </Text>
                      <Text>
                        Group :
                        <Text pl={2} as={"span"} fontWeight={600}>
                          {wp.groupName != null ? wp.groupName : "-"}
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
                      <Text>{wp.workProgramCode}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Program Kerja
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramName}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Akun Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccName}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nomor Rekening
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccNumber}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Kode Cost Center
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{wp.workProgramAccCc}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{formatToRupiah(wp.workProgramBudget)}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Realisasi (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{formatToRupiah(wp.workProgramReal)}</Text>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Sisa Anggaran (Rp.)
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Text>{formatToRupiah(wp.workProgramLeftovers)}</Text>
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
              <Text>{DataRequirement.appInitialCode}</Text>
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
                  : "EXTERNAL (NASABAH)"}
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
              {DataRequirement.appAccessFrontsiteDns != null && (
                <Text>
                  Internet (Publik) :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appAccessFrontsiteDns}
                  </Text>
                </Text>
              )}
              {DataRequirement.appAccessBacksiteIp != null && (
                <Text>
                  Intranet (Untuk BackOffice Bank) :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appAccessBacksiteIp}
                  </Text>
                </Text>
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
              <Text>{DataRequirement.appTypes}</Text>
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
              <Text>{DataRequirement.appRelatedness}</Text>
              {DataRequirement.appTypeCustom && (
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
              <Text>{DataRequirement.appTransactionals}</Text>
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
                    ? "-"
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
                "-"
              )}

              {DataRequirement.appOperational24hrs != "24-HOUR" && (
                <Text>
                  Jam Buka :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appOperationalHourOpen}
                  </Text>
                </Text>
              )}
              {DataRequirement.appOperational24hrs != "24-HOUR" && (
                <Text>
                  Jam Tutup :{" "}
                  <Text pl={2} as={"span"} fontWeight={600}>
                    {DataRequirement.appOperationalHourClosed}
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
                  : "-"}
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
                  : "-"}
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
              <Text>{DataRequirement.note}</Text>
            </Stack>
          </InputLayoutFull>
        </FormControl>

        <FormControl>
          <InputLayoutFull>
            <FormLabel h={"full"} mt={2}>
              Fitur Aplikasi{" "}
              {DataBacklogs != null && `(${DataBacklogs.length})`}
            </FormLabel>
            <Stack spacing={0} h={"full"}>
              <Text as={"p"} fontWeight={600}>
                {DataBacklogs != null
                  ? DataBacklogs.length >= 0
                    ? joinFieldValues(DataBacklogs, "backlogName", ", ")
                    : ""
                  : "-"}
              </Text>
            </Stack>
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
              <Text>{DataRequirement.appEnvLocations}</Text>
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
                  : "-"}
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
                  : "-"}
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
              <Text>{DataRequirement.appIntegrationOthersApps}</Text>
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

  const UrlEndpoint: string = buildUrlPort(
    ENDPOINT_API_BASEURL_OBJECT,
    ENDPOINT_PORT_BASIC_OBJECT
  );

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
            <Text
              fontWeight={600}
              fontSize={"xx-small"}
              color={"secondary.700"}
            >
              {info.row.original.objectCode}
            </Text>
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
            <Link
              href={`${UrlEndpoint}${info.row.original.objectData}`}
              target="_blank"
            >
              <Button
                size={"sm"}
                colorScheme={"blue"}
                leftIcon={<FiDownload />}
              >
                Unduh
              </Button>
            </Link>
            {info.row.original.objectExtension.replace(".", "").trim() ==
              "pdf" && (
              <Button
                size={"sm"}
                colorScheme={"blue"}
                onClick={() => {
                  handleOpenPreview(
                    `${UrlEndpoint}${info.row.original.objectData}`
                  );
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
                {/* <Text>{UrlFilePDF}</Text> */}
                <iframe
                  src={`/api/proxy-pdf?url=${encodeURIComponent(UrlFilePDF)}`}
                  width="100%"
                  height="600px"
                  style={{ border: "none" }}
                />
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
  return (
    <>
      <InputGroupPanel headerTitle={"Former BRD Acceptance"}>
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
                      {DataRequirement.reqReviewStartDate != null
                        ? formatDateInputCustom(
                            DataRequirement.reqReviewStartDate,
                            "/"
                          )
                        : "-"}
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
                      {DataRequirement.reqReviewEndDate != null
                        ? formatDateInputCustom(
                            DataRequirement.reqReviewEndDate,
                            "/"
                          )
                        : "-"}
                    </Text>
                  </Stack>
                </InputLayoutFullHalf>
              </FormControl>

              <FormControl>
                <InputLayoutFullHalf>
                  <FormLabel h={"full"} mt={2}>
                    Durasi Review
                  </FormLabel>
                  <Stack spacing={0} h={"full"}>
                    <Text>
                      {DataRequirement.reqReviewDurationDay} Hari kalender
                    </Text>
                  </Stack>
                </InputLayoutFullHalf>
              </FormControl>

              <FormControl>
                <InputLayoutFullHalf>
                  <FormLabel h={"full"} mt={2}>
                    Direview Oleh
                  </FormLabel>
                  <Stack spacing={0} h={"full"}>
                    <OrderedList>
                      {DataRequirement.approvalDatas.map((ua, idx) => (
                        <ListItem key={idx}>
                          {`${ua.approverUserFirstName} (${ua.approverUserCode})`}
                        </ListItem>
                      ))}
                    </OrderedList>
                  </Stack>
                </InputLayoutFullHalf>
              </FormControl>

              <FormControl>
                <InputLayoutFullHalf>
                  <FormLabel h={"full"} mt={2}>
                    Diapprove Oleh
                  </FormLabel>
                  <Stack spacing={0} h={"full"}>
                    <Text>-</Text>
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
                    Catatan
                  </FormLabel>
                  <Stack spacing={0} h={"full"}>
                    <Text>-</Text>
                  </Stack>
                </InputLayoutFull>
              </FormControl>
            </Flex>
          </GridItem>
          <GridItem
            colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
            w={"full"}
          ></GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
            <Flex as={Stack} w={"full"} spacing={5}>
              <SummaryStatusReq status={DataRequirement.reqStatus || "-"} />
            </Flex>
          </GridItem>
        </Grid>
      </InputGroupPanel>
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
                      Nama Fitur
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
                      Nama Fitur
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
