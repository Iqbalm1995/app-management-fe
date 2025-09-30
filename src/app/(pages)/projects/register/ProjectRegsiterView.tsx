"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import InputSelectOptions from "@/app/components/inputProps/inputSelectOptions";
import RegProjectNumberInput from "@/app/components/inputProps/ProjectRegNumberInput";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  InputLayout,
  InputLayoutFull,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import InvalidLoadPageView from "@/app/components/InvalidLoadPageView";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  DELAY_MEDIUM,
  DIRECTORATE_ID_IT_BJB,
  DIVISION_ID_IT_BJB,
  ENV_SIDE_OPTIONS,
  KEY_OPTION_PROJECT_ACQUISITIONS,
  KEY_OPTION_PROJECT_CHARACTERISTICS,
  MAINTENANCE_CATEGORY_OPTIONS,
  MAINTENANCE_TYPE_OPTIONS,
  MAX_SIZE_TABLE,
  ORG_CATEGORY_KEY_DIRECTORATE,
  ORG_CATEGORY_KEY_DIVISION,
  ORG_CATEGORY_KEY_GROUP,
  PROJEC_CATEGORY_OPTIONS,
  PROJEC_TYPE_OPTIONS,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  SELECTED_OPTION_DIVISION,
  WORK_PROGRAM_EXTERNAL,
  WORK_PROGRAM_INTERNAL,
  WorkflowProjectDevelopmentId,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  calculateDurationInDays,
  getPriorityFromMatrix,
  priorityColor,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useProjects, {
  ProjectInsertPayload,
  ProjectUserInsertPayload,
} from "@/app/services/useProjects";
import useWorkflow, { WorkflowGroupResponse } from "@/app/services/useWorkflow";
import useWorkflowPreset, {
  WorkflowPresetResponse,
} from "@/app/services/useWorkflowPreset";
import useRequirements, {
  BacklogDataResponse,
  BacklogUpdatePayload,
  mapBacklogArrayToUpdatePayload,
  RequirementsResponse,
  RequirementWorkProgramDataResponse,
  WorkProgramsPayload,
} from "@/app/services/useRequirements";
import useUsers, {
  UserOrganizationResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import {
  ColumnMetaCustom,
  ListSearchByParam,
  ListSearchByParamProps,
  OptionDivisionDynamic,
  OptionListProps,
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
  FormControl,
  FormLabel,
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
  Radio,
  RadioGroup,
  Badge,
  FormErrorMessage,
  Avatar,
  Spacer,
  Tooltip,
  Textarea,
  Tab,
  Checkbox,
  VStack,
  Icon,
  WrapItem,
  FormHelperText,
  Alert,
  AlertIcon,
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
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiExternalLink,
  FiInfo,
  FiMinus,
  FiMinusCircle,
  FiPlus,
  FiPlusCircle,
  FiPlusSquare,
  FiSave,
  FiSettings,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import * as yup from "yup";
import { Select } from "chakra-react-select";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaCircle, FaTrash } from "react-icons/fa";
import { TabButtonCustom } from "@/app/components/TabsCustom";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import { InputGroupPanel } from "@/app/components/customPanels";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import ModalRegisterProject from "../../project-development/components/ModalRegisterProject";
import RequirementListChooseData from "../../project-development/components/RequirementListChooseData";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import VersionCodeInput from "@/app/components/inputProps/versionInput";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Registrasi Project",
  breadCrumb: ["Home", "Project Manager", "Registrasi Project"],
};

const projectsAssignBindModelSchema = yup.object({
  userId: yup.string().required("User ID is required"),
});

const projectsInsertBindModelSchema = yup.object({
  projectNo: yup.string().nullable(),
  projectName: yup.string().required("Project name is required"),
  projectDesc: yup.string().nullable(),
  note: yup.string().nullable(),
  projectCategory: yup.string().required("Project category is required"),
  projectType: yup.string().required("Project type is required"),
  projectRegisterDate: yup
    .string()
    .required("Project Register Date is required"),
  projectClosedDate: yup.string().nullable(),
  proOwnerDivisionId: yup.string().nullable(),
  proOwnerGroupId: yup.string().nullable(),
  proManageByDivisionId: yup.string().nullable(),
  proManageByGroupId: yup.string().nullable(),
  proManageByTeamId: yup.string().nullable(),
  reqParentId: yup.string().nullable(),
  userAssigns: yup
    .array()
    .of(projectsAssignBindModelSchema)
    .required("User assigns are required"),
});

export const initialProjectsInsertValues: ProjectInsertPayload = {
  projectNo: "", // Optional
  projectName: "", // Required
  projectDesc: "", // Optional
  note: "", // Optional
  projectCategory: "", // Required
  projectType: "", // Required
  projectRegisterDate: "", // Optional
  projectClosedDate: null, // Optional
  projectAcquisitionCode: null, // Optional
  projectCharasteristicCode: null, // Optional
  projectSubCharasteristicCode: null, // Optional
  proOwnerDirectorateId: "", // Optional
  proManageByDirectorateId: "", // Optional
  proOwnerDivisionId: "", // Optional
  proOwnerGroupId: "", // Optional
  proManageByDivisionId: "", // Optional
  proManageByGroupId: "", // Optional
  proManageByTeamId: "", // Optional
  reqParentId: "", // Optional
  userAssigns: [], // Required (at least an empty array)
  projectPlanWorkflowIds: [],
  workPrograms: [],
};

interface ProjectRegisterViewProps {
  projectTypeRegister: string;
}

