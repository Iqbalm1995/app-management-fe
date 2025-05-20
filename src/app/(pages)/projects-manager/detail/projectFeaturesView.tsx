"use client";

import {
  LocalPrioritiesOptions,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import useProjects, {
  AppsLogsResponse,
  ProjectDataResponse,
  ProjectFeatureInsertPayload,
  ProjectFeatureResponse,
} from "@/app/services/useProjects";
import { OptionListProps, PaggingListPayload } from "@/app/types/masterTypes";
import {
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
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Stack,
  Switch,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  Wrap,
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
import { ApexOptions } from "apexcharts";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiXCircle,
} from "react-icons/fi";
import * as Yup from "yup";
import { AnimatePresence, motion } from "framer-motion";
import {
  colorProgression,
  getPriorityFromMatrix,
  getRandomNumber,
} from "@/app/helper/MasterHelper";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import { Select } from "chakra-react-select";

const FormSchemaFeatures = Yup.object().shape({
  projectId: Yup.string().required("Required"),
  featureName: Yup.string().required("Required"),
  featureDesc: Yup.string().nullable(),
  featureSide: Yup.string().nullable(),
  maintenanceCategory: Yup.string().nullable(),
  maintenanceType: Yup.string().nullable(),
  rppb: Yup.string().nullable(),
  licensing: Yup.string().nullable(),
  featureStartDate: Yup.string().nullable(),
  featureEndDate: Yup.string().nullable(),
  urgency: Yup.string().nullable(),
  impact: Yup.string().nullable(),
  priority: Yup.string().nullable(),
  developmentStatus: Yup.string().nullable(),
});

interface ProjectFeatureViewProps {
  DataProject: ProjectDataResponse | null;
}

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

const ProjectFeatureView = ({ DataProject }: ProjectFeatureViewProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const {
    ListProjectFeatures,
    GetDetailProjectFeatureById,
    InsertProjectFeature,
    UpdateProjectFeature,
    DeleteProjectFeature,
  } = useProjects();
  const {
    ListConstantData,
    GetDetailConstantDataById,
    InsertConstantData,
    UpdateConstantData,
    DeleteConstantData,
  } = useConstants();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const storedData = localStorage.getItem("authData");
  const tokenData: string = localStorage.getItem("tokenData") as string;
  useEffect(() => {
    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }
  }, [DataAuth]);

  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setProjectId(projectId);
    }
  }, [searchParams]);

  const [DataFeatures, setDataFeatures] = useState<ProjectFeatureResponse[]>(
    []
  );
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [ActionLoading, setActionLoading] = useState(false);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Option Data Setup
  // MAINTENANCE CATEGORY
  const [OptionMaintenanceCategory, setOptionMaintenanceCategory] = useState<
    OptionListProps[]
  >([]);
  const [SelectedMaintenanceCategory, setSelectedMaintenanceCategory] =
    useState<OptionListProps | null>(null);
  const handleSelectedMaintenanceCategory = (data: OptionListProps) => {
    setSelectedMaintenanceCategory(data);
    formik.setFieldValue("maintenanceCategory", data.value);
  };
  const handleUnSelectedMaintenanceCategory = () => {
    setSelectedMaintenanceCategory(null);
    formik.setFieldValue("maintenanceCategory", null);
  };

  // MAINTENANCE TYPE
  const [OptionMaintenanceType, setOptionMaintenanceType] = useState<
    OptionListProps[]
  >([]);
  const [SelectedMaintenanceType, setSelectedMaintenanceType] =
    useState<OptionListProps | null>(null);
  const handleSelectedMaintenanceType = (data: OptionListProps) => {
    setSelectedMaintenanceType(data);
    formik.setFieldValue("maintenanceType", data.value);
  };
  const handleUnSelectedMaintenanceType = () => {
    setSelectedMaintenanceType(null);
    formik.setFieldValue("maintenanceType", null);
  };

  // DEVELOPMENT STATUS

  const ClearOptionData = () => {
    setOptionMaintenanceCategory([]);
    setOptionMaintenanceType([]);
  };

  const GetOptionDataServ = async (key: string): Promise<OptionListProps[]> => {
    ClearOptionData();
    const PayloadList: PaggingListPayload = {
      search: "",
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere: [
        {
          field: "groupCode",
          operator: "=",
          value: key || "",
        },
      ],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    const requestData = await ListConstantData(PayloadList, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      setActionLoading(false);
      return [];
    } else {
      if (requestData.data == null) {
        showToast({
          description: "Load option data return error, try again letter",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        return [];
      }

      const itemsData: ConstantDataResponse[] =
        requestData.data as ConstantDataResponse[];

      if (itemsData.length > 0) {
        const OptionData: OptionListProps[] = itemsData.map((dt) => ({
          label: dt.label,
          value: dt.value,
        }));

        setIsLoadingProcess(false);
        setActionLoading(false);
        return OptionData;
      }

      setIsLoadingProcess(false);
      setActionLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (tokenData) {
      const GettingDataOption = async () => {
        const MaintenanceCategoryData: OptionListProps[] =
          await GetOptionDataServ("MAINTENANCE_CATEGORY");
        const MaintenanceTypeData: OptionListProps[] = await GetOptionDataServ(
          "MAINTENANCE_TYPE"
        );
        setOptionMaintenanceCategory(MaintenanceCategoryData);
        setOptionMaintenanceType(MaintenanceTypeData);
      };
      GettingDataOption();
    }
  }, []);

  // End Option Data

  const columnsData = useMemo<ColumnDef<ProjectFeatureResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.featureName,
        id: "featureName",
        cell: (info) => <Flex>{info.row.original.featureName}</Flex>,
        header: () => <span>Feature Name</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [
          {
            field: "projectId",
            operator: "=",
            value: ProjectId || "-",
          },
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListProjectFeatures(PayloadList, tokenData);
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

          const itemsData: ProjectFeatureResponse[] =
            requestData.data as ProjectFeatureResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataFeatures(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, ProjectId]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataFeatures([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: DataFeatures,
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

  const formik = useFormik<ProjectFeatureInsertPayload>({
    initialValues: {
      projectId: "",
      featureName: "",
      featureDesc: null,
      featureSide: null,
      maintenanceCategory: null,
      maintenanceType: null,
      rppb: "0",
      licensing: "0",
      featureStartDate: null,
      featureEndDate: null,
      urgency: "NOT YET",
      impact: "NOT YET",
      priority: "NOT YET",
      developmentStatus: "NOT STARTED",
    },
    validationSchema: FormSchemaFeatures,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      // console.log(values);
      if (ProjectId == null) {
        showToast({
          description: "Project ID is invalid",
          statusToast: "error",
        });
        setActionLoading(false);
        return;
      } else {
        console.log("oakwoakwokaw");
      }
    },
  });

  const ModalForm = useDisclosure();
  const handleAddNew = () => {
    if ((DataAuth && DataAuth.teamMember, ProjectId)) {
      // formik.setFieldValue("id", null);
      formik.setFieldValue("projectId", ProjectId);
      // formik.setFieldValue("logTitle", "");
      // formik.setFieldValue("categoryChange", "INFO");
      // formik.setFieldValue("changeDate", generateTimestamp());
      // formik.setFieldValue("logCode", generateUniqueCode("LG"));
      // formik.setFieldValue("logDesc", "");
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Project ID is invalid",
        statusToast: "error",
      });
    }
  };

  // FILTER SHOW HIDE
  const [BoxFilter, setBoxFilter] = useState(true);

  // PROGRESS REPORT
  const [OverallProgress, setOverallProgress] = useState<number>(0);
  const [ProgressColor, setProgressColor] = useState<string>("red");
  useEffect(() => {
    const randomNumber = getRandomNumber(0, 100);
    setOverallProgress(randomNumber);
    const colorProgress = colorProgression(randomNumber);
    setProgressColor(colorProgress);
  }, [RefreshData]);

  // Priority config
  useEffect(() => {
    const priorityData = getPriorityFromMatrix(
      formik.values.impact || "",
      formik.values.urgency || ""
    );
    formik.setFieldValue("priority", priorityData);
  }, [formik.values]);

  return (
    <Flex w={"full"} as={Stack} spacing={6}>
      <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
        <Heading as="h5" size="md" w={"full"}>
          Data Project Features
        </Heading>

        <Flex
          w={"full"}
          as={HStack}
          justifyContent={"start"}
          alignItems={"end"}
        >
          <Button variant={"ghost"} size={"sm"} onClick={() => RefreshAction()}>
            <FiRefreshCcw />
          </Button>
          <Flex w={"full"} as={Stack}>
            <Text fontSize={"smaller"} fontWeight={600} as={"i"}>
              Overall Progression - {OverallProgress.toString()}%
            </Text>
            <Progress
              colorScheme={ProgressColor}
              hasStripe
              value={OverallProgress}
              w={"full"}
              rounded={radiusStyle}
            />
          </Flex>
        </Flex>
      </Flex>
      <Flex w={"full"}>
        <Card
          w={"full"}
          rounded={radiusStyle}
          bg={colorMode == "light" ? "gray.50" : "gray.900"}
        >
          <CardHeader>
            <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
              <Heading as="h5" size="sm" w={"full"}>
                Filter Data
              </Heading>
              <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                <Button
                  size={"sm"}
                  leftIcon={BoxFilter ? <FiChevronUp /> : <FiChevronDown />}
                  onClick={() => setBoxFilter(!BoxFilter)}
                >
                  {BoxFilter ? "Hide" : "Show"}
                </Button>
              </Flex>
            </Flex>
          </CardHeader>
          <AnimatePresence initial={false}>
            {BoxFilter && (
              <MotionCardBody
                key="filter"
                display="flex"
                flexDirection="column"
                overflow="hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1], // smooth cubic-bezier for accordion-like feel
                }}
              >
                <Text>Coming Soon</Text>
              </MotionCardBody>
            )}
          </AnimatePresence>
        </Card>
      </Flex>
      <Flex w={"full"} p={2} as={HStack} justifyContent={"end"}>
        <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
          <Button
            size={"sm"}
            leftIcon={<FiRefreshCcw />}
            onClick={() => RefreshAction()}
          >
            Refresh
          </Button>
          <Button
            size={"sm"}
            colorScheme={"secondary"}
            leftIcon={<FiPlusSquare />}
            onClick={() => handleAddNew()}
            isLoading={ActionLoading}
          >
            Add New Feature
          </Button>
        </Flex>
      </Flex>
      <Flex as={Stack} w={"full"}>
        {IsLoadingProcess ? (
          <LoadingMiniSignature />
        ) : (
          <TableComponentFull table={table} />
        )}
      </Flex>
      {/* MODAL */}
      <Modal
        size={"4xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
        scrollBehavior={"inside"}
      >
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <ModalOverlay bg="blackAlpha.300" />
          <ModalContent
            rounded={radiusStyle}
            m={2}
            bg={colorMode == "light" ? "white" : "gray.900"}
          >
            <ModalHeader>Add New Feature</ModalHeader>
            <ModalCloseButton />
            <ModalBody w={"full"}>
              <Flex as={Stack} w={"full"} pt={4} spacing={4}>
                <Input
                  id="projectId"
                  name="projectId"
                  type="hidden"
                  value={formik.values.projectId ?? ""}
                  readOnly
                />
                {/* <Input id="xxx" name="xxx" type="datetime-local" /> */}

                <FormControl
                  id="featureName"
                  isInvalid={formik.errors.featureName ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Feature Name
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Input
                        id="featureName"
                        name="featureName"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.featureName ?? ""}
                        placeholder="Feature Name"
                        minLength={3}
                        maxLength={150}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.featureName}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="featureDesc"
                  isInvalid={formik.errors.featureDesc ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Descriptions
                    </FormLabel>
                    <Stack spacing={0}>
                      <Textarea
                        id="featureDesc"
                        name="featureDesc"
                        onChange={formik.handleChange}
                        defaultValue={formik.values.featureDesc ?? ""}
                        placeholder="Descriptions"
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.featureDesc}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id={"maintenanceCategory"}
                  isInvalid={formik.errors.maintenanceCategory ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Maintenance Category
                    </FormLabel>
                    <Stack spacing={0}>
                      <Select
                        id={"maintenanceCategory"}
                        options={OptionMaintenanceCategory}
                        isSearchable={true}
                        onChange={(e) => {
                          e
                            ? handleSelectedMaintenanceCategory({
                                label: e.label,
                                value: e.value,
                              })
                            : handleUnSelectedMaintenanceCategory();
                        }}
                        isLoading={IsLoadingProcess}
                        value={SelectedMaintenanceCategory}
                      />
                      <FormErrorMessage>
                        {formik.errors.maintenanceCategory}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id={"maintenanceType"}
                  isInvalid={formik.errors.maintenanceType ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Maintenance Type
                    </FormLabel>
                    <Stack spacing={0}>
                      <Select
                        id={"maintenanceType"}
                        options={OptionMaintenanceType}
                        isSearchable={true}
                        onChange={(e) => {
                          e
                            ? handleSelectedMaintenanceType({
                                label: e.label,
                                value: e.value,
                              })
                            : handleUnSelectedMaintenanceType();
                        }}
                        isLoading={IsLoadingProcess}
                        value={SelectedMaintenanceType}
                      />
                      <FormErrorMessage>
                        {formik.errors.maintenanceType}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id={"rppb"}
                  isInvalid={formik.errors.rppb ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      RPPB
                    </FormLabel>
                    <Stack spacing={0}>
                      <Switch
                        id="rppb"
                        size={"lg"}
                        isChecked={formik.values.rppb === "1"}
                        onChange={(e) => {
                          formik.setFieldValue(
                            "rppb",
                            e.target.checked ? "1" : "0"
                          );
                        }}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>{formik.errors.rppb}</FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id={"licensing"}
                  isInvalid={formik.errors.licensing ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Licensing
                    </FormLabel>
                    <Stack spacing={0}>
                      <Switch
                        id="licensing"
                        size={"lg"}
                        isChecked={formik.values.licensing === "1"}
                        onChange={(e) => {
                          formik.setFieldValue(
                            "licensing",
                            e.target.checked ? "1" : "0"
                          );
                        }}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.licensing}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="featureStartDate"
                  isInvalid={formik.errors.featureStartDate ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Start Date
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Input
                        id="featureStartDate"
                        name="featureStartDate"
                        type="datetime-local"
                        onChange={formik.handleChange}
                        value={formik.values.featureStartDate ?? ""}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.featureStartDate}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="featureEndDate"
                  isInvalid={formik.errors.featureEndDate ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      End Date
                    </FormLabel>
                    <Stack spacing={0} h={"full"}>
                      <Input
                        id="featureEndDate"
                        name="featureEndDate"
                        type="datetime-local"
                        onChange={formik.handleChange}
                        value={formik.values.featureEndDate ?? ""}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.featureEndDate}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <Flex w={"full"} as={Stack} spacing={4}>
                  <Heading as="h5" size="sm">
                    (sm) In love with React & Next
                  </Heading>
                  <Divider />
                  <FormControl
                    id="urgency"
                    isInvalid={formik.errors.urgency ? true : false}
                    isRequired
                  >
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Urgency
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <ButtonGroup size="md" isAttached variant={"solid"}>
                          {LocalPrioritiesOptions.map((opt) =>
                            opt.categories.includes("URGENCY_STATUS") ? (
                              <Button
                                key={opt.value}
                                colorScheme={
                                  formik.values.urgency === opt.value
                                    ? opt.colorScheme
                                    : "gray"
                                }
                                onClick={() =>
                                  formik.setFieldValue("urgency", opt.value)
                                }
                              >
                                {opt.label}
                              </Button>
                            ) : null
                          )}
                        </ButtonGroup>
                        <FormErrorMessage>
                          {formik.errors.urgency}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  <FormControl
                    id="impact"
                    isInvalid={formik.errors.impact ? true : false}
                    isRequired
                  >
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Impact
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <ButtonGroup size="md" isAttached variant={"solid"}>
                          {LocalPrioritiesOptions.map((opt) =>
                            opt.categories.includes("IMPACT_STATUS") ? (
                              <Button
                                key={opt.value}
                                colorScheme={
                                  formik.values.impact === opt.value
                                    ? opt.colorScheme
                                    : "gray"
                                }
                                onClick={() =>
                                  formik.setFieldValue("impact", opt.value)
                                }
                              >
                                {opt.label}
                              </Button>
                            ) : null
                          )}
                        </ButtonGroup>
                        <FormErrorMessage>
                          {formik.errors.impact}
                        </FormErrorMessage>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  <FormControl
                    id="priority"
                    isInvalid={formik.errors.priority ? true : false}
                    isRequired
                  >
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Priority
                      </FormLabel>
                      <Stack spacing={0} h={"full"}>
                        <ButtonGroup size="md" isAttached variant={"solid"}>
                          {LocalPrioritiesOptions.map((opt) =>
                            opt.categories.includes("PRIORITY_STATUS") &&
                            opt.value == formik.values.priority ? (
                              <Button
                                key={opt.value}
                                colorScheme={
                                  formik.values.impact === opt.value
                                    ? opt.colorScheme
                                    : "gray"
                                }
                                onClick={() =>
                                  formik.setFieldValue("impact", opt.value)
                                }
                              >
                                {opt.label}
                              </Button>
                            ) : null
                          )}
                        </ButtonGroup>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>
                </Flex>

                <Box overflowY={"auto"}>
                  {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                </Box>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Flex w={"full"} justifyContent={"end"} as={HStack}>
                <Button
                  size={"md"}
                  colorScheme={"gray"}
                  leftIcon={<FiXCircle />}
                  onClick={() => ModalForm.onClose()}
                  isLoading={ActionLoading}
                >
                  Cancel
                </Button>
                <Button
                  size={"md"}
                  colorScheme={"green"}
                  leftIcon={<FiSave />}
                  type={"submit"}
                  isLoading={ActionLoading}
                >
                  Save
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </Flex>
  );
};

export default ProjectFeatureView;
