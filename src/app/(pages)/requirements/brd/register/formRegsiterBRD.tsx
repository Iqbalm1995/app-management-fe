"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputGroupPanel } from "@/app/components/customPanels";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import DivisionListSelected from "@/app/components/inputProps/divisionListSelected";
import DivisionListSearch from "@/app/components/inputProps/divisionSearch";
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
  DELAY_MEDIUM,
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
import useDivision, { DivisionResponse } from "@/app/services/useDivisions";
import useRequirements, {
  ReqAssignUserPayload,
  ReqBacklogPayload,
  RequirementsInsertPayload,
  RequirementsResponse,
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
import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { redirect, useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiMinusCircle,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiXCircle,
} from "react-icons/fi";
import * as Yup from "yup";
import { Select } from "chakra-react-select";
import { useDropzone } from "react-dropzone";
import { FaRegTrashCan } from "react-icons/fa6";
import useMediaObject, {
  InsertMediaObjectByKeyPayload,
} from "@/app/services/useMediaObject";
import RegistrationNumberInput from "@/app/components/inputProps/RegistrationNumberInput";
import EmailInputMask from "@/app/components/inputProps/emailInputMask";
import VersionCodeInput from "@/app/components/inputProps/versionInput";

const TYPE_REQ: string = REQUIREMENT_TYPE_BRD;

const HeaderDataContent: HeaderContentProps = {
  titleName: `Registrasi ${TYPE_REQ}`,
  breadCrumb: ["Home", "Requirements", TYPE_REQ, "Registrasi"],
};

const FormSchema = Yup.object().shape({
  reffParentId: Yup.string().nullable(),

  requirementType: Yup.string().required("Requirement type is required"),
  reqNumber: Yup.string().required("Request number is required"),
  reqNarative: Yup.string().required("Narrative is required"),
  reqInititateDate: Yup.string().required("Initiate date is required"),
  reqAcceptedDate: Yup.string().nullable(),
  reqStatus: Yup.string().required("Status is required"),
  isCarryOver: Yup.mixed<"Y" | "N">()
    .oneOf(["Y", "N"])
    .required("Carry over is required"),

  reqReviewStartDate: Yup.string().nullable(),

  assignedFromId: Yup.string().required("Assigned from ID is required"),
  assignedFromName: Yup.string().required("Assigned from name is required"),
  assignedToId: Yup.string().nullable(),
  assignedToName: Yup.string().nullable(),
  assignedToDate: Yup.string().required("Assigned to date is required"),

  userPicId: Yup.string().required("User PIC ID is required"),
  userPicName: Yup.string().required("User PIC name is required"),
  userPicContanct: Yup.string().required("User PIC contact is required"),
  userPicEmail: Yup.string()
    .email("Invalid email format")
    .required("User PIC email is required"),

  workProgramCodeEx: Yup.string().required("External code is required"),
  workProgramNameEx: Yup.string().required("External name is required"),
  workProgramAccNameEx: Yup.string().required(
    "External account name is required"
  ),
  workProgramAccNumberEx: Yup.string().required(
    "External account number is required"
  ),
  workProgramAccCcUser: Yup.string().required("External CC user is required"),
  workProgramBudgetUser: Yup.number().required("External budget is required"),
  workProgramRealUsers: Yup.number().required(
    "External realization is required"
  ),

  workProgramCodeInt: Yup.string().required("Internal code is required"),
  workProgramNameInt: Yup.string().required("Internal name is required"),
  workProgramAccNameInt: Yup.string().required(
    "Internal account name is required"
  ),
  workProgramAccNumberInt: Yup.string().required(
    "Internal account number is required"
  ),
  workProgramAccCcInt: Yup.string().required("Internal CC is required"),
  workProgramBudgetInt: Yup.number().required("Internal budget is required"),
  workProgramRealInt: Yup.number().required("Internal realization is required"),

  appInitialCode: Yup.string().required("App initial code is required"),
  appInitialName: Yup.string().required("App initial name is required"),
  backlogFeature: Yup.string().nullable(),

  backlogDescription: Yup.string().nullable(),
  backlogChange: Yup.string().nullable(),
  note: Yup.string().nullable(),

  involvedDivisionIds: Yup.array()
    .of(Yup.string())
    .required("Involved division IDs are required"),
  senderDivisionId: Yup.string().required("Sender division ID is required"),

  picAssignUsers: Yup.array().of(
    Yup.object().shape({
      userId: Yup.string().required("User ID is required"),
      isChecked: Yup.mixed<"Y" | "N">()
        .oneOf(["Y", "N"])
        .required("isChecked is required"),
    })
  ),

  backlogFeatures: Yup.array().of(
    Yup.object().shape({
      backlogId: Yup.string().nullable(),
      backlogName: Yup.string().required("Backlog name is required"),
      backlogDesc: Yup.string().nullable(),
    })
  ),
});

const initialValues: RequirementsInsertPayload = {
  reffParentId: null,
  requirementType: REQUIREMENT_TYPE_BRD,
  reqNumber: "",
  reqNarative: "",
  reqInititateDate: formatDateToYYYYMMDD(new Date()), // Will be parsed as Date later
  reqAcceptedDate: formatDateToYYYYMMDD(new Date()),
  reqStatus: REQUIREMENT_STATUS_NEW,
  reqReviewStartDate: null,
  isCarryOver: "N",

  assignedFromId: "",
  assignedFromName: "",
  assignedToId: null,
  assignedToName: null,
  assignedToDate: formatDateToYYYYMMDD(new Date()),

  userPicId: "",
  userPicName: "",
  userPicContanct: "",
  userPicEmail: "",

  workProgramCodeEx: "",
  workProgramNameEx: "",
  workProgramAccNameEx: "",
  workProgramAccNumberEx: "",
  workProgramAccCcUser: "",
  workProgramBudgetUser: 0,
  workProgramRealUsers: 0,

  workProgramCodeInt: "",
  workProgramNameInt: "",
  workProgramAccNameInt: "",
  workProgramAccNumberInt: "",
  workProgramAccCcInt: "",
  workProgramBudgetInt: 0,
  workProgramRealInt: 0,

  appInitialCode: "",
  appInitialName: "",
  backlogFeature: null,

  backlogDescription: null,
  backlogChange: null,
  note: null,

  involvedDivisionIds: [],
  senderDivisionId: "",
  picAssignUsers: [],
  backlogFeatures: [],
};

function RequirementsBRDRegisterView() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List, GetDetailById, InsertReq } = useRequirements();
  const { InsertMediaObjectByKey } = useMediaObject();
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListDivisions } = useDivision();

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
    schema: Yup.ObjectSchema<any>
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
    if (DataAuth && DataAuth.teamMember) {
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
    if (DataAuth && DataAuth.teamMember) {
      formik.resetForm({ values: formik.initialValues });
      // formik.setFieldValue("id", null);
    }
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
      fieldOrder: ["userFirstName"],
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

  const [DataDivisions, setDataDivisions] = useState<DivisionResponse[]>([]);
  const [DivisionSelected, setDivisionSelected] = useState<DivisionResponse[]>(
    []
  );
  const [DivisionSearchText, setDivisionSearchText] = useState<string>("");
  // Append function
  const handleAddDivision = (division: DivisionResponse) => {
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
      formik.setFieldValue("assignedFromId", user.userCode);
      formik.setFieldValue(
        "assignedFromName",
        `${user.userFirstName} ${user.userLastName}`
      );
      handleSearchUser(user.userCode, "searchAssignedFromUser");
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
      formik.setFieldValue("userPicId", user.userCode);
      formik.setFieldValue(
        "userPicName",
        `${user.userFirstName} ${user.userLastName}`
      );
      handleSearchUser(user.userCode, "searchPICUser");
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
    const mappedPayload: ReqAssignUserPayload[] = ChoosedMemberProjects.map(
      (user) => ({
        userId: user.id,
        isChecked: "N", // default
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

  const GetDataDivision = async (
    searchValue: string = "",
    limit: number = 1
  ): Promise<DivisionResponse[]> => {
    setIsLoadingDivisionSelect(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [],
      fieldOrder: ["divisionName"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListDivisions(PayloadList, token);
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

      const itemsData: DivisionResponse[] =
        requestData.data as DivisionResponse[];

      const mapOptionData: OptionListProps[] = itemsData.map((d) => ({
        label: `${d.divisionName} (${d.divisionCode})`,
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
    { title: "Step 4", description: "Ringkasan Ruanglinkup" },
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
                <FormLabel>Nama Fitur Aplikasi</FormLabel>
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
              <Button
                size={"lg"}
                colorScheme={"green"}
                leftIcon={<FiSave />}
                type={"submit"}
                //   onClick={() => setSaveAsDraft(false)}
                isLoading={ActionLoading}
                isDisabled={activeStep !== steps.length - 1}
                px={8}
              >
                Simpan
              </Button>
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
                      index={activeStep}
                      orientation={"horizontal"}
                      height={"100%"}
                      pb={4}
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
                        <InputGroupPanel
                          headerTitle={`Informasi Umum ${TYPE_REQ}`}
                        >
                          <Input
                            id="requirementType"
                            name="requirementType"
                            type="hidden"
                            value={formik.values.requirementType ?? ""}
                            readOnly
                          />
                          <Input
                            id="reqStatus"
                            name="reqStatus"
                            type="hidden"
                            value={formik.values.reqStatus ?? ""}
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
                                <Select
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
                                Nomor {TYPE_REQ}
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
                                Perihal {TYPE_REQ}
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Textarea
                                  id="reqNarative"
                                  name="reqNarative"
                                  onChange={formik.handleChange}
                                  defaultValue={formik.values.reqNarative ?? ""}
                                  placeholder={`Perlihal ${TYPE_REQ}`}
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
                                Tanggal Inisiasi Memo
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
                                  )}
                                </Text>
                                <FormErrorMessage>
                                  {calculateDurationInDays(
                                    formik.values.reqInititateDate ||
                                      new Date().toISOString(),
                                    formik.values.reqAcceptedDate ||
                                      new Date().toISOString()
                                  ) < 0 && "Duration days cannot minus"}
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
                                          <Avatar
                                            name={dt.userFirstName}
                                            src=""
                                          />
                                        </Box>
                                        <Box>
                                          <Stack spacing={0}>
                                            <Text
                                              color={"gray.900"}
                                              fontWeight={600}
                                            >
                                              {dt.userFirstName}{" "}
                                              {dt.userLastName} ({dt.userCode})
                                            </Text>
                                            <Text
                                              fontWeight={500}
                                              fontSize={"small"}
                                              color={"gray.700"}
                                            >
                                              {dt.team?.teamName} |{" "}
                                              {dt.teamRole?.teamRoleName}
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
                                                <Avatar
                                                  name={dt.userFirstName}
                                                  src=""
                                                />
                                              </Box>
                                              <Box>
                                                <Stack spacing={0}>
                                                  <Text
                                                    color={"gray.900"}
                                                    fontWeight={600}
                                                  >
                                                    {dt.userFirstName}{" "}
                                                    {dt.userLastName} (
                                                    {dt.userCode})
                                                  </Text>
                                                  <Text
                                                    fontWeight={500}
                                                    fontSize={"small"}
                                                    color={"secondary.700"}
                                                  >
                                                    {dt.team?.teamName} |{" "}
                                                    {dt.teamRole?.teamRoleName}
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
                          headerTitle={`Informasi User ${TYPE_REQ}`}
                        >
                          <FormControl
                            id="searchPICUser"
                            isInvalid={formik.errors.userPicId ? true : false}
                            isRequired
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                User PIC
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
                            id="userPicContanct"
                            isInvalid={
                              formik.errors.userPicContanct ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Kontak PIC (Handphone)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="userPicContanct"
                                  name="userPicContanct"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={formik.values.userPicContanct ?? ""}
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
                        </InputGroupPanel>
                      </Flex>
                    )}
                    {activeStep === 2 && (
                      <Flex as={Stack} w={"full"} spacing={5}>
                        <InputGroupPanel headerTitle={`Program Kerja User`}>
                          <FormControl
                            id="workProgramCodeEx"
                            isInvalid={
                              formik.errors.workProgramCodeEx ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Kode Program Kerja User
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <VersionCodeInput
                                  id="workProgramCodeEx"
                                  name="workProgramCodeEx"
                                  type="text"
                                  // onChange={formik.handleChange}
                                  onChange={(val) =>
                                    formik.setFieldValue(
                                      "workProgramCodeEx",
                                      val
                                    )
                                  }
                                  value={formik.values.workProgramCodeEx ?? ""}
                                  placeholder={`0.0.0.0`}
                                  minLength={3}
                                  isDisabled={ActionLoading}
                                  useDoubleDigits={false}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramCodeEx}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramNameEx"
                            isInvalid={
                              formik.errors.workProgramNameEx ? true : false
                            }
                            isRequired
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nama Program Kerja User
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramNameEx"
                                  name="workProgramNameEx"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={formik.values.workProgramNameEx ?? ""}
                                  placeholder={`Nama Program Kerja User`}
                                  minLength={3}
                                  maxLength={150}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramNameEx}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl
                            id="workProgramAccNameEx"
                            isInvalid={
                              formik.errors.workProgramAccNameEx ? true : false
                            }
                            isRequired
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nama Rekening User
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramAccNameEx"
                                  name="workProgramAccNameEx"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={
                                    formik.values.workProgramAccNameEx ?? ""
                                  }
                                  placeholder={`Nama Rekening User`}
                                  minLength={3}
                                  maxLength={150}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramAccNameEx}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl
                            id="workProgramAccNumberEx"
                            isInvalid={
                              formik.errors.workProgramAccNumberEx
                                ? true
                                : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Nomor Rekening User
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramAccNumberEx"
                                  name="workProgramAccNumberEx"
                                  type="text"
                                  onChange={(e) => {
                                    const onlyNums = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    formik.setFieldValue(
                                      "workProgramAccNumberEx",
                                      onlyNums
                                    );
                                  }}
                                  value={
                                    formik.values.workProgramAccNumberEx ?? ""
                                  }
                                  placeholder={`Nomor Rekening User`}
                                  minLength={4}
                                  maxLength={6}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramAccNumberEx}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramAccCcUser"
                            isInvalid={
                              formik.errors.workProgramAccCcUser ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Kode CC User
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramAccCcUser"
                                  name="workProgramAccCcUser"
                                  type="text"
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    ); // remove non-digits
                                    formik.setFieldValue(
                                      "workProgramAccCcUser",
                                      raw
                                    );
                                  }}
                                  value={
                                    formik.values.workProgramAccCcUser ?? ""
                                  }
                                  placeholder="44444"
                                  minLength={4}
                                  maxLength={5}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramAccCcUser}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramBudgetUser"
                            isInvalid={
                              formik.errors.workProgramBudgetUser ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Anggaran User (Rp.)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <CurrencyInput
                                  name="workProgramBudgetUser"
                                  value={formik.values.workProgramBudgetUser}
                                  onChange={formik.setFieldValue}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramBudgetUser}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramRealUsers"
                            isInvalid={
                              formik.errors.workProgramRealUsers ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Realisasi (Rp.)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <CurrencyInput
                                  name="workProgramRealUsers"
                                  value={formik.values.workProgramRealUsers}
                                  onChange={formik.setFieldValue}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramRealUsers}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            // isInvalid={
                            //   formik.values.workProgramBudgetUser <
                            //   formik.values.workProgramRealUsers
                            // }
                            color={nomCompColor(
                              formik.values.workProgramBudgetUser -
                                formik.values.workProgramRealUsers
                            )}
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Sisa (Rp.)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <CurrencyInput
                                  name="leftOverExt"
                                  value={
                                    formik.values.workProgramBudgetUser -
                                    formik.values.workProgramRealUsers
                                  }
                                  onChange={formik.setFieldValue}
                                  isReadOnly
                                />
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </InputGroupPanel>
                        <InputGroupPanel headerTitle={`Program Kerja IT`}>
                          <FormControl
                            id="workProgramCodeInt"
                            isInvalid={
                              formik.errors.workProgramCodeInt ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Kode Program Kerja IT
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <VersionCodeInput
                                  id="workProgramCodeInt"
                                  name="workProgramCodeInt"
                                  type="text"
                                  onChange={(val) =>
                                    formik.setFieldValue(
                                      "workProgramCodeInt",
                                      val
                                    )
                                  }
                                  value={formik.values.workProgramCodeInt ?? ""}
                                  placeholder={`0.0.0.0`}
                                  minLength={3}
                                  isDisabled={ActionLoading}
                                  useDoubleDigits={false}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramCodeInt}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramNameInt"
                            isInvalid={
                              formik.errors.workProgramNameInt ? true : false
                            }
                            isRequired
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nama Program Kerja IT
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramNameInt"
                                  name="workProgramNameInt"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={formik.values.workProgramNameInt ?? ""}
                                  placeholder={`Nama Program Kerja IT`}
                                  minLength={3}
                                  maxLength={150}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramNameInt}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl
                            id="workProgramAccNameInt"
                            isInvalid={
                              formik.errors.workProgramAccNameInt ? true : false
                            }
                            isRequired
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Nama Rekening IT
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramAccNameInt"
                                  name="workProgramAccNameInt"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={
                                    formik.values.workProgramAccNameInt ?? ""
                                  }
                                  placeholder={`Nama Rekening IT`}
                                  minLength={3}
                                  maxLength={150}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramAccNameInt}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayoutFull>
                          </FormControl>

                          <FormControl
                            id="workProgramAccNumberInt"
                            isInvalid={
                              formik.errors.workProgramAccNumberInt
                                ? true
                                : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Nomor Rekening IT
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramAccNumberInt"
                                  name="workProgramAccNumberInt"
                                  type="text"
                                  onChange={(e) => {
                                    const onlyNums = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    formik.setFieldValue(
                                      "workProgramAccNumberInt",
                                      onlyNums
                                    );
                                  }}
                                  value={
                                    formik.values.workProgramAccNumberInt ?? ""
                                  }
                                  placeholder={`Nomor Rekening IT`}
                                  minLength={4}
                                  maxLength={6}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramAccNumberEx}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramAccCcInt"
                            isInvalid={
                              formik.errors.workProgramAccCcInt ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Kode CC IT
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="workProgramAccCcInt"
                                  name="workProgramAccCcInt"
                                  type="text"
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    ); // remove non-digits
                                    formik.setFieldValue(
                                      "workProgramAccCcInt",
                                      raw
                                    );
                                  }}
                                  value={
                                    formik.values.workProgramAccCcInt ?? ""
                                  }
                                  placeholder="44444"
                                  minLength={4}
                                  maxLength={5}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramAccCcUser}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramBudgetInt"
                            isInvalid={
                              formik.errors.workProgramBudgetInt ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Anggaran IT (Rp.)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <CurrencyInput
                                  name="workProgramBudgetInt"
                                  value={formik.values.workProgramBudgetInt}
                                  onChange={formik.setFieldValue}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramBudgetInt}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            id="workProgramRealInt"
                            isInvalid={
                              formik.errors.workProgramRealInt ? true : false
                            }
                            isRequired
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Realisasi(Rp.)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <CurrencyInput
                                  name="workProgramRealInt"
                                  value={formik.values.workProgramRealInt}
                                  onChange={formik.setFieldValue}
                                />
                                <FormErrorMessage>
                                  {formik.errors.workProgramRealInt}
                                </FormErrorMessage>
                              </Stack>
                            </InputLayout>
                          </FormControl>

                          <FormControl
                            color={nomCompColor(
                              formik.values.workProgramBudgetInt -
                                formik.values.workProgramRealInt
                            )}
                          >
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Sisa (Rp.)
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <CurrencyInput
                                  name="leftverInt"
                                  value={
                                    formik.values.workProgramBudgetInt -
                                    formik.values.workProgramRealInt
                                  }
                                  onChange={formik.setFieldValue}
                                  isReadOnly
                                />
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </InputGroupPanel>
                      </Flex>
                    )}
                    {activeStep === 3 && (
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
                        <Text fontWeight={600}>
                          Ringkasan Ruanglinkup {TYPE_REQ}
                        </Text>
                        <Divider />

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
                                onChange={formik.handleChange}
                                value={formik.values.appInitialCode ?? ""}
                                placeholder={`CMS / SISMON / dsb.`}
                                minLength={3}
                                maxLength={50}
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

                        <FormControl
                          id="backlogFeatures"
                          isInvalid={
                            formik.errors.backlogDescription ? true : false
                          }
                        >
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
                                  colorMode == "light" ? "gray.200" : "gray.600"
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
                              <FormErrorMessage>
                                {formik.errors.backlogDescription}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>

                        {/* <FormControl
                            id="divisionSeachText"
                            isInvalid={formik.errors.involvedDivisionIds ? true : false}
                          >
                            <InputLayoutFull>
                              <FormLabel h={"full"} mt={2}>
                                Division Involved
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <Input
                                  id="divisionSeachText"
                                  name="divisionSeachText"
                                  type="text"
                                  onChange={(e) =>
                                    setDivisionSearchText(e.target.value)
                                  }
                                  value={DivisionSearchText}
                                  placeholder={`Search Divisions`}
                                  // minLength={3}
                                  maxLength={150}
                                  isDisabled={ActionLoading}
                                />
                                <FormErrorMessage>
                                  {formik.errors.involvedDivisionIds}
                                </FormErrorMessage>
        
                                <DivisionListSearch
                                  key={"divisionSeachText"}
                                  divisionData={DataDivisions}
                                  onDivisionSelect={handleAddDivision}
                                />
        
                                <DivisionListSelected
                                  key={"DivisionSelcted"}
                                  divisionDataSelected={DivisionSelected}
                                  onDivisionSelect={handleRemoveDivision}
                                />
                              </Stack>
                            </InputLayoutFull>
                          </FormControl> */}
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
                                    <Tooltip label={file.name} hasArrow>
                                      <Text noOfLines={1} maxW="200px">
                                        {file.name}
                                      </Text>
                                    </Tooltip>
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
                      >
                        Selanjutnya
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
