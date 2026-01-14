"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputGroupPanel } from "@/app/components/customPanels";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import UserSearchSelect from "@/app/components/inputProps/userSearchSelect";
import LabelMaster from "@/app/components/labelMasterProps";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  InputLayout,
  InputLayoutFull,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  TableComponentFull,
  TableComponentFullHeadless,
  TableComponentFullSm,
} from "@/app/components/tableComponents";
import {
  allDaysString,
  APP_ACCESS_MEDIA_INTERNET,
  APP_ACCESS_MEDIA_INTRANET,
  APP_ENV_LOCATION_OPTIONS,
  APP_INTEGRATED_OTHER_APPS,
  APP_OPERATIONAL_OPTIONS,
  APP_RELATED_OPTIONS,
  APP_TRANSACTIONAL_OPTIONS,
  APP_TYPE_OPTIONS,
  DELAY_MEDIUM,
  DIRECTORATE_ID_IT_BJB,
  DIVISION_ID_IT_BJB,
  fullDay,
  GROUP_CONST_BRD_STATUS,
  LINK_MENU_ROOT,
  MAX_SIZE_TABLE,
  MEDIA_KEY_REQUIREMENT,
  NEXT_STEP_ACTION_REVIEW,
  ORG_CATEGORY_KEY_DIRECTORATE,
  ORG_CATEGORY_KEY_DIVISION,
  ORG_CATEGORY_KEY_GROUP,
  radiusStyle,
  REQUIREMENT_STATUS_NEW,
  REQUIREMENT_TYPE_BRD,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  SELECTED_OPTION_DIRECTORATE,
  SELECTED_OPTION_DIVISION,
} from "@/app/constants/applicationConstants";
import {
  REQ_STATUS_NEED_REVIEW,
  REQ_STATUS_CAN_EDIT,
  REQ_STATUS_IN_PROGRESS_REVIEW,
  REQ_WAITING_APPROVAL,
} from "@/app/constants/masterStatusConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  calculateDurationInDays,
  convertStringToDate,
  formatDateCA,
  formatDateReverse,
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  getCurrentQuarter,
  getQuarterDateRange,
  getQuarterText,
  nomCompColor,
  renderFileIcon,
  stringToDateFormatedReverse,
  truncateText,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import useRequirements, {
  BacklogDataResponse,
  PICAssignUserPayload,
  ReqBacklogPayload,
  RequirementsInsertPayload,
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
  WorkProgramsPayload,
} from "@/app/services/useRequirements";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import {
  FileDetails,
  ListSearchByParam,
  OptionDivisionDynamic,
  OptionListProps,
  PaggingListPayload,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  StackDivider,
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
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useDisclosure,
  useSteps,
  VStack,
  Wrap,
  WrapItem,
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
import { FieldArray, FormikProps, useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { redirect, useParams, usePathname, useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiCornerDownLeft,
  FiExternalLink,
  FiInfo,
  FiLock,
  FiMinusCircle,
  FiPlus,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiXCircle,
} from "react-icons/fi";
import * as yup from "yup";
import { Select } from "chakra-react-select";
import { useDropzone } from "react-dropzone";
import { FaRegTrashCan, FaTrash } from "react-icons/fa6";
import useMediaObject, {
  InsertMediaObjectByKeyPayload,
} from "@/app/services/useMediaObject";
import RegistrationNumberInput from "@/app/components/inputProps/RegistrationNumberInput";
import EmailInputMask from "@/app/components/inputProps/emailInputMask";
import VersionCodeInput from "@/app/components/inputProps/versionInput";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import OtherInputAppsStringSeparator from "@/app/components/inputProps/InputMultiTags";
import InputTagsArea from "@/app/components/inputProps/InputMultiTagsArea";
import { FeatureRecomentionsBacklogs } from "@/app/helper/FeatureDataRecomendations";
import IdentificationNumberInput from "@/app/components/inputProps/IdentificationNumberInput";
import InputSelectOptions from "@/app/components/inputProps/inputSelectOptions";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import AppPickerModal from "./AppPickerModal";
import { WeekdaySelector } from "@/app/components/inputProps/WeekDaySelector";
import CoverLockedFeature from "@/app/components/coverLockedFeature";

// const TYPE_REQ: string = REQUIREMENT_TYPE_BRD;

const HeaderDataContent: HeaderContentProps = {
  titleName: `Registrasi Requirements`,
  breadCrumb: ["Home", "Requirements", "Registrasi"],
};

const FormSchema = yup.object().shape({
  // STG 1
  isHaveMemo: yup.string().required("Have Memo is required"),
  reffParentId: yup.string().nullable(),
  senderDirectorateId: yup.string().nullable(),
  senderDivisionId: yup.string().nullable(),
  requirementType: yup.string().required("Requirement Type is required"),
  reqNumber: yup.string().required("Requirement Number is required"),
  reqNarative: yup.string().required("Requirement Narrative is required"),
  reqInititateDate: yup.string().nullable(),
  reqAcceptedDate: yup.string().nullable(),
  isCarryOver: yup.string().required("IsCarryOver is required"),

  // STG 2 - AREA 1
  assignedToDate: yup.string().nullable(),
  assignedFromId: yup.string().nullable(),
  assignedFromName: yup.string().nullable(),
  picAssignUsers: yup
    .array()
    .of(
      yup.object({
        // userId: yup.string().required("User ID is required"), // Commented for future use
      })
    )
    .required(),

  // AREA 2
  // userPicId: yup.string().nullable(), // Commented for future use
  // userPicIdentityNumber: yup.string().nullable(), // Commented for future use
  userPicName: yup.string().nullable(),
  userPicContanct: yup.string().nullable(),
  userPicEmail: yup.string().email().nullable(),
  userPicDirectorateId: yup.string().nullable(),
  userPicDivisionId: yup.string().nullable(),
  userPicGroupId: yup.string().nullable(),

  // Manage By
  reqManageByDirectorateId: yup.string().nullable(),
  reqManageByDivisionId: yup.string().nullable(),
  reqManageByGroupId: yup.string().nullable(),

  // AREA 3
  workPrograms: yup
    .array()
    .of(
      yup.object({
        directorateId: yup.string().required(),
        divisionId: yup.string().required(),
        groupId: yup.string().nullable(),
        workProgramSource: yup.string().required(),
        workProgramCode: yup.string().nullable(),
        workProgramName: yup.string().nullable(),
        workProgramAccName: yup.string().nullable(),
        workProgramAccNumber: yup.string().nullable(),
        workProgramAccCc: yup.string().nullable(),
        workProgramBudget: yup.number().required(),
        workProgramReal: yup.number().required(),
        workProgramLeftovers: yup.number().required(),
      })
    )
    .required(),

  // AREA 4
  appInitialCode: yup.string().nullable(),
  appInitialName: yup.string().nullable(),

  appTargetUsers: yup.string().required("App Target User is required"),
  appAccessFrontsiteDns: yup.string().nullable(),
  appAccessFrontsiteIp: yup.string().nullable(),
  appAccessBacksiteDns: yup.string().nullable(),
  appAccessBacksiteIp: yup.string().nullable(),

  backlogChange: yup.string().nullable(),
  appAccessMedia: yup.string().nullable(),
  appTypes: yup.string().nullable(),
  appTypeCustom: yup.string().nullable(),
  appRelatedness: yup.string().nullable(),
  appRelatednessDesc: yup.string().nullable(),
  appTransactionals: yup.string().nullable(),
  appOperational24hrs: yup.string().nullable(),
  appOperationalDays: yup.string().nullable(),
  appOperationalHourOpen: yup.string().nullable(),
  appOperationalHourClosed: yup.string().nullable(),
  appLiveTargetDate: yup.string().nullable(),

  appEnvLocations: yup.string().nullable(),
  appEnvLocationsOthers: yup.string().nullable(),
  appPrivateAuth: yup.string().nullable(),
  appHightAvailability: yup.string().nullable(),
  appIntegrationOthersApps: yup.string().nullable(),

  note: yup.string().nullable(),
  isDraft: yup.boolean().required(),

  backlogFeatures: yup
    .array()
    .of(
      yup.object({
        backlogId: yup.string().nullable(),
        parentBacklogId: yup.string().nullable(),
        backlogName: yup.string().required("Backlog name is required"),
        backlogDesc: yup.string().nullable(),
      })
    )
    .required(),
});

interface UploadedFileItem {
  id: string;
  name: string;
  extension: string;
  size: number;
  url: string;
}

// Crucial data alert component
interface CrucialDataAlertProps {
  formik: any;
  setActiveStep: (step: number) => void;
}

const CrucialDataAlert: React.FC<CrucialDataAlertProps> = ({ formik, setActiveStep }) => {
  const hasAppData = formik.values.appInitialCode && formik.values.appInitialCode.trim() !== "";
  const hasBacklogData = formik.values.backlogFeatures && formik.values.backlogFeatures.length > 0;
  
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
          Requirement ini sudah disetujui namun masih memerlukan data berikut untuk dapat digunakan dalam proyek:
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
      <Button
        colorScheme="orange"
        size="sm"
        onClick={() => setActiveStep(4)}
        leftIcon={<FiArrowRight />}
      >
        Lengkapi Data
      </Button>
    </Alert>
  );
};

// Projects relation component
interface ProjectsRelationSectionProps {
  requirementId: string;
}

const ProjectsRelationSection: React.FC<ProjectsRelationSectionProps> = ({ requirementId }) => {
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
              <Link href={`/projects/detail/${project.id}`} target="_blank">
                <IconButton
                  aria-label="View project"
                  icon={<FiExternalLink />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                />
              </Link>
            </Flex>
          </Box>
        ))}
      </VStack>
    </InputGroupPanel>
  );
};

