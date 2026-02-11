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
  PROJECT_TYPE_DEPLOYMENT,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  SELECTED_OPTION_DIVISION,
  WORK_PROGRAM_EXTERNAL,
  WORK_PROGRAM_INTERNAL,
  WorkflowProjectDevelopmentId,
  WorkflowProjectProcurementId,
  WorkStageProcurementId,
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
  ProjectCountResponse,
  ProjectInsertPayload,
  ProjectRegisterPayload,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
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
  projectNo: "-", // Default value
  projectName: "", // Required
  projectDesc: null, // Optional
  note: null, // Optional
  projectCategory: "", // Required
  projectType: "", // Required
  projectRegisterDate: "", // Optional
  projectClosedDate: null, // Optional
  projectAcquisitionCode: null, // Optional
  projectCharasteristicCode: null, // Optional
  projectSubCharasteristicCode: null, // Optional
  proOwnerDirectorateId: null, // Optional
  proManageByDirectorateId: null, // Optional
  proOwnerDivisionId: null, // Optional
  proOwnerGroupId: null, // Optional
  proManageByDivisionId: null, // Optional
  proManageByGroupId: null, // Optional
  proManageByTeamId: null, // Optional
  reqParentId: null, // Optional
  userAssigns: [], // Required (at least an empty array)
  projectPlanWorkflowIds: [],
  projectPlanWorkflowBacklogsIds: [],
  workProgramsBacklogs: [],
  workPrograms: [],
};

const PROJECT_ROUTES = {
  [PROJECT_TYPE_INTERNAL_DEVELOPMENT]: {
    back: "/projects-manager",
    devView: "/projects-manager/development",
    showDevView: true,
  },
  [PROJECT_TYPE_PROCUREMENT]: {
    back: "/projects-procurements",
    devView: null,
    showDevView: false,
  },
};

interface ProjectRegisterViewProps {
  projectTypeRegister: string;
  reqType?: string | null;
}

