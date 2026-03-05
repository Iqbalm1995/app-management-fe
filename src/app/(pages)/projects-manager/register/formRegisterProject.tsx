"use client";


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
  ENV_SIDE_OPTIONS,
  MAINTENANCE_CATEGORY_OPTIONS,
  MAINTENANCE_TYPE_OPTIONS,
  MAX_SIZE_TABLE,
  PROJEC_CATEGORY_OPTIONS,
  PROJEC_TYPE_OPTIONS,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
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
} from "@/app/services/useRequirements";
import useUsers, {
  UserOrganizationResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import {
  ColumnMetaCustom,
  ListSearchByParam,
  ListSearchByParamProps,
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
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiInfo,
  FiMinus,
  FiMinusCircle,
  FiPlus,
  FiPlusCircle,
  FiSave,
  FiSettings,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import * as yup from "yup";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaCircle } from "react-icons/fa";
import { TabButtonCustom } from "@/app/components/TabsCustom";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Registrasi Project",
  breadCrumb: ["Home", "Project Manager", "Registrasi Project"],
};

const projectsAssignBindModelSchema = yup.object({
  userId: yup.string().required("User ID is required"),
});

const PRJ_TYPE_REGISTER: string = PROJECT_TYPE_INTERNAL_DEVELOPMENT;

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
  proOwnerDivisionId: "", // Optional
  proOwnerGroupId: "", // Optional
  proManageByDivisionId: "", // Optional
  proManageByGroupId: "", // Optional
  proManageByTeamId: "", // Optional
  reqParentId: "", // Optional
  userAssigns: [], // Required (at least an empty array)
  projectPlanWorkflowIds: [],
  workPrograms: [],
  projectPlanWorkflowBacklogsIds: [],
  workProgramsBacklogs: [],
};

