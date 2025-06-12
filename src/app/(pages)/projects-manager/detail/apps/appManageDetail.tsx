"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  InputLayout,
  InputLayoutFull,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_ACTION,
  DELAY_MEDIUM,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  OptionChangeLogsCategory,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import {
  buildUrlPort,
  convertToCustomDateFormat,
  generateTimestamp,
  generateUniqueCode,
  generateUUIDV1,
  TextLabelProps,
  TextStatusProps,
  truncateText,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsEnvDataResponse,
  AppsEnvInsertPayload,
  AppsEnvUpdateAccountAllPayload,
  AppsEnvUpdateAllPayload,
  AppsEnvUpdateLinkAllPayload,
  AppsLogsInsertPayload,
  AppsLogsPayload,
  AppsLogsResponse,
  AppsLogsUpdatePayload,
  AppsResponse,
  AppsUpdateDataPayload,
  AppsUploadDataPayload,
  ProjectDataResponse,
  ProjectUpdatePayload,
  ProjectUpdatePICPayload,
} from "@/app/services/useProjects";
import useUsers, {
  UsersFullResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import { AppsDataInterface, DATA_APPS } from "@/app/types/appsInterface";
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
  FormHelperText,
  WrapItem,
  Switch,
  Icon,
  Badge,
  StackDivider,
} from "@chakra-ui/react";
import { Select, useStateManager } from "chakra-react-select";
import { useFormik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BsFileXFill, BsKanban } from "react-icons/bs";
import { CiMemoPad } from "react-icons/ci";
import { FaDraftingCompass } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import {
  FiActivity,
  FiArrowLeft,
  FiCheckCircle,
  FiChevronRight,
  FiCircle,
  FiCpu,
  FiEdit3,
  FiEye,
  FiHeart,
  FiHexagon,
  FiInfo,
  FiMinus,
  FiMinusCircle,
  FiPlayCircle,
  FiPlus,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiServer,
  FiShare,
  FiTrash2,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import * as Yup from "yup";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import {
  AttachmentProps,
  OptionListProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import { DropZoneComponent } from "@/app/components/dropzone";
import { LoadingMiniStd } from "@/app/components/ladingMiniStd";
import { del } from "framer-motion/client";
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
import App from "next/app";
import { Search2Icon, SunIcon } from "@chakra-ui/icons";
import {
  TableComponentFull,
  TableComponentFullHeadless,
  TableComponentFullHeadlessAlternate1,
  TableComponentFullSm,
} from "@/app/components/tableComponents";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Detail Application",
  breadCrumb: ["Home", "Project Manager", "Detail", "Applications"],
};

function AppsManageDetail() {
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailAppsById, UpdateProjectsApps } = useProjects();

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

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

  const [AppsId, setAppsId] = useState<string | null>(null);
  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const appsId = searchParams.get("appsId");
    const projectId = searchParams.get("projectId");
    if (appsId && projectId) {
      setAppsId(appsId);
      setProjectId(projectId);
    }
  }, [searchParams]);

  const handleHeaderTittle = (data: HeaderContentProps) => {
    setHeaderContentState(data);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />
      <Link href={`/projects-manager/detail?projectId=${ProjectId}`}>
        <Button leftIcon={<FiArrowLeft />}>Back</Button>
      </Link>

      <Box w={"full"}>
        <Tabs position="relative" isFitted p={4}>
          <Flex
            overflowX={"auto"}
            bg={colorMode == "light" ? "white" : "gray.800"}
            p={4}
            rounded={radiusStyle}
            w={"full"}
            justify={"space-between"}
            boxShadow={"md"}
          >
            <TabList w={"full"}>
              <Tab>
                <FiInfo /> <Text pl={1}>Application Information</Text>
              </Tab>
              <Tab>
                <FiActivity /> <Text pl={1}>Change Log</Text>
              </Tab>
              <Tab>
                <FiServer /> <Text pl={1}>Environtment Links</Text>
              </Tab>
            </TabList>
          </Flex>
          <TabPanels>
            <TabPanel px={0}>
              <AppInfromationSection handleHeaderTittle={handleHeaderTittle} />
            </TabPanel>
            <TabPanel px={0}>
              <AppChangeLogSection />
            </TabPanel>
            <TabPanel px={0}>
              <AppsEnvirontmentSection />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}

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
  id: Yup.string().required("Required"),
  appShortName: Yup.string().required("Required"),
  appName: Yup.string().required("Required"),
  appsDesc: Yup.string().nullable(),
  note: Yup.string().nullable(),
  appsStatus: Yup.string().required("Required"),
  readyToLaunch: Yup.string().required("Required"),
});

const DefaultPathImg: string = "/img/default-comp-logo.png";

interface AppsManagePageProps {
  handleHeaderTittle: (data: HeaderContentProps) => void;
}