export default function ProjectRegisterView({
  projectTypeRegister,
  reqType,
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
  const { RegisterProjectNew, GetProjectCount } = useProjects();
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
  const [ProjectNoMode, setProjectNoMode] = useState<"auto" | "manual">("auto");

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

  const ProjectCount = async (): Promise<number> => {
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await GetProjectCount(token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return 0;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data project count return error",
          statusToast: "error",
        });
        return 0;
      }

      const itemsData: ProjectCountResponse =
        requestData.data as ProjectCountResponse;

      return itemsData.countAllProjects;
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
      //   label: d.orgName,
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
        description: `Upload File Failed : ${requestData?.message || RES_GENERIC_ERROR_MSG
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
    // Filter only selected backlogs for internal development
    const selectedBacklogsList =
      projectTypeRegister == PROJECT_TYPE_INTERNAL_DEVELOPMENT
        ? DataBacklogsRequirement.filter((b) =>
          selectedBacklogIds.includes(b.id)
        )
        : [];

    const backlogsProject: BacklogUpdatePayload[] =
      mapBacklogArrayToUpdatePayload(selectedBacklogsList);

    const payload: ProjectRegisterPayload = {
      ...data,
      backlogsProject,
      workProgramsBacklogs: [],
      workPrograms: data.workPrograms || [],
    };

    const requestData = await RegisterProjectNew(payload, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      showToast({
        description: "Register new project data successfully",
        statusToast: "success",
      });

      setActionLoading(false);

      if (projectTypeRegister == PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
        if (reqType === "RFC") {
          redirect(`/projects-manager/?reqType=rfc`);
        } else {
          redirect(`/projects-manager/?reqType=brd`);
        }
      }

      if (projectTypeRegister == PROJECT_TYPE_PROCUREMENT) {
      }

      redirect(`/projects-procurements/`);
      return;
    }
  };

  // Get route configuration based on project type
  const routeConfig = projectTypeRegister
    ? PROJECT_ROUTES[projectTypeRegister as keyof typeof PROJECT_ROUTES]
    : PROJECT_ROUTES[PROJECT_TYPE_PROCUREMENT]; // Default fallback

  const backUrl = projectTypeRegister === PROJECT_TYPE_INTERNAL_DEVELOPMENT
    ? `/projects-manager/?reqType=${reqType?.toLowerCase() || "brd"}`
    : (routeConfig?.back || "/projects-procurements");

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
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);

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

  const GetDetailOrganizationData = (
    orgId: string
  ): OrganizationResponse | undefined => {
    if (OrganizationData.length <= 0) return undefined;

    return OrganizationData.find((x) => x.id == orgId);
  };

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

  // Project Number Builder Function
  const buildProjectNumber = (
    projectCount: number,
    organizationDivisionCode: string,
    workProgramExternalCount: number,
    workProgramInternalCount: number,
    projectAcquisitionCode?: string
  ): string => {
    const currentYear = new Date().getFullYear();
    const projectNumber = (projectCount + 1).toString().padStart(4, "0");
    const externalRBB = workProgramExternalCount > 0 ? "RBB" : "NRBB";
    const internalRBB = workProgramInternalCount > 0 ? "RBB" : "NRBB";

    if (projectTypeRegister === PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
      return `${projectNumber}/${organizationDivisionCode}/BJB/${externalRBB}/${internalRBB}/${currentYear}`;
    } else if (projectTypeRegister === PROJECT_TYPE_PROCUREMENT) {
      return `${projectNumber}/${organizationDivisionCode}/BJB/${externalRBB}/${internalRBB}/${currentYear}/${projectAcquisitionCode || ""
        }`;
    }

    return "";
  };

  const formik = useFormik<ProjectInsertPayload>({
    initialValues: initialProjectsInsertValues,
    validationSchema: projectsInsertBindModelSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  // generate Project Number
  useEffect(() => {
    const getProjectCount = async () => {
      if (tokenData) {
        try {
          const requestData = await GetProjectCount(tokenData);
          if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
            const countData = requestData.data.countAllProjects || 0;

            // Generate project number when we have the count
            if (
              (formik.values.proOwnerDivisionId ||
                formik.values.proManageByDivisionId) &&
              OrganizationData.length > 0
            ) {
              const divisionId =
                formik.values.proManageByDivisionId ||
                formik.values.proOwnerDivisionId;
              const division = OrganizationData.find(
                (org) => org.id === divisionId
              );
              if (division) {
                const externalCount = formik.values.workPrograms.filter(
                  (wp) => wp.workProgramSource === WORK_PROGRAM_EXTERNAL
                ).length;
                const internalCount = formik.values.workPrograms.filter(
                  (wp) => wp.workProgramSource === WORK_PROGRAM_INTERNAL
                ).length;

                const projectNumber = buildProjectNumber(
                  countData,
                  division.orgCode || division.orgName,
                  externalCount,
                  internalCount,
                  formik.values.projectAcquisitionCode || undefined
                );

                if (ProjectNoMode === "auto") {
                  // formik.setFieldValue("projectNo", projectNumber);
                  // Auto-generation disabled - project number will be generated after approval
                }
              }
            }
          }
        } catch (error) {
          console.error("Error getting project count:", error);
        }
      }
    };

    getProjectCount();
  }, [
    tokenData,
    formik.values.proOwnerDivisionId,
    formik.values.proManageByDivisionId,
    formik.values.workPrograms,
    formik.values.projectAcquisitionCode,
    OrganizationData,
    ProjectNoMode,
  ]);

  // end - formik

  const [IsHaveMemo, setIsHaveMemo] = useState<"Y" | "N">("Y");
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [DataRequirement, setDataRequirement] =
    useState<RequirementsResponse | null>(null);

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
      redirect(`/projects-manager/?reqType=${reqType?.toLowerCase() || "brd"}`);
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
      const reviewers = await Promise.all(
        (itemsData.approvalDatas ?? []).map(async (dt) => {
          try {
            return await GetUserIDServices(dt.approverUserCode);
          } catch {
            return null;
          }
        })
      );

      reviewers.filter(Boolean).forEach((user) => userAssignPoject.push(user!));

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

  const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([]);

  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [availableBacklogsFilter, setAvailableBacklogsFilter] =
    useState<string>("");

  // Bulk apply states
  const [bulkDeadline, setBulkDeadline] = useState<string>("");
  const [bulkUrgency, setBulkUrgency] = useState<string>("");
  const [bulkImpact, setBulkImpact] = useState<string>("");

  // Pagination state for selected backlogs
  const [selectedBacklogsPagination, setSelectedBacklogsPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const selectedBacklogsPaginationMemo = useMemo(
    () => ({
      pageIndex: selectedBacklogsPagination.pageIndex,
      pageSize: selectedBacklogsPagination.pageSize,
    }),
    [selectedBacklogsPagination.pageIndex, selectedBacklogsPagination.pageSize]
  );

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
  };

  // Apply bulk deadline, urgency, impact to selected backlogs only
  const applyBulkToAllBacklogs = () => {
    // Validate bulk deadline against target live date
    if (bulkDeadline && DataRequirement?.appLiveTargetDate) {
      const selectedDate = new Date(bulkDeadline);
      const targetLiveDate = new Date(DataRequirement.appLiveTargetDate);

      if (selectedDate > targetLiveDate) {
        showToast({
          description: `Deadline cannot exceed Target Live date (${new Date(DataRequirement.appLiveTargetDate).toLocaleDateString('id-ID')})`,
          statusToast: "error",
        });
        return;
      }
    }

    setDataBacklogsRequirement((prev) =>
      prev.map((item) => {
        // Only update backlogs that are currently displayed in selectedBacklogs table
        if (!selectedBacklogs.some(b => b.id === item.id)) return item;

        const updatedItem = { ...item };
        if (bulkDeadline) updatedItem.backlogEnddate = bulkDeadline;
        if (bulkUrgency) updatedItem.urgency = bulkUrgency;
        if (bulkImpact) updatedItem.impact = bulkImpact;

        // Recalculate priority with updated values
        const finalUrgency = bulkUrgency || item.urgency;
        const finalImpact = bulkImpact || item.impact;
        updatedItem.priority = getPriorityFromMatrix(finalImpact, finalUrgency);

        return updatedItem;
      })
    );

    // Clear inputs after apply
    setBulkDeadline("");
    setBulkUrgency("");
    setBulkImpact("");
  };

  // Backlog selection handlers (memoized for performance)
  const toggleBacklogSelection = useCallback((backlogId: string) => {
    setSelectedBacklogIds((prev) =>
      prev.includes(backlogId)
        ? prev.filter((id) => id !== backlogId)
        : [...prev, backlogId]
    );
  }, []);

  const toggleAllAvailableBacklogs = useCallback(
    (checked: boolean) => {
      if (checked) {
        const availableIds = DataBacklogsRequirement.filter(
          (b) => b.projectId === null
        ).map((b) => b.id);
        setSelectedBacklogIds(availableIds);
      } else {
        setSelectedBacklogIds([]);
      }
    },
    [DataBacklogsRequirement]
  );

  // Separate backlogs into 3 categories
  // Separate backlogs into 3 categories (memoized for performance)
  const assignedBacklogs = useMemo(
    () => DataBacklogsRequirement.filter((b) => b.projectId !== null),
    [DataBacklogsRequirement]
  );

  const availableBacklogs = useMemo(() => {
    let filtered = DataBacklogsRequirement.filter((b) => b.projectId === null);

    if (availableBacklogsFilter) {
      filtered = filtered.filter(
        (backlog) =>
          backlog.backlogName
            .toLowerCase()
            .includes(availableBacklogsFilter.toLowerCase()) ||
          backlog.backlogDesc
            ?.toLowerCase()
            .includes(availableBacklogsFilter.toLowerCase())
      );
    }

    return filtered;
  }, [DataBacklogsRequirement, availableBacklogsFilter]);

  const selectedBacklogs = useMemo(
    () =>
      DataBacklogsRequirement.filter((b) => selectedBacklogIds.includes(b.id)),
    [DataBacklogsRequirement, selectedBacklogIds]
  );

  const { ListWorkflowGroups } = useWorkflow();
  const { ListWorkflowPreset, GetWorkflowPresetById } = useWorkflowPreset();
  // Load Workflow Groups for procurements at features register project
  const [DataWorkflowGroupsProcurements, setDataWorkflowGroupsProcurements] =
    useState<WorkflowGroupResponse[]>([]);
  const [selectedWorkflowProcurementsIds, setSelectedWorkflowProcurementsIds] =
    useState<Set<string>>(new Set());
  const [IsLoadingWorkflowProcurements, setIsLoadingWorkflowProcurements] =
    useState(false);
  const [DataWorkflowPresetsProcurements, setDataWorkflowPresetsProcurements] =
    useState<WorkflowPresetResponse[]>([]);
  const [selectedPresetProcurement, setSelectedPresetProcurement] =
    useState<WorkflowPresetResponse | null>(null);

  const LoadWorkflowGroupsProcurements = async () => {
    const WorkflowProject = WorkStageProcurementId;

    setIsLoadingWorkflowProcurements(true);
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
            value: WorkflowProject,
          },
        ],
        fieldOrder: ["wfgOrder"],
        orderDir: "asc",
      };

      const requestData = await ListWorkflowGroups(PayloadList, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setDataWorkflowGroupsProcurements(requestData.data);
      }
    } catch (error) {
      console.error("Error loading workflow groups:", error);
    } finally {
      setIsLoadingWorkflowProcurements(false);
    }
  };

  const renderWorkflowLevelProcurement = (
    workflows: WorkflowGroupResponse[],
    level: number = 0
  ) => {
    if (level >= 3) return [];
    return workflows.map((workflow) => (
      <Box key={workflow.id} w="full" ml={level * 4}>
        <Checkbox
          isChecked={selectedWorkflowProcurementsIds.has(workflow.id)}
          colorScheme="blue"
          size="lg"
          onChange={() => {
            const newSelected = new Set(selectedWorkflowProcurementsIds);
            const isCurrentlyChecked = newSelected.has(workflow.id);

            // Helper to get all child IDs recursively
            const getAllChildIds = (wf: WorkflowGroupResponse): string[] => {
              const ids: string[] = [];
              if (wf.workflowChild?.length > 0) {
                wf.workflowChild.forEach((child) => {
                  ids.push(child.id);
                  ids.push(...getAllChildIds(child));
                });
              }
              return ids;
            };

            // Helper to find parent and update its state
            const updateParentState = (
              allWorkflows: WorkflowGroupResponse[],
              targetId: string
            ): void => {
              const findParent = (
                workflows: WorkflowGroupResponse[],
                childId: string
              ): WorkflowGroupResponse | null => {
                for (const wf of workflows) {
                  if (wf.workflowChild?.some((c) => c.id === childId)) {
                    return wf;
                  }
                  if (wf.workflowChild?.length > 0) {
                    const found = findParent(wf.workflowChild, childId);
                    if (found) return found;
                  }
                }
                return null;
              };

              const parent = findParent(allWorkflows, targetId);
              if (parent && parent.workflowChild) {
                const anyChildChecked = parent.workflowChild.some((child) =>
                  newSelected.has(child.id)
                );

                if (anyChildChecked) {
                  newSelected.add(parent.id);
                } else {
                  newSelected.delete(parent.id);
                }

                // Recursively update parent's parent
                updateParentState(allWorkflows, parent.id);
              }
            };

            if (isCurrentlyChecked) {
              // Unchecking: remove this and all children
              newSelected.delete(workflow.id);
              getAllChildIds(workflow).forEach((id) => newSelected.delete(id));
            } else {
              // Checking: add this and all children
              newSelected.add(workflow.id);
              getAllChildIds(workflow).forEach((id) => newSelected.add(id));
            }

            // Update parent states
            updateParentState(DataWorkflowGroupsProcurements, workflow.id);

            setSelectedWorkflowProcurementsIds(newSelected);
            formik.setFieldValue(
              "projectPlanWorkflowBacklogsIds",
              Array.from(newSelected)
            );
          }}
        >
          <Text
            fontWeight={level === 0 ? "bold" : "normal"}
            color={level === 0 ? "blue.600" : "inherit"}
          >
            {workflow.wfgName}
          </Text>
        </Checkbox>
        {workflow.workflowChild?.length > 0 && (
          <VStack align="start" spacing={1} mt={level === 0 ? 2 : 1}>
            {renderWorkflowLevelProcurement(workflow.workflowChild, level + 1)}
          </VStack>
        )}
      </Box>
    ));
  };

  const handleSelectPresetProcurement = async (presetId: string) => {
    try {
      // If clicking the currently selected preset, clear selection
      if (selectedPresetProcurement?.id === presetId) {
        setSelectedPresetProcurement(null);
        setSelectedWorkflowProcurementsIds(new Set());
        formik.setFieldValue("projectPlanWorkflowBacklogsIds", []);
        return;
      }

      const requestData = await GetWorkflowPresetById(presetId, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setSelectedPresetProcurement(requestData.data);

        // Extract all workflow IDs including children recursively
        const allWorkflowIds = new Set<string>();
        const extractIds = (workflows: WorkflowGroupResponse[]) => {
          workflows.forEach((workflow) => {
            allWorkflowIds.add(workflow.id);
            if (workflow.workflowChild?.length > 0) {
              extractIds(workflow.workflowChild);
            }
          });
        };
        extractIds(requestData.data.workflowData);

        // Update formik and selectedWorkflowIds
        setSelectedWorkflowProcurementsIds(allWorkflowIds);
        formik.setFieldValue(
          "projectPlanWorkflowBacklogsIds",
          Array.from(allWorkflowIds)
        );
      }
    } catch (error) {
      console.error("Error loading preset detail:", error);
    }
  };

  const LoadWorkflowPresetsProcurement = async () => {
    let WorkflowProject = WorkStageProcurementId;

    try {
      const PayloadList: PaggingListPayload = {
        limit: MAX_SIZE_TABLE,
        page: 0,
        search: "",
        filterWhere: [
          {
            field: "wfCategoryId",
            operator: "=",
            value: WorkflowProject,
          },
        ],
        fieldOrder: ["wfPresetName"],
        orderDir: "asc",
      };
      const requestData = await ListWorkflowPreset(PayloadList, tokenData);
      if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
        setDataWorkflowPresetsProcurements(requestData.data);
      }
    } catch (error) {
      console.error("Error loading workflow presets:", error);
    }
  };

  // END Load Workflow Groups for procurements at features register project

  // Load Workflow Groups
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

  const LoadWorkflowGroups = async () => {
    let WorkflowProject = WorkflowProjectDevelopmentId;

    if (projectTypeRegister == PROJECT_TYPE_PROCUREMENT) {
      WorkflowProject = WorkflowProjectProcurementId;
    }

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
            value: WorkflowProject,
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

  const renderWorkflowLevel = (
    workflows: WorkflowGroupResponse[],
    level: number = 0
  ) => {
    if (level >= 3) return [];

    const getAllChildIds = (wf: WorkflowGroupResponse): string[] => {
      let ids = [wf.id];
      if (wf.workflowChild?.length > 0) {
        wf.workflowChild.forEach((child) => {
          ids = ids.concat(getAllChildIds(child));
        });
      }
      return ids;
    };

    const findParent = (
      targetId: string,
      workflows: WorkflowGroupResponse[]
    ): WorkflowGroupResponse | null => {
      for (const wf of workflows) {
        if (wf.workflowChild?.some((child) => child.id === targetId)) {
          return wf;
        }
        if (wf.workflowChild?.length > 0) {
          const found = findParent(targetId, wf.workflowChild);
          if (found) return found;
        }
      }
      return null;
    };

    const updateParentState = (
      childId: string,
      newSelected: Set<string>,
      allWorkflows: WorkflowGroupResponse[]
    ) => {
      const parent = findParent(childId, allWorkflows);
      if (parent) {
        const hasAnyChildSelected = parent.workflowChild?.some((child) =>
          newSelected.has(child.id)
        );
        if (hasAnyChildSelected) {
          newSelected.add(parent.id);
        } else {
          newSelected.delete(parent.id);
        }
        updateParentState(parent.id, newSelected, allWorkflows);
      }
    };

    return workflows.map((workflow) => (
      <Box key={workflow.id} w="full" ml={level * 4}>
        <Checkbox
          isChecked={selectedWorkflowIds.has(workflow.id)}
          colorScheme="blue"
          size="lg"
          onChange={() => {
            const newSelected = new Set(selectedWorkflowIds);
            const isCurrentlyChecked = newSelected.has(workflow.id);

            if (isCurrentlyChecked) {
              const allIds = getAllChildIds(workflow);
              allIds.forEach((id) => newSelected.delete(id));
              updateParentState(workflow.id, newSelected, DataWorkflowGroups);
            } else {
              const allIds = getAllChildIds(workflow);
              allIds.forEach((id) => newSelected.add(id));
              updateParentState(workflow.id, newSelected, DataWorkflowGroups);
            }

            setSelectedWorkflowIds(newSelected);
            formik.setFieldValue(
              "projectPlanWorkflowIds",
              Array.from(newSelected)
            );
          }}
        >
          <Text
            fontWeight={level === 0 ? "bold" : "normal"}
            color={level === 0 ? "blue.600" : "inherit"}
          >
            {workflow.wfgName}
          </Text>
        </Checkbox>
        {workflow.workflowChild?.length > 0 && (
          <VStack align="start" spacing={1} mt={level === 0 ? 2 : 1}>
            {renderWorkflowLevel(workflow.workflowChild, level + 1)}
          </VStack>
        )}
      </Box>
    ));
  };
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

        // Extract all workflow IDs including children recursively
        const allWorkflowIds = new Set<string>();
        const extractIds = (workflows: WorkflowGroupResponse[]) => {
          workflows.forEach((workflow) => {
            allWorkflowIds.add(workflow.id);
            if (workflow.workflowChild?.length > 0) {
              extractIds(workflow.workflowChild);
            }
          });
        };
        extractIds(requestData.data.workflowData);

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
    let WorkflowProject = WorkflowProjectDevelopmentId;

    if (projectTypeRegister == PROJECT_TYPE_PROCUREMENT) {
      WorkflowProject = WorkflowProjectProcurementId;
    }

    try {
      const PayloadList: PaggingListPayload = {
        limit: MAX_SIZE_TABLE,
        page: 0,
        search: "",
        filterWhere: [
          {
            field: "wfCategoryId",
            operator: "=",
            value: WorkflowProject,
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

  // Load workflow groups when token is available
  useEffect(() => {
    setIsLoadingProcess(true);
    if (tokenData) {
      LoadAllOrganizationData();
      // LoadDataDirectorate();

      if (
        projectTypeRegister == PROJECT_TYPE_PROCUREMENT &&
        DataRequirement == null
      ) {
        LoadWorkflowGroupsProcurements();
        LoadWorkflowPresetsProcurement();
      }

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
                  {/* #{info.row.original.backlogCode} */}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Nama Scope</span>,
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
        header: () => <span>Deskripsi Scope</span>,
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
                maxDate={DataRequirement?.appLiveTargetDate}
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
    [colorMode, DataRequirement]
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

  // Table for selected backlogs (editable)
  const selectedBacklogsTable = useReactTable({
    data: selectedBacklogs,
    columns: columnsData,
    pageCount: Math.ceil(
      selectedBacklogs.length / selectedBacklogsPagination.pageSize
    ),
    state: {
      pagination: selectedBacklogsPaginationMemo,
    },
    onPaginationChange: setSelectedBacklogsPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
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
          <Text>
            4.{" "}
            {projectTypeRegister == PROJECT_TYPE_PROCUREMENT &&
              "Procurement Stages"}
            {projectTypeRegister == PROJECT_TYPE_INTERNAL_DEVELOPMENT &&
              "Feature Information"}
            {projectTypeRegister == PROJECT_TYPE_DEPLOYMENT &&
              "Deployment Stages"}
          </Text>
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

    if (projectTypeRegister == PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
      // Validate that at least one backlog is selected
      if (selectedBacklogIds.length === 0) {
        showToast({
          description: "Pilih minimal 1 backlog untuk project ini",
          statusToast: "warning",
        });
        errorSum++;
      }

      // Filter only selected backlogs for validation
      const selectedBacklogsList = DataBacklogsRequirement.filter((b) =>
        selectedBacklogIds.includes(b.id)
      );
      const updatePayloadList: BacklogUpdatePayload[] =
        mapBacklogArrayToUpdatePayload(selectedBacklogsList);

      if (updatePayloadList.length > 0) {
        updatePayloadList.map((bl) => {
          if (bl.backlogEnddate == null) {
            DeadlineUnfilledDataBacklog++;
          }
        });

        if (DeadlineUnfilledDataBacklog > 0) {
          showToast({
            description: `(${DeadlineUnfilledDataBacklog}) Data Deadline Scope belum diisi.`,
            statusToast: "warning",
          });
          errorSum++;
        }
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

  // load reff from data requirements
  useEffect(() => {
    // projectTypeRegister;
    formik.setFieldValue(`projectType`, projectTypeRegister);
    formik.setFieldValue(`projectCategory`, "PROJECT");

    console.log(IsHaveMemo);
    console.log(projectTypeRegister);

    if (IsHaveMemo == "N" && projectTypeRegister == PROJECT_TYPE_PROCUREMENT) {
      console.log(PROJECT_TYPE_PROCUREMENT);
      handleResetReffFromRequirementData();
      formik.setFieldValue(`reqParentId`, null);
      formik.setFieldValue("proOwnerDirectorateId", DIRECTORATE_ID_IT_BJB);
      formik.setFieldValue("proOwnerDivisionId", DIVISION_ID_IT_BJB);
      formik.setFieldValue("proManageByDirectorateId", DIRECTORATE_ID_IT_BJB);
      formik.setFieldValue("proManageByDivisionId", DIVISION_ID_IT_BJB);
    }

    if (DataAuth && DataRequirement && tokenData) {
      console.log("DataRequirement Loaded");
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

      const mapDataWorkPrograms =
        DataRequirement.workPrograms && DataRequirement.workPrograms.length > 0
          ? mapWorkProgramData(DataRequirement.workPrograms)
          : [];
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
        const reviewers = await Promise.all(
          (DataRequirement.approvalDatas ?? []).map(async (dt) => {
            try {
              return await GetUserIDServices(dt.approverUserCode);
            } catch {
              return null;
            }
          })
        );

        reviewers
          .filter(Boolean)
          .forEach((user) => userAssignPoject.push(user!));

        // Set state only after all async ops done
        if (userAssignPoject.length > 0) {
          setChoosedMemberProjects(userAssignPoject);
        }
      };
      GetUserManageProject();
    }
  }, [DataAuth, DataRequirement, IsHaveMemo]);

  // end load reff from data requirements

  // reset filled data from req
  const handleResetReffFromRequirementData = () => {
    setDataRequirement(null);
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
        scrollBehavior="inside"
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
              onClose={ModalForm.onClose}
              requirementType={reqType || undefined}
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
        <Grid templateColumns="repeat(12, 1fr)" gap={6} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
            <Flex
              w={"full"}
              as={Wrap}
              spacing={2}
              overflowX={"auto"}
              justifyContent={"start"}
            >
              <Link href={backUrl}>
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
          <GridItem
            colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }}
            w={"full"}
            display={
              projectTypeRegister == PROJECT_TYPE_PROCUREMENT &&
                IsHaveMemo == "N"
                ? "none"
                : "box"
            }
          >
            <Card
              shadow="md"
              // bgColor={colorMode == "light" ? "white" : "gray.800"}
              bgGradient={"linear(to-br, secondary.800, secondary.500)"}
              rounded={radiusStyle}
              minH={"180px"}
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
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={"white"}
                            >
                              {DataRequirement
                                ? DataRequirement.reqNarative.toUpperCase() +
                                " "
                                : "NO REQUIREMENT REFERENCE "}
                            </Text>
                          </Link>
                        </WrapItem>
                        <WrapItem>
                          <Badge
                            colorScheme="blue"
                            fontSize="md"
                            px={4}
                            rounded={radiusStyle}
                          >
                            {DataRequirement ? DataRequirement.reqNumber : "-"}
                          </Badge>
                        </WrapItem>
                      </Wrap>
                      <HStack spacing={4} pt={3}>
                        <Text fontSize="sm" color="gray.300">
                          Tanggal Memo Diterima:{" "}
                          {DataRequirement && DataRequirement.reqAcceptedDate
                            ? new Date(
                              DataRequirement.reqAcceptedDate
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                            : "-"}
                        </Text>
                        <Text fontSize="sm" color="gray.300">
                          Status Memo:{" "}
                          {DataRequirement ? DataRequirement.reqStatus : "-"}
                        </Text>
                      </HStack>
                      {DataRequirement && (
                        <Box
                          mt={2}
                          p={2}
                          bg="blue.50"
                          borderColor="blue.400"
                          rounded="md"
                        >
                          <HStack spacing={2}>
                            <Icon as={FiClock} color="blue.500" />
                            <Text fontSize="sm" fontWeight="600" color="blue.700">
                              Target Live:
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="blue.600">
                              {DataRequirement.appLiveTargetDate
                                ? new Date(
                                  DataRequirement.appLiveTargetDate
                                ).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                                : "-"}
                            </Text>
                            <Tooltip
                              label="Target selesai dari kesepakatan memo bersama"
                              placement="top"
                              hasArrow
                            >
                              <Box
                                as="span"
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                w="16px"
                                h="16px"
                                borderRadius="full"
                                bg="blue.100"
                                color="blue.600"
                                fontSize="xs"
                                fontWeight="bold"
                                cursor="help"
                              >
                                ?
                              </Box>
                            </Tooltip>
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          {/* Application Information */}
          <GridItem
            colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }}
            w={"full"}
            display={ApplicationData != null ? "box" : "none"}
          >
            <Card
              shadow="md"
              bgColor={colorMode == "light" ? "white" : "gray.800"}
              //   bgGradient={"linear(to-br, secondary.800, secondary.500)"}
              rounded={radiusStyle}
              minH={"180px"}
            >
              <CardBody>
                <Flex
                  as={Stack}
                  spacing={4}
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
                        fontSize={
                          ApplicationData &&
                            ApplicationData.appShortName.length > 3
                            ? "small"
                            : "x-large"
                        }
                      >
                        {ApplicationData
                          ? ApplicationData.appShortName.toUpperCase()
                          : "-"}
                      </Text>
                    </Box>
                  </Link>
                  <Link href={`#`}>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      textAlign={"center"}
                      lineHeight={1}
                      color={
                        colorMode == "light" ? "secondary.800" : "secondary.500"
                      }
                    >
                      {ApplicationData
                        ? ApplicationData.appName.toUpperCase()
                        : "NO APP REFERENCE"}
                    </Text>
                  </Link>
                  {/* <Badge
                    colorScheme="blue"
                    fontSize="xs"
                    px={4}
                    rounded={radiusStyle}
                  >
                    {ApplicationData ? "#" + ApplicationData.appCode : "-"}
                  </Badge> */}
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
                                    if (val === "N") {
                                      setProjectNoMode("auto");
                                    }
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
                                      {projectTypeRegister !=
                                        PROJECT_TYPE_PROCUREMENT
                                        ? "Belum"
                                        : "Tidak (Dikhususkan untuk IT)"}
                                    </Radio>
                                  </Flex>
                                </RadioGroup>
                                <FormHelperText as={"i"} fontSize={"xs"}>
                                  Jika belum memiliki Memo pengantar, ada
                                  beberapa informasi yang akan inputkan lain
                                  waktu jika Memo pengantar sudah ada.*
                                </FormHelperText>
                              </Stack>
                            </InputLayout>
                          </FormControl>
                        </Flex>

                        <FormControl
                          isRequired={IsHaveMemo == "Y"}
                          display={
                            projectTypeRegister == PROJECT_TYPE_PROCUREMENT &&
                              IsHaveMemo == "N"
                              ? "none"
                              : "flex"
                          }
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
                                  readOnly
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

                      <InputGroupPanel headerTitle="Informasi Umum">
                        <Flex justifyContent="flex-end" mb={3} display="none">
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="gray.600">
                              Manual
                            </Text>
                            <Switch
                              isDisabled={true}
                              size="sm"
                              isChecked={ProjectNoMode === "auto"}
                              onChange={(e) => {
                                const newMode = e.target.checked
                                  ? "auto"
                                  : "manual";
                                setProjectNoMode(newMode);
                                if (newMode === "manual") {
                                  formik.setFieldValue("projectNo", "");
                                }
                              }}
                            />
                            <Text fontSize="sm" color="gray.600">
                              Auto
                            </Text>
                          </HStack>
                        </Flex>

                        <FormControl
                          id="projectNo"
                          isInvalid={formik.errors.projectNo ? true : false}
                        >
                          <InputLayout>
                            <FormLabel h={"full"} mt={2}>
                              Nomor Project
                            </FormLabel>
                            <Stack spacing={1}>
                              <HStack spacing={2}>
                                <Input
                                  id="projectNo"
                                  name="projectNo"
                                  type="text"
                                  onChange={formik.handleChange}
                                  value={formik.values.projectNo ?? "-"}
                                  placeholder="-"
                                  minLength={25}
                                  maxLength={100}
                                  isDisabled={true}
                                  readOnly
                                  bg="gray.100"
                                  cursor="not-allowed"
                                  opacity={0.6}
                                  w={{
                                    base: "full",
                                    sm: "full",
                                    md: "350px",
                                    lg: "350px",
                                  }}
                                />
                                <Tooltip
                                  label="Nomor proyek akan muncul setelah proyek Anda di Approve"
                                  placement="right"
                                  hasArrow
                                >
                                  <Box
                                    as="span"
                                    display="inline-flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    w={5}
                                    h={5}
                                    borderRadius="full"
                                    bg="blue.500"
                                    color="white"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    cursor="help"
                                  >
                                    ?
                                  </Box>
                                </Tooltip>
                              </HStack>
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
                                    e.target.value.toUpperCase()
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
                                templateColumns="repeat(2, 1fr)"
                                gap={3}
                                w={"full"}
                              >
                                <GridItem
                                  colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
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
                                        label: d.orgName,
                                        value: d.id,
                                      }))}
                                      isSearchable={true}
                                      isDisabled={true}
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
                                        label: d.orgName,
                                        value: d.id,
                                      }))}
                                    />

                                    <FormErrorMessage>
                                      {formik.errors.proOwnerDirectorateId}
                                    </FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                                <GridItem
                                  colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
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
                                      isDisabled={false}
                                      id={`proOwnerDivisionId`}
                                      options={OptionDivision}
                                      isSearchable={true}
                                      onMenuOpen={async () => {
                                        setOptionDivision([]);
                                        const whereParam: ListSearchByParam[] =
                                          [
                                            {
                                              field: "orgType",
                                              operator: "=",
                                              value: ORG_CATEGORY_KEY_DIVISION,
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
                                            label: d.orgName,
                                            value: d.id,
                                          }));
                                        setOptionDivision(mapOptionData);
                                      }}
                                      onChange={async (e: any) => {
                                        if (e) {
                                          const selected = {
                                            label: e.label,
                                            value: e.value,
                                          };
                                          handleSelectedCustom(
                                            selected,
                                            "proOwnerDivisionId"
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
                                              "proOwnerDirectorateId",
                                              divisionData[0].parentId
                                            );
                                          }

                                          formik.setFieldValue(
                                            "proOwnerGroupId",
                                            null
                                          );
                                        } else {
                                          handleUnSelectedCustom(
                                            "proOwnerDivisionId"
                                          );
                                          handleUnSelectedCustom(
                                            "proOwnerDirectorateId"
                                          );
                                          handleUnSelectedCustom(
                                            "proOwnerGroupId"
                                          );
                                        }
                                      }}
                                      placeholder={"Pilih Divisi"}
                                      isLoading={IsLoadingProcess}
                                      value={OptionDivision.find(
                                        (x) =>
                                          x.value ==
                                          formik.values.proOwnerDivisionId
                                      )}
                                    />
                                    <FormErrorMessage>
                                      {formik.errors.proOwnerDivisionId}
                                    </FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                                <GridItem
                                  colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }}
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
                                    <FormLabel h={"full"}>Grup</FormLabel>

                                    <Select
                                      id={`proOwnerGroupId`}
                                      options={OrganizationData.filter(
                                        (f) =>
                                          f.orgType == ORG_CATEGORY_KEY_GROUP &&
                                          f.parentId ==
                                          formik.values.proOwnerDivisionId
                                      ).map((d) => ({
                                        label: d.orgName,
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
                                        label: d.orgName,
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
                          mt={3}
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
                                value={OptionSubCharacteristicProject.find(
                                  (x) =>
                                    x.value ==
                                    formik.values.projectSubCharasteristicCode
                                )}
                              />

                              <Alert
                                status="info"
                                rounded={"md"}
                                // display={
                                //   formik.values.projectSubCharasteristicCode !=
                                //   null
                                //     ? "flex"
                                //     : "none"
                                // }
                                display={"none"}
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
                                placeholder={`Perihal`}
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
                                placeholder={`Perihal`}
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
                                                    label: d.orgName,
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
                                                    label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                                  label: d.orgName,
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
                                {(() => {
                                  console.log(
                                    "ChoosedMemberProjects:",
                                    ChoosedMemberProjects
                                  );
                                  console.log(
                                    "Sample member team:",
                                    ChoosedMemberProjects[0]?.team
                                  );
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

                                  return Object.entries(grouped).map(
                                    ([groupCode, { groupName, members }]) => (
                                      <Box key={groupCode} w={"full"} mb={4}>
                                        <Text
                                          pb={1}
                                          fontWeight={600}
                                          fontSize="lg"
                                          color="white"
                                        >
                                          {groupName} ({members.length})
                                        </Text>
                                        <Stack spacing={2}>
                                          {members.map((dt, index) => (
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
                                              key={`${groupCode}-${index}`}
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
                                                    {dt.team?.teamName ||
                                                      dt.jabatan}{" "}
                                                    |{" "}
                                                    {dt.teamRole?.specName ||
                                                      dt.namaUnitKerja}
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
                                                      handleRemoveUserAssign(
                                                        dt.id
                                                      )
                                                    }
                                                  >
                                                    <FiX />
                                                  </Button>
                                                </Tooltip>
                                              </>
                                            </Flex>
                                          ))}
                                        </Stack>
                                      </Box>
                                    )
                                  );
                                })()}
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
                                            {dt.team?.teamName || dt.jabatan} |{" "}
                                            {dt.teamRole?.specName ||
                                              dt.namaUnitKerja}
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
                                        >
                                          <FiPlusCircle />
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
                                              label: d.orgName,
                                              value: d.id,
                                            }))}
                                            isDisabled={true}
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
                                              label: d.orgName,
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
                                                ORG_CATEGORY_KEY_DIVISION
                                            ).map((d) => ({
                                              label: d.orgName,
                                              value: d.id,
                                            }))}
                                            isSearchable={true}
                                            onChange={async (e) => {
                                              if (e) {
                                                const selected = {
                                                  label: e.label,
                                                  value: e.value,
                                                };
                                                handleSelectedCustom(
                                                  selected,
                                                  "proManageByDivisionId"
                                                );

                                                // Auto-fill direktorat from division's parentId
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
                                                console.log(
                                                  "Division selected:",
                                                  e.value
                                                );
                                                console.log(
                                                  "Division data fetched:",
                                                  divisionData
                                                );
                                                if (
                                                  divisionData.length > 0 &&
                                                  divisionData[0].parentId
                                                ) {
                                                  console.log(
                                                    "Setting direktorat to:",
                                                    divisionData[0].parentId
                                                  );
                                                  formik.setFieldValue(
                                                    "proManageByDirectorateId",
                                                    divisionData[0].parentId
                                                  );
                                                }
                                              } else {
                                                handleUnSelectedCustom(
                                                  "proManageByDivisionId"
                                                );
                                                handleUnSelectedCustom(
                                                  "proManageByDirectorateId"
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
                                                  .proManageByDivisionId
                                            ).map((d) => ({
                                              label: d.orgName,
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
                                                  .proManageByDivisionId
                                            ).map((d) => ({
                                              label: d.orgName,
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
                                              label: d.orgName,
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
                      {/* FOR TYPE PROJECT REGISTER INTERNAL DEVELOPMENT */}
                      {projectTypeRegister ==
                        PROJECT_TYPE_INTERNAL_DEVELOPMENT && (
                          <>
                            {IsLoadingProcess ? (
                              <LoadingMiniSignature />
                            ) : (
                              <VStack spacing={6} align="stretch" w="full">
                                {/* Section 1: Already Assigned Backlogs */}
                                {assignedBacklogs.length > 0 && (
                                  <Card rounded={radiusStyle}>
                                    <CardHeader>
                                      <Heading size="md">
                                        Already Assigned to Other Projects
                                      </Heading>
                                      <Text fontSize="sm" color="gray.500">
                                        These backlogs are already assigned and
                                        cannot be selected
                                      </Text>
                                    </CardHeader>
                                    <CardBody>
                                      <Table size="sm" variant="simple">
                                        <Thead>
                                          <Tr>
                                            <Th>Backlog Name</Th>
                                            <Th>Priority</Th>
                                            <Th>Status</Th>
                                            <Th>Project ID</Th>
                                          </Tr>
                                        </Thead>
                                        <Tbody>
                                          {assignedBacklogs.map((backlog) => (
                                            <Tr key={backlog.id} opacity={0.6}>
                                              <Td>{backlog.backlogName}</Td>
                                              <Td>
                                                <Badge
                                                  colorScheme={priorityColor(
                                                    backlog.priority
                                                  )}
                                                >
                                                  {backlog.priority}
                                                </Badge>
                                              </Td>
                                              <Td>{backlog.developmentStatus}</Td>
                                              <Td>
                                                <Text
                                                  fontSize="xs"
                                                  color="gray.500"
                                                >
                                                  {backlog.projectId}
                                                </Text>
                                              </Td>
                                            </Tr>
                                          ))}
                                        </Tbody>
                                      </Table>
                                    </CardBody>
                                  </Card>
                                )}

                                {/* Section 2: Available Backlogs (Can Select) */}
                                <Card rounded={radiusStyle}>
                                  <CardHeader>
                                    <HStack justify="space-between">
                                      <Box>
                                        <Heading size="md">
                                          Available Backlogs
                                        </Heading>
                                        <Text fontSize="sm" color="gray.500">
                                          Select backlogs to include in this
                                          project
                                        </Text>
                                      </Box>
                                      <HStack spacing={3}>
                                        <Input
                                          type="text"
                                          placeholder="Search backlogs..."
                                          bg={
                                            colorMode === "light"
                                              ? "white"
                                              : "gray.800"
                                          }
                                          size="sm"
                                          onChange={(e) =>
                                            setAvailableBacklogsFilter(
                                              e.target.value
                                            )
                                          }
                                          value={availableBacklogsFilter}
                                          w="250px"
                                        />
                                        <Checkbox
                                          isChecked={
                                            availableBacklogs.length > 0 &&
                                            selectedBacklogIds.length ===
                                            availableBacklogs.length
                                          }
                                          isIndeterminate={
                                            selectedBacklogIds.length > 0 &&
                                            selectedBacklogIds.length <
                                            availableBacklogs.length
                                          }
                                          onChange={(e) =>
                                            toggleAllAvailableBacklogs(
                                              e.target.checked
                                            )
                                          }
                                        >
                                          Select All
                                        </Checkbox>
                                      </HStack>
                                    </HStack>
                                  </CardHeader>{" "}
                                  <CardBody>
                                    {availableBacklogs.length === 0 ? (
                                      <Text
                                        color="gray.500"
                                        textAlign="center"
                                        py={4}
                                      >
                                        {availableBacklogsFilter
                                          ? `No backlogs found matching "${availableBacklogsFilter}"`
                                          : "No available backlogs to select"}
                                      </Text>
                                    ) : (
                                      <Table size="sm" variant="simple">
                                        <Thead>
                                          <Tr>
                                            <Th w="50px">Select</Th>
                                            <Th>Backlog Name</Th>
                                            <Th>Priority</Th>
                                            <Th>Urgency</Th>
                                            <Th>Impact</Th>
                                            <Th>Status</Th>
                                          </Tr>
                                        </Thead>
                                        <Tbody>
                                          {availableBacklogs.map((backlog) => (
                                            <Tr key={backlog.id}>
                                              <Td>
                                                <Checkbox
                                                  isChecked={selectedBacklogIds.includes(
                                                    backlog.id
                                                  )}
                                                  onChange={() =>
                                                    toggleBacklogSelection(
                                                      backlog.id
                                                    )
                                                  }
                                                />
                                              </Td>
                                              <Td>{backlog.backlogName}</Td>
                                              <Td>
                                                <Badge
                                                  colorScheme={priorityColor(
                                                    backlog.priority
                                                  )}
                                                >
                                                  {backlog.priority}
                                                </Badge>
                                              </Td>
                                              <Td>{backlog.urgency}</Td>
                                              <Td>{backlog.impact}</Td>
                                              <Td>{backlog.developmentStatus}</Td>
                                            </Tr>
                                          ))}
                                        </Tbody>
                                      </Table>
                                    )}
                                  </CardBody>
                                </Card>

                                {/* Section 3: Selected Backlogs (Editable) */}
                                {selectedBacklogs.length > 0 && (
                                  <Card
                                    rounded={radiusStyle}
                                    borderColor="blue.500"
                                    borderWidth="2px"
                                  >
                                    <CardHeader>
                                      <Heading size="md">
                                        Selected Backlogs (
                                        {selectedBacklogs.length})
                                      </Heading>
                                      <Text fontSize="sm" color="gray.500">
                                        Edit details for selected backlogs that
                                        will be included in this project
                                      </Text>
                                    </CardHeader>
                                    <Divider />

                                    {/* Bulk Apply Section */}
                                    <CardBody>
                                      <VStack spacing={4} align="stretch" mb={6}>
                                        <Heading size="sm">Apply to All Backlogs</Heading>
                                        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                                          <FormControl>
                                            <FormLabel fontSize="sm">Deadline</FormLabel>
                                            <Input
                                              type="date"
                                              value={bulkDeadline}
                                              onChange={(e) => setBulkDeadline(e.target.value)}
                                              max={DataRequirement?.appLiveTargetDate ?? undefined}
                                              size="sm"
                                            />
                                          </FormControl>
                                          <FormControl>
                                            <FormLabel fontSize="sm">Urgency</FormLabel>
                                            <SelectC
                                              value={bulkUrgency}
                                              onChange={(e) => setBulkUrgency(e.target.value)}
                                              size="sm"
                                              placeholder="Select urgency"
                                            >
                                              <option value="LOW">Low</option>
                                              <option value="MEDIUM">Medium</option>
                                              <option value="HIGH">High</option>
                                            </SelectC>
                                          </FormControl>
                                          <FormControl>
                                            <FormLabel fontSize="sm">Impact</FormLabel>
                                            <SelectC
                                              value={bulkImpact}
                                              onChange={(e) => setBulkImpact(e.target.value)}
                                              size="sm"
                                              placeholder="Select impact"
                                            >
                                              <option value="LOW">Low</option>
                                              <option value="MEDIUM">Medium</option>
                                              <option value="HIGH">High</option>
                                            </SelectC>
                                          </FormControl>
                                        </Grid>
                                        <Button
                                          colorScheme="blue"
                                          size="sm"
                                          onClick={applyBulkToAllBacklogs}
                                          isDisabled={!bulkDeadline && !bulkUrgency && !bulkImpact}
                                        >
                                          Apply to All
                                        </Button>
                                      </VStack>
                                      <Divider mb={6} />

                                      <TableComponentWithFilterCTX
                                        table={selectedBacklogsTable}
                                        handleFilterChange={handleFilterChange}
                                      />
                                    </CardBody>
                                  </Card>
                                )}
                              </VStack>
                            )}
                          </>
                        )}

                      {/* FOR TYPE PROJECT REGISTER PROCUREMENT */}
                      {projectTypeRegister == PROJECT_TYPE_PROCUREMENT && (
                        <Flex as={Stack} w={"full"} spacing={5}>
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
                                    Choose Work Stages for Procurement
                                  </Heading>
                                  <Text
                                    fontSize="sm"
                                    color={
                                      colorMode == "light"
                                        ? "gray.500"
                                        : "gray.400"
                                    }
                                  >
                                    Select procurement workflow stages for this
                                    project
                                  </Text>
                                </Flex>

                                {IsLoadingWorkflowProcurements ? (
                                  <LoadingMiniSignature />
                                ) : (
                                  <>
                                    {renderWorkflowLevelProcurement(
                                      DataWorkflowGroupsProcurements
                                    )}

                                    {selectedWorkflowProcurementsIds.size > 0 && (
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
                                          Selected: {selectedWorkflowProcurementsIds.size} workflow(s)
                                        </Text>
                                      </Box>
                                    )}
                                  </>
                                )}
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
                                        <Text
                                          fontSize="lg"
                                          fontWeight="bold"
                                          color={"secondary.500"}
                                        >
                                          Procurement Stage Preset
                                        </Text>
                                        <Text
                                          fontSize="sm"
                                          color={
                                            colorMode == "light"
                                              ? "gray.500"
                                              : "gray.400"
                                          }
                                          lineHeight={1.2}
                                        >
                                          Select procurement workflow stages
                                          preset
                                        </Text>
                                      </VStack>
                                    </HStack>
                                    <Flex as={Stack} w={"full"}>
                                      {DataWorkflowPresetsProcurements.length >
                                        0 ? (
                                        <VStack align="start" spacing={1}>
                                          {DataWorkflowPresetsProcurements.map(
                                            (preset) => (
                                              <Flex
                                                key={preset.id}
                                                as={HStack}
                                                w={"full"}
                                                justifyContent={"space-between"}
                                                alignItems={"center"}
                                                bgColor={
                                                  selectedPresetProcurement?.id ===
                                                    preset.id
                                                    ? "secondary.100"
                                                    : "transparent"
                                                }
                                                rounded={radiusStyle}
                                                px={4}
                                                py={3}
                                              >
                                                <VStack
                                                  align={"start"}
                                                  spacing={1}
                                                  flex={1}
                                                >
                                                  <HStack spacing={2}>
                                                    <Icon
                                                      as={FaCircle}
                                                      color={"secondary.500"}
                                                      boxSize={2}
                                                    />
                                                    <Text
                                                      fontWeight={
                                                        selectedPresetProcurement?.id ===
                                                          preset.id
                                                          ? 600
                                                          : 500
                                                      }
                                                      color={
                                                        selectedPresetProcurement?.id ===
                                                          preset.id
                                                          ? "gray.900"
                                                          : colorMode == "light"
                                                            ? "gray.900"
                                                            : "white"
                                                      }
                                                    >
                                                      {preset.wfPresetName}
                                                    </Text>
                                                  </HStack>
                                                  {preset.wfPresetDesc && (
                                                    <Text
                                                      fontSize="xs"
                                                      color="gray.500"
                                                      pl={4}
                                                    >
                                                      {preset.wfPresetDesc}
                                                    </Text>
                                                  )}
                                                </VStack>
                                                <Button
                                                  variant={"solid"}
                                                  colorScheme={
                                                    selectedPresetProcurement?.id ===
                                                      preset.id
                                                      ? "red"
                                                      : "secondary"
                                                  }
                                                  size={"xs"}
                                                  onClick={() =>
                                                    handleSelectPresetProcurement(
                                                      preset.id
                                                    )
                                                  }
                                                >
                                                  {selectedPresetProcurement?.id ===
                                                    preset.id ? (
                                                    <FiMinus />
                                                  ) : (
                                                    <FiPlus />
                                                  )}
                                                </Button>
                                              </Flex>
                                            )
                                          )}
                                        </VStack>
                                      ) : (
                                        <Text fontSize="sm" color="gray.500">
                                          No procurement presets available
                                        </Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                </CardBody>
                              </Card>
                            </GridItem>
                          </Grid>
                        </Flex>
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

                                {renderWorkflowLevel(DataWorkflowGroups)}
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
                                              key={preset.id}
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
                                              <VStack
                                                align={"start"}
                                                spacing={1}
                                                flex={1}
                                              >
                                                <HStack spacing={2}>
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
                                                </HStack>
                                                {preset.wfPresetDesc && (
                                                  <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                    pl={4}
                                                  >
                                                    {preset.wfPresetDesc}
                                                  </Text>
                                                )}
                                              </VStack>
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
                display={"none"}
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
  maxDate?: string | null;
}

const UpdateBacklogDateInput = ({
  idInput,
  fieldName,
  dataSource,
  dataInput,
  updateBacklog,
  maxDate,
}: BacklogDateInputProps) => {
  const showToast = useToastHelper();
  const [dateValue, setDateValue] = useState<string>(dataInput ?? "");
  const [dataBacklog, setDataBacklog] =
    useState<BacklogDataResponse>(dataSource);

  useEffect(() => {
    setDateValue(dataInput ?? "");
    setDataBacklog(dataSource);
  }, [dataInput, dataSource]);

  const handleChange = (value: string) => {
    // Validate against requirement's target live date
    if (maxDate && value) {
      const selectedDate = new Date(value);
      const targetLiveDate = new Date(maxDate);

      if (selectedDate > targetLiveDate) {
        showToast({
          description: `Deadline cannot exceed Target Live date (${targetLiveDate.toLocaleDateString('id-ID')})`,
          statusToast: "error",
        });
        return;
      }
    }

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
      max={maxDate ?? undefined}
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
      ...dataSource,
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

              <FormControl>
                <FormLabel>RPPB</FormLabel>
                <RadioGroup
                  name="rppb"
                  value={formInputs.rppb}
                  onChange={(value) => {
                    setFormInputs({
                      ...formInputs,
                      rppb: value,
                    });
                  }}
                >
                  <HStack spacing={6}>
                    <Radio value="Y">Ya</Radio>
                    <Radio value="N">Tidak</Radio>
                  </HStack>
                </RadioGroup>
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
