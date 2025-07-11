"use client";

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
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateInputCustom,
  formatToRupiah,
  getQuarterText,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useRequirements, {
  BacklogDataResponse,
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
} from "@/app/services/useRequirements";
import {
  ColumnMetaCustom,
  ListSearchByParamProps,
  PaggingListPayload,
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
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
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
  FiFileText,
  FiInfo,
  FiRefreshCcw,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Detail",
  breadCrumb: ["Home", "Project Manager", "Detail"],
};

const PAGE_MODE: string = "VIEW_DETAIL";
// const PAGE_MODE: string = "REVIEWER";

function BrdDetailView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const [PageMode, setPageMode] = useState<string>(PAGE_MODE);

  const { GetDetailById, ListBacklog } = useRequirements();

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
  const [WorkProgramExternal, setWorkProgramExternal] = useState<
    RequirementWorkProgramDataResponse[]
  >([]);
  const [WorkProgramInternal, setWorkProgramInternal] = useState<
    RequirementWorkProgramDataResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(true);

  // Add a client-side only flag to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // GetServiceListBacklog
  const [IsloadingBacklogs, setIsloadingBacklogs] = useState(false);
  const [DataBacklogsRequirement, setDataBacklogsRequirement] = useState<
    BacklogDataResponse[]
  >([]);

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

          const internalWorkPrograms = itemsData.workPrograms
            .map((item, index) => ({ ...item, originalIndex: index }))
            .filter((x) => x.workProgramSource === "INTERNAL");

          const externalWorkPrograms = itemsData.workPrograms
            .map((item, index) => ({ ...item, originalIndex: index }))
            .filter((x) => x.workProgramSource === "EXTERNAL");

          setWorkProgramInternal(internalWorkPrograms);
          setWorkProgramExternal(externalWorkPrograms);

          setHeaderContentState({
            titleName: `${itemsData.requirementType} Detail #${itemsData.reqNumber}`,
            breadCrumb: [
              "Home",
              `Requirement`,
              "Detail",
              `${itemsData.requirementType}`,
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
  const steps = [
    { title: "Step 1", description: "Informasi Umum" },
    { title: "Step 2", description: "Penugasan Personil & User" },
    { title: "Step 3", description: "Program Kerja" },
    { title: "Step 4", description: "Ringkasan Ruanglingkup" },
    { title: "Step 5", description: "Lampiran" },
    { title: "Step 6", description: "BRD Acceptance" },
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

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
          <Link href={"/requirements/brd"}>
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

                    <Divider mb={6} />

                    {/* Only render step content when client-side mounted */}
                    {activeStep === 0 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={steps[activeStep].description}
                        >
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Divisi Pengirim
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.senderDivisionName}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nomor Memo
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>{DataRequirement.reqNumber}</Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Perihal
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>{DataRequirement.reqNarative}</Text>
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
                                    ? formatDateInputCustom(
                                        DataRequirement.reqInititateDate,
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
                                Tanggal Memo Diterima
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.reqAcceptedDate != null
                                    ? formatDateInputCustom(
                                        DataRequirement.reqAcceptedDate,
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
                                Durasi Memo
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>
                                  {DataRequirement.reqDurationDay} Hari kalender
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
                                    : "TIDAK"}
                                </Text>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 1 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
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
                                    ? formatDateInputCustom(
                                        DataRequirement.assignedToDate,
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
                                  {DataRequirement.approvalDatas.map(
                                    (ua, idx) => (
                                      <ListItem key={idx}>
                                        {`${ua.approverUserFirstName} (${ua.approverUserCode})`}
                                      </ListItem>
                                    )
                                  )}
                                </OrderedList>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>

                        <InputGroupPanel
                          headerTitle={`Informasi Person In Charge (PIC)`}
                        >
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
                                <Text>
                                  {DataRequirement.userPicIdentityNumber}
                                </Text>
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
                      </Flex>
                    )}

                    {activeStep === 2 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel headerTitle={`Program Kerja External`}>
                          {WorkProgramExternal.length > 0 ? (
                            <>
                              {WorkProgramExternal.map((wp, idx) => (
                                <Flex
                                  w={"full"}
                                  key={idx}
                                  as={Stack}
                                  spacing={5}
                                >
                                  <Heading as="h4" size="md" pb={5}>
                                    Program Kerja - {idx + 1}
                                  </Heading>

                                  <FormControl>
                                    <InputLayoutFull>
                                      <FormLabel h={"full"} mt={2}>
                                        Divisi
                                      </FormLabel>
                                      <Stack spacing={0} h={"full"}>
                                        <Text>{wp.divisionName}</Text>
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
                                        <Text>
                                          {formatToRupiah(wp.workProgramBudget)}
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
                                          {formatToRupiah(wp.workProgramReal)}
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
                                          {formatToRupiah(
                                            wp.workProgramLeftovers
                                          )}
                                        </Text>
                                      </Stack>
                                    </InputLayoutFull>
                                  </FormControl>
                                </Flex>
                              ))}
                            </>
                          ) : (
                            <CustomPanelAlert type={"info"}>
                              <FiInfo size={70} />
                              <Text>Program kerja tidak ada.</Text>
                            </CustomPanelAlert>
                          )}
                        </InputGroupPanel>

                        <InputGroupPanel headerTitle={`Program Kerja IT`}>
                          {WorkProgramInternal.length > 0 ? (
                            <>
                              {WorkProgramInternal.map((wp, idx) => (
                                <Flex
                                  w={"full"}
                                  key={idx}
                                  as={Stack}
                                  spacing={5}
                                >
                                  <Heading as="h4" size="md" pb={5}>
                                    Program Kerja - {idx + 1}
                                  </Heading>

                                  <FormControl>
                                    <InputLayoutFull>
                                      <FormLabel h={"full"} mt={2}>
                                        Divisi
                                      </FormLabel>
                                      <Stack spacing={0} h={"full"}>
                                        <Text>{wp.divisionName}</Text>
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
                                        <Text>
                                          {formatToRupiah(wp.workProgramBudget)}
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
                                          {formatToRupiah(wp.workProgramReal)}
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
                                          {formatToRupiah(
                                            wp.workProgramLeftovers
                                          )}
                                        </Text>
                                      </Stack>
                                    </InputLayoutFull>
                                  </FormControl>
                                </Flex>
                              ))}
                            </>
                          ) : (
                            <CustomPanelAlert type={"info"}>
                              <FiInfo size={70} />
                              <Text>Program kerja tidak ada.</Text>
                            </CustomPanelAlert>
                          )}
                        </InputGroupPanel>
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
                                Media Akses Aplikasi
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Text>{DataRequirement.appAccessMedia}</Text>
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
                          <Heading as="h4" size="md">
                            Section {activeStep}
                          </Heading>
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 5 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={steps[activeStep].description}
                        >
                          <Heading as="h4" size="md">
                            Section {activeStep}
                          </Heading>
                        </InputGroupPanel>
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
                      display={"block"}
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

export default BrdDetailView;