function RegisterRequirementFormPage({
  type_req_param = "BRD",
}: {
  type_req_param: "BRD" | "RFC";
}) {
  // SetUp auth data on current page
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const perihalSementaraRef = useRef<HTMLTextAreaElement>(null);
  const perihalCursorPosRef = useRef<number | null>(null);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const namaLengkapRef = useRef<HTMLInputElement>(null);
  const namaLengkapCursorPosRef = useRef<number | null>(null);
  const {
    InsertReq,
    RegisterDraft,
    RegisterUpdate,
    RequestApproval,
    ListReqMedia,
    GetDetailById,
    ListBacklog,
  } = useRequirements();
  const { InsertMediaObjectByKey, DeleteMediaObject } = useMediaObject();
  const [requirementId, setRequirementId] = useState<string | null>(null);
  const [requirementStatus, setRequirementStatus] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListOrganization } = useOrganization();
  const [isClient, setIsClient] = useState(false);
  const ModalAppPicker = useDisclosure();
  const [selectedApp, setSelectedApp] =
    useState<ApplicationMasterResponse | null>(null);
  const [hasProjects, setHasProjects] = useState<boolean>(false);
  const { List: ListApps } = useApps();
  const { GetProjectsByRequirementId } = useRequirements();

  // Check if requirement has projects
  const checkRequirementProjects = async () => {
    if (!requirementId) return;
    
    try {
      const token = localStorage.getItem("tokenData");
      if (token) {
        const response = await GetProjectsByRequirementId(requirementId, token);
        if (response && response.statusCode === RES_CODE_OK && response.data) {
          setHasProjects(response.data.length > 0);
        }
      }
    } catch (error) {
      console.error("Error checking projects:", error);
    }
  };

  // Check if app selection should be disabled (edit mode + has projects + app already selected from DB)
  const isAppSelectionDisabled = () => {
    return isEditMode && hasProjects && !!formik.values.appInitialCode;
  };

  // Check projects when in edit mode
  useEffect(() => {
    if (requirementId && isEditMode) {
      checkRequirementProjects();
    }
  }, [requirementId, isEditMode]);

  const initialValues: RequirementsInsertPayload = {
    // STG 1
    isHaveMemo: "Y",
    reffParentId: null,
    senderDirectorateId: null,
    senderDivisionId: null,
    requirementType: type_req_param,
    reqNumber: "",
    reqNarative: "",
    reqInititateDate: null,
    reqAcceptedDate: null,
    isCarryOver: "N",

    // STG 2 - AREA 1
    assignedToDate: null,
    assignedFromId: null,
    assignedFromName: null,
    picAssignUsers: [{ userId: "" }],

    // AREA 2
    userPicId: null,
    userPicIdentityNumber: null,
    userPicName: null,
    userPicContanct: null,
    userPicEmail: null,
    userPicDirectorateId: null,
    userPicDivisionId: null,
    userPicGroupId: null,

    // Manage By
    reqManageByDirectorateId: null,
    reqManageByDivisionId: null,
    reqManageByGroupId: null,

    // AREA 3
    workPrograms: [],

    // AREA 4
    appInitialCode: null,
    appInitialName: null,

    appTargetUsers: "INTERNAL",
    appAccessFrontsiteDns: null,
    appAccessFrontsiteIp: null,
    appAccessBacksiteDns: null,
    appAccessBacksiteIp: null,

    backlogChange: null,
    appAccessMedia: null,
    appTypes: null,
    appTypeCustom: null,
    appRelatedness: null,
    appRelatednessDesc: null,
    appTransactionals: null,
    appOperational24hrs: null,
    appOperationalDays: null,
    appOperationalHourOpen: null,
    appOperationalHourClosed: null,
    appLiveTargetDate: null,

    appEnvLocations: "",
    appEnvLocationsOthers: "",
    appPrivateAuth: "Y",
    appHightAvailability: "Y",
    appIntegrationOthersApps: "",

    note: "",
    isDraft: false,

    backlogFeatures: [
      {
        backlogId: "",
        backlogName: "",
        backlogDesc: "",
        posOrder: 0,
      },
    ],
  };

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

    // Load requirementId from URL if exists
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const reqIdFromUrl = urlParams.get("id");
      const modeFromUrl = urlParams.get("mode");
      if (reqIdFromUrl && !requirementId && tokenData) {
        setRequirementId(reqIdFromUrl);
        setIsEditMode(true);
        setIsReviewMode(modeFromUrl === "review");
        loadRequirementData(reqIdFromUrl);
      }
    }
  }, [DataAuth, tokenData, requirementId]);

  // Set default assigned from user after auth is loaded
  useEffect(() => {
    if (DataAuth && !requirementId && !formik.values.assignedFromId) {
      const currentUser = {
        userId: DataAuth.userId,
        nama: DataAuth.nama,
        email: DataAuth.email || "",
        team: DataAuth.team,
      } as UsersResponse;
      setDataUsersAssignedFrom([currentUser]);
      setAssignedFromUser(DataAuth.userId);
      formik.setFieldValue("assignedFromId", DataAuth.userId);
      formik.setFieldValue("assignedFromName", DataAuth.nama);
      formik.setFieldValue("assignedFromEmail", DataAuth.email);
    }
  }, [DataAuth, requirementId]);
  // End SetUp auth data on current page

  const GetOptionDataServ = async (key: string): Promise<OptionListProps[]> => {
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

  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  const AddMediaObjServ = async (
    data: InsertMediaObjectByKeyPayload
  ): Promise<boolean> => {
    const requestData = await InsertMediaObjectByKey(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: `Upload File Failed : ${requestData?.message || RES_GENERIC_ERROR_MSG
          }`,
        statusToast: "error",
      });
      return false;
    } else {
      console.log(requestData);

      showToast({
        description: "Upload File Success",
        statusToast: "success",
      });
      return true;
    }
  };

  const AddRequirement = async (data: RequirementsInsertPayload) => {
    const requestData = await InsertReq(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (files.length <= 0 && data.isHaveMemo !== "N") {
      showToast({
        description: `upload files must be uploaded, at least one.`,
        statusToast: "warning",
      });
      setActionLoading(false);
      return;
    }

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);

      const itemsKey: string = requestData.data as string;
      if (itemsKey != null && itemsKey.length > 0) {
        if (files.length > 0) {
          for (const file of files) {
            const DataUploads: InsertMediaObjectByKeyPayload = {
              KeyData: MEDIA_KEY_REQUIREMENT,
              KeyId: itemsKey,
              file: file,
            };

            // send upload files
            await AddMediaObjServ(DataUploads);
          }
        }
      } else {
        showToast({
          description: `Error getting Requirement ID`,
          statusToast: "error",
        });
      }

      showToast({
        description: "Creating new requirement data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      RefreshAction();
      redirect(`/requirements/brd-rfc`);
      return;
    }
  };

  const loadUploadedFiles = async (reqId: string) => {
    const payload: PaggingListPayloadCustom = {
      search: "",
      reqId: reqId,
      limit: 100,
      page: 0,
      filterWhere: [],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };
    const requestData = await ListReqMedia(payload, tokenData);
    if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
      setUploadedFiles(
        requestData.data.map((file) => ({
          id: file.id,
          name: file.objectRawName,
          extension: file.objectExtension,
          size: file.objectSize,
          url: file.objectFullPath,
        }))
      );
    }
  };

  const handleDeleteUploadedFile = async (fileId: string) => {
    const requestData = await DeleteMediaObject(fileId, tokenData);
    if (requestData?.statusCode === RES_CODE_OK) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      showToast({
        description: "File deleted successfully",
        statusToast: "success",
      });
    } else {
      showToast({
        description: requestData?.message || "Failed to delete file",
        statusToast: "error",
      });
    }
  };

  const loadRequirementData = async (reqId: string) => {
    try {
      const requestData = await GetDetailById(reqId, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        const reqData = requestData.data;

        // Check if requirement status allows editing
        if (
          reqData.reqStatus &&
          !REQ_STATUS_CAN_EDIT.includes(reqData.reqStatus) &&
          reqData.isHaveMemo !== "N"
        ) {
          showToast({
            description: `Cannot edit requirement with status: ${reqData.reqStatus
              }. Only ${REQ_STATUS_CAN_EDIT.join(", ")} can be edited.`,
            statusToast: "warning",
          });
          const reqType = reqData.requirementType?.toLowerCase() || "brd";
          router.push(`/requirements/brd-rfc`);
          return;
        }

        // Store requirement status
        setRequirementStatus(reqData.reqStatus || null);

        // Populate formik with requirement data
        formik.setValues({
          ...formik.values,
          isHaveMemo: reqData.isHaveMemo || "Y",
          reffParentId: reqData.reffParentId,
          senderDirectorateId: reqData.senderDirectorateId,
          senderDivisionId: reqData.senderDivisionId,
          requirementType: reqData.requirementType,
          reqNumber: reqData.reqNumber,
          reqNarative: reqData.reqNarative,
          reqInititateDate: reqData.reqInititateDate
            ? formatDateToYYYYMMDD(new Date(reqData.reqInititateDate))
            : null,
          reqAcceptedDate: reqData.reqAcceptedDate
            ? formatDateToYYYYMMDD(new Date(reqData.reqAcceptedDate))
            : null,
          isCarryOver: reqData.isCarryOver || "N",
          assignedToDate: reqData.assignedToDate
            ? formatDateToYYYYMMDD(new Date(reqData.assignedToDate))
            : null,
          assignedFromId: reqData.assignedFromId,
          assignedFromName: reqData.assignedFromName,
          userPicId: reqData.userPicId,
          userPicIdentityNumber: reqData.userPicIdentityNumber,
          userPicName: reqData.userPicName,
          userPicContanct: reqData.userPicContanct,
          userPicEmail: reqData.userPicEmail,
          userPicDirectorateId: reqData.userPicDirectorateId,
          userPicDivisionId: reqData.userPicDivisionId,
          userPicGroupId: reqData.userPicGroupId,
          appInitialCode: reqData.appInitialCode,
          appInitialName: reqData.appInitialName,
          appTargetUsers: reqData.appTargetUsers || "INTERNAL",
          appAccessFrontsiteDns: reqData.appAccessFrontsiteDns,
          appAccessFrontsiteIp: reqData.appAccessFrontsiteIp,
          appAccessBacksiteDns: reqData.appAccessBacksiteDns,
          appAccessBacksiteIp: reqData.appAccessBacksiteIp,
          backlogChange: reqData.backlogChange,
          appAccessMedia: reqData.appAccessMedia,
          appTypes: reqData.appTypes,
          appTypeCustom: reqData.appTypeCustom,
          appRelatedness: reqData.appRelatedness,
          appRelatednessDesc: reqData.appRelatednessDesc,
          appTransactionals: reqData.appTransactionals,
          appOperational24hrs: reqData.appOperational24hrs,
          appOperationalDays: reqData.appOperationalDays,
          appOperationalHourOpen: reqData.appOperationalHourOpen,
          appOperationalHourClosed: reqData.appOperationalHourClosed,
          appLiveTargetDate: reqData.appLiveTargetDate
            ? formatDateToYYYYMMDD(new Date(reqData.appLiveTargetDate))
            : null,
          appEnvLocations: reqData.appEnvLocations,
          appEnvLocationsOthers: reqData.appEnvLocationsOthers,
          appPrivateAuth: reqData.appPrivateAuth || "Y",
          appHightAvailability: reqData.appHightAvailability || "Y",
          appIntegrationOthersApps: reqData.appIntegrationOthersApps,
          note: reqData.note,
        });

        // Load PIC Assign Users if available
        if (reqData.approvalDatas && reqData.approvalDatas.length > 0) {
          const picUsers = reqData.approvalDatas.map(
            (pic) =>
            ({
              id: pic.id,
              userId: pic.approverUserCode,
              nama: pic.approverUserFirstName,
              email: pic.approverUserEmail,
              phoneNumber: pic.approverUserPhoneNumber || "",
              // Minimal required fields for UsersResponse
              nrp: "",
              nip: "",
              teamId: "",
              teamCode: "",
              teamName: "",
              userStatus: "ACTIVE",
              createdAt: new Date().toISOString(),
              createdBy: "",
              team: null,
              teamRole: null,
            } as UsersResponse)
          );
          setChoosedMemberProjects(picUsers);
        }

        // Load User PIC if available
        if (reqData.userPicId && reqData.userPicIdentityNumber) {
          const picUser = await GetDataUser(reqData.userPicId, 1);
          if (picUser.length > 0) {
            setDataUsersPIC(picUser);
            console.log(
              "Loaded PIC user:",
              picUser,
              "userPicId:",
              reqData.userPicId
            );
            setPICUser(reqData.userPicId);
          } else {
            console.log("PIC user not found for userPicId:", reqData.userPicId);
          }
        }
        // Load Sender Directorate if available
        if (reqData.senderDirectorateId) {
          const directorateData = await GetDataMasterOrg("", 1, [
            { field: "id", operator: "=", value: reqData.senderDirectorateId },
          ]);
          if (directorateData.length > 0) {
            setSelectedDirectorateIT({
              label: `${directorateData[0].orgName}`,
              value: directorateData[0].id,
            });
          }
        }

        // Load Sender Division if available
        if (reqData.senderDivisionId) {
          const divisionData = await GetDataMasterOrg("", 1, [
            { field: "id", operator: "=", value: reqData.senderDivisionId },
          ]);
          if (divisionData.length > 0) {
            setSelectedDivisionSender({
              label: `${divisionData[0].orgName}`,
              value: divisionData[0].id,
            });
          }
        }
        // Load Assigned From User if available
        if (reqData.assignedFromId) {
          const assignedFromUserData = await GetDataUser(
            reqData.assignedFromId,
            1
          );
          if (assignedFromUserData.length > 0) {
            setDataUsersAssignedFrom(assignedFromUserData);
            setAssignedFromUser(reqData.assignedFromId);
          }
        }

        // Load PIC Division if available
        if (reqData.userPicDivisionId) {
          const divisionData = await GetDataMasterOrg("", 1, [
            { field: "id", operator: "=", value: reqData.userPicDivisionId },
          ]);
          if (divisionData.length > 0) {
            setSelectedDivisionPIC({
              label: `${divisionData[0].orgName}`,
              value: divisionData[0].id,
            });
          }
        }

        // Load PIC Group if available
        if (reqData.userPicGroupId) {
          const groupData = await GetDataMasterOrg("", 1, [
            { field: "id", operator: "=", value: reqData.userPicGroupId },
          ]);
          if (groupData.length > 0) {
            setSelectedGroupOrgPIC({
              label: `${groupData[0].orgName}`,
              value: groupData[0].id,
            });
          }
        }

        // Load Requirement Manage By fields if available
        if (reqData.reqManageByDirectorateId) {
          formik.setFieldValue(
            "reqManageByDirectorateId",
            reqData.reqManageByDirectorateId
          );
        }
        if (reqData.reqManageByDivisionId) {
          formik.setFieldValue(
            "reqManageByDivisionId",
            reqData.reqManageByDivisionId
          );
        }
        if (reqData.reqManageByGroupId) {
          formik.setFieldValue(
            "reqManageByGroupId",
            reqData.reqManageByGroupId
          );
        }

        // Load Work Programs if available
        if (reqData.workPrograms && reqData.workPrograms.length > 0) {
          formik.setFieldValue("workPrograms", reqData.workPrograms);

          // Check if there are INTERNAL or EXTERNAL work programs
          const hasInternal = reqData.workPrograms.some(
            (wp) => wp.workProgramSource === "INTERNAL"
          );
          const hasExternal = reqData.workPrograms.some(
            (wp) => wp.workProgramSource === "EXTERNAL"
          );

          if (hasInternal) setWorkProgramInt("1");
          if (hasExternal) setWorkProgramExt("1");

          // Load division selections for each work program
          const internalWPs: OptionDivisionDynamic[] = [];
          const externalWPs: OptionDivisionDynamic[] = [];
          let internalIndex = 0;
          let externalIndex = 0;

          for (const wp of reqData.workPrograms) {
            const divisionData = await GetDataMasterOrg("", 1, [
              { field: "id", operator: "=", value: wp.divisionId },
            ]);

            if (wp.workProgramSource === "INTERNAL") {
              internalWPs.push({
                indexData: internalIndex,
                OptionData:
                  divisionData.length > 0
                    ? {
                      label: `${divisionData[0].orgName}`,
                      value: divisionData[0].id,
                    }
                    : { label: "", value: "" },
              });
              internalIndex++;
            } else {
              externalWPs.push({
                indexData: externalIndex,
                OptionData:
                  divisionData.length > 0
                    ? {
                      label: `${divisionData[0].orgName}`,
                      value: divisionData[0].id,
                    }
                    : { label: "", value: "" },
              });
              externalIndex++;
            }
          }

          setSelectedDivisionWPInternal(internalWPs);
          setSelectedDivisionWPExternal(externalWPs);
        }

        // Load selected app if appInitialCode exists
        if (reqData.appInitialCode) {
          const appPayload: PaggingListPayload = {
            search: "",
            limit: 1,
            page: 0,
            filterWhere: [
              {
                field: "appShortName",
                operator: "=",
                value: reqData.appInitialCode,
              },
            ],
            fieldOrder: ["createdAt"],
            orderDir: "desc",
          };
          const appResponse = await ListApps(appPayload, tokenData);
          if (
            appResponse?.statusCode === RES_CODE_OK &&
            appResponse.data &&
            appResponse.data.length > 0
          ) {
            const appData = appResponse.data[0];
            setSelectedApp(appData);
            // Note: ApplicationExistingChoosed is set in Section4 component scope, not here
          }
        }

        // Load Backlog Features if available
        const backlogPayload: PaggingListPayload = {
          search: "",
          limit: MAX_SIZE_TABLE,
          page: 0,
          filterWhere: [{ field: "reqId", operator: "=", value: reqId }],
          fieldOrder: ["createdAt"],
          orderDir: "asc",
        };
        const backlogResponse = await ListBacklog(backlogPayload, tokenData);
        if (
          backlogResponse?.statusCode === RES_CODE_OK &&
          backlogResponse.data
        ) {
          const backlogs = backlogResponse.data.map(
            (b: BacklogDataResponse, index: number) => ({
              backlogId: b.id,
              parentBacklogId: b.reffId,
              backlogName: b.backlogName,
              backlogDesc: b.backlogDesc,
              note: b.note,
              posOrder: b.posOrder || index + 1,
              reffData: b.reffData, // Preserve reffData for RFC
            })
          );
          console.log("Loaded backlogs:", backlogs);
          setDataBackLogs(backlogs);
        }

        // Load uploaded files
        await loadUploadedFiles(reqId);

        console.log("Requirement data loaded successfully");
      }
    } catch (error) {
      console.error("Error loading requirement data:", error);
      showToast({
        description: "Failed to load requirement data",
        statusToast: "error",
      });
    }
  };

  const uploadFilesForDraft = async (reqId: string) => {
    console.log("uploadFilesForDraft called with reqId:", reqId);
    console.log("files array length:", files.length);
    console.log("files array:", files);

    if (files.length > 0) {
      for (const file of files) {
        console.log(
          "Processing file:",
          file.name,
          "size:",
          file.size,
          "type:",
          file.type
        );
        // Only upload if it's a valid File object with size
        if (file instanceof File && file.size > 0) {
          try {
            console.log("Uploading file:", file.name);
            const DataUploads: InsertMediaObjectByKeyPayload = {
              KeyData: MEDIA_KEY_REQUIREMENT,
              KeyId: reqId,
              file: file,
            };
            const uploadResult = await AddMediaObjServ(DataUploads);
            if (!uploadResult) {
              console.error("Failed to upload file:", file.name);
              // Error toast already shown in AddMediaObjServ
            } else {
              console.log("Successfully uploaded file:", file.name);
            }
          } catch (error) {
            console.error("Error uploading file:", file.name, error);
          }
        } else {
          console.warn("Skipping invalid file:", file);
        }
      }
      setFiles([]);
      console.log("Loading uploaded files...");
      await loadUploadedFiles(reqId);
    } else {
      console.log("No files to upload");
    }
  };

  const CreateDraftRequirement = async (data: RequirementsInsertPayload) => {
    const { backlogFeatures, ...dataWithoutBacklog } = data;
    const payload = {
      ...data,
      isDraft: true,
      ...(data.requirementType === "RFC"
        ? {}
        : {
          backlogFeatures: DataBackLogs.map((b) => ({
            ParentBacklogId: b.parentBacklogId,
            BacklogName: b.backlogName,
            BacklogDesc: b.backlogDesc,
            Note: b.note,
            PosOrder: b.posOrder,
            parentBacklogId: b.parentBacklogId,
            backlogName: b.backlogName,
            backlogDesc: b.backlogDesc,
            note: b.note,
            posOrder: b.posOrder,
          })),
        }),
      picAssignUsers: ChoosedMemberProjects.map((m) => ({
        UserId: m.userId,
        userId: m.userId,
      })),
      PICAssignUsers: ChoosedMemberProjects.map((m) => ({
        UserId: m.userId,
      })),
      workPrograms: data.workPrograms.map((w: any) => ({
        DirectorateId: w.directorateId,
        DivisionId: w.divisionId,
        GroupId: w.groupId,
        WorkProgramSource: w.workProgramSource,
        WorkProgramCode: w.workProgramCode,
        WorkProgramName: w.workProgramName,
        WorkProgramAccName: w.workProgramAccName,
        WorkProgramAccNumber: w.workProgramAccNumber,
        WorkProgramAccCc: w.workProgramAccCc,
        WorkProgramBudget: w.workProgramBudget,
        WorkProgramReal: w.workProgramReal,
        // Keep lowercase for type compatibility
        directorateId: w.directorateId,
        divisionId: w.divisionId,
        groupId: w.groupId,
        workProgramSource: w.workProgramSource,
        workProgramCode: w.workProgramCode,
        workProgramName: w.workProgramName,
        workProgramAccName: w.workProgramAccName,
        workProgramAccNumber: w.workProgramAccNumber,
        workProgramAccCc: w.workProgramAccCc,
        workProgramBudget: w.workProgramBudget,
        workProgramReal: w.workProgramReal,
      })),
    };

    const requestData = await RegisterDraft(payload, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    const newRequirementId = requestData.data as string;
    setRequirementId(newRequirementId);
    setIsEditMode(true);

    // Update URL with requirementId
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("id", newRequirementId);
    router.push(currentUrl.pathname + currentUrl.search, { scroll: false });

    // Small delay to ensure requirement is saved in database
    await delay(500);

    await uploadFilesForDraft(newRequirementId);

    showToast({
      description: "Draft saved successfully",
      statusToast: "success",
    });
    setActionLoading(false);
  };

  const UpdateDraftRequirement = async (data: RequirementsInsertPayload) => {
    console.log(
      "UpdateDraftRequirement - ChoosedMemberProjects:",
      ChoosedMemberProjects
    );
    console.log("UpdateDraftRequirement - DataBackLogs:", DataBackLogs);

    const picAssignUsersPayload = ChoosedMemberProjects.map((m) => ({
      Id: m.id || null,
      UserId: m.userId,
    }));
    console.log(
      "UpdateDraftRequirement - PICAssignUsers payload:",
      picAssignUsersPayload
    );
    console.log(
      "UpdateDraftRequirement - RFC check:",
      data.requirementType,
      data.backlogFeatures?.length
    );

    const { backlogFeatures, ...dataWithoutBacklog } = data;
    const payload = {
      requirementId: requirementId!,
      isSubmitSave: false,
      ...data,
      ...(data.requirementType === "RFC"
        ? {}
        : {
          backlogFeatures: DataBackLogs.map((b) => ({
            Id: b.backlogId || null,
            ParentBacklogId: b.parentBacklogId,
            BacklogName: b.backlogName,
            BacklogDesc: b.backlogDesc,
            Note: b.note,
            PosOrder: b.posOrder,
            backlogId: b.backlogId || null,
            parentBacklogId: b.parentBacklogId,
            backlogName: b.backlogName,
            backlogDesc: b.backlogDesc,
            note: b.note,
            posOrder: b.posOrder,
          })),
        }),
      picAssignUsers: ChoosedMemberProjects.map((m) => ({
        Id: m.id || null,
        UserId: m.userId,
        userId: m.userId, // For type compatibility
      })),
      PICAssignUsers: ChoosedMemberProjects.map((m) => ({
        Id: m.id || null,
        UserId: m.userId,
      })),
      workPrograms: data.workPrograms.map((w: any) => ({
        Id: w.id || null,
        DirectorateId: w.directorateId,
        DivisionId: w.divisionId,
        GroupId: w.groupId,
        WorkProgramSource: w.workProgramSource,
        WorkProgramCode: w.workProgramCode,
        WorkProgramName: w.workProgramName,
        WorkProgramAccName: w.workProgramAccName,
        WorkProgramAccNumber: w.workProgramAccNumber,
        WorkProgramAccCc: w.workProgramAccCc,
        WorkProgramBudget: w.workProgramBudget,
        WorkProgramReal: w.workProgramReal,
        directorateId: w.directorateId,
        divisionId: w.divisionId,
        groupId: w.groupId,
        workProgramSource: w.workProgramSource,
        workProgramCode: w.workProgramCode,
        workProgramName: w.workProgramName,
        workProgramAccName: w.workProgramAccName,
        workProgramAccNumber: w.workProgramAccNumber,
        workProgramAccCc: w.workProgramAccCc,
        workProgramBudget: w.workProgramBudget,
        workProgramReal: w.workProgramReal,
      })),
    };

    console.log(
      "UpdateDraftRequirement - Payload backlogFeatures:",
      payload.backlogFeatures
    );

    console.log(
      "UpdateDraftRequirement - Full payload:",
      JSON.stringify(payload, null, 2)
    );
    const requestData = await RegisterUpdate(payload, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    // Small delay to ensure requirement is updated in database
    await delay(500);

    // Reload backlogs to get backend-generated IDs for new items
    const backlogPayload: PaggingListPayload = {
      search: "",
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere: [{ field: "reqId", operator: "=", value: requirementId! }],
      fieldOrder: ["createdAt"],
      orderDir: "asc",
    };
    const backlogResponse = await ListBacklog(backlogPayload, tokenData);
    if (backlogResponse?.statusCode === RES_CODE_OK && backlogResponse.data) {
      const backlogs = backlogResponse.data.map(
        (b: BacklogDataResponse, index: number) => ({
          localId: b.id,
          backlogId: b.id,
          parentBacklogId: null,
          backlogName: b.backlogName,
          backlogDesc: b.backlogDesc,
          note: null,
          posOrder: index + 1,
        })
      );
      setDataBackLogs(backlogs);
    }

    await uploadFilesForDraft(requirementId!);

    showToast({
      description: "Draft updated successfully",
      statusToast: "success",
    });
    setActionLoading(false);
  };

  const SubmitDraftRequirement = async (data: RequirementsInsertPayload) => {
    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles <= 0 && data.isHaveMemo !== "N") {
      showToast({
        description: `Upload files must be uploaded, at least one.`,
        statusToast: "warning",
      });
      setActionLoading(false);
      return;
    }

    const payload = {
      requirementId: requirementId!,
      isSubmitSave: true,
      ...data,
      backlogFeatures:
        data.requirementType === "RFC" &&
          data.backlogFeatures &&
          data.backlogFeatures.length > 0
          ? data.backlogFeatures.map((b: any) => ({
            Id: b.id || null,
            ParentBacklogId: b.parentBacklogId,
            BacklogName: b.backlogName,
            BacklogDesc: b.backlogDesc,
            Note: b.note,
            PosOrder: b.posOrder,
            parentBacklogId: b.parentBacklogId,
            backlogName: b.backlogName,
            backlogDesc: b.backlogDesc,
            note: b.note,
            posOrder: b.posOrder,
          }))
          : DataBackLogs.map((b) => ({
            Id: b.backlogId || null,
            ParentBacklogId: b.parentBacklogId,
            BacklogName: b.backlogName,
            BacklogDesc: b.backlogDesc,
            Note: b.note,
            PosOrder: b.posOrder,
            backlogId: b.backlogId || null,
            parentBacklogId: b.parentBacklogId,
            backlogName: b.backlogName,
            backlogDesc: b.backlogDesc,
            note: b.note,
            posOrder: b.posOrder,
          })),
      picAssignUsers: ChoosedMemberProjects.map((m) => ({
        Id: m.id || null,
        UserId: m.userId,
        userId: m.userId, // For type compatibility
      })),
      PICAssignUsers: ChoosedMemberProjects.map((m) => ({
        Id: m.id || null,
        UserId: m.userId,
      })),
      workPrograms: data.workPrograms.map((w: any) => ({
        Id: w.id || null,
        DirectorateId: w.directorateId,
        DivisionId: w.divisionId,
        GroupId: w.groupId,
        WorkProgramSource: w.workProgramSource,
        WorkProgramCode: w.workProgramCode,
        WorkProgramName: w.workProgramName,
        WorkProgramAccName: w.workProgramAccName,
        WorkProgramAccNumber: w.workProgramAccNumber,
        WorkProgramAccCc: w.workProgramAccCc,
        WorkProgramBudget: w.workProgramBudget,
        WorkProgramReal: w.workProgramReal,
        directorateId: w.directorateId,
        divisionId: w.divisionId,
        groupId: w.groupId,
        workProgramSource: w.workProgramSource,
        workProgramCode: w.workProgramCode,
        workProgramName: w.workProgramName,
        workProgramAccName: w.workProgramAccName,
        workProgramAccNumber: w.workProgramAccNumber,
        workProgramAccCc: w.workProgramAccCc,
        workProgramBudget: w.workProgramBudget,
        workProgramReal: w.workProgramReal,
      })),
    };

    const requestData = await RegisterUpdate(payload, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    await uploadFilesForDraft(requirementId!);

    showToast({
      description: "Requirement submitted successfully",
      statusToast: "success",
    });

    setActionLoading(false);
    RefreshAction();
    redirect(`/requirements/brd-rfc`);
  };

  const formik = useFormik<RequirementsInsertPayload>({
    initialValues: initialValues,
    validationSchema: FormSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      logMissingRequiredFields(values, FormSchema);
      if (ChoosedMemberProjects.length <= 0) {
        showToast({
          description: "Personel yang ditugaskan tidak boleh kosong",
          statusToast: "warning",
        });
        return;
      }
      if (
        (type_req_param === "BRD" && DataBackLogs.length <= 0) ||
        (type_req_param === "RFC" &&
          (!values.backlogFeatures || values.backlogFeatures.length <= 0))
      ) {
        showToast({
          description:
            type_req_param === "BRD"
              ? "Scope of Work BRD tidak boleh kosong"
              : "Perubahan Sistem tidak boleh kosong",
          statusToast: "warning",
        });
        return;
      }
      // if (files.length <= 0) {
      //   showToast({
      //     description: "File upload attachments, cannot be empty.",
      //     statusToast: "warning",
      //   });
      //   return;
      // }
      await handleConfirmSaveData(values);
    },
  });

  useEffect(() => {
    if (perihalSementaraRef.current && perihalCursorPosRef.current !== null) {
      perihalSementaraRef.current.setSelectionRange(
        perihalCursorPosRef.current,
        perihalCursorPosRef.current
      );
    }
  }, [formik.values.reqNarative]);
  useEffect(() => {
    if (namaLengkapRef.current && namaLengkapCursorPosRef.current !== null) {
      namaLengkapRef.current.setSelectionRange(
        namaLengkapCursorPosRef.current,
        namaLengkapCursorPosRef.current
      );
    }
  }, [formik.values.userPicName]);
  // BACKLOG DATA
  // Auto-fill Division and Group from assignedFrom user (after formik is defined)
  useEffect(() => {
    const loadUserOrgData = async () => {
      if (DataAuth && !requirementId && formik.values.assignedFromId && !formik.values.reqManageByDivisionId) {
        // Fetch full user data to get organization info
        const userData = await GetDataUser(DataAuth.userId, 1);
        if (userData.length > 0 && userData[0].team?.organization) {
          const divisionId = userData[0].team.organization.division?.id;
          const directorateId = userData[0].team.organization.directorate?.id;
          const groupId = userData[0].team.organization.group?.id;

          if (divisionId) {
            formik.setFieldValue("reqManageByDivisionId", divisionId);
          }
          if (directorateId) {
            formik.setFieldValue("reqManageByDirectorateId", directorateId);
          }
          if (groupId) {
            formik.setFieldValue("reqManageByGroupId", groupId);
          }
        }
      }
    };

    loadUserOrgData();
  }, [DataAuth, requirementId, formik.values.assignedFromId]);
  const [DataBackLogs, setDataBackLogs] = useState<ReqBacklogPayload[]>([]);

  const logMissingRequiredFields = (
    values: Record<string, any>,
    schema: yup.ObjectSchema<any>
  ) => {
    const schemaDesc = schema.describe();

    const missingFields: string[] = [];

    for (const [key, desc] of Object.entries(schemaDesc.fields)) {
      // Cast to any to access non-typed "tests" array safely
      const field = desc as any;

      const isRequired = field?.tests?.some((t: any) => t.name === "required");

      if (isRequired && !values[key]) {
        missingFields.push(key);
      }
    }

    if (missingFields.length > 0) {
      console.warn("Missing required fields:", missingFields.join(", "));
    }
  };

  const [openConfirmSaveDialog, setOpenConfirmSaveDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [SaveAsDraft, setSaveAsDraft] = useState<boolean>(false);

  const handleConfirmSaveData = (data: RequirementsInsertPayload) => {
    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles === 0 && data.isHaveMemo !== "N") {
      showToast({
        description: "File upload attachments, cannot be empty.",
        statusToast: "warning",
      });
      return;
    }

    setCaptionDialog("Konfirmasi Submit");
    setQuestionMsgDialog(
      `Apakah ada yakin akan submit data "${formik.values.isHaveMemo == "Y"
        ? formik.values.reqNumber
        : type_req_param + " Tanpa Memo"
      }"?`
    );
    setOpenConfirmSaveDialog(true);
  };

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team) {
      if (requirementId) {
        await SubmitDraftRequirement(formik.values);
      } else {
        await AddRequirement(formik.values);
      }
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
    }
  };

  const handleRequestApproval = async () => {
    if (!requirementId) {
      showToast({
        description: "Requirement ID not found",
        statusToast: "error",
      });
      return;
    }

    // Validate form data
    if (ChoosedMemberProjects.length <= 0) {
      showToast({
        description: "Personel yang ditugaskan tidak boleh kosong",
        statusToast: "warning",
      });
      return;
    }

    if (
      (type_req_param === "BRD" && DataBackLogs.length <= 0) ||
      (type_req_param === "RFC" &&
        (!formik.values.backlogFeatures || formik.values.backlogFeatures.length <= 0))
    ) {
      showToast({
        description:
          type_req_param === "BRD"
            ? "Scope of Work BRD tidak boleh kosong"
            : "Perubahan Sistem tidak boleh kosong",
        statusToast: "warning",
      });
      return;
    }

    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles <= 0 && formik.values.isHaveMemo !== "N") {
      showToast({
        description: `Upload files must be uploaded, at least one.`,
        statusToast: "warning",
      });
      return;
    }

    setActionLoading(true);
    await delay(DELAY_MEDIUM);

    // First, update the requirement data
    const payload = {
      requirementId: requirementId,
      isSubmitSave: true,
      ...formik.values,
      backlogFeatures:
        formik.values.requirementType === "RFC" &&
          formik.values.backlogFeatures &&
          formik.values.backlogFeatures.length > 0
          ? formik.values.backlogFeatures.map((b: any) => ({
            Id: b.id || null,
            ParentBacklogId: b.parentBacklogId,
            BacklogName: b.backlogName,
            BacklogDesc: b.backlogDesc,
            Note: b.note,
            PosOrder: b.posOrder,
            parentBacklogId: b.parentBacklogId,
            backlogName: b.backlogName,
            backlogDesc: b.backlogDesc,
            note: b.note,
            posOrder: b.posOrder,
          }))
          : DataBackLogs.map((b) => ({
            Id: b.backlogId || null,
            ParentBacklogId: b.parentBacklogId,
            BacklogName: b.backlogName,
            BacklogDesc: b.backlogDesc,
            Note: b.note,
            PosOrder: b.posOrder,
            backlogId: b.backlogId || null,
            parentBacklogId: b.parentBacklogId,
            backlogName: b.backlogName,
            backlogDesc: b.backlogDesc,
            note: b.note,
            posOrder: b.posOrder,
          })),
      picAssignUsers: ChoosedMemberProjects.map((m) => ({
        Id: m.id || null,
        UserId: m.userId,
        userId: m.userId,
      })),
      PICAssignUsers: ChoosedMemberProjects.map((m) => ({
        Id: m.id || null,
        UserId: m.userId,
      })),
      workPrograms: formik.values.workPrograms.map((w: any) => ({
        Id: w.id || null,
        DirectorateId: w.directorateId,
        DivisionId: w.divisionId,
        GroupId: w.groupId,
        WorkProgramSource: w.workProgramSource,
        WorkProgramCode: w.workProgramCode,
        WorkProgramName: w.workProgramName,
        WorkProgramAccName: w.workProgramAccName,
        WorkProgramAccNumber: w.workProgramAccNumber,
        WorkProgramAccCc: w.workProgramAccCc,
        WorkProgramBudget: w.workProgramBudget,
        WorkProgramReal: w.workProgramReal,
        directorateId: w.directorateId,
        divisionId: w.divisionId,
        groupId: w.groupId,
        workProgramSource: w.workProgramSource,
        workProgramCode: w.workProgramCode,
        workProgramName: w.workProgramName,
        workProgramAccName: w.workProgramAccName,
        workProgramAccNumber: w.workProgramAccNumber,
        workProgramAccCc: w.workProgramAccCc,
        workProgramBudget: w.workProgramBudget,
        workProgramReal: w.workProgramReal,
      })),
    };

    const updateResult = await RegisterUpdate(payload, tokenData);
    
    if (updateResult?.statusCode !== RES_CODE_OK) {
      showToast({
        description: updateResult?.message || "Failed to update requirement",
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    }

    // Upload files if any
    await uploadFilesForDraft(requirementId);

    // Then, request approval
    const approvalResult = await RequestApproval(requirementId, tokenData);
    
    if (approvalResult?.statusCode === RES_CODE_OK) {
      showToast({
        description: "Requirement updated and approval request submitted successfully",
        statusToast: "success",
      });
      router.push("/requirements/brd-rfc");
    } else {
      showToast({
        description: approvalResult?.message || "Failed to submit approval request",
        statusToast: "error",
      });
    }
    
    setActionLoading(false);
  };

  const handleSaveDraft = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);

    if (DataAuth && DataAuth.team) {
      if (requirementId) {
        await UpdateDraftRequirement(formik.values);
      } else {
        await CreateDraftRequirement(formik.values);
      }
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
    }
  };

  const handleDialogSaveTrigger = () => {
    setOpenConfirmSaveDialog(!openConfirmSaveDialog);
  };

  useEffect(() => {
    handleSearchUser("", "clear");
    setActiveStep(0);
    ResetDivisionState();
    if (DataAuth && DataAuth.team) {
      formik.resetForm({ values: formik.initialValues });
    }
    LoadDataDirectorate(); // >>> LOAD DATA DIRECTORATE
    const HeaderDataContentDC: HeaderContentProps = {
      titleName: `Registrasi ${REQUIREMENT_TYPE_BRD}`,
      breadCrumb: ["Home", "Requirements", REQUIREMENT_TYPE_BRD, "Registrasi"],
    };
  }, [RefreshData]);

  const GetDataUser = async (
    searchValue: string,
    limit: number = 1
  ): Promise<UsersResponse[]> => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [],
      fieldOrder: ["nama"],
      orderDir: "asc",
    };
    const requestData = await ListUsers(PayloadList, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return [];
      }

      const itemsData: UsersResponse[] = requestData.data as UsersResponse[];
      return itemsData;
    }
  };

  const ResetDivisionState = () => {
    setDataDivisions([]);
    setDivisionSelected([]);
    setDivisionSearchText("");
  };

  const [DataDivisions, setDataDivisions] = useState<OrganizationResponse[]>(
    []
  );
  const [OrganizationData, setOrganizationData] = useState<
    OrganizationResponse[]
  >([]);
  const [DivisionSelected, setDivisionSelected] = useState<
    OrganizationResponse[]
  >([]);
  const [DivisionSearchText, setDivisionSearchText] = useState<string>("");
  // Append function
  const handleAddDivision = (division: OrganizationResponse) => {
    // Prevent duplicates (optional)
    const exists = DivisionSelected.find((d) => d.id === division.id);
    if (!exists) {
      const newList = [...DivisionSelected, division];
      setDivisionSelected(newList);
      setDivisionSearchText("");
      // Update formik
      formik.setFieldValue(
        "involvedDivisionIds",
        newList.map((d) => d.id)
      );
    } else {
      showToast({
        description: "Division already exist on list involved",
        statusToast: "warning",
      });
    }
  };

  const [DataUsersAssignedFrom, setDataUsersAssignedFrom] = useState<
    UsersResponse[]
  >([]);
  const [AssignedFromUser, setAssignedFromUser] = useState<string>("");
  const handleAssignedFromUser = (user: UsersResponse | null) => {
    if (user) {
      formik.setFieldValue("assignedFromId", user.userId);
      formik.setFieldValue("assignedFromName", user.nama);
      handleSearchUser(user.userId, "searchAssignedFromUser");
      console.log("Selected User Object:", user);
    } else {
      formik.setFieldValue("assignedFromId", null);
      formik.setFieldValue("assignedFromName", null);
      handleSearchUser("", "searchAssignedFromUser");
    }
  };

  const [DataUsersPIC, setDataUsersPIC] = useState<UsersResponse[]>([]);
  const [PICUser, setPICUser] = useState<string>("");
  const handlePICUser = (user: UsersResponse | null) => {
    if (user) {
      formik.setFieldValue("userPicId", user.userId);
      formik.setFieldValue("userPicName", user.nama);
      // formik.setFieldValue("userPicIdentityNumber", user.nip);
      // formik.setFieldValue("userPicEmail", user.email);
      //userPicIdentityNumber
      handleSearchUser(user.userId, "searchPICUser");
    } else {
      formik.setFieldValue("userPicId", null);
      formik.setFieldValue("userPicName", null);
      // formik.setFieldValue("userPicIdentityNumber", null);
      // formik.setFieldValue("userPicEmail", null);
      handleSearchUser("", "searchPICUser");
    }
  };

  const handleCleanDataUser = () => {
    setDataUsersAssignedFrom([]);
    setAssignedFromUser("");

    setDataUsersPIC([]);
    setPICUser("");
  };

  const handleSearchUser = async (
    textSearch: string,
    key:
      | "searchAssignedFromUser"
      | "searchAssignedToUser"
      | "searchPICUser"
      | "clear"
  ) => {
    if (key == "clear") {
      handleCleanDataUser();
      return;
    }

    const DataUserLoad = await GetDataUser(textSearch);
    if (key == "searchAssignedFromUser") {
      setAssignedFromUser(textSearch);
      if (textSearch.length >= 2) {
        setDataUsersAssignedFrom(DataUserLoad);
      } else if (textSearch.length <= 0) {
        setDataUsersAssignedFrom([]);
      }
    }
    if (key == "searchPICUser") {
      setPICUser(textSearch);
      if (textSearch.length >= 2) {
        setDataUsersPIC(DataUserLoad);
      } else if (textSearch.length <= 0) {
        setDataUsersPIC([]);
      }
    }
  };

  // Assign To Multiple
  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [ChoosedMemberProjects, setChoosedMemberProjects] = useState<
    UsersResponse[]
  >([]);

  useEffect(() => {
    const mappedPayload: PICAssignUserPayload[] = ChoosedMemberProjects.map(
      (user) => ({
        userId: user.userId,
      })
    );

    formik.setFieldValue("picAssignUsers", mappedPayload);
  }, [ChoosedMemberProjects]);

  const handleSearchUserAssign = async (textSearch: string) => {
    setDataUsers([]);
    setSearchUserInput(textSearch);
    if (textSearch.length >= 3) {
      const ListUserData: UsersResponse[] = await GetDataUser(textSearch, 3);
      setDataUsers(ListUserData);
    } else if (textSearch.length <= 0) {
      setDataUsers([]);
    }
  };

  const handleAddUserAssign = (data: UsersResponse) => {
    setChoosedMemberProjects([...ChoosedMemberProjects, data]); // Add new item to the state
    setDataUsers([]);
    setSearchUserInput("");
  };
  const handleRemoveUserAssign = (id: string) => {
    const updatedProjects = ChoosedMemberProjects.filter(
      (project) => project.id !== id
    );
    setChoosedMemberProjects(updatedProjects);
    setDataUsers([]);
    setSearchUserInput("");
  };
  const handleResetUsersAssign = () => {
    setDataUsers([]);
    setSearchUserInput("");
    // setChoosedMemberProjects(MemberProjects);
  };

  // END Assign To Multiple

  // Division Select

  // Option Data Setup

  const GetDataMasterOrg = async (
    searchValue: string = "",
    limit: number = 1,
    whereData: ListSearchByParam[]
  ): Promise<OrganizationResponse[]> => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: whereData,
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
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return [];
      }

      const itemsData: OrganizationResponse[] =
        requestData.data as OrganizationResponse[];

      // Template Mapping
      // const mapOptionData: OptionListProps[] = itemsData.map((d) => ({
      //   label: `${d.orgName}`,
      //   value: d.id,
      // }));

      return itemsData;
    }
  };

  // Load all organization data once
  const LoadAllOrganizationData = async () => {
    if (OrganizationData.length <= 0 && tokenData) {
      const PayloadList: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      };
      const token: string = localStorage.getItem("tokenData") as string;
      const requestData = await ListOrganization(PayloadList, token);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setOrganizationData(requestData.data as OrganizationResponse[]);
      }
    }
  };

  useEffect(() => {
    if (tokenData) {
      LoadAllOrganizationData();
    }
  }, [tokenData]);

  // directorate

  const [SelectedDirectorateIT, setSelectedDirectorateIT] =
    useState<OptionListProps>(SELECTED_OPTION_DIRECTORATE);
  const [IsLoadingDirectorateSelect, setIsLoadingDirectorateSelect] =
    useState(false);
  const [OptionDirectorate, setOptionDirectorate] = useState<OptionListProps[]>(
    []
  );

  const LoadDataDirectorate = async () => {
    if (OptionDirectorate.length <= 0) {
      setIsLoadingDirectorateSelect(true);
      const whereParam: ListSearchByParam[] = [
        {
          field: "orgType",
          operator: "=",
          value: ORG_CATEGORY_KEY_DIRECTORATE,
        },
      ];

      const dataDivision = await GetDataMasterOrg(
        "",
        MAX_SIZE_TABLE,
        whereParam
      );

      const mapOptionData: OptionListProps[] = dataDivision.map((d) => ({
        label: `${d.orgName}`,
        value: d.id,
      }));

      setOptionDirectorate(mapOptionData);
      setIsLoadingDirectorateSelect(false);
    }
  };

  const handleSelectedCustom = (data: OptionListProps, fieldData: string) => {
    formik.setFieldValue(fieldData, data.value);
  };

  const handleUnSelectedCustom = (fieldData: string) => {
    formik.setFieldValue(fieldData, null);
  };

  // division
  const [SelectedDivisionSender, setSelectedDivisionSender] =
    useState<OptionListProps | null>(null);

  const [SelectedDivisionPIC, setSelectedDivisionPIC] =
    useState<OptionListProps | null>(null);

  const [SelectedDivisionWPInternal, setSelectedDivisionWPInternal] = useState<
    OptionDivisionDynamic[]
  >([]);

  const [SelectedDivisionWPExternal, setSelectedDivisionWPExternal] = useState<
    OptionDivisionDynamic[]
  >([]);

  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [SelectedDivision, setSelectedDivision] =
    useState<OptionListProps | null>(null);

  const LoadDataDivisionCustom = async (directorateId: string) => {
    if (directorateId.length > 0) {
      setIsLoadingDivisionSelect(true);
      // let whereParam: ListSearchByParam[] = [];
      const whereParam: ListSearchByParam[] = [
        {
          field: "parentId",
          operator: "=",
          value: directorateId,
        },
        {
          field: "orgType",
          operator: "=",
          value: ORG_CATEGORY_KEY_DIVISION,
        },
      ];

      const dataDivision = await GetDataMasterOrg(
        "",
        MAX_SIZE_TABLE,
        whereParam
      );

      const mapOptionData: OptionListProps[] = dataDivision.map((d) => ({
        label: `${d.orgName}`,
        value: d.id,
      }));

      setOptionDivision(mapOptionData);
      setIsLoadingDivisionSelect(false);
    }
    // else {
    //   whereParam = [
    //     {
    //       field: "orgType",
    //       operator: "=",
    //       value: "DIVISION",
    //     },
    //   ];
    // }
  };

  // Group Org

  const [SelectedGroupOrgPIC, setSelectedGroupOrgPIC] =
    useState<OptionListProps | null>(null);

  const [SelectedGroupWPInternal, setSelectedGroupWPInternal] = useState<
    OptionDivisionDynamic[]
  >([]);

  const [SelectedGroupWPExternal, setSelectedGroupWPExternal] = useState<
    OptionDivisionDynamic[]
  >([]);

  const [IsLoadingGroupDivisionSelect, setIsLoadingGroupDivisionSelect] =
    useState(false);
  const [OptionGroupDivision, setOptionGroupDivision] = useState<
    OptionListProps[]
  >([]);

  const LoadDataGroupOrgCustom = async (divisionId: string) => {
    if (divisionId.length > 0) {
      setIsLoadingGroupDivisionSelect(true);
      // let whereParam: ListSearchByParam[] = [];
      const whereParam: ListSearchByParam[] = [
        {
          field: "parentId",
          operator: "=",
          value: divisionId,
        },
        {
          field: "orgType",
          operator: "=",
          value: ORG_CATEGORY_KEY_GROUP,
        },
      ];

      const dataDivision = await GetDataMasterOrg(
        "",
        MAX_SIZE_TABLE,
        whereParam
      );

      const mapOptionData: OptionListProps[] = dataDivision.map((d) => ({
        label: `${d.orgName}`,
        value: d.id,
      }));

      setOptionGroupDivision(mapOptionData);
      setIsLoadingGroupDivisionSelect(false);
    }
    // else {
    //   whereParam = [
    //     {
    //       field: "orgType",
    //       operator: "=",
    //       value: "DIVISION",
    //     },
    //   ];
    // }
  };

  // End Division Select

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [], // Accept all images
      "application/pdf": [], // Accept PDFs
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // XLSX
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [], // DOCX
    },
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
  });

  const handleUpload = () => {
    // Old upload logic - replaced by uploadFilesForDraft
    // const fileDetails = files.map((file) => {
    //   const [name, extension] = file.name.split(".");
    //   return { name, extension, size: file.size, file };
    // });
    // const formData = new FormData();
    // console.log("Form Data Payload:", formData);
    // console.log("Uploaded Files:", fileDetails);
  };

  useEffect(() => {
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      return () =>
        newPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    }
  }, [files]);

  const handleResetListUpload = () => {
    setFiles([]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, idx) => idx !== indexToRemove)
    );
    setPreviews((prevPreviews) =>
      prevPreviews.filter((_, idx) => idx !== indexToRemove)
    );
  };

  // Attachment Setup

  // End Attachment Setup

  const steps = [
    { title: "Step 1", description: "Memo Pengantar" },
    { title: "Step 2", description: "Informasi Umum" },
    { title: "Step 3", description: "Penugasan Personil & User" },
    { title: "Step 4", description: "Program Kerja" },
    { title: "Step 5", description: "Ringkasan Ruanglingkup" },
    { title: "Step 6", description: "Lampiran" },
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

  // WORK PROGRAM STATE
  const [WorkProgramExt, setWorkProgramExt] = useState<string>("0");
  const [WorkProgramInt, setWorkProgramInt] = useState<string>("0");

  const internalWorkPrograms = formik.values.workPrograms
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((x) => x.workProgramSource === "INTERNAL");

  const externalWorkPrograms = formik.values.workPrograms
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((x) => x.workProgramSource === "EXTERNAL");

  // Handler
  const HandleExternalChange = (val: string) => {
    setWorkProgramExt(val);
    if (val === "1") {
      AddWorkProgram("EXTERNAL");
      console.log("EXTERNAL");
    } else {
      const filtered = formik.values.workPrograms.filter(
        (x) => x.workProgramSource !== "EXTERNAL"
      );
      formik.setFieldValue("workPrograms", filtered);
    }
  };

  const HandleInternalRBBVal = (val: string) => {
    setWorkProgramInt(val);
    if (val === "1") {
      AddWorkProgram("INTERNAL");
      console.log("INTERNAL");
    } else {
      const filtered = formik.values.workPrograms.filter(
        (p) => p.workProgramSource !== "INTERNAL"
      );
      formik.setFieldValue("workPrograms", filtered);
    }
  };

  const AddWorkProgram = (SourceWP: "INTERNAL" | "EXTERNAL") => {
    // Step 1: Clone the current array
    const currentPrograms = [...formik.values.workPrograms];

    const nextIndex = currentPrograms.length;

    // Step 2: Append the new item to the clone
    const updatedPrograms = [
      ...currentPrograms,
      {
        directorateId: SourceWP === "INTERNAL" ? DIRECTORATE_ID_IT_BJB : "",
        divisionId: SourceWP === "INTERNAL" ? DIVISION_ID_IT_BJB : "",
        groupId: null,
        // divisionId: "",
        workProgramSource: SourceWP,
        workProgramCode: "",
        workProgramName: "",
        workProgramAccName: "",
        workProgramAccNumber: "",
        workProgramAccCc: "",
        workProgramBudget: 0,
        workProgramReal: 0,
      },
    ];

    if (SourceWP == "INTERNAL") {
      setSelectedDivisionWPInternal((prev) => [
        ...prev,
        {
          indexData: nextIndex,
          OptionData: SELECTED_OPTION_DIVISION,
        },
      ]);
    }

    formik.setFieldValue("workPrograms", updatedPrograms);
  };

  const RemoveWorkProgram = (index: number) => {
    const updated = [...formik.values.workPrograms];

    updated.splice(index, 1);

    setSelectedDivisionWPInternal((prev) =>
      prev.filter((item) => item.indexData !== index)
    );
    setSelectedGroupWPInternal((prev) =>
      prev.filter((item) => item.indexData !== index)
    );

    setSelectedDivisionWPExternal((prev) =>
      prev.filter((item) => item.indexData !== index)
    );
    setSelectedGroupWPExternal((prev) =>
      prev.filter((item) => item.indexData !== index)
    );

    formik.setFieldValue("workPrograms", updated);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {isEditMode && isReviewMode && (
        <Alert status="info" mb={4} rounded="md">
          <AlertIcon />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">Review Mode</Text>
            <Text fontSize="sm">You are reviewing this requirement</Text>
          </VStack>
        </Alert>
      )}

      <ConfirmationDialog
        key={"confirmSaveData"}
        isOpenTrigger={openConfirmSaveDialog}
        action={handleSaveData}
        trigger={handleDialogSaveTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
            <Flex
              w={"full"}
              as={Wrap}
              spacing={2}
              overflowX={"auto"}
              justifyContent={"start"}
            >
              <Link href="/requirements/brd-rfc">
                <Button size={"lg"} leftIcon={<FiArrowLeft />}>
                  Back
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
              gap={3}
            >
              {!(isEditMode && requirementStatus !== "DRAFT") && (
                <Button
                  colorScheme={"blue"}
                  leftIcon={<FiSave />}
                  onClick={handleSaveDraft}
                  isLoading={ActionLoading}
                  px={8}
                  size={"lg"}
                >
                  {isEditMode ? "Update Draft" : "Save Draft"}
                </Button>
              )}
              {isEditMode && isReviewMode && 
               (requirementStatus === REQ_STATUS_NEED_REVIEW || requirementStatus === REQ_STATUS_IN_PROGRESS_REVIEW) && (
                <Button
                  colorScheme={"orange"}
                  leftIcon={<FiSave />}
                  onClick={handleRequestApproval}
                  isLoading={ActionLoading}
                  px={8}
                  size={"lg"}
                >
                  Approval Request
                </Button>
              )}
              <Button
                colorScheme={"green"}
                leftIcon={<FiSave />}
                onClick={() => handleConfirmSaveData(formik.values)}
                isLoading={ActionLoading}
                isDisabled={activeStep !== steps.length - 1}
                px={8}
                size={"lg"}
              >
                {isEditMode && requirementStatus === "APPROVED" ? "Update" : "Submit"}
              </Button>
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
            <Card
              w={"fill"}
              rounded={radiusStyle}
              bgColor={colorMode == "light" ? "white" : "gray.800"}
            >
              <CardHeader>
                <Heading as="h5" size="md" w={"full"}>
                  Form Registrasi {type_req_param}
                </Heading>
              </CardHeader>
              <CardBody>
                <Flex w={"full"} as={Stack} spacing={4}>
                  <Flex w={"full"} as={Stack}>
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

                    {/* Crucial Alert for Approved Requirements Missing Apps/Backlog Data */}
                    {isEditMode && requirementStatus === "APPROVED" && (
                      <CrucialDataAlert 
                        formik={formik}
                        setActiveStep={setActiveStep}
                      />
                    )}

                    {activeStep === 0 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel headerTitle={`Memo Pengantar`}>
                          <Flex w={"full"} alignItems={"center"} minH={"15vh"}>
                            <FormControl
                              id={"isHaveMemo"}
                              isInvalid={
                                formik.errors.senderDivisionId ? true : false
                              }
                              isRequired={true}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Sudah Memiliki Memo Pengantar
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <RadioGroup
                                    onChange={(val) => {
                                      formik.setFieldValue("isHaveMemo", val);
                                      if (val == "N") {
                                        // formik.resetForm();
                                        // set rest value if the choosed not have memo
                                        formik.setFieldValue(
                                          "reffParentId",
                                          null
                                        );
                                        setSelectedDivision(null);
                                        formik.setFieldValue(
                                          "senderDivisionId",
                                          null
                                        );
                                        formik.setFieldValue(
                                          "senderDivisionCode",
                                          null
                                        );
                                        formik.setFieldValue(
                                          "senderDivisionName",
                                          null
                                        );
                                        formik.setFieldValue("reqNumber", "-");
                                        formik.setFieldValue(
                                          "reqInititateDate",
                                          null
                                        );
                                        formik.setFieldValue(
                                          "reqAcceptedDate",
                                          null
                                        );
                                        formik.setFieldValue(
                                          "isCarryOver",
                                          "N"
                                        );
                                      }
                                    }}
                                    value={formik.values.isHaveMemo ?? "Y"}
                                  >
                                    <Flex w={"full"} as={HStack} spacing={8}>
                                      <Radio value={"Y"}>Sudah</Radio>
                                      <Radio value={"N"}>Belum</Radio>
                                    </Flex>
                                  </RadioGroup>
                                  <FormHelperText as={"i"} fontSize={"xs"}>
                                    Jika belum memiliki Memo pengantar, ada
                                    beberapa informasi yang akan inputkan lain
                                    waktu jika Memo pengantar sudah ada.*
                                  </FormHelperText>
                                  <FormErrorMessage>
                                    {formik.errors.appAccessMedia}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          </Flex>

                          {formik.values.isHaveMemo == "N" && (
                            <FormControl
                              id="reqNarative"
                              isInvalid={
                                formik.errors.reqNarative ? true : false
                              }
                              isRequired={formik.values.isHaveMemo == "N"}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Perihal Sementara
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Textarea
                                    ref={perihalSementaraRef}
                                    id="reqNarative"
                                    name="reqNarative"
                                    onChange={(e) => {
                                      const textarea =
                                        e.target as HTMLTextAreaElement;
                                      perihalCursorPosRef.current =
                                        textarea.selectionStart;
                                      e.target.value =
                                        e.target.value.toUpperCase();
                                      formik.handleChange(e);
                                    }}
                                    value={formik.values.reqNarative ?? ""}
                                    placeholder={`Perihal Sementara`}
                                    maxLength={300}
                                    isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.reqNarative}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          )}
                        </InputGroupPanel>

                        {/* Projects Section - Only show when requirement is approved and in edit mode */}
                        {isEditMode && requirementStatus === "APPROVED" && requirementId && (
                          <ProjectsRelationSection requirementId={requirementId} />
                        )}
                      </Flex>
                    )}

                    {activeStep === 1 && (
                      <Box position="relative">
                        <Flex as={Stack} w={"full"} spacing={5}>
                          <InputGroupPanel headerTitle={`Informasi Umum`}>
                            <Input
                              id="requirementType"
                              name="requirementType"
                              type="hidden"
                              value={formik.values.requirementType ?? ""}
                              readOnly
                            />

                            <FormControl>
                              <InputLayoutFull>
                                <FormLabel h={"full"} mt={2}>
                                  Divisi Pengirim
                                </FormLabel>
                                <Stack spacing={0}>
                                  <Grid
                                    templateColumns="repeat(2, 1fr)"
                                    gap={3}
                                    w={"full"}
                                  >
                                    <GridItem
                                      colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                                      w={"full"}
                                    >
                                      <FormControl
                                        id={"senderDirectorateId"}
                                        isInvalid={
                                          formik.errors.senderDirectorateId
                                            ? true
                                            : false
                                        }
                                        isRequired={
                                          formik.values.isHaveMemo == "Y"
                                        }
                                      >
                                        <FormLabel h={"full"}>
                                          Direktorat Pengirim
                                        </FormLabel>
                                        <Stack spacing={0}>
                                          <Select
                                            id={`senderDirectorateId`}
                                            options={OptionDirectorate}
                                            isSearchable={true}
                                            placeholder={"Direktorat (Auto)"}
                                            value={OptionDirectorate.find(
                                              (x) =>
                                                x.value ==
                                                formik.values
                                                  .senderDirectorateId
                                            )}
                                            isDisabled={true}
                                          />
                                          <FormErrorMessage>
                                            {formik.errors.senderDirectorateId}
                                          </FormErrorMessage>
                                        </Stack>
                                      </FormControl>
                                    </GridItem>
                                    <GridItem
                                      colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                                      w={"full"}
                                    >
                                      <FormControl
                                        id={"senderDivisionId"}
                                        isInvalid={
                                          formik.errors.senderDivisionId
                                            ? true
                                            : false
                                        }
                                        isRequired={
                                          formik.values.isHaveMemo == "Y"
                                        }
                                      >
                                        <FormLabel h={"full"}>
                                          Divisi Pengirim
                                        </FormLabel>
                                        <Stack spacing={0}>
                                          <Select
                                            id={`senderDivisionId`}
                                            options={OptionDivision}
                                            isSearchable={true}
                                            onMenuOpen={async () => {
                                              setOptionDivision([]);
                                              const whereParam: ListSearchByParam[] =
                                                [
                                                  {
                                                    field: "orgType",
                                                    operator: "=",
                                                    value:
                                                      ORG_CATEGORY_KEY_DIVISION,
                                                  },
                                                ];
                                              const dataDivision =
                                                await GetDataMasterOrg(
                                                  "",
                                                  MAX_SIZE_TABLE,
                                                  whereParam
                                                );
                                              const mapOptionData: OptionListProps[] =
                                                dataDivision.map((d) => ({
                                                  label: `${d.orgName}`,
                                                  value: d.id,
                                                }));
                                              setOptionDivision(mapOptionData);
                                            }}
                                            onChange={async (e) => {
                                              if (e) {
                                                const selected = {
                                                  label: e.label,
                                                  value: e.value,
                                                };
                                                handleSelectedCustom(
                                                  selected,
                                                  "senderDivisionId"
                                                );
                                                setSelectedDivisionSender(
                                                  selected
                                                );
                                                setSelectedDivision(selected);

                                                const whereParam: ListSearchByParam[] =
                                                  [
                                                    {
                                                      field: "id",
                                                      operator: "=",
                                                      value: e.value,
                                                    },
                                                  ];
                                                const divisionData =
                                                  await GetDataMasterOrg(
                                                    "",
                                                    1,
                                                    whereParam
                                                  );
                                                if (
                                                  divisionData.length > 0 &&
                                                  divisionData[0].parentId
                                                ) {
                                                  formik.setFieldValue(
                                                    "senderDirectorateId",
                                                    divisionData[0].parentId
                                                  );
                                                }
                                              } else {
                                                handleUnSelectedCustom(
                                                  "senderDivisionId"
                                                );
                                                handleUnSelectedCustom(
                                                  "senderDirectorateId"
                                                );
                                                setSelectedDivisionSender(null);
                                                setSelectedDivision(null);
                                              }
                                            }}
                                            placeholder={
                                              "Pilih Divisi Pengirim"
                                            }
                                            isDisabled={
                                              formik.values.isHaveMemo == "N"
                                            }
                                            value={SelectedDivisionSender}
                                          />
                                          <FormErrorMessage>
                                            {formik.errors.senderDivisionId}
                                          </FormErrorMessage>
                                        </Stack>
                                      </FormControl>
                                    </GridItem>
                                  </Grid>
                                </Stack>
                              </InputLayoutFull>
                            </FormControl>

                            <FormControl
                              id="reqNumber"
                              isInvalid={formik.errors.reqNumber ? true : false}
                              isRequired={formik.values.isHaveMemo == "Y"}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Nomor Memo
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  {/* <RegistrationNumberInput */}
                                  <Input
                                    id="reqNumber"
                                    // name="reqNumber"
                                    type="text"
                                    onChange={formik.handleChange}
                                    // onChange={(val) =>
                                    //   formik.setFieldValue("reqNumber", val)
                                    // }
                                    value={formik.values.reqNumber ?? ""}
                                    placeholder={`0000/XXX-XXX/X/YYYY`}
                                    minLength={3}
                                    maxLength={22}
                                    isDisabled={
                                      ActionLoading ||
                                      formik.values.isHaveMemo == "N"
                                    }
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.reqNumber}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="reqNarative"
                              isInvalid={
                                formik.errors.reqNarative ? true : false
                              }
                              isRequired={formik.values.isHaveMemo == "Y"}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Perihal
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Textarea
                                    id="reqNarative"
                                    name="reqNarative"
                                    onChange={(e) => {
                                      e.target.value =
                                        e.target.value.toUpperCase();
                                      formik.handleChange(e);
                                    }}
                                    value={formik.values.reqNarative ?? ""}
                                    placeholder={`Perihal`}
                                    maxLength={300}
                                    isDisabled={
                                      ActionLoading ||
                                      formik.values.isHaveMemo == "N"
                                    }
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.reqNumber}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="reqInititateDate"
                              isInvalid={
                                formik.errors.reqInititateDate ? true : false
                              }
                              isRequired={formik.values.isHaveMemo == "Y"}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Tanggal Memo
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Input
                                    id="reqInititateDate"
                                    name="reqInititateDate"
                                    type="date"
                                    max="9999-12-31"
                                    pattern="\d{4}-\d{2}-\d{2}"
                                    onChange={formik.handleChange}
                                    onInput={(
                                      e: React.FormEvent<HTMLInputElement>
                                    ) => {
                                      const input = e.currentTarget;
                                      const value = input.value;
                                      if (value && value.length > 10) {
                                        input.value = value.slice(0, 10);
                                      }
                                    }}
                                    value={formik.values.reqInititateDate ?? ""}
                                    isDisabled={
                                      ActionLoading ||
                                      formik.values.isHaveMemo == "N"
                                    }
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.reqInititateDate}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="reqAcceptedDate"
                              isInvalid={
                                formik.errors.reqAcceptedDate ? true : false
                              }
                              isRequired={formik.values.isHaveMemo == "Y"}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Tanggal Memo Diterima
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Input
                                    id="reqAcceptedDate"
                                    name="reqAcceptedDate"
                                    type="date"
                                    max="9999-12-31"
                                    pattern="\d{4}-\d{2}-\d{2}"
                                    onChange={formik.handleChange}
                                    onInput={(
                                      e: React.FormEvent<HTMLInputElement>
                                    ) => {
                                      const input = e.currentTarget;
                                      const value = input.value;
                                      if (value && value.length > 10) {
                                        input.value = value.slice(0, 10);
                                      }
                                    }}
                                    value={formik.values.reqAcceptedDate ?? ""}
                                    isDisabled={
                                      ActionLoading ||
                                      formik.values.isHaveMemo == "N"
                                    }
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.reqAcceptedDate}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="reqDateDuration"
                              isInvalid={
                                calculateDurationInDays(
                                  formik.values.reqInititateDate ||
                                  new Date().toISOString(),
                                  formik.values.reqAcceptedDate ||
                                  new Date().toISOString()
                                ) < 0
                              }
                            >
                              <InputLayoutFull>
                                <FormLabel h={"full"} mt={2}>
                                  Durasi Memo
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Text px={2} fontWeight={600}>
                                    {calculateDurationInDays(
                                      formik.values.reqInititateDate ||
                                      new Date().toISOString(),
                                      formik.values.reqAcceptedDate ||
                                      new Date().toISOString()
                                    )}{" "}
                                    Hari Kalendar
                                  </Text>
                                  <FormErrorMessage>
                                    {calculateDurationInDays(
                                      formik.values.reqInititateDate ||
                                      new Date().toISOString(),
                                      formik.values.reqAcceptedDate ||
                                      new Date().toISOString()
                                    ) < 0 && "Durasi tidak boleh negatif"}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayoutFull>
                            </FormControl>

                            <FormControl
                              id="isCarryOver"
                              isInvalid={
                                formik.errors.isCarryOver ? true : false
                              }
                              isRequired={formik.values.isHaveMemo == "Y"}
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2} as={"i"}>
                                  <Tooltip
                                    label={"Proyek yang melewati tahun"}
                                    hasArrow
                                    bg={"secondary.800"}
                                    rounded={radiusStyle}
                                    px={4}
                                  >
                                    CarryOver?
                                  </Tooltip>
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Switch
                                    id="isCarryOver"
                                    size={"lg"}
                                    isChecked={
                                      formik.values.isCarryOver === "Y"
                                    }
                                    onChange={(e) => {
                                      formik.setFieldValue(
                                        "isCarryOver",
                                        e.target.checked ? "Y" : "N"
                                      );
                                    }}
                                    isDisabled={
                                      ActionLoading ||
                                      formik.values.isHaveMemo == "N"
                                    }
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.isCarryOver}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>
                          </InputGroupPanel>

                          {/* Lock overlay */}
                          {formik.values.isHaveMemo == "N" && (
                            <CoverLockedFeature
                              title={"Inputan Terkunci"}
                              desc={
                                "Informasi umum tidak dapat diisi karena memo pengantar belum ada. Tapi dapat diisi kembali pada saat project berjalan."
                              }
                            />
                          )}
                        </Flex>
                      </Box>
                    )}

                    {activeStep === 2 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={`Penugasan Personil ${type_req_param}`}
                        >
                          <FormControl
                            id="assignedToDate"
                            isInvalid={
                              formik.errors.assignedToDate ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Tanggal Ditugaskan
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="assignedToDate"
                                  name="assignedToDate"
                                  type="date"
                                  max="9999-12-31"
                                  pattern="\d{4}-\d{2}-\d{2}"
                                  onChange={formik.handleChange}
                                  onInput={(
                                    e: React.FormEvent<HTMLInputElement>
                                  ) => {
                                    const input = e.currentTarget;
                                    const value = input.value;
                                    if (value && value.length > 10) {
                                      input.value = value.slice(0, 10);
                                    }
                                  }}
                                  value={formik.values.assignedToDate ?? ""}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.assignedToDate}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="searchAssignedFromUser"
                            isInvalid={
                              formik.errors.assignedFromId ? true : false
                            }
                            isRequired
                          >
                            {/* <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Ditugaskan Oleh
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="searchAssignedFromUser"
                                  name="searchAssignedFromUser"
                                  type="text"
                                  onChange={(e) => {
                                    handleSearchUser(
                                      e.target.value,
                                      "searchAssignedFromUser"
                                    );
                                  }}
                                  value={AssignedFromUser}
                                  placeholder="Cari dengan ID Personel / Nama Personel"
                                />

                                <UserSearchSelect
                                  key={"searchAssignedFromUser"}
                                  selectedUserCode={
                                    formik.values.assignedFromId
                                  }
                                  usersData={DataUsersAssignedFrom}
                                  onUserSelect={handleAssignedFromUser}
                                />
                                <FormErrorMessage>
                                  {formik.errors.assignedFromId}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull> */}
                          </FormControl>

                          <FormControl id="searchAssignedToUser">
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Ditugaskan Ke
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="searchAssignedToUser"
                                  name="searchAssignedToUser"
                                  type="text"
                                  onChange={(e) => {
                                    handleSearchUserAssign(e.target.value);
                                  }}
                                  value={SearchUserInput}
                                  placeholder="Cari dengan ID Personel / Nama Personel"
                                />

                                <Flex
                                  as={Stack}
                                  w={"full"}
                                  p={2}
                                  spacing={3}
                                  overflowX={"auto"}
                                >
                                  {DataUsers.map((dt, index) => {
                                    const availableData =
                                      ChoosedMemberProjects.find(
                                        (x) => x.id === dt.id
                                      );
                                    return (
                                      <Flex
                                        bg={
                                          colorMode == "light"
                                            ? "gray.100"
                                            : "gray.700"
                                        }
                                        w={"full"}
                                        py={3}
                                        px={8}
                                        rounded={radiusStyle}
                                        boxShadow={"md"}
                                        as={HStack}
                                        spacing={8}
                                        key={index}
                                      >
                                        <Box>
                                          <Avatar name={dt.nama} src="" />
                                        </Box>
                                        <Box>
                                          <Stack spacing={0}>
                                            <Text
                                              color={"gray.900"}
                                              fontWeight={600}
                                            >
                                              {dt.nama}
                                            </Text>
                                            <Text
                                              fontWeight={500}
                                              fontSize={"small"}
                                              color={"gray.700"}
                                            >
                                              {dt.userId} | {dt.email}
                                            </Text>
                                          </Stack>
                                        </Box>
                                        <Spacer />
                                        <>
                                          <Button
                                            rounded={radiusStyle}
                                            colorScheme={"green"}
                                            size={"sm"}
                                            isDisabled={availableData != null}
                                            onClick={() =>
                                              handleAddUserAssign(dt)
                                            }
                                            leftIcon={<FiPlusCircle />}
                                          >
                                            Tambah
                                          </Button>
                                        </>
                                      </Flex>
                                    );
                                  })}
                                </Flex>

                                <Card
                                  rounded={radiusStyle}
                                  boxShadow={"md"}
                                  bgGradient={
                                    "linear(to-br, secondary.500, secondary.800)"
                                  }
                                  color={"white"}
                                  minH={"10vh"}
                                >
                                  <CardHeader pb={1} fontWeight={600}>
                                    Penugasan Personil({ChoosedMemberProjects.length + 1})
                                  </CardHeader>
                                  <CardBody>
                                    <Flex
                                      as={Stack}
                                      w={"full"}
                                      p={2}
                                      spacing={3}
                                      overflowX={"auto"}
                                      minH={"10vh"}
                                    >
                                      {formik.values.assignedFromId && (
                                        <Flex
                                          bg={
                                            colorMode == "light"
                                              ? "gray.100"
                                              : "gray.700"
                                          }
                                          w={"full"}
                                          py={4}
                                          px={5}
                                          rounded={radiusStyle}
                                          boxShadow={"md"}
                                          as={HStack}
                                          spacing={5}
                                        >
                                          <Box
                                            minW="30px"
                                            h="30px"
                                            bg="secondary.500"
                                            color="white"
                                            rounded="full"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontWeight="bold"
                                            fontSize="sm"
                                          >
                                            1
                                          </Box>
                                          <Box>
                                            <Avatar name={formik.values.assignedFromName || ""} src="" />
                                          </Box>
                                          <Box>
                                            <Stack spacing={0}>
                                              <Text
                                                color={"gray.900"}
                                                fontWeight={600}
                                              >
                                                {formik.values.assignedFromName}
                                              </Text>
                                              <Text
                                                fontWeight={500}
                                                fontSize={"small"}
                                                color={"secondary.700"}
                                              >
                                                {formik.values.assignedFromId} |  {formik.values.assignedFromEmail}
                                              </Text>
                                            </Stack>
                                          </Box>
                                        </Flex>
                                      )}
                                      {ChoosedMemberProjects.length <= 0 && (
                                        <Flex
                                          w={"full"}
                                          justifyContent={"center"}
                                        >
                                          <Text pt={5}>
                                            Tambahkan Personil
                                          </Text>
                                        </Flex>
                                      )}
                                      {(() => {
                                        const grouped = ChoosedMemberProjects.reduce(
                                          (acc, member) => {
                                            const groupCode =
                                              member.team?.organization?.group
                                                ?.orgCode || "UNREGISTERED";
                                            const groupName =
                                              member.team?.organization?.group
                                                ?.orgName ||
                                              "UNREGISTERED MEMBER GROUP";

                                            if (!acc[groupCode]) {
                                              acc[groupCode] = {
                                                groupName,
                                                members: [],
                                              };
                                            }
                                            acc[groupCode].members.push(member);
                                            return acc;
                                          },
                                          {} as Record<
                                            string,
                                            {
                                              groupName: string;
                                              members: typeof ChoosedMemberProjects;
                                            }
                                          >
                                        );

                                        let memberIndex = 1;
                                        return Object.entries(grouped).map(
                                          ([groupCode, { groupName, members }]) => (
                                            <Box key={groupCode} w={"full"} mb={4}>
                                              <Text
                                                pb={2}
                                                fontWeight={600}
                                                fontSize="lg"
                                                color="white"
                                              >
                                                {groupName} ({members.length})
                                              </Text>
                                              <Stack spacing={2}>
                                                {members.map((dt) => {
                                                  const currentIndex = memberIndex++;
                                                  return (
                                                    <Flex
                                                      bg={
                                                        colorMode == "light"
                                                          ? "gray.100"
                                                          : "gray.700"
                                                      }
                                                      w={"full"}
                                                      py={4}
                                                      px={5}
                                                      rounded={radiusStyle}
                                                      boxShadow={"md"}
                                                      as={HStack}
                                                      spacing={5}
                                                      key={`${groupCode}-${dt.id}`}
                                                    >
                                                      <Box
                                                        minW="30px"
                                                        h="30px"
                                                        bg="secondary.500"
                                                        color="white"
                                                        rounded="full"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        fontWeight="bold"
                                                        fontSize="sm"
                                                      >
                                                        {currentIndex + 1}
                                                      </Box>
                                                      <Box>
                                                        <Avatar name={dt.nama} src="" />
                                                      </Box>
                                                      <Box>
                                                        <Stack spacing={0}>
                                                          <Text
                                                            color={
                                                              colorMode == "light"
                                                                ? "gray.900"
                                                                : "gray.100"
                                                            }
                                                            fontWeight={600}
                                                          >
                                                            {dt.nama}
                                                          </Text>
                                                          <Text
                                                            fontWeight={500}
                                                            fontSize={"small"}
                                                            color={
                                                              colorMode == "light"
                                                                ? "secondary.700"
                                                                : "secondary.200"
                                                            }
                                                          >
                                                            {dt.userId} | {dt.email}
                                                          </Text>
                                                        </Stack>
                                                      </Box>
                                                      <Spacer />
                                                      <>
                                                        <Tooltip
                                                          label={"Remove"}
                                                          placement="right-end"
                                                          hasArrow
                                                        >
                                                          <Button
                                                            colorScheme={"red"}
                                                            rounded={radiusStyle}
                                                            size={"sm"}
                                                            onClick={() =>
                                                              handleRemoveUserAssign(
                                                                dt.id
                                                              )
                                                            }
                                                            leftIcon={<FiMinusCircle />}
                                                          >
                                                            Hapus
                                                          </Button>
                                                        </Tooltip>
                                                      </>
                                                    </Flex>
                                                  );
                                                })}
                                              </Stack>
                                            </Box>
                                          )
                                        );
                                      })()}
                                    </Flex>
                                  </CardBody>
                                </Card>
                                <FormErrorMessage>
                                  {/* {formik.errors.picAssignUsers} */}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>

                        <InputGroupPanel
                          headerTitle={`Division Requirement Managed By`}
                        >
                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Divisi Yang Mengatur Requirement
                              </FormLabel>
                              <Stack spacing={0}>
                                <Grid
                                  templateColumns="repeat(3, 1fr)"
                                  gap={3}
                                  w={"full"}
                                >
                                  <GridItem
                                    colSpan={{
                                      base: 3,
                                      sm: 3,
                                      md: 3,
                                      lg: 3,
                                    }}
                                    w={"full"}
                                  >
                                    <FormControl
                                      id={"reqManageByDirectorateId"}
                                      isInvalid={
                                        formik.errors.reqManageByDirectorateId
                                          ? true
                                          : false
                                      }
                                      isRequired={!formik.values.isDraft}
                                    >
                                      <FormLabel h={"full"} mt={2}>
                                        Direktorat
                                      </FormLabel>
                                      <Select
                                        id={`reqManageByDirectorateId`}
                                        options={OrganizationData.filter(
                                          (f) =>
                                            f.orgType ==
                                            ORG_CATEGORY_KEY_DIRECTORATE
                                        ).map((d) => ({
                                          label: d.orgName,
                                          value: d.id,
                                        }))}
                                        isDisabled={true}
                                        isSearchable={true}
                                        onChange={(e) => {
                                          if (e) {
                                            formik.setFieldValue(
                                              "reqManageByDirectorateId",
                                              e.value
                                            );
                                          } else {
                                            formik.setFieldValue(
                                              "reqManageByDirectorateId",
                                              null
                                            );
                                          }
                                        }}
                                        placeholder={"Pilih Directorate"}
                                        value={OrganizationData.filter(
                                          (f) =>
                                            f.orgType ==
                                            ORG_CATEGORY_KEY_DIRECTORATE &&
                                            f.id ==
                                            formik.values
                                              .reqManageByDirectorateId
                                        ).map((d) => ({
                                          label: d.orgName,
                                          value: d.id,
                                        }))}
                                      />
                                      <FormErrorMessage>
                                        {
                                          formik.errors
                                            .reqManageByDirectorateId
                                        }
                                      </FormErrorMessage>
                                    </FormControl>
                                  </GridItem>
                                  <GridItem
                                    colSpan={{
                                      base: 3,
                                      sm: 3,
                                      md: 3,
                                      lg: 3,
                                    }}
                                    w={"full"}
                                  >
                                    <FormControl
                                      id={"reqManageByDivisionId"}
                                      isInvalid={
                                        formik.errors.reqManageByDivisionId
                                          ? true
                                          : false
                                      }
                                      isRequired={!formik.values.isDraft}
                                    >
                                      <FormLabel h={"full"} mt={2}>
                                        Divisi
                                      </FormLabel>
                                      <Select
                                        id={`reqManageByDivisionId`}
                                        options={OrganizationData.filter(
                                          (f) =>
                                            f.orgType == ORG_CATEGORY_KEY_DIVISION
                                        ).map((d) => ({
                                          label: d.orgName,
                                          value: d.id,
                                        }))}
                                        isSearchable={true}
                                        onChange={(e) => {
                                          if (e) {
                                            formik.setFieldValue(
                                              "reqManageByDivisionId",
                                              e.value
                                            );

                                            // Auto-fill direktorat from division's parentId
                                            const selectedDiv =
                                              OrganizationData.find(
                                                (org) => org.id === e.value
                                              );
                                            if (
                                              selectedDiv &&
                                              selectedDiv.parentId
                                            ) {
                                              formik.setFieldValue(
                                                "reqManageByDirectorateId",
                                                selectedDiv.parentId
                                              );
                                            }
                                          } else {
                                            formik.setFieldValue(
                                              "reqManageByDivisionId",
                                              null
                                            );
                                            formik.setFieldValue(
                                              "reqManageByDirectorateId",
                                              null
                                            );
                                          }
                                        }}
                                        placeholder={"Pilih Divisi"}
                                        value={OrganizationData.filter(
                                          (f) =>
                                            f.orgType ==
                                            ORG_CATEGORY_KEY_DIVISION &&
                                            f.id ==
                                            formik.values.reqManageByDivisionId
                                        ).map((d) => ({
                                          label: d.orgName,
                                          value: d.id,
                                        }))}
                                      />
                                      <FormErrorMessage>
                                        {formik.errors.reqManageByDivisionId}
                                      </FormErrorMessage>
                                    </FormControl>
                                  </GridItem>
                                  <GridItem
                                    colSpan={{
                                      base: 3,
                                      sm: 3,
                                      md: 3,
                                      lg: 3,
                                    }}
                                    w={"full"}
                                  >
                                    <FormControl
                                      id={"reqManageByGroupId"}
                                      isInvalid={
                                        formik.errors.reqManageByGroupId
                                          ? true
                                          : false
                                      }
                                    >
                                      <FormLabel h={"full"} mt={2}>
                                        Grup
                                      </FormLabel>
                                      <Select
                                        id={`reqManageByGroupId`}
                                        options={OrganizationData.filter(
                                          (f) =>
                                            f.orgType == ORG_CATEGORY_KEY_GROUP &&
                                            f.parentId ==
                                            formik.values.reqManageByDivisionId
                                        ).map((d) => ({
                                          label: d.orgName,
                                          value: d.id,
                                        }))}
                                        isSearchable={true}
                                        onChange={(e) => {
                                          if (e) {
                                            formik.setFieldValue(
                                              "reqManageByGroupId",
                                              e.value
                                            );
                                          } else {
                                            formik.setFieldValue(
                                              "reqManageByGroupId",
                                              null
                                            );
                                          }
                                        }}
                                        placeholder={"Pilih Grup"}
                                        isDisabled={
                                          !formik.values.reqManageByDivisionId
                                        }
                                        value={OrganizationData.filter(
                                          (f) =>
                                            f.orgType == ORG_CATEGORY_KEY_GROUP &&
                                            f.id ==
                                            formik.values.reqManageByGroupId
                                        ).map((d) => ({
                                          label: d.orgName,
                                          value: d.id,
                                        }))}
                                      />
                                      <FormErrorMessage>
                                        {formik.errors.reqManageByGroupId}
                                      </FormErrorMessage>
                                    </FormControl>
                                  </GridItem>
                                </Grid>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>

                        <InputGroupPanel
                          headerTitle={`Informasi Person In Charge (PIC)`}
                        >
                          {/* User ID Field - Commented for future use
                          <FormControl
                            id="searchPICUser"
                            isInvalid={formik.errors.userPicId ? true : false}
                            isRequired
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                User ID
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="searchPICUser"
                                  name="searchPICUser"
                                  type="text"
                                  onChange={(e) => {
                                    handleSearchUser(
                                      e.target.value,
                                      "searchPICUser"
                                    );
                                  }}
                                  value={PICUser}
                                  placeholder="Cari dengan ID User / Nama User"
                                />

                                <UserSearchSelect
                                  key={"searchAssignedUser"}
                                  selectedUserCode={formik.values.userPicId}
                                  usersData={DataUsersPIC}
                                  onUserSelect={handlePICUser}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicId}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                          */}

                          {/* NIP Field - Commented for future use
                          <FormControl
                            id="userPicIdentityNumber"
                            isInvalid={
                              formik.errors.userPicIdentityNumber ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                NIP
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="userPicIdentityNumber"
                                  name="userPicIdentityNumber"
                                  type="text"
                                  placeholder={`Nomor Induk Pegawai`}
                                  onChange={formik.handleChange}
                                  value={
                                    formik.values.userPicIdentityNumber ?? ""
                                  }
                                  minLength={4}
                                  maxLength={10}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicIdentityNumber}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                          */}

                          <FormControl
                            id="userPicName"
                            isInvalid={formik.errors.userPicName ? true : false}
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Nama Lengkap
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="userPicName"
                                  ref={namaLengkapRef}
                                  name="userPicName"
                                  type="text"
                                  onChange={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    namaLengkapCursorPosRef.current =
                                      input.selectionStart;
                                    e.target.value =
                                      e.target.value.toUpperCase();
                                    formik.handleChange(e);
                                  }}
                                  value={formik.values.userPicName ?? ""}
                                  placeholder={`Nama Lengkap PIC`}
                                  minLength={9}
                                  maxLength={225}
                                  // isDisabled={item.backlog.id !== "NEW_SCOPE"}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicContanct}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="userPicContanct"
                            isInvalid={
                              formik.errors.userPicContanct ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Nomor Handphone / Whatsapp
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="userPicContanct"
                                  name="userPicContanct"
                                  type="text"
                                  // onChange={formik.handleChange}
                                  onChange={(e) => {
                                    const onlyNums = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    formik.setFieldValue(
                                      `userPicContanct`,
                                      onlyNums
                                    );
                                  }}
                                  value={formik.values.userPicContanct || "08"}
                                  placeholder={`No. Handphone (08xxxxxx)`}
                                  minLength={9}
                                  maxLength={13}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicContanct}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="userPicEmail"
                            isInvalid={
                              formik.errors.userPicEmail ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Alamat E-mail PIC
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                {/* <EmailInputMask
                                  id="userPicEmail"
                                  name="userPicEmail"
                                  type="email"
                                  // onChange={formik.handleChange}
                                  value={formik.values.userPicEmail ?? ""}
                                  onChange={(val) =>
                                    formik.setFieldValue("userPicEmail", val)
                                  }
                                  minLength={9}
                                  maxLength={50}
                                  isDisabled={ActionLoading}
                                /> */}
                                <Input
                                  id="userPicEmail"
                                  name="userPicEmail"
                                  type="email"
                                  // onChange={(val) =>
                                  //   formik.setFieldValue("userPicEmail", val)
                                  // }
                                  onChange={formik.handleChange}
                                  value={formik.values.userPicEmail ?? ""}
                                  placeholder={`Alamat PIC Email (xxxx@bankbjb.co.id)`}
                                  minLength={9}
                                  maxLength={50}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicEmail}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl>
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Lokasi Kerja PIC
                              </FormLabel>
                              <Stack spacing={0}>
                                <Grid
                                  templateColumns="repeat(2, 1fr)"
                                  gap={3}
                                  w={"full"}
                                >
                                  <GridItem
                                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                                    w={"full"}
                                  >
                                    <FormControl
                                      id={"userPicDirectorateId"}
                                      isInvalid={
                                        formik.errors.userPicDirectorateId
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <FormLabel h={"full"} mt={2}>
                                        Direktorat
                                      </FormLabel>
                                      <Select
                                        id={`userPicDirectorateId`}
                                        options={OptionDirectorate}
                                        isSearchable={true}
                                        placeholder={"Direktorat (Auto)"}
                                        value={OptionDirectorate.find(
                                          (x) =>
                                            x.value ==
                                            formik.values.userPicDirectorateId
                                        )}
                                        isDisabled={true}
                                      />
                                      <FormErrorMessage>
                                        {formik.errors.userPicDirectorateId}
                                      </FormErrorMessage>
                                    </FormControl>
                                  </GridItem>
                                  <GridItem
                                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                                    w={"full"}
                                  >
                                    <FormControl
                                      id={"userPicDivisionId"}
                                      isInvalid={
                                        formik.errors.userPicDivisionId
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <FormLabel h={"full"} mt={2}>
                                        Divisi
                                      </FormLabel>
                                      <Select
                                        id={`userPicDivisionId`}
                                        options={OptionDivision}
                                        isSearchable={true}
                                        onMenuOpen={async () => {
                                          setOptionDivision([]);
                                          const whereParam: ListSearchByParam[] =
                                            [
                                              {
                                                field: "orgType",
                                                operator: "=",
                                                value:
                                                  ORG_CATEGORY_KEY_DIVISION,
                                              },
                                            ];
                                          const dataDivision =
                                            await GetDataMasterOrg(
                                              "",
                                              MAX_SIZE_TABLE,
                                              whereParam
                                            );
                                          const mapOptionData: OptionListProps[] =
                                            dataDivision.map((d) => ({
                                              label: `${d.orgName}`,
                                              value: d.id,
                                            }));
                                          setOptionDivision(mapOptionData);
                                        }}
                                        onChange={async (e) => {
                                          if (e) {
                                            const selected = {
                                              label: e.label,
                                              value: e.value,
                                            };
                                            handleSelectedCustom(
                                              selected,
                                              "userPicDivisionId"
                                            );
                                            setSelectedDivisionPIC(selected);

                                            const whereParam: ListSearchByParam[] =
                                              [
                                                {
                                                  field: "id",
                                                  operator: "=",
                                                  value: e.value,
                                                },
                                              ];
                                            const divisionData =
                                              await GetDataMasterOrg(
                                                "",
                                                1,
                                                whereParam
                                              );
                                            if (
                                              divisionData.length > 0 &&
                                              divisionData[0].parentId
                                            ) {
                                              formik.setFieldValue(
                                                "userPicDirectorateId",
                                                divisionData[0].parentId
                                              );
                                            }

                                            formik.setFieldValue(
                                              "userPicGroupId",
                                              null
                                            );
                                            setSelectedGroupOrgPIC(null);
                                          } else {
                                            handleUnSelectedCustom(
                                              "userPicDivisionId"
                                            );
                                            handleUnSelectedCustom(
                                              "userPicDirectorateId"
                                            );
                                            handleUnSelectedCustom(
                                              "userPicGroupId"
                                            );
                                            setSelectedDivisionPIC(null);
                                            setSelectedGroupOrgPIC(null);
                                          }
                                        }}
                                        placeholder={"Pilih Divisi PIC"}
                                        isLoading={
                                          IsLoadingProcess ||
                                          IsLoadingDivisionSelect
                                        }
                                        value={SelectedDivisionPIC}
                                      />
                                      <FormErrorMessage>
                                        {formik.errors.userPicDivisionId}
                                      </FormErrorMessage>
                                    </FormControl>
                                  </GridItem>
                                  <GridItem
                                    colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }}
                                    w={"full"}
                                  >
                                    <FormControl
                                      id={"userPicGroupId"}
                                      isInvalid={
                                        formik.errors.userPicGroupId
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <FormLabel h={"full"} mt={2}>
                                        Grup
                                      </FormLabel>

                                      <Select
                                        id={`userPicGroupId`}
                                        options={OptionGroupDivision}
                                        isSearchable={true}
                                        onMenuOpen={async () => {
                                          setOptionGroupDivision([]);
                                          await LoadDataGroupOrgCustom(
                                            formik.values.userPicDivisionId ||
                                            ""
                                          );
                                        }}
                                        onChange={(e) => {
                                          if (e) {
                                            const selected = {
                                              label: e.label,
                                              value: e.value,
                                            };
                                            handleSelectedCustom(
                                              selected,
                                              "userPicGroupId"
                                            );
                                            setSelectedGroupOrgPIC(selected);
                                          } else {
                                            handleUnSelectedCustom(
                                              "userPicGroupId"
                                            );
                                            setSelectedGroupOrgPIC(null);
                                          }
                                        }}
                                        placeholder={"Pilih Grup PIC"}
                                        isLoading={
                                          IsLoadingProcess ||
                                          IsLoadingGroupDivisionSelect
                                        }
                                        value={SelectedGroupOrgPIC}
                                      />
                                      <FormErrorMessage>
                                        {formik.errors.userPicGroupId}
                                      </FormErrorMessage>
                                    </FormControl>
                                  </GridItem>
                                </Grid>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 3 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel headerTitle={`Program Kerja User`}>
                          <FormControl>
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Sudah Memiliki Proker Kerja ?
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <RadioGroup
                                  onChange={(val) => HandleExternalChange(val)}
                                  value={WorkProgramExt}
                                >
                                  <Flex w={"full"} as={HStack}>
                                    <Radio value={"0"}>Tidak</Radio>
                                    <Radio value={"1"}>Ada</Radio>
                                  </Flex>
                                </RadioGroup>
                                <FormErrorMessage></FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                          {WorkProgramExt === "1" && (
                            <Flex w={"full"} as={Stack}>
                              {externalWorkPrograms.map((item) => {
                                const index = item.originalIndex;
                                const leftover =
                                  formik.values.workPrograms[index]
                                    .workProgramBudget -
                                  formik.values.workPrograms[index]
                                    .workProgramReal;

                                const leftoverColor =
                                  leftover < 0
                                    ? "red.500"
                                    : leftover > 0
                                      ? "green.500"
                                      : colorMode === "light"
                                        ? "black"
                                        : "white";

                                return (
                                  <Flex w={"full"} as={Stack} key={index}>
                                    <Divider key={index} />
                                    <Flex
                                      w={"full"}
                                      as={HStack}
                                      justifyContent={"space-between"}
                                    >
                                      <Text fontWeight={600}>
                                        Proker Kerja - {index + 1}
                                      </Text>
                                      <Button
                                        size={"md"}
                                        variant={"ghost"}
                                        colorScheme={"red"}
                                        onClick={() => RemoveWorkProgram(index)}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </Flex>

                                    <FormControl>
                                      <InputLayoutFull>
                                        <FormLabel h={"full"} mt={2}>
                                          Divisi Proker User
                                        </FormLabel>
                                        <Stack spacing={4} w={"full"}>
                                          <FormControl
                                            id={`workProgramDirectorate-${index}`}
                                            isInvalid={
                                              typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.directorateId
                                                ? true
                                                : false
                                            }
                                            isRequired
                                          >
                                            <FormLabel>Direktorat</FormLabel>
                                            <Input
                                              id={`workProgramDirectorate-${index}`}
                                              placeholder={"Direktorat (Auto)"}
                                              isDisabled={true}
                                              value={
                                                OptionDirectorate.find(
                                                  (x) =>
                                                    x.value ==
                                                    formik.values.workPrograms[
                                                      index
                                                    ].directorateId
                                                )?.label || ""
                                              }
                                            />
                                            <FormErrorMessage>
                                              {typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.directorateId}
                                            </FormErrorMessage>
                                          </FormControl>

                                          <FormControl
                                            id={`workProgramDivision-${index}`}
                                            isInvalid={
                                              typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.divisionId
                                                ? true
                                                : false
                                            }
                                            isRequired
                                          >
                                            <FormLabel>Divisi</FormLabel>
                                            <Select
                                              id={`workProgramDivision-${index}`}
                                              options={OptionDivision}
                                              isSearchable={true}
                                              onMenuOpen={async () => {
                                                setOptionDivision([]);
                                                const whereParam: ListSearchByParam[] =
                                                  [
                                                    {
                                                      field: "orgType",
                                                      operator: "=",
                                                      value:
                                                        ORG_CATEGORY_KEY_DIVISION,
                                                    },
                                                  ];
                                                const dataDivision =
                                                  await GetDataMasterOrg(
                                                    "",
                                                    MAX_SIZE_TABLE,
                                                    whereParam
                                                  );
                                                const mapOptionData: OptionListProps[] =
                                                  dataDivision.map((d) => ({
                                                    label: `${d.orgName}`,
                                                    value: d.id,
                                                  }));
                                                setOptionDivision(
                                                  mapOptionData
                                                );
                                              }}
                                              onChange={async (e) => {
                                                if (e) {
                                                  const selected = {
                                                    label: e.label,
                                                    value: e.value,
                                                  };

                                                  handleSelectedCustom(
                                                    selected,
                                                    `workPrograms[${index}].divisionId`
                                                  );
                                                  setSelectedDivisionWPExternal(
                                                    (prev) => [
                                                      ...prev,
                                                      {
                                                        indexData: index,
                                                        OptionData: selected,
                                                      },
                                                    ]
                                                  );

                                                  const whereParam: ListSearchByParam[] =
                                                    [
                                                      {
                                                        field: "id",
                                                        operator: "=",
                                                        value: e.value,
                                                      },
                                                    ];
                                                  const divisionData =
                                                    await GetDataMasterOrg(
                                                      "",
                                                      1,
                                                      whereParam
                                                    );
                                                  if (
                                                    divisionData.length > 0 &&
                                                    divisionData[0].parentId
                                                  ) {
                                                    formik.setFieldValue(
                                                      `workPrograms[${index}].directorateId`,
                                                      divisionData[0].parentId
                                                    );
                                                  }

                                                  formik.setFieldValue(
                                                    `workPrograms[${index}].groupId`,
                                                    null
                                                  );
                                                  setSelectedGroupWPExternal(
                                                    (prev) =>
                                                      prev.filter(
                                                        (item) =>
                                                          item.indexData !==
                                                          index
                                                      )
                                                  );
                                                } else {
                                                  handleUnSelectedCustom(
                                                    `workPrograms[${index}].divisionId`
                                                  );
                                                  handleUnSelectedCustom(
                                                    `workPrograms[${index}].directorateId`
                                                  );
                                                  handleUnSelectedCustom(
                                                    `workPrograms[${index}].groupId`
                                                  );
                                                  setSelectedDivisionWPExternal(
                                                    (prev) =>
                                                      prev.filter(
                                                        (item) =>
                                                          item.indexData !==
                                                          index
                                                      )
                                                  );
                                                  setSelectedGroupWPExternal(
                                                    (prev) =>
                                                      prev.filter(
                                                        (item) =>
                                                          item.indexData !==
                                                          index
                                                      )
                                                  );
                                                }
                                              }}
                                              placeholder={"Pilih Divisi"}
                                              isLoading={
                                                IsLoadingProcess ||
                                                IsLoadingDivisionSelect
                                              }
                                              value={
                                                SelectedDivisionWPExternal.find(
                                                  (x) => x.indexData == index
                                                )?.OptionData
                                              }
                                            />

                                            <FormErrorMessage>
                                              {typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.divisionId}
                                            </FormErrorMessage>
                                          </FormControl>

                                          <FormControl
                                            id={`workProgramGroupDivision-${index}`}
                                            isInvalid={
                                              typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.groupId
                                                ? true
                                                : false
                                            }
                                          >
                                            <FormLabel>Group</FormLabel>
                                            <Select
                                              id={`workProgramGroupDivision-${index}`}
                                              options={OptionGroupDivision}
                                              isSearchable={true}
                                              onMenuOpen={async () => {
                                                setOptionGroupDivision([]);
                                                await LoadDataGroupOrgCustom(
                                                  formik.values.workPrograms[
                                                    index
                                                  ].divisionId || ""
                                                );
                                              }}
                                              onChange={(e) => {
                                                if (e) {
                                                  const selected = {
                                                    label: e.label,
                                                    value: e.value,
                                                  };

                                                  handleSelectedCustom(
                                                    selected,
                                                    `workPrograms[${index}].groupId`
                                                  );
                                                  setSelectedGroupWPExternal(
                                                    (prev) => [
                                                      ...prev,
                                                      {
                                                        indexData: index,
                                                        OptionData: selected,
                                                      },
                                                    ]
                                                  );
                                                } else {
                                                  handleUnSelectedCustom(
                                                    `workPrograms[${index}].groupId`
                                                  );
                                                  setSelectedGroupWPExternal(
                                                    (prev) =>
                                                      prev.filter(
                                                        (item) =>
                                                          item.indexData !==
                                                          index
                                                      )
                                                  );
                                                }
                                              }}
                                              placeholder={
                                                "Pilih Group (Opsional)"
                                              }
                                              isLoading={
                                                IsLoadingProcess ||
                                                IsLoadingGroupDivisionSelect
                                              }
                                              value={
                                                SelectedGroupWPExternal.find(
                                                  (x) => x.indexData == index
                                                )?.OptionData
                                              }
                                            />

                                            <FormErrorMessage>
                                              {typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.groupId}
                                            </FormErrorMessage>
                                          </FormControl>
                                        </Stack>
                                      </InputLayoutFull>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramCodeEx-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramCode
                                          ? true
                                          : false
                                      }
                                      isRequired
                                      mt={6}
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Kode Program Kerja
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <VersionCodeInput
                                            id={`workProgramCodeEx-${index}`}
                                            name={`workProgramCodeEx-${index}`}
                                            type="text"
                                            onChange={(val) =>
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramCode`,
                                                val
                                              )
                                            }
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramCode ?? ""
                                            }
                                            placeholder={`0.0.0.0`}
                                            minLength={3}
                                            isDisabled={ActionLoading}
                                            useDoubleDigits={false}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramCode}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramNameEx-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramName
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayoutFull>
                                        <FormLabel h={"full"} mt={2}>
                                          Nama Program Kerja
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id={`workProgramNameEx-${index}`}
                                            name={`workProgramNameEx-${index}`}
                                            type="text"
                                            onChange={(e) =>
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramName`,
                                                e.target.value
                                              )
                                            }
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramName ?? ""
                                            }
                                            placeholder={`Nama Program Kerja`}
                                            minLength={3}
                                            maxLength={150}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramName}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayoutFull>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramAccNameEx-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramAccName
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayoutFull>
                                        <FormLabel h={"full"} mt={2}>
                                          Nama Rekening
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id="workProgramAccNameEx"
                                            name="workProgramAccNameEx"
                                            type="text"
                                            onChange={(e) => {
                                              const upper =
                                                e.target.value.toUpperCase();
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccName`,
                                                upper
                                              );
                                            }}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramAccName ?? ""
                                            }
                                            placeholder={`Nama Rekening`}
                                            minLength={3}
                                            maxLength={150}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramAccName}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayoutFull>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramAccNumberEx-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramAccNumber
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Nomor Rekening
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id="workProgramAccNumberEx"
                                            name="workProgramAccNumberEx"
                                            type="text"
                                            onChange={(e) => {
                                              const onlyNums =
                                                e.target.value.replace(
                                                  /[^0-9]/g,
                                                  ""
                                                );
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccNumber`,
                                                onlyNums
                                              );
                                            }}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramAccNumber ?? ""
                                            }
                                            placeholder={`Nomor Rekening`}
                                            minLength={4}
                                            maxLength={6}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramAccNumber}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramAccCcUser-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramAccCc
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Kode Cost Center
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id="workProgramAccCcUser"
                                            name="workProgramAccCcUser"
                                            type="text"
                                            onChange={(e) => {
                                              const raw =
                                                e.target.value.replace(
                                                  /\D/g,
                                                  ""
                                                ); // remove non-digits
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccCc`,
                                                raw
                                              );
                                            }}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramAccCc ?? ""
                                            }
                                            placeholder="44444"
                                            minLength={4}
                                            maxLength={5}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramAccCc}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramBudgetUser-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramBudget
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Anggaran (Rp.)
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <CurrencyInput
                                            name={`workProgramBudgetUser-${index}`}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramBudget ?? ""
                                            }
                                            onChange={formik.setFieldValue}
                                            fieldCustom={`workPrograms[${index}].workProgramBudget`}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramBudget}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramRealUsers-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramReal
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Realisasi (Rp.)
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <CurrencyInput
                                            name={`workProgramRealUsers-${index}`}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramReal ?? ""
                                            }
                                            onChange={formik.setFieldValue}
                                            fieldCustom={`workPrograms[${index}].workProgramReal`}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramReal}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl color={leftoverColor}>
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Sisa Anggaran (Rp.)
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <CurrencyInput
                                            name={`leftOverExt-${index}`}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramBudget -
                                              formik.values.workPrograms[index]
                                                .workProgramReal
                                            }
                                            onChange={formik.setFieldValue}
                                            isReadOnly
                                          />
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>
                                  </Flex>
                                );
                              })}
                              <Flex w={"full"} justifyContent={"end"} pt={2}>
                                <Button
                                  onClick={() => AddWorkProgram("EXTERNAL")}
                                  colorScheme={"yellow"}
                                  leftIcon={<FiPlusSquare />}
                                >
                                  Tambah Proker Kerja
                                </Button>
                              </Flex>
                            </Flex>
                          )}
                        </InputGroupPanel>
                        <InputGroupPanel headerTitle={`Program Kerja IT`}>
                          <FormControl>
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Sudah Memiliki Proker Kerja ?
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <RadioGroup
                                  onChange={(val) => HandleInternalRBBVal(val)}
                                  value={WorkProgramInt}
                                >
                                  <Flex w={"full"} as={HStack}>
                                    <Radio value={"0"}>Tidak</Radio>
                                    <Radio value={"1"}>Ada</Radio>
                                  </Flex>
                                </RadioGroup>
                                <FormErrorMessage></FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                          {WorkProgramInt === "1" && (
                            <Flex w={"full"} as={Stack}>
                              {internalWorkPrograms.map((item) => {
                                const index = item.originalIndex;
                                const leftover =
                                  formik.values.workPrograms[index]
                                    .workProgramBudget -
                                  formik.values.workPrograms[index]
                                    .workProgramReal;

                                const leftoverColor =
                                  leftover < 0
                                    ? "red.500"
                                    : leftover > 0
                                      ? "green.500"
                                      : colorMode === "light"
                                        ? "black"
                                        : "white";
                                return (
                                  <Flex w={"full"} as={Stack} key={index}>
                                    <Divider key={index} />
                                    <Flex
                                      w={"full"}
                                      as={HStack}
                                      justifyContent={"space-between"}
                                    >
                                      <Text fontWeight={600}>
                                        Proker Kerja - {index + 1}
                                      </Text>
                                      <Button
                                        size={"md"}
                                        variant={"ghost"}
                                        colorScheme={"red"}
                                        onClick={() => RemoveWorkProgram(index)}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </Flex>

                                    <FormControl>
                                      <InputLayoutFull>
                                        <FormLabel h={"full"} mt={2}>
                                          Divisi Proker IT
                                        </FormLabel>
                                        <Stack spacing={4} w={"full"}>
                                          <FormControl
                                            id={`workProgramDirectorateIT-${index}`}
                                            isInvalid={
                                              typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.directorateId
                                                ? true
                                                : false
                                            }
                                            isRequired
                                          >
                                            <FormLabel>Direktorat</FormLabel>
                                            <Input
                                              id={`workProgramDirectorateIT-${index}`}
                                              placeholder={"Direktorat (Auto)"}
                                              isDisabled={true}
                                              value={
                                                OptionDirectorate.find(
                                                  (x) =>
                                                    x.value ==
                                                    formik.values.workPrograms[
                                                      index
                                                    ].directorateId
                                                )?.label || ""
                                              }
                                            />
                                            <FormErrorMessage>
                                              {typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.directorateId}
                                            </FormErrorMessage>
                                          </FormControl>

                                          <FormControl
                                            id={`workProgramDivisionIT-${index}`}
                                            isInvalid={
                                              typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.divisionId
                                                ? true
                                                : false
                                            }
                                            isRequired
                                          >
                                            <FormLabel>Divisi</FormLabel>
                                            <Select
                                              id={`workProgramDivisionIT-${index}`}
                                              options={OptionDivision}
                                              isSearchable={true}
                                              isDisabled={true}
                                              placeholder={"Pilih Divisi"}
                                              isLoading={
                                                IsLoadingProcess ||
                                                IsLoadingDivisionSelect
                                              }
                                              value={
                                                SelectedDivisionWPInternal.find(
                                                  (x) => x.indexData == index
                                                )?.OptionData
                                              }
                                            />
                                            <FormErrorMessage>
                                              {typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.divisionId}
                                            </FormErrorMessage>
                                          </FormControl>

                                          <FormControl
                                            id={`workProgramGroupDivisionIT-${index}`}
                                            isInvalid={
                                              typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.groupId
                                                ? true
                                                : false
                                            }
                                          >
                                            <FormLabel>Group</FormLabel>
                                            <Select
                                              id={`workProgramGroupDivisionIT-${index}`}
                                              options={OptionGroupDivision}
                                              isSearchable={true}
                                              onMenuOpen={async () => {
                                                setOptionGroupDivision([]);
                                                await LoadDataGroupOrgCustom(
                                                  formik.values.workPrograms[
                                                    index
                                                  ].divisionId || ""
                                                );
                                              }}
                                              onChange={(e) => {
                                                if (e) {
                                                  const selected = {
                                                    label: e.label,
                                                    value: e.value,
                                                  };

                                                  handleSelectedCustom(
                                                    selected,
                                                    `workPrograms[${index}].groupId`
                                                  );
                                                  setSelectedGroupWPInternal(
                                                    (prev) => [
                                                      ...prev,
                                                      {
                                                        indexData: index,
                                                        OptionData: selected,
                                                      },
                                                    ]
                                                  );
                                                } else {
                                                  handleUnSelectedCustom(
                                                    `workPrograms[${index}].groupId`
                                                  );
                                                  setSelectedGroupWPInternal(
                                                    (prev) =>
                                                      prev.filter(
                                                        (item) =>
                                                          item.indexData !==
                                                          index
                                                      )
                                                  );
                                                }
                                              }}
                                              placeholder={
                                                "Pilih Group (Opsional)"
                                              }
                                              isLoading={
                                                IsLoadingProcess ||
                                                IsLoadingGroupDivisionSelect
                                              }
                                              value={
                                                SelectedGroupWPInternal.find(
                                                  (x) => x.indexData == index
                                                )?.OptionData
                                              }
                                            />
                                            <FormErrorMessage>
                                              {typeof formik.errors
                                                .workPrograms?.[index] ===
                                                "object" &&
                                                formik.errors.workPrograms?.[
                                                  index
                                                ]?.groupId}
                                            </FormErrorMessage>
                                          </FormControl>
                                        </Stack>
                                      </InputLayoutFull>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramCodeIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramCode
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Kode Program Kerja
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <VersionCodeInput
                                            id={`workProgramCodeIT-${index}`}
                                            name={`workProgramCodeIT-${index}`}
                                            type="text"
                                            onChange={(val) =>
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramCode`,
                                                val
                                              )
                                            }
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramCode ?? ""
                                            }
                                            placeholder={`0.0.0.0`}
                                            minLength={3}
                                            isDisabled={ActionLoading}
                                            useDoubleDigits={false}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramCode}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramNameIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramName
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayoutFull>
                                        <FormLabel h={"full"} mt={2}>
                                          Nama Program Kerja
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id={`workProgramNameIT-${index}`}
                                            name={`workProgramNameIT-${index}`}
                                            type="text"
                                            onChange={(e) =>
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramName`,
                                                e.target.value
                                              )
                                            }
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramName ?? ""
                                            }
                                            placeholder={`Nama Program Kerja`}
                                            minLength={3}
                                            maxLength={150}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramName}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayoutFull>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramAccNameIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramAccName
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayoutFull>
                                        <FormLabel h={"full"} mt={2}>
                                          Nama Rekening
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id="workProgramAccNameIT"
                                            name="workProgramAccNameIT"
                                            type="text"
                                            onChange={(e) => {
                                              const upper =
                                                e.target.value.toUpperCase();
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccName`,
                                                upper
                                              );
                                            }}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramAccName ?? ""
                                            }
                                            placeholder={`Nama Rekening`}
                                            minLength={3}
                                            maxLength={150}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramAccName}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayoutFull>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramAccNumberIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramAccNumber
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Nomor Rekening
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id="workProgramAccNumberIT"
                                            name="workProgramAccNumberIT"
                                            type="text"
                                            onChange={(e) => {
                                              const onlyNums =
                                                e.target.value.replace(
                                                  /[^0-9]/g,
                                                  ""
                                                );
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccNumber`,
                                                onlyNums
                                              );
                                            }}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramAccNumber ?? ""
                                            }
                                            placeholder={`Nomor Rekening`}
                                            minLength={4}
                                            maxLength={6}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramAccNumber}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramAccCcUserIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramAccCc
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Kode Cost Center
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <Input
                                            id="workProgramAccCcUserIT"
                                            name="workProgramAccCcUserIT"
                                            type="text"
                                            onChange={(e) => {
                                              const raw =
                                                e.target.value.replace(
                                                  /\D/g,
                                                  ""
                                                ); // remove non-digits
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccCc`,
                                                raw
                                              );
                                            }}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramAccCc ?? ""
                                            }
                                            placeholder="44444"
                                            minLength={4}
                                            maxLength={5}
                                            isDisabled={ActionLoading}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramAccCc}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramBudgetUserIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramBudget
                                          ? true
                                          : false
                                      }
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Anggaran (Rp.)
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <CurrencyInput
                                            name={`workProgramBudgetUserIT-${index}`}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramBudget ?? ""
                                            }
                                            onChange={formik.setFieldValue}
                                            fieldCustom={`workPrograms[${index}].workProgramBudget`}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramBudget}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl
                                      id={`workProgramRealUsersIT-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                          formik.errors.workPrograms?.[index]
                                            ?.workProgramReal
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Realisasi (Rp.)
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <CurrencyInput
                                            name={`workProgramRealUsersIT-${index}`}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramReal ?? ""
                                            }
                                            onChange={formik.setFieldValue}
                                            fieldCustom={`workPrograms[${index}].workProgramReal`}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.workProgramReal}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>

                                    <FormControl color={leftoverColor}>
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Sisa Anggaran (Rp.)
                                        </FormLabel>
                                        <Stack spacing={0} h={"full"}>
                                          <CurrencyInput
                                            name={`leftOverExtIT-${index}`}
                                            value={
                                              formik.values.workPrograms[index]
                                                .workProgramBudget -
                                              formik.values.workPrograms[index]
                                                .workProgramReal
                                            }
                                            onChange={formik.setFieldValue}
                                            isReadOnly
                                          />
                                        </Stack>
                                      </InputLayout>
                                    </FormControl>
                                  </Flex>
                                );
                              })}
                              <Flex w={"full"} justifyContent={"end"} pt={2}>
                                <Button
                                  onClick={() => AddWorkProgram("INTERNAL")}
                                  colorScheme={"yellow"}
                                  leftIcon={<FiPlusSquare />}
                                >
                                  Tambah Proker Kerja
                                </Button>
                              </Flex>
                            </Flex>
                          )}
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 4 && (
                      <>
                        {type_req_param == "BRD" ? (
                          <Section4BRDView
                            type_req_param={"BRD"}
                            ActionLoading={ActionLoading}
                            formik={formik}
                            DataBackLogs={DataBackLogs}
                            setDataBackLogs={setDataBackLogs}
                            ModalAppPicker={ModalAppPicker}
                            selectedApp={selectedApp}
                            setSelectedApp={setSelectedApp}
                            tokenData={tokenData}
                            hasProjects={hasProjects}
                            isEditMode={isEditMode}
                            isAppSelectionDisabled={isAppSelectionDisabled}
                          />
                        ) : (
                          <Section4RFCView
                            type_req_param={"RFC"}
                            ActionLoading={ActionLoading}
                            formik={formik}
                            DataBackLogs={DataBackLogs}
                            setDataBackLogs={setDataBackLogs}
                            ModalAppPicker={ModalAppPicker}
                            selectedApp={selectedApp}
                            setSelectedApp={setSelectedApp}
                            tokenData={tokenData}
                            hasProjects={hasProjects}
                            isEditMode={isEditMode}
                            isAppSelectionDisabled={isAppSelectionDisabled}
                          />
                        )}
                      </>
                    )}

                    {activeStep === 5 && (
                      <Flex
                        as={Stack}
                        w={"full"}
                        p={4}
                        rounded={radiusStyle}
                        border={"1px"}
                        borderColor={
                          colorMode == "light" ? "gray.200" : "gray.700"
                        }
                        spacing={5}
                      >
                        <Text fontWeight={600}>Unggah Lampiran</Text>
                        <Divider />

                        {/* Uploaded Files (from backend) */}
                        {uploadedFiles.length > 0 && (
                          <Flex w={"full"} direction={"column"} gap={3}>
                            <Text
                              fontWeight={600}
                              fontSize={"sm"}
                              color={"green.600"}
                            >
                              File Terunggah ({uploadedFiles.length})
                            </Text>
                            <Flex
                              w={"full"}
                              p={4}
                              border={"1px"}
                              borderColor={"green.200"}
                              rounded={radiusStyle}
                            >
                              <Table variant="simple" size="sm" w="full">
                                <Thead>
                                  <Tr>
                                    <Th>File Name</Th>
                                    <Th>Size</Th>
                                    <Th isNumeric>Actions</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {uploadedFiles.map((file) => (
                                    <Tr key={file.id}>
                                      <Td>
                                        <Text>{file.name}</Text>
                                      </Td>
                                      <Td>
                                        <Text>
                                          {(file.size / 1024).toFixed(2)} KB
                                        </Text>
                                      </Td>
                                      <Td isNumeric>
                                        <IconButton
                                          aria-label="Delete file"
                                          icon={<FaRegTrashCan />}
                                          colorScheme="red"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteUploadedFile(file.id)
                                          }
                                          variant="ghost"
                                        />
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Flex>
                          </Flex>
                        )}

                        {/* Pending Files to Upload */}
                        {files.length > 0 && (
                          <Text
                            fontWeight={600}
                            fontSize={"sm"}
                            color={"blue.600"}
                          >
                            File Menunggu Unggah ({files.length})
                          </Text>
                        )}

                        {/* Upload area */}
                        <Flex
                          {...getRootProps()}
                          p={6}
                          border={"3px dashed"}
                          rounded={radiusStyle}
                          cursor={"pointer"}
                          bg={"gray.50"}
                          textAlign={"center"}
                          color={"primary.300"}
                          _hover={{
                            bg: "primary.50",
                            color: "primary.400",
                          }}
                          w={"full"}
                          minH={"200px"} // Set a minimum height for better UX
                          justifyContent={"center"} // Center the content horizontally
                          alignItems={"center"} // Center the content vertically
                        >
                          <input {...getInputProps()} />
                          <Text
                            fontSize="xl"
                            fontWeight={"semibold"}
                            color="gray.600"
                          >
                            Seret & letakkan file di sini, atau klik untuk
                            memilih file
                          </Text>
                        </Flex>

                        {/* Table Preview - Only show when there are pending files */}
                        {files.length > 0 && (
                          <Flex w={"full"} p={4}>
                            <Table variant="simple" size="sm" w="full">
                              <Thead>
                                <Tr>
                                  <Th>Preview</Th>
                                  <Th>File Name</Th>
                                  <Th isNumeric>Actions</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {files.map((file, index) => (
                                  <Tr key={index}>
                                    <Td>
                                      {file.type.startsWith("image/") ? (
                                        <Image
                                          src={previews[index]}
                                          alt={file.name}
                                          boxSize="50px"
                                          objectFit="cover"
                                          rounded="md"
                                          onLoad={() =>
                                            URL.revokeObjectURL(
                                              URL.createObjectURL(file)
                                            )
                                          }
                                        />
                                      ) : (
                                        <Box
                                          boxSize="50px"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                        >
                                          {renderFileIcon(file)}
                                        </Box>
                                      )}
                                    </Td>
                                    <Td>
                                      <Text>{file.name}</Text>
                                    </Td>
                                    <Td isNumeric>
                                      <IconButton
                                        aria-label="Remove file"
                                        icon={<FaRegTrashCan />}
                                        colorScheme="red"
                                        size="sm"
                                        onClick={() => handleRemoveFile(index)}
                                        variant="ghost"
                                      />
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Flex>
                        )}

                        {/* <Box
                          overflowY={"auto"}
                          overflowX={"auto"}
                          maxH={"350px"}
                          p={2}
                          bgColor={"gray.200"}
                        >
                          <pre>{JSON.stringify(files, null, 2)}</pre>
                        </Box> */}
                        {/* Upload Button */}
                        <Flex w={"full"} justifyContent={"end"} as={HStack}>
                          {/* <Button colorScheme="blue" onClick={handleUpload}>
                            Upload Files
                          </Button> */}
                          {/* <Button
                            colorScheme="gray"
                            onClick={handleResetListUpload}
                          >
                            Clear Upload
                          </Button> */}
                        </Flex>
                      </Flex>
                    )}

                    <Box
                      overflowY={"auto"}
                      overflowX={"auto"}
                      maxH={"350px"}
                      p={2}
                      bgColor={"gray.200"}
                      display={"none"}
                    >
                      <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                    </Box>
                  </Flex>
                  <Flex mt={10} w={"full"} justifyContent={"space-between"}>
                    <Button
                      onClick={goToPrev}
                      isDisabled={activeStep === 0}
                      variant="outline"
                      leftIcon={<FiArrowLeft />}
                      size={"lg"}
                    >
                      Previous
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
                        size={"lg"}
                      >
                        Next
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </form>
    </LayoutAdmin>
  );
}

interface AppicationShowCaseProps {
  dataApp: ApplicationMasterResponse;
  SelectedApp: (data: ApplicationMasterResponse) => void;
  isActive?: boolean;
}

const AppicationShowCase = ({
  dataApp,
  SelectedApp,
  isActive = false,
}: AppicationShowCaseProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Flex
      as={HStack}
      p={2}
      pl={2}
      pr={4}
      bg={isActive ? "yellow.300" : "secondary.200"}
      color={"gray.800"}
      alignItems={"center"}
      rounded={"full"} // Make it pill-shaped like a tag
      cursor={"pointer"}
      boxShadow={"md"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        bg: "yellow.300",
      }}
      _active={{
        bg: "yellow.600",
      }}
      transition="background-color 0.3s ease, color 0.3s ease"
      zIndex={99}
      onClick={() => SelectedApp(dataApp)}
    >
      <Box
        bgColor="secondary.500"
        color="white"
        p={2}
        w="44px"
        h="44px"
        rounded="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        fontSize="md"
        fontWeight="bold"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        flexShrink={0}
      >
        {dataApp.appShortName}
      </Box>

      <Text userSelect="none" fontWeight={600} fontSize={"small"}>
        {dataApp.appName}
      </Text>
    </Flex>
  );
};

// ------------------------------------ SECTION SPARATE

interface Section4BRDProps {
  type_req_param: "BRD";
  formik: any;
  ActionLoading: boolean;
  DataBackLogs: ReqBacklogPayload[];
  setDataBackLogs: React.Dispatch<React.SetStateAction<ReqBacklogPayload[]>>;
  ModalAppPicker: any;
  selectedApp: ApplicationMasterResponse | null;
  setSelectedApp: React.Dispatch<
    React.SetStateAction<ApplicationMasterResponse | null>
  >;
  tokenData: string;
  hasProjects: boolean;
  isEditMode: boolean;
  isAppSelectionDisabled: () => boolean;
}

// STEP 4 SECTION BRD
const Section4BRDView = ({
  type_req_param,
  formik,
  ActionLoading,
  DataBackLogs,
  ModalAppPicker,
  selectedApp,
  setSelectedApp,
  setDataBackLogs,
  tokenData,
  hasProjects,
  isEditMode,
  isAppSelectionDisabled,
}: Section4BRDProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List: ListApps } = useApps();

  // Backlog Setup
  const ModalForm = useDisclosure();
  const [FormMode, setFormMode] = useState<"Add" | "Edit">("Add");
  const movePriority = (backlogId: string, direction: "up" | "down") => {
    const currentIndex = DataBackLogs.findIndex(
      (item) => item.backlogId === backlogId || item.localId === backlogId
    );
    if (currentIndex === -1) return;

    const newData = [...DataBackLogs];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newData.length) return;

    // Swap posOrder values
    const temp = newData[currentIndex].posOrder;
    newData[currentIndex].posOrder = newData[targetIndex].posOrder;
    newData[targetIndex].posOrder = temp;

    // Swap positions in array
    [newData[currentIndex], newData[targetIndex]] = [
      newData[targetIndex],
      newData[currentIndex],
    ];

    setDataBackLogs(newData);

    showToast({
      description: "Urutan Scope of Work berhasil diubah",
      statusToast: "success",
    });
  };

  const columnsData = useMemo<ColumnDef<ReqBacklogPayload>[]>(
    () => [
      {
        accessorFn: (row) => row.posOrder,
        id: "posOrder",
        cell: (info) => (
          <Flex justifyContent="center" alignItems="center" gap={2}>
            <VStack spacing={0}>
              <Button
                roundedTop={"md"}
                roundedBottom={"none"}
                size="xs"
                colorScheme={"secondary"}
                variant="solid"
                onClick={() =>
                  movePriority(
                    (info.row.original.localId || info.row.original.backlogId)!,
                    "up"
                  )
                }
                isDisabled={info.row.original.posOrder === 1}
              >
                <ChevronUpIcon />
              </Button>
              <Button
                roundedTop={"none"}
                roundedBottom={"md"}
                size="xs"
                colorScheme={"secondary"}
                variant="solid"
                onClick={() =>
                  movePriority(
                    (info.row.original.localId || info.row.original.backlogId)!,
                    "down"
                  )
                }
                isDisabled={info.row.original.posOrder === DataBackLogs.length}
              >
                <ChevronDownIcon />
              </Button>
            </VStack>
            <Badge colorScheme="blue" size="sm">
              {info.row.original.posOrder}
            </Badge>
          </Flex>
        ),
        header: () => <Flex justifyContent="center">Priority</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.backlogName,
        id: "backlogName",
        cell: (info) => <Flex>{info.row.original.backlogName}</Flex>,
        header: () => <span>Nama Scope of Work</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.backlogDesc,
        id: "backlogDesc",
        cell: (info) => <Flex>{info.row.original.backlogDesc}</Flex>,
        header: () => <span>Deskripsi</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.backlogId,
        id: "backlogId",
        cell: (info) => (
          <Flex as={HStack} justifyContent={"end"}>
            <Button
              colorScheme="teal"
              size="xs"
              variant="ghost"
              onClick={() =>
                logBacklog(
                  info.row.original.backlogId || info.row.original.localId
                )
              }
            >
              <FaEdit />
            </Button>
            <Button
              colorScheme="red"
              size="xs"
              variant="ghost"
              onClick={() =>
                removeBacklog(
                  info.row.original.backlogId || info.row.original.localId
                )
              }
            >
              <FaTrash />
            </Button>
          </Flex>
        ),
        header: () => <Flex justifyContent={"end"}>Aksi</Flex>,
        footer: (props) => props.column.id,
      },
    ],
    [DataBackLogs]
  );
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

  const table = useReactTable({
    data: DataBackLogs,
    columns: columnsData,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    manualFiltering: false,
    manualPagination: false,
  });

  const [TextBackLogIndex, setTextBackLogIndex] = useState<number | null>(null);
  const [TextBackLogId, setTextBackLogId] = useState<string | null>(null);
  const [TextBackLogName, setTextBackLogName] = useState<string>("");
  const [TextBackLogDesc, setTextBackLogDesc] = useState<string>("");
  const backlogNameInputRef = useRef<HTMLInputElement>(null);
  const cursorPosRef = useRef<number | null>(null);

  useEffect(() => {
    if (backlogNameInputRef.current && cursorPosRef.current !== null) {
      backlogNameInputRef.current.setSelectionRange(
        cursorPosRef.current,
        cursorPosRef.current
      );
    }
  }, [TextBackLogName]);

  const handleOpenForm = () => {
    ModalForm.onOpen();
  };

  const addBacklog = (name: string, desc?: string) => {
    const generateLocalId = () => {
      return `local-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
    };

    const isDuplicate = DataBackLogs.some(
      (x) => x.backlogName.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      showToast({
        description: "Scope of Work sudah ada di daftar",
        statusToast: "warning",
      });
      return;
    }

    const newBacklog: ReqBacklogPayload = {
      localId: generateLocalId(), // For client-side operations
      backlogId: null, // null = new backlog to be inserted
      backlogName: name,
      backlogDesc: desc || null,
      posOrder: DataBackLogs.length + 1,
    };

    setDataBackLogs((prev) => [...prev, newBacklog]);

    showToast({
      description: "Scope of Work ditambahkan",
      statusToast: "success",
    });
  };

  const updateBacklog = (backlogId: string, updatedData: ReqBacklogPayload) => {
    setDataBackLogs((prev) =>
      prev.map((item) =>
        item.backlogId === backlogId || item.localId === backlogId
          ? { ...item, ...updatedData }
          : item
      )
    );

    showToast({
      description: "Scope of Work diubah",
      statusToast: "success",
    });

    ModalForm.onClose();
    setFormMode("Add");
  };
  const removeBacklog = (backlogId: string | undefined | null) => {
    if (backlogId == undefined || backlogId == null) {
      showToast({
        description: "Scope of Work ID error",
        statusToast: "warning",
      });
      return;
    }
    setDataBackLogs((prev) =>
      prev.filter((item) => {
        // For new items, use localId; for existing items, use backlogId
        const itemId = item.backlogId || item.localId;
        return itemId !== backlogId;
      })
    );

    showToast({
      description: "Scope of Work dihapus",
      statusToast: "success",
    });
  };

  const handleSaveBacklog = () => {
    if (!TextBackLogName.trim()) {
      showToast({
        description: "Nama Scope of Work tidak boleh kosong",
        statusToast: "warning",
      });
      return;
    }

    if (FormMode === "Add") {
      addBacklog(TextBackLogName.trim(), TextBackLogDesc?.trim());
    } else {
      if (!TextBackLogId) {
        showToast({
          description: "Backlog ID kosong",
          statusToast: "warning",
        });
        return;
      }
      const currentItem = DataBackLogs.find(
        (x) => x.backlogId === TextBackLogId || x.localId === TextBackLogId
      );

      updateBacklog(TextBackLogId, {
        backlogId: currentItem?.backlogId || null,
        localId: currentItem?.localId,
        backlogName: TextBackLogName.trim(),
        backlogDesc: TextBackLogDesc?.trim() || null,
        posOrder: currentItem?.posOrder || 1, // 1rve existing posOrder
      });
    }

    // Reset state
    setTextBackLogIndex(null);
    setTextBackLogId(null);
    setTextBackLogName("");
    setTextBackLogDesc("");
    setFormMode("Add");
  };

  const logBacklog = (backlogId: string | undefined | null) => {
    console.log(backlogId);
    console.log(DataBackLogs);
    if (backlogId == undefined || backlogId == null) {
      showToast({
        description: "Scope of Work ID error",
        statusToast: "warning",
      });
      return;
    }

    const item = DataBackLogs.find((x) => {
      const itemId = x.backlogId || x.localId;
      return itemId === backlogId;
    });
    if (!item) return;

    setFormMode("Edit");
    ModalForm.onOpen();
    setTextBackLogId(item.backlogId || item.localId || null);
    setTextBackLogName(item.backlogName || "");
    setTextBackLogDesc(item.backlogDesc || "");
  };

  useEffect(() => {
    formik.setFieldValue(
      "backlogFeatures",
      DataBackLogs.map((item) => ({
        ...item,
        // Keep backlogId if it exists (for editing), otherwise set to null (for new)
        backlogId: item.backlogId || null,
      }))
    );
  }, [DataBackLogs]);

  // End Backlog setup

  // Choose Aplication existing
  const [ListDataAplicationExisting, setListDataAplicationExisting] = useState<
    ApplicationMasterResponse[]
  >([]);
  const [ApplicationExistingChoosed, setApplicationExistingChoosed] =
    useState<ApplicationMasterResponse | null>(null);

  // Sync ApplicationExistingChoosed when selectedApp is loaded and update form with latest master data
  useEffect(() => {
    if (selectedApp && !ApplicationExistingChoosed) {
      setApplicationExistingChoosed(selectedApp);

      // Update form fields with latest master application data
      formik.setFieldValue("appInitialCode", selectedApp.appShortName);
      formik.setFieldValue("appInitialName", selectedApp.appName);
      formik.setFieldValue("appTargetUsers", selectedApp.appTargetUsers);

      if (selectedApp.appAccessFrontsiteDns) {
        setMediaAksesPublic(true);
      }
      formik.setFieldValue(
        "appAccessFrontsiteDns",
        selectedApp.appAccessFrontsiteDns
      );
      formik.setFieldValue(
        "appAccessFrontsiteIp",
        selectedApp.appAccessFrontsiteIp
      );
      formik.setFieldValue(
        "appAccessBacksiteDns",
        selectedApp.appAccessBacksiteDns
      );

      if (selectedApp.appAccessBacksiteIp) {
        setMediaAksesIntranet(true);
      }
      formik.setFieldValue(
        "appAccessBacksiteIp",
        selectedApp.appAccessBacksiteIp
      );

      if (selectedApp.appTypes) {
        setSelectedAppsTypes(selectedApp.appTypes);
      }
      formik.setFieldValue("appTypeCustom", selectedApp.appTypeCustom);
      formik.setFieldValue("appRelatedness", selectedApp.appRelatedness);
      formik.setFieldValue(
        "appRelatednessDesc",
        selectedApp.appRelatednessDesc
      );
      formik.setFieldValue("appTransactionals", selectedApp.appTransactionals);
      formik.setFieldValue(
        "appOperational24hrs",
        selectedApp.appOperational24hrs
      );

      if (selectedApp.appOperationalDays) {
        setOperationalDays(selectedApp.appOperationalDays);
      }
      formik.setFieldValue(
        "appOperationalDays",
        selectedApp.appOperationalDays
      );
      formik.setFieldValue(
        "appOperationalHourOpen",
        selectedApp.appOperationalHourOpen
      );
      formik.setFieldValue(
        "appOperationalHourClosed",
        selectedApp.appOperationalHourClosed
      );

      if (selectedApp.appEnvLocations) {
        setSelectedAppsEnvLoc(selectedApp.appEnvLocations);
      }
      formik.setFieldValue("appEnvLocations", selectedApp.appEnvLocations);
      formik.setFieldValue(
        "appEnvLocationsOthers",
        selectedApp.appEnvLocationsOthers
      );
      formik.setFieldValue("appPrivateAuth", selectedApp.appPrivateAuth);
      formik.setFieldValue(
        "appHightAvailability",
        selectedApp.appHightAvailability
      );
      formik.setFieldValue(
        "appIntegrationOthersApps",
        selectedApp.appIntegrationOthersApps
      );
    }
  }, [selectedApp]);

  const GetDataApplications = async (
    searchValue: string = "",
    limit: number = 1
  ) => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [],
      fieldOrder: ["appShortName"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListApps(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return;
      }

      const itemsData: ApplicationMasterResponse[] =
        requestData.data as ApplicationMasterResponse[];

      setListDataAplicationExisting(itemsData);

      return;
    }
  };

  const ResetAppSpec = () => {
    setListDataAplicationExisting([]);
    setApplicationExistingChoosed(null);
    setSelectedAppsTypes("");
    setOperationalDays("");
    setSelectedAppsEnvLoc("");
    setMediaAksesPublic(false);
    setMediaAksesIntranet(false);
    formik.setFieldValue("appInitialCode", null);
    formik.setFieldValue("appInitialName", null);
    formik.setFieldValue("appTargetUsers", "INTERNAL");
    formik.setFieldValue("appAccessFrontsiteDns", null);
    formik.setFieldValue("appAccessFrontsiteIp", null);
    formik.setFieldValue("appAccessBacksiteDns", null);
    formik.setFieldValue("appAccessBacksiteIp", null);

    formik.setFieldValue("backlogChange", null);
    formik.setFieldValue("appAccessMedia", null);
    formik.setFieldValue("appTypes", null);
    formik.setFieldValue("appTypeCustom", null);
    formik.setFieldValue("appRelatedness", null);
    formik.setFieldValue("appRelatednessDesc", null);
    formik.setFieldValue("appTransactionals", null);
    formik.setFieldValue("appOperational24hrs", null);
    formik.setFieldValue("appOperationalDays", null);
    formik.setFieldValue("appOperationalHourOpen", null);
    formik.setFieldValue("appOperationalHourClosed", null);
    formik.setFieldValue("appLiveTargetDate", null);

    formik.setFieldValue("appEnvLocations", "");
    formik.setFieldValue("appEnvLocationsOthers", "");
    formik.setFieldValue("appPrivateAuth", "Y");
    formik.setFieldValue("appHightAvailability", "Y");
    formik.setFieldValue("appIntegrationOthersApps", "");
  };

  const SelectedApp = (data: ApplicationMasterResponse) => {
    if (ApplicationExistingChoosed != null) {
      ResetAppSpec();
    } else {
      setApplicationExistingChoosed(data);
      formik.setFieldValue("appInitialCode", data.appShortName);
      formik.setFieldValue("appInitialName", data.appName);

      formik.setFieldValue("appTargetUsers", data.appTargetUsers);
      if (data.appAccessFrontsiteDns) {
        setMediaAksesPublic(true);
      }
      formik.setFieldValue("appAccessFrontsiteDns", data.appAccessFrontsiteDns);
      formik.setFieldValue("appAccessFrontsiteIp", data.appAccessFrontsiteIp);
      formik.setFieldValue("appAccessBacksiteDns", data.appAccessBacksiteDns);
      if (data.appAccessBacksiteIp) {
        setMediaAksesIntranet(true);
      }
      formik.setFieldValue("appAccessBacksiteIp", data.appAccessBacksiteIp);

      formik.setFieldValue("backlogChange", null);
      formik.setFieldValue("appAccessMedia", data.appAccessMedia);
      formik.setFieldValue("appTypes", data.appTypes);
      formik.setFieldValue("appTypeCustom", data.appTypeCustom);
      formik.setFieldValue("appRelatedness", data.appRelatedness);
      formik.setFieldValue("appRelatednessDesc", data.appRelatednessDesc);
      formik.setFieldValue("appTransactionals", data.appTransactionals);
      formik.setFieldValue("appOperational24hrs", data.appOperational24hrs);
      formik.setFieldValue("appOperationalDays", data.appOperationalDays);
      formik.setFieldValue(
        "appOperationalHourOpen",
        data.appOperationalHourOpen
      );
      formik.setFieldValue(
        "appOperationalHourClosed",
        data.appOperationalHourClosed
      );
      formik.setFieldValue("appLiveTargetDate", null);

      formik.setFieldValue("appEnvLocations", data.appEnvLocations);
      formik.setFieldValue("appEnvLocationsOthers", data.appEnvLocationsOthers);
      formik.setFieldValue("appPrivateAuth", data.appPrivateAuth);
      formik.setFieldValue("appHightAvailability", data.appHightAvailability);
      formik.setFieldValue(
        "appIntegrationOthersApps",
        data.appIntegrationOthersApps
      );

      setSelectedAppsTypes(data.appTypes || "");
      setOperationalDays(data.appOperationalDays || "");
      setSelectedAppsEnvLoc(data.appEnvLocations || "");
    }
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleChangeAppCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyAlphabets = e.target.value;
    // .replace(/[^a-zA-Z ]/g, "")
    // .toUpperCase();
    formik.setFieldValue("appInitialCode", onlyAlphabets);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (onlyAlphabets.length >= 2) {
        GetDataApplications(onlyAlphabets, 4);
      } else {
        setListDataAplicationExisting([]);
        setApplicationExistingChoosed(null);
        formik.setFieldValue("appInitialCode", null);
        formik.setFieldValue("appInitialName", null);
      }
    }, 300);
  };
  // End - Choose Aplication existing

  // APP TYPES OPTIONS HANDLER

  const [SelectedAppsTypes, setSelectedAppsTypes] = useState<string>("");

  const handleAppysTypesCheckboxChange = (value: string) => {
    const currentList = SelectedAppsTypes.split(",")
      .map((item) => item.trim())
      .filter(Boolean); // removes empty strings

    let updatedList: string[];

    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    setSelectedAppsTypes(
      updatedList.join(", ") + (updatedList.length > 0 ? "," : "")
    );
  };
  const hasOtherAppsTypes = SelectedAppsTypes.split(",")
    .map((s) => s.trim().toLowerCase())
    .includes("other");

  // END APP TYPES OPTIONS HANDLER

  // APPS OPERATIONAL STATE
  const [OperationalDays, setOperationalDays] = useState<string>("");

  // END APPS OPERATIONAL STATE

  // APP ENV LOC OPTIONS HANDLER

  const [SelectedAppsEnvLoc, setSelectedAppsEnvLoc] = useState<string>("");

  const handleAppysEnvLocCheckboxChange = (value: string) => {
    const currentList = SelectedAppsEnvLoc.split(",")
      .map((item) => item.trim())
      .filter(Boolean); // removes empty strings

    let updatedList: string[];

    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    setSelectedAppsEnvLoc(
      updatedList.join(", ") + (updatedList.length > 0 ? "," : "")
    );
  };
  const hasOtherEnvLocTypes = SelectedAppsEnvLoc.split(",")
    .map((s) => s.trim().toLowerCase())
    .includes("other");

  // END APP ENV LOC OPTIONS HANDLER

  // Sync checkbox states when requirement data is loaded
  useEffect(() => {
    if (formik.values.appTypes && !SelectedAppsTypes) {
      setSelectedAppsTypes(formik.values.appTypes);
    }
    if (formik.values.appEnvLocations && !SelectedAppsEnvLoc) {
      setSelectedAppsEnvLoc(formik.values.appEnvLocations);
    }
    if (formik.values.appOperationalDays && !OperationalDays) {
      setOperationalDays(formik.values.appOperationalDays);
    }
  }, [
    formik.values.appTypes,
    formik.values.appEnvLocations,
    formik.values.appOperationalDays,
  ]);

  useEffect(() => {
    formik.setFieldValue("appTypes", SelectedAppsTypes);
    formik.setFieldValue("appOperationalDays", OperationalDays);
    formik.setFieldValue("appEnvLocations", SelectedAppsEnvLoc);
    // if (formik.values.appOperational24hrs == APP_OPERATIONAL_OPTIONS[0]) {
    //   formik.setFieldValue("appOperationalDays", "");
    // }

    if (!hasOtherAppsTypes) {
      formik.setFieldValue("appRelatednessDesc", "");
    }
    if (!hasOtherEnvLocTypes) {
      formik.setFieldValue("appEnvLocationsOthers", "");
    }
  }, [SelectedAppsTypes, OperationalDays, SelectedAppsEnvLoc]);

  const handleQuickAddTagIntegratedApps = (tag: string) => {
    const currentValue = formik.values.appIntegrationOthersApps || "";

    const currentTags = currentValue
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    if (!currentTags.includes(tag)) {
      const updated = [...currentTags, tag].join(", ");
      formik.setFieldValue("appIntegrationOthersApps", updated);
    }
  };

  // APP MEDIA AKSES
  const [MediaAksesPublic, setMediaAksesPublic] = useState(false);
  const [MediaAksesIntranet, setMediaAksesIntranet] = useState(false);

  return (
    <Flex as={Stack} w={"full"} spacing={5}>
      {/* MODAL HERE */}
      <Modal
        size={"xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{`${FormMode == "Add" ? "Tambah" : "Ubah"
            } Scope of Work`}</ModalHeader>
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"}>
              <FormControl>
                <FormLabel>Nama Scope of Work</FormLabel>
                <Input
                  ref={backlogNameInputRef}
                  id="backlogFeatureName"
                  name="backlogFeatureName"
                  type="text"
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    cursorPosRef.current = input.selectionStart;
                    const upper = input.value.toUpperCase();
                    setTextBackLogName(upper);
                  }}
                  value={TextBackLogName}
                  placeholder={`Nama Scope of Work`}
                  minLength={3}
                  maxLength={200}
                  isDisabled={ActionLoading}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Deskripsi</FormLabel>
                <Textarea
                  id="backlogFeatureDesc"
                  name="backlogFeatureDesc"
                  onChange={(e) => setTextBackLogDesc(e.target.value)}
                  value={TextBackLogDesc}
                  placeholder={`Deskripsi Scope of Work`}
                  maxLength={300}
                  isDisabled={ActionLoading}
                />
              </FormControl>

              <Button
                mt={2}
                w={"full"}
                size={"lg"}
                leftIcon={<FiPlusCircle />}
                colorScheme={"secondary"}
                onClick={() => handleSaveBacklog()}
                isDisabled={ActionLoading || !TextBackLogName.trim()}
              >
                {FormMode == "Add" ? "Tambah" : "Ubah"} Scope of Work
              </Button>

              <Divider py={1} />
              <Text fontSize={"smaller"}>Tambah Cepat</Text>
              <FormControl>
                <FormLabel>Rekomendasi Scope of Work Umum</FormLabel>
                <Flex as={Wrap} w={"full"}>
                  {FeatureRecomentionsBacklogs.map((item, index) => {
                    if (
                      DataBackLogs.some(
                        (x) => x.backlogName === item.featureName
                      )
                    ) {
                      return null; // Skip if already exists
                    } else {
                      return (
                        <Tag
                          key={index}
                          borderRadius="full"
                          colorScheme="secondary"
                          variant={"solid"}
                          onClick={() => {
                            setTextBackLogName(item.featureName);
                            setTextBackLogDesc(item.featureDescription || "");
                          }}
                          px={3}
                          cursor={"pointer"}
                          _hover={{ bg: "secondary.700", color: "white" }}
                        >
                          <FiPlus />
                          <TagLabel pl={1}>{item.featureName}</TagLabel>
                        </Tag>
                      );
                    }
                  })}
                </Flex>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
      {/* SECTION STRAT */}
      <InputGroupPanel
        headerTitle={`Ringkasan Ruanglingkup ${type_req_param} | Aspek Bisnis`}
      >
        <Flex as={Stack} w={"full"} spacing={5}>
          <FormControl
            id="appInitialCode"
            isInvalid={formik.errors.appInitialCode ? true : false}
          >
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Inisial Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Flex
                  w="full"
                  justifyContent="start"
                  alignItems="center"
                  gap={2}
                >
                  <Input
                    id="appInitialCode"
                    name="appInitialCode"
                    type="text"
                    w={"50%"}
                    onChange={handleChangeAppCode}
                    value={formik.values.appInitialCode ?? ""}
                    placeholder={`CMS / SISMON / dsb.`}
                    minLength={3}
                    maxLength={10}
                    isDisabled={ActionLoading}
                    isReadOnly
                  />
                  <Button
                    colorScheme={"secondary"}
                    onClick={() => ModalAppPicker.onOpen()}
                    isDisabled={ActionLoading || isAppSelectionDisabled()}
                  >
                    Pilih Aplikasi
                  </Button>
                  {isAppSelectionDisabled() && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      Aplikasi tidak dapat diubah karena requirement sudah terdaftar dalam proyek
                    </Text>
                  )}
                  {/* {formik.values.appInitialCode &&
                    formik.values.appInitialCode.length > 2 &&
                    ListDataAplicationExisting.length <= 0 && (
                      <HStack color={"secondary.500"}>
                        <Text fontWeight={600} as={"span"}>
                          Aplikasi Baru
                        </Text>
                        <FiCheckCircle />
                      </HStack>
                    )} */}
                </Flex>
                <Box
                  w={"full"}
                  py={2}
                  px={4}
                  mt={2}
                  bgColor={"gray.200"}
                  rounded={radiusStyle}
                  as={Wrap}
                  display={
                    ListDataAplicationExisting.length > 0 ? "block" : "none"
                  }
                >
                  <Heading as="h4" size="sm">
                    Aplikasi Existing
                  </Heading>
                  <Flex w="full" overflowX="auto">
                    <HStack spacing={4} minW="max-content">
                      {/* APP LIST */}
                      {ListDataAplicationExisting.length > 0 &&
                        ListDataAplicationExisting.map((ap, idx) => (
                          <AppicationShowCase
                            key={idx}
                            dataApp={ap}
                            SelectedApp={SelectedApp}
                            isActive={
                              ApplicationExistingChoosed?.appShortName ==
                              ap.appShortName
                            }
                          />
                        ))}
                    </HStack>
                  </Flex>
                </Box>
                <Box
                  w={"full"}
                  overflowY={"auto"}
                  overflowX={"auto"}
                  h={"350px"}
                  p={4}
                  mt={2}
                  bgColor={"gray.200"}
                  rounded={radiusStyle}
                  display={"none"}
                >
                  <Text fontWeight={600}>Data Apps</Text>
                  <pre>
                    {JSON.stringify(ListDataAplicationExisting, null, 2)}
                  </pre>
                </Box>
                <FormErrorMessage>
                  {formik.errors.appInitialCode}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl
            id="appInitialName"
            isInvalid={formik.errors.appInitialName ? true : false}
          >
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Nama Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Input
                  id="appInitialName"
                  name="appInitialName"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.appInitialName ?? ""}
                  placeholder={`Nama Aplikasi`}
                  minLength={3}
                  maxLength={150}
                  isDisabled={
                    ActionLoading || ApplicationExistingChoosed != null
                  }
                  isReadOnly
                />
                <FormErrorMessage>
                  {formik.errors.appInitialName}
                </FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          {ApplicationExistingChoosed && (
            <Flex
              w={"full"}
              as={Stack}
              justifyContent={"center"}
              alignItems={"center"}
              rounded={radiusStyle}
              border={"1px"}
              borderColor={colorMode == "light" ? "gray.200" : "gray.700"}
              transition="transform 0.2s ease-in-out, background-color 0.2s ease, box-shadow 0.2s ease-in-out" // Animate transform and box-shadow
              bgGradient={"linear(to-br, secondary.800, secondary.500)"}
              color={"white"}
              p={4}
              spacing={5}
            >
              <Heading as="h5" size="sm">
                Aplikasi Eksisting
              </Heading>
              {/* ICON APP */}
              <Flex
                position="relative"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                backgroundSize="cover"
                backgroundImage={`url(/img/default-apps.jpg)`}
                rounded={"100%"}
                color={"white"}
                w={"80px"}
                h={"80px"}
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                fontWeight="bold"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                flexShrink={0}
                boxShadow={"md"}
              />
              <Flex h={"full"} as={Stack} alignItems={"start"} spacing={1}>
                <Flex as={HStack}>
                  <Badge
                    colorScheme="gray"
                    fontSize={"medium"}
                    px={3}
                    rounded={"md"}
                  >
                    {ApplicationExistingChoosed.appShortName}
                  </Badge>
                  <Heading as="h4" size="md">
                    {ApplicationExistingChoosed.appName.toUpperCase()}
                  </Heading>
                </Flex>
              </Flex>
            </Flex>
          )}

          <Divider />

          <FormControl
            id="appTargetUsers"
            isInvalid={formik.errors.appTargetUsers ? true : false}
          >
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Target Pengguna
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appTargetUsers", val)
                  }
                  value={formik.values.appTargetUsers ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    <Radio value={"EXTERNAL"}>EXTERNAL (NASABAH)</Radio>
                    <Radio value={"INTERNAL"}>INTERNAL (BANK)</Radio>
                  </Flex>
                </RadioGroup>
                <FormErrorMessage>
                  {formik.errors.appTargetUsers}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Media Akses Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Grid templateColumns="repeat(2, 1fr)" gap={3} w={"full"}>
                  <GridItem
                    colSpan={{
                      base: 2,
                      sm: 2,
                      md: 1,
                      lg: 1,
                    }}
                    w={"full"}
                  >
                    <Flex w={"full"} as={Stack}>
                      <Checkbox
                        isChecked={MediaAksesPublic}
                        onChange={(e) => {
                          setMediaAksesPublic(!MediaAksesPublic);
                          console.log(e);
                        }}
                        isDisabled={ApplicationExistingChoosed !== null}
                      >
                        Internet (Publik)
                      </Checkbox>
                      <Input
                        id="appAccessFrontsiteDns"
                        name="appAccessFrontsiteDns"
                        type="text"
                        onChange={formik.handleChange}
                        value={
                          formik.values.appAccessFrontsiteDns || "https://"
                        }
                        placeholder={`https://`}
                        minLength={5}
                        maxLength={150}
                        isDisabled={
                          !MediaAksesPublic ||
                          ApplicationExistingChoosed !== null
                        }
                      />
                    </Flex>
                  </GridItem>
                  <GridItem
                    colSpan={{
                      base: 2,
                      sm: 2,
                      md: 1,
                      lg: 1,
                    }}
                    w={"full"}
                  >
                    <Flex w={"full"} as={Stack}>
                      <Checkbox
                        isChecked={MediaAksesIntranet}
                        onChange={(e) => {
                          setMediaAksesIntranet(!MediaAksesIntranet);
                          console.log(e);
                        }}
                        isDisabled={ApplicationExistingChoosed !== null}
                      >
                        Intranet (Untuk BackOffice Bank)
                      </Checkbox>
                      <Input
                        id="appAccessBacksiteIp"
                        name="appAccessBacksiteIp"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.appAccessBacksiteIp || "http://"}
                        placeholder={`http://`}
                        minLength={5}
                        maxLength={150}
                        isDisabled={
                          !MediaAksesIntranet ||
                          ApplicationExistingChoosed !== null
                        }
                      />
                    </Flex>
                  </GridItem>
                </Grid>
                <FormHelperText as={"i"} fontSize={"xs"}>
                  Pemilihan Kontektivitas Internet wajib disertai Pentest dan
                  pembelian SSL, Divisi/Unit terkait dimohon menyiapkan
                  anggarannya.*
                </FormHelperText>
                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Jenis Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Text color={"gray.500"} fontSize={"smaller"} pb={1}>
                  Base Aplikasi
                </Text>
                <CheckboxGroup>
                  <Grid templateColumns="repeat(2, 1fr)" gap={1} w={"full"}>
                    {APP_TYPE_OPTIONS.map((item, idx) => (
                      <GridItem
                        key={idx}
                        colSpan={{
                          base: 2,
                          sm: 2,
                          md: 1,
                          lg: 1,
                        }}
                        w={"full"}
                      >
                        <Checkbox
                          key={idx}
                          isChecked={SelectedAppsTypes.includes(item)}
                          onChange={() => handleAppysTypesCheckboxChange(item)}
                          isDisabled={ApplicationExistingChoosed !== null}
                        >
                          {item}
                        </Checkbox>
                      </GridItem>
                    ))}
                  </Grid>
                </CheckboxGroup>
                {hasOtherAppsTypes && (
                  <Flex as={Stack} w={"full"} pt={2}>
                    <Text>Input Lainnya</Text>
                    <OtherInputAppsStringSeparator
                      value={formik.values.appTypeCustom || ""}
                      onChange={(val) => {
                        formik.setFieldValue("appTypeCustom", val);
                      }}
                      isDisabled={ApplicationExistingChoosed !== null}
                    />
                  </Flex>
                )}
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Keterkaitan Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <CheckboxGroup>
                  <Stack spacing={0} h={"full"}>
                    <RadioGroup
                      onChange={(val) =>
                        formik.setFieldValue("appRelatedness", val)
                      }
                      value={formik.values.appRelatedness ?? ""}
                      isDisabled={ApplicationExistingChoosed !== null}
                    >
                      <Flex w={"full"} as={HStack}>
                        <Radio value={APP_RELATED_OPTIONS[0]}>
                          {APP_RELATED_OPTIONS[0]}
                        </Radio>

                        <Radio value={APP_RELATED_OPTIONS[1]}>
                          {APP_RELATED_OPTIONS[1]}
                        </Radio>
                      </Flex>
                    </RadioGroup>
                    {formik.values.appRelatedness == APP_RELATED_OPTIONS[1] && (
                      <Flex as={Stack} w={"full"} pt={2}>
                        <Text>Nama Regulator</Text>
                        <OtherInputAppsStringSeparator
                          value={formik.values.appRelatednessDesc || ""}
                          onChange={(val) => {
                            formik.setFieldValue("appRelatednessDesc", val);
                          }}
                          isDisabled={ApplicationExistingChoosed !== null}
                        />
                      </Flex>
                    )}
                    <FormHelperText as={"i"} fontSize={"xs"}>
                      Jika memilih "Regulator", harap di isi dengan nama
                      instansi.*
                    </FormHelperText>
                  </Stack>
                </CheckboxGroup>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Kategori Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appTransactionals", val)
                  }
                  value={formik.values.appTransactionals ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    {APP_TRANSACTIONAL_OPTIONS.map((item, idx) => (
                      <Radio key={idx} value={item}>
                        {item}
                      </Radio>
                    ))}
                  </Flex>
                </RadioGroup>
                <FormErrorMessage>
                  {formik.errors.appTransactionals}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Waktu Operasional Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) => {
                    formik.setFieldValue("appOperational24hrs", val);
                    if (val === APP_OPERATIONAL_OPTIONS[0]) {
                      formik.setFieldValue(
                        "appOperationalDays",
                        fullDay.join(", ")
                      );
                      formik.setFieldValue("appOperationalHourOpen", "");
                      formik.setFieldValue("appOperationalHourClosed", "");
                    } else {
                      formik.setFieldValue("appOperationalDays", "");
                    }
                  }}
                  value={formik.values.appOperational24hrs ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    {APP_OPERATIONAL_OPTIONS.map((item, idx) => (
                      <Radio key={idx} value={item}>
                        {item}
                      </Radio>
                    ))}
                  </Flex>
                </RadioGroup>

                {formik.values.appOperational24hrs ==
                  APP_OPERATIONAL_OPTIONS[1] && (
                    <Flex as={Stack} w={"full"} py={2}>
                      <Text color={"secondary.500"}>Pilih Hari</Text>
                      <Box
                        pointerEvents={
                          ApplicationExistingChoosed !== null ? "none" : "auto"
                        }
                        opacity={ApplicationExistingChoosed !== null ? 0.6 : 1}
                      >
                        <WeekdaySelector
                          value={OperationalDays}
                          onChange={setOperationalDays}
                        />
                      </Box>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4} w={"full"}>
                        <GridItem
                          colSpan={{
                            base: 2,
                            sm: 2,
                            md: 1,
                            lg: 1,
                          }}
                          w={"full"}
                        >
                          <Stack w={"full"}>
                            <Text color={"secondary.500"}>Operasional Mulai</Text>
                            <Input
                              type="time"
                              id="appOperationalHourOpen"
                              name="appOperationalHourOpen"
                              onChange={formik.handleChange}
                              value={
                                formik.values.appOperationalHourOpen
                                  ? formik.values.appOperationalHourOpen.slice(
                                    0,
                                    5
                                  ) // ensure HH:mm
                                  : ""
                              }
                              isDisabled={ApplicationExistingChoosed !== null}
                            />
                          </Stack>
                        </GridItem>
                        <GridItem
                          colSpan={{
                            base: 2,
                            sm: 2,
                            md: 1,
                            lg: 1,
                          }}
                          w={"full"}
                        >
                          <Stack w={"full"}>
                            <Text color={"secondary.500"}>
                              Operasional Berakhir
                            </Text>
                            <Input
                              type="time"
                              id="appOperationalHourClosed"
                              name="appOperationalHourClosed"
                              onChange={formik.handleChange}
                              value={
                                formik.values.appOperationalHourClosed
                                  ? formik.values.appOperationalHourClosed.slice(
                                    0,
                                    5
                                  ) // ensure HH:mm
                                  : ""
                              }
                              isDisabled={ApplicationExistingChoosed !== null}
                            />
                          </Stack>
                        </GridItem>
                      </Grid>
                    </Flex>
                  )}

                <FormErrorMessage>
                  {formik.errors.appOperational24hrs}
                </FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl
            id="appLiveTargetDate"
            isInvalid={formik.errors.appLiveTargetDate ? true : false}
            isRequired
          >
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Target Live
              </FormLabel>
              <Stack spacing={2} h={"full"}>
                <Input
                  id="appLiveTargetDate"
                  name="appLiveTargetDate"
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.appLiveTargetDate ?? ""}
                  isDisabled={ActionLoading}
                />
                {/* <Text px={2} fontWeight={600}>
                                    {formik.values.appLiveTargetDate
                                      ? getQuarterText(
                                          formik.values.appLiveTargetDate
                                        )
                                      : "-"}
                                  </Text> */}
                <FormErrorMessage>
                  {formik.errors.appLiveTargetDate}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl id="appLiveTargetDateTerbilang" isRequired>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Terbilang Target Live
              </FormLabel>
              <Stack spacing={2} h={"full"}>
                <Text px={2} fontWeight={600}>
                  {formik.values.appLiveTargetDate
                    ? getQuarterText(formik.values.appLiveTargetDate)
                    : "-"}
                </Text>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl id="note" isInvalid={formik.errors.note ? true : false}>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Catatan
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Textarea
                  id="note"
                  name="note"
                  onChange={formik.handleChange}
                  defaultValue={formik.values.note ?? ""}
                  placeholder={`Catatan (Opsional)`}
                  maxLength={300}
                  isDisabled={ActionLoading}
                />
                <FormErrorMessage>{formik.errors.note}</FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <Divider />

          <FormControl id="backlogFeatures">
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Scope Of Work
              </FormLabel>
              <Stack spacing={2} h={"full"}>
                <Flex
                  as={Stack}
                  w={"full"}
                  p={2}
                  border={"1px"}
                  borderColor={colorMode == "light" ? "gray.200" : "gray.600"}
                  boxShadow={"md"}
                  rounded={radiusStyle}
                >
                  <Button
                    w={"full"}
                    leftIcon={<FiPlusCircle />}
                    colorScheme={"secondary"}
                    onClick={() => handleOpenForm()}
                  >
                    Tambah Scope Of Work
                  </Button>

                  <TableComponentFullSm table={table} />
                </Flex>
              </Stack>
            </InputLayoutFull>
          </FormControl>
        </Flex>
      </InputGroupPanel>
      <InputGroupPanel
        headerTitle={`Ringkasan Ruanglingkup ${type_req_param} | Aspek Teknis`}
      >
        <Flex as={Stack} w={"full"} spacing={5}>
          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Target Lokasi Server
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <CheckboxGroup>
                  <Grid templateColumns="repeat(2, 1fr)" gap={1} w={"full"}>
                    {APP_ENV_LOCATION_OPTIONS.map((item, idx) => (
                      <GridItem
                        key={idx}
                        colSpan={{
                          base: 2,
                          sm: 2,
                          md: 1,
                          lg: 1,
                        }}
                        w={"full"}
                      >
                        <Checkbox
                          key={idx}
                          isChecked={SelectedAppsEnvLoc.includes(item)}
                          onChange={() => handleAppysEnvLocCheckboxChange(item)}
                          isDisabled={ApplicationExistingChoosed !== null}
                        >
                          {item}
                        </Checkbox>
                      </GridItem>
                    ))}
                  </Grid>
                </CheckboxGroup>
                {hasOtherEnvLocTypes && (
                  <Flex as={Stack} w={"full"} pt={2}>
                    <Text>Input Lainnya</Text>
                    <OtherInputAppsStringSeparator
                      value={formik.values.appEnvLocationsOthers || ""}
                      onChange={(val) => {
                        formik.setFieldValue("appEnvLocationsOthers", val);
                      }}
                      isDisabled={ApplicationExistingChoosed !== null}
                    />
                  </Flex>
                )}
                <FormHelperText as={"i"} fontSize={"xs"}>
                  Jika server aplikasi ditempatkan di pihak ketiga, harap
                  cantumkan alamat lokasi (Domain/Data Center).*
                </FormHelperText>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Otentikasi UIM Bank bjb
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appPrivateAuth", val)
                  }
                  value={"Y"}
                >
                  <Flex w={"full"} as={HStack}>
                    <Radio value={"Y"}>Ya</Radio>
                    <Radio value={"N"} isDisabled>
                      Tidak
                    </Radio>
                  </Flex>
                </RadioGroup>

                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Keperluan High Availability
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appHightAvailability", val)
                  }
                  value={formik.values.appHightAvailability ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    <Radio value={"Y"}>Ya</Radio>
                    <Radio value={"N"}>Tidak</Radio>
                  </Flex>
                </RadioGroup>

                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Integrasi Dengan Aplikasi Lain
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <InputTagsArea
                  name="appIntegrationOthersApps"
                  value={formik.values.appIntegrationOthersApps || ""}
                  onChange={(val) => {
                    formik.setFieldValue("appIntegrationOthersApps", val);
                  }}
                  isDisabled={ApplicationExistingChoosed !== null}
                />
                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
                <Divider py={1} />
                <Text fontSize={"smaller"} py={2}>
                  Tambah Cepat
                </Text>
                <FormControl>
                  <FormLabel>Rekomendasi Aplikasi Lain / Surrounding</FormLabel>
                  <Flex as={Wrap} w={"full"}>
                    {APP_INTEGRATED_OTHER_APPS.filter((item) => {
                      const existingTags = (
                        formik.values.appIntegrationOthersApps || ""
                      )
                        .split(",")
                        .map((t: string) => t.trim());

                      return !existingTags.includes(item);
                    }).map((item, index) => (
                      <Tag
                        key={index}
                        borderRadius="full"
                        colorScheme="secondary"
                        variant={"solid"}
                        px={3}
                        cursor={"pointer"}
                        _hover={{
                          bg: "secondary.700",
                          color: "white",
                        }}
                        onClick={() => {
                          handleQuickAddTagIntegratedApps(item);
                        }}
                      >
                        <FiPlus />
                        <TagLabel pl={1}>{item}</TagLabel>
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>
              </Stack>
            </InputLayoutFull>
          </FormControl>
        </Flex>
      </InputGroupPanel>

      {/* App Picker Modal */}
      <AppPickerModal
        isOpen={ModalAppPicker.isOpen}
        onClose={ModalAppPicker.onClose}
        selectedApp={selectedApp}
        onAppSelect={(app) => {
          setSelectedApp(app);
          if (app) {
            formik.setFieldValue("appInitialCode", app.appShortName);
            SelectedApp(app);
          }
          ModalAppPicker.onClose();
        }}
        tokenData={tokenData}
      />
    </Flex>
  );
};

interface Section4RFCProps {
  type_req_param: "RFC";
  formik: any;
  ActionLoading: boolean;
  DataBackLogs: ReqBacklogPayload[];
  setDataBackLogs: React.Dispatch<React.SetStateAction<ReqBacklogPayload[]>>;
  ModalAppPicker: any;
  selectedApp: ApplicationMasterResponse | null;
  setSelectedApp: React.Dispatch<
    React.SetStateAction<ApplicationMasterResponse | null>
  >;
  tokenData: string;
  hasProjects: boolean;
  isEditMode: boolean;
  isAppSelectionDisabled: () => boolean;
}

interface BacklogChangesData {
  backlog: BacklogDataResponse;
  changes?: ReqBacklogPayload | null;
  showKondisiEksisting?: boolean;
}

const EmptyBacklogChangesData: BacklogChangesData = {
  backlog: {
    id: "",
    reqId: "",
    backlogCode: "",
    backlogName: "",
    backlogDesc: null,
    envSide: null,
    maintenanceCategory: null,
    maintenanceType: null,
    rppb: "",
    licensing: "",
    backogRegistered: "",
    backlogStartdate: "",
    backlogEnddate: "",
    urgency: "",
    impact: "",
    priority: "",
    developmentStatus: "",
    progressionPercentage: 0,
    backlogImplementStartdate: null,
    backlogImplementEnddate: null,
    reffId: null,
    projectId: null,
    version: "",
    note: null,
    isLive: "",
    appsId: "",
    posOrder: 0,
    createdAt: "",
    createdBy: "",
    updatedAt: "",
    updatedBy: "",
  },
  changes: null,
  showKondisiEksisting: true,
};

// STEP 4 SECTION RFC
const Section4RFCView = ({
  type_req_param,
  formik,
  ActionLoading,
  DataBackLogs,
  ModalAppPicker,
  selectedApp,
  setSelectedApp,
  setDataBackLogs,
  tokenData,
  hasProjects,
  isEditMode,
  isAppSelectionDisabled,
}: Section4RFCProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List: ListApps } = useApps();
  const { GetReqParentAppsByAppsId, ListBacklog, GetDetailBacklogById } =
    useRequirements();

  // Generate local ID for client-side tracking (same as BRD)
  const generateLocalId = () => {
    return `local-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const movePriority = (backlogId: string, direction: "up" | "down") => {
    const currentIndex = DataBackLogs.findIndex(
      (item) => item.backlogId === backlogId || item.localId === backlogId
    );
    if (currentIndex === -1) return;

    const newData = [...DataBackLogs];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newData.length) return;

    // Swap posOrder values
    const temp = newData[currentIndex].posOrder;
    newData[currentIndex].posOrder = newData[targetIndex].posOrder;
    newData[targetIndex].posOrder = temp;

    // Swap positions in array
    [newData[currentIndex], newData[targetIndex]] = [
      newData[targetIndex],
      newData[currentIndex],
    ];

    setDataBackLogs(newData);

    showToast({
      description: "Urutan Scope of Work berhasil diubah",
      statusToast: "success",
    });
  };

  // Backlog Setup
  // NEW BACKLOG RFC

  const [BacklogChanges, setBacklogChanges] = useState<BacklogChangesData[]>(
    []
  );
  const [BacklogApps, setBacklogApps] = useState<BacklogDataResponse[]>([]);
  const [BacklogAppsOption, setBacklogAppsOption] = useState<OptionListProps[]>(
    []
  );

  // Populate BacklogChanges from BacklogApps when draft is loaded
  useEffect(() => {
    if (BacklogApps.length > 0 && BacklogChanges.length === 0) {
      const backlogChangesData: BacklogChangesData[] = [];
      const backlogMap = new Map<string, BacklogDataResponse>();

      // Create map of all backlogs
      BacklogApps.forEach((b: BacklogDataResponse) => {
        backlogMap.set(b.id, b);
      });

      // Group backlogs by parent-child relationship
      BacklogApps.forEach((b: BacklogDataResponse) => {
        if (b.reffId) {
          // This is a change (child) - has existing parent-child relationship
          // First try to get parent from reffData (from backend), then from backlogMap
          const parentBacklog = b.reffData || backlogMap.get(b.reffId);
          if (parentBacklog) {
            // Find if parent already exists in backlogChangesData
            let existingEntry = backlogChangesData.find(
              (entry) => entry.backlog.id === parentBacklog.id
            );

            if (!existingEntry) {
              // Create new entry with parent in Kondisi Existing, child in Perubahan Sistem
              backlogChangesData.push({
                backlog: parentBacklog,
                changes: {
                  localId: b.id.startsWith("local-") ? b.id : undefined,
                  backlogId: b.id.startsWith("local-") ? null : b.id,
                  backlogName: b.backlogName,
                  backlogDesc: b.backlogDesc || "",
                  note: b.note || "",
                  posOrder: b.posOrder || 1,
                },
                showKondisiEksisting: true,
              });
            } else {
              // Update existing entry with changes
              existingEntry.changes = {
                localId: b.id.startsWith("local-") ? b.id : undefined,
                backlogId: b.id.startsWith("local-") ? null : b.id,
                backlogName: b.backlogName,
                backlogDesc: b.backlogDesc || "",
                note: b.note || "",
                posOrder: b.posOrder || 1,
              };
            }
          }
        } else {
          // Standalone backlog (no parent) - user toggled OFF "Tampilkan Kondisi Eksisting"
          backlogChangesData.push({
            backlog: {
              id: "NEW_SCOPE",
              reqId: "",
              backlogCode: "",
              backlogName: "",
              backlogDesc: null,
              envSide: null,
              maintenanceCategory: null,
              maintenanceType: null,
              rppb: "",
              licensing: "",
              backogRegistered: null,
              backlogStartdate: null,
              backlogEnddate: null,
              urgency: "",
              impact: "",
              priority: "",
              developmentStatus: "",
              progressionPercentage: 0,
              backlogImplementStartdate: null,
              backlogImplementEnddate: null,
              reffId: null,
              projectId: null,
              note: null,
              version: "",
              isLive: "",
              appsId: "",
              posOrder: 0,
              createdAt: "",
              createdBy: "",
              updatedAt: null,
              updatedBy: "",
            },
            changes: {
              localId: b.id.startsWith("local-") ? b.id : undefined,
              backlogId: b.id.startsWith("local-") ? null : b.id,
              backlogName: b.backlogName,
              backlogDesc: b.backlogDesc || "",
              note: b.note || "",
              posOrder: b.posOrder || 1,
            },
            showKondisiEksisting: false, // Toggle is OFF
          });
        }
      });

      console.log(
        "Populated BacklogChanges from BacklogApps:",
        backlogChangesData
      );
      setBacklogChanges(backlogChangesData);
    }
  }, [BacklogApps]);
  // Populate BacklogApps from DataBackLogs when draft is loaded (for RFC)
  useEffect(() => {
    if (
      DataBackLogs.length > 0 &&
      BacklogApps.length === 0 &&
      type_req_param === "RFC"
    ) {
      // Convert DataBackLogs to BacklogDataResponse format
      const backlogAppsData: BacklogDataResponse[] = DataBackLogs.map((b) => ({
        id: b.backlogId || b.localId || "",
        reqId: "",
        backlogCode: "",
        backlogName: b.backlogName,
        backlogDesc: b.backlogDesc || "",
        envSide: null,
        maintenanceCategory: null,
        maintenanceType: null,
        rppb: "",
        licensing: "",
        backogRegistered: null,
        backlogStartdate: null,
        backlogEnddate: null,
        urgency: "",
        impact: "",
        priority: "",
        developmentStatus: "",
        progressionPercentage: 0,
        backlogImplementStartdate: null,
        backlogImplementEnddate: null,
        reffId: b.parentBacklogId || null,
        projectId: null,
        note: b.note || "",
        version: "",
        isLive: "N",
        appsId: "",
        posOrder: b.posOrder || 1,
        createdAt: new Date().toISOString(),
        createdBy: "",
        updatedAt: null,
        updatedBy: "",
        reffData: b.reffData || null,
      }));
      console.log("Populated BacklogApps from DataBackLogs:", backlogAppsData);
      setBacklogApps(backlogAppsData);
    }
  }, [DataBackLogs, type_req_param]);
  useEffect(() => {
    console.log("BacklogChanges before conversion:", BacklogChanges);
    const updatedBacklogData: ReqBacklogPayload[] = BacklogChanges.map(
      (dt) => ({
        localId: dt.changes?.localId,
        id: dt.changes?.backlogId || undefined, // Backend expects 'id' field
        backlogId: dt.changes?.backlogId || null,
        parentBacklogId: dt.backlog.id === "NEW_SCOPE" ? null : dt.backlog.id,
        backlogName:
          dt.backlog.id === "NEW_SCOPE"
            ? dt.backlog.backlogName || dt.changes?.backlogName || ""
            : dt.changes?.backlogName || "",
        backlogDesc:
          dt.backlog.id === "NEW_SCOPE"
            ? dt.backlog.backlogDesc || dt.changes?.backlogDesc || ""
            : dt.changes?.backlogDesc || "",
        note:
          dt.backlog.id === "NEW_SCOPE"
            ? dt.backlog.note || dt.changes?.note || ""
            : dt.changes?.note || "",
        posOrder: dt.changes?.posOrder || DataBackLogs.length + 1,
      })
    );

    // Sort by posOrder
    const sortedBacklogData = updatedBacklogData.sort(
      (a, b) => a.posOrder - b.posOrder
    );
    console.log("Converted to formik.backlogFeatures:", sortedBacklogData);
    console.log(
      "IDs being sent:",
      sortedBacklogData.map((b) => ({
        id: b.id,
        backlogId: b.backlogId,
        localId: b.localId,
        name: b.backlogName,
      }))
    );
    formik.setFieldValue("backlogFeatures", sortedBacklogData);

    // setBacklogData(updatedBacklogData);
  }, [BacklogChanges, DataBackLogs]);

  const GetListBacklog = async (
    searchValue: string = "",
    limit: number = 1,
    whereData: ListSearchByParam[]
  ) => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: whereData,
      fieldOrder: ["backlogName"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListBacklog(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setBacklogChanges([]);
      // return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setBacklogChanges([]);
        // return [];
      }

      const itemsData: BacklogDataResponse[] =
        requestData.data as BacklogDataResponse[];

      // const mappedData: BacklogChangesData[] = itemsData.map((item) => ({
      //   backlog: item,
      //   changes: null, // or undefined if you prefer
      // }));

      const OptionData: OptionListProps[] = itemsData.map((dt) => ({
        label: dt.backlogName,
        value: dt.id,
      }));

      // setBacklogChanges(mappedData);

      setBacklogApps(itemsData);
      setBacklogAppsOption(OptionData);
    }
  };

  // End Backlog setup

  // Choose Aplication existing
  const [ListDataAplicationExisting, setListDataAplicationExisting] = useState<
    ApplicationMasterResponse[]
  >([]);
  const [ApplicationExistingChoosed, setApplicationExistingChoosed] =
    useState<ApplicationMasterResponse | null>(null);
  const [SearchAppsText, setSearchAppsText] = useState<string>("");

  // Sync ApplicationExistingChoosed when selectedApp is loaded and update form with latest master data
  useEffect(() => {
    if (selectedApp && !ApplicationExistingChoosed) {
      setApplicationExistingChoosed(selectedApp);

      // Update form fields with latest master application data
      formik.setFieldValue("appInitialCode", selectedApp.appShortName);
      formik.setFieldValue("appInitialName", selectedApp.appName);
      formik.setFieldValue("appTargetUsers", selectedApp.appTargetUsers);

      if (selectedApp.appAccessFrontsiteDns) {
        setMediaAksesPublic(true);
      }
      formik.setFieldValue(
        "appAccessFrontsiteDns",
        selectedApp.appAccessFrontsiteDns
      );
      formik.setFieldValue(
        "appAccessFrontsiteIp",
        selectedApp.appAccessFrontsiteIp
      );
      formik.setFieldValue(
        "appAccessBacksiteDns",
        selectedApp.appAccessBacksiteDns
      );

      if (selectedApp.appAccessBacksiteIp) {
        setMediaAksesIntranet(true);
      }
      formik.setFieldValue(
        "appAccessBacksiteIp",
        selectedApp.appAccessBacksiteIp
      );

      if (selectedApp.appTypes) {
        setSelectedAppsTypes(selectedApp.appTypes);
      }
      formik.setFieldValue("appTypeCustom", selectedApp.appTypeCustom);
      formik.setFieldValue("appRelatedness", selectedApp.appRelatedness);
      formik.setFieldValue(
        "appRelatednessDesc",
        selectedApp.appRelatednessDesc
      );
      formik.setFieldValue("appTransactionals", selectedApp.appTransactionals);
      formik.setFieldValue(
        "appOperational24hrs",
        selectedApp.appOperational24hrs
      );

      if (selectedApp.appOperationalDays) {
        setOperationalDays(selectedApp.appOperationalDays);
      }
      formik.setFieldValue(
        "appOperationalDays",
        selectedApp.appOperationalDays
      );
      formik.setFieldValue(
        "appOperationalHourOpen",
        selectedApp.appOperationalHourOpen
      );
      formik.setFieldValue(
        "appOperationalHourClosed",
        selectedApp.appOperationalHourClosed
      );

      if (selectedApp.appEnvLocations) {
        setSelectedAppsEnvLoc(selectedApp.appEnvLocations);
      }
      formik.setFieldValue("appEnvLocations", selectedApp.appEnvLocations);
      formik.setFieldValue(
        "appEnvLocationsOthers",
        selectedApp.appEnvLocationsOthers
      );
      formik.setFieldValue("appPrivateAuth", selectedApp.appPrivateAuth);
      formik.setFieldValue(
        "appHightAvailability",
        selectedApp.appHightAvailability
      );
      formik.setFieldValue(
        "appIntegrationOthersApps",
        selectedApp.appIntegrationOthersApps
      );
    }
  }, [selectedApp]);

  // Load BacklogAppsOption when ApplicationExistingChoosed is set (from draft)
  useEffect(() => {
    const loadBacklogOptions = async () => {
      if (ApplicationExistingChoosed && tokenData) {
        console.log(
          "Loading backlog options for app:",
          ApplicationExistingChoosed.id
        );
        const WhereParams: ListSearchByParam[] = [
          {
            field: "appsId",
            operator: "=",
            value: ApplicationExistingChoosed.id,
          },
        ];
        await GetListBacklog("", MAX_SIZE_TABLE, WhereParams);
      }
    };
    loadBacklogOptions();
  }, [ApplicationExistingChoosed, tokenData]);
  const GetDataApplications = async (
    searchValue: string = "",
    limit: number = 1
  ) => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [],
      fieldOrder: ["appShortName"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListApps(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return;
      }

      const itemsData: ApplicationMasterResponse[] =
        requestData.data as ApplicationMasterResponse[];

      setListDataAplicationExisting(itemsData);

      return;
    }
  };

  const SelectedApp = async (data: ApplicationMasterResponse) => {
    console.log(data);
    if (ApplicationExistingChoosed != null) {
      setApplicationExistingChoosed(null);
      setBacklogAppsOption([]);
      setBacklogChanges([]);
      setSelectedAppsTypes("");
      setOperationalDays("");
      setSelectedAppsEnvLoc("");
      setMediaAksesPublic(false);
      setMediaAksesIntranet(false);
      formik.setFieldValue("appInitialCode", null);
      formik.setFieldValue("appInitialName", null);
      formik.setFieldValue("appTargetUsers", "INTERNAL");
      formik.setFieldValue("appAccessFrontsiteDns", null);

      formik.setFieldValue("appAccessFrontsiteIp", null);
      formik.setFieldValue("appAccessBacksiteDns", null);
      formik.setFieldValue("appAccessBacksiteIp", null);

      formik.setFieldValue("backlogChange", null);
      formik.setFieldValue("appAccessMedia", null);
      formik.setFieldValue("appTypes", null);
      formik.setFieldValue("appTypeCustom", null);
      formik.setFieldValue("appRelatedness", null);
      formik.setFieldValue("appRelatednessDesc", null);
      formik.setFieldValue("appTransactionals", null);
      formik.setFieldValue("appOperational24hrs", null);
      formik.setFieldValue("appOperationalDays", null);
      formik.setFieldValue("appOperationalHourOpen", null);
      formik.setFieldValue("appOperationalHourClosed", null);
      formik.setFieldValue("appLiveTargetDate", null);

      formik.setFieldValue("appEnvLocations", "");
      formik.setFieldValue("appEnvLocationsOthers", "");
      formik.setFieldValue("appPrivateAuth", "Y");
      formik.setFieldValue("appHightAvailability", "Y");
      formik.setFieldValue("appIntegrationOthersApps", "");
    }
    // if (data.requirementData == null) {
    //   setApplicationExistingChoosed(null);
    //   setBacklogAppsOption([]);
    //   setBacklogChanges([]);
    //   setSelectedAppsTypes("");
    //   setOperationalDays("");
    //   setSelectedAppsEnvLoc("");
    //   setMediaAksesPublic(false);
    //   setMediaAksesIntranet(false);
    //   formik.setFieldValue("appInitialCode", null);
    //   formik.setFieldValue("appInitialName", null);
    //   showToast({
    //     description: "Aplikasi belum mempunyai BRD",
    //     statusToast: "warning",
    //   });
    //   return;
    // }

    // if (data.countProjectAll == 0 || data.countProjectOnGoing > 0) {
    //   setApplicationExistingChoosed(null);
    //   setBacklogAppsOption([]);
    //   setBacklogChanges([]);
    //   setSelectedAppsTypes("");
    //   setOperationalDays("");
    //   setSelectedAppsEnvLoc("");
    //   setMediaAksesPublic(false);
    //   setMediaAksesIntranet(false);
    //   formik.setFieldValue("appInitialCode", null);
    //   formik.setFieldValue("appInitialName", null);
    //   showToast({
    //     description: `Aplikasi masih memiliki ${data.countProjectOnGoing} project berjalan`,
    //     statusToast: "warning",
    //   });
    //   return;
    // }

    setApplicationExistingChoosed(data);
    formik.setFieldValue("appInitialCode", data.appShortName);
    formik.setFieldValue("appInitialName", data.appName);

    formik.setFieldValue("appTargetUsers", data.appTargetUsers);
    if (data.appAccessFrontsiteDns) {
      setMediaAksesPublic(true);
    }
    formik.setFieldValue("appAccessFrontsiteDns", data.appAccessFrontsiteDns);
    formik.setFieldValue("appAccessFrontsiteIp", data.appAccessFrontsiteIp);
    formik.setFieldValue("appAccessBacksiteDns", data.appAccessBacksiteDns);
    if (data.appAccessBacksiteIp) {
      setMediaAksesIntranet(true);
    }
    formik.setFieldValue("appAccessBacksiteIp", data.appAccessBacksiteIp);

    formik.setFieldValue("backlogChange", null);
    formik.setFieldValue("appAccessMedia", data.appAccessMedia);
    formik.setFieldValue("appTypes", data.appTypes);
    formik.setFieldValue("appTypeCustom", data.appTypeCustom);
    formik.setFieldValue("appRelatedness", data.appRelatedness);
    formik.setFieldValue("appRelatednessDesc", data.appRelatednessDesc);
    formik.setFieldValue("appTransactionals", data.appTransactionals);
    formik.setFieldValue("appOperational24hrs", data.appOperational24hrs);
    formik.setFieldValue("appOperationalDays", data.appOperationalDays);
    formik.setFieldValue("appOperationalHourOpen", data.appOperationalHourOpen);
    formik.setFieldValue(
      "appOperationalHourClosed",
      data.appOperationalHourClosed
    );
    formik.setFieldValue("appLiveTargetDate", null);

    formik.setFieldValue("appEnvLocations", data.appEnvLocations);
    formik.setFieldValue("appEnvLocationsOthers", data.appEnvLocationsOthers);
    formik.setFieldValue("appPrivateAuth", data.appPrivateAuth);
    formik.setFieldValue("appHightAvailability", data.appHightAvailability);
    formik.setFieldValue(
      "appIntegrationOthersApps",
      data.appIntegrationOthersApps
    );

    setSelectedAppsTypes(data.appTypes || "");
    setOperationalDays(data.appOperationalDays || "");
    setSelectedAppsEnvLoc(data.appEnvLocations || "");

    const WhereParams: ListSearchByParam[] = [
      {
        field: "appsId",
        operator: "=",
        value: data.id,
      },
      //         {
      //           field: "isLive",
      //           operator: "=",
      //           value: "Y",
      //         },
      //         {
      //           field: "developmentStatus",
      //           operator: "=",
      //           value: "DONE",
      //         },
    ];

    await GetListBacklog("", MAX_SIZE_TABLE, WhereParams);
  };

  const handleBacklogChange = (
    selectedOption: OptionListProps | null,
    index: number
  ) => {
    if (!selectedOption?.value) return;

    // Handle NEW_SCOPE selection
    if (selectedOption.value === "NEW_SCOPE") {
      console.log("NEW_SCOPE selected, setting id to NEW_SCOPE");
      setBacklogChanges((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
              ...item,
              backlog: {
                ...item.backlog,
                id: "NEW_SCOPE",
                backlogName: "",
                backlogDesc: "",
                note: "",
              },
              changes: {
                localId: item.changes?.localId || generateLocalId(),
                backlogId: null,
                backlogName: "",
                posOrder: 1,
              },
            }
            : item
        )
      );
      return;
    }

    const choosedFeature = BacklogApps.find(
      (x) => x.id === selectedOption.value
    );

    if (!choosedFeature) return;

    setBacklogChanges((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            backlog: choosedFeature,
            changes: {
              localId: item.changes?.localId || generateLocalId(),
              backlogId: null,
              backlogName: selectedOption.label,
              posOrder: 1,
            },
          }
          : item
      )
    );
  };

  const handleRemoveBacklogChange = (indexToRemove: number) => {
    setBacklogChanges((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleChangeAppCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyAlphabets = e.target.value
      .replace(/[^a-zA-Z ]/g, "")
      .toUpperCase();
    // formik.setFieldValue("appInitialCode", onlyAlphabets);
    setSearchAppsText(onlyAlphabets);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (onlyAlphabets.length >= 2) {
        GetDataApplications(onlyAlphabets, 4);
      } else {
        setListDataAplicationExisting([]);
        // formik.setFieldValue("appInitialName", "");
        setSearchAppsText("");
      }
    }, 300);
  };
  // End - Choose Aplication existing

  // APP TYPES OPTIONS HANDLER

  const [SelectedAppsTypes, setSelectedAppsTypes] = useState<string>("");

  const handleAppysTypesCheckboxChange = (value: string) => {
    const currentList = SelectedAppsTypes.split(",")
      .map((item) => item.trim())
      .filter(Boolean); // removes empty strings

    let updatedList: string[];

    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    setSelectedAppsTypes(
      updatedList.join(", ") + (updatedList.length > 0 ? "," : "")
    );
  };

  const hasOtherAppsTypes = SelectedAppsTypes.split(",")
    .map((s) => s.trim().toLowerCase())
    .includes("other");

  // END APP TYPES OPTIONS HANDLER

  // APPS OPERATIONAL STATE
  const [OperationalDays, setOperationalDays] = useState<string>("");

  // END APPS OPERATIONAL STATE

  // APP ENV LOC OPTIONS HANDLER

  const [SelectedAppsEnvLoc, setSelectedAppsEnvLoc] = useState<string>("");

  const handleAppysEnvLocCheckboxChange = (value: string) => {
    const currentList = SelectedAppsEnvLoc.split(",")
      .map((item) => item.trim())
      .filter(Boolean); // removes empty strings

    let updatedList: string[];

    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    setSelectedAppsEnvLoc(
      updatedList.join(", ") + (updatedList.length > 0 ? "," : "")
    );
  };

  const hasOtherEnvLocTypes = SelectedAppsEnvLoc.split(",")
    .map((s) => s.trim().toLowerCase())
    .includes("other");

  // END APP ENV LOC OPTIONS HANDLER

  useEffect(() => {
    formik.setFieldValue("appTypes", SelectedAppsTypes);
    formik.setFieldValue("appOperationalDays", OperationalDays);
    formik.setFieldValue("appEnvLocations", SelectedAppsEnvLoc);
    // if (formik.values.appOperational24hrs == APP_OPERATIONAL_OPTIONS[0]) {
    //   formik.setFieldValue("appOperationalDays", "");
    // }

    if (!hasOtherAppsTypes) {
      formik.setFieldValue("appRelatednessDesc", "");
    }
    if (!hasOtherEnvLocTypes) {
      formik.setFieldValue("appEnvLocationsOthers", "");
    }
  }, [SelectedAppsTypes, OperationalDays, SelectedAppsEnvLoc]);

  const handleQuickAddTagIntegratedApps = (tag: string) => {
    const currentValue = formik.values.appIntegrationOthersApps || "";

    const currentTags = currentValue
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    if (!currentTags.includes(tag)) {
      const updated = [...currentTags, tag].join(", ");
      formik.setFieldValue("appIntegrationOthersApps", updated);
    }
  };

  // APP MEDIA AKSES
  const [MediaAksesPublic, setMediaAksesPublic] = useState(false);
  const [MediaAksesIntranet, setMediaAksesIntranet] = useState(false);
  // Sort DataBackLogs by posOrder
  const sortedDataBackLogs = [...DataBackLogs].sort(
    (a, b) => a.posOrder - b.posOrder
  );

  return (
    <Flex as={Stack} w={"full"} spacing={5}>
      {/* SECTION STRAT */}
      <InputGroupPanel
        headerTitle={`Ringkasan Ruanglingkup ${type_req_param} | Aspek Bisnis`}
      >
        <Flex as={Stack} w={"full"} spacing={5}>
          <FormControl
            id="appInitialCode"
            isInvalid={formik.errors.appInitialCode ? true : false}
          >
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Cari Aplikasi Eksisting
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <HStack spacing={2}>
                  <Input
                    id="appInitialCodeSearch"
                    name="appInitialCodeSearch"
                    type="text"
                    onChange={handleChangeAppCode}
                    value={SearchAppsText}
                    placeholder={`CMS / SISMON / dsb.`}
                    minLength={3}
                    // maxLength={10}
                    isDisabled={ActionLoading}
                    isReadOnly
                  />
                  <Button
                    colorScheme="blue"
                    size="md"
                    onClick={() => ModalAppPicker.onOpen()}
                    isDisabled={ActionLoading || isAppSelectionDisabled()}
                  >
                    Pilih Aplikasi
                  </Button>
                  {isAppSelectionDisabled() && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      Aplikasi tidak dapat diubah karena requirement sudah terdaftar dalam proyek
                    </Text>
                  )}
                </HStack>
                <Box
                  w={"full"}
                  py={2}
                  px={4}
                  mt={2}
                  bgColor={"gray.200"}
                  rounded={radiusStyle}
                  as={Wrap}
                  display={
                    ListDataAplicationExisting.length > 0 ? "block" : "none"
                  }
                >
                  <Heading as="h4" size="sm">
                    Pilih Aplikasi Existing
                  </Heading>
                  <Flex w="full" overflowX="auto">
                    <HStack spacing={4} minW="max-content">
                      {/* APP LIST */}
                      {ListDataAplicationExisting.length > 0 &&
                        ListDataAplicationExisting.map((ap, idx) => (
                          <AppicationShowCase
                            key={idx}
                            dataApp={ap}
                            SelectedApp={SelectedApp}
                            isActive={
                              formik.values.appInitialCode == ap.appCode
                            }
                          />
                        ))}
                    </HStack>
                  </Flex>
                </Box>
                <Box
                  w={"full"}
                  overflowY={"auto"}
                  overflowX={"auto"}
                  h={"350px"}
                  p={4}
                  mt={2}
                  bgColor={"gray.200"}
                  rounded={radiusStyle}
                  display={"none"}
                >
                  <Text fontWeight={600}>Data Apps</Text>
                  <pre>
                    {JSON.stringify(ListDataAplicationExisting, null, 2)}
                  </pre>
                </Box>
                <FormErrorMessage>
                  {formik.errors.appInitialCode}
                </FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <Input
            id="appName"
            name="appName"
            type="hidden"
            onChange={formik.handleChange}
            value={formik.values.appInitialCode ?? ""}
            isDisabled={true}
            readOnly={true}
          />
          <Input
            id="appInitialInitials"
            name="appInitialInitials"
            type="hidden"
            value={formik.values.appInitialName ?? ""}
            isDisabled={true}
            readOnly={true}
          />
          <Box
            overflowY={"auto"}
            overflowX={"auto"}
            maxH={"350px"}
            p={2}
            bgColor={"gray.200"}
            display={"none"}
          >
            <pre>{JSON.stringify(ApplicationExistingChoosed, null, 2)}</pre>
          </Box>

          {ApplicationExistingChoosed && (
            <Flex
              w={"full"}
              as={Stack}
              justifyContent={"center"}
              alignItems={"center"}
              rounded={radiusStyle}
              border={"1px"}
              borderColor={colorMode == "light" ? "gray.200" : "gray.700"}
              transition="transform 0.2s ease-in-out, background-color 0.2s ease, box-shadow 0.2s ease-in-out" // Animate transform and box-shadow
              bgGradient={"linear(to-br, secondary.800, secondary.500)"}
              color={"white"}
              p={4}
              spacing={5}
            >
              <Heading as="h5" size="sm">
                Aplikasi Eksisting
              </Heading>
              {/* ICON APP */}
              <Flex
                position="relative"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                backgroundSize="cover"
                backgroundImage={`url(/img/default-apps.jpg)`}
                rounded={"100%"}
                color={"white"}
                w={"80px"}
                h={"80px"}
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                fontWeight="bold"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                flexShrink={0}
                boxShadow={"md"}
              />
              <Flex h={"full"} as={Stack} alignItems={"start"} spacing={1}>
                <Flex as={HStack}>
                  <Badge
                    colorScheme="gray"
                    fontSize={"medium"}
                    px={3}
                    rounded={"md"}
                  >
                    {ApplicationExistingChoosed.appShortName}
                  </Badge>
                  <Heading as="h4" size="md">
                    {ApplicationExistingChoosed.appName.toUpperCase()}
                  </Heading>
                </Flex>
              </Flex>
            </Flex>
          )}
          <InputGroupPanel headerTitle={`Perubahan Sistem`}>
            <Flex
              w={"full"}
              as={Stack}
              divider={<StackDivider borderColor="gray.200" />}
            >
              {BacklogChanges.map((item, index) => (
                <Grid
                  templateColumns={
                    item.showKondisiEksisting ? "repeat(2, 1fr)" : "1fr"
                  }
                  gap={4}
                  w={"full"}
                  key={index}
                >
                  <GridItem colSpan={2} w={"full"}>
                    <Flex
                      as={HStack}
                      w={"full"}
                      justifyContent={"space-between"}
                    >
                      <Heading as="h5" size="sm">
                        Scope - {index + 1}
                      </Heading>
                      <HStack spacing={2}>
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            Tampilkan Kondisi Eksisting
                          </Text>
                          <Switch
                            isChecked={item.showKondisiEksisting ?? true}
                            onChange={(e) => {
                              const updated = BacklogChanges.map((item, i) =>
                                i === index
                                  ? {
                                    ...item,
                                    showKondisiEksisting: e.target.checked,
                                  }
                                  : item
                              );
                              setBacklogChanges(updated);
                            }}
                            colorScheme="blue"
                            size="sm"
                          />
                        </HStack>
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<FiMinusCircle />}
                          onClick={() => handleRemoveBacklogChange(index)}
                        >
                          Hapus
                        </Button>
                      </HStack>
                    </Flex>
                  </GridItem>
                  {item.showKondisiEksisting && (
                    <GridItem
                      colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                      w={"full"}
                    >
                      <Flex
                        as={Stack}
                        w={"full"}
                        p={5}
                        rounded={radiusStyle}
                        border={"2px"}
                        borderColor={
                          colorMode == "light" ? "gray.200" : "gray.700"
                        }
                        spacing={2}
                        boxShadow={"md"}
                        minH={"280px"}
                      >
                        <Flex
                          w={"full"}
                          as={HStack}
                          justifyContent={"space-between"}
                        >
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
                              Scope of Work
                            </FormLabel>
                            <Stack spacing={0}>
                              <Select
                                id={`backlogExisting-${1}`}
                                options={[
                                  /* { label: "Scope yang belum ada di memo", value: "NEW_SCOPE" }, */ ...BacklogAppsOption.filter(
                                  (opt) =>
                                    !BacklogChanges.some(
                                      (b) => b.backlog.id === opt.value
                                    )
                                ),
                                ]}
                                isSearchable={true}
                                value={
                                  item.backlog.id === "NEW_SCOPE"
                                    ? {
                                      label: "Scope yang belum ada di memo",
                                      value: "NEW_SCOPE",
                                    }
                                    : BacklogAppsOption.find(
                                      (x) => x.value === item.backlog.id
                                    )
                                }
                                onChange={(e) => handleBacklogChange(e, index)}
                                placeholder={"Piih Scope of Work Eksisting"}
                              />
                              <FormErrorMessage>
                                {formik.errors.senderDivisionId}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                        <FormControl>
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Deskripsi
                            </FormLabel>
                            <Stack spacing={0}>
                              <Textarea
                                id={`backlogExistingDesc-${1}`}
                                name={`backlogExistingDesc-${1}`}
                                onChange={(e) => {
                                  const updated = [...BacklogChanges];
                                  updated[index].backlog.backlogDesc =
                                    e.target.value;
                                  setBacklogChanges(updated);
                                }}
                                placeholder={`Deskripsi Scope Eksisting`}
                                value={item.backlog.backlogDesc || ""}
                                isDisabled={item.backlog.id !== "NEW_SCOPE"}
                              // maxLength={300}
                              />
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                        <FormControl>
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Catatan
                            </FormLabel>
                            <Stack spacing={0}>
                              <Textarea
                                id={`backlogExistingNote-${1}`}
                                name={`backlogExistingNote-${1}`}
                                onChange={(e) => {
                                  const updated = [...BacklogChanges];
                                  updated[index].backlog.note = e.target.value;
                                  setBacklogChanges(updated);
                                }}
                                value={item.backlog.note || ""}
                                placeholder={`Deskripsi Scope Eksisting`}
                                isDisabled={item.backlog.id !== "NEW_SCOPE"}
                              />
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>
                      </Flex>
                    </GridItem>
                  )}
                  <GridItem
                    colSpan={
                      item.showKondisiEksisting
                        ? { base: 2, sm: 2, md: 1, lg: 1 }
                        : { base: 2, sm: 2, md: 2, lg: 2 }
                    }
                    w={"full"}
                  >
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
                      <Flex
                        w={"full"}
                        as={HStack}
                        justifyContent={"space-between"}
                      >
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
                            Scope Of Work
                          </FormLabel>
                          <Stack spacing={0}>
                            <Input
                              id={`backlogChanges-${1}`}
                              name={`backlogChanges-${1}`}
                              type="text"
                              placeholder={`Nama Scope Perubahan`}
                              value={item.changes?.backlogName ?? ""}
                              onChange={(e) => {
                                const updated = [...BacklogChanges];
                                if (!updated[index].changes)
                                  updated[index].changes = {
                                    localId: generateLocalId(),
                                    backlogId: null,
                                    backlogName: "",
                                    backlogDesc: "",
                                    note: "",
                                    posOrder: 1,
                                  };
                                updated[index].changes!.backlogName =
                                  e.target.value;
                                setBacklogChanges(updated);
                              }}
                              minLength={4}
                              maxLength={200}
                            />
                          </Stack>
                        </InputLayoutFull>
                      </FormControl>
                      <FormControl>
                        <InputLayoutFull>
                          <FormLabel h={"full"} mt={2}>
                            Deskripsi
                          </FormLabel>
                          <Stack spacing={0}>
                            <Textarea
                              id={`backlogChangesDesc-${1}`}
                              name={`backlogChangesDesc-${1}`}
                              value={item.changes?.backlogDesc ?? ""}
                              onChange={(e) => {
                                const updated = [...BacklogChanges];
                                if (!updated[index].changes)
                                  updated[index].changes = {
                                    localId: generateLocalId(),
                                    backlogId: null,
                                    backlogName: "",
                                    backlogDesc: "",
                                    note: "",
                                    posOrder: 1,
                                  };
                                updated[index].changes!.backlogDesc =
                                  e.target.value;
                                setBacklogChanges(updated);
                              }}
                              placeholder={`Deskripsi Scope Perubahan`}
                            // maxLength={300}
                            // isDisabled={ActionLoading}
                            />
                          </Stack>
                        </InputLayoutFull>
                      </FormControl>
                      <FormControl>
                        <InputLayoutFull>
                          <FormLabel h={"full"} mt={2}>
                            Catatan
                          </FormLabel>
                          <Stack spacing={0}>
                            <Textarea
                              id={`backlogChangesNote-${1}`}
                              name={`backlogChangesNote-${1}`}
                              value={item.changes?.note ?? ""}
                              onChange={(e) => {
                                const updated = [...BacklogChanges];
                                if (!updated[index].changes)
                                  updated[index].changes = {
                                    localId: generateLocalId(),
                                    backlogId: null,
                                    backlogName: "",
                                    backlogDesc: "",
                                    note: "",
                                    posOrder: 1,
                                  };
                                updated[index].changes!.note = e.target.value;
                                setBacklogChanges(updated);
                              }}
                              placeholder={`Catatan Scope Perubahan`}
                            // maxLength={300}
                            // isDisabled={ActionLoading}
                            />
                          </Stack>
                        </InputLayoutFull>
                      </FormControl>
                    </Flex>
                  </GridItem>
                </Grid>
              ))}
              {ApplicationExistingChoosed ? (
                <Button
                  leftIcon={<FiPlusCircle />}
                  colorScheme={"yellow"}
                  onClick={() =>
                    setBacklogChanges((prev) => [
                      ...prev,
                      {
                        ...EmptyBacklogChangesData,
                        changes: {
                          localId: generateLocalId(),
                          backlogId: null,
                          backlogName: "",
                          backlogDesc: "",
                          note: "",
                          posOrder: prev.length + 1,
                        },
                      },
                    ])
                  }
                >
                  Tambah Perubahan
                </Button>
              ) : (
                <Flex w={"full"} justifyContent={"center"}>
                  <Text textAlign={"center"}>
                    Silahkan Pilih Aplikasi Eksisting Terlebih Dahulu
                  </Text>
                </Flex>
              )}
            </Flex>
          </InputGroupPanel>

          <Box
            overflowY={"auto"}
            overflowX={"auto"}
            maxH={"350px"}
            p={2}
            bgColor={"gray.200"}
            display={"none"}
          >
            <pre>{JSON.stringify(formik.values, null, 2)}</pre>
          </Box>

          <Divider />

          <FormControl
            id="appTargetUsers"
            isInvalid={formik.errors.appTargetUsers ? true : false}
          >
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Target Pengguna
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appTargetUsers", val)
                  }
                  value={formik.values.appTargetUsers ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    <Radio value={"EXTERNAL"}>EXTERNAL (NASABAH)</Radio>
                    <Radio value={"INTERNAL"}>INTERNAL (BANK)</Radio>
                  </Flex>
                </RadioGroup>
                <FormErrorMessage>
                  {formik.errors.appTargetUsers}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Media Akses Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Grid templateColumns="repeat(2, 1fr)" gap={3} w={"full"}>
                  <GridItem
                    colSpan={{
                      base: 2,
                      sm: 2,
                      md: 1,
                      lg: 1,
                    }}
                    w={"full"}
                  >
                    <Flex w={"full"} as={Stack}>
                      <Checkbox
                        isChecked={MediaAksesPublic}
                        onChange={(e) => {
                          setMediaAksesPublic(!MediaAksesPublic);
                          console.log(e);
                        }}
                        isDisabled={ApplicationExistingChoosed !== null}
                      >
                        Internet (Publik)
                      </Checkbox>
                      <Input
                        id="appAccessFrontsiteDns"
                        name="appAccessFrontsiteDns"
                        type="text"
                        onChange={formik.handleChange}
                        value={
                          formik.values.appAccessFrontsiteDns || "https://"
                        }
                        placeholder={`https://`}
                        minLength={5}
                        maxLength={150}
                        isDisabled={
                          !MediaAksesPublic ||
                          ApplicationExistingChoosed !== null
                        }
                      />
                    </Flex>
                  </GridItem>
                  <GridItem
                    colSpan={{
                      base: 2,
                      sm: 2,
                      md: 1,
                      lg: 1,
                    }}
                    w={"full"}
                  >
                    <Flex w={"full"} as={Stack}>
                      <Checkbox
                        isChecked={MediaAksesIntranet}
                        onChange={(e) => {
                          setMediaAksesIntranet(!MediaAksesIntranet);
                          console.log(e);
                        }}
                        isDisabled={ApplicationExistingChoosed !== null}
                      >
                        Intranet (Untuk BackOffice Bank)
                      </Checkbox>
                      <Input
                        id="appAccessBacksiteIp"
                        name="appAccessBacksiteIp"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.appAccessBacksiteIp || "http://"}
                        placeholder={`http://`}
                        minLength={5}
                        maxLength={150}
                        isDisabled={
                          !MediaAksesIntranet ||
                          ApplicationExistingChoosed !== null
                        }
                      />
                    </Flex>
                  </GridItem>
                </Grid>
                <FormHelperText as={"i"} fontSize={"xs"}>
                  Pemilihan Kontektivitas Internet wajib disertai Pentest dan
                  pembelian SSL, Divisi/Unit terkait dimohon menyiapkan
                  anggarannya.*
                </FormHelperText>
                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Jenis Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Text color={"gray.500"} fontSize={"smaller"} pb={1}>
                  Base Aplikasi
                </Text>
                <CheckboxGroup>
                  <Grid templateColumns="repeat(2, 1fr)" gap={1} w={"full"}>
                    {APP_TYPE_OPTIONS.map((item, idx) => (
                      <GridItem
                        key={idx}
                        colSpan={{
                          base: 2,
                          sm: 2,
                          md: 1,
                          lg: 1,
                        }}
                        w={"full"}
                      >
                        <Checkbox
                          key={idx}
                          isChecked={SelectedAppsTypes.includes(item)}
                          onChange={() => handleAppysTypesCheckboxChange(item)}
                          isDisabled={ApplicationExistingChoosed !== null}
                        >
                          {item}
                        </Checkbox>
                      </GridItem>
                    ))}
                  </Grid>
                </CheckboxGroup>
                {hasOtherAppsTypes && (
                  <Flex as={Stack} w={"full"} pt={2}>
                    <Text>Input Lainnya</Text>
                    <OtherInputAppsStringSeparator
                      value={formik.values.appTypeCustom || ""}
                      onChange={(val) => {
                        formik.setFieldValue("appTypeCustom", val);
                      }}
                      isDisabled={ApplicationExistingChoosed !== null}
                    />
                  </Flex>
                )}
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Keterkaitan Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <CheckboxGroup>
                  <Stack spacing={0} h={"full"}>
                    <RadioGroup
                      onChange={(val) =>
                        formik.setFieldValue("appRelatedness", val)
                      }
                      value={formik.values.appRelatedness ?? ""}
                      isDisabled={ApplicationExistingChoosed !== null}
                    >
                      <Flex w={"full"} as={HStack}>
                        <Radio value={APP_RELATED_OPTIONS[0]}>
                          {APP_RELATED_OPTIONS[0]}
                        </Radio>

                        <Radio value={APP_RELATED_OPTIONS[1]}>
                          {APP_RELATED_OPTIONS[1]}
                        </Radio>
                      </Flex>
                    </RadioGroup>
                    {formik.values.appRelatedness == APP_RELATED_OPTIONS[1] && (
                      <Flex as={Stack} w={"full"} pt={2}>
                        <Text>Nama Regulator</Text>
                        <OtherInputAppsStringSeparator
                          value={formik.values.appRelatednessDesc || ""}
                          onChange={(val) => {
                            formik.setFieldValue("appRelatednessDesc", val);
                          }}
                          isDisabled={ApplicationExistingChoosed !== null}
                        />
                      </Flex>
                    )}
                    <FormHelperText as={"i"} fontSize={"xs"}>
                      Jika memilih "Regulator", harap di isi dengan nama
                      instansi.*
                    </FormHelperText>
                  </Stack>
                </CheckboxGroup>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Kategori Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appTransactionals", val)
                  }
                  value={formik.values.appTransactionals ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    {APP_TRANSACTIONAL_OPTIONS.map((item, idx) => (
                      <Radio key={idx} value={item}>
                        {item}
                      </Radio>
                    ))}
                  </Flex>
                </RadioGroup>
                <FormErrorMessage>
                  {formik.errors.appTransactionals}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Waktu Operasional Aplikasi
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) => {
                    formik.setFieldValue("appOperational24hrs", val);
                    if (val === APP_OPERATIONAL_OPTIONS[0]) {
                      formik.setFieldValue(
                        "appOperationalDays",
                        fullDay.join(", ")
                      );
                      formik.setFieldValue("appOperationalHourOpen", "");
                      formik.setFieldValue("appOperationalHourClosed", "");
                    } else {
                      formik.setFieldValue("appOperationalDays", "");
                    }
                  }}
                  value={formik.values.appOperational24hrs ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    {APP_OPERATIONAL_OPTIONS.map((item, idx) => (
                      <Radio key={idx} value={item}>
                        {item}
                      </Radio>
                    ))}
                  </Flex>
                </RadioGroup>

                {formik.values.appOperational24hrs ==
                  APP_OPERATIONAL_OPTIONS[1] && (
                    <Flex as={Stack} w={"full"} py={2}>
                      <Text color={"secondary.500"}>Pilih Hari</Text>
                      <Box
                        pointerEvents={
                          ApplicationExistingChoosed !== null ? "none" : "auto"
                        }
                        opacity={ApplicationExistingChoosed !== null ? 0.6 : 1}
                      >
                        <WeekdaySelector
                          value={OperationalDays}
                          onChange={setOperationalDays}
                        />
                      </Box>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4} w={"full"}>
                        <GridItem
                          colSpan={{
                            base: 2,
                            sm: 2,
                            md: 1,
                            lg: 1,
                          }}
                          w={"full"}
                        >
                          <Stack w={"full"}>
                            <Text color={"secondary.500"}>Operasional Mulai</Text>
                            <Input
                              type="time"
                              id="appOperationalHourOpen"
                              name="appOperationalHourOpen"
                              onChange={formik.handleChange}
                              value={
                                formik.values.appOperationalHourOpen
                                  ? formik.values.appOperationalHourOpen.slice(
                                    0,
                                    5
                                  ) // ensure HH:mm
                                  : ""
                              }
                              isDisabled={ApplicationExistingChoosed !== null}
                            />
                          </Stack>
                        </GridItem>
                        <GridItem
                          colSpan={{
                            base: 2,
                            sm: 2,
                            md: 1,
                            lg: 1,
                          }}
                          w={"full"}
                        >
                          <Stack w={"full"}>
                            <Text color={"secondary.500"}>
                              Operasional Berakhir
                            </Text>
                            <Input
                              type="time"
                              id="appOperationalHourClosed"
                              name="appOperationalHourClosed"
                              onChange={formik.handleChange}
                              value={
                                formik.values.appOperationalHourClosed
                                  ? formik.values.appOperationalHourClosed.slice(
                                    0,
                                    5
                                  ) // ensure HH:mm
                                  : ""
                              }
                              isDisabled={ApplicationExistingChoosed !== null}
                            />
                          </Stack>
                        </GridItem>
                      </Grid>
                    </Flex>
                  )}

                <FormErrorMessage>
                  {formik.errors.appOperational24hrs}
                </FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl
            id="appLiveTargetDate"
            isInvalid={formik.errors.appLiveTargetDate ? true : false}
            isRequired
          >
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Target Live
              </FormLabel>
              <Stack spacing={2} h={"full"}>
                <Input
                  id="appLiveTargetDate"
                  name="appLiveTargetDate"
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.appLiveTargetDate ?? ""}
                  isDisabled={ActionLoading}
                />
                {/* <Text px={2} fontWeight={600}>
                                    {formik.values.appLiveTargetDate
                                      ? getQuarterText(
                                          formik.values.appLiveTargetDate
                                        )
                                      : "-"}
                                  </Text> */}
                <FormErrorMessage>
                  {formik.errors.appLiveTargetDate}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl id="appLiveTargetDateTerbilang" isRequired>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Terbilang Target Live
              </FormLabel>
              <Stack spacing={2} h={"full"}>
                <Text px={2} fontWeight={600}>
                  {formik.values.appLiveTargetDate
                    ? getQuarterText(formik.values.appLiveTargetDate)
                    : "-"}
                </Text>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl id="note" isInvalid={formik.errors.note ? true : false}>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Catatan
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <Textarea
                  id="note"
                  name="note"
                  onChange={formik.handleChange}
                  defaultValue={formik.values.note ?? ""}
                  placeholder={`Catatan (Opsional)`}
                  maxLength={300}
                  isDisabled={ActionLoading}
                />
                <FormErrorMessage>{formik.errors.note}</FormErrorMessage>
              </Stack>
            </InputLayoutFull>
          </FormControl>
        </Flex>
      </InputGroupPanel>
      <InputGroupPanel
        headerTitle={`Ringkasan Ruanglingkup ${type_req_param} | Aspek Teknis`}
      >
        <Flex as={Stack} w={"full"} spacing={5}>
          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Target Lokasi Server
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <CheckboxGroup>
                  <Grid templateColumns="repeat(2, 1fr)" gap={1} w={"full"}>
                    {APP_ENV_LOCATION_OPTIONS.map((item, idx) => (
                      <GridItem
                        key={idx}
                        colSpan={{
                          base: 2,
                          sm: 2,
                          md: 1,
                          lg: 1,
                        }}
                        w={"full"}
                      >
                        <Checkbox
                          key={idx}
                          isChecked={SelectedAppsEnvLoc.includes(item)}
                          onChange={() => handleAppysEnvLocCheckboxChange(item)}
                          isDisabled={ApplicationExistingChoosed !== null}
                        >
                          {item}
                        </Checkbox>
                      </GridItem>
                    ))}
                  </Grid>
                </CheckboxGroup>
                {hasOtherEnvLocTypes && (
                  <Flex as={Stack} w={"full"} pt={2}>
                    <Text>Input Lainnya</Text>
                    <OtherInputAppsStringSeparator
                      value={formik.values.appEnvLocationsOthers || ""}
                      onChange={(val) => {
                        formik.setFieldValue("appEnvLocationsOthers", val);
                      }}
                      isDisabled={ApplicationExistingChoosed !== null}
                    />
                  </Flex>
                )}
                <FormHelperText as={"i"} fontSize={"xs"}>
                  Jika server aplikasi ditempatkan di pihak ketiga, harap
                  cantumkan alamat lokasi (Domain/Data Center).*
                </FormHelperText>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          <FormControl>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Otentikasi UIM Bank bjb
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appPrivateAuth", val)
                  }
                  value={"Y"}
                >
                  <Flex w={"full"} as={HStack}>
                    <Radio value={"Y"}>Ya</Radio>
                    <Radio value={"N"} isDisabled>
                      Tidak
                    </Radio>
                  </Flex>
                </RadioGroup>

                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayout>
              <FormLabel h={"full"} mt={2}>
                Keperluan High Availability
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <RadioGroup
                  onChange={(val) =>
                    formik.setFieldValue("appHightAvailability", val)
                  }
                  value={formik.values.appHightAvailability ?? ""}
                  isDisabled={ApplicationExistingChoosed !== null}
                >
                  <Flex w={"full"} as={HStack}>
                    <Radio value={"Y"}>Ya</Radio>
                    <Radio value={"N"}>Tidak</Radio>
                  </Flex>
                </RadioGroup>

                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
              </Stack>
            </InputLayout>
          </FormControl>

          <FormControl>
            <InputLayoutFull>
              <FormLabel h={"full"} mt={2}>
                Integrasi Dengan Aplikasi Lain
              </FormLabel>
              <Stack spacing={0} h={"full"}>
                <InputTagsArea
                  name="appIntegrationOthersApps"
                  value={formik.values.appIntegrationOthersApps || ""}
                  onChange={(val) => {
                    formik.setFieldValue("appIntegrationOthersApps", val);
                  }}
                  isDisabled={ApplicationExistingChoosed !== null}
                />
                <FormErrorMessage>
                  {formik.errors.appAccessMedia}
                </FormErrorMessage>
                <Divider py={1} />
                <Text fontSize={"smaller"} py={2}>
                  Tambah Cepat
                </Text>
                <FormControl>
                  <FormLabel>Rekomendasi Aplikasi Lain / Surrounding</FormLabel>
                  <Flex as={Wrap} w={"full"}>
                    {APP_INTEGRATED_OTHER_APPS.filter((item) => {
                      const existingTags = (
                        formik.values.appIntegrationOthersApps || ""
                      )
                        .split(",")
                        .map((t: string) => t.trim());

                      return !existingTags.includes(item);
                    }).map((item, index) => (
                      <Tag
                        key={index}
                        borderRadius="full"
                        colorScheme="secondary"
                        variant={"solid"}
                        px={3}
                        cursor={"pointer"}
                        _hover={{
                          bg: "secondary.700",
                          color: "white",
                        }}
                        onClick={() => {
                          handleQuickAddTagIntegratedApps(item);
                        }}
                      >
                        <FiPlus />
                        <TagLabel pl={1}>{item}</TagLabel>
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>
              </Stack>
            </InputLayoutFull>
          </FormControl>

          {/* Backlog Priority Table */}
          {sortedDataBackLogs.length > 0 && (
            <FormControl>
              <InputLayoutFull>
                <FormLabel h={"full"} mt={2}>
                  Daftar Perubahan Sistem (Priority Order)
                </FormLabel>
                <Stack spacing={3}>
                  {sortedDataBackLogs.map((backlog, index) => (
                    <Flex
                      key={backlog.backlogId || index}
                      p={3}
                      border="1px"
                      borderColor={
                        colorMode === "light" ? "gray.200" : "gray.600"
                      }
                      rounded="md"
                      alignItems="center"
                      gap={3}
                    >
                      <VStack spacing={0}>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            const id = backlog.backlogId || backlog.localId;
                            if (id) movePriority(id, "up");
                          }}
                          isDisabled={backlog.posOrder === 1}
                        >
                          <ChevronUpIcon />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            const id = backlog.backlogId || backlog.localId;
                            if (id) movePriority(id, "down");
                          }}
                          isDisabled={
                            backlog.posOrder === sortedDataBackLogs.length
                          }
                        >
                          <ChevronDownIcon />
                        </Button>
                      </VStack>
                      <Badge colorScheme="blue" size="sm">
                        {backlog.posOrder}
                      </Badge>
                      <Box flex={1}>
                        <Text fontWeight="bold">{backlog.backlogName}</Text>
                        {backlog.backlogDesc && (
                          <Text fontSize="sm" color="gray.500">
                            {backlog.backlogDesc}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  ))}
                </Stack>
              </InputLayoutFull>
            </FormControl>
          )}
        </Flex>
      </InputGroupPanel>

      {/* App Picker Modal */}
      <AppPickerModal
        isOpen={ModalAppPicker.isOpen}
        onClose={ModalAppPicker.onClose}
        selectedApp={selectedApp}
        onAppSelect={(app) => {
          setSelectedApp(app);
          if (app) {
            formik.setFieldValue("appInitialCode", app.appShortName);
            SelectedApp(app);
          }
          ModalAppPicker.onClose();
        }}
        tokenData={tokenData}
      />
    </Flex>
  );
};

export default RegisterRequirementFormPage;
