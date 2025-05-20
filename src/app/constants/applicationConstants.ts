import { OptionListProps } from "../types/masterTypes";

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
export const TASK_BOARD_STATUS_NAME_TODO = "To Do";

export const TASK_BOARD_STATUS_CODE_INPROGRESS = "INPROGRESS";
export const TASK_BOARD_STATUS_NAME_INPROGRESS = "In Progress";

export const TASK_BOARD_STATUS_CODE_REVIEW = "REVIEW";
export const TASK_BOARD_STATUS_NAME_REVIEW = "Review";

export const TASK_BOARD_STATUS_CODE_DONE = "DONE";
export const TASK_BOARD_STATUS_NAME_DONE = "Done";

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

export const MAX_SIZE_TABLE: number = 999999;

export const INACTIVITY_LIMIT_DEFAULT: number = 180000; // 3 minutes in milliseconds

// MENU LINK
export const LINK_MENU_ROOT: string = "/";
export const LINK_MENU_HOME: string = "/home";

// AES KEY
export const AES_KEY: string = "BJBPortalAESKeys";

// Base URL FE
// http://192.168.239.117:5000
export const BASE_URL_MAIN: string = "http://192.168.239.117";
export const BASE_PORT_MAIN: string = "8998";

// Base Url Endpoint API
export const ENDPOINT_API_BASEURL: string = "http://192.168.239.117";
export const ENDPOINT_PORT_BASIC: string = "2332";

// Base Url Endpoint API
export const ENDPOINT_API_BASEURL_OBJECT: string = "http://192.168.239.117";
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
