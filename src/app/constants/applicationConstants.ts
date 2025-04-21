import { OptionListProps } from "../types/masterTypes";

// STYLE
export const radiusStyle: string = "2xl";

// Width or sidebar
export const WIDTH_SIDEBAR: number = 64;

// BOARDS
export const boardToDoLabel: string = "toDo";
export const boardInProgressLabel: string = "inProgress";
export const boardDoneLabel: string = "done";

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
