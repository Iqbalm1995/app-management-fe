"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_MEDIUM,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { TextStatusProps, truncateText } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectDataResponse,
  ProjectUpdatePayload,
  ProjectUpdatePICPayload,
} from "@/app/services/useProjects";
import useUsers, {
  UsersFullResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import { AppsDataInterface, DATA_APPS } from "@/app/types/appsInterface";
import { OptionListProps, PaggingListPayload } from "@/app/types/masterTypes";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  Wrap,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  Image,
  Tooltip,
  Container,
  useColorModeValue,
  VStack,
  useDisclosure,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Spacer,
  ModalFooter,
} from "@chakra-ui/react";
import { Select, useStateManager } from "chakra-react-select";
import { useFormik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BsKanban } from "react-icons/bs";
import { CiMemoPad } from "react-icons/ci";
import { FaDraftingCompass } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  FiArrowLeft,
  FiCpu,
  FiEdit3,
  FiHeart,
  FiHexagon,
  FiMinusCircle,
  FiPlayCircle,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiShare,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import * as Yup from "yup";
import ProjectSummary from "./projectSummary";
import ProjectManagerSection from "./projectAppsManager";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Detail",
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
  projectName: Yup.string().required("Required"),
  projectStatus: Yup.string().required("Required"),
  projectStatusPercentage: Yup.string().required("Required"),
  teamId: Yup.string().required("Required"),
});

