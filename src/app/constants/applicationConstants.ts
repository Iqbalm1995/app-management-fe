import {
  OptionData,
  OptionDataWithIndex,
  OptionListProps,
} from "../types/masterTypes";

// CONST DATA =------------------------------------------------------------------

// ORGANIZATION CATEGORIE GROUP

export const ORG_CATEGORY_KEY_DIRECTORATE: string = "DIRECTORATE";
export const ORG_CATEGORY_KEY_DIVISION: string = "DIVISION";
export const ORG_CATEGORY_KEY_GROUP: string = "GROUP";

export const DIRECTORATE_ID_IT_BJB: string =
  "BD4C8AE4-BF61-5C96-B5A7-60A921553";
export const DIVISION_ID_IT_BJB: string = "8922E4AD-8183-B61B-34D1-CF629361D";
export const SELECTED_OPTION_DIRECTORATE: OptionListProps = {
  label: `DIREKTORAT IT & TRANSACTION BANKING | ${ORG_CATEGORY_KEY_DIRECTORATE}`,
  value: DIRECTORATE_ID_IT_BJB,
};
export const SELECTED_OPTION_DIVISION: OptionListProps = {
  label: `DIVISI INFORMATION TECHNOLOGY | ${ORG_CATEGORY_KEY_DIVISION}`,
  value: DIVISION_ID_IT_BJB,
};

// CONST DATA =------------------------------------------------------------------

// STYLE
export const radiusStyle: string = "2xl";

// Width or sidebar
export const WIDTH_SIDEBAR: number = 64;

// BOARDS
export const boardToDoLabel: string = "toDo";
export const boardInProgressLabel: string = "inProgress";
export const boardInReview: string = "inReview";
export const boardDoneLabel: string = "done";

// TASK BOARD LABEL STATUS

export const TASK_BOARD_STATUS_CODE_TODO = "TODO";
export const TASK_BOARD_STATUS_NAME_TODO = "TO DO";

export const TASK_BOARD_STATUS_CODE_INPROGRESS = "INPROGRESS";
export const TASK_BOARD_STATUS_NAME_INPROGRESS = "IN PROGRESS";

export const TASK_BOARD_STATUS_CODE_REVIEW = "REVIEW";
export const TASK_BOARD_STATUS_NAME_REVIEW = "IN REVIEW";

export const TASK_BOARD_STATUS_CODE_DONE = "DONE";
export const TASK_BOARD_STATUS_NAME_DONE = "DONE";

// LOGIN STATUS
export const STATUS_LOGIN_ON: string = "logged_in";
export const STATUS_LOGIN_OFF: string = "logged_out";

// DELAY CONST
export const DELAY_ZERO: number = 0;
export const DELAY_LOW: number = 500;
export const DELAY_MEDIUM: number = 1000;
export const DELAY_HIGH: number = 2000;
export const DELAY_LONG: number = 3000;

export const DELAY_LOAD_DATA: number = 0;
export const DELAY_LOAD_TABLE: number = 1000;
export const DELAY_ACTION: number = 500;

// AUTO-SAVE DELAY
export const AUTO_SAVE_DELAY: number = 200; // 3 seconds for semi-automated save

export const MAX_SIZE_TABLE: number = 999999;

export const INACTIVITY_LIMIT_DEFAULT: number = 180000; // 3 minutes in milliseconds

// MENU LINK
export const LINK_MENU_ROOT: string = "/";
export const LINK_MENU_HOME: string = "/home";

// AES KEY
export const AES_KEY: string = "BJBPortalAESKeys";

// Base URL FE
// http://192.168.239.117:5000
// export const BASE_URL_MAIN: string = "http://192.168.239.117";
export const BASE_URL_MAIN: string = "http://localhost";
// export const BASE_PORT_MAIN: string = "8998";
export const BASE_PORT_MAIN: string = "8998";

// Base Url Endpoint API
// export const ENDPOINT_API_BASEURL: string = "http://192.168.239.117";
export const ENDPOINT_API_BASEURL: string = "https://localhost";
export const ENDPOINT_PORT_BASIC: string = "2332";

// Base Url Endpoint API
// export const ENDPOINT_API_BASEURL_OBJECT: string = "http://192.168.239.117";
export const ENDPOINT_API_BASEURL_OBJECT: string = "https://localhost";
export const ENDPOINT_PORT_BASIC_OBJECT: string = "2332";

// generic response error
export const RES_GENERIC_ERROR_MSG: string = "Internal server error";

export const RES_CODE_OK: number = 200;
export const RES_CODE_BAD_REQUEST: number = 400;
export const RES_CODE_NOT_FOUND: number = 404;
export const RES_CODE_SERVER_ERROR: number = 500;

