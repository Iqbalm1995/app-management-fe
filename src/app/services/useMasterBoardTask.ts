import axios from "axios";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
} from "../constants/applicationConstants";
import { buildUrlPort } from "../helper/MasterHelper";
import { PaggingListPayload } from "../types/masterTypes";

// Response Interface
export interface MasterBoardTaskResponse {
  id: string;
  boradCodeStage: string;
  boardName: string;
  indexStage: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDisplay: string;
  boardPoint: number;
  isCompleteFlag: string;
}

const useMasterBoardTask = () => {
  const List = async (payload: PaggingListPayload, token: string) => {
    try {
      const response = await axios.post(
        buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
          "/v1/MasterBoardTask/list",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      } else if (error.request) {
        return {
          statusCode: 500,
          message: "Network error occurred",
        };
      } else {
        return {
          statusCode: 500,
          message: "An unexpected error occurred",
        };
      }
    }
  };

  return {
    List,
  };
};

export default useMasterBoardTask;
