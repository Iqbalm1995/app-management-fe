"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_MEDIUM,
  PROJEC_CATEGORY_OPTIONS,
  PROJEC_TYPE_OPTIONS,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  ProjectDataResponse,
  ProjectUpdatePayload,
} from "@/app/services/useProjects";
import { OptionListProps } from "@/app/types/masterTypes";
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
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  useColorMode,
  Divider,
  HStack,
  StackDivider,
  Progress,
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Select as SelectC,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BsKanban } from "react-icons/bs";
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiArrowLeft,
  FiCpu,
  FiEdit3,
  FiInfo,
  FiPlayCircle,
  FiRefreshCcw,
  FiSave,
  FiServer,
  FiShare,
  FiXCircle,
  FiZap,
} from "react-icons/fi";
import * as Yup from "yup";
import ProjectSummary from "./projectSummary";
import { CustomPanelAlert } from "@/app/components/customPanels";
import AppInfromationSection from "./apps/appViewSection";
import AppChangeLogSection from "./apps/appLogsViewSection";
import AppsEnvirontmentSection from "./apps/appsEnvViewSection";
import ProjectFeatureView from "./projectFeaturesView";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import { InputLayoutFullHalf } from "@/app/components/layoutContentBody";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Detail",
  breadCrumb: ["Home", "Project Manager", "Detail"],
};

const OptionDataProjectStatus: OptionListProps[] = [
  {
    label: "NEW",
    value: "NEW",
  },
  {
    label: "ACTIVE",
    value: "ACTIVE",
  },
  {
    label: "ON HOLD",
    value: "ONHOLD",
  },
  {
    label: "IN ACTIVE",
    value: "INACTIVE",
  },
];

const FormSchemaEditProject = Yup.object().shape({
  id: Yup.string().required("ID is required"),
  projectNo: Yup.string().required("Project Number is required"),
  projectName: Yup.string()
    .required("Project Name is required")
    .min(3, "Minimum 3 characters")
    .max(100, "Maximum 100 characters"),
  projectDesc: Yup.string().nullable(),
  note: Yup.string().nullable(),
  projectCategory: Yup.string().required("Project Category is required"),
  projectType: Yup.string().required("Project Type is required"),
  projectRegisterDate: Yup.string().nullable(),
  projectClosedDate: Yup.string().nullable(),
  proOwnerDivisionId: Yup.string().nullable(),
  proOwnerGroupId: Yup.string().nullable(),
  proManageByDivisionId: Yup.string().nullable(),
  proManageByGroupId: Yup.string().nullable(),
  proManageByTeamId: Yup.string().nullable(),
});

function ProjectManagerDetail() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailById, UpdateProjects, GetDetailAppsByProjectId } =
    useProjects();

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

  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const id = searchParams.get("projectId");
    if (id) {
      setProjectId(id); // Set it to the state
    }
  }, [searchParams]);

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(projectId, tokenData);
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

          const itemsData: ProjectDataResponse =
            requestData.data as ProjectDataResponse;

          setDataProject(itemsData);
          setHeaderContentState({
            titleName: `Project Detail`,
            breadCrumb: ["Home", "Project Manager", itemsData.projectCode],
          });
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

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
        <Text fontWeight={600}>Data Project</Text>
        <pre>{JSON.stringify(DataProject, null, 2)}</pre>
      </Box>

      <Link href={"/projects-manager"}>
        <Button leftIcon={<FiArrowLeft />}>Back</Button>
      </Link>

      <Flex
        bg={colorMode == "light" ? "white" : "gray.700"}
        px={5}
        py={6}
        rounded={radiusStyle}
        w={"full"}
        justify={"space-between"}
        boxShadow={"md"}
      >
        <Tabs size={"lg"} variant={"unstyled"} w={"full"}>
          <TabList gap={2} overflowX={"auto"}>
            <Tab
              rounded={radiusStyle}
              px={6}
              _selected={{
                color: "white",
                bg: "primary.500",
                boxShadow: "md",
              }}
            >
              <FiInfo /> <Text pl={1}>Project Info</Text>
            </Tab>
            <Tab
              rounded={radiusStyle}
              px={6}
              _selected={{
                color: "white",
                bg: "primary.500",
                boxShadow: "md",
              }}
              isDisabled={!DataProject}
            >
              <FiCpu /> <Text pl={1}>Project Features</Text>
            </Tab>
            <Tab
              rounded={radiusStyle}
              px={6}
              _selected={{
                color: "white",
                bg: "primary.500",
                boxShadow: "md",
              }}
              isDisabled={!DataProject}
            >
              <FiShare /> <Text pl={1}>Projects Attachments</Text>
            </Tab>
          </TabList>
          <TabPanels pt={8}>
            {/* PROJECT INFO */}
            <TabPanel px={0}>
              <Suspense>
                <ProjectInfoSection projectId={projectId} />
              </Suspense>
            </TabPanel>
            {/* FEATURES */}
            <TabPanel px={0}>
              <Suspense>
                <ProjectFeatureView DataProject={DataProject} />
              </Suspense>
            </TabPanel>
            {/* ATTACHMENTS */}
            <TabPanel px={0}></TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </LayoutAdmin>
  );
}