function ProjectRegisterView({
  projectTypeRegister,
}: ProjectRegisterViewProps) {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const {
    GetDetailById: GetReqDetail,
    ListBacklog,
    UpdateBacklogBatch,
  } = useRequirements();
  const { GetDetailByInitial: GetAppByInitial } = useApps();
  const { ListConstantData } = useConstants();
  const { InsertProjects } = useProjects();
  const {
    GetDetailByUserId: GetUserID,
    List: ListUsers,
    GetDetailOrgByUserId,
  } = useUsers();
  const { List: ListOrganization } = useOrganization();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [ActionLoading, setActionLoading] = useState(false);

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

  // Services
  const GetUserIDServices = async (
    userId: string
  ): Promise<UsersResponse | null> => {
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await GetUserID(userId, token);
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

      const itemsData: UsersResponse = requestData.data as UsersResponse;

      return itemsData;
    }
  };

  const GetUserOrganizationServices = async (
    userId: string
  ): Promise<UserOrganizationResponse | null> => {
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await GetDetailOrgByUserId(userId, token);
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

      const itemsData: UserOrganizationResponse =
        requestData.data as UserOrganizationResponse;

      return itemsData;
    }
  };

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
      //   label: `${d.orgName} | ${d.orgType}`,
      //   value: d.id,
      // }));

      return itemsData;
    }
  };

  const UpdateBacklogProject = async (
    data: BacklogUpdatePayload[]
  ): Promise<boolean> => {
    const requestData = await UpdateBacklogBatch(data, tokenData);
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
        description: "Feature Success",
        statusToast: "success",
      });
      return true;
    }
  };

  const RegisterProjectData = async (data: ProjectInsertPayload) => {
    const requestData = await InsertProjects(data, tokenData);
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

      const updatePayloadList: BacklogUpdatePayload[] =
        mapBacklogArrayToUpdatePayload(DataBacklogsRequirement);
      console.log(updatePayloadList);

      await UpdateBacklogProject(updatePayloadList);

      showToast({
        description: "Register new project data successfully",
        statusToast: "success",
      });

      setActionLoading(false);
      redirect(`/projects-manager/`);
      return;
    }
  };

  const GetOptionDataServ = async (
    groupCode: string,
    parentCode?: string | null
  ): Promise<OptionListProps[]> => {
    const PayloadList: PaggingListPayload = {
      search: "",
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere: [
        {
          field: "groupCode",
          operator: "=",
          value: groupCode || "",
        },
        {
          field: "parentGroupCode",
          operator: parentCode == null ? "is null" : "=",
          value: parentCode == null ? "null" : parentCode,
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
      return [];
    } else {
      if (requestData.data == null) {
        showToast({
          description: "Load option data return error, try again letter",
          statusToast: "error",
        });
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
      return [];
    }
  };

  const handleSelectedCustom = (data: OptionListProps, fieldData: string) => {
    formik.setFieldValue(fieldData, data.value);
  };

  const handleUnSelectedCustom = (fieldData: string) => {
    formik.setFieldValue(fieldData, null);
  };

  const GetDataListBacklogs = async () => {
    if (DataRequirement != null) {
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
      const requestData = await ListBacklog(PayloadList, tokenData);
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      } else {
        // console.log(requestData);
        if (requestData.data == null) {
          showToast({
            description: "Data backlogs return error",
            statusToast: "error",
          });
          return;
        }

        const itemsData: BacklogDataResponse[] =
          requestData.data as BacklogDataResponse[];
        setDataBacklogsRequirement(itemsData);
      }
    }
  };

  // End - Services

  // load option acquisition project
  const [OptionAcquisitionProject, setOptionAcquisitionProject] = useState<
    OptionListProps[]
  >([]);

  const LoadAcquisitionProjectData = async () => {
    const LoadData = await GetOptionDataServ(
      KEY_OPTION_PROJECT_ACQUISITIONS,
      null
    );
    setOptionAcquisitionProject(LoadData);
  };

  // end load option acquisition project

  // load option characteristic project

  const [OptionCharacteristicProject, setOptionCharacteristicProject] =
    useState<OptionListProps[]>([]);
  const [OptionSubCharacteristicProject, setOptionSubCharacteristicProject] =
    useState<OptionListProps[]>([]);

  const LoadCharacteristicsProjectData = async () => {
    const LoadData = await GetOptionDataServ(
      KEY_OPTION_PROJECT_CHARACTERISTICS,
      null
    );
    setOptionCharacteristicProject(LoadData);
  };

  const LoadSubCharacteristicsProjectData = async (parentCode: string) => {
    const LoadData = await GetOptionDataServ(
      KEY_OPTION_PROJECT_CHARACTERISTICS,
      parentCode
    );
    setOptionSubCharacteristicProject(LoadData);
  };

  // end load char ptoject

  // load organization data
  const [OrganizationData, setOrganizationData] = useState<
    OrganizationResponse[]
  >([]);

  const LoadAllOrganizationData = async () => {
    const getData = await GetDataMasterOrg("", MAX_SIZE_TABLE, []);
    if (getData.length > 0) {
      setOrganizationData(getData);
    }
    setIsLoadingProcess(false);
  };

  // end load organization

  // Assign To Multiple
  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [ChoosedMemberProjects, setChoosedMemberProjects] = useState<
    UsersResponse[]
  >([]);

  const GetDataUser = async (
    searchValue: string,
    limit: number = 1
  ): Promise<UsersResponse[]> => {
    const whereDataFilter: ListSearchByParam[] = [
      //   {
      //     field: "kodeUnitKerja",
      //     operator: "=",
      //     value: SelectedDivision?.value || "",
      //   },
      // {
      //   field: "orgType",
      //   operator: "=",
      //   value: "GROUP",
      // },
    ];
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: whereDataFilter,
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

  useEffect(() => {
    const mappedPayload: ProjectUserInsertPayload[] = ChoosedMemberProjects.map(
      (user) => ({
        userId: user.userId,
      })
    );

    formik.setFieldValue("userAssigns", mappedPayload);
  }, [ChoosedMemberProjects]);

  const handleSearchUserAssign = async (textSearch: string) => {
    setDataUsers([]);
    setSearchUserInput(textSearch);
    if (textSearch.length >= 2) {
      const ListUserData: UsersResponse[] = await GetDataUser(textSearch, 5);
      setDataUsers(ListUserData);
    } else if (textSearch.length <= 0) {
      setDataUsers([]);
    }
  };

  const handleAddUserAssign = (data: UsersResponse) => {
    console.log("handleAddUserAssign insert Data :");
    console.log(data);
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

  // formik

  const formik = useFormik<ProjectInsertPayload>({
    initialValues: initialProjectsInsertValues,
    validationSchema: projectsInsertBindModelSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  // end - formik

  const [IsHaveMemo, setIsHaveMemo] = useState<"Y" | "N">("Y");
  const [DataRequirement, setDataRequirement] =
    useState<RequirementsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [ApplicationData, setApplicationData] =
    useState<ApplicationMasterResponse | null>(null);

  // Load Requirements
  const GetRequirementData = async (reqId: string) => {
    setIsLoadingProcess(true);
    const requestData = await GetReqDetail(reqId, tokenData);
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
      // console.log(requestData);
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

      // projectTypeRegister;
      formik.setFieldValue(`projectType`, projectTypeRegister);

      // get user org project manage
      if (itemsData.assignedFromId) {
        const ProjectManageOrg: UserOrganizationResponse | null =
          await GetUserOrganizationServices(itemsData.assignedFromId);
        if (ProjectManageOrg) {
          formik.setFieldValue(
            `proManageByDivisionId`,
            ProjectManageOrg.division.id
          );
          if (ProjectManageOrg.group) {
            formik.setFieldValue(
              `proManageByGroupId`,
              ProjectManageOrg.group.id
            );
          }
          if (ProjectManageOrg.team) {
            formik.setFieldValue(`proManageByTeamId`, ProjectManageOrg.team.id);
          }
        }
      }

      // get user org project manage
      if (itemsData.userPicDivisionId) {
        formik.setFieldValue(`proOwnerDivisionId`, itemsData.userPicDivisionId);
      }
      if (itemsData.userPicDivisionId) {
        formik.setFieldValue(`proOwnerGroupId`, itemsData.userPicGroupId);
      }

      const userAssignPoject: UsersResponse[] = [];

      // Set UserDefault Assign Project Member
      if (itemsData.assignedFromId != null) {
        const UserOwner = await GetUserIDServices(itemsData.assignedFromId);
        if (UserOwner) {
          userAssignPoject.push(UserOwner);
        }
      }

      // insert user reviewer in parallel and wait for all
      if (itemsData.approvalDatas.length > 0) {
        const reviewers = await Promise.all(
          itemsData.approvalDatas.map(async (dt) => {
            return await GetUserIDServices(dt.approverUserCode);
          })
        );

        reviewers.forEach((user) => {
          if (user) {
            userAssignPoject.push(user);
          }
        });
      }

      // Set state only after all async ops done
      if (userAssignPoject.length > 0) {
        setChoosedMemberProjects(userAssignPoject);
      }

      formik.setFieldValue("reqParentId", reqId);
      // End Set UserDefault Assign Project Member
      setIsLoadingProcess(false);
    }
  };

  // GetServiceListBacklog
  const [IsloadingBacklogs, setIsloadingBacklogs] = useState(false);
  const [DataBacklogsRequirement, setDataBacklogsRequirement] = useState<
    BacklogDataResponse[]
  >([]);

  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Workflow Groups State
  const [DataWorkflowGroups, setDataWorkflowGroups] = useState<
    WorkflowGroupResponse[]
  >([]);
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(
    new Set()
  );
  const [IsLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [DataWorkflowPresets, setDataWorkflowPresets] = useState<
    WorkflowPresetResponse[]
  >([]);
  const [selectedPreset, setSelectedPreset] =
    useState<WorkflowPresetResponse | null>(null);

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

    // showToast({
    //   description: "Fitur diubah",
    //   statusToast: "success",
    // });
  };

  // Load Workflow Groups
  const { ListWorkflowGroups } = useWorkflow();
  const { ListWorkflowPreset, GetWorkflowPresetById } = useWorkflowPreset();

  const handleSelectPreset = async (presetId: string) => {
    try {
      // If clicking the currently selected preset, clear selection
      if (selectedPreset?.id === presetId) {
        setSelectedPreset(null);
        setSelectedWorkflowIds(new Set());
        formik.setFieldValue("projectPlanWorkflowIds", []);
        return;
      }

      const requestData = await GetWorkflowPresetById(presetId, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setSelectedPreset(requestData.data);

        // Extract all workflow IDs including children
        const allWorkflowIds = new Set<string>();
        requestData.data.workflowData.forEach((group) => {
          allWorkflowIds.add(group.id);
          group.workflowChild.forEach((level2) => {
            allWorkflowIds.add(level2.id);
            level2.workflowChild.forEach((level3) => {
              allWorkflowIds.add(level3.id);
            });
          });
        });

        // Update formik and selectedWorkflowIds
        setSelectedWorkflowIds(allWorkflowIds);
        formik.setFieldValue(
          "projectPlanWorkflowIds",
          Array.from(allWorkflowIds)
        );
      }
    } catch (error) {
      console.error("Error loading preset detail:", error);
    }
  };

  const LoadWorkflowPresets = async () => {
    try {
      const PayloadList: PaggingListPayload = {
        limit: MAX_SIZE_TABLE,
        page: 0,
        search: "",
        filterWhere: [
          {
            field: "wfCategoryId",
            operator: "=",
            value: WorkflowProjectDevelopmentId,
          },
        ],
        fieldOrder: ["wfPresetName"],
        orderDir: "asc",
      };
      const requestData = await ListWorkflowPreset(PayloadList, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setDataWorkflowPresets(requestData.data);
      }
    } catch (error) {
      console.error("Error loading workflow presets:", error);
    }
  };

  const LoadWorkflowGroups = async () => {
    setIsLoadingWorkflow(true);
    try {
      const PayloadList: PaggingListPayload = {
        limit: MAX_SIZE_TABLE,
        page: 0,
        search: "",
        filterWhere: [
          {
            field: "parentId",
            operator: "=",
            value: "",
          },
          {
            field: "wfgLevel",
            operator: "=",
            value: "1",
          },
          {
            field: "wfgCategoryId",
            operator: "=",
            value: WorkflowProjectDevelopmentId,
          },
        ],
        fieldOrder: ["wfgOrder"],
        orderDir: "asc",
      };

      const requestData = await ListWorkflowGroups(PayloadList, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setDataWorkflowGroups(requestData.data);
      }
    } catch (error) {
      console.error("Error loading workflow groups:", error);
    } finally {
      setIsLoadingWorkflow(false);
    }
  };

  // Load workflow groups when token is available
  useEffect(() => {
    setIsLoadingProcess(true);
    if (tokenData) {
      LoadAllOrganizationData();
      // LoadDataDirectorate();
      LoadWorkflowGroups();
      LoadWorkflowPresets();
      LoadCharacteristicsProjectData();
      LoadAcquisitionProjectData();
      //   if (projectTypeRegister == PROJECT_TYPE_PROCUREMENT) {
      //     LoadAcquisitionProjectData();
      //   }
    }
  }, [tokenData]);

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

  // Load application data when requirement is selected
  useEffect(() => {
    if (DataRequirement?.appInitialCode && tokenData) {
      const loadApplicationData = async () => {
        try {
          const requestData = await GetAppByInitial(
            DataRequirement.appInitialCode!,
            tokenData
          );
          const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

          if (isErrorResponse || !requestData) {
            showToast({
              description: requestData?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            return;
          }

          if (requestData.data) {
            setApplicationData(requestData.data);
          }
        } catch (error) {
          console.error("Error loading application data:", error);
          showToast({
            description: "Failed to load application data",
            statusToast: "error",
          });
        }
      };

      loadApplicationData();
    }
  }, [DataRequirement?.appInitialCode, tokenData]);

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
    {
      title: "Step 1",
      description: (
        <HStack>
          <FiInfo />
          <Text>1. Project Information</Text>
        </HStack>
      ),
    },
    {
      title: "Step 2",
      description: (
        <HStack>
          <LiaFileInvoiceDollarSolid />
          <Text>2. Work Programs</Text>
        </HStack>
      ),
    },
    {
      title: "Step 3",
      description: (
        <HStack>
          <FiUsers />
          <Text>3. Team Information</Text>
        </HStack>
      ),
    },
    {
      title: "Step 4",
      description: (
        <HStack>
          <FiSettings />
          <Text>4. Feature Information</Text>
        </HStack>
      ),
    },
    {
      title: "Step 5",
      description: (
        <HStack>
          <FiBriefcase />
          <Text>5. Work Stages</Text>
        </HStack>
      ),
    },
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

  const goToSection = async (index: number) => {
    setActiveStep(index);
  };

  useEffect(() => {
    if (projectTypeRegister == PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
      if (DataRequirement == null && activeStep > 0) {
        showToast({
          description: "Diharuskan untuk memilih Requirement (Memo)",
          statusToast: "warning",
        });
        setActiveStep(0);
      }
    }
  }, [activeStep]);

  // End Step Form

  // confirmation save data
  const [openConfirmSaveDialog, setOpenConfirmSaveDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");

  const handleConfirmSaveData = (data: ProjectInsertPayload) => {
    setCaptionDialog("Konfirmasi Simpan");
    setQuestionMsgDialog(
      `Apakah ada yakin akan submit data Project "${formik.values.projectName}"?`
    );
    setOpenConfirmSaveDialog(true);
  };

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);

    formik.setFieldValue(`projectCategory`, "PROJECT");
    formik.setFieldValue(`proManageByTeamId`, null);

    console.log(" Project Payload Insert : ");
    console.log(formik.values);
    console.log(" Backlog Data Payload Update : ");
    // DataBacklogsRequirement
    const updatePayloadList: BacklogUpdatePayload[] =
      mapBacklogArrayToUpdatePayload(DataBacklogsRequirement);
    console.log(updatePayloadList);

    var errorSum = 0;

    if (!formik.values.projectNo) {
      showToast({
        description: "Nomor Project masih kosong",
        statusToast: "warning",
      });
      errorSum++;
    }

    if (!formik.values.projectName) {
      showToast({
        description: "Nama Project masih kosong",
        statusToast: "warning",
      });
      errorSum++;
    }

    // if (!formik.values.projectCategory) {
    //   showToast({
    //     description: "Karakteristik Project masih kosong",
    //     statusToast: "warning",
    //   });
    //   errorSum++;
    // }

    if (!formik.values.projectType) {
      showToast({
        description: "Tipe Project masih kosong",
        statusToast: "warning",
      });
      errorSum++;
    }

    if (!formik.values.projectRegisterDate) {
      showToast({
        description: "Tanggal Register Project masih kosong",
        statusToast: "warning",
      });
      errorSum++;
    }

    // if (!formik.values.projectClosedDate) {
    //   showToast({
    //     description: "Tanggal Closed Project masih kosong",
    //     statusToast: "warning",
    //   });
    //   errorSum++;
    // }

    // if (
    //   calculateDurationInDays(
    //     formik.values.projectRegisterDate || new Date().toISOString(),
    //     formik.values.projectClosedDate || new Date().toISOString()
    //   ) < 0
    // ) {
    //   showToast({
    //     description: "Durasi Project tidak boleh minus",
    //     statusToast: "warning",
    //   });
    //   errorSum++;
    // }

    if (ChoosedMemberProjects.length <= 0) {
      showToast({
        description: "Member project tidak bolh kosong",
        statusToast: "warning",
      });
      errorSum++;
    }

    var DeadlineUnfilledDataBacklog = 0;
    if (updatePayloadList.length > 0) {
      updatePayloadList.map((bl) => {
        if (bl.backlogEnddate == null) {
          DeadlineUnfilledDataBacklog++;
        }
      });

      if (DeadlineUnfilledDataBacklog > 0) {
        showToast({
          description: `(${DeadlineUnfilledDataBacklog}) Data Deadline fitur belum diisi.`,
          statusToast: "warning",
        });
        errorSum++;
      }
    }

    if (errorSum > 0) {
      setActionLoading(false);
      return;
    }

    await RegisterProjectData(formik.values);

    // if (DataAuth && DataAuth.team) {
    //   await AddRequirement(formik.values);
    // } else {
    //   showToast({
    //     description: "ID is invalid",
    //     statusToast: "error",
    //   });
    //   setActionLoading(false);
    // }
  };

  const handleDialogSaveTrigger = () => {
    setOpenConfirmSaveDialog(!openConfirmSaveDialog);
  };

  // end - confirmation save data

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

    formik.setFieldValue("workPrograms", updatedPrograms);
  };

  const RemoveWorkProgram = (index: number) => {
    const updated = [...formik.values.workPrograms];
    updated.splice(index, 1);
    formik.setFieldValue("workPrograms", updated);
  };

  // END WORK PROGRAM STATE

  // open modal memo

  const ModalForm = useDisclosure();
  const handleModalMemmo = () => {
    ModalForm.onOpen();
  };

  // end open modal memo

  // load reff from data requirements
  useEffect(() => {
    // projectTypeRegister;
    formik.setFieldValue(`projectType`, projectTypeRegister);
    formik.setFieldValue(`projectCategory`, "PROJECT");
    if (DataAuth && DataRequirement && tokenData) {
      if (IsHaveMemo == "Y") {
        GetDataListBacklogs();

        formik.setFieldValue(`reqParentId`, DataRequirement.id);

        formik.setFieldValue(
          "proOwnerDirectorateId",
          DataRequirement.senderDirectorateId
        );
        // LoadDataDivision(
        //   DataRequirement.senderDirectorateId || "",
        //   "proOwnerDivisionId"
        // );
        formik.setFieldValue(
          "proOwnerDivisionId",
          DataRequirement.senderDivisionId
        );

        const mapDataWorkPrograms = mapWorkProgramData(
          DataRequirement.workPrograms
        );
        formik.setFieldValue("workPrograms", mapDataWorkPrograms);

        const CountInternalWorkPrograms = mapDataWorkPrograms.filter(
          (f) => f.workProgramSource == WORK_PROGRAM_INTERNAL
        ).length;
        const CountExternalWorkPrograms = mapDataWorkPrograms.filter(
          (f) => f.workProgramSource == WORK_PROGRAM_EXTERNAL
        ).length;

        if (CountInternalWorkPrograms > 0) {
          setWorkProgramInt("1");
        }
        if (CountExternalWorkPrograms > 0) {
          setWorkProgramExt("1");
        }

        const userAssignPoject: UsersResponse[] = [];
        // get user org project manage
        const GetUserManageProject = async () => {
          if (DataRequirement.assignedFromId) {
            const ProjectManageOrg: UserOrganizationResponse | null =
              await GetUserOrganizationServices(DataRequirement.assignedFromId);
            // if (ProjectManageOrg) {
            //   formik.setFieldValue(
            //     `proManageByDivisionId`,
            //     ProjectManageOrg.division.id
            //   );
            //   if (ProjectManageOrg.group) {
            //     formik.setFieldValue(
            //       `proManageByGroupId`,
            //       ProjectManageOrg.group.id
            //     );
            //   }
            //   if (ProjectManageOrg.team) {
            //     formik.setFieldValue(
            //       `proManageByTeamId`,
            //       ProjectManageOrg.team.id
            //     );
            //   }
            // }
          }

          // Set UserDefault Assign Project Member
          if (DataRequirement.assignedFromId != null) {
            const UserOwner = await GetUserIDServices(
              DataRequirement.assignedFromId
            );
            if (UserOwner) {
              userAssignPoject.push(UserOwner);
            }
          }

          // insert user reviewer in parallel and wait for all
          if (DataRequirement.approvalDatas.length > 0) {
            const reviewers = await Promise.all(
              DataRequirement.approvalDatas.map(async (dt) => {
                return await GetUserIDServices(dt.approverUserCode);
              })
            );

            reviewers.forEach((user) => {
              if (user) {
                userAssignPoject.push(user);
              }
            });
          }

          // Set state only after all async ops done
          if (userAssignPoject.length > 0) {
            setChoosedMemberProjects(userAssignPoject);
          }
        };
        GetUserManageProject();
      } else {
        handleResetReffFromRequirementData();
      }
    } else {
      handleResetReffFromRequirementData();
    }
  }, [DataAuth, DataRequirement]);

  // end load reff from data requirements

  const mapWorkProgramData = (
    dataResponse: RequirementWorkProgramDataResponse[]
  ) => {
    // map with WorkProgramsPayload
    return dataResponse.map((item) => ({
      directorateId: item.directorateId || "",
      divisionId: item.divisionId,
      groupId: item.groupId,
      workProgramSource: item.workProgramSource,
      workProgramCode: item.workProgramCode,
      workProgramName: item.workProgramName,
      workProgramAccName: item.workProgramAccName,
      workProgramAccNumber: item.workProgramAccNumber,
      workProgramAccCc: item.workProgramAccCc,
      workProgramBudget: item.workProgramBudget,
      workProgramReal: item.workProgramReal,
    }));
  };

  // reset filled data from req
  const handleResetReffFromRequirementData = () => {
    formik.setFieldValue("proOwnerDirectorateId", null);
    formik.setFieldValue("proOwnerDivisionId", null);
    setDataBacklogsRequirement([]);
    formik.setFieldValue("workPrograms", []);
    setWorkProgramExt("0");
    setWorkProgramInt("0");
    formik.setFieldValue("userAssigns", []);
    setApplicationData(null);

    formik.setFieldValue(`reqParentId`, null);
  };
  // end reset filled data from req

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <ConfirmationDialog
        key={"confirmSaveData"}
        isOpenTrigger={openConfirmSaveDialog}
        action={handleSaveData}
        trigger={handleDialogSaveTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      {/* MODAL LIST REUQIREMENTS */}

      <Modal
        size={"6xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>Pilih Memo</ModalHeader>
          <ModalCloseButton />
          <ModalBody w={"full"}>
            <RequirementListChooseData
              selectedRequirement={DataRequirement}
              onRequirementSelect={setDataRequirement}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme={"gray"}
              leftIcon={<FiX />}
              onClick={ModalForm.onClose}
              isLoading={ActionLoading}
            >
              Kembali
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}> */}
      {/* Requirement Validation */}
      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
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
            >
              <Button
                colorScheme="green"
                leftIcon={<FiSave />}
                onClick={() => handleConfirmSaveData(formik.values)}
                isDisabled={activeStep !== steps.length - 1 || ActionLoading}
                // display={activeStep === steps.length - 1 ? "flex" : "none"}
                isLoading={ActionLoading}
                px={8}
                size={"lg"}
              >
                Submit Data
              </Button>
            </Flex>
          </GridItem>

          {/* Requirement Information */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
            <Card
              shadow="md"
              // bgColor={colorMode == "light" ? "white" : "gray.800"}
              bgGradient={"linear(to-br, secondary.800, secondary.500)"}
              rounded={radiusStyle}
              h={"180px"}
            >
              <CardBody>
                <Flex as={Stack} spacing={2}>
                  <Text fontSize="md" fontWeight="bold" color={"white"}>
                    REQUIREMENT REFERENCE (MEMO) :
                  </Text>
                  <Divider borderColor={"whiteAlpha.400"} />
                  <HStack spacing={4} align="center">
                    <Box
                      w={14}
                      h={14}
                      bg={"white"}
                      rounded="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        color="secondary.800"
                        fontWeight="bold"
                        fontSize={"x-large"}
                      >
                        {/* {DataRequirement.reqNarative.charAt(0).toUpperCase()} */}
                        {DataRequirement
                          ? DataRequirement.requirementType.toUpperCase()
                          : "-"}
                      </Text>
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <Wrap spacing={{ base: 0, sm: 0, md: 3, lg: 3 }}>
                        <WrapItem>
                          <Link
                            href={
                              DataRequirement
                                ? `/requirements/detail?reqId=${DataRequirement.id}&type=BRD`
                                : "#"
                            }
                          >
                            <Button
                              variant={"link"}
                              fontSize="lg"
                              fontWeight="bold"
                              color={"white"}
                              rightIcon={
                                DataRequirement ? (
                                  <FiExternalLink />
                                ) : (
                                  <FiAlertTriangle color={"yellow.400"} />
                                )
                              }
                            >
                              {DataRequirement
                                ? DataRequirement.reqNarative.toUpperCase()
                                : "NO REQUIREMENT REFERENCE"}
                            </Button>
                          </Link>
                        </WrapItem>
                        <WrapItem>
                          <Badge
                            colorScheme="blue"
                            fontSize="xs"
                            px={4}
                            rounded={radiusStyle}
                          >
                            {DataRequirement ? DataRequirement.reqNumber : "-"}
                          </Badge>
                        </WrapItem>
                      </Wrap>
                      <Text fontSize="sm" color="secondary.200">
                        {DataRequirement
                          ? DataRequirement.reqNarative ||
                            "No description available"
                          : "-"}
                      </Text>
                      <HStack spacing={4}>
                        <Text fontSize="xs" color="gray.300">
                          Requirement ID:{" "}
                          {DataRequirement ? DataRequirement.id : "-"}
                        </Text>
                        <Text fontSize="xs" color="gray.300">
                          Status:{" "}
                          {DataRequirement ? DataRequirement.reqStatus : "-"}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* Application Information */}
          <GridItem
            colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}
            w={"full"}
            display={ApplicationData != null ? "box" : "none"}
          >
            <Card
              shadow="md"
              bgColor={colorMode == "light" ? "white" : "gray.800"}
              //   bgGradient={"linear(to-br, secondary.800, secondary.500)"}
              rounded={radiusStyle}
              h={"180px"}
            >
              <CardBody>
                <Flex
                  as={Stack}
                  spacing={2}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color={colorMode == "light" ? "gray.800" : "white"}
                    lineHeight={1}
                  >
                    APPS PROJECT
                  </Text>
                  <Link href={`#`}>
                    <Box
                      w={14}
                      h={14}
                      bgGradient={"linear(to-br, secondary.800, secondary.500)"}
                      rounded="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow={"md"}
                      cursor={"pointer"}
                      transition="box-shadow 0.3s ease"
                      _hover={{
                        boxShadow: "0 0 20px rgba(66, 153, 225, 0.6)",
                      }}
                    >
                      <Text
                        color={"white"}
                        fontWeight="bold"
                        fontSize={"x-large"}
                      >
                        {ApplicationData
                          ? ApplicationData.appShortName.toUpperCase()
                          : "-"}
                      </Text>
                    </Box>
                  </Link>
                  <Link href={`#`}>
                    <Button
                      variant={"link"}
                      fontSize="sm"
                      fontWeight="bold"
                      textAlign={"center"}
                      lineHeight={1}
                      color={
                        colorMode == "light" ? "secondary.800" : "secondary.500"
                      }
                      rightIcon={
                        DataRequirement ? (
                          <FiExternalLink />
                        ) : (
                          <FiAlertTriangle color={"yellow.400"} />
                        )
                      }
                    >
                      {DataRequirement
                        ? DataRequirement.reqNarative.toUpperCase()
                        : "NO APP REFERENCE"}
                    </Button>
                  </Link>
                  <Badge
                    colorScheme="blue"
                    fontSize="xs"
                    px={4}
                    rounded={radiusStyle}
                  >
                    {ApplicationData ? "#" + ApplicationData.appShortName : "-"}
                  </Badge>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
            <Card
              w={"fill"}
              bgColor={colorMode == "light" ? "white" : "gray.800"}
              rounded={radiusStyle}
            >
              <CardBody>
                <Flex w={"full"} as={Stack} spacing={4}>
                  <Flex as={HStack} spacing={4} pb={6} overflowX={"auto"}>
                    {steps.map((step, index) => (
                      <TabButtonCustom
                        activeStep={activeStep}
                        goToSection={() => goToSection(index)}
                        idx={index}
                        tabProp={<>{step.description}</>}
                        key={index}
                      />
                    ))}
                  </Flex>

                  {/* PROJECT INFORMATION */}
                  {activeStep === 0 && (
                    <Flex as={Stack} w={"full"} spacing={5} p={4}>
                      <InputGroupPanel headerTitle={`Memo Pengantar`}>
                        <Flex w={"full"} alignItems={"center"} minH={"15vh"}>
                          <FormControl id={"isHaveMemo"} isRequired={true}>
                            <InputLayout>
                              <FormLabel h={"full"} mt={2}>
                                Sudah Memiliki Memo Pengantar
                              </FormLabel>
                              <Stack spacing={0} h={"full"}>
                                <RadioGroup
                                  onChange={(val) => {
                                    setIsHaveMemo(val as "Y" | "N");
                                  }}
                                  value={IsHaveMemo ?? "Y"}
                                >
                                  <Flex w={"full"} as={HStack} spacing={8}>
                                    <Radio value={"Y"}>Sudah</Radio>
                                    <Radio
                                      value={"N"}
                                      isDisabled={
                                        projectTypeRegister !=
                                        PROJECT_TYPE_PROCUREMENT
                                      }
                                    >
                                      Belum
                                    </Radio>
                                  </Flex>
                                </RadioGroup>
                                <FormHelperText as={"i"} fontSize={"xs"}>
                                  Jika belum memiliki Memo pengantar, ada
                                  benerapa informasi yang akan inputkan lain
                                  waktu jika Memo pengantar sudah ada.*
                                </FormHelperText>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </Flex>

                        <FormControl
                          id="projectNo"
                          isInvalid={formik.errors.projectNo ? true : false}
                          isRequired={IsHaveMemo == "Y"}
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Pilih Requirement (Memo)
                            </FormLabel>
                            <Stack spacing={0}>
                              {/* <RegProjectNumberInput */}
                              <Wrap>
                                <Input
                                  id="reqDataId"
                                  name="reqDataId"
                                  type="text"
                                  value={DataRequirement?.reqNumber || ""}
                                  placeholder={`0000/00/BJB/XXXX/0000-A/0`}
                                  // minLength={25}
                                  // maxLength={27}
                                  isRequired
                                  isDisabled={DataRequirement != null}
                                  w={{
                                    base: "full",
                                    sm: "full",
                                    md: "350px",
                                    lg: "350px",
                                  }}
                                />
                                <Button
                                  colorScheme={"secondary"}
                                  onClick={() => handleModalMemmo()}
                                >
                                  Pilih Memo
                                </Button>
                              </Wrap>
                              <FormErrorMessage>
                                {formik.errors.projectNo}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>
                      </InputGroupPanel>

                      <InputGroupPanel headerTitle={`Informasi Umum`}>
                        <FormControl
                          id="projectNo"
                          isInvalid={formik.errors.projectNo ? true : false}
                          isRequired
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Nomor Project
                            </FormLabel>
                            <Stack spacing={0}>
                              {/* <RegProjectNumberInput */}
                              <Input
                                id="projectNo"
                                name="projectNo"
                                type="text"
                                onChange={formik.handleChange}
                                // onChange={(val) =>
                                //   formik.setFieldValue("projectNo", val)
                                // }
                                value={formik.values.projectNo ?? ""}
                                placeholder={`0000/00/BJB/XXXX/0000-A/0`}
                                minLength={25}
                                maxLength={27}
                                isDisabled={ActionLoading}
                                w={{
                                  base: "full",
                                  sm: "full",
                                  md: "350px",
                                  lg: "350px",
                                }}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectNo}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl
                          id={"projectAcquisitionCode"}
                          isInvalid={
                            formik.errors.projectAcquisitionCode ? true : false
                          }
                          isRequired={
                            projectTypeRegister == PROJECT_TYPE_PROCUREMENT
                          }
                          display={
                            projectTypeRegister == PROJECT_TYPE_PROCUREMENT
                              ? "flex"
                              : "none"
                          }
                        >
                          <InputLayout>
                            <FormLabel h={"full"}>Jenis Pengadaan</FormLabel>
                            <Stack spacing={0} w={"full"}>
                              <Select
                                id={`projectAcquisitionCode`}
                                options={OptionAcquisitionProject}
                                isSearchable={true}
                                onChange={(e) => {
                                  if (e) {
                                    const selected = {
                                      label: e.label,
                                      value: e.value,
                                    };
                                    handleSelectedCustom(
                                      selected,
                                      "projectAcquisitionCode"
                                    );
                                  } else {
                                    handleUnSelectedCustom(
                                      "projectAcquisitionCode"
                                    );
                                  }
                                }}
                                placeholder={"Pilih Jenis Pengadaan"}
                                value={OptionAcquisitionProject.find(
                                  (x) =>
                                    x.value ==
                                    formik.values.projectAcquisitionCode
                                )}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectAcquisitionCode}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl
                          id="projectName"
                          isInvalid={formik.errors.projectName ? true : false}
                          isRequired
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Nama Project
                            </FormLabel>
                            <Stack spacing={0} h={"full"}>
                              <Input
                                id="projectName"
                                name="projectName"
                                type="text"
                                // onChange={formik.handleChange}

                                onChange={(e) => {
                                  // const onlyAlphabets = e.target.value.replace(
                                  //   /[^a-zA-Z ]/g,
                                  //   ""
                                  // );
                                  formik.setFieldValue(
                                    `projectName`,
                                    e.target.value
                                  );
                                }}
                                value={formik.values.projectName ?? ""}
                                placeholder={`Nama Project`}
                                minLength={3}
                                maxLength={200}
                                // isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectName}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl>
                          <InputLayoutFull>
                            <FormLabel h={"full"} mt={2}>
                              Divisi Yang Menginisiasi
                            </FormLabel>
                            <Stack spacing={0}>
                              <Grid
                                templateColumns="repeat(3, 1fr)"
                                gap={3}
                                w={"full"}
                              >
                                <GridItem
                                  colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                                  w={"full"}
                                >
                                  <FormControl
                                    id={"proOwnerDirectorateId"}
                                    isInvalid={
                                      formik.errors.proOwnerDirectorateId
                                        ? true
                                        : false
                                    }
                                    isRequired
                                  >
                                    <FormLabel h={"full"} mt={2}>
                                      Direktorat
                                    </FormLabel>
                                    <Select
                                      id={`proOwnerDirectorateId`}
                                      options={OrganizationData.filter(
                                        (f) =>
                                          f.orgType ==
                                          ORG_CATEGORY_KEY_DIRECTORATE
                                      ).map((d) => ({
                                        label: `${d.orgName} | ${d.orgType}`,
                                        value: d.id,
                                      }))}
                                      isSearchable={true}
                                      onChange={(e) => {
                                        if (e) {
                                          const selected = {
                                            label: e.label,
                                            value: e.value,
                                          };
                                          handleSelectedCustom(
                                            selected,
                                            "proOwnerDirectorateId"
                                          );
                                        } else {
                                          handleUnSelectedCustom(
                                            "proOwnerDirectorateId"
                                          );
                                        }
                                      }}
                                      placeholder={"Pilih Directorate PIC"}
                                      value={OrganizationData.filter(
                                        (f) =>
                                          f.orgType ==
                                            ORG_CATEGORY_KEY_DIRECTORATE &&
                                          f.id ==
                                            formik.values.proOwnerDirectorateId
                                      ).map((d) => ({
                                        label: `${d.orgName} | ${d.orgType}`,
                                        value: d.id,
                                      }))}
                                    />

                                    <FormErrorMessage>
                                      {formik.errors.proOwnerDirectorateId}
                                    </FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                                <GridItem
                                  colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                                  w={"full"}
                                >
                                  <FormControl
                                    id={"proOwnerDivisionId"}
                                    isInvalid={
                                      formik.errors.proOwnerDivisionId
                                        ? true
                                        : false
                                    }
                                    isRequired
                                  >
                                    <FormLabel h={"full"} mt={2}>
                                      Divisi
                                    </FormLabel>
                                    <Select
                                      id={`proOwnerDivisionId`}
                                      options={OrganizationData.filter(
                                        (f) =>
                                          f.orgType ==
                                            ORG_CATEGORY_KEY_DIVISION &&
                                          f.parentId ==
                                            formik.values.proOwnerDirectorateId
                                      ).map((d) => ({
                                        label: `${d.orgName} | ${d.orgType}`,
                                        value: d.id,
                                      }))}
                                      isSearchable={true}
                                      onChange={(e) => {
                                        if (e) {
                                          const selected = {
                                            label: e.label,
                                            value: e.value,
                                          };
                                          handleSelectedCustom(
                                            selected,
                                            "proOwnerDivisionId"
                                          );
                                          //   setSelectedDivisionPIC(selected);
                                        } else {
                                          handleUnSelectedCustom(
                                            "proOwnerDivisionId"
                                          );
                                          //   setSelectedDivisionPIC(null);
                                        }
                                      }}
                                      placeholder={"Pilih Divisi"}
                                      isLoading={IsLoadingProcess}
                                      value={OrganizationData.filter(
                                        (f) =>
                                          f.orgType ==
                                            ORG_CATEGORY_KEY_DIVISION &&
                                          f.id ==
                                            formik.values.proOwnerDivisionId
                                      ).map((d) => ({
                                        label: `${d.orgName} | ${d.orgType}`,
                                        value: d.id,
                                      }))}
                                    />

                                    <FormErrorMessage>
                                      {formik.errors.proOwnerDivisionId}
                                    </FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                                <GridItem
                                  colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
                                  w={"full"}
                                >
                                  <FormControl
                                    id={"proOwnerGroupId"}
                                    isInvalid={
                                      formik.errors.proOwnerGroupId
                                        ? true
                                        : false
                                    }
                                    // isRequired
                                  >
                                    <FormLabel h={"full"} mt={2}>
                                      Grup
                                    </FormLabel>

                                    <Select
                                      id={`proOwnerGroupId`}
                                      options={OrganizationData.filter(
                                        (f) =>
                                          f.orgType == ORG_CATEGORY_KEY_GROUP &&
                                          f.parentId ==
                                            formik.values.proOwnerDivisionId
                                      ).map((d) => ({
                                        label: `${d.orgName} | ${d.orgType}`,
                                        value: d.id,
                                      }))}
                                      isSearchable={true}
                                      onChange={(e) => {
                                        if (e) {
                                          const selected = {
                                            label: e.label,
                                            value: e.value,
                                          };
                                          handleSelectedCustom(
                                            selected,
                                            "proOwnerGroupId"
                                          );
                                          //   setSelectedGroupOrgPIC(selected);
                                        } else {
                                          handleUnSelectedCustom(
                                            "proOwnerGroupId"
                                          );
                                          //   setSelectedGroupOrgPIC(null);
                                        }
                                      }}
                                      placeholder={"Pilih Group"}
                                      isLoading={IsLoadingProcess}
                                      value={OrganizationData.filter(
                                        (f) =>
                                          f.orgType == ORG_CATEGORY_KEY_GROUP &&
                                          f.id == formik.values.proOwnerGroupId
                                      ).map((d) => ({
                                        label: `${d.orgName} | ${d.orgType}`,
                                        value: d.id,
                                      }))}
                                    />
                                    <FormErrorMessage>
                                      {formik.errors.proOwnerGroupId}
                                    </FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                              </Grid>
                            </Stack>
                          </InputLayoutFull>
                        </FormControl>

                        <FormControl
                          id={"projectCharasteristicCode"}
                          isInvalid={
                            formik.errors.projectCharasteristicCode
                              ? true
                              : false
                          }
                          isRequired
                        >
                          <InputLayout>
                            <FormLabel h={"full"}>
                              Karakteristik Project
                            </FormLabel>
                            <Stack spacing={0} w={"full"}>
                              <Select
                                id={`projectCharasteristicCode`}
                                options={OptionCharacteristicProject}
                                isSearchable={true}
                                onChange={(e) => {
                                  if (e) {
                                    const selected = {
                                      label: e.label,
                                      value: e.value,
                                    };
                                    LoadSubCharacteristicsProjectData(
                                      selected.value
                                    );
                                    handleSelectedCustom(
                                      selected,
                                      "projectCharasteristicCode"
                                    );
                                  } else {
                                    handleUnSelectedCustom(
                                      "projectCharasteristicCode"
                                    );
                                    setOptionSubCharacteristicProject([]);
                                  }
                                }}
                                placeholder={"Pilih Karakteristik Projek"}
                                value={OptionCharacteristicProject.find(
                                  (x) =>
                                    x.value ==
                                    formik.values.projectCharasteristicCode
                                )}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectCharasteristicCode}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl
                          id={"projectSubCharasteristicCode"}
                          isInvalid={
                            formik.errors.projectSubCharasteristicCode
                              ? true
                              : false
                          }
                          isRequired
                        >
                          <InputLayout>
                            <FormLabel h={"full"}>
                              Sub Karakteristik Project
                            </FormLabel>
                            <Stack spacing={2} w={"full"}>
                              <Select
                                id={`projectSubCharasteristicCode`}
                                options={OptionSubCharacteristicProject}
                                isDisabled={
                                  OptionSubCharacteristicProject.length <= 0
                                }
                                isSearchable={true}
                                onChange={(e) => {
                                  if (e) {
                                    const selected = {
                                      label: e.label,
                                      value: e.value,
                                    };
                                    handleSelectedCustom(
                                      selected,
                                      "projectSubCharasteristicCode"
                                    );
                                  } else {
                                    handleUnSelectedCustom(
                                      "projectSubCharasteristicCode"
                                    );
                                  }
                                }}
                                placeholder={"Pilih Sub Karakteristik Projek"}
                                value={OptionCharacteristicProject.find(
                                  (x) =>
                                    x.value ==
                                    formik.values.projectSubCharasteristicCode
                                )}
                              />

                              <Alert
                                status="info"
                                rounded={"md"}
                                display={
                                  formik.values.projectSubCharasteristicCode !=
                                  null
                                    ? "flex"
                                    : "none"
                                }
                              >
                                <AlertIcon />
                                Chakra is going live on August 30th. Get ready!
                              </Alert>
                              <FormErrorMessage>
                                {formik.errors.projectSubCharasteristicCode}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl
                          id="projectDesc"
                          isInvalid={formik.errors.projectDesc ? true : false}
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Deskripsi
                            </FormLabel>
                            <Stack spacing={0} h={"full"}>
                              <Textarea
                                id="projectDesc"
                                name="projectDesc"
                                onChange={formik.handleChange}
                                defaultValue={formik.values.projectDesc ?? ""}
                                placeholder={`Perlihal`}
                                maxLength={300}
                                // isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectDesc}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl
                          id="projectRegisterDate"
                          isInvalid={
                            formik.errors.projectRegisterDate ? true : false
                          }
                          isRequired
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Tanggal Register Project
                            </FormLabel>
                            <Stack spacing={0} h={"full"}>
                              <Input
                                id="projectRegisterDate"
                                name="projectRegisterDate"
                                type="date"
                                onChange={formik.handleChange}
                                value={formik.values.projectRegisterDate}
                                // isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.projectRegisterDate}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>

                        <FormControl
                          id="note"
                          isInvalid={formik.errors.note ? true : false}
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Note
                            </FormLabel>
                            <Stack spacing={0} h={"full"}>
                              <Textarea
                                id="note"
                                name="note"
                                onChange={formik.handleChange}
                                defaultValue={formik.values.note ?? ""}
                                placeholder={`Perlihal`}
                                maxLength={300}
                                // isDisabled={ActionLoading}
                              />
                              <FormErrorMessage>
                                {formik.errors.note}
                              </FormErrorMessage>
                            </Stack>
                          </InputLayout>
                        </FormControl>
                      </InputGroupPanel>
                    </Flex>
                  )}

                  {/* WORK PROGRAMS */}
                  {activeStep === 1 && (
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
                                isDisabled={DataRequirement != null}
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
                                      display={
                                        DataRequirement != null ? "none" : "box"
                                      }
                                    >
                                      <FaTrash />
                                    </Button>
                                  </Flex>

                                  <FormControl>
                                    <InputLayoutFull>
                                      <FormLabel h={"full"} mt={2}>
                                        Divisi Proker User
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
                                              md: 1,
                                              lg: 1,
                                            }}
                                            w={"full"}
                                          >
                                            <FormControl
                                              id={`workProgramDirectorate-${index}`}
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
                                              <FormLabel h={"full"}>
                                                Direktorat
                                              </FormLabel>
                                              <Stack spacing={0}>
                                                {/* DIRECTORATE */}
                                                <Select
                                                  isDisabled={
                                                    DataRequirement != null
                                                  }
                                                  id={`workProgramDirectorate-${index}`}
                                                  options={OrganizationData.filter(
                                                    (f) =>
                                                      f.orgType ==
                                                      ORG_CATEGORY_KEY_DIRECTORATE
                                                  ).map((d) => ({
                                                    label: `${d.orgName} | ${d.orgType}`,
                                                    value: d.id,
                                                  }))}
                                                  isSearchable={true}
                                                  onChange={(e) => {
                                                    if (e) {
                                                      const selected = {
                                                        label: e.label,
                                                        value: e.value,
                                                      };

                                                      handleSelectedCustom(
                                                        selected,
                                                        `workPrograms[${index}].directorateId`
                                                      );
                                                    } else {
                                                      handleUnSelectedCustom(
                                                        `workPrograms[${index}].directorateId`
                                                      );
                                                    }
                                                  }}
                                                  placeholder={
                                                    "Pilih Directorate"
                                                  }
                                                  isLoading={IsLoadingProcess}
                                                  value={OrganizationData.filter(
                                                    (f) =>
                                                      f.orgType ==
                                                        ORG_CATEGORY_KEY_DIRECTORATE &&
                                                      f.id ==
                                                        formik.values
                                                          .workPrograms[index]
                                                          .directorateId
                                                  ).map((d) => ({
                                                    label: `${d.orgName} | ${d.orgType}`,
                                                    value: d.id,
                                                  }))}
                                                />

                                                <FormErrorMessage>
                                                  {typeof formik.errors
                                                    .workPrograms?.[index] ===
                                                    "object" &&
                                                    formik.errors
                                                      .workPrograms?.[index]
                                                      ?.directorateId}
                                                </FormErrorMessage>
                                              </Stack>
                                            </FormControl>
                                          </GridItem>
                                          <GridItem
                                            colSpan={{
                                              base: 3,
                                              sm: 3,
                                              md: 1,
                                              lg: 1,
                                            }}
                                            w={"full"}
                                          >
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
                                              <FormLabel h={"full"}>
                                                Divisi
                                              </FormLabel>
                                              {/* DIVISION */}
                                              <Select
                                                isDisabled={
                                                  DataRequirement != null
                                                }
                                                id={`workProgramDivision-${index}`}
                                                options={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_DIVISION &&
                                                    f.parentId ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .directorateId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
                                                isSearchable={true}
                                                onChange={(e) => {
                                                  if (e) {
                                                    const selected = {
                                                      label: e.label,
                                                      value: e.value,
                                                    };
                                                    handleSelectedCustom(
                                                      selected,
                                                      `workPrograms[${index}].divisionId`
                                                    );
                                                  } else {
                                                    handleUnSelectedCustom(
                                                      `workPrograms[${index}].divisionId`
                                                    );
                                                  }
                                                }}
                                                placeholder={"Pilih Divisi"}
                                                isLoading={IsLoadingProcess}
                                                value={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_DIVISION &&
                                                    f.id ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .divisionId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
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
                                          </GridItem>
                                          <GridItem
                                            colSpan={{
                                              base: 3,
                                              sm: 3,
                                              md: 1,
                                              lg: 1,
                                            }}
                                            w={"full"}
                                          >
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
                                              <FormLabel h={"full"}>
                                                Group
                                              </FormLabel>
                                              {/* GROUP */}
                                              <Select
                                                isDisabled={
                                                  DataRequirement != null
                                                }
                                                id={`workProgramGroupDivision-${index}`}
                                                options={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_GROUP &&
                                                    f.parentId ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .divisionId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
                                                isSearchable={true}
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
                                                  } else {
                                                    handleUnSelectedCustom(
                                                      `workPrograms[${index}].groupId`
                                                    );
                                                  }
                                                }}
                                                placeholder={
                                                  "Pilih Group (Opsional)"
                                                }
                                                isLoading={IsLoadingProcess}
                                                value={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_GROUP &&
                                                    f.id ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .groupId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
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
                                          </GridItem>
                                        </Grid>
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                          useDoubleDigits={false}
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramCode}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramName}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramAccName}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramAccNumber}
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
                                            const raw = e.target.value.replace(
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramAccCc}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramBudget}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramReal}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
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
                                display={
                                  DataRequirement != null ? "none" : "box"
                                }
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
                                isDisabled={DataRequirement != null}
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
                                      display={
                                        DataRequirement != null ? "none" : "box"
                                      }
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
                                              md: 1,
                                              lg: 1,
                                            }}
                                            w={"full"}
                                          >
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
                                              <FormLabel h={"full"}>
                                                Direktorat
                                              </FormLabel>
                                              {/* DIRECTORATE */}
                                              <Select
                                                id={`workProgramDirectorateIT-${index}`}
                                                options={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                    ORG_CATEGORY_KEY_DIRECTORATE
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
                                                isDisabled={true}
                                                placeholder={
                                                  "Pilih Directorate"
                                                }
                                                isLoading={IsLoadingProcess}
                                                value={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_DIRECTORATE &&
                                                    f.id ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .directorateId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
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
                                          </GridItem>
                                          <GridItem
                                            colSpan={{
                                              base: 3,
                                              sm: 3,
                                              md: 1,
                                              lg: 1,
                                            }}
                                            w={"full"}
                                          >
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
                                              <FormLabel h={"full"}>
                                                Divisi
                                              </FormLabel>
                                              {/* DIVISION */}
                                              <Select
                                                id={`workProgramDivisionIT-${index}`}
                                                options={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_DIVISION &&
                                                    f.parentId ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .directorateId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
                                                isSearchable={true}
                                                isDisabled={true}
                                                placeholder={"Pilih Divisi"}
                                                isLoading={IsLoadingProcess}
                                                value={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_DIVISION &&
                                                    f.id ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .divisionId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
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
                                          </GridItem>
                                          <GridItem
                                            colSpan={{
                                              base: 3,
                                              sm: 3,
                                              md: 1,
                                              lg: 1,
                                            }}
                                            w={"full"}
                                          >
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
                                              <FormLabel h={"full"}>
                                                Group
                                              </FormLabel>
                                              {/* GROUP */}
                                              <Select
                                                id={`workProgramGroupDivisionIT-${index}`}
                                                options={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_GROUP &&
                                                    f.parentId ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .divisionId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
                                                isSearchable={true}
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
                                                  } else {
                                                    handleUnSelectedCustom(
                                                      `workPrograms[${index}].groupId`
                                                    );
                                                  }
                                                }}
                                                placeholder={
                                                  "Pilih Group (Opsional)"
                                                }
                                                isDisabled={
                                                  DataRequirement != null
                                                }
                                                isLoading={IsLoadingProcess}
                                                value={OrganizationData.filter(
                                                  (f) =>
                                                    f.orgType ==
                                                      ORG_CATEGORY_KEY_GROUP &&
                                                    f.id ==
                                                      formik.values
                                                        .workPrograms[index]
                                                        .groupId
                                                ).map((d) => ({
                                                  label: `${d.orgName} | ${d.orgType}`,
                                                  value: d.id,
                                                }))}
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
                                          </GridItem>
                                        </Grid>
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                          useDoubleDigits={false}
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramCode}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramName}
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
                                    isRequired
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramAccName}
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
                                    isRequired
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramAccNumber}
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
                                    isRequired
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
                                            const raw = e.target.value.replace(
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramAccCc}
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
                                    isRequired
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramBudget}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
                                        />
                                        <FormErrorMessage>
                                          {typeof formik.errors.workPrograms?.[
                                            index
                                          ] === "object" &&
                                            formik.errors.workPrograms?.[index]
                                              ?.workProgramReal}
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
                                          isDisabled={
                                            ActionLoading ||
                                            DataRequirement != null
                                          }
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
                                display={
                                  DataRequirement != null ? "none" : "box"
                                }
                              >
                                Tambah Proker Kerja
                              </Button>
                            </Flex>
                          </Flex>
                        )}
                      </InputGroupPanel>
                    </Flex>
                  )}

                  {/* TREAM INFORMAITON */}
                  {activeStep === 2 && (
                    <Flex as={Stack} w={"full"} spacing={5}>
                      <Grid
                        templateColumns="repeat(12, 1fr)"
                        gap={5}
                        w={"full"}
                      >
                        <GridItem
                          colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                          w={"full"}
                        >
                          <Card
                            rounded={radiusStyle}
                            boxShadow={"md"}
                            bgGradient={
                              "linear(to-br, secondary.800, secondary.500)"
                            }
                            color={"white"}
                            minH={"10vh"}
                          >
                            <CardHeader pb={1} fontWeight={600}>
                              Project Assigns ({ChoosedMemberProjects.length})
                            </CardHeader>
                            <CardBody>
                              <Flex
                                as={Stack}
                                w={"full"}
                                p={2}
                                spacing={3}
                                overflowX={"auto"}
                                minH={"50vh"}
                              >
                                {ChoosedMemberProjects.length <= 0 && (
                                  <Flex w={"full"} justifyContent={"center"}>
                                    <Text pt={5}>Not have personel yet.</Text>
                                  </Flex>
                                )}
                                {ChoosedMemberProjects.map((dt, index) => {
                                  return (
                                    <Flex
                                      bg={
                                        colorMode == "light"
                                          ? "white"
                                          : "gray.800"
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
                                            color={
                                              colorMode == "light"
                                                ? "gray.900"
                                                : "gray.100"
                                            }
                                            fontWeight={600}
                                          >
                                            {dt.nama} ({dt.userId})
                                          </Text>
                                          <Text
                                            fontWeight={500}
                                            fontSize={"small"}
                                            color={
                                              colorMode == "light"
                                                ? "secondary.800"
                                                : "secondary.200"
                                            }
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
                                            variant={"ghost"}
                                            rounded={radiusStyle}
                                            size={"md"}
                                            onClick={() =>
                                              handleRemoveUserAssign(dt.id)
                                            }
                                          >
                                            <FiX />
                                          </Button>
                                        </Tooltip>
                                      </>
                                    </Flex>
                                  );
                                })}
                              </Flex>
                            </CardBody>
                          </Card>
                        </GridItem>
                        <GridItem
                          colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                          w={"full"}
                          px={4}
                        >
                          <Flex as={Stack} w={"full"} spacing={5} py={0}>
                            <InputGroupPanel headerTitle={`Assign New User`}>
                              {/* <FormControl id={"filterDivisionId"}>
                                    <InputLayoutFull>
                                      <FormLabel h={"full"} mt={2}>
                                        Divisi
                                      </FormLabel>
                                      <Stack spacing={0}>
                                        <InputSelectOptions
                                          Id={"filterDivisionId"}
                                          OptionData={OptionDivision}
                                          SelectedData={SelectedDivision}
                                          handleSelectedData={handleSelectedDivision}
                                          handleUnSelectedData={
                                            handleUnSelectedDivision
                                          }
                                          placeholder={"Pilih Divisi Pengirim"}
                                          isDisable={true}
                                        />
                                      </Stack>
                                    </InputLayoutFull>
                                  </FormControl> */}

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
                                  </Stack>
                                </InputLayoutFull>
                              </FormControl>

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
                            </InputGroupPanel>
                            <InputGroupPanel
                              headerTitle={`Division Project Managed By`}
                            >
                              <FormControl>
                                <InputLayoutFull>
                                  <FormLabel h={"full"} mt={2}>
                                    Divisi Yang Mengatur Project
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
                                          id={"proManageByDirectorateId"}
                                          isInvalid={
                                            formik.errors
                                              .proManageByDirectorateId
                                              ? true
                                              : false
                                          }
                                          isRequired
                                        >
                                          <FormLabel h={"full"} mt={2}>
                                            Direktorat
                                          </FormLabel>
                                          <Select
                                            id={`proManageByDirectorateId`}
                                            options={OrganizationData.filter(
                                              (f) =>
                                                f.orgType ==
                                                ORG_CATEGORY_KEY_DIRECTORATE
                                            ).map((d) => ({
                                              label: `${d.orgName} | ${d.orgType}`,
                                              value: d.id,
                                            }))}
                                            isSearchable={true}
                                            onChange={(e) => {
                                              if (e) {
                                                const selected = {
                                                  label: e.label,
                                                  value: e.value,
                                                };
                                                handleSelectedCustom(
                                                  selected,
                                                  "proManageByDirectorateId"
                                                );
                                              } else {
                                                handleUnSelectedCustom(
                                                  "proManageByDirectorateId"
                                                );
                                              }
                                            }}
                                            placeholder={
                                              "Pilih Directorate PIC"
                                            }
                                            value={OrganizationData.filter(
                                              (f) =>
                                                f.orgType ==
                                                  ORG_CATEGORY_KEY_DIRECTORATE &&
                                                f.id ==
                                                  formik.values
                                                    .proManageByDirectorateId
                                            ).map((d) => ({
                                              label: `${d.orgName} | ${d.orgType}`,
                                              value: d.id,
                                            }))}
                                          />

                                          <FormErrorMessage>
                                            {
                                              formik.errors
                                                .proManageByDirectorateId
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
                                          id={"proManageByDivisionId"}
                                          isInvalid={
                                            formik.errors.proManageByDivisionId
                                              ? true
                                              : false
                                          }
                                          isRequired
                                        >
                                          <FormLabel h={"full"} mt={2}>
                                            Divisi
                                          </FormLabel>
                                          <Select
                                            id={`proManageByDivisionId`}
                                            options={OrganizationData.filter(
                                              (f) =>
                                                f.orgType ==
                                                  ORG_CATEGORY_KEY_DIVISION &&
                                                f.parentId ==
                                                  formik.values
                                                    .proOwnerDirectorateId
                                            ).map((d) => ({
                                              label: `${d.orgName} | ${d.orgType}`,
                                              value: d.id,
                                            }))}
                                            isSearchable={true}
                                            onChange={(e) => {
                                              if (e) {
                                                const selected = {
                                                  label: e.label,
                                                  value: e.value,
                                                };
                                                handleSelectedCustom(
                                                  selected,
                                                  "proManageByDivisionId"
                                                );
                                                //   setSelectedDivisionPIC(selected);
                                              } else {
                                                handleUnSelectedCustom(
                                                  "proManageByDivisionId"
                                                );
                                                //   setSelectedDivisionPIC(null);
                                              }
                                            }}
                                            placeholder={"Pilih Divisi"}
                                            isLoading={IsLoadingProcess}
                                            value={OrganizationData.filter(
                                              (f) =>
                                                f.orgType ==
                                                  ORG_CATEGORY_KEY_DIVISION &&
                                                f.id ==
                                                  formik.values
                                                    .proManageByDivisionId
                                            ).map((d) => ({
                                              label: `${d.orgName} | ${d.orgType}`,
                                              value: d.id,
                                            }))}
                                          />

                                          <FormErrorMessage>
                                            {
                                              formik.errors
                                                .proManageByDivisionId
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
                                          id={"proManageByGroupId"}
                                          isInvalid={
                                            formik.errors.proManageByGroupId
                                              ? true
                                              : false
                                          }
                                          // isRequired
                                        >
                                          <FormLabel h={"full"} mt={2}>
                                            Grup
                                          </FormLabel>

                                          <Select
                                            id={`proManageByGroupId`}
                                            options={OrganizationData.filter(
                                              (f) =>
                                                f.orgType ==
                                                  ORG_CATEGORY_KEY_GROUP &&
                                                f.parentId ==
                                                  formik.values
                                                    .proOwnerDivisionId
                                            ).map((d) => ({
                                              label: `${d.orgName} | ${d.orgType}`,
                                              value: d.id,
                                            }))}
                                            isSearchable={true}
                                            onChange={(e) => {
                                              if (e) {
                                                const selected = {
                                                  label: e.label,
                                                  value: e.value,
                                                };
                                                handleSelectedCustom(
                                                  selected,
                                                  "proManageByGroupId"
                                                );
                                                //   setSelectedGroupOrgPIC(selected);
                                              } else {
                                                handleUnSelectedCustom(
                                                  "proManageByGroupId"
                                                );
                                                //   setSelectedGroupOrgPIC(null);
                                              }
                                            }}
                                            placeholder={"Pilih Group"}
                                            isLoading={IsLoadingProcess}
                                            value={OrganizationData.filter(
                                              (f) =>
                                                f.orgType ==
                                                  ORG_CATEGORY_KEY_GROUP &&
                                                f.id ==
                                                  formik.values
                                                    .proManageByGroupId
                                            ).map((d) => ({
                                              label: `${d.orgName} | ${d.orgType}`,
                                              value: d.id,
                                            }))}
                                          />
                                          <FormErrorMessage>
                                            {formik.errors.proManageByGroupId}
                                          </FormErrorMessage>
                                        </FormControl>
                                      </GridItem>
                                    </Grid>
                                  </Stack>
                                </InputLayoutFull>
                              </FormControl>
                            </InputGroupPanel>
                          </Flex>
                        </GridItem>
                      </Grid>
                    </Flex>
                  )}

                  {/* FEATURE INFORMATION */}
                  {activeStep === 3 && (
                    <Flex as={Stack} w={"full"} spacing={5}>
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

                  {/* WORKSTAGES */}
                  {activeStep === 4 && (
                    <Flex as={Stack} w={"full"} spacing={5}>
                      {IsLoadingWorkflow ? (
                        <LoadingMiniSignature />
                      ) : DataWorkflowGroups.length > 0 ? (
                        <VStack align="start" spacing={4}>
                          <Grid
                            templateColumns="repeat(12, 1fr)"
                            gap={4}
                            w={"full"}
                          >
                            <GridItem
                              colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}
                              w={"full"}
                            >
                              <Flex
                                as={Stack}
                                p={6}
                                w={"full"}
                                spacing={4}
                                rounded={radiusStyle}
                                borderWidth={1}
                                boxShadow={"md"}
                                borderColor={
                                  colorMode == "light" ? "gray.100" : "gray.900"
                                }
                              >
                                <Flex as={Stack} w={"full"}>
                                  <Heading size="md">
                                    Choose Work Stages
                                  </Heading>
                                  <Text
                                    fontSize="sm"
                                    color={
                                      colorMode == "light"
                                        ? "gray.500"
                                        : "gray.400"
                                    }
                                  >
                                    Select workflow stages for this project
                                  </Text>
                                </Flex>

                                {DataWorkflowGroups.map((group) => (
                                  <Box key={group.id} w="full">
                                    <Checkbox
                                      isChecked={selectedWorkflowIds.has(
                                        group.id
                                      )}
                                      size={"lg"}
                                      onChange={() => {
                                        const newSelected = new Set(
                                          selectedWorkflowIds
                                        );
                                        if (newSelected.has(group.id)) {
                                          newSelected.delete(group.id);
                                          group.workflowChild.forEach(
                                            (level2) => {
                                              newSelected.delete(level2.id);
                                              level2.workflowChild.forEach(
                                                (level3) => {
                                                  newSelected.delete(level3.id);
                                                }
                                              );
                                            }
                                          );
                                        } else {
                                          newSelected.add(group.id);
                                          group.workflowChild.forEach(
                                            (level2) => {
                                              newSelected.add(level2.id);
                                              level2.workflowChild.forEach(
                                                (level3) => {
                                                  newSelected.add(level3.id);
                                                }
                                              );
                                            }
                                          );
                                        }
                                        setSelectedWorkflowIds(newSelected);
                                        formik.setFieldValue(
                                          "projectPlanWorkflowIds",
                                          Array.from(newSelected)
                                        );
                                        formik.setFieldValue(
                                          "projectPlanWorkflowIds",
                                          Array.from(newSelected)
                                        );
                                      }}
                                      colorScheme={"blue"}
                                    >
                                      <Text fontWeight="bold" color="blue.600">
                                        {group.wfgName}
                                      </Text>
                                    </Checkbox>
                                    <VStack
                                      align="start"
                                      spacing={2}
                                      pl={6}
                                      mt={2}
                                    >
                                      {group.workflowChild.map((level2) => (
                                        <Box key={level2.id} w="full">
                                          <Checkbox
                                            isChecked={selectedWorkflowIds.has(
                                              level2.id
                                            )}
                                            size={"lg"}
                                            onChange={() => {
                                              const newSelected = new Set(
                                                selectedWorkflowIds
                                              );
                                              if (newSelected.has(level2.id)) {
                                                newSelected.delete(level2.id);
                                                level2.workflowChild.forEach(
                                                  (level3) => {
                                                    newSelected.delete(
                                                      level3.id
                                                    );
                                                  }
                                                );
                                              } else {
                                                newSelected.add(level2.id);
                                                level2.workflowChild.forEach(
                                                  (level3) => {
                                                    newSelected.add(level3.id);
                                                  }
                                                );
                                              }
                                              const allLevel2Checked =
                                                group.workflowChild.every(
                                                  (l2) => newSelected.has(l2.id)
                                                );
                                              if (allLevel2Checked) {
                                                newSelected.add(group.id);
                                              } else {
                                                newSelected.delete(group.id);
                                              }
                                              setSelectedWorkflowIds(
                                                newSelected
                                              );
                                              formik.setFieldValue(
                                                "projectPlanWorkflowIds",
                                                Array.from(newSelected)
                                              );
                                              formik.setFieldValue(
                                                "projectPlanWorkflowIds",
                                                Array.from(newSelected)
                                              );
                                            }}
                                            colorScheme="blue"
                                          >
                                            <Text
                                              fontWeight="semibold"
                                              color="blue.500"
                                            >
                                              {level2.wfgName}
                                            </Text>
                                          </Checkbox>
                                          <VStack
                                            align="start"
                                            spacing={1}
                                            pl={6}
                                            mt={1}
                                          >
                                            {level2.workflowChild.map(
                                              (level3) => (
                                                <Checkbox
                                                  key={level3.id}
                                                  isChecked={selectedWorkflowIds.has(
                                                    level3.id
                                                  )}
                                                  size={"lg"}
                                                  onChange={() => {
                                                    const newSelected = new Set(
                                                      selectedWorkflowIds
                                                    );
                                                    if (
                                                      newSelected.has(level3.id)
                                                    ) {
                                                      newSelected.delete(
                                                        level3.id
                                                      );
                                                    } else {
                                                      newSelected.add(
                                                        level3.id
                                                      );
                                                    }
                                                    const allLevel3Checked =
                                                      level2.workflowChild.every(
                                                        (l3) =>
                                                          newSelected.has(l3.id)
                                                      );
                                                    if (allLevel3Checked) {
                                                      newSelected.add(
                                                        level2.id
                                                      );
                                                    } else {
                                                      newSelected.delete(
                                                        level2.id
                                                      );
                                                    }
                                                    const allLevel2Checked =
                                                      group.workflowChild.every(
                                                        (l2) =>
                                                          newSelected.has(l2.id)
                                                      );
                                                    if (allLevel2Checked) {
                                                      newSelected.add(group.id);
                                                    } else {
                                                      newSelected.delete(
                                                        group.id
                                                      );
                                                    }
                                                    setSelectedWorkflowIds(
                                                      newSelected
                                                    );
                                                  }}
                                                  colorScheme="blue"
                                                >
                                                  <VStack
                                                    align="start"
                                                    spacing={0}
                                                  >
                                                    <Text fontWeight="medium">
                                                      {level3.wfgName}
                                                    </Text>
                                                    {level3.wfgDesc && (
                                                      <Text
                                                        fontSize="sm"
                                                        color="gray.600"
                                                      >
                                                        {level3.wfgDesc}
                                                      </Text>
                                                    )}
                                                  </VStack>
                                                </Checkbox>
                                              )
                                            )}
                                          </VStack>
                                        </Box>
                                      ))}
                                    </VStack>
                                  </Box>
                                ))}
                              </Flex>
                            </GridItem>
                            <GridItem
                              colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}
                              w={"full"}
                            >
                              <Card
                                rounded={radiusStyle}
                                bgColor={
                                  colorMode == "light" ? "gray.100" : "gray.900"
                                }
                              >
                                <CardBody>
                                  <Flex
                                    w={"full"}
                                    as={Stack}
                                    minH={"500px"}
                                    spacing={6}
                                  >
                                    <HStack spacing={4} align={"center"}>
                                      <Box
                                        w={12}
                                        h={12}
                                        bgColor={
                                          colorMode == "light"
                                            ? "secondary.500"
                                            : "gray.800"
                                        }
                                        rounded="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                      >
                                        <Icon
                                          as={BsLightningChargeFill}
                                          color={
                                            colorMode == "light"
                                              ? "white"
                                              : "secondary.500"
                                          }
                                        />
                                      </Box>
                                      <VStack
                                        align="start"
                                        spacing={0}
                                        flex={1}
                                      >
                                        <HStack spacing={3}>
                                          <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            color={"secondary.500"}
                                          >
                                            Work Stage Preset
                                          </Text>
                                        </HStack>
                                        <Text
                                          fontSize="sm"
                                          color={
                                            colorMode == "light"
                                              ? "gray.500"
                                              : "gray.400"
                                          }
                                          lineHeight={1.2}
                                        >
                                          Select workflow stages preset related
                                          project work stage
                                        </Text>
                                      </VStack>
                                    </HStack>
                                    <Flex as={Stack} w={"full"}>
                                      {DataWorkflowPresets.length > 0 ? (
                                        <VStack
                                          align="start"
                                          spacing={1}
                                          // px={2}
                                        >
                                          {DataWorkflowPresets.map((preset) => (
                                            <Flex
                                              as={HStack}
                                              w={"full"}
                                              justifyContent={"space-between"}
                                              alignItems={"center"}
                                              bgColor={
                                                selectedPreset?.id === preset.id
                                                  ? "secondary.100"
                                                  : "trasnparent"
                                              }
                                              rounded={radiusStyle}
                                              px={4}
                                              py={3}
                                            >
                                              <Flex
                                                justifyContent={"start"}
                                                as={HStack}
                                                spacing={4}
                                                alignItems={"center"}
                                              >
                                                <Icon
                                                  as={FaCircle}
                                                  color={"secondary.500"}
                                                  boxSize={2}
                                                />
                                                <Text
                                                  fontWeight={
                                                    selectedPreset?.id ===
                                                    preset.id
                                                      ? 600
                                                      : 500
                                                  }
                                                  color={
                                                    selectedPreset?.id ===
                                                    preset.id
                                                      ? "gray.900"
                                                      : colorMode == "light"
                                                      ? "gray.900"
                                                      : "white"
                                                  }
                                                >
                                                  {preset.wfPresetName}
                                                </Text>
                                              </Flex>
                                              <Flex
                                                justifyContent={"end"}
                                                alignItems={"center"}
                                              >
                                                <Button
                                                  key={preset.id}
                                                  variant={"solid"}
                                                  colorScheme={
                                                    selectedPreset?.id ===
                                                    preset.id
                                                      ? "red"
                                                      : "secondary"
                                                  }
                                                  size={"xs"}
                                                  w="full"
                                                  textAlign="left"
                                                  justifyContent="flex-start"
                                                  onClick={() =>
                                                    handleSelectPreset(
                                                      preset.id
                                                    )
                                                  }
                                                >
                                                  {selectedPreset?.id ===
                                                  preset.id ? (
                                                    <FiMinus />
                                                  ) : (
                                                    <FiPlus />
                                                  )}
                                                </Button>
                                              </Flex>
                                            </Flex>
                                          ))}
                                        </VStack>
                                      ) : (
                                        <Text fontSize="sm" color="gray.500">
                                          No presets available
                                        </Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                </CardBody>
                              </Card>
                            </GridItem>
                          </Grid>

                          <Box p={4} bg="gray.50" rounded="md" display={"none"}>
                            <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                          </Box>

                          {selectedWorkflowIds.size > 0 && (
                            <Box
                              mt={4}
                              p={3}
                              bg="blue.50"
                              rounded="md"
                              w="full"
                            >
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                color="blue.800"
                              >
                                Selected: {selectedWorkflowIds.size} workflow(s)
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      ) : (
                        <Text color="gray.500">
                          No workflow groups available
                        </Text>
                      )}
                    </Flex>
                  )}

                  <Flex
                    mt={10}
                    mb={2}
                    w={"full"}
                    justifyContent={"space-between"}
                  >
                    <Button
                      onClick={() => {
                        if (activeStep > 0) {
                          setActiveStep(activeStep - 1);
                        }
                      }}
                      size={"lg"}
                      isDisabled={activeStep === 0}
                      leftIcon={<FiArrowLeft />}
                    >
                      Previous
                    </Button>
                    <HStack spacing={4}>
                      <Button
                        onClick={() => {
                          if (activeStep < steps.length - 1) {
                            setActiveStep(activeStep + 1);
                          }
                        }}
                        size={"lg"}
                        isDisabled={activeStep === steps.length - 1}
                        colorScheme="blue"
                        rightIcon={<FiArrowRight />}
                        display={
                          activeStep === steps.length - 1 ? "none" : "flex"
                        }
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* DEBUG REQUIREMENT DATA */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
            <Flex as={Stack} w={"full"}>
              <Box
                overflowY={"auto"}
                overflowX={"auto"}
                h={"350px"}
                p={4}
                bgColor={"gray.200"}
                rounded={radiusStyle}
                display={"none"}
              >
                <Text fontWeight={600}>Data Requirement</Text>
                <pre>{JSON.stringify(DataRequirement, null, 2)}</pre>
              </Box>
            </Flex>
          </GridItem>

          {/* DEBUG APLICATION DATA */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
            <Flex as={Stack} w={"full"}>
              <Box
                overflowY={"auto"}
                overflowX={"auto"}
                h={"350px"}
                p={4}
                bgColor={"gray.200"}
                rounded={radiusStyle}
                display={"none"}
              >
                <Text fontWeight={600}>Data Application</Text>
                <pre>{JSON.stringify(ApplicationData, null, 2)}</pre>
              </Box>
            </Flex>
          </GridItem>

          {/* DEBUG FORM REGISTER DATA */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
            <Flex as={Stack} w={"full"}>
              <Box
                overflowY={"auto"}
                overflowX={"auto"}
                h={"350px"}
                p={4}
                bgColor={"gray.200"}
                rounded={radiusStyle}
                // display={"none"}
              >
                <Text fontWeight={600}>Data Register Form</Text>
                <pre>{JSON.stringify(formik.values, null, 2)}</pre>
              </Box>
            </Flex>
          </GridItem>
        </Grid>
      )}
    </LayoutAdmin>
  );
}

// Helper Components
interface UrgencyImpactInputProps {
  idInput: string;
  fieldName: string;
  dataSource: BacklogDataResponse;
  dataInput: string;
  updateBacklog: (id: string, data: BacklogDataResponse) => void;
}

const UpdateUrgencyImpactInput = ({
  idInput,
  fieldName,
  dataSource,
  dataInput,
  updateBacklog,
}: UrgencyImpactInputProps) => {
  const [optionValue, setOptionValue] = useState<string>(dataInput);
  const [dataBacklog, setDataBacklog] =
    useState<BacklogDataResponse>(dataSource);

  useEffect(() => {
    setOptionValue(dataInput);
    setDataBacklog(dataSource);
  }, [dataInput, dataSource]);

  const handleChange = (value: string) => {
    setOptionValue(value);
    const updatedBacklog = { ...dataBacklog, [fieldName]: value };
    setDataBacklog(updatedBacklog);
    updateBacklog(updatedBacklog.id, updatedBacklog);
  };

  return (
    <SelectC
      id={idInput}
      name={idInput}
      value={optionValue}
      onChange={(e) => handleChange(e.target.value)}
      size="sm"
      variant={"flushed"}
    >
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
    </SelectC>
  );
};

interface BacklogDateInputProps {
  idInput: string;
  fieldName: string;
  dataSource: BacklogDataResponse;
  dataInput: string | null;
  updateBacklog: (id: string, data: BacklogDataResponse) => void;
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

  const handleChange = (value: string) => {
    setDateValue(value);
    const updatedBacklog = { ...dataBacklog, [fieldName]: value };
    setDataBacklog(updatedBacklog);
    updateBacklog(updatedBacklog.id, updatedBacklog);
  };

  return (
    <Input
      id={idInput}
      name={idInput}
      type="date"
      value={dateValue}
      onChange={(e) => handleChange(e.target.value)}
      size="sm"
      variant={"flushed"}
    />
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
  const [backlogDetail, setBacklogDetail] =
    useState<BacklogDataResponse>(dataSource);

  const OpenAdditionalFormBacklog = () => {
    AdditionalForm.onOpen();
  };

  // State for form inputs
  const [formInputs, setFormInputs] = useState({
    envSide: dataSource.envSide || "",
    maintenanceCategory: dataSource.maintenanceCategory || "",
    maintenanceType: dataSource.maintenanceType || "",
    rppb: dataSource.rppb || "N",
    licensing: dataSource.licensing || "N",
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormInputs({
      ...formInputs,
      [name]: value,
    });
  };

  // Save changes
  const handleSaveChanges = () => {
    const updatedBacklog = {
      ...backlogDetail,
      ...formInputs,
    };

    setBacklogDetail(updatedBacklog);
    updateBacklog(updatedBacklog.id, updatedBacklog);
    AdditionalForm.onClose();
  };

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
            <Flex as={Stack} w={"full"} spacing={4}>
              <Divider />

              {/* Form inputs for additional fields */}
              <FormControl>
                <FormLabel>App Side</FormLabel>
                <SelectC
                  name="envSide"
                  value={formInputs.envSide}
                  onChange={handleInputChange}
                  placeholder="Select Environment Side"
                >
                  {ENV_SIDE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectC>
              </FormControl>

              <FormControl>
                <FormLabel>Jenis Maintenance</FormLabel>
                <SelectC
                  name="maintenanceCategory"
                  value={formInputs.maintenanceCategory}
                  onChange={handleInputChange}
                  placeholder="Select Maintenance Category"
                >
                  {MAINTENANCE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectC>
              </FormControl>

              <FormControl>
                <FormLabel>Tipe Maintenance</FormLabel>
                <SelectC
                  name="maintenanceType"
                  value={formInputs.maintenanceType}
                  onChange={handleInputChange}
                  placeholder="Select Maintenance Type"
                >
                  {MAINTENANCE_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectC>
              </FormControl>

              <FormControl>
                <FormLabel>Perizinan</FormLabel>
                <RadioGroup
                  name="licensing"
                  value={formInputs.licensing}
                  onChange={(value) => {
                    setFormInputs({
                      ...formInputs,
                      licensing: value,
                    });
                  }}
                >
                  <HStack spacing={6}>
                    <Radio value="Y">Ya</Radio>
                    <Radio value="N">Tidak</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">RPPB/ Non RPPB</FormLabel>
                <Switch
                  name="rppb"
                  isChecked={formInputs.rppb === "Y"}
                  onChange={(e) => {
                    setFormInputs({
                      ...formInputs,
                      rppb: e.target.checked ? "Y" : "N",
                    });
                  }}
                />
              </FormControl>

              <Box
                overflowY={"auto"}
                overflowX={"auto"}
                maxH={"350px"}
                p={4}
                bgColor={"gray.200"}
                rounded={radiusStyle}
                display={"none"}
              >
                <Text fontWeight={600}>Data Backlog</Text>
                <pre>{JSON.stringify(dataSource, null, 2)}</pre>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveChanges}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={AdditionalForm.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProjectRegisterView;
