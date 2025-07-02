"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
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
  getPriorityFromMatrix,
  priorityColor,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useRequirements, {
  BacklogDataResponse,
  RequirementsResponse,
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
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useColorMode,
  useSteps,
  Wrap,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Switch,
  HStack,
  Input,
  Select as SelectC,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  ModalOverlay,
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
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiInfo, FiSave } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Registrasi Project",
  breadCrumb: ["Home", "Project Manager", "Registrasi Project"],
};

function FormRegisterProjectView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const { GetDetailById: GetReqDetail, ListBacklog } = useRequirements();

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
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Load Requirements
  useEffect(() => {
    if (DataAuth && DataAuth.team && ReqId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetReqDetail(ReqId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          redirect(`/projects-manager/`);
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

          const itemsData: RequirementsResponse =
            requestData.data as RequirementsResponse;

          setDataRequirement(itemsData);

          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, ReqId]);

  // GetServiceListBacklog
  const [IsloadingBacklogs, setIsloadingBacklogs] = useState(false);
  const [DataBacklogsRequirement, setDataBacklogsRequirement] = useState<
    BacklogDataResponse[]
  >([]);

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const updateBacklog = (
    backlogId: string,
    updatedData: BacklogDataResponse
  ) => {
    const prorityBacklog: string = getPriorityFromMatrix(
      updatedData.impact,
      updatedData.urgency
    );

    setDataBacklogsRequirement((prev) =>
      prev.map((item) =>
        item.id === backlogId
          ? { ...item, ...updatedData, priority: prorityBacklog }
          : item
      )
    );

    showToast({
      description: "Fitur diubah",
      statusToast: "success",
    });
  };

  const columnsData = useMemo<ColumnDef<BacklogDataResponse>[]>(
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
      {
        accessorFn: (row) => row.backlogEnddate,
        id: "backlogEnddate",
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
              <UpdateBacklogDateInput
                idInput={`deadlineSet-${info.row.index}`}
                fieldName="backlogEnddate"
                dataSource={info.row.original}
                dataInput={info.row.original.backlogEnddate}
                updateBacklog={updateBacklog}
              />
            </Flex>
          </Flex>
        ),
        header: () => <span>Deadline</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.urgency,
        id: "urgency",
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
              <UpdateUrgencyImpactInput
                idInput={`urgencySet-${info.row.index}`}
                fieldName={"urgency"}
                dataSource={info.row.original}
                dataInput={info.row.original.urgency}
                updateBacklog={updateBacklog}
                key={`urgencySet-${info.row.index}`}
              />
            </Flex>
          </Flex>
        ),
        header: () => <span>Urgency</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.impact,
        id: "impact",
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
              <UpdateUrgencyImpactInput
                idInput={`impactSet-${info.row.index}`}
                fieldName={"impact"}
                dataSource={info.row.original}
                dataInput={info.row.original.impact}
                updateBacklog={updateBacklog}
                key={`impactSet-${info.row.index}`}
              />
            </Flex>
          </Flex>
        ),
        header: () => <span>Impact</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.priority,
        id: "priority",
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
              <Text
                fontWeight={600}
                color={priorityColor(info.row.original.priority)}
              >
                {info.row.original.priority}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Priority</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"}>
            <AdditionalInfoUpdate
              idInput={info.row.original.backlogCode}
              dataSource={info.row.original}
              updateBacklog={updateBacklog}
            />

            {/* <Button
              onClick={() => {
                OpenAdditionalFormBacklog(info.row.original);
              }}
              colorScheme="secondary"
              size="xs"
            >
              <FiInfo />
            </Button> */}
          </Flex>
        ),
        header: () => <span>Additional</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        },
      },
    ],
    [colorMode]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.team && DataRequirement && tokenData) {
      const PayloadList: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "reqId",
            operator: "=",
            value: DataRequirement.id,
          },
        ],
        fieldOrder: ["backlogName"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListBacklog(PayloadList, tokenData);
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

          const itemsData: BacklogDataResponse[] =
            requestData.data as BacklogDataResponse[];
          setDataBacklogsRequirement(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, DataRequirement]);

  // auto page
  const table = useReactTable({
    data: DataBacklogsRequirement,
    columns: columnsData,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
    manualFiltering: false,
    manualPagination: false,
  });

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    console.log("handleFilterChange");
    console.log(newFilters);
    // not implemented
  };

  // Step Form
  const steps = [
    { title: "Step 1", description: "Project Information" },
    { title: "Step 2", description: "Team Information" },
    { title: "Step 3", description: "Feature Information" },
  ];
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
  // End Step Form

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}> */}
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
          <Flex
            w={"full"}
            as={Wrap}
            spacing={2}
            overflowX={"auto"}
            justifyContent={"start"}
          >
            <Link href={`/projects-manager/`}>
              <Button size={"lg"} leftIcon={<FiArrowLeft />}>
                Kembali
              </Button>
            </Link>
          </Flex>
        </GridItem>

        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
          <Flex
            as={Wrap}
            w={"full"}
            justifyContent={"end"}
            alignItems={"center"}
          ></Flex>
        </GridItem>

        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card w={"fill"} rounded={radiusStyle}>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
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
                        <StepDescription>{step.description}</StepDescription>
                      </Box>

                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>

                {activeStep === 0 && (
                  <Flex as={Stack} w={"full"} spacing={5}>
                    <Text>Step 1</Text>
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
                )}

                {activeStep === 1 && (
                  <Flex as={Stack} w={"full"} spacing={5}>
                    <Text>Step 2</Text>
                  </Flex>
                )}

                {activeStep === 2 && (
                  <Flex as={Stack} w={"full"} spacing={5}>
                    <Text>Step 3</Text>
                  </Flex>
                )}

                <Flex
                  mt={10}
                  mb={2}
                  w={"full"}
                  justifyContent={"space-between"}
                >
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
                    <Button
                      colorScheme={"green"}
                      leftIcon={<FiSave />}
                      // type={"submit"}
                      //   onClick={() => setSaveAsDraft(false)}
                      //   onClick={() => handleConfirmSaveData(formik.values)}
                      //   isLoading={ActionLoading}
                      // isDisabled={activeStep !== steps.length - 1}
                      display={
                        activeStep === steps.length - 1 ? "flex" : "none"
                      }
                      px={8}
                    >
                      Simpan
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
              <Divider />
              <Flex w={"full"} as={Stack} spacing={4}>
                <Box
                  overflowY={"auto"}
                  overflowX={"auto"}
                  maxH={"350px"}
                  p={4}
                  bgColor={"gray.200"}
                  rounded={radiusStyle}
                >
                  <Text fontWeight={600}>Data Requirement</Text>
                  <pre>{JSON.stringify(DataRequirement, null, 2)}</pre>
                </Box>
                <Box
                  overflowY={"auto"}
                  overflowX={"auto"}
                  maxH={"350px"}
                  p={4}
                  bgColor={"gray.200"}
                  rounded={radiusStyle}
                >
                  <Text fontWeight={600}>Data Backlog Feature</Text>
                  <pre>{JSON.stringify(DataBacklogsRequirement, null, 2)}</pre>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      {/* </form> */}
    </LayoutAdmin>
  );
}