const stepsProgress = [
  { title: "Initiation", description: "Project start" },
  { title: "Planning", description: "Set roadmap" },
  { title: "Development", description: "Code features" },
  { title: "Testing", description: "Bug checks" },
  { title: "Deployment", description: "Go live" },
];

export const initialProjectUpdateValues: ProjectUpdatePayload = {
  id: "",
  projectNo: "",
  projectName: "",
  projectDesc: null,
  note: null,
  projectCategory: "",
  projectType: "",
  projectRegisterDate: null,
  projectClosedDate: null,
  proOwnerDivisionId: null,
  proOwnerGroupId: null,
  proManageByDivisionId: null,
  proManageByGroupId: null,
  proManageByTeamId: null,
};

const ProjectInfoSection = ({ projectId }: { projectId: string | null }) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailById, UpdateProjects, GetDetailAppsByProjectId } =
    useProjects();

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

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  const [openConfirmUpdateDialog, setOpenConfirmUpdateDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [UpdatePayload, setUpdatePayload] =
    useState<ProjectUpdatePayload | null>(null);

  const formik = useFormik<ProjectUpdatePayload>({
    initialValues: initialProjectUpdateValues,
    validationSchema: FormSchemaEditProject,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleConfirmSaveData(values);
    },
  });

  const handleConfirmSaveData = async (data: ProjectUpdatePayload) => {
    setCaptionDialog("Confirm Save");
    setQuestionMsgDialog(`Are you sure want update project info?`);
    setOpenConfirmUpdateDialog(true);
    setUpdatePayload(data);
  };

  const handleConfirmSaveDataTrigger = () => {
    setOpenConfirmUpdateDialog(!openConfirmUpdateDialog);
  };

  const handleUpdateData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && UpdatePayload) {
      await UpdateTeamServ();
      setIsEditMode(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setUpdatePayload(null);
      setIsEditMode(false);
    }
  };

  const UpdateTeamServ = async () => {
    if (UpdatePayload) {
      const requestData = await UpdateProjects(UpdatePayload, tokenData);
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        return;
      } else {
        console.log(requestData);
        showToast({
          description: `Data project update successfully`,
          statusToast: "success",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        setIsEditMode(false);
        RefreshAction();
        return;
      }
    }
  };

  const RefreshAction = () => {
    setUpdatePayload(null);
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(projectId, tokenData);
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

          const itemsData: ProjectDataResponse =
            requestData.data as ProjectDataResponse;

          // set in form
          formik.setFieldValue("id", itemsData.id);
          formik.setFieldValue("projectNo", itemsData.projectNo);
          formik.setFieldValue("projectName", itemsData.projectName);
          formik.setFieldValue("projectDesc", itemsData.projectDesc);
          formik.setFieldValue("note", itemsData.note);
          formik.setFieldValue("projectCategory", itemsData.projectCategory);
          formik.setFieldValue("projectType", itemsData.projectType);
          formik.setFieldValue(
            "projectRegisterDate",
            itemsData.projectRegisterDate
          );
          formik.setFieldValue(
            "projectClosedDate",
            itemsData.projectClosedDate
          );
          formik.setFieldValue(
            "proOwnerDivisionId",
            itemsData.proOwnerDivisionId
          );
          formik.setFieldValue("proOwnerGroupId", itemsData.proOwnerGroupId);
          formik.setFieldValue(
            "proManageByDivisionId",
            itemsData.proManageByDivisionId
          );
          formik.setFieldValue(
            "proManageByGroupId",
            itemsData.proManageByGroupId
          );
          formik.setFieldValue(
            "proManageByTeamId",
            itemsData.proManageByTeamId
          );

          setDataProject(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, projectId]);

  // Stepper
  const { activeStep } = useSteps({
    index: 4,
    count: stepsProgress.length,
  });

  return (
    <Flex w={"full"}>
      <ConfirmationDialog
        key={"confirmUpdateData"}
        isOpenTrigger={openConfirmUpdateDialog}
        action={handleUpdateData}
        trigger={handleConfirmSaveDataTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />
      {!projectId && !DataProject ? (
        <CustomPanelAlert type={"error"}>
          <FiAlertTriangle color={"red"} size={70} />
          <Text>No project ID found in the URL</Text>
        </CustomPanelAlert>
      ) : (
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
            <Flex w={"full"} as={Stack} spacing={4}>
              <Card
                rounded={radiusStyle}
                boxShadow={"md"}
                bgGradient={"linear(to-br, secondary.500, secondary.800)"}
                color={"white"}
              >
                <CardHeader pb={1}>
                  <Flex justifyContent={"space-between"}>
                    <Heading as="h5" size="md">
                      Ringkasan
                    </Heading>
                    <Flex as={Wrap} justifyContent={"end"} px={0}>
                      {/* <Button
                        rounded={"3xl"}
                        size={"sm"}
                        rightIcon={<BsKanban />}
                      >
                        Go to Kanban
                      </Button> */}
                    </Flex>
                  </Flex>
                </CardHeader>
                <CardBody pt={2}>
                  <Flex minH={"420px"}>
                    <ProjectSummary
                      data={DataProject}
                      refreshActionMain={() => RefreshAction()}
                    />
                  </Flex>
                </CardBody>
              </Card>
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
            {IsLoadingProcess ? (
              <LoadingMiniSignature />
            ) : (
              <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
                <Flex
                  as={Stack}
                  w={"full"}
                  // divider={<StackDivider borderColor="gray.200" />}
                  spacing={6}
                  px={4}
                >
                  <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                    <Heading as="h5" size="md" w={"full"}>
                      Project Information
                    </Heading>
                    <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                      <Button
                        display={IsEditMode ? "none" : "flex"}
                        size={"sm"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                        isLoading={ActionLoading}
                      >
                        Refresh
                      </Button>
                      <Button
                        display={IsEditMode ? "flex" : "none"}
                        size={"sm"}
                        colorScheme={"red"}
                        leftIcon={<FiXCircle />}
                        onClick={() => {
                          setIsEditMode(false);
                          RefreshAction();
                        }}
                        isLoading={ActionLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        display={IsEditMode ? "none" : "flex"}
                        size={"sm"}
                        leftIcon={<FiEdit3 />}
                        colorScheme={"secondary"}
                        onClick={() => setIsEditMode(true)}
                        isLoading={ActionLoading}
                      >
                        Edit
                      </Button>
                      <Button
                        display={IsEditMode ? "flex" : "none"}
                        size={"sm"}
                        colorScheme={"green"}
                        leftIcon={<FiSave />}
                        // type={"submit"}
                        onClick={() => {
                          formik.submitForm();
                        }}
                        isLoading={ActionLoading}
                      >
                        Save
                      </Button>
                    </Flex>
                  </Flex>
                  <Flex
                    minH={"420px"}
                    as={Stack}
                    py={4}
                    px={2}
                    divider={<StackDivider borderColor="gray.200" />}
                  >
                    <FormControl
                      id="projectNo"
                      isInvalid={formik.errors.projectNo ? true : false}
                      isRequired
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Nomor Project
                        </FormLabel>
                        <Stack spacing={0}>
                          <Input
                            id="projectNo"
                            name="projectNo"
                            type="text"
                            onChange={(e) => {
                              const uppercaseValue =
                                e.target.value.toUpperCase(); // Convert to uppercase
                              formik.setFieldValue("projectNo", uppercaseValue); // Update Formik's value
                            }}
                            value={formik.values.projectNo ?? ""}
                            placeholder="Project No."
                            readOnly={!IsEditMode}
                            variant={IsEditMode ? "outline" : "unstyled"}
                            minLength={3}
                            maxLength={80}
                            isDisabled={ActionLoading}
                          />
                          <FormErrorMessage>
                            {formik.errors.projectNo}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projectName"
                      isInvalid={formik.errors.projectName ? true : false}
                      isRequired
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Nama Project
                        </FormLabel>
                        <Stack spacing={0}>
                          <Input
                            id="projectName"
                            name="projectName"
                            type="text"
                            onChange={(e) => {
                              const uppercaseValue =
                                e.target.value.toUpperCase(); // Convert to uppercase
                              formik.setFieldValue(
                                "projectName",
                                uppercaseValue
                              ); // Update Formik's value
                            }}
                            value={formik.values.projectName ?? ""}
                            placeholder="Project Name"
                            readOnly={!IsEditMode}
                            variant={IsEditMode ? "outline" : "unstyled"}
                            minLength={3}
                            maxLength={80}
                            isDisabled={ActionLoading}
                          />
                          <FormErrorMessage>
                            {formik.errors.projectName}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projectDesc"
                      isInvalid={formik.errors.projectDesc ? true : false}
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Deskripsi Project
                        </FormLabel>
                        <Stack spacing={0}>
                          <Textarea
                            id="projectDesc"
                            name="projectDesc"
                            onChange={(e) => {
                              formik.setFieldValue(
                                "projectDesc",
                                e.target.value
                              );
                            }}
                            readOnly={!IsEditMode}
                            variant={IsEditMode ? "outline" : "unstyled"}
                            defaultValue={formik.values.projectDesc ?? ""}
                            placeholder="Project Descriptions"
                            isDisabled={ActionLoading}
                            minH={"30px"}
                          ></Textarea>
                          <FormErrorMessage>
                            {formik.errors.projectDesc}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projectCategory"
                      isInvalid={formik.errors.projectCategory ? true : false}
                      isRequired
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Karakteristik Project
                        </FormLabel>
                        <Stack spacing={0} h={"full"}>
                          <SelectC
                            value={formik.values.projectCategory}
                            id="projectCategory"
                            name="projectCategory"
                            onChange={(e) => {
                              formik.setFieldValue(
                                `projectCategory`,
                                e.target.value
                              );
                            }}
                            placeholder="Select Karakteristik Project"
                            variant={IsEditMode ? "outline" : "unstyled"}
                            pointerEvents={!IsEditMode ? "none" : "auto"} // disable interaction
                            tabIndex={!IsEditMode ? -1 : undefined} // prevent tabbing
                            cursor={!IsEditMode ? "default" : "pointer"} // keep consistent cursor
                            color={
                              colorMode === "light"
                                ? "gray.800"
                                : "whiteAlpha.900"
                            }
                            bg="transparent"
                          >
                            {PROJEC_CATEGORY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </SelectC>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projectType"
                      isInvalid={formik.errors.projectType ? true : false}
                      isRequired
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Tipe Project
                        </FormLabel>
                        <Stack spacing={0} h={"full"}>
                          <SelectC
                            value={formik.values.projectType}
                            id="projectType"
                            name="projectType"
                            onChange={(e) => {
                              formik.setFieldValue(
                                `projectType`,
                                e.target.value
                              );
                            }}
                            placeholder="Select Tipe Project"
                            variant={IsEditMode ? "outline" : "unstyled"}
                            pointerEvents={!IsEditMode ? "none" : "auto"} // disable interaction
                            tabIndex={!IsEditMode ? -1 : undefined} // prevent tabbing
                            cursor={!IsEditMode ? "default" : "pointer"} // keep consistent cursor
                            color={
                              colorMode === "light"
                                ? "gray.800"
                                : "whiteAlpha.900"
                            }
                            bg="transparent"
                          >
                            {PROJEC_TYPE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </SelectC>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projectRegisterDate"
                      isInvalid={
                        formik.errors.projectRegisterDate ? true : false
                      }
                      isRequired
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Tanggal Register Project
                        </FormLabel>
                        <Stack spacing={0} h={"full"}>
                          <Input
                            id="projectRegisterDate"
                            name="projectRegisterDate"
                            type="date"
                            onChange={formik.handleChange}
                            value={
                              formik.values.projectRegisterDate
                                ? formik.values.projectRegisterDate.split(
                                    "T"
                                  )[0]
                                : ""
                            }
                            isReadOnly={!IsEditMode}
                            variant={IsEditMode ? "outline" : "unstyled"}
                            isDisabled={ActionLoading}
                          />
                          <FormErrorMessage>
                            {formik.errors.projectRegisterDate}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projectClosedDate"
                      isInvalid={formik.errors.projectClosedDate ? true : false}
                      isRequired
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Tanggal Closed Project
                        </FormLabel>
                        <Stack spacing={0} h={"full"}>
                          {formik.values.projectClosedDate != null ? (
                            <>
                              <Input
                                id="projectClosedDate"
                                name="projectClosedDate"
                                type="date"
                                isReadOnly={true}
                                variant={"unstyled"}
                                isDisabled={true}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectClosedDate}
                              </FormErrorMessage>
                            </>
                          ) : (
                            <Text px={2} fontWeight={600}>
                              ON GOING
                            </Text>
                          )}
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="projDateDuration"
                      isInvalid={
                        calculateDurationInDays(
                          formik.values.projectRegisterDate ??
                            new Date().toISOString().slice(0, 10),
                          formik.values.projectClosedDate ??
                            new Date().toISOString().slice(0, 10)
                        ) < 0
                      }
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h="full"
                          display="flex"
                          alignItems="center"
                        >
                          Durasi Project
                        </FormLabel>
                        <Stack spacing={0} h="full">
                          {formik.values.projectClosedDate != null ? (
                            <>
                              <Text px={2} fontWeight={600}>
                                {calculateDurationInDays(
                                  formik.values.projectRegisterDate ??
                                    new Date().toISOString().slice(0, 10),
                                  formik.values.projectClosedDate ??
                                    new Date().toISOString().slice(0, 10)
                                )}{" "}
                                Hari Kalendar (CLOSED)
                              </Text>
                              <FormErrorMessage>
                                {calculateDurationInDays(
                                  formik.values.projectRegisterDate ??
                                    new Date().toISOString().slice(0, 10),
                                  formik.values.projectClosedDate ??
                                    new Date().toISOString().slice(0, 10)
                                ) < 0 && "Durasi tidak boleh negatif"}
                              </FormErrorMessage>
                            </>
                          ) : (
                            <Text px={2} fontWeight={600}>
                              ON GOING
                            </Text>
                          )}
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    <FormControl
                      id="note"
                      isInvalid={formik.errors.note ? true : false}
                    >
                      <InputLayoutFullHalf>
                        <FormLabel
                          fontWeight={600}
                          h={"full"}
                          display="flex"
                          alignItems="center"
                        >
                          Note
                        </FormLabel>
                        <Stack spacing={0}>
                          <Textarea
                            id="note"
                            name="note"
                            onChange={(e) => {
                              formik.setFieldValue("note", e.target.value);
                            }}
                            readOnly={!IsEditMode}
                            variant={IsEditMode ? "outline" : "unstyled"}
                            defaultValue={formik.values.note ?? ""}
                            placeholder="Notes"
                            isDisabled={ActionLoading}
                            minH={"30px"}
                          ></Textarea>
                          <FormErrorMessage>
                            {formik.errors.note}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayoutFullHalf>
                    </FormControl>

                    {/* <p>Project ID: {projectId}</p> */}
                    <Box overflowY={"auto"}>
                      {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                    </Box>
                  </Flex>
                </Flex>
              </form>
            )}
          </GridItem>
        </Grid>
      )}
    </Flex>
  );
};

interface AppsInfoDetailProps {
  DataProject: ProjectDataResponse | null;
}

const AppsInfoDetail = ({ DataProject }: AppsInfoDetailProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { GetDetailAppsByProjectId } = useProjects();

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

  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  useEffect(() => {
    if (DataAuth && DataAuth.team && DataProject && DataApps == null) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailAppsByProjectId(
          DataProject.id,
          tokenData
        );
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

          const itemsData: AppsResponse = requestData.data as AppsResponse;

          setDataApps(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataProject, DataApps]);

  return (
    <Flex w={"full"}>
      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <Flex w={"full"}>
          {DataProject && DataApps ? (
            <Flex w={"full"} as={Stack}>
              <Tabs
                orientation="vertical"
                variant={"unstyled"}
                isFitted
                w={"full"}
              >
                <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }}
                    w={"full"}
                  >
                    <TabPanels w={"full"}>
                      <TabPanel px={0}>
                        <Suspense>
                          <AppInfromationSection />
                        </Suspense>
                      </TabPanel>
                      <TabPanel px={0}>
                        {DataApps && (
                          <Suspense>
                            <AppChangeLogSection AppsId={DataApps.id} />
                          </Suspense>
                        )}
                      </TabPanel>
                      <TabPanel px={0}>
                        {DataApps && (
                          <Suspense>
                            <AppsEnvirontmentSection AppsId={DataApps.id} />
                          </Suspense>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </GridItem>
                  <GridItem
                    colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }}
                    w={"full"}
                    minH={"500px"}
                  >
                    <Flex
                      w={"full"}
                      px={4}
                      py={6}
                      as={Stack}
                      // rounded={radiusStyle}
                      minH={"320px"}
                      borderLeft={"2px"}
                      borderColor={"gray.200"}
                    >
                      <Heading as="h5" size="sm">
                        Options
                      </Heading>
                      <TabList w={"full"} gap={4} pt={3}>
                        {/* APPS DETAILS */}
                        <Tab
                          rounded={radiusStyle}
                          px={6}
                          _selected={{
                            color: "white",
                            bg: "primary.500",
                            boxShadow: "md",
                            minH: "60px",
                          }}
                          justifyContent={"start"}
                        >
                          <FiInfo /> <Text pl={3}>Details</Text>
                        </Tab>
                        <Tab
                          rounded={radiusStyle}
                          px={6}
                          _selected={{
                            color: "white",
                            bg: "primary.500",
                            boxShadow: "md",
                            minH: "60px",
                          }}
                          justifyContent={"start"}
                        >
                          <FiActivity /> <Text pl={3}>Change Log</Text>
                        </Tab>
                        <Tab
                          rounded={radiusStyle}
                          px={6}
                          _selected={{
                            color: "white",
                            bg: "primary.500",
                            boxShadow: "md",
                            minH: "60px",
                          }}
                          justifyContent={"start"}
                        >
                          <FiServer /> <Text pl={3}>Environtment Links</Text>
                        </Tab>
                      </TabList>
                    </Flex>
                  </GridItem>
                </Grid>
              </Tabs>
            </Flex>
          ) : (
            <CustomPanelAlert type={"info"}>
              <FiAlertOctagon size={70} />
              <Text>Application not found. Register now?</Text>
              <Button
                size={"lg"}
                leftIcon={<FiZap />}
                colorScheme={"primary"}
                rounded={radiusStyle}
              >
                Register Apps Now
              </Button>
            </CustomPanelAlert>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default ProjectManagerDetail;
