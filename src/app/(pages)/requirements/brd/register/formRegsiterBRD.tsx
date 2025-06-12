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
  DIVISION_ID_IT_BJB,
  fullDay,
  GROUP_CONST_BRD_STATUS,
  LINK_MENU_ROOT,
  MAX_SIZE_TABLE,
  MEDIA_KEY_REQUIREMENT,
  NEXT_STEP_ACTION_REVIEW,
  radiusStyle,
  REQ_STATUS_REVIEW,
  REQUIREMENT_STATUS_NEW,
  REQUIREMENT_TYPE_BRD,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  calculateDurationInDays,
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
  OptionListProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import { ChevronDownIcon, RepeatIcon } from "@chakra-ui/icons";
import {
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
import { redirect, useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
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
import { FaTrashAlt } from "react-icons/fa";
import OtherInputAppsStringSeparator from "@/app/components/inputProps/InputMultiTags";
import WeekdaySelector from "@/app/components/inputProps/WeekDaySelector";
import InputTagsArea from "@/app/components/inputProps/InputMultiTagsArea";
import { FeatureRecomentionsBacklogs } from "@/app/helper/FeatureDataRecomendations";
import IdentificationNumberInput from "@/app/components/inputProps/IdentificationNumberInput";
import InputSelectOptions from "@/app/components/inputProps/inputSelectOptions";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";

const TYPE_REQ: string = REQUIREMENT_TYPE_BRD;

const HeaderDataContent: HeaderContentProps = {
  titleName: `Registrasi ${TYPE_REQ}`,
  breadCrumb: ["Home", "Requirements", TYPE_REQ, "Registrasi"],
};

const FormSchema = yup.object().shape({
  // STG 1
  reffParentId: yup.string().nullable(),
  senderDivisionId: yup.string().required("Sender Division ID is required"),
  requirementType: yup.string().required("Requirement Type is required"),
  reqNumber: yup.string().required("Requirement Number is required"),
  reqNarative: yup.string().required("Requirement Narrative is required"),
  reqInititateDate: yup.string().required("Initiation Date is required"),
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
        userId: yup.string().required("User ID is required"),
      })
    )
    .required(),

  // AREA 2
  userPicId: yup.string().nullable(),
  userPicIdentityNumber: yup.string().nullable(),
  userPicName: yup.string().nullable(),
  userPicContanct: yup.string().nullable(),
  userPicEmail: yup.string().email().nullable(),
  userPicDivisionId: yup.string().nullable(),
  userPicGroupId: yup.string().nullable(),

  // AREA 3
  workPrograms: yup
    .array()
    .of(
      yup.object({
        divisionId: yup.string().required(),
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
        backlogName: yup.string().required("Backlog name is required"),
        backlogDesc: yup.string().nullable(),
      })
    )
    .required(),
});

const initialValues: RequirementsInsertPayload = {
  // STG 1
  reffParentId: "",
  senderDivisionId: "",
  requirementType: TYPE_REQ,
  reqNumber: "",
  reqNarative: "",
  reqInititateDate: "",
  reqAcceptedDate: null,
  isCarryOver: "",

  // STG 2 - AREA 1
  assignedToDate: null,
  assignedFromId: "",
  assignedFromName: "",
  picAssignUsers: [{ userId: "" }],

  // AREA 2
  userPicId: "",
  userPicIdentityNumber: "",
  userPicName: "",
  userPicContanct: "",
  userPicEmail: "",
  userPicDivisionId: "",
  userPicGroupId: "",

  // AREA 3
  workPrograms: [
    // {
    //   divisionId: "",
    //   workProgramSource: "",
    //   workProgramCode: "",
    //   workProgramName: "",
    //   workProgramAccName: "",
    //   workProgramAccNumber: "",
    //   workProgramAccCc: "",
    //   workProgramBudget: 0,
    //   workProgramReal: 0,
    //   workProgramLeftovers: 0,
    // },
  ],

  // AREA 4
  appInitialCode: "",
  appInitialName: "",
  backlogChange: "",
  appAccessMedia: "",
  appTypes: "",
  appTypeCustom: "",
  appRelatedness: "",
  appRelatednessDesc: "",
  appTransactionals: "",
  appOperational24hrs: "",
  appOperationalDays: "",
  appOperationalHourOpen: "",
  appOperationalHourClosed: "",
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
    },
  ],
};

const workProgramsValidationSchema = yup.object({
  divisionId: yup.string().required("Division ID is required"),
  workProgramSource: yup
    .string()
    .oneOf(["INTERNAL", "EXTERNAL"], "Source must be INTERNAL or EXTERNAL")
    .required("Work Program Source is required"),
  workProgramCode: yup.string().nullable(),
  workProgramName: yup.string().nullable(),
  workProgramAccName: yup.string().nullable(),
  workProgramAccNumber: yup.string().nullable(),
  workProgramAccCc: yup.string().nullable(),
  workProgramBudget: yup
    .number()
    .typeError("Budget must be a number")
    .required("Budget is required")
    .min(0, "Budget must be 0 or more"),
  workProgramReal: yup
    .number()
    .typeError("Real must be a number")
    .required("Real is required")
    .min(0, "Real must be 0 or more"),
});

const workProgramsInitialValues: WorkProgramsPayload = {
  divisionId: "",
  workProgramSource: "", // Should be "INTERNAL" or "EXTERNAL"
  workProgramCode: "",
  workProgramName: "",
  workProgramAccName: "",
  workProgramAccNumber: "",
  workProgramAccCc: "",
  workProgramBudget: 0,
  workProgramReal: 0,
};