export const GENERAL_STATUS_ACTIVE: string = "ACTIVE";
export const GENERAL_STATUS_INACTIVE: string = "INACTIVE";

export const OptionChangeLogsCategory: OptionListProps[] = [
  {
    label: "INFO",
    value: "INFO",
  },
  {
    label: "WARNING",
    value: "WARNING",
  },
  {
    label: "CRITICAL / ERROR",
    value: "CRITICAL",
  },
  {
    label: "FIXED",
    value: "FIXED",
  },
];

export interface PrioritiesProps {
  label: string;
  value: string;
  colorScheme: string;
  categories: string[];
}

export const LocalPrioritiesOptions: PrioritiesProps[] = [
  {
    label: "Not Yet",
    value: "NOT YET",
    colorScheme: "blackAlpha",
    categories: ["PRIORITY_STATUS", "IMPACT_STATUS", "URGENCY_STATUS"],
  },
  {
    label: "Low",
    value: "LOW",
    colorScheme: "blue",
    categories: ["PRIORITY_STATUS", "IMPACT_STATUS", "URGENCY_STATUS"],
  },
  {
    label: "Medium",
    value: "MEDIUM",
    colorScheme: "yellow",
    categories: ["PRIORITY_STATUS", "IMPACT_STATUS", "URGENCY_STATUS"],
  },
  {
    label: "High",
    value: "HIGH",
    colorScheme: "orange",
    categories: ["PRIORITY_STATUS", "IMPACT_STATUS", "URGENCY_STATUS"],
  },
  {
    label: "Critical",
    value: "CRITICAL",
    colorScheme: "red",
    categories: ["PRIORITY_STATUS"],
  },
];

// REQUIREMENT_TYPE
export const REQUIREMENT_TYPE_BRD: string = "BRD";
export const REQUIREMENT_TYPE_RFC: string = "RFC";

// BRD STATUS
export const REQUIREMENT_STATUS_NEW: string = "NEW";

// GROUP CONST NAME
export const GROUP_CONST_BRD_STATUS: string = "BRD_STATUS";

// NEXT STEP ACTION
export const NEXT_STEP_ACTION_DRAFT: string = "DRAFT";
export const NEXT_STEP_ACTION_SUBMIT: string = "SUBMIT";
export const NEXT_STEP_ACTION_REVIEW: string = "REVIEW";
export const NEXT_STEP_ACTION_REVISION: string = "REVISION";
export const NEXT_STEP_ACTION_APPROVED: string = "APPROVED";
export const NEXT_STEP_ACTION_ARCHIVED: string = "ARCHIVED";

// export const REQ_STATUS_DRAFT: string = "DRAFT";
export const REQ_STATUS_REVIEW: string = "NEEDS REVIEW";

// KEY MEDIA UPLOAD
export const MEDIA_KEY_REQUIREMENT: string = "REQUIREMENT";

// REQ STATUS
export const REQ_STATUS_ALL: string = "ALL";
export const REQ_STATUS_DRAFT: string = "DRAFT";
export const REQ_STATUS_NEED_REVIEW: string = "NEEDS REVIEW";
export const REQ_STATUS_IN_PROGRESS_REVIEW: string = "IN PROGRESS REVIEW";
export const REQ_STATUS_TEMPORARY_APPROVED: string = "TEMPORARY APPROVED";
export const REQ_STATUS_APPROVED: string = "APPROVED";
export const REQ_STATUS_ON_HOLD: string = "ON HOLD";
export const REQ_STATUS_CANCELED: string = "CANCELED";

export const REQ_STATUS_LIST: string[] = [
  "DRAFT",
  "NEEDS REVIEW",
  "IN PROGRESS REVIEW",
  "TEMPORARY APPROVED",
  "APPROVED",
  "ON HOLD",
  "CANCELED",
];

export const PROJECT_STATUS_LIST: string[] = [
  "NOT STARTED",
  "INITIATE",
  "ON DEVELOPMENT",
  "READY FOR TESTING",
  "WAITING APPROVAL",
  "UNIT TEST IN PROGRESS",
  "SIT IN PROGRESS",
  "UAT IN PROGRESS",
  "READY FOR DEPLOYMENT",
  "COMPLETED",
  "ON HOLD",
  "CANCELED",
];