const AppInfromationSection = ({ handleHeaderTittle }: AppsManagePageProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { GetDetailAppsById, UpdateProjectsApps, UploadIconProjectsApps } =
    useProjects();

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

  const [AppsId, setAppsId] = useState<string | null>(null);
  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const appsId = searchParams.get("appsId");
    const projectId = searchParams.get("projectId");
    if (appsId && projectId) {
      setAppsId(appsId);
      setProjectId(projectId);
    }
  }, [searchParams]);

  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
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
    useState<AppsUpdateDataPayload | null>(null);

  const formik = useFormik<AppsUpdateDataPayload>({
    initialValues: {
      id: "",
      appShortName: "",
      appName: "",
      appsDesc: null,
      note: null,
      appsStatus: "INACTIVE",
      readyToLaunch: "N",
    },
    validationSchema: FormSchemaEditProject,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleConfirmSaveData(values);
    },
  });

  const handleConfirmSaveData = async (data: AppsUpdateDataPayload) => {
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
      await UpdateAppsServ();
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

  const UpdateAppsServ = async () => {
    if (UpdatePayload) {
      const requestData = await UpdateProjectsApps(UpdatePayload, tokenData);
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
          description: `Data apps update successfully`,
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

  const UpdateIconAppsServ = async () => {
    if (UpdateIconPayload) {
      await delay(DELAY_MEDIUM);
      const requestData = await UploadIconProjectsApps(
        UpdateIconPayload,
        tokenData
      );
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
        showToast({
          description: `Update icon apps  successfully`,
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
    setUpdateIconPayload(null);
  };

  const [SelectedOption1, setSelectedOption1] =
    useState<OptionListProps | null>(null);
  const handleSelectedOption = (data: OptionListProps) => {
    setSelectedOption1(data);
    formik.setFieldValue("appsStatus", data.value);
  };
  const handleUnselectedOption = () => {
    setSelectedOption1(null);
    formik.setFieldValue("appsStatus", "INACTIVE");
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && AppsId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailAppsById(AppsId, tokenData);
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

          // set in form
          formik.setFieldValue("id", itemsData.id);
          formik.setFieldValue("appShortName", itemsData.appShortName);
          formik.setFieldValue("appName", itemsData.appName);
          formik.setFieldValue("appsDesc", itemsData.appsDesc);
          formik.setFieldValue("note", itemsData.note);
          formik.setFieldValue("appsStatus", itemsData.appsStatus);
          formik.setFieldValue("readyToLaunch", itemsData.readyToLaunch);

          const selectedStatus = DataOptions1.find(
            (x) => x.value == itemsData.appsStatus
          );
          if (selectedStatus) {
            handleSelectedOption(selectedStatus);
          }
          if (itemsData.iconApps && itemsData.iconApps.length > 0) {
            setImage(
              buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                itemsData.iconApps
            );
          } else {
            setImage(DefaultPathImg);
          }

          setDataApps(itemsData);
          handleHeaderTittle({
            titleName: `Application #${itemsData.appCode}`,
            breadCrumb: [
              "Home",
              "Project Manager",
              "Application",
              `#${itemsData.appCode}`,
            ],
          });
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, AppsId]);

  const handleCheckRtL = (checked: boolean) => {
    formik.setFieldValue("readyToLaunch", checked ? "Y" : "N");
  };

  //   Image Configuration
  const [UpdateIconPayload, setUpdateIconPayload] =
    useState<AppsUploadDataPayload | null>(null);
  const [image, setImage] = useState("/img/default-comp-logo.png");
  useEffect(() => {
    const SendUpdateIcon = async () => {
      await UpdateIconAppsServ();
    };
    if (UpdateIconPayload) {
      SendUpdateIcon();
    }
  }, [image, UpdateIconPayload]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (DataAuth && DataAuth.team && AppsId) {
      if (file) {
        if (file.type.startsWith("image/")) {
          const imageUrl = URL.createObjectURL(file); // Generate a URL for the image preview
          setImage(imageUrl); // Set the new image preview URL
          setUpdateIconPayload({
            id: AppsId,
            iconApps: file,
          }); // Set the image file in state
        } else {
          showToast({
            description: "File is not an image",
            statusToast: "error",
          });
        }
      }
    }
  };

  return (
    <>
      <ConfirmationDialog
        key={"confirmUpdateData"}
        isOpenTrigger={openConfirmUpdateDialog}
        action={handleUpdateData}
        trigger={handleConfirmSaveDataTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      <Grid templateColumns="repeat(12, 1fr)" gap={5}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
          <Box
            w={"full"}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
            rounded={radiusStyle}
            boxShadow={"md"}
          >
            {IsLoadingProcess ? (
              <LoadingMiniSignature />
            ) : (
              <>
                {DataApps == null ? (
                  <Flex
                    w={"full"}
                    p={2}
                    justifyContent={"center"}
                    alignItems={"center"}
                    minH={"30vh"}
                  >
                    <Text color={"red.500"}>Apps ID found in the URL</Text>
                  </Flex>
                ) : (
                  <form
                    onSubmit={formik.handleSubmit}
                    onReset={formik.handleReset}
                  >
                    <Flex p={4} as={Stack} w={"full"}>
                      <Heading as="h5" size="sm">
                        Data Application
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
                          onClick={() => setIsEditMode(false)}
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
                          type={"submit"}
                          isLoading={ActionLoading}
                        >
                          Save
                        </Button>
                      </Flex>

                      <Flex as={Stack} w={"full"} p={4}>
                        <FormControl
                          id="appShortName"
                          isInvalid={formik.errors.appShortName ? true : false}
                          isRequired
                        >
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Aplication Short Name
                            </FormLabel>
                            <Stack spacing={0}>
                              <Input
                                id="appShortName"
                                name="appShortName"
                                type="text"
                                onChange={formik.handleChange}
                                value={formik.values.appShortName ?? ""}
                                placeholder="Team Name"
                                readOnly={!IsEditMode}
                                variant={IsEditMode ? "outline" : "filled"}
                                minLength={3}
                                maxLength={80}
                                isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.appShortName}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                        <FormControl
                          id="appName"
                          isInvalid={formik.errors.appName ? true : false}
                          isRequired
                        >
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Application Full Name
                            </FormLabel>
                            <Stack spacing={0}>
                              <Input
                                id="appName"
                                name="appName"
                                type="text"
                                onChange={formik.handleChange}
                                value={formik.values.appName ?? ""}
                                placeholder="Team Name"
                                readOnly={!IsEditMode}
                                variant={IsEditMode ? "outline" : "filled"}
                                minLength={3}
                                maxLength={80}
                                isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.appName}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                        <FormControl
                          id="appsDesc"
                          isInvalid={formik.errors.appsDesc ? true : false}
                        >
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Descriptions
                            </FormLabel>
                            <Stack spacing={0}>
                              <Textarea
                                id="appsDesc"
                                name="appsDesc"
                                onChange={formik.handleChange}
                                defaultValue={formik.values.appsDesc ?? ""}
                                placeholder="Descriptions"
                                readOnly={!IsEditMode}
                                variant={IsEditMode ? "outline" : "filled"}
                                isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.appsDesc}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                        <FormControl
                          id="note"
                          isInvalid={formik.errors.note ? true : false}
                        >
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Note
                            </FormLabel>
                            <Stack spacing={0}>
                              <Textarea
                                id="note"
                                name="note"
                                onChange={formik.handleChange}
                                defaultValue={formik.values.note ?? ""}
                                placeholder="Note"
                                readOnly={!IsEditMode}
                                variant={IsEditMode ? "outline" : "filled"}
                                isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.note}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>

                        <FormControl
                          id={"appsStatus"}
                          isInvalid={formik.errors.appsStatus ? true : false}
                          isRequired
                        >
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Application Status
                            </FormLabel>
                            <Stack spacing={0}>
                              <Select
                                id={"appsStatus"}
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
                                variant={IsEditMode ? "outline" : "filled"}
                                isReadOnly={!IsEditMode}
                              />
                              <FormErrorMessage>
                                {formik.errors.appsStatus}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>

                        <FormControl
                          id={"readyToLaunch"}
                          isInvalid={formik.errors.readyToLaunch ? true : false}
                        >
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Is Apps Ready to Launch?
                            </FormLabel>
                            <Stack spacing={0}>
                              <Switch
                                id="readyToLaunch"
                                size={"lg"}
                                isChecked={formik.values.readyToLaunch === "Y"}
                                onChange={(e) => {
                                  handleCheckRtL(e.target.checked);
                                }}
                                isReadOnly={!IsEditMode}
                                isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.readyToLaunch}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                      </Flex>

                      <Box overflowY={"auto"}>
                        {/* <pre>{JSON.stringify(DataApps, null, 2)}</pre> */}
                      </Box>
                    </Flex>
                  </form>
                )}
              </>
            )}
          </Box>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
          <Flex as={Stack} w={"full"}>
            <Flex
              as={Stack}
              bgColor={colorMode == "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              p={4}
              boxShadow={"md"}
            >
              <Heading as="h5" size="sm">
                Icon Application
              </Heading>
              {IsLoadingProcess ? (
                <LoadingMiniStd />
              ) : (
                <>
                  <Flex w={"full"} justify={"center"} p={4}>
                    <Box
                      as="label" // Make the box a label to trigger file input click
                      w={"150px"}
                      h={"150px"}
                      backgroundImage={`url(${image})`} // Dynamic image source
                      backgroundSize={"cover"}
                      backgroundPosition={"center"}
                      rounded={"3xl"}
                      cursor={"pointer"}
                      boxShadow={"lg"}
                      position="relative"
                      overflow="hidden" // Ensure text stays inside the rounded box
                      p={"8px"}
                      border={"3px solid"}
                      borderColor={
                        colorMode == "light" ? "gray.300" : "gray.600"
                      }
                    >
                      {/* Add Image Placeholder */}
                      {image == DefaultPathImg && (
                        <Box
                          rounded={"3xl"}
                          w={"full"}
                          h={"full"}
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          //   bg="gray.100" // Placeholder background
                          border="3px dashed" // Dashed border to signify 'add' functionality
                          color="rgba(73, 73, 73, 0.5)" // Example with 50% opacity
                        >
                          <FaPlus size={50} />
                        </Box>
                      )}

                      {/* Text that appears in the center on hover */}
                      <Box
                        display={"flex"}
                        alignItems="center"
                        justifyContent="center"
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg="rgba(0, 0, 0, 0.5)" // Semi-transparent gray background with correct opacity
                        color="white"
                        fontWeight="bold"
                        opacity="0" // Hidden by default
                        transition="opacity 0.3s ease"
                        _hover={{
                          opacity: "1", // Show text on hover
                        }}
                      >
                        <FiEdit3 />
                        <Text pl={2}>Change Icon</Text>
                      </Box>

                      {/* Hidden input file */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={ActionLoading}
                        style={{ display: "none" }} // Hide the input
                      />
                    </Box>
                  </Flex>
                  <Text textAlign={"center"}>Click image to change icon</Text>
                </>
              )}
            </Flex>
            <Flex
              as={Stack}
              bgColor={colorMode == "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
              p={4}
              boxShadow={"md"}
            >
              <Heading as="h5" size="sm">
                Preview Application
              </Heading>
              {IsLoadingProcess ? (
                <LoadingMiniStd />
              ) : (
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  <GridItem
                    colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    <ImageAddMore />
                  </GridItem>
                  {ImageAttachment.map((image, index) => (
                    <GridItem
                      colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                      w={"full"}
                      key={index}
                    >
                      <ImagePreview {...image} />
                    </GridItem>
                  ))}
                </Grid>
              )}
            </Flex>
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
};

const ImageAttachment: AttachmentProps[] = [
  {
    id: generateUUIDV1(),
    name: "Image 1",
    src: "/img/business/corp-assets-004.jpg",
    alt: "Image 1",
    extension: "jpg",
    size: "1.2MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 2",
    src: "/img/business/corp-assets-002.jpg",
    alt: "Image 2",
    extension: "jpg",
    size: "1.5MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 3",
    src: "/img/business/corp-assets-005.jpg",
    alt: "Image 3",
    extension: "jpg",
    size: "1.8MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 4",
    src: "/img/business/corp-assets-006.jpg",
    alt: "Image 4",
    extension: "jpg",
    size: "2.0MB",
  },
];

const ImagePreview = ({ name, alt, src }: AttachmentProps) => {
  const ImageModalDisc = useDisclosure();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      w={"full"}
      h={"90px"}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      onClick={() => ImageModalDisc.onOpen()}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      <Image
        rounded={radiusStyle}
        src={src}
        // boxSize="120px"
        w={"full"}
        h={"full"}
        objectFit="cover"
      />
      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Preview
        </Text>
      </Box>

      {/* Modal for image preview */}
      <Modal
        isOpen={ImageModalDisc.isOpen}
        onClose={ImageModalDisc.onClose}
        isCentered
        size={"xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          maxW="90vw"
          maxH="90vh"
          bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton color={"white"} />
          <ModalBody p={0}>
            <Box
              w="full"
              h="80vh" // Set the height to make it fit within the modal size
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundSize="contain" // Ensure the image fits well without stretching
              backgroundImage={`url(${src})`}
              rounded={radiusStyle}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ImageAddMore = () => {
  const AddImageModalDisc = useDisclosure();
  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      //   boxSize={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      w={"full"}
      h={"90px"}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      {/* Add Image Placeholder */}
      <Box
        rounded={radiusStyle}
        w={"full"}
        h={"full"}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.100" // Placeholder background
        border="2px dashed" // Dashed border to signify 'add' functionality
        color={"primary.300"}
      >
        <FaPlus size={50} />
      </Box>

      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
        onClick={AddImageModalDisc.onOpen}
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Add New
        </Text>
      </Box>
      {/* Modal for image preview */}
      <Modal
        isOpen={AddImageModalDisc.isOpen}
        onClose={AddImageModalDisc.onClose}
        isCentered
        size={"2xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          // bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          // backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody p={4}>
            <DropZoneComponent />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const FormSchemaLogsApps = Yup.object().shape({
  categoryChange: Yup.string().required("Required"),
  logTitle: Yup.string().required("Required"),
  logCode: Yup.string().required("Required"),
  logDesc: Yup.string().required("Required"),
});

const AppChangeLogSection = () => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const {
    ListLogsApps,
    GetDetailLogAppsById,
    InsertAppsLog,
    UpdateAppsLog,
    DeleteAppsLog,
  } = useProjects();

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

  const [AppsId, setAppsId] = useState<string | null>(null);
  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const appsId = searchParams.get("appsId");
    const projectId = searchParams.get("projectId");
    if (appsId && projectId) {
      setAppsId(appsId);
      setProjectId(projectId);
    }
  }, [searchParams]);

  const [DataAppsLogs, setDataAppsLogs] = useState<AppsLogsResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [ActionLoading, setActionLoading] = useState(false);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columnsData = useMemo<ColumnDef<AppsLogsResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.logCode,
        id: "logCode",
        cell: (info) => (
          <Stack spacing={0}>
            <Box
              w={"full"}
              p={4}
              rounded={radiusStyle}
              bg={colorMode == "light" ? "gray.100" : "gray.700"}
            >
              <Flex as={HStack} alignItems={"center"} w={"full"}>
                <Flex as={HStack} alignItems={"start"} w={"full"}>
                  <Icon as={FiCheckCircle} color="green.500" mt={1} />
                  <Flex as={Stack} spacing={1}>
                    <Flex as={HStack} alignItems={"center"}>
                      <Heading as="h5" size="sm">
                        {info.row.original.logTitle}
                      </Heading>
                      <TextLabelProps
                        statusData={info.row.original.categoryChange}
                      />
                    </Flex>
                    <Text
                      fontSize="xs"
                      color={colorMode == "light" ? "gray.500" : "gray.400"}
                    >
                      Changed on:{" "}
                      {convertToCustomDateFormat(info.row.original.createdAt)}
                    </Text>
                  </Flex>
                </Flex>
                <Flex as={HStack} justifyContent={"end"} spacing={1}>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    colorScheme={"secondary"}
                    onClick={() => handleEditData(info.row.original.id)}
                    isLoading={ActionLoading}
                  >
                    <FiEdit3 />
                  </Button>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    colorScheme={"red"}
                    onClick={() => handleConfirmDeleteData(info.row.original)}
                    isLoading={ActionLoading}
                  >
                    <FiTrash2 />
                  </Button>
                </Flex>
              </Flex>
              <Text
                fontSize="sm"
                color={colorMode == "light" ? "gray.600" : "gray.400"}
                pt={2}
              >
                {info.row.original.logDesc}
              </Text>
            </Box>
          </Stack>
        ),
        header: () => <span>Log Tittle</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.team) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [
          {
            field: "appsId",
            operator: "=",
            value: AppsId || "-",
          },
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListLogsApps(PayloadList, tokenData);
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

          const itemsData: AppsLogsResponse[] =
            requestData.data as AppsLogsResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataAppsLogs(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, AppsId]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataAppsLogs([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: DataAppsLogs,
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

  const formik = useFormik<AppsLogsPayload>({
    initialValues: {
      id: null,
      appsId: AppsId,
      logTitle: "",
      categoryChange: "INFO",
      changeDate: generateTimestamp(),
      logCode: generateUniqueCode("LG"),
      logDesc: "",
    },
    validationSchema: FormSchemaLogsApps,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      // console.log(values);
      if (AppsId == null) {
        showToast({
          description: "Apps ID is invalid",
          statusToast: "error",
        });
        setActionLoading(false);
        return;
      } else {
        setActionLoading(true);
        await delay(DELAY_ACTION);
        if (values.id != null && values.id.length > 0) {
          // Update Action
          await EditAppsLogServ({
            id: values.id,
            categoryChange: values.categoryChange,
            changeDate: values.changeDate,
            logCode: values.logCode,
            logDesc: values.logDesc,
            logTitle: values.logTitle,
          });
        } else {
          // Insert Action
          await AddAppsLogServ({
            appsId: AppsId,
            logTitle: values.logTitle,
            categoryChange: values.categoryChange,
            changeDate: values.changeDate,
            logCode: values.logCode,
            logDesc: values.logDesc,
          });
        }
      }
    },
  });

  //OptionChangeLogsCategory
  const [DataOptions1, setDataOptions1] = useState<OptionListProps[]>(
    OptionChangeLogsCategory
  );
  const [SelectedOption1, setSelectedOption1] =
    useState<OptionListProps | null>(null);
  const handleSelectedOption = (data: OptionListProps) => {
    setSelectedOption1(data);
    formik.setFieldValue("categoryChange", data.value);
  };
  const handleUnselectedOption = () => {
    setSelectedOption1(null);
    formik.setFieldValue("categoryChange", "INACTIVE");
  };

  const ModalForm = useDisclosure();
  const handleAddNew = () => {
    if ((DataAuth && DataAuth.team, AppsId)) {
      formik.setFieldValue("id", null);
      formik.setFieldValue("appsId", AppsId);
      formik.setFieldValue("logTitle", "");
      formik.setFieldValue("categoryChange", "INFO");
      formik.setFieldValue("changeDate", generateTimestamp());
      formik.setFieldValue("logCode", generateUniqueCode("LG"));
      formik.setFieldValue("logDesc", "");
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleEditData = async (id: string) => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team) {
      const GetData: AppsLogsResponse | null = await GetDetailLogAppsServ(id);
      if (GetData == null) return;
      formik.setFieldValue("id", GetData.id);

      formik.setFieldValue("appsId", AppsId);
      formik.setFieldValue("logTitle", GetData.logTitle);
      // formik.setFieldValue("categoryChange", GetData.categoryChange);
      formik.setFieldValue("changeDate", GetData.changeDate);
      formik.setFieldValue("logCode", GetData.logCode);
      formik.setFieldValue("logDesc", GetData.logDesc);

      const dataOption: OptionListProps | undefined = DataOptions1.find(
        (x) => x.value === GetData.categoryChange
      );
      if (dataOption != undefined) {
        handleSelectedOption(dataOption);
      }

      ModalForm.onOpen();
      setActionLoading(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
    }
  };

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [detailData, setdetailData] = useState<AppsLogsResponse | null>(null);

  const GetDetailLogAppsServ = async (
    id: string
  ): Promise<AppsLogsResponse | null> => {
    const requestData = await GetDetailLogAppsById(id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return null;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return null;
      }

      const itemsData: AppsLogsResponse = requestData.data as AppsLogsResponse;

      return itemsData;
    }
  };

  const AddAppsLogServ = async (data: AppsLogsInsertPayload) => {
    const requestData = await InsertAppsLog(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);

      showToast({
        description: "Adding data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      ModalForm.onClose();
      RefreshAction();
      return;
    }
  };

  const EditAppsLogServ = async (data: AppsLogsUpdatePayload) => {
    const requestData = await UpdateAppsLog(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);

      showToast({
        description: "Update data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      ModalForm.onClose();
      RefreshAction();
      return;
    }
  };

  const DeleteAppsLogServ = async (data: AppsLogsResponse) => {
    const requestData = await DeleteAppsLog(data.id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);

      showToast({
        description: "Delete data successfully",
        statusToast: "success",
      });

      RefreshAction();
      setActionLoading(false);
      return;
    }
  };

  const handleConfirmDeleteData = (data: AppsLogsResponse) => {
    setCaptionDialog("Confirm Delete");
    setQuestionMsgDialog(`Are you sure want to delete "${data.logTitle}"?`);
    setOpenConfirmDeleteDialog(true);
    setdetailData(data);
  };

  const handleDeleteData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && detailData) {
      await DeleteAppsLogServ(detailData);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setdetailData(null);
    }
  };

  const handleDialogDeleteTrigger = () => {
    setOpenConfirmDeleteDialog(!openConfirmDeleteDialog);
  };

  return (
    <Box
      w={"full"}
      bgColor={colorMode == "light" ? "white" : "gray.800"}
      rounded={radiusStyle}
      boxShadow={"md"}
      p={4}
      minH={"40vh"}
    >
      <ConfirmationDialog
        key={"confirmDeleteData"}
        isOpenTrigger={openConfirmDeleteDialog}
        action={handleDeleteData}
        trigger={handleDialogDeleteTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />
      <Modal
        size={"2xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
      >
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <ModalOverlay bg="blackAlpha.300" />
          <ModalContent
            rounded={radiusStyle}
            m={2}
            bg={useColorModeValue("white", "gray.900")}
          >
            <ModalHeader>
              {formik.values.id != null && formik.values.id.length > 0
                ? "Edit Data"
                : "Add Data"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody w={"full"}>
              <Flex as={Stack} w={"full"} pt={4}>
                <FormControl
                  id="logTitle"
                  isInvalid={formik.errors.logTitle ? true : false}
                  isRequired
                >
                  <FormLabel>Log Tittle</FormLabel>
                  <Stack spacing={0}>
                    <Input
                      id="logTitle"
                      name="logTitle"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.logTitle ?? ""}
                      placeholder="Tittle"
                      minLength={3}
                      maxLength={80}
                    />
                    <FormErrorMessage>
                      {formik.errors.logTitle}
                    </FormErrorMessage>
                  </Stack>
                </FormControl>

                <FormControl
                  id={"categoryChange"}
                  isInvalid={formik.errors.categoryChange ? true : false}
                  isRequired
                >
                  <FormLabel h={"full"}>Label</FormLabel>
                  <Stack spacing={0}>
                    <Select
                      id={"categoryChange"}
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
                    />
                    <FormErrorMessage>
                      {formik.errors.categoryChange}
                    </FormErrorMessage>
                  </Stack>
                </FormControl>

                <FormControl
                  id="logDesc"
                  isInvalid={formik.errors.logDesc ? true : false}
                  isRequired
                >
                  <FormLabel h={"full"}>Descriptions</FormLabel>
                  <Stack spacing={0}>
                    <Textarea
                      id="logDesc"
                      name="logDesc"
                      onChange={formik.handleChange}
                      defaultValue={formik.values.logDesc ?? ""}
                      placeholder={"Descriptions"}
                      minH={"20vh"}
                    />
                    <FormErrorMessage>{formik.errors.logDesc}</FormErrorMessage>
                  </Stack>
                </FormControl>

                <Box overflowY={"auto"}>
                  {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                </Box>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme={"gray"}
                leftIcon={<FiX />}
                mr={3}
                onClick={ModalForm.onClose}
                isLoading={ActionLoading}
              >
                Close
              </Button>
              <Button
                leftIcon={<FiSave />}
                type={"submit"}
                colorScheme={"secondary"}
                isLoading={ActionLoading}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
      <Heading as="h5" size="sm">
        Data Change Log
      </Heading>
      <Flex as={Wrap} justifyContent={"end"} p={4} w={"full"}>
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
          Add
        </Button>
      </Flex>
      <VStack w={"full"} p={0} align={"start"} spacing={2}>
        {IsLoadingProcess ? (
          <LoadingMiniSignature />
        ) : (
          <TableComponentFullHeadless table={table} />
        )}
      </VStack>
    </Box>
  );
};

const FormSchemaEnvUpdateAll = Yup.object().shape({
  id: Yup.string().required("ID is required"),
  envName: Yup.string().required("Environment name is required"),
  envDesc: Yup.string().nullable(), // Allow null for description
  isActive: Yup.string().required("Status is required"),
});

const FormSchemaEnvAccount = Yup.object().shape({
  id: Yup.string().nullable(),
  accountsName: Yup.string().required("Account name is required"),
  accountsDesc: Yup.string().required("Descriptions is required"),
});

const AppsEnvirontmentSection = () => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const {
    ListAppsEnv,
    ListAppsEnvLink,
    ListAppsEnvAccount,
    GetDetailAppsEnvById,
    GetDetailAppsEnvLinkById,
    GetDetailAppsEnvAccountById,
    InsertAppsEnv,
    InsertAppsEnvLink,
    InsertAppsEnvAccount,
    UpdateAppsEnv,
    UpdateAppsEnvLink,
    UpdateAppsEnvAccount,
    DeleteAppsEnv,
    DeleteAppsEnvLink,
    DeleteAppsEnvAccount,
    UpdateAppsEnvAll,
  } = useProjects();

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

  const [AppsId, setAppsId] = useState<string | null>(null);
  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const appsId = searchParams.get("appsId");
    const projectId = searchParams.get("projectId");
    if (appsId && projectId) {
      setAppsId(appsId);
      setProjectId(projectId);
    }
  }, [searchParams]);

  const [DataAppsEnv, setDataAppsEnv] = useState<AppsEnvDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [DetailEnv, setDetailEnv] = useState<AppsEnvDataResponse | null>(null);
  const [LinkData, setLinkData] = useState<AppsEnvUpdateLinkAllPayload[]>([]);
  const [AccountData, setAccountData] = useState<
    AppsEnvUpdateAccountAllPayload[]
  >([]);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columnsData = useMemo<ColumnDef<AppsEnvDataResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "logCode",
        cell: (info) => (
          <Stack spacing={0}>
            <Box
              w={"full"}
              p={4}
              rounded={radiusStyle}
              bg={colorMode == "light" ? "gray.100" : "gray.700"}
            >
              <Flex
                as={HStack}
                alignItems={"center"}
                w={"full"}
                divider={
                  <StackDivider
                    borderColor={
                      colorMode == "light" ? "secondary.200" : "secondary.600"
                    }
                  />
                }
              >
                <Flex as={HStack} alignItems={"start"} w={"full"}>
                  <Heading as="h5" size="sm">
                    {info.row.original.envName}
                  </Heading>
                </Flex>
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Button
                    size={"md"}
                    variant={"ghost"}
                    colorScheme={"secondary"}
                    isActive={info.row.original.id === DetailEnv?.id}
                    onClick={() => handleEditData(info.row.original)}
                    isLoading={ActionLoading}
                  >
                    <FiChevronRight size={"1.5em"} />
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Stack>
        ),
        header: () => <span></span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode, DetailEnv]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.team) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [
          {
            field: "appsId",
            operator: "=",
            value: AppsId || "-",
          },
        ],
        fieldOrder: ["envName"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListAppsEnv(PayloadList, tokenData);
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

          const itemsData: AppsEnvDataResponse[] =
            requestData.data as AppsEnvDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataAppsEnv(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, AppsId]);

  const RefreshAction = () => {
    setTextNewEnvName("");
    setTotalPageData(0);
    setDataAppsEnv([]);
    setDetailEnv(null);
    setLinkData([]);
    setAccountData([]);
    setRefreshData(RefreshData + 1);
    formik.resetForm();
  };

  const table = useReactTable({
    data: DataAppsEnv,
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

  const formik = useFormik<AppsEnvUpdateAllPayload>({
    initialValues: {
      id: "",
      envName: "",
      envDesc: null,
      isActive: "ACTIVE",
      links: [
        {
          id: null,
          linksSource: "",
        },
      ],
      accounts: [
        {
          id: null,
          accountsName: "",
          accountsDesc: null,
        },
      ],
    },
    validationSchema: FormSchemaEnvUpdateAll,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log("onSubmit triggered");
      console.log(values); // Log the form data
      await SaveEnvData(values);
    },
  });

  const handleButtonClick = () => {
    console.log("Submit button clicked");
    console.log("Formik errors: ", formik.errors); // Check for validation errors

    formik.setFieldValue("links", LinkData);
    formik.setFieldValue("accounts", AccountData);

    formik.handleSubmit(); // Trigger form submission
  };

  const handleEditData = async (data: AppsEnvDataResponse) => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    const appsId = searchParams.get("appsId");
    if (appsId) {
      const GetData: AppsEnvDataResponse | null = await GetDetailAppsEnvServ(
        data.id
      );
      console.log(GetData);
      if (GetData == null) return;

      setDetailEnv(data);
      setInputLinkText("");

      formik.setFieldValue("id", GetData.id);
      formik.setFieldValue("appsId", AppsId);
      formik.setFieldValue("envName", GetData.envName);
      formik.setFieldValue("envDesc", GetData.envDesc);
      formik.setFieldValue("isActive", "ACTIVE");

      setLinkData(GetData.links);
      setAccountData(GetData.accounts);

      // ModalForm.onOpen();
      setActionLoading(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
    }
  };

  const GetDetailAppsEnvServ = async (
    id: string
  ): Promise<AppsEnvDataResponse | null> => {
    const requestData = await GetDetailAppsEnvById(id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return null;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return null;
      }

      const itemsData: AppsEnvDataResponse =
        requestData.data as AppsEnvDataResponse;

      return itemsData;
    }
  };

  const SaveEnvData = async (data: AppsEnvUpdateAllPayload) => {
    const requestData = await UpdateAppsEnvAll(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Save data environtment successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  const SaveNewEnvData = async (data: AppsEnvInsertPayload) => {
    const requestData = await InsertAppsEnv(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Create new environtment successfully",
        statusToast: "success",
      });
      ModalFormNewEnv.onClose();
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  const DeleteEnvDataServ = async (id: string) => {
    const requestData = await DeleteAppsEnv(id, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Delete environtment successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  // LINK OPERATIONS
  // Function to add a new item
  const addLinkItem = () => {
    if (InputLinkText.length <= 3) {
      showToast({
        description: "Link cannot be empty or too short",
        statusToast: "warning",
      });
      return;
    }

    const appsId = searchParams.get("appsId");
    const newItem: AppsEnvUpdateLinkAllPayload = {
      id: null,
      linksSource: InputLinkText,
    };
    setLinkData([...LinkData, newItem]); // Add new item to the state
    setInputLinkText("");
  };

  // Function to remove an item by its index
  const removeItem = (index: number) => {
    const updatedItems = [...LinkData];
    updatedItems.splice(index, 1); // Remove the item at the given index
    setLinkData(updatedItems); // Update state after removing the item
  };

  // Function to edit an item's name by its index
  const editItem = (index: number, linkText: string) => {
    const updatedItems = [...LinkData];
    updatedItems[index] = { ...updatedItems[index], linksSource: linkText }; // Update name at the index
    setLinkData(updatedItems); // Update state with the edited item
  };

  const [InputLinkText, setInputLinkText] = useState<string>("");

  // ACCOUNT OPERATIONS

  const [EditModeAccount, setEditModeAccount] = useState(false);
  const [IndexSelectedAccount, setIndexSelectedAccount] = useState(0);
  const formikAccountENV = useFormik<AppsEnvUpdateAccountAllPayload>({
    initialValues: {
      id: null,
      accountsName: "",
      accountsDesc: null,
    },
    validationSchema: FormSchemaEnvAccount,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values); // Log the form data
      console.log(EditModeAccount);
      console.log(IndexSelectedAccount);
      if (EditModeAccount) {
        // Edit Operation
        editItemAccount(IndexSelectedAccount, values);
      } else {
        addLinkItemAccount(values);
      }
    },
  });

  const ModalForm = useDisclosure();

  const handleAddNewAccount = () => {
    if ((DataAuth && DataAuth.team, AppsId)) {
      setEditModeAccount(false);
      formikAccountENV.setFieldValue("id", null);
      formikAccountENV.setFieldValue("accountsName", "");
      formikAccountENV.setFieldValue("accountsDesc", "");
      ModalForm.onOpen();
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleEditDataAccount = async (
    data: AppsEnvUpdateAccountAllPayload,
    index: number
  ) => {
    setEditModeAccount(true);
    setIndexSelectedAccount(index);
    formikAccountENV.setFieldValue("id", data.id);
    formikAccountENV.setFieldValue("accountsName", data.accountsName);
    formikAccountENV.setFieldValue("accountsDesc", data.accountsDesc);

    ModalForm.onOpen();
  };

  const addLinkItemAccount = (data: AppsEnvUpdateAccountAllPayload) => {
    setAccountData([...AccountData, data]); // Add new item to the state

    setEditModeAccount(false);
    ModalForm.onClose();
  };
  // Function to edit an item's name by its index
  const editItemAccount = (
    index: number,
    data: AppsEnvUpdateAccountAllPayload
  ) => {
    const updatedItems = [...AccountData];
    updatedItems[index] = {
      ...updatedItems[index],
      accountsName: data.accountsName,
      accountsDesc: data.accountsDesc,
    }; // Update name at the index
    setAccountData(updatedItems); // Update state with the edited item

    setEditModeAccount(false);
    ModalForm.onClose();
  };

  // Function to remove an item by its index
  const removeItemAccount = (index: number) => {
    const updatedItems = [...AccountData];
    updatedItems.splice(index, 1); // Remove the item at the given index
    setAccountData(updatedItems); // Update state after removing the item
    setEditModeAccount(false);
    ModalForm.onClose();
  };

  // Function to add new Environtment
  const ModalFormNewEnv = useDisclosure();
  const [TextNewEnvName, setTextNewEnvName] = useState<string>("");
  const handleAddNewEnv = () => {
    setTextNewEnvName("");
    ModalFormNewEnv.onOpen();
  };

  const handleSaveNewEnv = async () => {
    if (TextNewEnvName.length <= 3) {
      showToast({
        description: "Link cannot be empty or too short",
        statusToast: "warning",
      });
      return;
    }

    if ((DataAuth && DataAuth.team, AppsId)) {
      setEditModeAccount(false);
      const PayloadNewData: AppsEnvInsertPayload = {
        appsId: AppsId,
        envName: TextNewEnvName,
        envDesc: "",
        isActive: "ACTIVE",
      };
      setActionLoading(true);
      await SaveNewEnvData(PayloadNewData);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
  };

  // Funtion delete env
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");

  const handleDeleteEnv = () => {
    if (DetailEnv && AppsId) {
      console.log(DetailEnv);
      handleConfirmDeleteData(DetailEnv);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleConfirmDeleteData = (data: AppsEnvDataResponse) => {
    setCaptionDialog("Confirm Delete Data");
    setQuestionMsgDialog(
      `Are you sure want to delete environtment "${data.envName}"?`
    );
    setOpenConfirmDialog(true);
  };

  const DeleteDataEnv = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && DetailEnv) {
      await DeleteEnvDataServ(DetailEnv.id);
    } else {
      showToast({
        description: "Data is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setDetailEnv(null);
    }
  };

  const handleDialogTrigger = () => {
    setOpenConfirmDialog(!openConfirmDialog);
  };

  return (
    <Box
      w={"full"}
      bgColor={colorMode == "light" ? "white" : "gray.800"}
      rounded={radiusStyle}
      boxShadow={"md"}
      p={4}
      minH={"40vh"}
    >
      <ConfirmationDialog
        key={"confirmDeleteData"}
        isOpenTrigger={openConfirmDialog}
        action={DeleteDataEnv}
        trigger={handleDialogTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      <Modal
        size={"2xl"}
        isOpen={ModalFormNewEnv.isOpen}
        isCentered
        onClose={ModalFormNewEnv.onClose}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={useColorModeValue("white", "gray.900")}
        >
          <ModalHeader>Create New Environtment</ModalHeader>
          <ModalCloseButton />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"} pt={4}>
              <FormControl id="envName" isRequired>
                {/* <FormLabel>Environtment Name</FormLabel> */}
                <Stack spacing={0}>
                  <Input
                    id="envName"
                    name="envName"
                    type="text"
                    onChange={(e) => {
                      const uppercaseValue = e.target.value.toUpperCase();
                      setTextNewEnvName(uppercaseValue);
                    }}
                    value={TextNewEnvName}
                    variant={"flushed"}
                    placeholder="New Environtment Name here..."
                    size={"lg"}
                    minLength={3}
                    maxLength={80}
                  />
                </Stack>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme={"gray"}
              leftIcon={<FiX />}
              mr={3}
              onClick={ModalFormNewEnv.onClose}
              isLoading={ActionLoading}
            >
              Close
            </Button>
            <Button
              leftIcon={<FiPlusSquare />}
              type={"button"}
              colorScheme={"secondary"}
              isLoading={ActionLoading}
              onClick={() => handleSaveNewEnv()}
            >
              Create New
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Heading as="h5" size="sm">
        Apps Environtment Management
      </Heading>
      <Grid templateColumns="repeat(12, 1fr)" gap={5}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 5, lg: 5 }} w={"full"}>
          <Flex as={Wrap} justifyContent={"end"} p={4} w={"full"}>
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
              onClick={() => handleAddNewEnv()}
              isLoading={ActionLoading}
            >
              Add
            </Button>
          </Flex>
          <VStack w={"full"} p={0} align={"start"} spacing={2}>
            {IsLoadingProcess ? (
              <LoadingMiniSignature />
            ) : (
              <TableComponentFullHeadlessAlternate1 table={table} />
            )}
          </VStack>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 7, lg: 7 }} w={"full"}>
          <Card
            rounded={radiusStyle}
            boxShadow={"md"}
            bgGradient={"linear(to-br, secondary.500, secondary.800)"}
            color={"white"}
          >
            <CardHeader pb={1}>
              <Flex justifyContent={"space-between"}>
                <Flex as={HStack}>
                  {DetailEnv && (
                    <Button
                      size={"sm"}
                      variant={"ghost"}
                      colorScheme={"white"}
                      onClick={() => setDetailEnv(null)}
                      isLoading={ActionLoading}
                    >
                      <FiX />
                    </Button>
                  )}
                  <Heading as="h5" size="sm">
                    Detail Environtment
                  </Heading>
                </Flex>
                {DetailEnv && (
                  <Flex as={Wrap} justifyContent={"end"} px={0}>
                    <Button
                      size={"sm"}
                      leftIcon={<FiSave />}
                      variant={"solid"}
                      colorScheme={"green"}
                      onClick={() => handleButtonClick()}
                      isLoading={ActionLoading}
                    >
                      Save Update
                    </Button>
                    <Button
                      size={"sm"}
                      variant={"solid"}
                      colorScheme={"red"}
                      onClick={() => handleDeleteEnv()}
                      isLoading={ActionLoading}
                    >
                      <FiTrash2 />
                    </Button>
                  </Flex>
                )}
              </Flex>
            </CardHeader>
            <CardBody pt={2} w={"full"}>
              <Flex
                minH={"420px"}
                justifyContent={DetailEnv ? "start" : "center"}
                alignItems={DetailEnv ? "start" : "center"}
                w={"full"}
                as={Stack}
              >
                {ActionLoading ? (
                  <LoadingMiniSignature />
                ) : DetailEnv ? (
                  <Tabs variant="unstyled" w={"full"}>
                    <TabList>
                      <Tab
                        _selected={{
                          bg: "gray.200",
                          color: "secondary.600",
                          boxShadow: "md",
                        }}
                        fontWeight={600}
                        rounded={radiusStyle}
                      >
                        Detail Env
                      </Tab>
                      <Tab
                        _selected={{
                          bg: "gray.200",
                          color: "secondary.600",
                          boxShadow: "md",
                        }}
                        fontWeight={600}
                        rounded={radiusStyle}
                      >
                        Link Apps
                      </Tab>
                      <Tab
                        _selected={{
                          bg: "gray.200",
                          color: "secondary.600",
                          boxShadow: "md",
                        }}
                        fontWeight={600}
                        rounded={radiusStyle}
                      >
                        Account Apps
                      </Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Flex as={Stack} w={"full"} pt={4}>
                          <form
                            onSubmit={formik.handleSubmit}
                            onReset={formik.handleReset}
                          >
                            <FormControl
                              id="envName"
                              isInvalid={formik.errors.envName ? true : false}
                              isRequired
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Environtment Name
                                </FormLabel>
                                <Stack spacing={0}>
                                  <Input
                                    id="envName"
                                    name="envName"
                                    type="text"
                                    onChange={formik.handleChange}
                                    value={formik.values.envName ?? ""}
                                    placeholder="Team Name"
                                    // readOnly={!IsEditMode}
                                    // variant={IsEditMode ? "outline" : "filled"}
                                    minLength={3}
                                    maxLength={80}
                                    color={"gray.800"}
                                    bgColor={"gray.100"}
                                    // isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.envName}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="envDesc"
                              isInvalid={formik.errors.envDesc ? true : false}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Environtment Descriptions
                                </FormLabel>
                                <Stack spacing={0}>
                                  <Textarea
                                    id="envDesc"
                                    name="envDesc"
                                    onChange={formik.handleChange}
                                    defaultValue={formik.values.envDesc ?? ""}
                                    placeholder="Descriptions"
                                    // readOnly={!IsEditMode}
                                    // variant={IsEditMode ? "outline" : "filled"}
                                    color={"gray.800"}
                                    bgColor={"gray.100"}
                                    // isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.envDesc}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          </form>
                        </Flex>
                      </TabPanel>
                      <TabPanel>
                        <Flex as={Stack} w={"full"} pt={4}>
                          <Flex
                            w={"full"}
                            bgColor={
                              colorMode == "light" ? "white" : "gray.800"
                            }
                            color={colorMode == "light" ? "gray.800" : "white"}
                            p={3}
                            rounded={radiusStyle}
                          >
                            <FormControl id="InputLinkText" isRequired>
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  New Link Apps
                                </FormLabel>
                                <HStack spacing={2}>
                                  <Input
                                    id="InputLinkText"
                                    name="InputLinkText"
                                    type="text"
                                    onChange={(e) =>
                                      setInputLinkText(e.target.value)
                                    }
                                    value={InputLinkText}
                                    placeholder="https://..."
                                    // readOnly={!IsEditMode}
                                    // variant={IsEditMode ? "outline" : "filled"}
                                    minLength={3}
                                    maxLength={80}
                                    color={"gray.800"}
                                    bgColor={"gray.100"}
                                    isDisabled={ActionLoading}
                                  />
                                  <Button
                                    size={"sm"}
                                    variant={"solid"}
                                    colorScheme={"secondary"}
                                    onClick={() => addLinkItem()}
                                    isLoading={ActionLoading}
                                  >
                                    <FiPlus />
                                  </Button>
                                </HStack>
                              </InputLayout>
                            </FormControl>
                          </Flex>
                        </Flex>
                        <Flex
                          as={Stack}
                          w={"full"}
                          spacing={2}
                          pt={3}
                          px={4}
                          divider={<StackDivider />}
                        >
                          {LinkData.map((dt, index) => (
                            <FormControl
                              id={`InputLinkText${index}`}
                              key={index}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} py={2}>
                                  Link - {index + 1}
                                </FormLabel>
                                <Stack spacing={1}>
                                  <HStack spacing={2}>
                                    <Input
                                      id={`InputLinkText${index}`}
                                      name={`InputLinkText${index}`}
                                      type="text"
                                      onChange={(e) =>
                                        editItem(index, e.target.value)
                                      }
                                      value={dt.linksSource}
                                      placeholder="https://..."
                                      // readOnly={!IsEditMode}
                                      // variant={IsEditMode ? "outline" : "filled"}
                                      minLength={3}
                                      maxLength={80}
                                      color={"gray.800"}
                                      bgColor={"gray.100"}
                                      isDisabled={ActionLoading}
                                    />
                                    <Button
                                      size={"sm"}
                                      variant={"solid"}
                                      colorScheme={"red"}
                                      onClick={() => removeItem(index)}
                                      isLoading={ActionLoading}
                                    >
                                      <FiMinus />
                                    </Button>
                                  </HStack>
                                  <Link
                                    href={
                                      dt.linksSource.length > 0
                                        ? dt.linksSource
                                        : "#"
                                    }
                                    target={"_blank"}
                                  >
                                    <Tooltip
                                      hasArrow
                                      rounded={radiusStyle}
                                      colorScheme={"secondary"}
                                      label={`${dt.linksSource}`}
                                    >
                                      <Button
                                        variant={"link"}
                                        size={"sm"}
                                        colorScheme={"white"}
                                      >
                                        {truncateText(dt.linksSource, 120)}
                                      </Button>
                                    </Tooltip>
                                  </Link>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          ))}
                        </Flex>
                      </TabPanel>
                      <TabPanel>
                        <Flex as={Stack} w={"full"}>
                          <Flex
                            as={Wrap}
                            justifyContent={"end"}
                            py={4}
                            w={"full"}
                          >
                            <Button
                              size={"sm"}
                              colorScheme={"secondary"}
                              leftIcon={<FiPlusSquare />}
                              onClick={() => handleAddNewAccount()}
                              isLoading={ActionLoading}
                            >
                              Add
                            </Button>
                          </Flex>

                          <Flex as={Stack} w={"full"}>
                            {AccountData.map((dt, index) => (
                              <Flex
                                key={index}
                                w={"full"}
                                as={HStack}
                                bgColor={"white"}
                                rounded={radiusStyle}
                                p={4}
                                px={5}
                                color={"gray.900"}
                                divider={
                                  <StackDivider
                                    borderColor={
                                      colorMode == "light"
                                        ? "secondary.200"
                                        : "secondary.600"
                                    }
                                  />
                                }
                              >
                                <Flex
                                  w={"full"}
                                  justifyContent={"start"}
                                  gap={2}
                                  pl={4}
                                >
                                  <Text>{index + 1}.</Text>
                                  <Text>{dt.accountsName}</Text>
                                </Flex>
                                <Button
                                  size={"sm"}
                                  variant={"ghost"}
                                  colorScheme={"secondary"}
                                  onClick={() =>
                                    handleEditDataAccount(dt, index)
                                  }
                                >
                                  <FiEye />
                                </Button>
                              </Flex>
                            ))}
                          </Flex>
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                ) : (
                  <Text>No data preview</Text>
                )}
              </Flex>

              <Modal
                size={"2xl"}
                isOpen={ModalForm.isOpen}
                isCentered
                onClose={ModalForm.onClose}
              >
                <form
                  onSubmit={formikAccountENV.handleSubmit}
                  onReset={formikAccountENV.handleReset}
                >
                  <ModalOverlay bg="blackAlpha.300" />
                  <ModalContent
                    rounded={radiusStyle}
                    m={2}
                    bg={useColorModeValue("white", "gray.900")}
                  >
                    <ModalHeader>
                      {formikAccountENV.values.id != null &&
                      formikAccountENV.values.id.length > 0
                        ? "Edit Data"
                        : "Add Data"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody w={"full"}>
                      <Flex as={Stack} w={"full"} pt={4}>
                        <FormControl
                          id="accountsName"
                          isInvalid={
                            formikAccountENV.errors.accountsName ? true : false
                          }
                          isRequired
                        >
                          <FormLabel>Account Name</FormLabel>
                          <Stack spacing={0}>
                            <Input
                              id="accountsName"
                              name="accountsName"
                              type="text"
                              onChange={formikAccountENV.handleChange}
                              value={formikAccountENV.values.accountsName ?? ""}
                              placeholder="Account Name"
                              minLength={3}
                              maxLength={80}
                            />
                            <FormErrorMessage>
                              {formikAccountENV.errors.accountsName}
                            </FormErrorMessage>
                          </Stack>
                        </FormControl>
                        <FormControl
                          id="accountsDesc"
                          isInvalid={
                            formikAccountENV.errors.accountsDesc ? true : false
                          }
                          isRequired
                        >
                          <FormLabel h={"full"}>Descriptions</FormLabel>
                          <Stack spacing={0}>
                            <Textarea
                              id="accountsDesc"
                              name="accountsDesc"
                              onChange={formikAccountENV.handleChange}
                              defaultValue={
                                formikAccountENV.values.accountsDesc ?? ""
                              }
                              placeholder={"Descriptions"}
                              minH={"20vh"}
                            />
                            <FormErrorMessage>
                              {formikAccountENV.errors.accountsDesc}
                            </FormErrorMessage>
                          </Stack>
                        </FormControl>
                      </Flex>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        colorScheme={"red"}
                        leftIcon={<FiTrash2 />}
                        mr={3}
                        onClick={() => removeItemAccount(IndexSelectedAccount)}
                        isLoading={ActionLoading}
                      >
                        Delete
                      </Button>
                      <Button
                        colorScheme={"gray"}
                        leftIcon={<FiX />}
                        mr={3}
                        onClick={ModalForm.onClose}
                        isLoading={ActionLoading}
                      >
                        Close
                      </Button>
                      <Button
                        leftIcon={<FiSave />}
                        type={"submit"}
                        colorScheme={"secondary"}
                        isLoading={ActionLoading}
                      >
                        Save
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </form>
              </Modal>

              <Box overflowY={"auto"}>
                {/* <pre>{JSON.stringify(AccountData, null, 2)}</pre> */}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AppsManageDetail;