function RequirementsBRDRegisterView() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { InsertReq } = useRequirements();
  const { InsertMediaObjectByKey } = useMediaObject();
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListOrganization } = useOrganization();
  const [isClient, setIsClient] = useState(false);

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
        description: `Upload File Failed : ${
          requestData?.message || RES_GENERIC_ERROR_MSG
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

    if (files.length <= 0) {
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
      redirect(`/requirements/${TYPE_REQ.toLocaleLowerCase()}/`);
      return;
    }
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
      if (DataBackLogs.length <= 0) {
        showToast({
          description: "Fitur BRD tidak boleh kosong",
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
    setCaptionDialog("Konfirmasi Simpan");
    setQuestionMsgDialog(
      `Apakah ada yakin akan submit data "${formik.values.reqNarative}"?`
    );
    setOpenConfirmSaveDialog(true);
  };

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team) {
      await AddRequirement(formik.values);
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
      // formik.setFieldValue("id", null);
    }
    LoadDataDivision();
    // const GettingDataOption = async () => {
    //   const MaintenanceCategoryData: OptionListProps[] =
    //     await GetOptionDataServ("MAINTENANCE_CATEGORY");
    //   const MaintenanceTypeData: OptionListProps[] = await GetOptionDataServ(
    //     "MAINTENANCE_TYPE"
    //   );
    //   setOptionDivision(MaintenanceCategoryData);
    // };
    // GettingDataOption();
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
      handleSearchUser(user.userId, "searchPICUser");
    } else {
      formik.setFieldValue("userPicId", null);
      formik.setFieldValue("userPicName", null);
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
        userId: user.id,
      })
    );

    formik.setFieldValue("picAssignUsers", mappedPayload);
  }, [ChoosedMemberProjects]);

  const handleSearchUserAssign = async (textSearch: string) => {
    setDataUsers([]);
    setSearchUserInput(textSearch);
    if (textSearch.length >= 2) {
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
  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [SelectedDivision, setSelectedDivision] =
    useState<OptionListProps | null>(null);
  const handleSelectedDivision = (data: OptionListProps) => {
    setSelectedDivision(data);
    formik.setFieldValue("senderDivisionId", data.value);
  };
  const handleUnSelectedDivision = () => {
    setSelectedDivision(null);
    formik.setFieldValue("senderDivisionId", null);
  };

  const [SelectedDivisionUserPIC, setSelectedDivisionUserPIC] =
    useState<OptionListProps | null>(null);
  const handleSelectedDivisionUserPIC = (data: OptionListProps) => {
    setSelectedDivisionUserPIC(data);
    const [nameOpt, codeOpt] = data.label.split("|").map((s) => s.trim());
    formik.setFieldValue("userPicDivisionId", data.value);
    formik.setFieldValue("userPicDivisionCode", nameOpt);
    formik.setFieldValue("userPicDivisionName", codeOpt);

    const dataDivisionGroup = GetDataDivisionGroup(
      "",
      data.value,
      MAX_SIZE_TABLE
    );

    setSelectedGroupDivision(null);
    formik.setFieldValue("userPicGroupId", null);
    formik.setFieldValue("userPicGroupCode", null);
    formik.setFieldValue("userPicGroupName", null);
  };
  const handleUnSelectedDivisionUserPIC = () => {
    setSelectedDivisionUserPIC(null);
    formik.setFieldValue("userPicDivisionId", null);
    formik.setFieldValue("userPicDivisionCode", null);
    formik.setFieldValue("userPicDivisionName", null);

    setOptionGroupDivision([]);
  };

  const handleSelectedDivisionCustom = (
    data: OptionListProps,
    fieldData: string
  ) => {
    // setSelectedDivisionUserPIC(data);
    formik.setFieldValue(fieldData, data.value);
  };
  const handleUnSelectedDivisionCustom = (fieldData: string) => {
    // setSelectedDivisionUserPIC(null);
    formik.setFieldValue(fieldData, null);
  };

  const GetDataDivision = async (
    searchValue: string = "",
    limit: number = 1
  ): Promise<OrganizationResponse[]> => {
    setIsLoadingDivisionSelect(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [
        {
          field: "orgType",
          operator: "=",
          value: "DIVISION",
        },
      ],
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
      setIsLoadingDivisionSelect(false);
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingDivisionSelect(false);
        return [];
      }

      const itemsData: OrganizationResponse[] =
        requestData.data as OrganizationResponse[];

      const mapOptionData: OptionListProps[] = itemsData.map((d) => ({
        label: `${d.orgName} | ${d.orgType}`,
        value: d.id,
      }));
      setOptionDivision(mapOptionData);
      setIsLoadingDivisionSelect(false);

      return itemsData;
    }
  };

  const LoadDataDivision = async () => {
    if (OptionDivision.length <= 0) {
      const dataDivision = await GetDataDivision("", MAX_SIZE_TABLE);
    }
  };

  const [IsLoadingGroupDivisionSelect, setIsLoadingGroupDivisionSelect] =
    useState(false);
  const [OptionGroupDivision, setOptionGroupDivision] = useState<
    OptionListProps[]
  >([]);
  const [SelectedGroupDivision, setSelectedGroupDivision] =
    useState<OptionListProps | null>(null);
  const handleSelectedGroupDivision = (data: OptionListProps) => {
    setSelectedGroupDivision(data);
    const [nameOpt, codeOpt] = data.label.split("|").map((s) => s.trim());
    formik.setFieldValue("userPicGroupId", data.value);
    formik.setFieldValue("userPicGroupCode", codeOpt);
    formik.setFieldValue("userPicGroupName", nameOpt);
  };
  const handleUnSelectedGroupDivision = () => {
    setSelectedGroupDivision(null);
    formik.setFieldValue("userPicGroupId", null);
    formik.setFieldValue("userPicGroupCode", null);
    formik.setFieldValue("userPicGroupName", null);
  };

  const GetDataDivisionGroup = async (
    searchValue: string = "",
    divisionId: string = "",
    limit: number = 1
  ): Promise<OrganizationResponse[]> => {
    setIsLoadingGroupDivisionSelect(true);
    const whereDataFilter: ListSearchByParam[] =
      divisionId.length > 0
        ? [
            {
              field: "parentId",
              operator: "=",
              value: divisionId || "",
            },
            {
              field: "orgType",
              operator: "=",
              value: "GROUP",
            },
          ]
        : [
            {
              field: "orgType",
              operator: "=",
              value: "GROUP",
            },
          ];
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: whereDataFilter,
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
      setIsLoadingGroupDivisionSelect(false);
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingGroupDivisionSelect(false);
        return [];
      }

      const itemsData: OrganizationResponse[] =
        requestData.data as OrganizationResponse[];

      const mapOptionData: OptionListProps[] = itemsData.map((d) => ({
        label: `${d.orgName} | ${d.orgType}`,
        value: d.id,
      }));
      setOptionGroupDivision(mapOptionData);
      setIsLoadingGroupDivisionSelect(false);

      return itemsData;
    }
  };

  // const LoadDataDivisionGroup = async () => {
  //   const dividionReffId: string = formik.values.userPicDivisionId || "";
  //   const dataDivisionGroup = await GetDataDivisionGroup(
  //     "",
  //     dividionReffId,
  //     MAX_SIZE_TABLE
  //   );
  // };

  // End Division Select

  // Backlog Setup
  const ModalForm = useDisclosure();
  const [DataBackLogs, setDataBackLogs] = useState<ReqBacklogPayload[]>([]);
  const [FormMode, setFormMode] = useState<"Add" | "Edit">("Add");

  const columnsData = useMemo<ColumnDef<ReqBacklogPayload>[]>(
    () => [
      {
        accessorFn: (row) => row.backlogId,
        id: "numbertd",
        cell: (info) => <Flex>{info.row.index + 1}. </Flex>,
        header: () => <span>No. </span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.backlogName,
        id: "backlogName",
        cell: (info) => <Flex>{info.row.original.backlogName}</Flex>,
        header: () => <span>Nama Fitur</span>,
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
              onClick={() => logBacklog(info.row.original.backlogId)}
            >
              Ubah
            </Button>
            <Button
              colorScheme="red"
              size="xs"
              variant="ghost"
              onClick={() => removeBacklog(info.row.original.backlogId)}
            >
              Hapus
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
    pageSize: 5,
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

  const handleOpenForm = () => {
    ModalForm.onOpen();
  };

  const addBacklog = (name: string, desc?: string) => {
    const generateFakeId = () => {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    };

    const isDuplicate = DataBackLogs.some(
      (x) => x.backlogName.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      showToast({
        description: "Fitur sudah ada di daftar",
        statusToast: "warning",
      });
      return;
    }

    const newBacklog: ReqBacklogPayload = {
      backlogId: generateFakeId(),
      backlogName: name,
      backlogDesc: desc || null,
    };

    setDataBackLogs((prev) => [...prev, newBacklog]);

    showToast({
      description: "Fitur ditambahkan",
      statusToast: "success",
    });
  };

  const updateBacklog = (backlogId: string, updatedData: ReqBacklogPayload) => {
    setDataBackLogs((prev) =>
      prev.map((item) =>
        item.backlogId === backlogId ? { ...item, ...updatedData } : item
      )
    );

    showToast({
      description: "Fitur diubah",
      statusToast: "success",
    });

    ModalForm.onClose();
    setFormMode("Add");
  };

  const removeBacklog = (backlogId: string | undefined | null) => {
    if (backlogId == undefined || backlogId == null) {
      showToast({
        description: "Fitur ID error",
        statusToast: "warning",
      });
      return;
    }
    setDataBackLogs((prev) =>
      prev.filter((item) => item.backlogId !== backlogId)
    );
  };

  const handleSaveBacklog = () => {
    if (!TextBackLogName.trim()) {
      showToast({
        description: "Nama fitur tidak boleh kosong",
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

      updateBacklog(TextBackLogId, {
        backlogId: TextBackLogId,
        backlogName: TextBackLogName.trim(),
        backlogDesc: TextBackLogDesc?.trim() || null,
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
        description: "Fitur ID error",
        statusToast: "warning",
      });
      return;
    }

    const item = DataBackLogs.find((x) => x.backlogId === backlogId);
    if (!item) return;

    setFormMode("Edit");
    ModalForm.onOpen();
    setTextBackLogId(item.backlogId || null);
    setTextBackLogName(item.backlogName || "");
    setTextBackLogDesc(item.backlogDesc || "");
  };

  useEffect(() => {
    formik.setFieldValue(
      "backlogFeatures",
      DataBackLogs.map((item) => ({
        ...item,
        backlogId: null,
      }))
    );
  }, [DataBackLogs]);

  // End Backlog setup
  const [uploadedFiles, setUploadedFiles] = useState<FileDetails[]>([]);
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
    const fileDetails = files.map((file) => {
      const [name, extension] = file.name.split(".");
      return { name, extension, size: file.size, file };
    });
    setUploadedFiles(fileDetails);
    const formData = new FormData();
    uploadedFiles.forEach((uploadedFile) =>
      formData.append("files", uploadedFile.file)
    );
    console.log("Form Data Payload:", formData);
    console.log("Uploaded Files:", fileDetails);
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
    { title: "Step 1", description: "Informasi Umum" },
    { title: "Step 2", description: "Penugasan Personil & User" },
    { title: "Step 3", description: "Program Kerja" },
    { title: "Step 4", description: "Ringkasan Ruanglingkup" },
    { title: "Step 5", description: "Lampiran" },
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
    .filter((x) => x.workProgramSource === "EXTERNAL");

  const externalWorkPrograms = formik.values.workPrograms
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((x) => x.workProgramSource === "INTERNAL");

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
    // Step 2: Append the new item to the clone
    const updatedPrograms = [
      ...currentPrograms,
      {
        divisionId: SourceWP === "INTERNAL" ? DIVISION_ID_IT_BJB : "",
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
    formik.setFieldValue("workPrograms", updatedPrograms);
  };

  const RemoveWorkProgram = (index: number) => {
    const updated = [...formik.values.workPrograms];
    updated.splice(index, 1);
    formik.setFieldValue("workPrograms", updated);
  };

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
      .map((t) => t.trim())
      .filter(Boolean);

    if (!currentTags.includes(tag)) {
      const updated = [...currentTags, tag].join(", ");
      formik.setFieldValue("appIntegrationOthersApps", updated);
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

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
          <ModalHeader>{`${
            FormMode == "Add" ? "Tambah" : "Ubah"
          } Fitur`}</ModalHeader>
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"}>
              <FormControl>
                <FormLabel>Nama Fitur</FormLabel>
                <Input
                  id="backlogFeatureName"
                  name="backlogFeatureName"
                  type="text"
                  onChange={(e) => setTextBackLogName(e.target.value)}
                  value={TextBackLogName}
                  placeholder={`Nama Fitur`}
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
                  placeholder={`Deskripsi Fitur`}
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
              >
                {FormMode == "Add" ? "Tambah" : "Ubah"} Fitur
              </Button>

              <Divider py={1} />
              <Text fontSize={"smaller"}>Tambah Cepat</Text>
              <FormControl>
                <FormLabel>Rekomendasi Fitur Umum</FormLabel>
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
              <Link href={`/requirements/${TYPE_REQ.toLocaleLowerCase()}/`}>
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
            >
              {/* <Button
                size={"lg"}
                bg={"white"}
                color={"gray.800"}
                leftIcon={<RepeatIcon />}
                type={"button"}
                isLoading={ActionLoading}
              >
                Ulang
              </Button> */}
              {/* <Button
                size={"lg"}
                colorScheme={"green"}
                leftIcon={<FiSave />}
                // type={"submit"}
                //   onClick={() => setSaveAsDraft(false)}
                onClick={() => handleConfirmSaveData(formik.values)}
                isLoading={ActionLoading}
                isDisabled={activeStep !== steps.length - 1}
                px={8}
              >
                Simpan
              </Button> */}
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
            <Card w={"fill"} rounded={radiusStyle}>
              <CardHeader>
                <Heading as="h5" size="md" w={"full"}>
                  Form Registrasi {TYPE_REQ}
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

                    {activeStep === 0 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel headerTitle={`Informasi Umum`}>
                          <Input
                            id="requirementType"
                            name="requirementType"
                            type="hidden"
                            value={formik.values.requirementType ?? ""}
                            readOnly
                          />

                          <FormControl
                            id={"senderDivisionId"}
                            isInvalid={
                              formik.errors.senderDivisionId ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Divisi Pengirim
                              </FormLabel>
                              <Stack spacing={0}>
                                {/* <Select
                                  id={"senderDivisionId"}
                                  options={OptionDivision}
                                  isSearchable={true}
                                  onMenuOpen={async () => {
                                    await LoadDataDivision();
                                  }}
                                  onChange={(e) => {
                                    e
                                      ? handleSelectedDivision({
                                          label: e.label,
                                          value: e.value,
                                        })
                                      : handleUnSelectedDivision();
                                  }}
                                  placeholder={"Pilih Divisi Pengirim"}
                                  isLoading={
                                    IsLoadingProcess || IsLoadingDivisionSelect
                                  }
                                  value={SelectedDivision}
                                /> */}
                                <InputSelectOptions
                                  Id={"senderDivisionId"}
                                  OptionData={OptionDivision}
                                  SelectedData={SelectedDivision}
                                  handleSelectedData={handleSelectedDivision}
                                  handleUnSelectedData={
                                    handleUnSelectedDivision
                                  }
                                  placeholder={"Pilih Divisi Pengirim"}
                                />
                                <FormErrorMessage>
                                  {formik.errors.senderDivisionId}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="reqNumber"
                            isInvalid={formik.errors.reqNumber ? true : false}
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Nomor Memo
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <RegistrationNumberInput
                                  id="reqNumber"
                                  // name="reqNumber"
                                  type="text"
                                  // onChange={formik.handleChange}
                                  onChange={(val) =>
                                    formik.setFieldValue("reqNumber", val)
                                  }
                                  value={formik.values.reqNumber ?? ""}
                                  placeholder={`0000/XXX-XXX/X/YYYY`}
                                  minLength={3}
                                  maxLength={22}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.reqNumber}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="reqNarative"
                            isInvalid={formik.errors.reqNarative ? true : false}
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Perihal
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Textarea
                                  id="reqNarative"
                                  name="reqNarative"
                                  onChange={formik.handleChange}
                                  defaultValue={formik.values.reqNarative ?? ""}
                                  placeholder={`Perlihal`}
                                  maxLength={300}
                                  isDisabled={ActionLoading}
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
                            isRequired
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
                                  onChange={formik.handleChange}
                                  value={formik.values.reqInititateDate ?? ""}
                                  isDisabled={ActionLoading}
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
                            isRequired
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
                                  onChange={formik.handleChange}
                                  value={formik.values.reqAcceptedDate ?? ""}
                                  isDisabled={ActionLoading}
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
                            isInvalid={formik.errors.isCarryOver ? true : false}
                            isRequired
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
                                  isChecked={formik.values.isCarryOver === "Y"}
                                  onChange={(e) => {
                                    formik.setFieldValue(
                                      "isCarryOver",
                                      e.target.checked ? "Y" : "N"
                                    );
                                  }}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.isCarryOver}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 1 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={`Penugasan Personil ${TYPE_REQ}`}
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
                                  onChange={formik.handleChange}
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
                            <InputLayoutFull>
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
                            </InputLayoutFull>
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
                                              {dt.nama} ({dt.userId})
                                            </Text>
                                            <Text
                                              fontWeight={500}
                                              fontSize={"small"}
                                              color={"gray.700"}
                                            >
                                              {dt.team?.teamName} |{" "}
                                              {dt.teamRole?.specName}
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
                                    Reviewer ({ChoosedMemberProjects.length})
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
                                      {ChoosedMemberProjects.length <= 0 && (
                                        <Flex
                                          w={"full"}
                                          justifyContent={"center"}
                                        >
                                          <Text pt={5}>
                                            Belum ada personil yang menjadi
                                            reviewer
                                          </Text>
                                        </Flex>
                                      )}
                                      {ChoosedMemberProjects.map(
                                        (dt, index) => {
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
                                                    {dt.nama} ({dt.userId})
                                                  </Text>
                                                  <Text
                                                    fontWeight={500}
                                                    fontSize={"small"}
                                                    color={"secondary.700"}
                                                  >
                                                    {dt.team?.teamName} |{" "}
                                                    {dt.teamRole?.specName}
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
                                        }
                                      )}
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
                          headerTitle={`Informasi Person In Charge (PIC)`}
                        >
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

                          <FormControl
                            id="userPicIdentityNumber"
                            isInvalid={
                              formik.errors.userPicIdentityNumber ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                NIK
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <IdentificationNumberInput
                                  id="userPicIdentityNumber"
                                  name="userPicIdentityNumber"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={
                                    formik.values.userPicIdentityNumber ?? ""
                                  }
                                  // placeholder={`xxx-xxxx-xxxx`}
                                  minLength={9}
                                  maxLength={10}
                                  isDisabled={ActionLoading}
                                  onlyNum={true}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicContanct}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

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
                                  name="userPicName"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={formik.values.userPicName ?? ""}
                                  placeholder={`Nama Lengkap PIC`}
                                  minLength={9}
                                  maxLength={225}
                                  isDisabled={true}
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
                                <EmailInputMask
                                  id="userPicEmail"
                                  name="userPicEmail"
                                  type="email"
                                  // onChange={formik.handleChange}
                                  value={formik.values.userPicEmail ?? ""}
                                  onChange={(val) =>
                                    formik.setFieldValue("userPicEmail", val)
                                  }
                                  // placeholder={`Alamat PIC Email (xxxx@bankbjb.co.id)`}
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

                          <FormControl
                            id={"userPicDivisionId"}
                            isInvalid={
                              formik.errors.userPicDivisionId ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Divisi
                              </FormLabel>
                              <Stack spacing={0}>
                                {/* <Select
                                  id={"userPicDivisionId"}
                                  options={OptionDivision}
                                  isSearchable={true}
                                  onMenuOpen={async () => {
                                    await LoadDataDivision();
                                  }}
                                  onChange={(e) => {
                                    e
                                      ? handleSelectedDivisionUserPIC({
                                          label: e.label,
                                          value: e.value,
                                        })
                                      : handleUnSelectedDivisionUserPIC();
                                  }}
                                  placeholder={"Pilih Divisi User PIC"}
                                  isLoading={
                                    IsLoadingProcess || IsLoadingDivisionSelect
                                  }
                                  value={SelectedDivisionUserPIC}
                                /> */}
                                <InputSelectOptions
                                  Id={"userPicDivisionId"}
                                  OptionData={OptionDivision}
                                  SelectedData={SelectedDivisionUserPIC}
                                  handleSelectedData={
                                    handleSelectedDivisionUserPIC
                                  }
                                  handleUnSelectedData={
                                    handleUnSelectedDivisionUserPIC
                                  }
                                  placeholder={"Pilih Divisi User PIC"}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicDivisionId}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id={"userPicGroupId"}
                            isInvalid={
                              formik.errors.userPicGroupId ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Grup
                              </FormLabel>
                              <Stack spacing={0}>
                                {/* <Select
                                  id={"userPicGroupId"}
                                  options={OptionGroupDivision}
                                  isSearchable={true}
                                  onMenuOpen={async () => {
                                    await LoadDataDivisionGroup();
                                  }}
                                  onChange={(e) => {
                                    e
                                      ? handleSelectedGroupDivision({
                                          label: e.label,
                                          value: e.value,
                                        })
                                      : handleUnSelectedGroupDivision();
                                  }}
                                  placeholder={"Pilih Grup User PIC"}
                                  isLoading={
                                    IsLoadingProcess ||
                                    IsLoadingGroupDivisionSelect
                                  }
                                  value={SelectedGroupDivision}
                                /> */}
                                <InputSelectOptions
                                  Id={"userPicGroupId"}
                                  OptionData={OptionGroupDivision}
                                  SelectedData={SelectedGroupDivision}
                                  handleSelectedData={
                                    handleSelectedGroupDivision
                                  }
                                  handleUnSelectedData={
                                    handleUnSelectedGroupDivision
                                  }
                                  placeholder={"Pilih Grup User PIC"}
                                />
                                <FormErrorMessage>
                                  {formik.errors.userPicGroupId}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </InputGroupPanel>
                      </Flex>
                    )}

                    {activeStep === 2 && (
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
                              {internalWorkPrograms.map((item, i) => {
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

                                    <FormControl
                                      id={`workProgramDivision-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                        formik.errors.workPrograms?.[index]
                                          ?.divisionId
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Divisi
                                        </FormLabel>
                                        <Stack spacing={0}>
                                          <Select
                                            id={`workProgramDivision-${index}`}
                                            options={OptionDivision}
                                            isSearchable={true}
                                            onMenuOpen={async () => {
                                              await LoadDataDivision();
                                            }}
                                            onChange={(e) => {
                                              e
                                                ? handleSelectedDivisionCustom(
                                                    {
                                                      label: e.label,
                                                      value: e.value,
                                                    },
                                                    `workPrograms[${index}].divisionId`
                                                  )
                                                : handleUnSelectedDivisionCustom(
                                                    `workPrograms[${index}].divisionId`
                                                  );
                                            }}
                                            placeholder={"Pilih Divisi"}
                                            isLoading={
                                              IsLoadingProcess ||
                                              IsLoadingDivisionSelect
                                            }
                                            value={OptionDivision.find(
                                              (x) =>
                                                x.value ==
                                                formik.values.workPrograms[
                                                  index
                                                ].divisionId
                                            )}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.divisionId}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
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
                                      isRequired
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
                                            onChange={(e) =>
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccName`,
                                                e.target.value
                                              )
                                            }
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
                                      isRequired
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
                                      isRequired
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
                                      isRequired
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
                              {externalWorkPrograms.map((item, i) => {
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

                                    <FormControl
                                      id={`workProgramDivision-${index}`}
                                      isInvalid={
                                        typeof formik.errors.workPrograms?.[
                                          index
                                        ] === "object" &&
                                        formik.errors.workPrograms?.[index]
                                          ?.divisionId
                                          ? true
                                          : false
                                      }
                                      isRequired
                                    >
                                      <InputLayout>
                                        <FormLabel h={"full"} mt={2}>
                                          Divisi
                                        </FormLabel>
                                        <Stack spacing={0}>
                                          <Select
                                            id={`workProgramDivision-${index}`}
                                            options={OptionDivision}
                                            isSearchable={true}
                                            onMenuOpen={async () => {
                                              await LoadDataDivision();
                                            }}
                                            onChange={(e) => {
                                              e
                                                ? handleSelectedDivisionCustom(
                                                    {
                                                      label: e.label,
                                                      value: e.value,
                                                    },
                                                    `workPrograms[${index}].divisionId`
                                                  )
                                                : handleUnSelectedDivisionCustom(
                                                    `workPrograms[${index}].divisionId`
                                                  );
                                            }}
                                            placeholder={"Pilih Divisi"}
                                            isLoading={
                                              IsLoadingProcess ||
                                              IsLoadingDivisionSelect
                                            }
                                            value={OptionDivision.find(
                                              (x) =>
                                                x.value ==
                                                formik.values.workPrograms[
                                                  index
                                                ].divisionId
                                            )}
                                          />
                                          <FormErrorMessage>
                                            {typeof formik.errors
                                              .workPrograms?.[index] ===
                                              "object" &&
                                              formik.errors.workPrograms?.[
                                                index
                                              ]?.divisionId}
                                          </FormErrorMessage>
                                        </Stack>
                                      </InputLayout>
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
                                      isRequired
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
                                            onChange={(e) =>
                                              formik.setFieldValue(
                                                `workPrograms[${index}].workProgramAccName`,
                                                e.target.value
                                              )
                                            }
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
                                      isRequired
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
                                      isRequired
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
                                      isRequired
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

                    {activeStep === 3 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel
                          headerTitle={`Ringkasan Ruanglingkup ${TYPE_REQ} | Aspek Bisnis`}
                        >
                          <Flex as={Stack} w={"full"} spacing={5}>
                            <FormControl
                              id="appInitialCode"
                              isInvalid={
                                formik.errors.appInitialCode ? true : false
                              }
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Inisial Aplikasi
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Input
                                    id="appInitialCode"
                                    name="appInitialCode"
                                    type="text"
                                    // onChange={formik.handleChange}

                                    onChange={(e) => {
                                      const onlyAlphabets =
                                        e.target.value.replace(
                                          /[^a-zA-Z]/g,
                                          ""
                                        );
                                      formik.setFieldValue(
                                        `appInitialCode`,
                                        onlyAlphabets
                                      );
                                    }}
                                    value={formik.values.appInitialCode ?? ""}
                                    placeholder={`CMS / SISMON / dsb.`}
                                    minLength={3}
                                    maxLength={10}
                                    isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.appInitialCode}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="appInitialName"
                              isInvalid={
                                formik.errors.appInitialName ? true : false
                              }
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
                                    isDisabled={ActionLoading}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.appInitialName}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayoutFull>
                            </FormControl>

                            <FormControl>
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Media Akses Aplikasi
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <RadioGroup
                                    onChange={(val) =>
                                      formik.setFieldValue(
                                        "appAccessMedia",
                                        val
                                      )
                                    }
                                    value={formik.values.appAccessMedia ?? ""}
                                  >
                                    <Flex w={"full"} as={HStack}>
                                      <Radio value={APP_ACCESS_MEDIA_INTERNET}>
                                        Internet
                                      </Radio>
                                      <Radio value={APP_ACCESS_MEDIA_INTRANET}>
                                        Interanet (Local Network)
                                      </Radio>
                                    </Flex>
                                  </RadioGroup>
                                  <FormHelperText as={"i"} fontSize={"xs"}>
                                    Pemilihan Kontektivitas Internet wajib
                                    disertai Pentest dan pembelian SSL,
                                    Divisi/Unit terkait dimohon menyiapkan
                                    anggarannya.*
                                  </FormHelperText>
                                  <FormErrorMessage>
                                    {formik.errors.appAccessMedia}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl>
                              <InputLayoutFull>
                                <FormLabel h={"full"} mt={2}>
                                  Jenis Aplikasi
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <Text
                                    color={"gray.500"}
                                    fontSize={"smaller"}
                                    pb={1}
                                  >
                                    Base Aplikasi
                                  </Text>
                                  <CheckboxGroup>
                                    <Grid
                                      templateColumns="repeat(2, 1fr)"
                                      gap={1}
                                      w={"full"}
                                    >
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
                                            isChecked={SelectedAppsTypes.includes(
                                              item
                                            )}
                                            onChange={() =>
                                              handleAppysTypesCheckboxChange(
                                                item
                                              )
                                            }
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
                                        value={
                                          formik.values.appTypeCustom || ""
                                        }
                                        onChange={(val) => {
                                          formik.setFieldValue(
                                            "appTypeCustom",
                                            val
                                          );
                                        }}
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
                                          formik.setFieldValue(
                                            "appRelatedness",
                                            val
                                          )
                                        }
                                        value={
                                          formik.values.appRelatedness ?? ""
                                        }
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
                                      {formik.values.appRelatedness ==
                                        APP_RELATED_OPTIONS[1] && (
                                        <Flex as={Stack} w={"full"} pt={2}>
                                          <Text>Nama Regulator</Text>
                                          <OtherInputAppsStringSeparator
                                            value={
                                              formik.values
                                                .appRelatednessDesc || ""
                                            }
                                            onChange={(val) => {
                                              formik.setFieldValue(
                                                "appRelatednessDesc",
                                                val
                                              );
                                            }}
                                          />
                                        </Flex>
                                      )}
                                      <FormHelperText as={"i"} fontSize={"xs"}>
                                        Jika memilih "Regulator", harap di isi
                                        dengan nama instansi.*
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
                                      formik.setFieldValue(
                                        "appTransactionals",
                                        val
                                      )
                                    }
                                    value={
                                      formik.values.appTransactionals ?? ""
                                    }
                                  >
                                    <Flex w={"full"} as={HStack}>
                                      {APP_TRANSACTIONAL_OPTIONS.map(
                                        (item, idx) => (
                                          <Radio key={idx} value={item}>
                                            {item}
                                          </Radio>
                                        )
                                      )}
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
                                      formik.setFieldValue(
                                        "appOperational24hrs",
                                        val
                                      );
                                      if (val === APP_OPERATIONAL_OPTIONS[0]) {
                                        formik.setFieldValue(
                                          "appOperationalDays",
                                          fullDay.join(", ")
                                        );
                                        formik.setFieldValue(
                                          "appOperationalHourOpen",
                                          ""
                                        );
                                        formik.setFieldValue(
                                          "appOperationalHourClosed",
                                          ""
                                        );
                                      } else {
                                        formik.setFieldValue(
                                          "appOperationalDays",
                                          ""
                                        );
                                      }
                                    }}
                                    value={
                                      formik.values.appOperational24hrs ?? ""
                                    }
                                  >
                                    <Flex w={"full"} as={HStack}>
                                      {APP_OPERATIONAL_OPTIONS.map(
                                        (item, idx) => (
                                          <Radio key={idx} value={item}>
                                            {item}
                                          </Radio>
                                        )
                                      )}
                                    </Flex>
                                  </RadioGroup>

                                  {formik.values.appOperational24hrs ==
                                    APP_OPERATIONAL_OPTIONS[1] && (
                                    <Flex as={Stack} w={"full"} py={2}>
                                      <Text color={"secondary.500"}>
                                        Pilih Hari
                                      </Text>
                                      <WeekdaySelector
                                        value={OperationalDays}
                                        onChange={setOperationalDays}
                                      />
                                      <Grid
                                        templateColumns="repeat(2, 1fr)"
                                        gap={4}
                                        w={"full"}
                                      >
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
                                              Operasional Mulai
                                            </Text>
                                            <Input
                                              type="time"
                                              id="appOperationalHourOpen"
                                              name="appOperationalHourOpen"
                                              onChange={formik.handleChange}
                                              value={
                                                formik.values
                                                  .appOperationalHourOpen
                                                  ? formik.values.appOperationalHourOpen.slice(
                                                      0,
                                                      5
                                                    ) // ensure HH:mm
                                                  : ""
                                              }
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
                                                formik.values
                                                  .appOperationalHourClosed
                                                  ? formik.values.appOperationalHourClosed.slice(
                                                      0,
                                                      5
                                                    ) // ensure HH:mm
                                                  : ""
                                              }
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
                              isInvalid={
                                formik.errors.appLiveTargetDate ? true : false
                              }
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
                                    value={
                                      formik.values.appLiveTargetDate ?? ""
                                    }
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

                            <FormControl
                              id="appLiveTargetDateTerbilang"
                              isRequired
                            >
                              <InputLayout>
                                <FormLabel h={"full"} mt={2}>
                                  Terbilang Target Live
                                </FormLabel>
                                <Stack spacing={2} h={"full"}>
                                  <Text px={2} fontWeight={600}>
                                    {formik.values.appLiveTargetDate
                                      ? getQuarterText(
                                          formik.values.appLiveTargetDate
                                        )
                                      : "-"}
                                  </Text>
                                </Stack>
                              </InputLayout>
                            </FormControl>

                            <FormControl
                              id="note"
                              isInvalid={formik.errors.note ? true : false}
                            >
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
                                  <FormErrorMessage>
                                    {formik.errors.note}
                                  </FormErrorMessage>
                                </Stack>
                              </InputLayoutFull>
                            </FormControl>

                            <Divider />

                            <FormControl id="backlogFeatures">
                              <InputLayoutFull>
                                <FormLabel h={"full"} mt={2}>
                                  Fitur Aplikasi
                                </FormLabel>
                                <Stack spacing={2} h={"full"}>
                                  <Flex
                                    as={Stack}
                                    w={"full"}
                                    p={2}
                                    border={"1px"}
                                    borderColor={
                                      colorMode == "light"
                                        ? "gray.200"
                                        : "gray.600"
                                    }
                                    boxShadow={"md"}
                                    rounded={radiusStyle}
                                  >
                                    <Button
                                      w={"full"}
                                      leftIcon={<FiPlusCircle />}
                                      colorScheme={"secondary"}
                                      onClick={() => handleOpenForm()}
                                    >
                                      Tambah Fitur
                                    </Button>

                                    <TableComponentFull table={table} />
                                  </Flex>
                                </Stack>
                              </InputLayoutFull>
                            </FormControl>
                          </Flex>
                        </InputGroupPanel>
                        <InputGroupPanel
                          headerTitle={`Ringkasan Ruanglingkup ${TYPE_REQ} | Aspek Teknis`}
                        >
                          <Flex as={Stack} w={"full"} spacing={5}>
                            <FormControl>
                              <InputLayoutFull>
                                <FormLabel h={"full"} mt={2}>
                                  Target Lokasi Server
                                </FormLabel>
                                <Stack spacing={0} h={"full"}>
                                  <CheckboxGroup>
                                    <Grid
                                      templateColumns="repeat(2, 1fr)"
                                      gap={1}
                                      w={"full"}
                                    >
                                      {APP_ENV_LOCATION_OPTIONS.map(
                                        (item, idx) => (
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
                                              isChecked={SelectedAppsEnvLoc.includes(
                                                item
                                              )}
                                              onChange={() =>
                                                handleAppysEnvLocCheckboxChange(
                                                  item
                                                )
                                              }
                                            >
                                              {item}
                                            </Checkbox>
                                          </GridItem>
                                        )
                                      )}
                                    </Grid>
                                  </CheckboxGroup>
                                  {hasOtherEnvLocTypes && (
                                    <Flex as={Stack} w={"full"} pt={2}>
                                      <Text>Input Lainnya</Text>
                                      <OtherInputAppsStringSeparator
                                        value={
                                          formik.values.appEnvLocationsOthers ||
                                          ""
                                        }
                                        onChange={(val) => {
                                          formik.setFieldValue(
                                            "appEnvLocationsOthers",
                                            val
                                          );
                                        }}
                                      />
                                    </Flex>
                                  )}
                                  <FormHelperText as={"i"} fontSize={"xs"}>
                                    Jika server aplikasi ditempatkan di pihak
                                    ketiga, harap cantumkan alamat lokasi
                                    (Domain/Data Center).*
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
                                      formik.setFieldValue(
                                        "appPrivateAuth",
                                        val
                                      )
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
                                      formik.setFieldValue(
                                        "appHightAvailability",
                                        val
                                      )
                                    }
                                    value={
                                      formik.values.appHightAvailability ?? ""
                                    }
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
                                    value={
                                      formik.values.appIntegrationOthersApps ||
                                      ""
                                    }
                                    onChange={(val) => {
                                      formik.setFieldValue(
                                        "appIntegrationOthersApps",
                                        val
                                      );
                                    }}
                                  />
                                  <FormErrorMessage>
                                    {formik.errors.appAccessMedia}
                                  </FormErrorMessage>
                                  <Divider py={1} />
                                  <Text fontSize={"smaller"} py={2}>
                                    Tambah Cepat
                                  </Text>
                                  <FormControl>
                                    <FormLabel>
                                      Rekomendasi Aplikasi Lain / Surrounding
                                    </FormLabel>
                                    <Flex as={Wrap} w={"full"}>
                                      {APP_INTEGRATED_OTHER_APPS.filter(
                                        (item) => {
                                          const existingTags = (
                                            formik.values
                                              .appIntegrationOthersApps || ""
                                          )
                                            .split(",")
                                            .map((t) => t.trim());

                                          return !existingTags.includes(item);
                                        }
                                      ).map((item, index) => (
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
                                            handleQuickAddTagIntegratedApps(
                                              item
                                            );
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
                      </Flex>
                    )}

                    {activeStep === 4 && (
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

                        {/* Table Preview */}
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

                    {/* <Box
                      overflowY={"auto"}
                      overflowX={"auto"}
                      maxH={"350px"}
                      p={2}
                      bgColor={"gray.200"}
                    >
                      <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                    </Box> */}
                  </Flex>
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
                      <Button
                        colorScheme={"green"}
                        leftIcon={<FiSave />}
                        // type={"submit"}
                        //   onClick={() => setSaveAsDraft(false)}
                        onClick={() => handleConfirmSaveData(formik.values)}
                        isLoading={ActionLoading}
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
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </form>
    </LayoutAdmin>
  );
}

export default RequirementsBRDRegisterView;