function ProjectManagerDetail() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List, GetDetailById, InsertProjects, UpdateProjects } = useProjects();

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
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [DataOptions1, setDataOptions1] = useState<OptionListProps[]>(
    OptionDataProjectStatus
  );

  const [openConfirmUpdateDialog, setOpenConfirmUpdateDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [UpdatePayload, setUpdatePayload] =
    useState<ProjectUpdatePayload | null>(null);

  const [percentage, setPercentage] = useState(0);

  const formik = useFormik<ProjectUpdatePayload>({
    initialValues: {
      id: "",
      projectNo: "",
      projectName: "",
      projectDesc: "",
      projectStatus: "NEW",
      projectStatusPercentage: "0",
      note: "",
      teamId: "",
    },
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
    if (DataAuth && DataAuth.teamMember && UpdatePayload) {
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

  const [SelectedOption1, setSelectedOption1] =
    useState<OptionListProps | null>(null);
  const handleSelectedOption = (data: OptionListProps) => {
    setSelectedOption1(data);
    formik.setFieldValue("projectStatus", data.value);
  };
  const handleUnselectedOption = () => {
    setSelectedOption1(null);
    formik.setFieldValue("projectStatus", "NEW");
  };

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember && projectId) {
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
          formik.setFieldValue("projectStatus", itemsData.projectStatus);
          formik.setFieldValue("note", itemsData.note);
          formik.setFieldValue("teamId", DataAuth.teamMember.id);

          const selectedStatus = DataOptions1.find(
            (x) => x.value == itemsData.projectStatus
          );
          if (selectedStatus) {
            handleSelectedOption(selectedStatus);
          }

          setDataProject(itemsData);
          setHeaderContentState({
            titleName: `Project Detail #${itemsData.projectCode}`,
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
      <Link href={"/projects-manager"}>
        <Button leftIcon={<FiArrowLeft />}>Back</Button>
      </Link>

      <ConfirmationDialog
        key={"confirmUpdateData"}
        isOpenTrigger={openConfirmUpdateDialog}
        action={handleUpdateData}
        trigger={handleConfirmSaveDataTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      <Card rounded={radiusStyle}>
        <CardBody w={"full"}>
          <Grid templateColumns="repeat(12, 1fr)" gap={5}>
            {!projectId && !DataProject ? (
              <>
                <GridItem
                  colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }}
                  w={"full"}
                >
                  <Card rounded={radiusStyle}>
                    <CardBody>
                      <Text color={"red.500"}>
                        No project ID found in the URL
                      </Text>
                    </CardBody>
                  </Card>
                </GridItem>
              </>
            ) : (
              <>
                <GridItem
                  colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}
                  w={"full"}
                >
                  <Flex w={"full"} as={Stack} spacing={4}>
                    <Card
                      rounded={radiusStyle}
                      boxShadow={"md"}
                      bgGradient={"linear(to-br, secondary.500, secondary.800)"}
                      color={"white"}
                    >
                      <CardHeader pb={1}>
                        <Flex justifyContent={"space-between"}>
                          <Heading as="h5" size="sm">
                            Summary
                          </Heading>
                          <Flex as={Wrap} justifyContent={"end"} px={0}>
                            <Button
                              rounded={"3xl"}
                              size={"sm"}
                              rightIcon={<BsKanban />}
                              //   onClick={() => RefreshAction()}
                              // isLoading={ActionLoading}
                            >
                              Go to Kanban
                            </Button>
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
                <GridItem
                  colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}
                  w={"full"}
                >
                  {IsLoadingProcess ? (
                    <LoadingMiniSignature />
                  ) : (
                    <form
                      onSubmit={formik.handleSubmit}
                      onReset={formik.handleReset}
                    >
                      <Box w={"full"} p={4}>
                        <Flex justifyContent={"space-between"}>
                          <Heading as="h5" size="sm">
                            Project Information #{DataProject?.projectCode}
                          </Heading>
                          <Flex as={Wrap} justifyContent={"end"} px={0}>
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
                        <Flex minH={"420px"} as={Stack} py={4}>
                          <FormControl
                            id="projectNo"
                            isInvalid={formik.errors.projectNo ? true : false}
                            isRequired
                          >
                            <FormLabel fontWeight={600} h={"full"}>
                              Project No.
                            </FormLabel>
                            <Stack spacing={0}>
                              <Input
                                id="projectNo"
                                name="projectNo"
                                type="text"
                                onChange={(e) => {
                                  const uppercaseValue =
                                    e.target.value.toUpperCase(); // Convert to uppercase
                                  formik.setFieldValue(
                                    "projectNo",
                                    uppercaseValue
                                  ); // Update Formik's value
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
                          </FormControl>

                          <FormControl
                            id="projectName"
                            isInvalid={formik.errors.projectName ? true : false}
                            isRequired
                          >
                            <FormLabel fontWeight={600} h={"full"}>
                              Project Name
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
                          </FormControl>

                          <FormControl
                            id="projectDesc"
                            isInvalid={formik.errors.projectDesc ? true : false}
                          >
                            <FormLabel fontWeight={600} h={"full"}>
                              Project Descriptions
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
                              ></Textarea>
                              <FormErrorMessage>
                                {formik.errors.projectDesc}
                              </FormErrorMessage>
                            </Stack>
                          </FormControl>

                          <FormControl
                            id="note"
                            isInvalid={formik.errors.note ? true : false}
                          >
                            <FormLabel fontWeight={600} h={"full"}>
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
                              ></Textarea>
                              <FormErrorMessage>
                                {formik.errors.note}
                              </FormErrorMessage>
                            </Stack>
                          </FormControl>

                          <FormControl
                            id={"projectStatus"}
                            isInvalid={
                              formik.errors.projectStatus ? true : false
                            }
                            isRequired
                          >
                            <FormLabel fontWeight={600} h={"full"}>
                              Project Status
                            </FormLabel>
                            <Stack spacing={0}>
                              <Select
                                id={"projectStatus"}
                                options={DataOptions1}
                                isSearchable={true}
                                onChange={(e) => {
                                  e
                                    ? handleSelectedOption({
                                        label: e.label,
                                        value: e.value,
                                      })
                                    : handleUnselectedOption();
                                }}
                                value={SelectedOption1}
                                variant={IsEditMode ? "outline" : "unstyled"}
                                isReadOnly={!IsEditMode}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectStatus}
                              </FormErrorMessage>
                            </Stack>
                          </FormControl>

                          {/* <p>Project ID: {projectId}</p> */}
                          <Box overflowY={"auto"}>
                            {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                          </Box>
                        </Flex>
                      </Box>
                    </form>
                  )}
                </GridItem>
                <GridItem
                  colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }}
                  w={"full"}
                >
                  <Box w={"full"} p={4}>
                    <Tabs position="relative" isFitted>
                      <TabList overflowX={"auto"}>
                        <Tab>
                          <FiPlayCircle /> <Text pl={1}>APPS</Text>
                        </Tab>
                        {/* <Tab>
                          <FaDraftingCompass /> <Text pl={1}>BRD</Text>
                        </Tab> */}
                        {/* <Tab>
                          <CiMemoPad /> <Text pl={1}>Memo</Text>
                        </Tab> */}
                        <Tab>
                          <FiCpu /> <Text pl={1}>Project Features</Text>
                        </Tab>
                        <Tab>
                          <FiShare /> <Text pl={1}>Projects Attachments</Text>
                        </Tab>
                      </TabList>
                      <TabIndicator
                        mt="-1.5px"
                        height="2px"
                        bg="secondary.500"
                        borderRadius="1px"
                      />
                      <TabPanels>
                        <TabPanel>
                          <ProjectManagerSection
                            data={DataProject}
                            refreshActionMain={() => RefreshAction()}
                          />
                        </TabPanel>
                        {/* <TabPanel>
                          <p>BRD!</p>
                        </TabPanel> */}
                        {/* <TabPanel>
                          <p>Memo!</p>
                        </TabPanel> */}
                        <TabPanel>
                          <p>Apps Features!</p>
                        </TabPanel>
                        <TabPanel>
                          <p>Projects Attachments!</p>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </Box>
                </GridItem>
              </>
            )}
          </Grid>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
}

export default ProjectManagerDetail;