function FormRegisterProjectView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const reqTypeParam = searchParams.get("reqType");
  const reqType = reqTypeParam?.toLowerCase() || "brd";

  const {
    GetDetailById: GetReqDetail,
    ListBacklog,
    UpdateBacklogBatch,
  } = useRequirements();

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
      redirect(`/projects-manager/${reqType === "rfc" ? `?reqType=${reqType}` : ""}`);
      return;
    }
  };

  // End - Services

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
      {
        field: "kodeUnitKerja",
        operator: "=",
        value: SelectedDivision?.value || "",
      },
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

  // Division Select Option

  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);
  const [SelectedDivision, setSelectedDivision] =
    useState<OptionListProps | null>({
      label: "DIVISI INFORMATION TECHNOLOGY",
      value: "D440",
    });

  const handleSelectedDivision = (data: OptionListProps) => {
    setSelectedDivision(data);
  };
  const handleUnSelectedDivision = () => {
    setSelectedDivision(null);
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
      // console.log(requestData);
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
        label: `${d.orgName}`,
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

  // End Division Select Option

  // Group Select Option

  const [IsLoadingGroupDivisionSelect, setIsLoadingGroupDivisionSelect] =
    useState(false);
  const [OptionGroupDivision, setOptionGroupDivision] = useState<
    OptionListProps[]
  >([]);
  const [SelectedGroupDivision, setSelectedGroupDivision] =
    useState<OptionListProps | null>(null);
  const handleSelectedGroupDivision = (data: OptionListProps) => {
    setSelectedGroupDivision(data);
  };
  const handleUnSelectedGroupDivision = () => {
    setSelectedGroupDivision(null);
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

  // End Group Select Option

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
          redirect(`/projects-manager/${reqType === "rfc" ? `?reqType=${reqType}` : ""}`);
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

          // PRJ_TYPE_REGISTER;
          formik.setFieldValue(`projectType`, PRJ_TYPE_REGISTER);

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
                formik.setFieldValue(
                  `proManageByTeamId`,
                  ProjectManageOrg.team.id
                );
              }
            }
          }

          // get user org project manage
          if (itemsData.userPicDivisionId) {
            formik.setFieldValue(
              `proOwnerDivisionId`,
              itemsData.userPicDivisionId
            );
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

          reviewers
            .filter(Boolean)
            .forEach((user) => userAssignPoject.push(user!));


          // Set state only after all async ops done
          if (userAssignPoject.length > 0) {
            setChoosedMemberProjects(userAssignPoject);
          }

          // End Set UserDefault Assign Project Member

          setIsLoadingProcess(false);
        }
      };
      GetDataList();

      // set value payload on load

      formik.setFieldValue("reqParentId", ReqId);

      LoadDataDivision();
    }
  }, [DataAuth, RefreshData, ReqId]);

  // GetServiceListBacklog
  // Countdown timer for submit confirmation
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
    if (tokenData) {
      LoadWorkflowGroups();
      LoadWorkflowPresets();
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
          // console.log(requestData);
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
          <FiUsers />
          <Text>2. Team Information</Text>
        </HStack>
      ),
    },
    {
      title: "Step 3",
      description: (
        <HStack>
          <FiSettings />
          <Text>3. Feature Information</Text>
        </HStack>
      ),
    },
    {
      title: "Step 4",
      description: (
        <HStack>
          <FiBriefcase />
          <Text>4. Work Stages</Text>
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
  // End Step Form

  // confirmation save data
  const [openConfirmSaveDialog, setOpenConfirmSaveDialog] = useState(false);
  const [submitCountdown, setSubmitCountdown] = useState(5);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");

  // Countdown timer for submit confirmation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (openConfirmSaveDialog) {
      setSubmitCountdown(5);
      timer = setInterval(() => {
        setSubmitCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [openConfirmSaveDialog]);

  const handleConfirmSaveData = (data: ProjectInsertPayload) => {
    setCaptionDialog("Submit Project Data");
    setQuestionMsgDialog(
      `Are you sure you want to submit project data "${formik.values.projectName}"?`
    );
    setOpenConfirmSaveDialog(true);
  };

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);

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

    if (!formik.values.projectCategory) {
      showToast({
        description: "Karakteristik Project masih kosong",
        statusToast: "warning",
      });
      errorSum++;
    }

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
        description: "Member project tidak boleh kosong",
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

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Submit Data Confirmation Modal */}
      <Modal
        isOpen={openConfirmSaveDialog}
        onClose={() => setOpenConfirmSaveDialog(false)}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
        <ModalContent rounded={radiusStyle}>
          <ModalHeader bg="orange.500" color="white" roundedTop={radiusStyle}>
            <HStack>
              <Icon as={FiAlertTriangle} boxSize={5} />
              <Text>Submit Project Data</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2} align="flex-start">
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} mt={0.5} />
                <Box>
                  <Text fontWeight="bold" color="orange.500">WARNING: Submit Data Action</Text>
                  <Text mt={2}>{questionMsgDialog}</Text>
                </Box>
              </HStack>

              <Card bg={colorMode === "light" ? "orange.50" : "orange.900"} borderColor="orange.200" borderWidth="1px">
                <CardBody>
                  <HStack spacing={2} align="flex-start">
                    <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} mt={0.5} />
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">IMPORTANT:</Text>
                      <Text fontSize="sm" mt={1}>
                        Once submitted, this project data will be saved and processed. This action cannot be undone.
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>

              <HStack spacing={2} align="flex-start">
                <Icon as={FiCheckCircle} color="green.500" boxSize={4} mt={0.5} />
                <Text fontSize="sm">
                  This action will save your project data and initiate the workflow process.
                </Text>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button leftIcon={<FiX />} onClick={() => setOpenConfirmSaveDialog(false)}>
                Cancel
              </Button>
              <Button
                leftIcon={<FiCheck />}
                colorScheme="orange"
                onClick={async () => {
                  setOpenConfirmSaveDialog(false);
                  await handleSaveData();
                }}
                isDisabled={submitCountdown > 0}
              >
                {submitCountdown > 0 ? `Wait ${submitCountdown}s` : `Submit Data`}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}> */}
      {/* Requirement Validation */}
      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : !DataRequirement ? (
        <InvalidLoadPageView />
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
              <Link href={`/projects-manager/${reqType === "rfc" ? `?reqType=${reqType}` : ""}`}>
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

          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }} w={"full"}>
            {/* Requirement Information */}
            {DataRequirement && (
              <Card
                shadow="sm"
                // bgColor={colorMode == "light" ? "white" : "gray.800"}
                bgGradient={"linear(to-br, secondary.800, secondary.500)"}
                rounded={radiusStyle}
              >
                <CardBody>
                  <Flex as={Stack} spacing={2}>
                    <Text fontSize="md" fontWeight="bold" color={"white"}>
                      REQUIREMENT REFFERENCE (MEMO) :
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
                          {DataRequirement.requirementType.toUpperCase()}
                        </Text>
                      </Box>
                      <VStack align="start" spacing={0} flex={1}>
                        <HStack spacing={3}>
                          <Link
                            href={`/requirements/detail?reqId=${DataRequirement.id}&type=BRD`}
                          >
                            <Box>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={"white"}
                              >
                                {DataRequirement.reqNarative.toUpperCase()}{" "}
                                <FiExternalLink />
                              </Text>
                            </Box>
                          </Link>
                          <Badge
                            colorScheme="blue"
                            fontSize="xs"
                            px={4}
                            rounded={radiusStyle}
                          >
                            {DataRequirement.reqNumber}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="secondary.200">
                          {DataRequirement.reqNarative ||
                            "No description available"}
                        </Text>
                        <HStack spacing={4}>
                          <Text fontSize="xs" color="gray.300">
                            Requirement ID: {DataRequirement.id}
                          </Text>
                          <Text fontSize="xs" color="gray.300">
                            Status: {DataRequirement.reqStatus}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>
            )}
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

                  {activeStep === 0 && (
                    <Flex as={Stack} w={"full"} spacing={5} p={4}>
                      <FormControl id="initialAppReqCode">
                        <InputLayout>
                          <FormLabel h={"full"} mt={2}>
                            Inisial Aplikasi
                          </FormLabel>
                          <Stack spacing={0} h={"full"}>
                            <Input
                              id="initialAppReqCode"
                              name="initialAppReqCode"
                              type="text"
                              value={DataRequirement?.appInitialCode || ""}
                              placeholder={`Initial Aplikasi`}
                              minLength={3}
                              maxLength={150}
                              // isDisabled={true}
                              isReadOnly
                              variant={"filled"}
                            />
                          </Stack>
                        </InputLayout>
                      </FormControl>
                      <FormControl id="initialAppReqName">
                        <InputLayoutFull>
                          <FormLabel h={"full"} mt={2}>
                            Nama Product
                          </FormLabel>
                          <Stack spacing={0} h={"full"}>
                            <Input
                              id="initialAppReqName"
                              name="initialAppReqName"
                              type="text"
                              value={DataRequirement?.appInitialName || ""}
                              placeholder={`Nama Product`}
                              minLength={3}
                              maxLength={200}
                              // isDisabled={true}
                              isReadOnly
                              variant={"filled"}
                            />
                          </Stack>
                        </InputLayoutFull>
                      </FormControl>

                      {/* --------------------------- */}

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

                      <FormControl
                        id="projectNo"
                        isInvalid={formik.errors.projectNo ? true : false}
                        isRequired
                      >
                        <InputLayout>
                          <FormLabel h={"full"} mt={2}>
                            Nomor Project
                          </FormLabel>
                          <Stack spacing={0} h={"full"}>
                            {/* <RegProjectNumberInput */}
                            <Input
                              id="projectNo"
                              name="projectNo"
                              type="text"
                              onChange={formik.handleChange}
                              value={formik.values.projectNo === "-" ? "" : (formik.values.projectNo ?? "")}
                              placeholder="Nomor Project akan terisi otomatis"
                              minLength={25}
                              maxLength={27}
                              isDisabled={ActionLoading}
                            />
                            <FormErrorMessage>
                              {formik.errors.projectNo}
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
                              placeholder={`Deskripsi`}
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
                        id="projectCategory"
                        isInvalid={formik.errors.projectCategory ? true : false}
                        isRequired
                      >
                        <InputLayout>
                          <FormLabel>Karakteristik Project</FormLabel>
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
                            >
                              {PROJEC_CATEGORY_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </SelectC>
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

                      {/* <FormControl
                      id="projectClosedDate"
                      isInvalid={formik.errors.projectClosedDate ? true : false}
                      isRequired
                    >
                      <InputLayout>
                        <FormLabel h={"full"} mt={2}>
                          Tanggal Closed Project
                        </FormLabel>
                        <Stack spacing={0} h={"full"}>
                          <Input
                            id="projectClosedDate"
                            name="projectClosedDate"
                            type="date"
                            onChange={formik.handleChange}
                            value={formik.values.projectClosedDate}
                            // isDisabled={ActionLoading}
                          />
                          <FormErrorMessage>
                            {formik.errors.projectClosedDate}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayout>
                    </FormControl> */}

                      {/* <FormControl
                      id="projDateDuration"
                      isInvalid={
                        calculateDurationInDays(
                          formik.values.projectRegisterDate ||
                            new Date().toISOString(),
                          formik.values.projectClosedDate ||
                            new Date().toISOString()
                        ) < 0
                      }
                    >
                      <InputLayoutFull>
                        <FormLabel h={"full"} mt={2}>
                          Durasi Project
                        </FormLabel>
                        <Stack spacing={0} h={"full"}>
                          <Text px={2} fontWeight={600}>
                            {calculateDurationInDays(
                              formik.values.projectRegisterDate ||
                                new Date().toISOString(),
                              formik.values.projectClosedDate ||
                                new Date().toISOString()
                            )}{" "}
                            Hari Kalendar
                          </Text>
                          <FormErrorMessage>
                            {calculateDurationInDays(
                              formik.values.projectRegisterDate ||
                                new Date().toISOString(),
                              formik.values.projectClosedDate ||
                                new Date().toISOString()
                            ) < 0 && "Durasi tidak boleh negatif"}
                          </FormErrorMessage>
                        </Stack>
                      </InputLayoutFull>
                    </FormControl> */}

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
                    </Flex>
                  )}

                  {activeStep === 1 && (
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
                          p={4}
                        >
                          <Flex as={Stack} w={"full"} spacing={5} py={4}>
                            <FormControl id={"filterDivisionId"}>
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
                                        onClick={() => handleAddUserAssign(dt)}
                                        leftIcon={<FiPlusCircle />}
                                      >
                                        Tambah
                                      </Button>
                                    </>
                                  </Flex>
                                );
                              })}
                            </Flex>
                          </Flex>
                        </GridItem>
                      </Grid>
                    </Flex>
                  )}

                  {activeStep === 2 && (
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

                  {activeStep === 3 && (
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
                                            <Flex key={preset.id}
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

              <FormControl >
                <FormLabel >RPPB</FormLabel>
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

export default FormRegisterProjectView;