export const PROJECT_STATUS_LIST_INDEX: OptionDataWithIndex[] = [
  "NOT STARTED",
  "INITIATE",
  "ON DEVELOPMENT",
  "READY FOR TESTING",
  "WAITING APPROVAL",
  "UNIT TEST IN PROGRESS",
  "SIT IN PROGRESS",
  "UAT IN PROGRESS",
  "READY FOR DEPLOYMENT",
  "COMPLETED",
  "ON HOLD",
  "CANCELED",
].map((status, idx) => ({
  value: status,
  label: status,
  index: idx,
}));

export const DELIVERABLES_STATUS_LIST: string[] = [
  "NOT STARTED", // NOT STARTED
  "IN PROGRESS",
  "UNDER REVIEW",
  "WAITING APPROVAL", // ????
  "APPROVED",
  "ON HOLD",
  "CANCELED",
];

export const REQ_STATUS_LIST_OPTION: OptionData[] = [
  {
    value: "DRAFT",
    label: "DRAFT",
  },
  {
    value: "NEEDS REVIEW",
    label: "NEEDS REVIEW",
  },
  {
    value: "IN PROGRESS REVIEW",
    label: "IN PROGRESS REVIEW",
  },
  {
    value: "TEMPORARY APPROVED",
    label: "TEMPORARY APPROVED",
  },
  {
    value: "APPROVED",
    label: "APPROVED",
  },
  {
    value: "ON HOLD",
    label: "ON HOLD",
  },
  {
    value: "CANCELED",
    label: "CANCELED",
  },
];

// appAccessMedi value
export const APP_ACCESS_MEDIA_INTERNET: string = "INTERNET";
export const APP_ACCESS_MEDIA_INTRANET: string = "INTRANET";

export const APP_TYPE_OPTIONS = [
  "CLIENT BASED",
  "API",
  "WEB BASED",
  "WEB VIEW",
  "MOBILE ANDROID",
  "MOBILE iOS",
  "OTHER",
];

export const APP_RELATED_OPTIONS = ["NON-REGULATOR", "REGULATOR"];

export const APP_TRANSACTIONAL_OPTIONS = ["TRANSACTIONAL", "NON-REGULATOR"];

export const APP_OPERATIONAL_OPTIONS = ["24-HOUR", "NO"];

export const MAINTENANCE_TYPE_OPTIONS = ["BUG FIXING", "TOOLS", "FEATURE"];

export const MAINTENANCE_CATEGORY_OPTIONS = [
  "ECHANCEMENT",
  "CORRECTIVE",
  "IMPROVEMENT",
  "ADDITION",
];

export const PROJEC_CATEGORY_OPTIONS = [
  "TRANSACTIONAL",
  "REPORT",
  "JASA",
  "OPERASIONAL",
  "MONITORING",
  "LAINNYA",
];

export const PROJEC_TYPE_OPTIONS = [
  "INTERNAL DEVELOPMENT",
  "EXTERNAL DEVELOPMENT",
  "JOIN DEVELOPMENT",
  "PENGADAAN",
  "LAINNYA",
];

export const ENV_SIDE_OPTIONS = ["ALL SIDE", "BACKEND", "FRONTEND"];

export const shortDay = ["S", "M", "T", "W", "T", "F", "S"];
export const fullDay = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const allDaysString = fullDay.join(", ");

export const APP_ENV_LOCATION_OPTIONS = [
  "ON-PREMISE DC1",
  "ON-PREMISE DC2",
  "AWS CLOUD",
  "GOOGLE CLOUD",
  "OTHER",
];

export const APP_INTEGRATED_OTHER_APPS = [
  "CORE BANKING",
  "SWITCHING",
  "MIDDLEWARE",
  "DATA WAREHOUSE",
];
// Workflow Constants
export const WorkflowProjectDevelopmentId =
  "656435e1-a98e-4353-856c-5c5ffdf6d9bb";
export const WorkflowProjectProcurementId =
  "d77d335f-f4fd-4c60-9105-0f62ceec9a15";

export const WorkStageProcurementId = "2e7b59e6-b64f-4a95-9c27-36d5e91d6xxx";

// WORK PROGRAM
export const WORK_PROGRAM_INTERNAL = "INTERNAL";
export const WORK_PROGRAM_EXTERNAL = "EXTERNAL";

// PROJECT TYPE
export const PROJECT_TYPE_INTERNAL_DEVELOPMENT = "INTERNAL DEVELOPMENT";
export const PROJECT_TYPE_PROCUREMENT = "PROCUREMENT";
export const PROJECT_TYPE_DEPLOYMENT = "DEPLOYMENT";

// KEY OPTIONS
export const KEY_OPTION_PROJECT_CHARACTERISTICS = "PROJECT_CHARACTERISTICS";
export const KEY_OPTION_PROJECT_ACQUISITIONS = "PROJECT_ACQUISITION";
