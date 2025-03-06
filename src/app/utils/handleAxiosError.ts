import { AxiosError } from "axios";
import { ApiGenericResponse } from "../types/masterTypes";

interface ApiErrorResponse {
  message: string;
  status: string;
}

const handleAxiosError = (
  err: AxiosError<ApiErrorResponse>
): ApiGenericResponse<null> => {
  if (err.response) {
    // The request was made and the server responded with a status code outside the range 2xx
    // const dataResponseMessage: string = err.response.data?.message | "";
    return {
      statusCode: err.response.status.toString(),
      data: null,
      message: err.response.data.message,
      error: err.response.data,
    };
  } else if (err.request) {
    // The request was made but no response was received
    return {
      statusCode: "Error",
      data: null,
      message: "API has no response was received",
      error: null,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      statusCode: "Error",
      data: null,
      message: "Server error",
      error: null,
    };
  }
};

export default handleAxiosError;