interface UrgencyImpactInput {
  idInput: string;
  fieldName: keyof BacklogDataResponse;
  dataSource: BacklogDataResponse;
  dataInput: string;
  updateBacklog: (backlogId: string, updatedData: BacklogDataResponse) => void;
}

const UpdateUrgencyImpactInput = ({
  idInput,
  fieldName,
  dataSource,
  dataInput,
  updateBacklog,
}: UrgencyImpactInput) => {
  const [optionValue, setOptionValue] = useState<string>(dataInput);
  const [dataBacklog, setDataBacklog] =
    useState<BacklogDataResponse>(dataSource);

  // Ensure local state follows props when it changes (edge case fix)
  useEffect(() => {
    setOptionValue(dataInput);
    setDataBacklog(dataSource);
  }, [dataInput, dataSource]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOptionValue(value);

    const updatedBacklog = {
      ...dataBacklog,
      [fieldName]: value,
    };

    setDataBacklog(updatedBacklog);
    updateBacklog(updatedBacklog.id, updatedBacklog);
  };

  return (
    <Flex w="full">
      <SelectC
        size="sm"
        variant="flushed"
        id={idInput}
        name={idInput}
        value={optionValue ?? ""}
        onChange={handleChange} // ensure this is always defined
      >
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
      </SelectC>
    </Flex>
  );
};

interface BacklogDateInputProps {
  idInput: string;
  fieldName: keyof BacklogDataResponse; // Should be the date field (e.g., "backlogEnddate")
  dataSource: BacklogDataResponse;
  dataInput: string | null; // ISO date string
  updateBacklog: (backlogId: string, updatedData: BacklogDataResponse) => void;
}

const UpdateBacklogDateInput = ({
  idInput,
  fieldName,
  dataSource,
  dataInput,
  updateBacklog,
}: BacklogDateInputProps) => {
  const [dateValue, setDateValue] = useState<string>(dataInput ?? "");
  const [dataBacklog, setDataBacklog] =
    useState<BacklogDataResponse>(dataSource);

  useEffect(() => {
    setDateValue(dataInput ?? "");
    setDataBacklog(dataSource);
  }, [dataInput, dataSource]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateValue(value);

    const updatedBacklog = {
      ...dataBacklog,
      [fieldName]: value,
    };

    setDataBacklog(updatedBacklog);
    updateBacklog(updatedBacklog.id, updatedBacklog);
  };

  return (
    <Flex w="full">
      <Input
        id={idInput}
        name={idInput}
        size="sm"
        variant="flushed"
        type="date"
        value={dateValue}
        onChange={handleChange}
      />
    </Flex>
  );
};

interface AdditionalInfoUpdateProps {
  idInput: string;
  dataSource: BacklogDataResponse;
  updateBacklog: (backlogId: string, updatedData: BacklogDataResponse) => void;
}

const AdditionalInfoUpdate = ({
  idInput,
  dataSource,
  updateBacklog,
}: AdditionalInfoUpdateProps) => {
  const { colorMode } = useColorMode();
  // Additional form
  const AdditionalForm = useDisclosure();
  const [BacklogDetail, setBacklogDetail] =
    useState<BacklogDataResponse>(dataSource);

  const OpenAdditionalFormBacklog = () => {
    AdditionalForm.onOpen();
  };

  // End Additional form

  return (
    <Box>
      <Button
        onClick={() => {
          OpenAdditionalFormBacklog();
        }}
        colorScheme="secondary"
        size="xs"
      >
        <FiInfo />
      </Button>

      <Modal
        size={"xl"}
        isOpen={AdditionalForm.isOpen}
        isCentered
        onClose={AdditionalForm.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{`Additional Info Backlog`}</ModalHeader>
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"}></Flex>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FormRegisterProjectView;
